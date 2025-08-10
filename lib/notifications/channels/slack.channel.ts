import {
  NotificationChannel,
  NotificationData,
  DeliveryResult,
  TemplateRenderResult,
  SlackChannelConfig,
  SlackBlock,
  SlackAttachment,
  ChannelError
} from '../types'

/**
 * Slack notification channel with Block Kit support
 * Supports rich messaging, interactive components, and thread replies
 */
export class SlackNotificationChannel implements NotificationChannel {
  readonly type = 'SLACK' as const
  readonly name = 'Slack'

  private config: {
    botToken: string
    signingSecret?: string
    defaultChannel?: string
    username?: string
    iconEmoji?: string
    iconUrl?: string
    baseUrl: string
  }

  constructor(config: any) {
    this.config = {
      baseUrl: 'https://slack.com/api',
      username: 'AI Cost Guardian',
      iconEmoji: ':robot_face:',
      ...config
    }

    if (!this.config.botToken) {
      throw new Error('Slack bot token is required')
    }
  }

  /**
   * Send Slack notification
   */
  async send(
    notification: NotificationData,
    channelConfig: SlackChannelConfig,
    template?: TemplateRenderResult
  ): Promise<DeliveryResult> {
    const startTime = Date.now()

    try {
      // Validate inputs
      this.validateInputs(notification, channelConfig)

      // Prepare message data
      const messageData = this.prepareMessageData(
        notification,
        channelConfig,
        template
      )

      // Send message
      const response = await this.sendSlackMessage(messageData)

      const latency = Date.now() - startTime

      if (response.ok) {
        // Log successful delivery
        await this.logDelivery(notification, channelConfig, response)

        return {
          success: true,
          channel: 'SLACK',
          destination: this.getDestination(channelConfig),
          messageId: response.ts,
          latency,
          attempts: 1,
          metadata: {
            channel: response.channel,
            timestamp: response.ts,
            threadTs: response.thread_ts
          }
        }
      } else {
        throw new ChannelError(
          `Slack API error: ${response.error}`,
          'SLACK',
          undefined,
          this.isRecoverableError(response.error)
        )
      }
    } catch (error) {
      const latency = Date.now() - startTime
      console.error('Slack send failed:', error)

      return {
        success: false,
        channel: 'SLACK',
        destination: this.getDestination(channelConfig),
        error: (error as Error).message,
        latency,
        attempts: 1,
        metadata: {
          notificationId: notification.id
        }
      }
    }
  }

  /**
   * Validate Slack configuration
   */
  validate(channelConfig: SlackChannelConfig): boolean {
    try {
      const destination = this.getDestination(channelConfig)
      
      if (!destination) {
        throw new Error('Slack channel or user ID is required')
      }

      if (!this.config.botToken) {
        throw new Error('Slack bot token is required')
      }

      return true
    } catch (error) {
      console.error('Slack channel validation failed:', error)
      return false
    }
  }

  /**
   * Test Slack configuration
   */
  async test(channelConfig: SlackChannelConfig): Promise<boolean> {
    try {
      const testNotification: NotificationData = {
        userId: 'test-user',
        organizationId: 'test-org',
        type: 'COST_THRESHOLD_WARNING',
        priority: 'LOW',
        title: 'Test Message',
        message: 'This is a test message to verify your Slack configuration.'
      }

      const result = await this.send(testNotification, channelConfig)
      return result.success
    } catch (error) {
      console.error('Slack test failed:', error)
      return false
    }
  }

  /**
   * Handle Slack interactive components (buttons, selects, etc.)
   */
  async handleInteraction(payload: any): Promise<any> {
    try {
      const { type, action_id, value, user, channel, message } = payload

      switch (action_id) {
        case 'acknowledge_alert':
          return this.acknowledgeAlert(payload)
        
        case 'view_dashboard':
          return this.openDashboard(payload)
        
        case 'snooze_alert':
          return this.snoozeAlert(payload)
        
        default:
          console.warn(`Unknown Slack action: ${action_id}`)
          return { response_type: 'ephemeral', text: 'Unknown action' }
      }
    } catch (error) {
      console.error('Slack interaction handling failed:', error)
      return { 
        response_type: 'ephemeral', 
        text: 'Sorry, something went wrong processing your request.' 
      }
    }
  }

  // Private methods

  private validateInputs(
    notification: NotificationData,
    channelConfig: SlackChannelConfig
  ): void {
    if (!notification.userId) {
      throw new ChannelError('User ID is required', 'SLACK')
    }

    const destination = this.getDestination(channelConfig)
    if (!destination) {
      throw new ChannelError('Slack channel or user is required', 'SLACK')
    }

    if (!notification.title && !notification.message) {
      throw new ChannelError('Message content is required', 'SLACK')
    }
  }

  private prepareMessageData(
    notification: NotificationData,
    channelConfig: SlackChannelConfig,
    template?: TemplateRenderResult
  ): any {
    const destination = this.getDestination(channelConfig)
    const text = template?.body || notification.message
    
    // Use blocks if available, otherwise fall back to simple text
    const blocks = channelConfig.blocks || this.generateDefaultBlocks(notification)
    const attachments = channelConfig.attachments || this.generateDefaultAttachments(notification)

    return {
      channel: destination,
      text: text.substring(0, 150), // Fallback text for notifications
      blocks,
      attachments,
      username: channelConfig.username || this.config.username,
      icon_emoji: channelConfig.iconEmoji || this.config.iconEmoji,
      icon_url: channelConfig.iconUrl || this.config.iconUrl,
      thread_ts: channelConfig.threadTs,
      unfurl_links: channelConfig.unfurlLinks ?? false,
      unfurl_media: channelConfig.unfurlMedia ?? false,
      metadata: {
        event_type: 'ai_cost_notification',
        event_payload: {
          notification_id: notification.id,
          type: notification.type,
          priority: notification.priority,
          user_id: notification.userId,
          organization_id: notification.organizationId
        }
      }
    }
  }

  private generateDefaultBlocks(notification: NotificationData): SlackBlock[] {
    const blocks: SlackBlock[] = []

    // Header block
    blocks.push({
      type: 'header',
      text: {
        type: 'plain_text',
        text: this.getNotificationEmoji(notification.type) + ' ' + notification.title
      }
    })

    // Main content
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: this.formatMessageForSlack(notification.message)
      }
    })

    // Context information
    if (notification.data?.context) {
      const context = notification.data.context
      const contextElements = []

      if (context.currentCost) {
        contextElements.push(`💰 Cost: $${context.currentCost.toFixed(2)}`)
      }
      if (context.provider) {
        contextElements.push(`🤖 Provider: ${context.provider}`)
      }
      if (context.timeframe) {
        contextElements.push(`⏱️ Period: ${context.timeframe}`)
      }

      if (contextElements.length > 0) {
        blocks.push({
          type: 'context',
          elements: contextElements.map(text => ({
            type: 'mrkdwn',
            text
          }))
        })
      }
    }

    // Action buttons for high priority notifications
    if (notification.priority === 'HIGH' || notification.priority === 'CRITICAL') {
      blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '👀 View Dashboard'
            },
            value: notification.id,
            action_id: 'view_dashboard',
            url: 'https://dashboard.example.com/costs'
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '✅ Acknowledge'
            },
            value: notification.id,
            action_id: 'acknowledge_alert',
            style: 'primary'
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '⏰ Snooze 1h'
            },
            value: `${notification.id}:3600`,
            action_id: 'snooze_alert'
          }
        ]
      })
    }

    // Divider
    blocks.push({
      type: 'divider'
    })

    return blocks
  }

  private generateDefaultAttachments(notification: NotificationData): SlackAttachment[] {
    const color = this.getAttachmentColor(notification.priority)
    
    const attachment: SlackAttachment = {
      color,
      fields: []
    }

    // Add relevant fields based on notification data
    if (notification.data?.context) {
      const context = notification.data.context

      if (context.currentCost && context.threshold) {
        attachment.fields?.push({
          title: 'Current Spend',
          value: `$${context.currentCost.toFixed(2)}`,
          short: true
        })
        attachment.fields?.push({
          title: 'Threshold',
          value: `$${context.threshold.toFixed(2)}`,
          short: true
        })
      }

      if (context.provider) {
        attachment.fields?.push({
          title: 'Provider',
          value: context.provider,
          short: true
        })
      }

      if (context.model) {
        attachment.fields?.push({
          title: 'Model',
          value: context.model,
          short: true
        })
      }
    }

    // Add timestamp
    attachment.fields?.push({
      title: 'Time',
      value: new Date().toLocaleString(),
      short: true
    })

    return attachment.fields?.length ? [attachment] : []
  }

  private async sendSlackMessage(messageData: any): Promise<any> {
    const response = await this.slackApiCall('chat.postMessage', messageData)
    return response
  }

  private async slackApiCall(method: string, data: any): Promise<any> {
    const url = `${this.config.baseUrl}/${method}`
    
    try {
      // Simulate HTTP request to Slack API
      const response = await this.simulateHttpRequest(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.status === 200) {
        return response.data
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.error(`Slack API call failed (${method}):`, error)
      throw error
    }
  }

  private getDestination(channelConfig: SlackChannelConfig): string {
    return channelConfig.channel || 
           (channelConfig as any).destination || 
           this.config.defaultChannel || 
           ''
  }

  private getNotificationEmoji(type: string): string {
    const emojiMap: Record<string, string> = {
      'COST_THRESHOLD_WARNING': '⚠️',
      'COST_THRESHOLD_CRITICAL': '🚨',
      'COST_THRESHOLD_EXCEEDED': '💸',
      'DAILY_COST_SPIKE': '📈',
      'UNUSUAL_SPENDING_PATTERN': '🔍',
      'API_RATE_LIMIT_WARNING': '🚦',
      'API_RATE_LIMIT_EXCEEDED': '🛑',
      'USAGE_QUOTA_WARNING': '📊',
      'USAGE_QUOTA_EXCEEDED': '🔴',
      'MODEL_DEPRECATION': '📋',
      'API_KEY_EXPIRING': '🔑',
      'API_KEY_EXPIRED': '🚫',
      'PROVIDER_OUTAGE': '🔧',
      'INTEGRATION_FAILURE': '❌',
      'PAYMENT_FAILED': '💳',
      'SUBSCRIPTION_EXPIRING': '📅',
      'NEW_TEAM_MEMBER': '👋',
      'MEMBER_EXCEEDED_LIMIT': '⚖️',
      'SUSPICIOUS_ACTIVITY': '🔒',
      'WEEKLY_COST_REPORT': '📈',
      'MONTHLY_COST_REPORT': '📊',
      'OPTIMIZATION_RECOMMENDATIONS': '💡'
    }
    
    return emojiMap[type] || '📢'
  }

  private getAttachmentColor(priority: string): string {
    const colorMap: Record<string, string> = {
      'LOW': '#36a64f',      // Green
      'MEDIUM': '#ff9500',   // Orange
      'HIGH': '#ff4444',     // Red
      'CRITICAL': '#ff0000'  // Bright Red
    }
    
    return colorMap[priority] || '#cccccc'
  }

  private formatMessageForSlack(message: string): string {
    // Convert common markdown to Slack mrkdwn
    return message
      .replace(/\*\*(.*?)\*\*/g, '*$1*')  // Bold
      .replace(/\*(.*?)\*/g, '_$1_')      // Italic
      .replace(/`(.*?)`/g, '`$1`')        // Code (same)
      .replace(/\n/g, '\n')               // Preserve newlines
      .substring(0, 3000)                 // Slack has a 3000 char limit
  }

  private isRecoverableError(error: string): boolean {
    const nonRecoverableErrors = [
      'invalid_auth',
      'account_inactive',
      'token_revoked',
      'no_permission',
      'channel_not_found',
      'user_not_found'
    ]
    
    return !nonRecoverableErrors.includes(error)
  }

  private async acknowledgeAlert(payload: any): Promise<any> {
    const notificationId = payload.actions[0].value
    
    // Update the original message to show acknowledgment
    await this.slackApiCall('chat.update', {
      channel: payload.channel.id,
      ts: payload.message.ts,
      text: payload.message.text,
      blocks: [
        ...payload.message.blocks,
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `✅ Acknowledged by <@${payload.user.id}> at ${new Date().toLocaleTimeString()}`
          }
        }
      ]
    })

    // Here you would mark the notification as acknowledged in your database
    // await notificationService.acknowledge(notificationId, payload.user.id)

    return {
      response_type: 'ephemeral',
      text: 'Alert acknowledged successfully!'
    }
  }

  private async openDashboard(payload: any): Promise<any> {
    // This action is handled by the URL in the button
    return {
      response_type: 'ephemeral',
      text: 'Opening dashboard...'
    }
  }

  private async snoozeAlert(payload: any): Promise<any> {
    const [notificationId, durationStr] = payload.actions[0].value.split(':')
    const duration = parseInt(durationStr) * 1000 // Convert to milliseconds
    
    // Here you would snooze the alert in your notification system
    // await notificationService.snooze(notificationId, duration)

    const snoozeUntil = new Date(Date.now() + duration)
    
    return {
      response_type: 'ephemeral',
      text: `Alert snoozed until ${snoozeUntil.toLocaleTimeString()}`
    }
  }

  private async logDelivery(
    notification: NotificationData,
    channelConfig: SlackChannelConfig,
    response: any
  ): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      notificationId: notification.id,
      channel: 'SLACK',
      destination: this.getDestination(channelConfig),
      success: true,
      messageId: response.ts,
      slackChannel: response.channel,
      userId: notification.userId,
      organizationId: notification.organizationId,
      type: notification.type
    }

    console.log('Slack delivery logged:', logEntry)
  }

  private async simulateHttpRequest(url: string, options: any): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100))
    
    // Simulate occasional failures
    if (Math.random() < 0.03) { // 3% failure rate
      throw new Error('Network timeout')
    }

    // Simulate successful Slack response
    const messageId = `${Date.now()}.${Math.random().toString(36).substr(2, 6)}`
    
    return {
      status: 200,
      data: {
        ok: true,
        channel: 'C1234567890',
        ts: messageId,
        message: {
          type: 'message',
          subtype: 'bot_message',
          text: JSON.parse(options.body).text,
          ts: messageId,
          username: JSON.parse(options.body).username,
          bot_id: 'B1234567890'
        }
      }
    }
  }
}

/**
 * Factory function to create Slack channel with config
 */
export function createSlackChannel(config: any): SlackNotificationChannel {
  return new SlackNotificationChannel(config)
}

/**
 * Slack Block Kit templates for common notification types
 */
export const SLACK_BLOCK_TEMPLATES = {
  COST_ALERT: (notification: NotificationData) => [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '💰 Cost Alert'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${notification.title}*\n${notification.message}`
      }
    }
  ],

  WEEKLY_REPORT: (notification: NotificationData) => [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📊 Weekly Cost Report'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: notification.message
      }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Full Report'
          },
          url: 'https://dashboard.example.com/reports',
          action_id: 'view_report'
        }
      ]
    }
  ]
}