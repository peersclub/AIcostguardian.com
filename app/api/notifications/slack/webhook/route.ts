import { NextRequest, NextResponse } from 'next/server'
import { slackNotificationService } from '@/lib/services/slack-notifications.service'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface SlackWebhookPayload {
  eventType: string
  data: {
    userId?: string
    organizationId?: string
    title: string
    message: string
    context?: any
    metadata?: any
  }
}

/**
 * Slack Webhook Handler
 * Receives events from throughout the application and sends them to Slack
 */
export async function POST(req: NextRequest) {
  try {
    const body: SlackWebhookPayload = await req.json()
    const { eventType, data } = body

    // Validate input
    if (!eventType || !data || !data.title || !data.message) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType, data.title, data.message' },
        { status: 400 }
      )
    }

    // Send notification to Slack
    const success = await slackNotificationService.sendEventNotification(eventType, data)

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Slack notification sent for ${eventType}`
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send Slack notification' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Slack webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Get Slack notification configuration
 */
export async function GET(req: NextRequest) {
  try {
    const eventConfigs = slackNotificationService.getEventConfigs()

    return NextResponse.json({
      success: true,
      eventConfigs,
      totalEvents: Object.keys(eventConfigs).length,
      enabledEvents: Object.values(eventConfigs).filter(config => config.enabled).length
    })

  } catch (error) {
    console.error('Error getting Slack config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Update Slack notification configuration
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventType, config } = body

    if (!eventType || !config) {
      return NextResponse.json(
        { error: 'Missing eventType or config' },
        { status: 400 }
      )
    }

    slackNotificationService.updateEventConfig(eventType, config)

    return NextResponse.json({
      success: true,
      message: `Updated configuration for ${eventType}`
    })

  } catch (error) {
    console.error('Error updating Slack config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}