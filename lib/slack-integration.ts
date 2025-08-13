import prisma from '@/lib/prisma'

interface SlackMessage {
  text: string
  blocks?: any[]
  attachments?: any[]
}

interface SlackConfig {
  webhookUrl?: string
  appId?: string
  clientId?: string
  clientSecret?: string
  signingSecret?: string
  appToken?: string
}

// Get Slack configuration for an organization
export async function getSlackConfig(organizationId: string): Promise<SlackConfig | null> {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { domain: true }
    })

    if (!org) return null

    // Map organization domains to Slack configs
    const configs: Record<string, SlackConfig> = {
      'assetworks.ai': {
        webhookUrl: process.env.SLACK_ASSETWORKS_WEBHOOK_URL,
        appId: process.env.SLACK_ASSETWORKS_APP_ID,
        clientId: process.env.SLACK_ASSETWORKS_CLIENT_ID,
        clientSecret: process.env.SLACK_ASSETWORKS_CLIENT_SECRET,
        signingSecret: process.env.SLACK_ASSETWORKS_SIGNING_SECRET,
        appToken: process.env.SLACK_ASSETWORKS_APP_TOKEN
      },
      'aicostguardian.com': {
        webhookUrl: process.env.SLACK_AICOSTGUARDIAN_WEBHOOK_URL,
        appId: process.env.SLACK_AICOSTGUARDIAN_APP_ID,
        clientId: process.env.SLACK_AICOSTGUARDIAN_CLIENT_ID,
        clientSecret: process.env.SLACK_AICOSTGUARDIAN_CLIENT_SECRET,
        signingSecret: process.env.SLACK_AICOSTGUARDIAN_SIGNING_SECRET,
        appToken: process.env.SLACK_AICOSTGUARDIAN_APP_TOKEN
      }
    }

    return configs[org.domain] || null
  } catch (error) {
    console.error('Error getting Slack config:', error)
    return null
  }
}

// Send a message to Slack
export async function sendSlackNotification(
  organizationId: string,
  message: SlackMessage
): Promise<boolean> {
  if (process.env.ENABLE_SLACK_NOTIFICATIONS !== 'true') {
    console.log('Slack notifications disabled')
    return false
  }

  try {
    const config = await getSlackConfig(organizationId)
    
    if (!config?.webhookUrl || config.webhookUrl.includes('YOUR_WEBHOOK_URL')) {
      console.log('Slack webhook not configured for organization')
      return false
    }

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    })

    if (!response.ok) {
      console.error('Failed to send Slack notification:', response.statusText)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending Slack notification:', error)
    return false
  }
}

// Format member invitation notification
export function formatInvitationMessage(
  inviterName: string,
  inviteeEmail: string,
  role: string,
  organizationName: string
): SlackMessage {
  return {
    text: `New team member invited to ${organizationName}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '👥 New Team Member Invitation'
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Invited by:*\n${inviterName}`
          },
          {
            type: 'mrkdwn',
            text: `*Email:*\n${inviteeEmail}`
          },
          {
            type: 'mrkdwn',
            text: `*Role:*\n${role}`
          },
          {
            type: 'mrkdwn',
            text: `*Organization:*\n${organizationName}`
          }
        ]
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Invitation sent at ${new Date().toLocaleString()}`
          }
        ]
      }
    ]
  }
}

// Format bulk upload notification
export function formatBulkUploadMessage(
  uploaderName: string,
  processedCount: number,
  errorCount: number,
  organizationName: string
): SlackMessage {
  const emoji = errorCount > 0 ? '⚠️' : '✅'
  
  return {
    text: `Bulk member upload completed for ${organizationName}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} Bulk Member Upload Complete`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Uploaded by:*\n${uploaderName}`
          },
          {
            type: 'mrkdwn',
            text: `*Organization:*\n${organizationName}`
          },
          {
            type: 'mrkdwn',
            text: `*Processed:*\n${processedCount} members`
          },
          {
            type: 'mrkdwn',
            text: `*Errors:*\n${errorCount}`
          }
        ]
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Completed at ${new Date().toLocaleString()}`
          }
        ]
      }
    ]
  }
}

// Format usage alert notification
export function formatUsageAlertMessage(
  userName: string,
  usage: number,
  limit: number,
  percentage: number,
  organizationName: string
): SlackMessage {
  const emoji = percentage >= 90 ? '🚨' : percentage >= 75 ? '⚠️' : 'ℹ️'
  
  return {
    text: `Usage alert for ${userName} in ${organizationName}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} Usage Alert`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${userName}* has reached ${percentage}% of their usage limit`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Current Usage:*\n$${usage.toFixed(2)}`
          },
          {
            type: 'mrkdwn',
            text: `*Limit:*\n$${limit.toFixed(2)}`
          },
          {
            type: 'mrkdwn',
            text: `*Organization:*\n${organizationName}`
          },
          {
            type: 'mrkdwn',
            text: `*Percentage Used:*\n${percentage}%`
          }
        ]
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Alert triggered at ${new Date().toLocaleString()}`
          }
        ]
      }
    ]
  }
}

// Format organization created notification
export function formatOrgCreatedMessage(
  organizationName: string,
  domain: string,
  subscription: string,
  createdBy: string
): SlackMessage {
  return {
    text: `New organization created: ${organizationName}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🏢 New Organization Created'
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Name:*\n${organizationName}`
          },
          {
            type: 'mrkdwn',
            text: `*Domain:*\n${domain}`
          },
          {
            type: 'mrkdwn',
            text: `*Subscription:*\n${subscription}`
          },
          {
            type: 'mrkdwn',
            text: `*Created by:*\n${createdBy}`
          }
        ]
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Created at ${new Date().toLocaleString()}`
          }
        ]
      }
    ]
  }
}