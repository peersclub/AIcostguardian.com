import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { NotificationType, ChannelType } from '@prisma/client'

// Validation schemas
const templateSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.nativeEnum(NotificationType),
  channel: z.nativeEnum(ChannelType),
  subject: z.string().max(255).optional(),
  bodyTemplate: z.string().min(1),
  bodyHtml: z.string().optional(),
  variables: z.record(z.any()).default({}),
  locale: z.string().default('en'),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  metadata: z.object({
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    version: z.string().optional(),
    author: z.string().optional()
  }).optional()
})

const querySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
  type: z.nativeEnum(NotificationType).optional(),
  channel: z.nativeEnum(ChannelType).optional(),
  locale: z.string().optional(),
  search: z.string().optional(),
  tags: z.string().optional(),
  isDefault: z.string().transform(val => val === 'true').optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
  sortBy: z.enum(['name', 'createdAt', 'type', 'channel']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
})

const previewSchema = z.object({
  templateId: z.string().optional(),
  templateBody: z.string().optional(),
  variables: z.record(z.any()).default({}),
  format: z.enum(['text', 'html']).default('text')
})

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_COUNT = 50 // requests per window

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

// Default templates
const DEFAULT_TEMPLATES = {
  COST_ALERT: {
    EMAIL: {
      subject: 'Cost Alert: {threshold} threshold exceeded',
      body: 'Hello {user.name},\n\nYour AI usage has exceeded the ${threshold} threshold.\n\nCurrent cost: ${currentCost}\nThreshold: ${threshold}\nProvider: {provider}\n\nPlease review your usage in the dashboard.\n\nBest regards,\nAI Cost Guardian'
    },
    IN_APP: {
      body: 'Cost threshold exceeded: ${currentCost} > ${threshold} for {provider}'
    }
  },
  USAGE_ALERT: {
    EMAIL: {
      subject: 'Usage Alert: High token consumption detected',
      body: 'Hello {user.name},\n\nHigh token usage detected:\n\nTokens used: {tokens}\nTime period: {timeframe}\nProvider: {provider}\nModel: {model}\n\nConsider optimizing your usage.\n\nBest regards,\nAI Cost Guardian'
    }
  }
}

/**
 * GET /api/notifications/templates - List notification templates
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

    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    
    // Handle special actions
    if (queryParams.action === 'preview') {
      return handleTemplatePreview(queryParams, session)
    }
    
    if (queryParams.action === 'variables') {
      return handleGetTemplateVariables(queryParams, session)
    }

    if (queryParams.action === 'defaults') {
      return handleGetDefaultTemplates(session)
    }

    // Regular template listing
    const validatedQuery = querySchema.parse(queryParams)
    const {
      page,
      limit,
      type,
      channel,
      locale,
      search,
      tags,
      isDefault,
      isActive,
      sortBy,
      sortOrder
    } = validatedQuery

    // Validate pagination limits
    if (limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Limit cannot exceed 100' },
        { status: 400 }
      )
    }

    // Build where conditions
    const where: any = {
      OR: [
        { userId: session.user.id }, // User's custom templates
        { isDefault: true } // System default templates
      ]
    }

    if (type) where.type = type
    if (channel) where.channel = channel
    if (locale) where.locale = locale
    if (isDefault !== undefined) where.isDefault = isDefault
    if (isActive !== undefined) where.isActive = isActive
    
    if (search) {
      where.AND = where.AND || []
      where.AND.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { bodyTemplate: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim())
      where.AND = where.AND || []
      where.AND.push({
        metadata: {
          path: ['tags'],
          array_contains: tagArray
        }
      })
    }

    // Get total count
    const total = await prisma.notificationTemplate.count({ where })

    // Get templates
    const templates = await prisma.notificationTemplate.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: {
            notifications: true
          }
        }
      }
    })

    const hasMore = page * limit < total
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: templates.map(template => ({
        ...template,
        usageCount: template._count.notifications,
        canEdit: template.userId === session.user.id || session.user.role === 'ADMIN',
        variables: extractVariablesFromTemplate(template.bodyTemplate)
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore
      }
    })

  } catch (error) {
    console.error('GET /api/notifications/templates error:', error)
    
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
 * POST /api/notifications/templates - Create new template
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
    const validatedData = templateSchema.parse(body)

    // Check if template name is unique for the user
    const existingTemplate = await prisma.notificationTemplate.findFirst({
      where: {
        name: validatedData.name,
        type: validatedData.type,
        channel: validatedData.channel,
        userId: session.user.id
      }
    })

    if (existingTemplate) {
      return NextResponse.json(
        { success: false, error: 'Template with this name, type, and channel already exists' },
        { status: 400 }
      )
    }

    // Validate template syntax
    const validationResult = validateTemplateContent(validatedData.bodyTemplate)
    if (!validationResult.isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid template syntax', details: validationResult.errors },
        { status: 400 }
      )
    }

    // Create template
    const template = await prisma.notificationTemplate.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        type: validatedData.type,
        channel: validatedData.channel,
        subject: validatedData.subject,
        bodyTemplate: validatedData.bodyTemplate,
        bodyHtml: validatedData.bodyHtml,
        variables: validatedData.variables,
        locale: validatedData.locale,
        isDefault: false, // Only system can create defaults
        isActive: validatedData.isActive,
        metadata: validatedData.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Extract and save variables
    const extractedVariables = extractVariablesFromTemplate(validatedData.bodyTemplate)

    // Log template creation
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        organizationId: session.user.organizationId || 'unknown',
        action: 'NOTIFICATION_TEMPLATE_CREATE',
        resourceType: 'NOTIFICATION_TEMPLATE',
        resourceId: template.id,
        details: {
          templateName: template.name,
          templateType: template.type,
          templateChannel: template.channel,
          variableCount: extractedVariables.length,
          timestamp: new Date().toISOString()
        }
      }
    }).catch(() => {
      console.warn('Failed to create audit log for template creation')
    })

    return NextResponse.json({
      success: true,
      data: {
        ...template,
        extractedVariables,
        canEdit: true
      },
      message: 'Template created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('POST /api/notifications/templates error:', error)
    
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
 * Handle template preview
 */
async function handleTemplatePreview(queryParams: any, session: any) {
  const validatedData = previewSchema.parse(queryParams)

  let templateBody = validatedData.templateBody
  let templateSubject = ''

  // If templateId is provided, fetch the template
  if (validatedData.templateId) {
    const template = await prisma.notificationTemplate.findFirst({
      where: {
        id: validatedData.templateId,
        OR: [
          { userId: session.user.id },
          { isDefault: true }
        ]
      }
    })

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    templateBody = template.bodyTemplate
    templateSubject = template.subject || ''
  }

  // Render template with provided variables
  const renderedResult = renderTemplate(templateBody, templateSubject, validatedData.variables)

  return NextResponse.json({
    success: true,
    data: {
      rendered: {
        subject: renderedResult.subject,
        body: renderedResult.body,
        html: validatedData.format === 'html' ? renderedResult.html : undefined
      },
      variables: {
        provided: validatedData.variables,
        used: extractVariablesFromTemplate(templateBody),
        missing: findMissingVariables(templateBody, validatedData.variables)
      }
    }
  })
}

/**
 * Handle get template variables
 */
async function handleGetTemplateVariables(queryParams: any, session: any) {
  const availableVariables = {
    user: {
      id: 'User ID',
      name: 'User full name',
      email: 'User email address',
      company: 'User company name'
    },
    organization: {
      id: 'Organization ID',
      name: 'Organization name',
      domain: 'Organization domain'
    },
    notification: {
      type: 'Notification type',
      priority: 'Notification priority',
      title: 'Notification title',
      message: 'Notification message',
      'data.*': 'Custom notification data fields'
    },
    context: {
      currentCost: 'Current cost value',
      threshold: 'Alert threshold value',
      provider: 'AI provider name',
      model: 'AI model name',
      timeframe: 'Time period description',
      timestamp: 'Current timestamp'
    },
    branding: {
      primaryColor: 'Brand primary color',
      logoUrl: 'Brand logo URL',
      companyName: 'Brand company name',
      brandName: 'Brand name',
      footerText: 'Brand footer text'
    }
  }

  // Get example values for each variable type
  const exampleValues = {
    user: {
      id: session.user.id,
      name: session.user.name || 'John Doe',
      email: session.user.email || 'john@example.com',
      company: session.user.company || 'Example Corp'
    },
    organization: {
      id: session.user.organizationId || 'org_123',
      name: 'Example Organization',
      domain: 'example.com'
    },
    notification: {
      type: 'COST_ALERT',
      priority: 'HIGH',
      title: 'Cost threshold exceeded',
      message: 'Your usage has exceeded the defined threshold'
    },
    context: {
      currentCost: 150.75,
      threshold: 100.00,
      provider: 'OpenAI',
      model: 'gpt-4',
      timeframe: 'last 24 hours',
      timestamp: new Date().toISOString()
    },
    branding: {
      primaryColor: '#3b82f6',
      logoUrl: '/logo.png',
      companyName: 'AI Cost Guardian',
      brandName: 'AI Cost Guardian',
      footerText: 'Manage your AI costs intelligently'
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      availableVariables,
      exampleValues,
      templateSyntax: {
        variable: '{variable.name}',
        conditionals: '{#if condition}...{/if}',
        loops: '{#each items}...{/each}',
        expressions: '{variable | filter}'
      }
    }
  })
}

/**
 * Handle get default templates
 */
async function handleGetDefaultTemplates(session: any) {
  const defaultTemplates = Object.entries(DEFAULT_TEMPLATES).map(([type, channels]) => ({
    type,
    channels: Object.entries(channels).map(([channel, template]) => ({
      channel,
      ...template
    }))
  }))

  return NextResponse.json({
    success: true,
    data: {
      defaultTemplates,
      supportedTypes: Object.values(NotificationType),
      supportedChannels: Object.values(ChannelType),
      locales: ['en', 'es', 'fr', 'de', 'ja']
    }
  })
}

/**
 * Extract variables from template content
 */
function extractVariablesFromTemplate(templateContent: string): string[] {
  const variableRegex = /{([^}]+)}/g
  const variables = new Set<string>()
  let match

  while ((match = variableRegex.exec(templateContent)) !== null) {
    const variable = match[1].trim()
    // Skip control structures like #if, #each, etc.
    if (!variable.startsWith('#') && !variable.startsWith('/')) {
      variables.add(variable)
    }
  }

  return Array.from(variables).sort()
}

/**
 * Validate template content syntax
 */
function validateTemplateContent(templateContent: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  try {
    // Check for balanced braces
    const openBraces = (templateContent.match(/{/g) || []).length
    const closeBraces = (templateContent.match(/}/g) || []).length
    
    if (openBraces !== closeBraces) {
      errors.push('Unbalanced braces: mismatched { and }')
    }

    // Check for valid variable syntax
    const variableRegex = /{([^}]+)}/g
    let match
    
    while ((match = variableRegex.exec(templateContent)) !== null) {
      const variable = match[1].trim()
      
      // Basic validation - variables should not be empty
      if (!variable) {
        errors.push('Empty variable placeholder found: {}')
      }
      
      // Check for invalid characters (basic validation)
      if (variable.includes('<') || variable.includes('>')) {
        errors.push(`Invalid characters in variable: ${variable}`)
      }
    }

    return { isValid: errors.length === 0, errors }

  } catch (error) {
    return { 
      isValid: false, 
      errors: [`Template validation error: ${error.message}`] 
    }
  }
}

/**
 * Render template with variables
 */
function renderTemplate(templateBody: string, templateSubject: string, variables: any) {
  try {
    let renderedBody = templateBody
    let renderedSubject = templateSubject

    // Simple variable replacement (in production, use a proper template engine)
    const replaceVariables = (content: string, vars: any, prefix = '') => {
      return content.replace(/{([^}]+)}/g, (match, variable) => {
        const cleanVar = variable.trim()
        const value = getNestedValue(vars, cleanVar)
        return value !== undefined ? String(value) : match
      })
    }

    renderedBody = replaceVariables(renderedBody, variables)
    renderedSubject = replaceVariables(renderedSubject, variables)

    // Generate simple HTML version
    const renderedHtml = renderedBody
      .replace(/\n/g, '<br>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')

    return {
      subject: renderedSubject,
      body: renderedBody,
      html: `<html><body>${renderedHtml}</body></html>`
    }

  } catch (error) {
    console.error('Template rendering error:', error)
    return {
      subject: 'Template Error',
      body: 'Failed to render template',
      html: '<html><body>Failed to render template</body></html>'
    }
  }
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}

/**
 * Find missing variables in template
 */
function findMissingVariables(templateContent: string, providedVariables: any): string[] {
  const usedVariables = extractVariablesFromTemplate(templateContent)
  const missing = []

  for (const variable of usedVariables) {
    if (getNestedValue(providedVariables, variable) === undefined) {
      missing.push(variable)
    }
  }

  return missing
}