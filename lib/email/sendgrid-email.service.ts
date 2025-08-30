/**
 * SendGrid Email Service
 * Handles all email sending operations using SendGrid API
 */

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  templateId?: string
  dynamicTemplateData?: Record<string, any>
  attachments?: Array<{
    content: string
    filename: string
    type?: string
    disposition?: string
  }>
  categories?: string[]
  customArgs?: Record<string, string>
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

class SendGridEmailService {
  private static instance: SendGridEmailService
  private apiKey: string | undefined
  private fromEmail: string
  private fromName: string
  private isConfigured: boolean = false

  private constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@aicostguardian.com'
    this.fromName = process.env.SENDGRID_FROM_NAME || 'AI Cost Guardian'
    
    if (this.apiKey) {
      this.isConfigured = true
      console.log('✅ SendGrid Email Service: Configured successfully')
    } else {
      console.warn('⚠️ SendGrid Email Service: Missing API key. Email sending disabled.')
    }
  }

  static getInstance(): SendGridEmailService {
    if (!SendGridEmailService.instance) {
      SendGridEmailService.instance = new SendGridEmailService()
    }
    return SendGridEmailService.instance
  }

  /**
   * Check if email service is configured
   */
  isReady(): boolean {
    return this.isConfigured
  }

  /**
   * Send an email using SendGrid API
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    if (!this.isConfigured) {
      console.warn('SendGrid not configured, skipping email send')
      return { 
        success: false, 
        error: 'Email service not configured' 
      }
    }

    try {
      const recipients = Array.isArray(options.to) ? options.to : [options.to]
      
      // Build the email payload
      const emailData: any = {
        personalizations: [{
          to: recipients.map(email => ({ email })),
          dynamic_template_data: options.dynamicTemplateData
        }],
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: options.subject,
        categories: options.categories || ['transactional'],
        custom_args: options.customArgs
      }

      // Add content or template
      if (options.templateId) {
        emailData.template_id = options.templateId
      } else {
        emailData.content = []
        if (options.text) {
          emailData.content.push({
            type: 'text/plain',
            value: options.text
          })
        }
        if (options.html) {
          emailData.content.push({
            type: 'text/html',
            value: options.html
          })
        }
      }

      // Add attachments if present
      if (options.attachments && options.attachments.length > 0) {
        emailData.attachments = options.attachments
      }

      // Send via SendGrid API
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      })

      if (response.ok) {
        const messageId = response.headers.get('x-message-id')
        console.log(`✅ Email sent successfully to ${recipients.join(', ')}`)
        return { 
          success: true, 
          messageId: messageId || undefined 
        }
      } else {
        const error = await response.text()
        console.error('SendGrid API error:', error)
        return { 
          success: false, 
          error: `SendGrid error: ${response.status}` 
        }
      }
    } catch (error) {
      console.error('Failed to send email:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(
    to: string,
    subject: string,
    title: string,
    message: string,
    actionUrl?: string,
    actionText?: string
  ): Promise<EmailResult> {
    const html = this.generateNotificationTemplate(title, message, actionUrl, actionText)
    
    return this.sendEmail({
      to,
      subject,
      html,
      text: `${title}\n\n${message}${actionUrl ? `\n\nView details: ${actionUrl}` : ''}`,
      categories: ['notification']
    })
  }

  /**
   * Send alert email
   */
  async sendAlertEmail(
    to: string,
    alertType: string,
    title: string,
    details: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<EmailResult> {
    const severityColors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626'
    }

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">⚠️ Alert: ${alertType}</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
          <div style="padding: 10px; background: ${severityColors[severity]}20; border-left: 4px solid ${severityColors[severity]}; margin-bottom: 20px;">
            <strong style="color: ${severityColors[severity]};">Severity: ${severity.toUpperCase()}</strong>
          </div>
          <h2 style="color: #1f2937; margin-top: 0;">${title}</h2>
          <div style="color: #6b7280; line-height: 1.6;">
            ${details}
          </div>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aicostguardian.com'}/alerts" 
               style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px;">
              View Alert Details
            </a>
          </div>
        </div>
      </div>
    `

    return this.sendEmail({
      to,
      subject: `[${severity.toUpperCase()}] ${alertType}: ${title}`,
      html,
      text: `${alertType}\n${title}\n\nSeverity: ${severity}\n\n${details}`,
      categories: ['alert', severity],
      customArgs: {
        alertType,
        severity
      }
    })
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, userName: string): Promise<EmailResult> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to AI Cost Guardian! 🎉</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937;">Hi ${userName},</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            Welcome aboard! We're excited to help you track and optimize your AI API costs.
          </p>
          <h3 style="color: #1f2937; margin-top: 30px;">Getting Started:</h3>
          <ol style="color: #6b7280; line-height: 1.8;">
            <li>Add your API keys in Settings</li>
            <li>Start tracking your AI usage</li>
            <li>Set up cost alerts and budgets</li>
            <li>Monitor your usage dashboard</li>
          </ol>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aicostguardian.com'}/dashboard" 
               style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px;">
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    `

    return this.sendEmail({
      to,
      subject: 'Welcome to AI Cost Guardian!',
      html,
      text: `Welcome ${userName}!\n\nWe're excited to help you track and optimize your AI API costs.\n\nGet started at: ${process.env.NEXT_PUBLIC_APP_URL || 'https://aicostguardian.com'}/dashboard`,
      categories: ['welcome', 'onboarding']
    })
  }

  /**
   * Send usage report email
   */
  async sendUsageReportEmail(
    to: string,
    period: string,
    totalCost: number,
    totalRequests: number,
    topProviders: Array<{ name: string; cost: number }>
  ): Promise<EmailResult> {
    const providerRows = topProviders
      .map(p => `<tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${p.name}</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${p.cost.toFixed(2)}</td></tr>`)
      .join('')

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">📊 Usage Report</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">${period}</p>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div style="text-align: center; padding: 20px; background: #f9fafb; border-radius: 8px;">
              <div style="color: #6b7280; font-size: 14px;">Total Cost</div>
              <div style="color: #1f2937; font-size: 28px; font-weight: bold;">$${totalCost.toFixed(2)}</div>
            </div>
            <div style="text-align: center; padding: 20px; background: #f9fafb; border-radius: 8px;">
              <div style="color: #6b7280; font-size: 14px;">Total Requests</div>
              <div style="color: #1f2937; font-size: 28px; font-weight: bold;">${totalRequests.toLocaleString()}</div>
            </div>
          </div>
          
          <h3 style="color: #1f2937;">Top Providers</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${providerRows}
          </table>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aicostguardian.com'}/usage" 
               style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px;">
              View Full Report
            </a>
          </div>
        </div>
      </div>
    `

    return this.sendEmail({
      to,
      subject: `Usage Report: ${period}`,
      html,
      text: `Usage Report for ${period}\n\nTotal Cost: $${totalCost.toFixed(2)}\nTotal Requests: ${totalRequests}\n\nView full report at: ${process.env.NEXT_PUBLIC_APP_URL || 'https://aicostguardian.com'}/usage`,
      categories: ['report', 'usage']
    })
  }

  /**
   * Generate notification email template
   */
  private generateNotificationTemplate(
    title: string,
    message: string,
    actionUrl?: string,
    actionText: string = 'View Details'
  ): string {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">${title}</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
          <div style="color: #6b7280; line-height: 1.6;">
            ${message}
          </div>
          ${actionUrl ? `
            <div style="margin-top: 30px; text-align: center;">
              <a href="${actionUrl}" 
                 style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px;">
                ${actionText}
              </a>
            </div>
          ` : ''}
        </div>
        <div style="padding: 20px; background: #f9fafb; text-align: center; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">AI Cost Guardian - Enterprise AI Usage Tracking</p>
          <p style="margin: 5px 0 0 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aicostguardian.com'}/settings/notifications" style="color: #667eea;">Manage Notifications</a>
          </p>
        </div>
      </div>
    `
  }

  /**
   * Validate email configuration
   */
  async validateConfiguration(): Promise<{ isValid: boolean; error?: string }> {
    if (!this.isConfigured) {
      return { isValid: false, error: 'SendGrid API key not configured' }
    }

    try {
      // Test the API key by fetching account info
      const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (response.ok) {
        return { isValid: true }
      } else {
        return { isValid: false, error: `Invalid API key: ${response.status}` }
      }
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Failed to validate SendGrid configuration' 
      }
    }
  }
}

// Export singleton instance
export const sendGridEmailService = SendGridEmailService.getInstance()

// Export types (EmailOptions and EmailResult are already exported above)