import {
  NotificationChannel,
  NotificationData,
  DeliveryResult,
  TemplateRenderResult,
  WebhookChannelConfig,
  ChannelError
} from '../types'
import crypto from 'crypto'

/**
 * Webhook notification channel for external integrations
 * Supports authentication, retries, and custom payloads
 */
export class WebhookNotificationChannel implements NotificationChannel {
  readonly type = 'WEBHOOK' as const
  readonly name = 'Webhook'

  private defaultTimeout = 10000 // 10 seconds
  private maxRetries = 3

  constructor() {}

  /**
   * Send webhook notification
   */
  async send(
    notification: NotificationData,
    channelConfig: WebhookChannelConfig,
    template?: TemplateRenderResult
  ): Promise<DeliveryResult> {
    const startTime = Date.now()

    try {
      // Validate inputs
      this.validateInputs(notification, channelConfig)

      // Prepare webhook payload
      const payload = this.preparePayload(notification, channelConfig, template)

      // Send webhook with retries
      const response = await this.sendWithRetries(channelConfig, payload)

      const latency = Date.now() - startTime

      // Log successful delivery
      await this.logDelivery(notification, channelConfig, response)

      return {
        success: true,
        channel: 'WEBHOOK',
        destination: this.getDestination(channelConfig),
        messageId: response.headers?.['x-webhook-id'] || response.requestId,
        latency,
        attempts: 1,
        metadata: {
          statusCode: response.status,
          responseHeaders: response.headers,
          responseBody: response.data,
          url: channelConfig.url
        }
      }
    } catch (error) {
      const latency = Date.now() - startTime
      console.error('Webhook send failed:', error)

      return {
        success: false,
        channel: 'WEBHOOK',
        destination: this.getDestination(channelConfig),
        error: (error as any).message,
        latency,
        attempts: (error as any).attempts || 1,
        metadata: {
          statusCode: (error as any).statusCode,
          url: channelConfig.url,
          lastError: (error as any).lastError
        }
      }
    }
  }

  /**
   * Validate webhook configuration
   */
  validate(channelConfig: WebhookChannelConfig): boolean {
    try {
      if (!channelConfig.url) {
        throw new Error('Webhook URL is required')
      }

      const url = new URL(channelConfig.url)
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Webhook URL must use HTTP or HTTPS protocol')
      }

      // Validate authentication if provided
      if (channelConfig.authentication) {
        this.validateAuthentication(channelConfig.authentication)
      }

      // Validate HTTP method
      const method = channelConfig.method || 'POST'
      if (!['POST', 'PUT', 'PATCH'].includes(method)) {
        throw new Error('Webhook method must be POST, PUT, or PATCH')
      }

      return true
    } catch (error) {
      console.error('Webhook channel validation failed:', error)
      return false
    }
  }

  /**
   * Test webhook configuration
   */
  async test(channelConfig: WebhookChannelConfig): Promise<boolean> {
    try {
      const testNotification: NotificationData = {
        userId: 'test-user',
        organizationId: 'test-org',
        type: 'COST_THRESHOLD_WARNING',
        priority: 'LOW',
        title: 'Test Webhook',
        message: 'This is a test webhook notification to verify your configuration.',
        data: {
          test: true,
          timestamp: new Date().toISOString()
        }
      }

      const result = await this.send(testNotification, channelConfig)
      return result.success
    } catch (error) {
      console.error('Webhook test failed:', error)
      return false
    }
  }

  // Private methods

  private validateInputs(
    notification: NotificationData,
    channelConfig: WebhookChannelConfig
  ): void {
    if (!notification.userId) {
      throw new ChannelError('User ID is required', 'WEBHOOK')
    }

    if (!channelConfig.url) {
      throw new ChannelError('Webhook URL is required', 'WEBHOOK')
    }

    try {
      new URL(channelConfig.url)
    } catch {
      throw new ChannelError('Invalid webhook URL format', 'WEBHOOK')
    }
  }

  private validateAuthentication(auth: any): void {
    if (!auth.type) {
      throw new Error('Authentication type is required')
    }

    switch (auth.type) {
      case 'bearer':
        if (!auth.token) {
          throw new Error('Bearer token is required')
        }
        break
      case 'basic':
        if (!auth.username || !auth.password) {
          throw new Error('Basic auth requires username and password')
        }
        break
      case 'apikey':
        if (!auth.token || !auth.header) {
          throw new Error('API key auth requires token and header name')
        }
        break
      default:
        throw new Error(`Unsupported authentication type: ${auth.type}`)
    }
  }

  private preparePayload(
    notification: NotificationData,
    channelConfig: WebhookChannelConfig,
    template?: TemplateRenderResult
  ): any {
    const payloadType = channelConfig.payload || 'full'

    if (payloadType === 'minimal') {
      return {
        id: notification.id,
        type: notification.type,
        priority: notification.priority,
        title: template?.subject || notification.title,
        message: template?.body || notification.message,
        timestamp: new Date().toISOString()
      }
    }

    // Full payload
    return {
      id: notification.id,
      ruleId: notification.ruleId,
      userId: notification.userId,
      organizationId: notification.organizationId,
      type: notification.type,
      priority: notification.priority,
      title: template?.subject || notification.title,
      message: template?.body || notification.message,
      data: notification.data,
      groupId: notification.groupId,
      parentId: notification.parentId,
      createdAt: new Date().toISOString(),
      expiresAt: notification.expiresAt?.toISOString(),
      template: template ? {
        subject: template.subject,
        body: template.body,
        html: template.html,
        metadata: template.metadata
      } : undefined,
      webhook: {
        source: 'ai-cost-guardian',
        version: '1.0',
        channel: 'webhook'
      }
    }
  }

  private async sendWithRetries(
    channelConfig: WebhookChannelConfig,
    payload: any
  ): Promise<any> {
    const maxRetries = channelConfig.retries || this.maxRetries
    const timeout = channelConfig.timeout || this.defaultTimeout
    
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.makeHttpRequest(
          channelConfig,
          payload,
          timeout
        )

        // Consider 2xx and 3xx as success
        if (response.status >= 200 && response.status < 400) {
          return response
        }

        // Client errors (4xx) are not retryable unless specifically configured
        if (response.status >= 400 && response.status < 500) {
          throw new ChannelError(
            `Webhook client error: ${response.status} ${response.statusText}`,
            'WEBHOOK',
            response.status,
            false // Not recoverable
          )
        }

        // Server errors (5xx) are retryable
        throw new ChannelError(
          `Webhook server error: ${response.status} ${response.statusText}`,
          'WEBHOOK',
          response.status,
          true // Recoverable
        )
      } catch (error) {
        lastError = error as Error
        
        // Don't retry non-recoverable errors
        if (error instanceof ChannelError && !error.recoverable) {
          throw error
        }

        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break
        }

        // Exponential backoff delay
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000)
        console.log(`Webhook attempt ${attempt} failed, retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    // All retries exhausted
    const error = new ChannelError(
      `Webhook failed after ${maxRetries} attempts: ${lastError?.message}`,
      'WEBHOOK'
    ) as any
    error.attempts = maxRetries
    error.lastError = lastError?.message
    throw error
  }

  private async makeHttpRequest(
    channelConfig: WebhookChannelConfig,
    payload: any,
    timeout: number
  ): Promise<any> {
    const method = channelConfig.method || 'POST'
    const headers = this.prepareHeaders(channelConfig)
    
    const requestConfig = {
      method,
      headers,
      body: JSON.stringify(payload),
      timeout
    }

    console.log(`Sending webhook ${method} to ${channelConfig.url}`)
    
    // In a real implementation, you'd use fetch or axios
    // For now, simulate the HTTP request
    return this.simulateHttpRequest(channelConfig.url, requestConfig)
  }

  private prepareHeaders(channelConfig: WebhookChannelConfig): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'AI-Cost-Guardian-Webhook/1.0',
      'X-Webhook-Source': 'ai-cost-guardian',
      'X-Webhook-Timestamp': new Date().toISOString(),
      ...channelConfig.headers
    }

    // Add authentication headers
    if (channelConfig.authentication) {
      const auth = channelConfig.authentication
      
      switch (auth.type) {
        case 'bearer':
          headers['Authorization'] = `Bearer ${auth.token}`
          break
        case 'basic':
          const credentials = Buffer.from(`${auth.username}:${auth.password}`).toString('base64')
          headers['Authorization'] = `Basic ${credentials}`
          break
        case 'apikey':
          headers[auth.header!] = auth.token!
          break
      }
    }

    return headers
  }

  private getDestination(channelConfig: WebhookChannelConfig): string {
    try {
      const url = new URL(channelConfig.url)
      return `${url.protocol}//${url.host}${url.pathname}`
    } catch {
      return channelConfig.url
    }
  }

  private async logDelivery(
    notification: NotificationData,
    channelConfig: WebhookChannelConfig,
    response: any
  ): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      notificationId: notification.id,
      channel: 'WEBHOOK',
      destination: this.getDestination(channelConfig),
      method: channelConfig.method || 'POST',
      success: true,
      statusCode: response.status,
      latency: response.latency,
      userId: notification.userId,
      organizationId: notification.organizationId,
      type: notification.type
    }

    console.log('Webhook delivery logged:', logEntry)
  }

  private async simulateHttpRequest(url: string, config: any): Promise<any> {
    // Simulate network delay
    const delay = Math.random() * 2000 + 500 // 0.5-2.5 seconds
    await new Promise(resolve => setTimeout(resolve, delay))
    
    // Simulate occasional failures
    const failureRate = 0.1 // 10% failure rate
    if (Math.random() < failureRate) {
      const isServerError = Math.random() < 0.7 // 70% of failures are server errors
      const status = isServerError ? 503 : 400
      
      throw {
        status,
        statusText: isServerError ? 'Service Unavailable' : 'Bad Request',
        message: `HTTP ${status}`
      }
    }

    // Simulate successful response
    const responseData = {
      received: true,
      timestamp: new Date().toISOString(),
      webhook_id: `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    return {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
        'x-webhook-id': responseData.webhook_id
      },
      data: responseData,
      latency: delay,
      requestId: `req_${Date.now()}`
    }
  }
}

/**
 * Factory function to create webhook channel
 */
export function createWebhookChannel(): WebhookNotificationChannel {
  return new WebhookNotificationChannel()
}

/**
 * Webhook payload schemas for different integration types
 */
export const WebhookPayloadSchemas = {
  /**
   * Generic webhook payload
   */
  generic: (notification: NotificationData) => ({
    id: notification.id,
    type: notification.type,
    priority: notification.priority,
    title: notification.title,
    message: notification.message,
    timestamp: new Date().toISOString(),
    data: notification.data
  }),

  /**
   * Slack-compatible webhook payload
   */
  slack: (notification: NotificationData) => ({
    text: notification.title,
    attachments: [{
      color: notification.priority === 'CRITICAL' ? 'danger' : 
             notification.priority === 'HIGH' ? 'warning' : 'good',
      title: notification.title,
      text: notification.message,
      fields: [
        {
          title: 'Type',
          value: notification.type,
          short: true
        },
        {
          title: 'Priority',
          value: notification.priority,
          short: true
        },
        {
          title: 'Time',
          value: new Date().toISOString(),
          short: true
        }
      ]
    }]
  }),

  /**
   * Discord-compatible webhook payload
   */
  discord: (notification: NotificationData) => ({
    username: 'AI Cost Guardian',
    avatar_url: 'https://example.com/bot-avatar.png',
    embeds: [{
      title: notification.title,
      description: notification.message,
      color: notification.priority === 'CRITICAL' ? 16711680 : // Red
             notification.priority === 'HIGH' ? 16753920 :    // Orange
             notification.priority === 'MEDIUM' ? 16776960 :  // Yellow
             65280, // Green
      fields: [
        {
          name: 'Type',
          value: notification.type,
          inline: true
        },
        {
          name: 'Priority',
          value: notification.priority,
          inline: true
        }
      ],
      timestamp: new Date().toISOString()
    }]
  }),

  /**
   * Microsoft Teams-compatible webhook payload
   */
  teams: (notification: NotificationData) => ({
    '@type': 'MessageCard',
    '@context': 'https://schema.org/extensions',
    summary: notification.title,
    themeColor: notification.priority === 'CRITICAL' ? 'FF0000' :
               notification.priority === 'HIGH' ? 'FF8C00' :
               notification.priority === 'MEDIUM' ? 'FFD700' :
               '00FF00',
    sections: [{
      activityTitle: notification.title,
      activitySubtitle: `AI Cost Guardian - ${notification.type}`,
      activityImage: 'https://example.com/icon.png',
      text: notification.message,
      facts: [
        {
          name: 'Priority',
          value: notification.priority
        },
        {
          name: 'Time',
          value: new Date().toISOString()
        }
      ]
    }],
    potentialAction: [{
      '@type': 'OpenUri',
      name: 'View Dashboard',
      targets: [{
        os: 'default',
        uri: 'https://dashboard.example.com'
      }]
    }]
  }),

  /**
   * PagerDuty-compatible webhook payload
   */
  pagerduty: (notification: NotificationData) => ({
    routing_key: 'YOUR_ROUTING_KEY',
    event_action: 'trigger',
    payload: {
      summary: notification.title,
      source: 'ai-cost-guardian',
      severity: notification.priority === 'CRITICAL' ? 'critical' :
               notification.priority === 'HIGH' ? 'error' :
               notification.priority === 'MEDIUM' ? 'warning' :
               'info',
      component: 'cost-monitoring',
      group: 'ai-usage',
      class: notification.type,
      custom_details: {
        message: notification.message,
        notification_id: notification.id,
        organization_id: notification.organizationId,
        ...notification.data
      }
    }
  })
}

/**
 * Webhook security utilities
 */
export const WebhookSecurity = {
  /**
   * Generate webhook signature for verification
   */
  generateSignature(payload: string, secret: string): string {
    const crypto = require('crypto')
    return crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex')
  },

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret)
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  },

  /**
   * Rate limit webhook endpoints
   */
  rateLimitKey(url: string): string {
    const crypto = require('crypto')
    return crypto.createHash('sha256').update(url).digest('hex').substring(0, 16)
  }
}