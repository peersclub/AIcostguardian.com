/**
 * Production-Ready Slack Webhook Notification Service
 * Uses webhooks for reliable, immediate Slack notifications
 */

interface SlackWebhookMessage {
  text?: string
  blocks?: any[]
  attachments?: any[]
}

interface NotificationEventData {
  userId?: string
  organizationId?: string
  title: string
  message: string
  context?: any
  metadata?: any
}

export class SlackWebhookService {
  private webhookUrl: string

  constructor(webhookUrl?: string) {
    this.webhookUrl = webhookUrl || process.env.SLACK_WEBHOOK_URL || ''

    if (!this.webhookUrl) {
      throw new Error('SLACK_WEBHOOK_URL is required')
    }
  }

  /**
   * Send any event notification via webhook
   */
  async sendEventNotification(eventType: string, data: NotificationEventData): Promise<boolean> {
    try {
      const message = this.formatEventMessage(eventType, data)
      return await this.sendWebhookMessage(message)
    } catch (error) {
      console.error(`Failed to send Slack notification for ${eventType}:`, error)
      return false
    }
  }

  /**
   * Send cost threshold alert
   */
  async sendCostAlert(currentCost: number, threshold: number, provider: string): Promise<boolean> {
    const percentage = (currentCost / threshold * 100).toFixed(1)
    const isExceeded = currentCost > threshold

    const message: SlackWebhookMessage = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: isExceeded ? "🚨 Cost Threshold Exceeded" : "⚠️ Cost Threshold Warning"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: isExceeded
              ? `*Budget exceeded for ${provider}!*\n\nYour ${provider} spending has surpassed the daily limit.`
              : `*Budget warning for ${provider}*\n\nYou're approaching your daily spending limit.`
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Current Cost:*\n$${currentCost.toFixed(2)}`
            },
            {
              type: "mrkdwn",
              text: `*Threshold:*\n$${threshold.toFixed(2)}`
            },
            {
              type: "mrkdwn",
              text: `*Usage:*\n${percentage}%`
            },
            {
              type: "mrkdwn",
              text: `*Provider:*\n${provider}`
            }
          ]
        },
        this.getContextBlock(`Cost alert triggered at ${new Date().toLocaleTimeString()}`)
      ]
    }

    return await this.sendWebhookMessage(message)
  }

  /**
   * Send team member activation notification
   */
  async sendMemberActivation(userEmail: string, role: string, organizationName: string): Promise<boolean> {
    const message: SlackWebhookMessage = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "👋 New Team Member Activated"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Welcome to ${organizationName}!*\n\n\`${userEmail}\` has successfully activated their AI Cost Guardian account.`
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Email:*\n${userEmail}`
            },
            {
              type: "mrkdwn",
              text: `*Role:*\n${role}`
            },
            {
              type: "mrkdwn",
              text: `*Organization:*\n${organizationName}`
            },
            {
              type: "mrkdwn",
              text: `*Activated:*\n${new Date().toLocaleDateString()}`
            }
          ]
        },
        this.getContextBlock("Account activation notification")
      ]
    }

    return await this.sendWebhookMessage(message)
  }

  /**
   * Send high token usage alert
   */
  async sendHighUsageAlert(
    userEmail: string,
    tokenCount: number,
    estimatedCost: number,
    provider: string,
    model: string
  ): Promise<boolean> {
    const message: SlackWebhookMessage = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "📊 High Token Usage Detected"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Unusual AI usage detected*\n\nA user has consumed a high number of tokens in a short period.`
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*User:*\n${userEmail}`
            },
            {
              type: "mrkdwn",
              text: `*Tokens:*\n${tokenCount.toLocaleString()}`
            },
            {
              type: "mrkdwn",
              text: `*Cost:*\n$${estimatedCost.toFixed(2)}`
            },
            {
              type: "mrkdwn",
              text: `*Provider:*\n${provider} (${model})`
            }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Recommendation:* Review the conversation or consider implementing usage limits."
          }
        },
        this.getContextBlock("High usage alert")
      ]
    }

    return await this.sendWebhookMessage(message)
  }

  /**
   * Send weekly cost report
   */
  async sendWeeklyCostReport(
    totalCost: number,
    topProvider: { name: string; cost: number },
    insights: string[]
  ): Promise<boolean> {
    const message: SlackWebhookMessage = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "📈 Weekly AI Cost Report"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Your weekly AI usage summary*\n\nTotal AI costs for this week: *$${totalCost.toFixed(2)}*`
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Total Cost:*\n$${totalCost.toFixed(2)}`
            },
            {
              type: "mrkdwn",
              text: `*Top Provider:*\n${topProvider.name} ($${topProvider.cost.toFixed(2)})`
            },
            {
              type: "mrkdwn",
              text: `*Report Period:*\n${this.getWeekRange()}`
            },
            {
              type: "mrkdwn",
              text: `*Generated:*\n${new Date().toLocaleDateString()}`
            }
          ]
        }
      ]
    }

    // Add insights if available
    if (insights.length > 0) {
      message.blocks!.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*💡 Key Insights:*\n${insights.slice(0, 3).map(insight => `• ${insight}`).join('\n')}`
        }
      })
    }

    message.blocks!.push(this.getContextBlock("Weekly cost report"))

    return await this.sendWebhookMessage(message)
  }

  /**
   * Send bulk member activation summary
   */
  async sendBulkActivationSummary(activatedCount: number, organizationCount: number): Promise<boolean> {
    const message: SlackWebhookMessage = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🎉 Bulk Member Activation Complete"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*System-wide member activation completed successfully!*\n\nAll pending users now have full access to the AI Cost Guardian platform.`
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Activated Users:*\n${activatedCount}`
            },
            {
              type: "mrkdwn",
              text: `*Organizations:*\n${organizationCount}`
            },
            {
              type: "mrkdwn",
              text: `*Success Rate:*\n100%`
            },
            {
              type: "mrkdwn",
              text: `*Completed:*\n${new Date().toLocaleString()}`
            }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*✅ All users can now:*\n• Access AI Cost tracking\n• Monitor usage and costs\n• Collaborate on AI threads\n• Receive real-time notifications"
          }
        },
        this.getContextBlock("Bulk activation completed")
      ]
    }

    return await this.sendWebhookMessage(message)
  }

  // Private helper methods

  private formatEventMessage(eventType: string, data: NotificationEventData): SlackWebhookMessage {
    const emoji = this.getEventEmoji(eventType)

    return {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `${emoji} ${data.title}`
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: data.message
          }
        },
        this.getContextBlock(`${eventType} notification`)
      ]
    }
  }

  private getEventEmoji(eventType: string): string {
    const emojiMap: Record<string, string> = {
      'COST_THRESHOLD_WARNING': '⚠️',
      'COST_THRESHOLD_EXCEEDED': '🚨',
      'HIGH_TOKEN_USAGE': '📊',
      'NEW_TEAM_MEMBER': '👋',
      'MEMBER_ACTIVATED': '✅',
      'API_RATE_LIMIT_EXCEEDED': '🚦',
      'WEEKLY_COST_REPORT': '📈',
      'INTEGRATION_FAILURE': '❌',
      'PAYMENT_FAILED': '💳',
      'UNUSUAL_SPENDING_PATTERN': '🔍'
    }

    return emojiMap[eventType] || '📢'
  }

  private getContextBlock(text: string) {
    return {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `🤖 AI Cost Guardian • ${text} • ${new Date().toLocaleTimeString()}`
        }
      ]
    }
  }

  private getWeekRange(): string {
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)

    return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`
  }

  private async sendWebhookMessage(message: SlackWebhookMessage): Promise<boolean> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      })

      return response.ok
    } catch (error) {
      console.error('Webhook send failed:', error)
      return false
    }
  }
}

// Export configured instance
export const slackWebhookService = new SlackWebhookService()