import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { NotificationType, NotificationPriority, ChannelType } from '@prisma/client'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Validation schemas
const notificationConditionsSchema = z.object({
  costThreshold: z.number().min(0).optional(),
  usageThreshold: z.number().min(0).optional(),
  providerFilters: z.array(z.string()).optional(),
  modelFilters: z.array(z.string()).optional(),
  userFilters: z.array(z.string()).optional(),
  timeRange: z.object({
    start: z.string(),
    end: z.string()
  }).optional(),
  customConditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['gt', 'gte', 'lt', 'lte', 'eq', 'neq', 'contains']),
    value: z.any()
  })).optional()
})

const channelConfigSchema = z.object({
  type: z.nativeEnum(ChannelType),
  destination: z.string().min(1),
  config: z.record(z.any()).optional(),
  enabled: z.boolean().default(true),
  includeDetails: z.boolean().default(true),
  format: z.enum(['html', 'text', 'markdown']).default('html')
})

const createRuleSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  type: z.nativeEnum(NotificationType),
  enabled: z.boolean().default(true),
  conditions: notificationConditionsSchema,
  threshold: z.number().min(0).optional(),
  comparisonOp: z.enum(['gt', 'gte', 'lt', 'lte', 'eq']).optional(),
  timeWindow: z.number().min(1).optional(),
  schedule: z.string().optional(), // Cron expression
  timezone: z.string().default('UTC'),
  cooldownMinutes: z.number().min(0).default(60),
  maxPerDay: z.number().min(1).default(100),
  priority: z.nativeEnum(NotificationPriority).default('MEDIUM'),
  tags: z.array(z.string()).default([]),
  channels: z.array(channelConfigSchema).min(1)
})

const querySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
  type: z.nativeEnum(NotificationType).optional(),
  enabled: z.string().transform(val => val === 'true').optional(),
  search: z.string().optional(),
  tags: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'type', 'priority']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
})

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_COUNT = 30 // requests per window

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(userId)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (userLimit.count >= RATE_LIMIT_COUNT) {
    return false
  }

  userLimit.count++
  return true
}

// Helper function to validate cron expression
function isValidCron(expression: string): boolean {
  const cronParts = expression.trim().split(/\s+/)
  
  // Basic validation - should have 5 or 6 parts (seconds optional)
  if (cronParts.length < 5 || cronParts.length > 6) {
    return false
  }

  // More detailed validation would go here
  // For now, just check it's not empty and has valid characters
  const validCronRegex = /^[0-9\-\*\/\,\#\?\w\s]+$/
  return validCronRegex.test(expression)
}

/**
 * GET /api/notifications/rules - List notification rules
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    // Parse and validate query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    
    const validatedQuery = querySchema.parse(queryParams)
    const {
      page,
      limit,
      type,
      enabled,
      search,
      tags,
      sortBy,
      sortOrder
    } = validatedQuery

    // Validate pagination limits
    if (limit > 50) {
      return NextResponse.json(
        { success: false, error: 'Limit cannot exceed 50' },
        { status: 400 }
      )
    }

    // Build where conditions
    const where: any = {
      userId: session.user.id,
      organizationId: session.user.organizationId
    }

    if (type) where.type = type
    if (enabled !== undefined) where.enabled = enabled
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim())
      where.tags = {
        hasSome: tagArray
      }
    }

    // Get total count
    const total = await prisma.notificationRule.count({ where })

    // Get rules
    const rules = await prisma.notificationRule.findMany({
      where,
      include: {
        channels: true,
        _count: {
          select: {
            notifications: true
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit
    })

    const hasMore = page * limit < total
    const totalPages = Math.ceil(total / limit)

    // Transform rules to include computed fields
    const transformedRules = rules.map(rule => ({
      ...rule,
      notificationCount: rule._count.notifications,
      isScheduled: !!rule.schedule,
      nextTriggerAt: rule.schedule ? null : undefined, // Would compute next cron execution
      channelCount: rule.channels.length
    }))

    return NextResponse.json({
      success: true,
      data: transformedRules,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore
      }
    })

  } catch (error) {
    console.error('GET /api/notifications/rules error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications/rules - Create new notification rule
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    const body = await request.json()
    const validatedData = createRuleSchema.parse(body)

    // Validate cron expression if provided
    if (validatedData.schedule && !isValidCron(validatedData.schedule)) {
      return NextResponse.json(
        { success: false, error: 'Invalid cron expression' },
        { status: 400 }
      )
    }

    // Check if rule name is unique for the user
    const existingRule = await prisma.notificationRule.findFirst({
      where: {
        name: validatedData.name,
        userId: session.user.id,
        organizationId: session.user.organizationId
      }
    })

    if (existingRule) {
      return NextResponse.json(
        { success: false, error: 'Rule name already exists' },
        { status: 400 }
      )
    }

    // Create rule with channels in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the rule
      const rule = await tx.notificationRule.create({
        data: {
          userId: session.user.id,
          organizationId: session.user.organizationId!,
          name: validatedData.name,
          description: validatedData.description,
          type: validatedData.type,
          enabled: validatedData.enabled,
          conditions: validatedData.conditions,
          threshold: validatedData.threshold,
          comparisonOp: validatedData.comparisonOp,
          timeWindow: validatedData.timeWindow,
          schedule: validatedData.schedule,
          timezone: validatedData.timezone,
          cooldownMinutes: validatedData.cooldownMinutes,
          maxPerDay: validatedData.maxPerDay,
          priority: validatedData.priority,
          tags: validatedData.tags,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Create channels
      const channels = await Promise.all(
        validatedData.channels.map(channel =>
          tx.notificationChannel.create({
            data: {
              ruleId: rule.id,
              type: channel.type,
              destination: channel.destination,
              config: channel.config || {},
              enabled: channel.enabled,
              includeDetails: channel.includeDetails,
              format: channel.format
            }
          })
        )
      )

      return { rule, channels }
    })

    // Test rule evaluation if test conditions are provided in the request
    const testEvaluation = await testRuleEvaluation(result.rule, session.user.id, session.user.organizationId!)

    // TODO: Add audit logging when AuditLog model is available
    // Log rule creation for future audit implementation

    return NextResponse.json({
      success: true,
      data: {
        ...result.rule,
        channels: result.channels,
        testEvaluation
      }
    }, { status: 201 })

  } catch (error) {
    console.error('POST /api/notifications/rules error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to test rule evaluation
 */
async function testRuleEvaluation(rule: any, userId: string, organizationId: string) {
  try {
    // Get sample data for evaluation
    const recentUsage = await prisma.usageLog.findMany({
      where: {
        userId,
        organizationId,
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 10
    })

    const currentCost = await prisma.usageLog.aggregate({
      where: {
        userId,
        organizationId,
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      _sum: { cost: true }
    })

    // Build evaluation context
    const evaluationContext = {
      userId,
      organizationId,
      currentCost: currentCost._sum.cost || 0,
      previousCost: 0,
      costIncrease: currentCost._sum.cost || 0,
      usageData: recentUsage.map(log => ({
        provider: log.provider,
        model: log.model,
        tokens: log.totalTokens,
        requests: 1
      })),
      timeframe: {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: new Date()
      },
      alerts: [],
      metadata: {
        testEvaluation: true
      }
    }

    // Simple condition evaluation for testing
    let wouldTrigger = true

    // Test cost threshold
    if (rule.conditions.costThreshold !== undefined) {
      wouldTrigger = wouldTrigger && (evaluationContext.currentCost >= rule.conditions.costThreshold)
    }

    // Test usage threshold
    if (rule.conditions.usageThreshold !== undefined) {
      const totalTokens = evaluationContext.usageData.reduce((sum, usage) => sum + usage.tokens, 0)
      wouldTrigger = wouldTrigger && (totalTokens >= rule.conditions.usageThreshold)
    }

    return {
      wouldTrigger,
      evaluationContext: {
        currentCost: evaluationContext.currentCost,
        totalTokens: evaluationContext.usageData.reduce((sum, usage) => sum + usage.tokens, 0),
        usageDataCount: evaluationContext.usageData.length
      }
    }

  } catch (error) {
    console.error('Error during test evaluation:', error)
    return {
      wouldTrigger: null,
      error: 'Failed to evaluate rule conditions'
    }
  }
}