import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { NotificationType, NotificationPriority, ChannelType } from '@prisma/client'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
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

const updateRuleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  enabled: z.boolean().optional(),
  conditions: notificationConditionsSchema.optional(),
  threshold: z.number().min(0).optional(),
  comparisonOp: z.enum(['gt', 'gte', 'lt', 'lte', 'eq']).optional(),
  timeWindow: z.number().min(1).optional(),
  schedule: z.string().optional(),
  timezone: z.string().optional(),
  cooldownMinutes: z.number().min(0).optional(),
  maxPerDay: z.number().min(1).optional(),
  priority: z.nativeEnum(NotificationPriority).optional(),
  tags: z.array(z.string()).optional(),
  channels: z.array(channelConfigSchema).optional()
})

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000
const RATE_LIMIT_COUNT = 20

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

function isValidCron(expression: string): boolean {
  const cronParts = expression.trim().split(/\s+/)
  if (cronParts.length < 5 || cronParts.length > 6) {
    return false
  }
  const validCronRegex = /^[0-9\-\*\/\,\#\?\w\s]+$/
  return validCronRegex.test(expression)
}

/**
 * GET /api/notifications/rules/[id] - Get specific rule
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    const { id } = params

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid rule ID' },
        { status: 400 }
      )
    }

    const rule = await prisma.notificationRule.findFirst({
      where: {
        id,
        userId: session.user.id,
        organizationId: session.user.organizationId
      },
      include: {
        channels: true,
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            type: true,
            priority: true,
            title: true,
            status: true,
            createdAt: true,
            deliveredAt: true
          }
        },
        _count: {
          select: {
            notifications: true
          }
        }
      }
    })

    if (!rule) {
      return NextResponse.json(
        { success: false, error: 'Rule not found' },
        { status: 404 }
      )
    }

    // Add computed fields
    const ruleWithMetadata = {
      ...rule,
      notificationCount: rule._count.notifications,
      recentNotifications: rule.notifications,
      isScheduled: !!rule.schedule,
      nextTriggerAt: rule.schedule ? null : undefined, // Would compute next cron execution
      channelCount: rule.channels.length,
      stats: {
        totalNotifications: rule._count.notifications,
        lastTriggeredAt: rule.lastTriggeredAt,
        triggerCount: rule.triggerCount || 0
      }
    }

    return NextResponse.json({
      success: true,
      data: ruleWithMetadata
    })

  } catch (error) {
    console.error('GET /api/notifications/rules/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications/rules/[id] - Update rule
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    const { id } = params

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid rule ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateRuleSchema.parse(body)

    // Validate cron expression if provided
    if (validatedData.schedule && !isValidCron(validatedData.schedule)) {
      return NextResponse.json(
        { success: false, error: 'Invalid cron expression' },
        { status: 400 }
      )
    }

    // Check if rule exists and belongs to user
    const existingRule = await prisma.notificationRule.findFirst({
      where: {
        id,
        userId: session.user.id,
        organizationId: session.user.organizationId
      },
      include: {
        channels: true
      }
    })

    if (!existingRule) {
      return NextResponse.json(
        { success: false, error: 'Rule not found' },
        { status: 404 }
      )
    }

    // Check if name is unique (if being updated)
    if (validatedData.name && validatedData.name !== existingRule.name) {
      const nameExists = await prisma.notificationRule.findFirst({
        where: {
          name: validatedData.name,
          userId: session.user.id,
          organizationId: session.user.organizationId,
          id: { not: id }
        }
      })

      if (nameExists) {
        return NextResponse.json(
          { success: false, error: 'Rule name already exists' },
          { status: 400 }
        )
      }
    }

    // Update rule and channels in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Prepare rule update data
      const ruleUpdateData: any = {
        updatedAt: new Date()
      }

      // Add fields that are being updated
      if (validatedData.name !== undefined) ruleUpdateData.name = validatedData.name
      if (validatedData.description !== undefined) ruleUpdateData.description = validatedData.description
      if (validatedData.enabled !== undefined) ruleUpdateData.enabled = validatedData.enabled
      if (validatedData.conditions !== undefined) ruleUpdateData.conditions = validatedData.conditions
      if (validatedData.threshold !== undefined) ruleUpdateData.threshold = validatedData.threshold
      if (validatedData.comparisonOp !== undefined) ruleUpdateData.comparisonOp = validatedData.comparisonOp
      if (validatedData.timeWindow !== undefined) ruleUpdateData.timeWindow = validatedData.timeWindow
      if (validatedData.schedule !== undefined) ruleUpdateData.schedule = validatedData.schedule
      if (validatedData.timezone !== undefined) ruleUpdateData.timezone = validatedData.timezone
      if (validatedData.cooldownMinutes !== undefined) ruleUpdateData.cooldownMinutes = validatedData.cooldownMinutes
      if (validatedData.maxPerDay !== undefined) ruleUpdateData.maxPerDay = validatedData.maxPerDay
      if (validatedData.priority !== undefined) ruleUpdateData.priority = validatedData.priority
      if (validatedData.tags !== undefined) ruleUpdateData.tags = validatedData.tags

      // Update rule
      const updatedRule = await tx.notificationRule.update({
        where: { id },
        data: ruleUpdateData
      })

      // Update channels if provided
      let channels = existingRule.channels
      if (validatedData.channels) {
        // Delete existing channels
        await tx.notificationChannel.deleteMany({
          where: { ruleId: id }
        })

        // Create new channels
        channels = await Promise.all(
          validatedData.channels.map(channel =>
            tx.notificationChannel.create({
              data: {
                ruleId: id,
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
      }

      return { rule: updatedRule, channels }
    })

    // Test rule evaluation with updated conditions
    const testEvaluation = await testRuleEvaluation(
      { ...result.rule, conditions: validatedData.conditions || existingRule.conditions },
      session.user.id,
      session.user.organizationId!
    )

    // TODO: Add audit logging when AuditLog model is available
    // Log rule update for future audit implementation

    return NextResponse.json({
      success: true,
      data: {
        ...result.rule,
        channels: result.channels,
        testEvaluation
      }
    })

  } catch (error) {
    console.error('PATCH /api/notifications/rules/[id] error:', error)
    
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
 * DELETE /api/notifications/rules/[id] - Delete rule
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    const { id } = params

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid rule ID' },
        { status: 400 }
      )
    }

    // Check if rule exists and belongs to user
    const existingRule = await prisma.notificationRule.findFirst({
      where: {
        id,
        userId: session.user.id,
        organizationId: session.user.organizationId
      },
      include: {
        _count: {
          select: { notifications: true }
        }
      }
    })

    if (!existingRule) {
      return NextResponse.json(
        { success: false, error: 'Rule not found' },
        { status: 404 }
      )
    }

    // Delete rule and related data in transaction
    await prisma.$transaction(async (tx) => {
      // Delete channels first (foreign key constraint)
      await tx.notificationChannel.deleteMany({
        where: { ruleId: id }
      })

      // Delete the rule
      await tx.notificationRule.delete({
        where: { id }
      })

      // Update related notifications to remove rule reference
      await tx.notification.updateMany({
        where: { ruleId: id },
        data: { ruleId: null }
      })
    })

    // TODO: Add audit logging when AuditLog model is available
    // Log rule deletion for future audit implementation

    return NextResponse.json({
      success: true,
      message: 'Rule deleted successfully',
      data: {
        deletedRuleId: id,
        affectedNotifications: existingRule._count.notifications
      }
    })

  } catch (error) {
    console.error('DELETE /api/notifications/rules/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications/rules/[id] - Test rule evaluation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    const { id } = params

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid rule ID' },
        { status: 400 }
      )
    }

    // Get rule
    const rule = await prisma.notificationRule.findFirst({
      where: {
        id,
        userId: session.user.id,
        organizationId: session.user.organizationId
      },
      include: {
        channels: true
      }
    })

    if (!rule) {
      return NextResponse.json(
        { success: false, error: 'Rule not found' },
        { status: 404 }
      )
    }

    // Parse request body for test context (optional)
    let testContext = null
    try {
      const body = await request.json()
      testContext = body.testContext || null
    } catch {
      // No body provided, use defaults
    }

    // Test rule evaluation
    const testResults = await testRuleEvaluation(
      rule,
      session.user.id,
      session.user.organizationId!,
      testContext
    )

    // TODO: Add audit logging when AuditLog model is available
    // Log test execution for future audit implementation

    return NextResponse.json({
      success: true,
      data: {
        rule: {
          id: rule.id,
          name: rule.name,
          type: rule.type,
          enabled: rule.enabled,
          conditions: rule.conditions
        },
        testResults
      }
    })

  } catch (error) {
    console.error('POST /api/notifications/rules/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to test rule evaluation
 */
async function testRuleEvaluation(
  rule: any,
  userId: string,
  organizationId: string,
  testContext?: any
) {
  try {
    // Use provided test context or fetch real data
    let evaluationContext

    if (testContext) {
      evaluationContext = testContext
    } else {
      // Get sample data for evaluation
      const recentUsage = await prisma.usageLog.findMany({
        where: {
          userId,
          organizationId,
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
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

      const previousCost = await prisma.usageLog.aggregate({
        where: {
          userId,
          organizationId,
          timestamp: {
            gte: new Date(Date.now() - 48 * 60 * 60 * 1000),
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        _sum: { cost: true }
      })

      evaluationContext = {
        userId,
        organizationId,
        currentCost: currentCost._sum.cost || 0,
        previousCost: previousCost._sum.cost || 0,
        costIncrease: (currentCost._sum.cost || 0) - (previousCost._sum.cost || 0),
        usageData: recentUsage.map(log => ({
          provider: log.provider,
          model: log.model,
          tokens: log.totalTokens,
          requests: 1,
          cost: log.cost
        })),
        timeframe: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000),
          end: new Date()
        },
        alerts: [],
        metadata: {
          testEvaluation: true,
          evaluatedAt: new Date().toISOString()
        }
      }
    }

    // Test each condition
    const conditionResults: Record<string, any> = {}
    let wouldTrigger = true

    // Cost threshold
    if (rule.conditions.costThreshold !== undefined) {
      const passes = evaluationContext.currentCost >= rule.conditions.costThreshold
      conditionResults['costThreshold'] = {
        condition: `currentCost >= ${rule.conditions.costThreshold}`,
        value: evaluationContext.currentCost,
        passes,
        description: `Current cost (${evaluationContext.currentCost}) ${passes ? 'meets' : 'does not meet'} threshold (${rule.conditions.costThreshold})`
      }
      wouldTrigger = wouldTrigger && passes
    }

    // Usage threshold
    if (rule.conditions.usageThreshold !== undefined) {
      const totalTokens = evaluationContext.usageData.reduce((sum: number, usage: any) => sum + usage.tokens, 0)
      const passes = totalTokens >= rule.conditions.usageThreshold
      conditionResults['usageThreshold'] = {
        condition: `totalTokens >= ${rule.conditions.usageThreshold}`,
        value: totalTokens,
        passes,
        description: `Total tokens (${totalTokens}) ${passes ? 'meets' : 'does not meet'} threshold (${rule.conditions.usageThreshold})`
      }
      wouldTrigger = wouldTrigger && passes
    }

    // Provider filters
    if (rule.conditions.providerFilters?.length) {
      const matchingProviders = evaluationContext.usageData
        .filter((usage: any) => rule.conditions.providerFilters.includes(usage.provider))
        .map((usage: any) => usage.provider)
      const passes = matchingProviders.length > 0
      conditionResults['providerFilters'] = {
        condition: `provider in [${rule.conditions.providerFilters.join(', ')}]`,
        value: Array.from(new Set(matchingProviders)),
        passes,
        description: `${passes ? 'Found' : 'No'} matching providers: ${matchingProviders.join(', ') || 'none'}`
      }
      wouldTrigger = wouldTrigger && passes
    }

    // Model filters
    if (rule.conditions.modelFilters?.length) {
      const matchingModels = evaluationContext.usageData
        .filter((usage: any) => rule.conditions.modelFilters.includes(usage.model))
        .map((usage: any) => usage.model)
      const passes = matchingModels.length > 0
      conditionResults['modelFilters'] = {
        condition: `model in [${rule.conditions.modelFilters.join(', ')}]`,
        value: Array.from(new Set(matchingModels)),
        passes,
        description: `${passes ? 'Found' : 'No'} matching models: ${matchingModels.join(', ') || 'none'}`
      }
      wouldTrigger = wouldTrigger && passes
    }

    return {
      wouldTrigger,
      conditionResults,
      evaluationContext: {
        currentCost: evaluationContext.currentCost,
        previousCost: evaluationContext.previousCost,
        costIncrease: evaluationContext.costIncrease,
        totalTokens: evaluationContext.usageData.reduce((sum: number, usage: any) => sum + usage.tokens, 0),
        usageDataCount: evaluationContext.usageData.length,
        timeframe: evaluationContext.timeframe
      },
      summary: {
        totalConditions: Object.keys(conditionResults).length,
        passedConditions: Object.values(conditionResults).filter((result: any) => result.passes).length,
        evaluation: wouldTrigger ? 'WOULD_TRIGGER' : 'WOULD_NOT_TRIGGER'
      }
    }

  } catch (error) {
    console.error('Error during test evaluation:', error)
    return {
      wouldTrigger: null,
      error: 'Failed to evaluate rule conditions',
      errorDetails: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}