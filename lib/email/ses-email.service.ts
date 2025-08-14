import nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }>;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

class SESEmailService {
  private transporter: Transporter;
  private defaultFrom: string;
  private defaultReplyTo?: string;
  private isConfigured: boolean = false;

  constructor() {
    this.defaultFrom = process.env.SES_FROM_EMAIL || 'noreply@aicostguardian.com';
    this.defaultReplyTo = process.env.SES_REPLY_TO_EMAIL;
    
    // Initialize transporter if credentials are available
    if (this.hasValidCredentials()) {
      this.transporter = this.createTransporter();
      this.isConfigured = true;
    } else {
      console.warn('SES Email Service: Missing required credentials. Email sending disabled.');
      // Create a stub transporter that logs instead of sending
      this.transporter = this.createStubTransporter();
    }
  }

  private hasValidCredentials(): boolean {
    return !!(
      process.env.SES_SMTP_USERNAME &&
      process.env.SES_SMTP_PASSWORD &&
      process.env.SES_SMTP_HOST
    );
  }

  private createTransporter(): Transporter {
    const host = process.env.SES_SMTP_HOST || 'email-smtp.us-east-1.amazonaws.com';
    const port = parseInt(process.env.SES_SMTP_PORT || '587', 10);
    
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SES_SMTP_USERNAME!,
        pass: process.env.SES_SMTP_PASSWORD!,
      },
      // Additional options for better reliability
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 14, // SES typically allows 14 emails per second
    });
  }

  private createStubTransporter(): Transporter {
    // Create a test account transporter for development
    return nodemailer.createTransport({
      jsonTransport: true, // Just return the message as JSON
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        console.log('[DEV] Email would be sent:', {
          to: options.to,
          subject: options.subject,
          from: options.from || this.defaultFrom,
        });
        return true; // Simulate success in development
      }

      const mailOptions = {
        from: options.from || this.defaultFrom,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html || ''),
        replyTo: options.replyTo || this.defaultReplyTo,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendBulkEmails(recipients: string[], template: EmailTemplate): Promise<{
    success: string[];
    failed: string[];
  }> {
    const success: string[] = [];
    const failed: string[] = [];

    // Process in batches to respect rate limits
    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (recipient) => {
          const sent = await this.sendEmail({
            to: recipient,
            subject: template.subject,
            html: template.html,
            text: template.text,
          });
          
          if (sent) {
            success.push(recipient);
          } else {
            failed.push(recipient);
          }
        })
      );
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return { success, failed };
  }

  async sendTemplatedEmail(
    to: string | string[],
    templateName: string,
    data: Record<string, any>
  ): Promise<boolean> {
    const template = await this.getTemplate(templateName, data);
    if (!template) {
      console.error(`Template ${templateName} not found`);
      return false;
    }

    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  private async getTemplate(
    templateName: string,
    data: Record<string, any>
  ): Promise<EmailTemplate | null> {
    // This method will be expanded to fetch templates from database or files
    const templates: Record<string, (data: any) => EmailTemplate> = {
      welcome: (data) => ({
        subject: 'Welcome to AI Cost Guardian',
        html: this.renderTemplate('welcome', data),
        text: `Welcome to AI Cost Guardian, ${data.name}! Get started by setting up your API keys.`,
      }),
      usageAlert: (data) => ({
        subject: `Usage Alert: ${data.alertType}`,
        html: this.renderTemplate('usageAlert', data),
        text: `Your ${data.provider} usage has exceeded ${data.threshold}. Current usage: ${data.usage}`,
      }),
      passwordReset: (data) => ({
        subject: 'Password Reset Request',
        html: this.renderTemplate('passwordReset', data),
        text: `Click the following link to reset your password: ${data.resetLink}`,
      }),
      teamInvite: (data) => ({
        subject: `You've been invited to join ${data.organizationName}`,
        html: this.renderTemplate('teamInvite', data),
        text: `${data.inviterName} has invited you to join ${data.organizationName} on AI Cost Guardian. Accept invite: ${data.inviteLink}`,
      }),
      monthlyReport: (data) => ({
        subject: `Monthly Usage Report - ${data.month}`,
        html: this.renderTemplate('monthlyReport', data),
        text: `Your monthly usage report for ${data.month} is ready. Total cost: ${data.totalCost}`,
      }),
    };

    const templateFunc = templates[templateName];
    return templateFunc ? templateFunc(data) : null;
  }

  private renderTemplate(templateName: string, data: Record<string, any>): string {
    // Base HTML template structure
    const baseTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; }
    .alert { padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; margin: 20px 0; }
    .success { background: #d1fae5; border-left-color: #10b981; }
    .error { background: #fee2e2; border-left-color: #ef4444; }
  </style>
</head>
<body>
  <div class="container">
    {{CONTENT}}
  </div>
</body>
</html>`;

    // Template-specific content
    const templates: Record<string, string> = {
      welcome: `
        <div class="header">
          <h1>Welcome to AI Cost Guardian!</h1>
        </div>
        <div class="content">
          <h2>Hello ${data.name}! 👋</h2>
          <p>Thank you for joining AI Cost Guardian. We're excited to help you manage and optimize your AI costs.</p>
          <h3>Get Started:</h3>
          <ol>
            <li>Set up your API keys for the AI providers you use</li>
            <li>Configure your usage alerts and thresholds</li>
            <li>Invite your team members</li>
          </ol>
          <a href="${data.dashboardUrl || process.env.NEXTAUTH_URL}" class="button">Go to Dashboard</a>
          <div class="footer">
            <p>Need help? Check out our <a href="${process.env.NEXTAUTH_URL}/docs">documentation</a> or contact support.</p>
          </div>
        </div>
      `,
      usageAlert: `
        <div class="header">
          <h1>⚠️ Usage Alert</h1>
        </div>
        <div class="content">
          <div class="alert">
            <strong>${data.alertType}</strong>
            <p>Your ${data.provider} usage has exceeded the configured threshold.</p>
          </div>
          <h3>Details:</h3>
          <ul>
            <li><strong>Provider:</strong> ${data.provider}</li>
            <li><strong>Current Usage:</strong> ${data.usage}</li>
            <li><strong>Threshold:</strong> ${data.threshold}</li>
            <li><strong>Period:</strong> ${data.period}</li>
          </ul>
          <a href="${data.dashboardUrl || process.env.NEXTAUTH_URL}/usage" class="button">View Usage Details</a>
          <div class="footer">
            <p>You can update your alert settings in the <a href="${process.env.NEXTAUTH_URL}/settings">settings page</a>.</p>
          </div>
        </div>
      `,
      passwordReset: `
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>We received a request to reset your password for AI Cost Guardian.</p>
          <p>If you didn't make this request, you can safely ignore this email.</p>
          <a href="${data.resetLink}" class="button">Reset Password</a>
          <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>
          <div class="footer">
            <p>If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
            <p style="word-break: break-all; font-size: 12px;">${data.resetLink}</p>
          </div>
        </div>
      `,
      teamInvite: `
        <div class="header">
          <h1>Team Invitation</h1>
        </div>
        <div class="content">
          <p><strong>${data.inviterName}</strong> has invited you to join <strong>${data.organizationName}</strong> on AI Cost Guardian.</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Organization:</strong> ${data.organizationName}</p>
            <p><strong>Role:</strong> ${data.role || 'Member'}</p>
            <p><strong>Invited by:</strong> ${data.inviterName}</p>
          </div>
          <a href="${data.inviteLink}" class="button">Accept Invitation</a>
          <p style="color: #6b7280; font-size: 14px;">This invitation will expire in 7 days.</p>
          <div class="footer">
            <p>If you don't want to join this organization, you can safely ignore this email.</p>
          </div>
        </div>
      `,
      monthlyReport: `
        <div class="header">
          <h1>Monthly Usage Report</h1>
          <p>${data.month}</p>
        </div>
        <div class="content">
          <h2>Usage Summary</h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Total Cost: ${data.totalCost}</h3>
            <p>Total Requests: ${data.totalRequests}</p>
            <p>Active Users: ${data.activeUsers}</p>
          </div>
          <h3>Provider Breakdown:</h3>
          <ul>
            ${data.providers?.map((p: any) => `
              <li><strong>${p.name}:</strong> ${p.cost} (${p.requests} requests)</li>
            `).join('') || '<li>No usage this month</li>'}
          </ul>
          <a href="${data.reportUrl || process.env.NEXTAUTH_URL}/analytics" class="button">View Full Report</a>
          <div class="footer">
            <p>This is an automated monthly report. You can update your notification preferences in settings.</p>
          </div>
        </div>
      `,
    };

    const content = templates[templateName] || '<div class="content"><p>Template not found</p></div>';
    return baseTemplate.replace('{{CONTENT}}', content);
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  async verifyConnection(): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        console.log('SES Email Service: Not configured, skipping verification');
        return false;
      }
      
      await this.transporter.verify();
      console.log('SES Email Service: Connection verified successfully');
      return true;
    } catch (error) {
      console.error('SES Email Service: Connection verification failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const sesEmailService = new SESEmailService();

// Export types and class for testing
export { SESEmailService };