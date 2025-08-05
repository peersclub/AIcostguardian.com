import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

// Mock notification settings store
const notificationSettings = new Map<string, any>()

// Initialize with default settings
notificationSettings.set('default', {
  email: {
    enabled: true,
    address: 'admin@assetworks.com',
    severityFilter: ['medium', 'high', 'critical'],
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00',
      timezone: 'America/New_York'
    },
    digest: {
      enabled: true,
      frequency: 'daily',
      time: '09:00'
    }
  },
  slack: {
    enabled: true,
    webhookUrl: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
    channel: '#alerts',
    severityFilter: ['high', 'critical'],
    mentionUsers: {
      critical: ['@admin', '@oncall'],
      high: ['@admin']
    }
  },
  webhook: {
    enabled: true,
    url: 'https://api.company.com/alerts/webhook',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer webhook-token',
      'Content-Type': 'application/json'
    },
    severityFilter: ['critical'],
    retryAttempts: 3,
    timeout: 30
  },
  sms: {
    enabled: false,
    phoneNumber: '+1234567890',
    severityFilter: ['critical'],
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00'
    }
  },
  escalation: {
    enabled: true,
    rules: [
      {
        severity: 'critical',
        timeToEscalate: 15, // minutes
        escalateTo: ['cto@assetworks.com', 'admin@assetworks.com']
      },
      {
        severity: 'high',
        timeToEscalate: 60, // minutes
        escalateTo: ['admin@assetworks.com']
      }
    ]
  }
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userCompany = session.user.company || 'default'
    const settings = notificationSettings.get(userCompany) || {
      email: { enabled: false },
      slack: { enabled: false },
      webhook: { enabled: false },
      sms: { enabled: false },
      escalation: { enabled: false }
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()
    const userCompany = session.user.company || 'default'
    const currentSettings = notificationSettings.get(userCompany) || {}

    // Merge updates with current settings
    const updatedSettings = {
      ...currentSettings,
      ...updates,
      updatedAt: new Date(),
      updatedBy: session.user.email
    }

    notificationSettings.set(userCompany, updatedSettings)

    return NextResponse.json({
      success: true,
      message: 'Notification settings updated successfully',
      settings: updatedSettings
    })
  } catch (error) {
    console.error('Error updating notification settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Test notification endpoint
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { channel, severity } = await request.json()

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel is required for test notification' },
        { status: 400 }
      )
    }

    const userCompany = session.user.company || 'default'
    const settings = notificationSettings.get(userCompany) || {}

    // Simulate sending test notification
    const testMessage = {
      title: 'Test Alert Notification',
      message: `This is a test ${severity || 'medium'} severity alert from AI Credit Tracker`,
      timestamp: new Date().toISOString(),
      severity: severity || 'medium',
      type: 'test',
      triggeredBy: session.user.email
    }

    // Log the test notification (in production, actually send it)
    console.log(`Test notification sent via ${channel}:`, testMessage)

    // Simulate different response scenarios
    let success = true
    let details = ''

    switch (channel) {
      case 'email':
        details = `Test email sent to ${settings.email?.address || session.user.email}`
        break
      case 'slack':
        success = !!settings.slack?.webhookUrl
        details = success 
          ? `Test message sent to ${settings.slack?.channel || '#alerts'}`
          : 'Slack webhook URL not configured'
        break
      case 'webhook':
        success = !!settings.webhook?.url
        details = success
          ? `Test webhook sent to ${settings.webhook?.url}`
          : 'Webhook URL not configured'
        break
      case 'sms':
        success = !!settings.sms?.phoneNumber && settings.sms?.enabled
        details = success
          ? `Test SMS sent to ${settings.sms?.phoneNumber}`
          : 'SMS not configured or disabled'
        break
      default:
        success = false
        details = 'Invalid notification channel'
    }

    return NextResponse.json({
      success,
      message: success ? 'Test notification sent successfully' : 'Test notification failed',
      details,
      testMessage: success ? testMessage : undefined
    })
  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}