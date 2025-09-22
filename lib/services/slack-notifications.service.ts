import { SlackNotificationChannel } from '../notifications/channels/slack.channel'
import { NotificationData } from '../notifications/types'
import prisma from '@/lib/prisma'

interface SlackConfig {
  botToken: string
  defaultChannel: string
  signingSecret?: string
}

interface SlackEventConfig {
  channel?: string
  enabled: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  template?: string
}

/**
 * Enhanced Slack Notification Service for AI Cost Guardian
 * Handles all active events with customizable templates and channels
 */
export class SlackNotificationService {
  private slackChannel: SlackNotificationChannel
  private config: SlackConfig
  private eventConfigs: Record<string, SlackEventConfig>

  constructor(config: SlackConfig) {
    this.config = config
    this.slackChannel = new SlackNotificationChannel(config)

    // Default event configurations
    this.eventConfigs = {
      // Cost Management Events
      'COST_THRESHOLD_WARNING': {
        enabled: true,
        priority: 'MEDIUM',
        channel: '#cost-alerts'
      },
      'COST_THRESHOLD_CRITICAL': {
        enabled: true,
        priority: 'HIGH',
        channel: '#cost-alerts'
      },
      'COST_THRESHOLD_EXCEEDED': {
        enabled: true,
        priority: 'CRITICAL',
        channel: '#cost-alerts'
      },
      'DAILY_COST_SPIKE': {
        enabled: true,
        priority: 'HIGH',
        channel: '#cost-alerts'
      },
      'UNUSUAL_SPENDING_PATTERN': {
        enabled: true,
        priority: 'MEDIUM',
        channel: '#analytics'
      },

      // API & Usage Events
      'API_RATE_LIMIT_WARNING': {
        enabled: true,
        priority: 'MEDIUM',
        channel: '#system-alerts'
      },
      'API_RATE_LIMIT_EXCEEDED': {
        enabled: true,
        priority: 'HIGH',
        channel: '#system-alerts'
      },
      'USAGE_QUOTA_WARNING': {
        enabled: true,
        priority: 'MEDIUM',
        channel: '#usage-alerts'
      },
      'USAGE_QUOTA_EXCEEDED': {
        enabled: true,
        priority: 'HIGH',
        channel: '#usage-alerts'
      },

      // System Events
      'MODEL_DEPRECATION': {
        enabled: true,
        priority: 'MEDIUM',
        channel: '#system-updates'
      },
      'API_KEY_EXPIRING': {
        enabled: true,
        priority: 'MEDIUM',
        channel: '#system-alerts'
      },
      'API_KEY_EXPIRED': {
        enabled: true,
        priority: 'HIGH',
        channel: '#system-alerts'
      },
      'PROVIDER_OUTAGE': {
        enabled: true,
        priority: 'CRITICAL',
        channel: '#system-alerts'
      },
      'INTEGRATION_FAILURE': {
        enabled: true,
        priority: 'HIGH',
        channel: '#system-alerts'
      },

      // Billing Events
      'PAYMENT_FAILED': {
        enabled: true,
        priority: 'CRITICAL',
        channel: '#billing-alerts'
      },
      'SUBSCRIPTION_EXPIRING': {
        enabled: true,
        priority: 'HIGH',
        channel: '#billing-alerts'
      },

      // Team Events
      'NEW_TEAM_MEMBER': {
        enabled: true,
        priority: 'LOW',
        channel: '#team-updates'
      },
      'MEMBER_ACTIVATED': {
        enabled: true,
        priority: 'LOW',
        channel: '#team-updates'
      },
      'MEMBER_EXCEEDED_LIMIT': {
        enabled: true,
        priority: 'MEDIUM',
        channel: '#team-alerts'
      },
      'SUSPICIOUS_ACTIVITY': {
        enabled: true,
        priority: 'CRITICAL',
        channel: '#security-alerts'
      },

      // AI Chat Events
      'AI_CHAT_STARTED': {
        enabled: true,
        priority: 'LOW',
        channel: '#ai-activity'
      },
      'AI_RESPONSE_ERROR': {
        enabled: true,
        priority: 'MEDIUM',
        channel: '#ai-errors'
      },
      'HIGH_TOKEN_USAGE': {
        enabled: true,
        priority: 'MEDIUM',
        channel: '#usage-alerts'
      },

      // Messaging Events
      'TEAM_CHAT_MESSAGE': {
        enabled: false, // Too frequent for Slack
        priority: 'LOW',
        channel: '#chat-activity'
      },
      'THREAD_SHARED': {
        enabled: true,
        priority: 'LOW',
        channel: '#collaboration'
      },
      'COLLABORATION_INVITE': {
        enabled: true,
        priority: 'LOW',
        channel: '#collaboration'
      },

      // Reports
      'WEEKLY_COST_REPORT': {
        enabled: true,
        priority: 'LOW',
        channel: '#reports'
      },
      'MONTHLY_COST_REPORT': {
        enabled: true,
        priority: 'MEDIUM',
        channel: '#reports'
      },
      'OPTIMIZATION_RECOMMENDATIONS': {
        enabled: true,
        priority: 'MEDIUM',
        channel: '#optimization'
      }
    }
  }

  /**
   * Send notification for any active event
   */
  async sendEventNotification(
    eventType: string,
    data: {
      userId?: string
      organizationId?: string
      title: string
      message: string
      context?: any
      metadata?: any
    }
  ): Promise<boolean> {
    try {
      const eventConfig = this.eventConfigs[eventType]

      if (!eventConfig || !eventConfig.enabled) {
        console.log(`Slack notification disabled for event: ${eventType}`)
        return false
      }

      // Get organization info if available
      let organization = null
      if (data.organizationId) {
        organization = await prisma.organization.findUnique({
          where: { id: data.organizationId }
        })
      }

      // Create notification data
      const notification: NotificationData = {
        id: `slack-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        userId: data.userId || 'system',
        organizationId: data.organizationId || 'system',
        type: eventType as any,
        priority: eventConfig.priority,
        title: data.title,
        message: data.message,
        data: {
          context: data.context,
          metadata: data.metadata,
          organization: organization?.name,
          timestamp: new Date().toISOString()
        }
      }

      // Send to Slack
      const result = await this.slackChannel.send(notification, {
        channel: eventConfig.channel || this.config.defaultChannel
      })

      if (result.success) {
        console.log(`✅ Slack notification sent for ${eventType}`)

        // Log to database
        await this.logNotification(eventType, notification, result)
        return true
      } else {
        console.error(`❌ Failed to send Slack notification for ${eventType}:`, result.error)
        return false
      }

    } catch (error) {
      console.error(`Error sending Slack notification for ${eventType}:`, error)
      return false
    }
  }

  /**
   * Send bulk activation notification
   */
  async sendBulkActivationNotification(activatedCount: number): Promise<void> {
    await this.sendEventNotification('BULK_MEMBER_ACTIVATION', {
      title: '👥 Bulk Member Activation Completed',
      message: `Successfully activated ${activatedCount} pending members. All users now have access to the AI Cost Guardian platform.`,
      context: {
        activatedCount,
        timestamp: new Date().toISOString(),
        action: 'bulk_activation'
      }
    })
  }

  /**
   * Send cost spike alert
   */
  async sendCostSpikeAlert(
    organizationId: string,
    currentCost: number,
    previousCost: number,
    provider: string
  ): Promise<void> {
    const increasePercent = ((currentCost - previousCost) / previousCost * 100).toFixed(1)

    await this.sendEventNotification('DAILY_COST_SPIKE', {
      organizationId,
      title: '📈 Daily Cost Spike Detected',
      message: `Unusual spending increase detected for ${provider}. Costs increased by ${increasePercent}% from $${previousCost.toFixed(2)} to $${currentCost.toFixed(2)}.`,
      context: {
        currentCost,
        previousCost,
        increasePercent: parseFloat(increasePercent),
        provider,
        timeframe: '24h'
      }
    })
  }

  /**
   * Send API key expiration warning
   */
  async sendApiKeyExpirationWarning(
    userId: string,
    organizationId: string,
    provider: string,
    daysUntilExpiration: number
  ): Promise<void> {
    await this.sendEventNotification('API_KEY_EXPIRING', {
      userId,
      organizationId,
      title: '🔑 API Key Expiring Soon',
      message: `Your ${provider} API key will expire in ${daysUntilExpiration} days. Please update your credentials to avoid service disruption.`,
      context: {
        provider,
        daysUntilExpiration,
        action: 'update_api_key'
      }
    })
  }

  /**
   * Send new member welcome notification
   */
  async sendNewMemberNotification(
    userId: string,
    organizationId: string,
    userEmail: string,
    role: string
  ): Promise<void> {
    await this.sendEventNotification('NEW_TEAM_MEMBER', {
      userId,
      organizationId,
      title: '👋 New Team Member Joined',
      message: `${userEmail} has joined the team as ${role}. Welcome to AI Cost Guardian!`,
      context: {
        userEmail,
        role,
        joinedAt: new Date().toISOString()
      }
    })
  }

  /**
   * Send AI chat activity notification (for high usage)
   */
  async sendHighUsageAlert(
    userId: string,
    organizationId: string,
    tokenCount: number,
    estimatedCost: number,
    provider: string
  ): Promise<void> {
    await this.sendEventNotification('HIGH_TOKEN_USAGE', {
      userId,
      organizationId,
      title: '⚠️ High Token Usage Detected',
      message: `High AI usage detected: ${tokenCount.toLocaleString()} tokens used with ${provider}, estimated cost: $${estimatedCost.toFixed(2)}`,
      context: {
        tokenCount,
        estimatedCost,
        provider,
        timeframe: 'current session'
      }
    })
  }

  /**
   * Send thread collaboration notification
   */
  async sendCollaborationNotification(
    threadId: string,
    inviterEmail: string,
    inviteeEmail: string,
    organizationId: string
  ): Promise<void> {
    await this.sendEventNotification('COLLABORATION_INVITE', {
      organizationId,
      title: '🤝 Thread Collaboration Invite',
      message: `${inviterEmail} has invited ${inviteeEmail} to collaborate on an AI thread.`,
      context: {
        threadId,
        inviterEmail,
        inviteeEmail,
        action: 'collaboration_invite'
      }
    })
  }

  /**
   * Send weekly cost report
   */
  async sendWeeklyCostReport(organizationId: string, reportData: any): Promise<void> {
    const { totalCost, costByProvider, topUsers, insights } = reportData

    await this.sendEventNotification('WEEKLY_COST_REPORT', {
      organizationId,
      title: '📊 Weekly Cost Report',
      message: `Weekly AI costs: $${totalCost.toFixed(2)}. Top provider: ${costByProvider[0]?.provider || 'N/A'} ($${costByProvider[0]?.cost?.toFixed(2) || '0'})`,
      context: {
        totalCost,
        costByProvider,
        topUsers,
        insights,
        reportPeriod: 'weekly'
      }
    })
  }

  /**
   * Update event configuration
   */
  updateEventConfig(eventType: string, config: Partial<SlackEventConfig>): void {
    if (this.eventConfigs[eventType]) {
      this.eventConfigs[eventType] = { ...this.eventConfigs[eventType], ...config }
    }
  }

  /**
   * Enable/disable specific event notifications
   */
  toggleEventNotification(eventType: string, enabled: boolean): void {
    if (this.eventConfigs[eventType]) {
      this.eventConfigs[eventType].enabled = enabled
    }
  }

  /**
   * Get current event configurations
   */
  getEventConfigs(): Record<string, SlackEventConfig> {
    return { ...this.eventConfigs }
  }

  // Private methods

  private async logNotification(
    eventType: string,
    notification: NotificationData,
    result: any
  ): Promise<void> {
    try {
      // Log to notification table if it exists
      await prisma.notification.create({
        data: {
          userId: notification.userId === 'system' ? 'system' : notification.userId,
          organizationId: notification.organizationId === 'system' ? 'system' : notification.organizationId,
          type: eventType as any, // Cast to enum type
          title: notification.title,
          message: notification.message,
          priority: notification.priority as any,
          channels: JSON.stringify(['SLACK']), // JSON field for channels
          status: 'DELIVERED' as any, // Mark as delivered since Slack succeeded
          deliveredAt: new Date(),
          data: JSON.stringify({
            slackMessageId: result.messageId,
            slackChannel: result.metadata?.channel,
            eventType,
            sentAt: new Date().toISOString()
          })
        }
      })
    } catch (error) {
      console.warn('Could not log Slack notification to database:', error)
    }
  }
}

// Factory function to create service with default config
export function createSlackNotificationService(): SlackNotificationService {
  const config: SlackConfig = {
    botToken: process.env.SLACK_BOT_TOKEN || 'demo-bot-token',
    defaultChannel: process.env.SLACK_DEFAULT_CHANNEL || '#ai-cost-guardian',
    signingSecret: process.env.SLACK_SIGNING_SECRET
  }

  return new SlackNotificationService(config)
}

// Global instance
export const slackNotificationService = createSlackNotificationService()