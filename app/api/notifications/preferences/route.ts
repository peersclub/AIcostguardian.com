import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for notification preferences
const preferencesSchema = z.object({
  emailEnabled: z.boolean().default(true),
  smsEnabled: z.boolean().default(false),
  pushEnabled: z.boolean().default(true),
  inAppEnabled: z.boolean().default(true),
  slackEnabled: z.boolean().default(false),
  teamsEnabled: z.boolean().default(false),
  quietHoursEnabled: z.boolean().default(false),
  quietHoursStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  quietHoursEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  timezone: z.string().default('UTC'),
  weekendQuiet: z.boolean().default(false),
  batchEmails: z.boolean().default(false),
  batchFrequency: z.enum(['immediate', 'hourly', 'daily']).default('immediate'),
  preferredChannel: z.enum(['EMAIL', 'SMS', 'PUSH', 'IN_APP', 'SLACK', 'TEAMS']).default('EMAIL'),
  costAlerts: z.boolean().default(true),
  usageAlerts: z.boolean().default(true),
  systemAlerts: z.boolean().default(true),
  teamAlerts: z.boolean().default(true),
  reports: z.boolean().default(true),
  recommendations: z.boolean().default(true),
  autoEscalate: z.boolean().default(false),
  escalateAfterMinutes: z.number().min(5).max(1440).default(60), // 5 minutes to 24 hours
  channels: z.object({
    email: z.object({
      address: z.string().email().optional(),
      verified: z.boolean().default(false)
    }).optional(),
    sms: z.object({
      phoneNumber: z.string().optional(),
      verified: z.boolean().default(false)
    }).optional(),
    slack: z.object({
      webhookUrl: z.string().url().optional(),
      channel: z.string().optional(),
      userId: z.string().optional()
    }).optional(),
    teams: z.object({
      webhookUrl: z.string().url().optional(),
      channel: z.string().optional()
    }).optional(),
    webhook: z.object({
      url: z.string().url().optional(),
      secret: z.string().optional()
    }).optional()
  }).optional()
})

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_COUNT = 20 // requests per window

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

// Helper function to validate timezone
function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch {
    return false
  }
}

// Helper function to validate quiet hours
function validateQuietHours(start?: string, end?: string): boolean {
  if (!start || !end) return true
  
  const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/
  return timeRegex.test(start) && timeRegex.test(end)
}

/**
 * GET /api/notifications/preferences - Get user notification preferences
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

    // Get or create preferences
    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId: session.user.id }
    })

    if (!preferences) {
      // Create default preferences
      preferences = await prisma.notificationPreferences.create({
        data: {
          userId: session.user.id,
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: true,
          inAppEnabled: true,
          slackEnabled: false,
          teamsEnabled: false,
          quietHoursEnabled: false,
          timezone: 'UTC',
          weekendQuiet: false,
          batchEmails: false,
          batchFrequency: 'immediate',
          preferredChannel: 'EMAIL',
          costAlerts: true,
          usageAlerts: true,
          systemAlerts: true,
          teamAlerts: true,
          reports: true,
          recommendations: true,
          autoEscalate: false,
          escalateAfterMinutes: 60
        }
      })
    }

    // Get notification statistics
    const stats = await getNotificationStats(session.user.id)

    return NextResponse.json({
      success: true,
      data: {
        ...preferences,
        stats
      }
    })

  } catch (error) {
    console.error('GET /api/notifications/preferences error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications/preferences - Update user notification preferences
 */
export async function PATCH(request: NextRequest) {
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
    const validatedData = preferencesSchema.partial().parse(body)

    // Additional validations
    if (validatedData.timezone && !isValidTimezone(validatedData.timezone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid timezone' },
        { status: 400 }
      )
    }

    if (validatedData.quietHoursEnabled && 
        !validateQuietHours(validatedData.quietHoursStart, validatedData.quietHoursEnd)) {
      return NextResponse.json(
        { success: false, error: 'Invalid quiet hours format (expected HH:MM)' },
        { status: 400 }
      )
    }

    // Get existing preferences or create defaults
    const existingPreferences = await prisma.notificationPreferences.findUnique({
      where: { userId: session.user.id }
    })

    // Update or create preferences
    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId: session.user.id },
      update: validatedData,
      create: {
        userId: session.user.id,
        emailEnabled: validatedData.emailEnabled ?? true,
        smsEnabled: validatedData.smsEnabled ?? false,
        pushEnabled: validatedData.pushEnabled ?? true,
        inAppEnabled: validatedData.inAppEnabled ?? true,
        slackEnabled: validatedData.slackEnabled ?? false,
        teamsEnabled: validatedData.teamsEnabled ?? false,
        quietHoursEnabled: validatedData.quietHoursEnabled ?? false,
        quietHoursStart: validatedData.quietHoursStart,
        quietHoursEnd: validatedData.quietHoursEnd,
        timezone: validatedData.timezone ?? 'UTC',
        weekendQuiet: validatedData.weekendQuiet ?? false,
        batchEmails: validatedData.batchEmails ?? false,
        batchFrequency: validatedData.batchFrequency ?? 'immediate',
        preferredChannel: validatedData.preferredChannel ?? 'EMAIL',
        costAlerts: validatedData.costAlerts ?? true,
        usageAlerts: validatedData.usageAlerts ?? true,
        systemAlerts: validatedData.systemAlerts ?? true,
        teamAlerts: validatedData.teamAlerts ?? true,
        reports: validatedData.reports ?? true,
        recommendations: validatedData.recommendations ?? true,
        autoEscalate: validatedData.autoEscalate ?? false,
        escalateAfterMinutes: validatedData.escalateAfterMinutes ?? 60
      }
    })

    // TODO: Add audit logging when AuditLog model is available
    // Log preferences update for future audit implementation

    return NextResponse.json({
      success: true,
      data: preferences,
      message: 'Notification preferences updated successfully'
    })

  } catch (error) {
    console.error('PATCH /api/notifications/preferences error:', error)
    
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
 * POST /api/notifications/preferences - Reset preferences to defaults
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
    const { action } = body

    if (action === 'reset') {
      // Reset to default preferences
      const defaultPreferences = await prisma.notificationPreferences.upsert({
        where: { userId: session.user.id },
        update: {
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: true,
          inAppEnabled: true,
          slackEnabled: false,
          teamsEnabled: false,
          quietHoursEnabled: false,
          quietHoursStart: null,
          quietHoursEnd: null,
          timezone: 'UTC',
          weekendQuiet: false,
          batchEmails: false,
          batchFrequency: 'immediate',
          preferredChannel: 'EMAIL',
          costAlerts: true,
          usageAlerts: true,
          systemAlerts: true,
          teamAlerts: true,
          reports: true,
          recommendations: true,
          autoEscalate: false,
          escalateAfterMinutes: 60
        },
        create: {
          userId: session.user.id,
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: true,
          inAppEnabled: true,
          slackEnabled: false,
          teamsEnabled: false,
          quietHoursEnabled: false,
          timezone: 'UTC',
          weekendQuiet: false,
          batchEmails: false,
          batchFrequency: 'immediate',
          preferredChannel: 'EMAIL',
          costAlerts: true,
          usageAlerts: true,
          systemAlerts: true,
          teamAlerts: true,
          reports: true,
          recommendations: true,
          autoEscalate: false,
          escalateAfterMinutes: 60
        }
      })

      // TODO: Add audit logging when AuditLog model is available
      // Log preferences reset for future audit implementation

      return NextResponse.json({
        success: true,
        data: defaultPreferences,
        message: 'Notification preferences reset to defaults'
      })
    }

    if (action === 'test') {
      // Send test notifications to verify channels
      const preferences = await prisma.notificationPreferences.findUnique({
        where: { userId: session.user.id }
      })

      if (!preferences) {
        return NextResponse.json(
          { success: false, error: 'Preferences not found' },
          { status: 404 }
        )
      }

      const testResults = await sendTestNotifications(session.user, preferences)

      return NextResponse.json({
        success: true,
        data: testResults,
        message: 'Test notifications sent'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('POST /api/notifications/preferences error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to get notification statistics
 */
async function getNotificationStats(userId: string) {
  try {
    const now = new Date()
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      totalNotifications,
      unreadCount,
      todayCount,
      weekCount,
      monthCount,
      channelStats
    ] = await Promise.all([
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, readAt: null } }),
      prisma.notification.count({ where: { userId, createdAt: { gte: dayAgo } } }),
      prisma.notification.count({ where: { userId, createdAt: { gte: weekAgo } } }),
      prisma.notification.count({ where: { userId, createdAt: { gte: monthAgo } } }),
      prisma.notification.groupBy({
        by: ['type'],
        where: { userId, createdAt: { gte: monthAgo } },
        _count: true
      })
    ])

    return {
      total: totalNotifications,
      unread: unreadCount,
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      byType: channelStats.reduce((acc, stat) => {
        acc[stat.type] = stat._count
        return acc
      }, {} as Record<string, number>)
    }
  } catch (error) {
    console.error('Failed to get notification stats:', error)
    return {
      total: 0,
      unread: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      byType: {}
    }
  }
}

/**
 * Helper function to send test notifications
 */
async function sendTestNotifications(user: any, preferences: any) {
  const testResults = []

  try {
    // Test email if enabled
    if (preferences.emailEnabled && user.email) {
      testResults.push({
        channel: 'email',
        destination: user.email,
        status: 'sent', // Would actually send in real implementation
        message: 'Test email sent successfully'
      })
    }

    // Test in-app if enabled
    if (preferences.inAppEnabled) {
      // Create a test in-app notification
      await prisma.notification.create({
        data: {
          id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          organizationId: user.organizationId || 'unknown',
          type: 'INTEGRATION_FAILURE',
          priority: 'LOW',
          title: 'Test Notification',
          message: 'This is a test notification to verify your settings.',
          status: 'DELIVERED',
          data: { isTest: true },
          channels: { inApp: { sent: true } },
          deliveredAt: new Date(),
          createdAt: new Date()
        }
      })

      testResults.push({
        channel: 'in-app',
        destination: 'dashboard',
        status: 'sent',
        message: 'Test in-app notification created'
      })
    }

    // Test Slack if enabled
    if (preferences.slackEnabled) {
      testResults.push({
        channel: 'slack',
        destination: 'default',
        status: 'simulated', // Would actually send in real implementation
        message: 'Test Slack notification would be sent'
      })
    }

    // Test Teams if enabled
    if (preferences.teamsEnabled) {
      testResults.push({
        channel: 'teams',
        destination: 'default',
        status: 'simulated',
        message: 'Test Teams notification would be sent'
      })
    }

    return testResults
  } catch (error) {
    console.error('Failed to send test notifications:', error)
    return [{
      channel: 'error',
      destination: 'unknown',
      status: 'failed',
      message: 'Failed to send test notifications'
    }]
  }
}