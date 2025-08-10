import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { notificationService } from '@/lib/notifications/notification.service'
import { z } from 'zod'
import { NotificationType, NotificationPriority, ChannelType } from '@prisma/client'

// Validation schemas
const testNotificationSchema = z.object({
  channels: z.array(z.object({
    type: z.nativeEnum(ChannelType),
    destination: z.string().min(1),
    config: z.record(z.any()).optional()
  })).min(1),
  notification: z.object({
    type: z.nativeEnum(NotificationType).optional().default('INTEGRATION_FAILURE'),
    priority: z.nativeEnum(NotificationPriority).optional().default('MEDIUM'),
    title: z.string().min(1).max(255).optional().default('Test Notification'),
    message: z.string().min(1).max(2000).optional().default('This is a test notification to verify delivery configuration.'),
    data: z.record(z.any()).optional()
  }).optional(),
  options: z.object({
    skipDatabase: z.boolean().optional().default(true), // Don't save test notifications by default
    includeDeliveryDetails: z.boolean().optional().default(true),
    timeout: z.number().min(1000).max(30000).optional().default(10000) // 10 second timeout
  }).optional()
})

const bulkTestSchema = z.object({
  testType: z.enum(['channel_validation', 'rule_evaluation', 'template_rendering', 'full_delivery']),
  channels: z.array(z.object({
    type: z.nativeEnum(ChannelType),
    destination: z.string().min(1),
    config: z.record(z.any()).optional()
  })).optional(),
  ruleIds: z.array(z.string()).optional(),
  templateName: z.string().optional()
})

// Rate limiting - stricter for test endpoints
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_COUNT = 10 // requests per window (low for test endpoints)

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

/**
 * POST /api/notifications/test - Send test notification to specified channels
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
        { success: false, error: 'Rate limit exceeded. Test endpoints have strict rate limits.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    const body = await request.json()
    
    // Check if this is a bulk test request
    if (body.testType) {
      return handleBulkTest(body, session)
    }

    // Handle single test notification
    const validatedData = testNotificationSchema.parse(body)

    const testResults = []
    const startTime = Date.now()

    // Create test notification data
    const testNotificationData = {
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session.user.id,
      organizationId: session.user.organizationId!,
      type: (validatedData.notification?.type || 'INTEGRATION_FAILURE') as NotificationType,
      priority: (validatedData.notification?.priority || 'MEDIUM') as NotificationPriority,
      title: validatedData.notification?.title || 'Test Notification',
      message: validatedData.notification?.message || 'This is a test notification to verify delivery configuration.',
      data: {
        ...validatedData.notification?.data,
        isTest: true,
        testId: `test_${Date.now()}`,
        sentBy: session.user.email,
        timestamp: new Date().toISOString()
      }
    }

    // Test each channel
    for (const channelConfig of validatedData.channels) {
      const channelStartTime = Date.now()
      
      try {
        console.log(`Testing ${channelConfig.type} channel to ${channelConfig.destination}`)

        // Validate channel configuration
        const validationResult = await validateChannelConfig(channelConfig)
        if (!validationResult.isValid) {
          testResults.push({
            channel: channelConfig.type,
            destination: channelConfig.destination,
            success: false,
            error: validationResult.error,
            latency: Date.now() - channelStartTime,
            phase: 'validation'
          })
          continue
        }

        // Send test notification
        const deliveryResult = await notificationService.sendDirect(
          testNotificationData,
          [channelConfig]
        )

        const result = deliveryResult[0]
        
        testResults.push({
          channel: channelConfig.type,
          destination: channelConfig.destination,
          success: result.success,
          messageId: result.messageId,
          error: result.error,
          latency: Date.now() - channelStartTime,
          attempts: result.attempts,
          metadata: validatedData.options?.includeDeliveryDetails ? result.metadata : undefined,
          phase: 'delivery'
        })

        // Log successful test
        if (result.success) {
          console.log(`Test notification delivered successfully to ${channelConfig.type}`)
        }

      } catch (error) {
        console.error(`Test notification failed for ${channelConfig.type}:`, error)
        
        testResults.push({
          channel: channelConfig.type,
          destination: channelConfig.destination,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          latency: Date.now() - channelStartTime,
          attempts: 1,
          phase: 'error'
        })
      }
    }

    // Optionally save test notification to database
    if (!validatedData.options?.skipDatabase) {
      await prisma.notification.create({
        data: {
          id: testNotificationData.id,
          userId: testNotificationData.userId,
          organizationId: testNotificationData.organizationId,
          type: testNotificationData.type,
          priority: testNotificationData.priority,
          title: testNotificationData.title,
          message: testNotificationData.message,
          data: testNotificationData.data,
          status: testResults.every(r => r.success) ? 'DELIVERED' : 'FAILED',
          channels: testResults.reduce((acc, result) => {
            acc[result.channel] = {
              success: result.success,
              messageId: result.messageId,
              error: result.error,
              latency: result.latency,
              attempts: result.attempts,
              timestamp: new Date().toISOString()
            }
            return acc
          }, {} as Record<string, any>),
          deliveredAt: testResults.every(r => r.success) ? new Date() : undefined,
          createdAt: new Date()
        }
      })
    }

    // TODO: Add audit logging when AuditLog model is available
    // Log test execution for future audit implementation

    const summary = {
      totalChannels: testResults.length,
      successfulChannels: testResults.filter(r => r.success).length,
      failedChannels: testResults.filter(r => !r.success).length,
      averageLatency: testResults.length > 0 ? 
        Math.round(testResults.reduce((sum, r) => sum + r.latency, 0) / testResults.length) : 0,
      totalLatency: Date.now() - startTime
    }

    return NextResponse.json({
      success: summary.failedChannels === 0,
      data: {
        testId: testNotificationData.id,
        results: testResults,
        summary,
        notification: testNotificationData
      },
      message: `Test completed: ${summary.successfulChannels}/${summary.totalChannels} channels successful`
    })

  } catch (error) {
    console.error('POST /api/notifications/test error:', error)
    
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
 * GET /api/notifications/test - Get test history and channel validation info
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
    const action = url.searchParams.get('action')

    if (action === 'validate_channels') {
      return handleChannelValidation(session)
    }

    if (action === 'test_history') {
      return handleTestHistory(session)
    }

    // Default: return available test options and channel info
    const channelInfo = await getChannelCapabilities()
    const userPreferences = await prisma.notificationPreferences.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json({
      success: true,
      data: {
        availableChannels: channelInfo,
        userPreferences,
        testOptions: {
          skipDatabase: true,
          includeDeliveryDetails: true,
          timeout: 10000
        },
        rateLimit: {
          windowMs: RATE_LIMIT_WINDOW,
          maxRequests: RATE_LIMIT_COUNT,
          remaining: Math.max(0, RATE_LIMIT_COUNT - (rateLimitMap.get(session.user.id)?.count || 0))
        }
      }
    })

  } catch (error) {
    console.error('GET /api/notifications/test error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Handle bulk test operations
 */
async function handleBulkTest(body: any, session: any) {
  const validatedData = bulkTestSchema.parse(body)
  const results = []

  switch (validatedData.testType) {
    case 'channel_validation':
      if (!validatedData.channels) {
        throw new Error('Channels required for channel_validation test')
      }
      
      for (const channel of validatedData.channels) {
        const validation = await validateChannelConfig(channel)
        results.push({
          channel: channel.type,
          destination: channel.destination,
          isValid: validation.isValid,
          error: validation.error,
          details: validation.details
        })
      }
      break

    case 'rule_evaluation':
      if (!validatedData.ruleIds?.length) {
        throw new Error('Rule IDs required for rule_evaluation test')
      }
      
      for (const ruleId of validatedData.ruleIds) {
        const rule = await prisma.notificationRule.findFirst({
          where: {
            id: ruleId,
            userId: session.user.id,
            organizationId: session.user.organizationId
          }
        })
        
        if (rule) {
          // Test rule evaluation logic would go here
          results.push({
            ruleId,
            ruleName: rule.name,
            wouldTrigger: false, // Placeholder
            conditions: rule.conditions
          })
        }
      }
      break

    case 'template_rendering':
      // Test template rendering
      results.push({
        templateName: validatedData.templateName || 'default',
        rendered: 'Template rendering test not implemented',
        success: false
      })
      break

    case 'full_delivery':
      // Full end-to-end test
      if (!validatedData.channels) {
        throw new Error('Channels required for full_delivery test')
      }
      
      // This would run a complete delivery test
      results.push({
        testType: 'full_delivery',
        success: false,
        error: 'Full delivery test not implemented'
      })
      break
  }

  return NextResponse.json({
    success: true,
    data: {
      testType: validatedData.testType,
      results,
      summary: {
        totalTests: results.length,
        successfulTests: results.filter((r: any) => r.isValid || r.success).length
      }
    }
  })
}

/**
 * Handle channel validation
 */
async function handleChannelValidation(session: any) {
  const preferences = await prisma.notificationPreferences.findUnique({
    where: { userId: session.user.id }
  })

  const validationResults = []

  if (preferences?.emailEnabled && session.user.email) {
    validationResults.push({
      channel: 'EMAIL',
      destination: session.user.email,
      isValid: true,
      isConfigured: true,
      details: 'Email address from user profile'
    })
  }

  if (preferences?.slackEnabled) {
    validationResults.push({
      channel: 'SLACK',
      destination: 'default',
      isValid: true,
      isConfigured: preferences.slackEnabled,
      details: preferences.slackEnabled ? 'Slack notifications enabled' : 'Slack notifications disabled'
    })
  }

  if (preferences?.inAppEnabled) {
    validationResults.push({
      channel: 'IN_APP',
      destination: 'dashboard',
      isValid: true,
      isConfigured: true,
      details: 'In-app notifications always available'
    })
  }

  return NextResponse.json({
    success: true,
    data: {
      validationResults,
      summary: {
        totalChannels: validationResults.length,
        validChannels: validationResults.filter(r => r.isValid).length,
        configuredChannels: validationResults.filter(r => r.isConfigured).length
      }
    }
  })
}

/**
 * Handle test history
 */
async function handleTestHistory(session: any) {
  // TODO: Implement test history when AuditLog model is available
  const testHistory: any[] = []

  return NextResponse.json({
    success: true,
    data: {
      testHistory: testHistory.map((log: any) => ({
        id: log.id,
        timestamp: log.createdAt,
        testType: log.details?.testType || 'unknown',
        results: log.details?.results || [],
        summary: log.details?.summary
      }))
    }
  })
}

/**
 * Validate channel configuration
 */
async function validateChannelConfig(channelConfig: any) {
  try {
    switch (channelConfig.type) {
      case 'EMAIL':
        // Validate email address
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(channelConfig.destination)) {
          return { isValid: false, error: 'Invalid email address format' }
        }
        return { isValid: true, details: 'Valid email address format' }

      case 'SLACK':
        // Validate Slack webhook URL or channel
        if (channelConfig.config?.webhookUrl) {
          if (!channelConfig.config.webhookUrl.startsWith('https://hooks.slack.com/')) {
            return { isValid: false, error: 'Invalid Slack webhook URL format' }
          }
        }
        return { isValid: true, details: 'Slack configuration appears valid' }

      case 'WEBHOOK':
        // Validate webhook URL
        try {
          new URL(channelConfig.destination)
        } catch {
          return { isValid: false, error: 'Invalid webhook URL format' }
        }
        return { isValid: true, details: 'Valid webhook URL format' }

      case 'IN_APP':
        // In-app notifications are always valid
        return { isValid: true, details: 'In-app notifications always available' }

      default:
        return { isValid: false, error: `Unsupported channel type: ${channelConfig.type}` }
    }
  } catch (error) {
    return { isValid: false, error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

/**
 * Get channel capabilities info
 */
async function getChannelCapabilities() {
  return {
    EMAIL: {
      name: 'Email',
      supported: true,
      requiresConfig: false,
      configFields: ['destination'],
      testable: true
    },
    IN_APP: {
      name: 'In-App',
      supported: true,
      requiresConfig: false,
      configFields: [],
      testable: true
    },
    SLACK: {
      name: 'Slack',
      supported: true,
      requiresConfig: true,
      configFields: ['webhookUrl', 'channel'],
      testable: true
    },
    WEBHOOK: {
      name: 'Webhook',
      supported: true,
      requiresConfig: true,
      configFields: ['url', 'secret'],
      testable: true
    },
    SMS: {
      name: 'SMS',
      supported: false,
      requiresConfig: true,
      configFields: ['phoneNumber'],
      testable: false
    },
    TEAMS: {
      name: 'Microsoft Teams',
      supported: false,
      requiresConfig: true,
      configFields: ['webhookUrl'],
      testable: false
    }
  }
}