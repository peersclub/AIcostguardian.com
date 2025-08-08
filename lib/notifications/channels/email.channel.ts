import {
  NotificationChannel,
  NotificationData,
  DeliveryResult,
  TemplateRenderResult,
  EmailChannelConfig,
  EmailAttachment,
  ChannelError
} from '../types'

/**
 * Email notification channel with multiple provider support
 * Supports SendGrid (primary) and AWS SES (fallback)
 */
export class EmailNotificationChannel implements NotificationChannel {
  readonly type = 'EMAIL' as const
  readonly name = 'Email'

  private config: {
    sendgrid?: {
      apiKey: string
      fromEmail: string
      fromName: string
      webhookEnabled?: boolean
    }
    awsSes?: {
      region: string
      accessKeyId: string
      secretAccessKey: string
      fromEmail: string
      fromName: string
    }
    defaultProvider: 'sendgrid' | 'aws-ses'
    trackOpens: boolean
    trackClicks: boolean
  }

  constructor(config: any) {
    this.config = {
      defaultProvider: 'sendgrid',
      trackOpens: true,
      trackClicks: true,
      ...config
    }

    // Log warning if no provider configured but don't throw
    if (!this.config.sendgrid && !this.config.awsSes) {
      console.warn('Email channel: No email provider configured. Email notifications will be skipped.')
    }
  }

  /**
   * Send email notification
   */
  async send(
    notification: NotificationData,
    channelConfig: EmailChannelConfig,
    template?: TemplateRenderResult
  ): Promise<DeliveryResult> {
    const startTime = Date.now()

    // Skip if no provider configured
    if (!this.config.sendgrid && !this.config.awsSes) {
      return {
        success: false,
        channel: 'EMAIL',
        error: 'No email provider configured',
        timestamp: new Date(),
        metadata: {
          skipped: true,
          reason: 'No email provider configured'
        }
      }
    }

    try {
      // Validate inputs
      this.validateInputs(notification, channelConfig, template)

      // Prepare email data
      const emailData = await this.prepareEmailData(
        notification,
        channelConfig,
        template
      )

      // Try primary provider first, then fallback
      let result: DeliveryResult
      let lastError: Error | null = null

      const providers = this.getProviderOrder()
      
      for (const provider of providers) {
        try {
          result = await this.sendWithProvider(provider, emailData, channelConfig)
          
          // If successful, log and return
          await this.logDelivery(notification, result, emailData)
          return result
        } catch (error) {
          lastError = error as Error
          console.warn(`Email provider ${provider} failed:`, error.message)
          
          // Continue to next provider if available
          if (provider === providers[providers.length - 1]) {
            // This was the last provider, throw error
            break
          }
        }
      }

      // All providers failed
      throw lastError || new Error('All email providers failed')

    } catch (error) {
      const latency = Date.now() - startTime
      console.error('Email send failed:', error)

      return {
        success: false,
        channel: 'EMAIL',
        destination: this.getDestination(channelConfig),
        error: error.message,
        latency,
        attempts: 1,
        metadata: {
          provider: 'unknown',
          notificationId: notification.id
        }
      }
    }
  }

  /**
   * Validate email configuration
   */
  validate(channelConfig: EmailChannelConfig): boolean {
    try {
      const destination = this.getDestination(channelConfig)
      
      if (!destination) {
        throw new Error('Email destination is required')
      }

      if (!this.isValidEmail(destination)) {
        throw new Error('Invalid email address format')
      }

      return true
    } catch (error) {
      console.error('Email channel validation failed:', error)
      return false
    }
  }

  /**
   * Test email configuration
   */
  async test(channelConfig: EmailChannelConfig): Promise<boolean> {
    try {
      const testNotification: NotificationData = {
        userId: 'test-user',
        organizationId: 'test-org',
        type: 'COST_THRESHOLD_WARNING',
        priority: 'LOW',
        title: 'Test Email',
        message: 'This is a test email to verify your configuration.'
      }

      const testTemplate: TemplateRenderResult = {
        subject: 'Test Email from AI Cost Guardian',
        body: 'This is a test email to verify your email notification configuration is working correctly.',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Test Email</h2>
            <p>This is a test email to verify your email notification configuration is working correctly.</p>
            <p style="color: #666; font-size: 12px;">Sent by AI Cost Guardian</p>
          </div>
        `
      }

      const result = await this.send(testNotification, channelConfig, testTemplate)
      return result.success
    } catch (error) {
      console.error('Email test failed:', error)
      return false
    }
  }

  // Private methods

  private validateInputs(
    notification: NotificationData,
    channelConfig: EmailChannelConfig,
    template?: TemplateRenderResult
  ): void {
    if (!notification.userId) {
      throw new ChannelError('User ID is required', 'EMAIL')
    }

    const destination = this.getDestination(channelConfig)
    if (!destination || !this.isValidEmail(destination)) {
      throw new ChannelError('Valid email destination is required', 'EMAIL')
    }

    if (!template?.subject && !notification.title) {
      throw new ChannelError('Email subject is required', 'EMAIL')
    }

    if (!template?.body && !notification.message) {
      throw new ChannelError('Email body is required', 'EMAIL')
    }
  }

  private async prepareEmailData(
    notification: NotificationData,
    channelConfig: EmailChannelConfig,
    template?: TemplateRenderResult
  ) {
    const destination = this.getDestination(channelConfig)
    
    return {
      to: destination,
      subject: template?.subject || notification.title,
      text: template?.body || notification.message,
      html: template?.html,
      from: channelConfig.from || this.getDefaultFromAddress(),
      replyTo: channelConfig.replyTo,
      attachments: this.formatAttachments(template?.attachments || channelConfig.attachments),
      headers: {
        'X-Notification-ID': notification.id || '',
        'X-Notification-Type': notification.type,
        'X-Organization-ID': notification.organizationId,
        ...channelConfig.headers
      },
      customArgs: {
        notificationId: notification.id,
        userId: notification.userId,
        organizationId: notification.organizationId,
        type: notification.type
      },
      trackingSettings: {
        clickTracking: { enable: this.config.trackClicks },
        openTracking: { enable: this.config.trackOpens }
      }
    }
  }

  private getProviderOrder(): Array<'sendgrid' | 'aws-ses'> {
    const providers: Array<'sendgrid' | 'aws-ses'> = []
    
    // Primary provider first
    if (this.config.defaultProvider === 'sendgrid' && this.config.sendgrid) {
      providers.push('sendgrid')
    } else if (this.config.defaultProvider === 'aws-ses' && this.config.awsSes) {
      providers.push('aws-ses')
    }

    // Add fallback provider
    if (this.config.sendgrid && !providers.includes('sendgrid')) {
      providers.push('sendgrid')
    }
    if (this.config.awsSes && !providers.includes('aws-ses')) {
      providers.push('aws-ses')
    }

    return providers
  }

  private async sendWithProvider(
    provider: 'sendgrid' | 'aws-ses',
    emailData: any,
    channelConfig: EmailChannelConfig
  ): Promise<DeliveryResult> {
    const startTime = Date.now()

    switch (provider) {
      case 'sendgrid':
        return this.sendWithSendGrid(emailData, channelConfig, startTime)
      case 'aws-ses':
        return this.sendWithAwsSes(emailData, channelConfig, startTime)
      default:
        throw new ChannelError(`Unsupported email provider: ${provider}`, 'EMAIL')
    }
  }

  private async sendWithSendGrid(
    emailData: any,
    channelConfig: EmailChannelConfig,
    startTime: number
  ): Promise<DeliveryResult> {
    if (!this.config.sendgrid) {
      throw new ChannelError('SendGrid not configured', 'EMAIL')
    }

    try {
      // This would use the actual SendGrid SDK
      // For now, simulate the API call
      const response = await this.simulateHttpRequest('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.sendgrid.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: {
            email: emailData.from,
            name: this.config.sendgrid.fromName
          },
          personalizations: [{
            to: [{ email: emailData.to }],
            subject: emailData.subject,
            custom_args: emailData.customArgs
          }],
          content: [
            { type: 'text/plain', value: emailData.text },
            ...(emailData.html ? [{ type: 'text/html', value: emailData.html }] : [])
          ],
          attachments: emailData.attachments,
          headers: emailData.headers,
          tracking_settings: emailData.trackingSettings
        })
      })

      const latency = Date.now() - startTime

      if (response.status >= 200 && response.status < 300) {
        const messageId = response.headers?.['x-message-id'] || `sg_${Date.now()}`
        
        return {
          success: true,
          channel: 'EMAIL',
          destination: emailData.to,
          messageId,
          latency,
          attempts: 1,
          metadata: {
            provider: 'sendgrid',
            statusCode: response.status,
            responseHeaders: response.headers
          }
        }
      } else {
        throw new ChannelError(
          `SendGrid API error: ${response.status}`,
          'EMAIL',
          response.status,
          response.status < 500 // 4xx errors are not recoverable
        )
      }
    } catch (error) {
      if (error instanceof ChannelError) {
        throw error
      }
      throw new ChannelError(`SendGrid send failed: ${error.message}`, 'EMAIL')
    }
  }

  private async sendWithAwsSes(
    emailData: any,
    channelConfig: EmailChannelConfig,
    startTime: number
  ): Promise<DeliveryResult> {
    if (!this.config.awsSes) {
      throw new ChannelError('AWS SES not configured', 'EMAIL')
    }

    try {
      // This would use the AWS SDK
      // For now, simulate the API call
      const response = await this.simulateHttpRequest(
        `https://email.${this.config.awsSes.region}.amazonaws.com/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-amz-json-1.0',
            'X-Amz-Target': 'AWSSimpleEmailService.SendEmail'
          },
          body: JSON.stringify({
            Source: `${this.config.awsSes.fromName} <${emailData.from}>`,
            Destination: {
              ToAddresses: [emailData.to]
            },
            Message: {
              Subject: { Data: emailData.subject },
              Body: {
                Text: { Data: emailData.text },
                ...(emailData.html ? { Html: { Data: emailData.html } } : {})
              }
            }
          })
        }
      )

      const latency = Date.now() - startTime

      if (response.status === 200) {
        const messageId = `ses_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        return {
          success: true,
          channel: 'EMAIL',
          destination: emailData.to,
          messageId,
          latency,
          attempts: 1,
          metadata: {
            provider: 'aws-ses',
            statusCode: response.status
          }
        }
      } else {
        throw new ChannelError(
          `AWS SES API error: ${response.status}`,
          'EMAIL',
          response.status,
          response.status < 500
        )
      }
    } catch (error) {
      if (error instanceof ChannelError) {
        throw error
      }
      throw new ChannelError(`AWS SES send failed: ${error.message}`, 'EMAIL')
    }
  }

  private getDestination(channelConfig: EmailChannelConfig): string {
    // The destination would typically be passed in the channelConfig
    // For now, we'll assume it's in the channelConfig directly
    return (channelConfig as any).destination || (channelConfig as any).to || ''
  }

  private getDefaultFromAddress(): string {
    if (this.config.defaultProvider === 'sendgrid' && this.config.sendgrid) {
      return this.config.sendgrid.fromEmail
    }
    if (this.config.awsSes) {
      return this.config.awsSes.fromEmail
    }
    return 'noreply@ai-cost-guardian.com'
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private formatAttachments(attachments?: EmailAttachment[]): any[] {
    if (!attachments?.length) return []

    return attachments.map(attachment => ({
      content: typeof attachment.content === 'string' 
        ? attachment.content 
        : attachment.content.toString('base64'),
      filename: attachment.filename,
      type: attachment.contentType || 'application/octet-stream',
      disposition: attachment.disposition || 'attachment'
    }))
  }

  private async logDelivery(
    notification: NotificationData,
    result: DeliveryResult,
    emailData: any
  ): Promise<void> {
    // This would integrate with your logging/analytics system
    const logEntry = {
      timestamp: new Date().toISOString(),
      notificationId: notification.id,
      channel: 'EMAIL',
      destination: emailData.to,
      subject: emailData.subject,
      success: result.success,
      messageId: result.messageId,
      latency: result.latency,
      provider: result.metadata?.provider,
      userId: notification.userId,
      organizationId: notification.organizationId,
      type: notification.type
    }

    console.log('Email delivery logged:', logEntry)
    
    // In production, this would store to your analytics database
    // await analytics.track('email_sent', logEntry)
  }

  private async simulateHttpRequest(url: string, options: any): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 200))
    
    // Simulate occasional failures
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error('Network timeout')
    }

    // Simulate successful response
    return {
      status: 200,
      headers: {
        'x-message-id': `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      },
      data: { success: true }
    }
  }
}

/**
 * Factory function to create email channel with config
 */
export function createEmailChannel(config: any): EmailNotificationChannel {
  return new EmailNotificationChannel(config)
}

/**
 * Default email templates for different notification types
 */
export const EMAIL_TEMPLATES = {
  COST_THRESHOLD_WARNING: {
    subject: 'Cost Alert: {{organization.name}} approaching spend limit',
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cost Alert</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background-color: #3b82f6; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Cost Alert</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
            <p>Hello {{user.name}},</p>
            
            <p>Your AI usage costs are approaching the configured threshold for {{organization.name}}.</p>
            
            <!-- Alert Box -->
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 20px; margin: 20px 0;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <span style="font-size: 20px; margin-right: 10px;">⚠️</span>
                    <strong style="color: #92400e;">Threshold Alert</strong>
                </div>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Current spend:</td>
                        <td style="padding: 8px 0; text-align: right;">{{formatCurrency context.currentCost}}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Threshold:</td>
                        <td style="padding: 8px 0; text-align: right;">{{formatCurrency context.threshold}}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Percentage used:</td>
                        <td style="padding: 8px 0; text-align: right;">{{formatPercent (divide context.currentCost context.threshold)}}</td>
                    </tr>
                    <tr style="border-top: 1px solid #d1d5db;">
                        <td style="padding: 8px 0; font-weight: bold;">Provider:</td>
                        <td style="padding: 8px 0; text-align: right;">{{context.provider}}</td>
                    </tr>
                </table>
            </div>
            
            <p><strong>Time period:</strong> {{context.timeframe}}</p>
            
            <p>Please review your usage and consider adjusting your limits if needed.</p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://dashboard.example.com/costs" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Dashboard</a>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">{{branding.footerText}}</p>
            <p style="margin: 10px 0 0 0;">
                <a href="{{branding.unsubscribeUrl}}" style="color: #6b7280;">Unsubscribe</a> |
                <a href="https://dashboard.example.com/settings" style="color: #6b7280;">Update Preferences</a>
            </p>
        </div>
    </div>
</body>
</html>
    `.trim()
  }
}