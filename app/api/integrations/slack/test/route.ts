import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { SlackWebhookService } from '@/lib/services/slack-webhook-service'

export const dynamic = 'force-dynamic'

interface TestRequest {
  type: 'webhook' | 'bot'
  config: {
    webhookUrl?: string
    botToken?: string
    defaultChannel?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, config }: TestRequest = await request.json()

    if (type === 'webhook') {
      return await testWebhook(config.webhookUrl)
    } else if (type === 'bot') {
      return await testBot(config.botToken, config.defaultChannel)
    } else {
      return NextResponse.json({ error: 'Invalid test type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error testing Slack integration:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function testWebhook(webhookUrl?: string) {
  if (!webhookUrl) {
    return NextResponse.json({
      success: false,
      error: 'Webhook URL is required'
    }, { status: 400 })
  }

  try {
    // Use the webhook service to send a test message
    const webhookService = new SlackWebhookService(webhookUrl)

    const success = await webhookService.sendEventNotification('INTEGRATION_TEST', {
      title: '🧪 AI Cost Guardian Integration Test',
      message: '*Success!* Your webhook integration is working perfectly.\\n\\nThis test message confirms that AI Cost Guardian can send notifications to your Slack workspace.',
      context: {
        testType: 'webhook',
        timestamp: new Date().toISOString(),
        status: 'operational'
      }
    })

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Test message sent successfully! Check your Slack workspace.'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to send test message. Please check your webhook URL.'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Webhook test error:', error)
    return NextResponse.json({
      success: false,
      error: `Webhook test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 400 })
  }
}

async function testBot(botToken?: string, defaultChannel?: string) {
  if (!botToken) {
    return NextResponse.json({
      success: false,
      error: 'Bot token is required'
    }, { status: 400 })
  }

  try {
    // Test bot token by making a simple API call
    const response = await fetch('https://slack.com/api/auth.test', {
      headers: {
        'Authorization': `Bearer ${botToken}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (!data.ok) {
      return NextResponse.json({
        success: false,
        error: `Bot token test failed: ${data.error}`
      }, { status: 400 })
    }

    // If bot token is valid, try to send a test message
    const channel = defaultChannel || '#general'
    const messageResponse = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${botToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel: channel,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "🧪 *AI Cost Guardian Bot Test*\\n\\n✅ Your bot integration is working! This message was sent using the Slack Web API."
            }
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `🤖 Bot: ${data.user} | 📍 Workspace: ${data.team} | 🕐 ${new Date().toLocaleTimeString()}`
              }
            ]
          }
        ]
      })
    })

    const messageData = await messageResponse.json()

    if (messageData.ok) {
      return NextResponse.json({
        success: true,
        message: `Bot test successful! Message sent to ${channel}`,
        botInfo: {
          user: data.user,
          team: data.team,
          url: data.url
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: `Failed to send test message: ${messageData.error}`
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Bot test error:', error)
    return NextResponse.json({
      success: false,
      error: `Bot test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 400 })
  }
}