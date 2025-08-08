/**
 * Notification Service for AI Cost Guardian
 * Handles real-time notifications for cost alerts, usage spikes, and system events
 */

import { ProviderName } from '@/config/providers'
import prisma from '@/lib/prisma'

export interface NotificationData {
  type: 'cost_alert' | 'usage_spike' | 'error_rate' | 'system_notification'
  title: string
  message: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  provider?: ProviderName
  metadata?: Record<string, any>
  userId: string
  timestamp: Date
}

export interface EmailNotificationData extends NotificationData {
  recipientEmail: string
  subject: string
  htmlContent?: string
}

class NotificationService {
  private notificationQueue: NotificationData[] = []
  private emailQueue: EmailNotificationData[] = []
  private isProcessing = false

  /**
   * Send a real-time notification to user
   */
  async sendNotification(notification: NotificationData): Promise<void> {
    try {
      // Store notification in database for persistence
      await this.storeNotification(notification)

      // Add to queue for real-time delivery
      this.notificationQueue.push(notification)

      // Process queue if not already processing
      if (!this.isProcessing) {
        await this.processNotificationQueue()
      }

      // Send email for critical alerts
      if (notification.severity === 'critical' || notification.severity === 'error') {
        await this.sendEmailNotification(notification)
      }

    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  /**
   * Send cost alert notification
   */
  async sendCostAlert(
    userId: string,
    provider: ProviderName,
    currentCost: number,
    threshold: number,
    timeframe: string = 'daily'
  ): Promise<void> {
    const notification: NotificationData = {
      type: 'cost_alert',
      title: `Cost Alert: ${provider}`,
      message: `Your ${timeframe} spending for ${provider} ($${currentCost.toFixed(2)}) has exceeded the threshold of $${threshold.toFixed(2)}`,
      severity: 'warning',
      provider,
      metadata: {
        currentCost,
        threshold,
        timeframe,
        exceededBy: currentCost - threshold,
        percentageOver: ((currentCost - threshold) / threshold * 100).toFixed(1)
      },
      userId,
      timestamp: new Date()
    }

    await this.sendNotification(notification)
  }

  /**
   * Send usage spike alert
   */
  async sendUsageSpike(
    userId: string,
    provider: ProviderName,
    currentUsage: number,
    normalUsage: number,
    metric: 'requests' | 'tokens' | 'cost'
  ): Promise<void> {
    const percentageIncrease = ((currentUsage - normalUsage) / normalUsage * 100).toFixed(1)
    
    const notification: NotificationData = {
      type: 'usage_spike',
      title: `Usage Spike Detected: ${provider}`,
      message: `${metric} usage has increased by ${percentageIncrease}% (${currentUsage.toLocaleString()} vs normal ${normalUsage.toLocaleString()})`,
      severity: parseFloat(percentageIncrease) > 200 ? 'error' : 'warning',
      provider,
      metadata: {
        currentUsage,
        normalUsage,
        metric,
        percentageIncrease: parseFloat(percentageIncrease)
      },
      userId,
      timestamp: new Date()
    }

    await this.sendNotification(notification)
  }

  /**
   * Send error rate alert
   */
  async sendErrorRateAlert(
    userId: string,
    provider: ProviderName,
    errorRate: number,
    totalRequests: number
  ): Promise<void> {
    const notification: NotificationData = {
      type: 'error_rate',
      title: `High Error Rate: ${provider}`,
      message: `Error rate is ${(errorRate * 100).toFixed(1)}% (${Math.round(errorRate * totalRequests)} errors out of ${totalRequests} requests)`,
      severity: errorRate > 0.1 ? 'error' : 'warning',
      provider,
      metadata: {
        errorRate,
        totalRequests,
        errorCount: Math.round(errorRate * totalRequests)
      },
      userId,
      timestamp: new Date()
    }

    await this.sendNotification(notification)
  }

  /**
   * Get user notifications (paginated)
   */
  async getUserNotifications(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    try {
      // In a real implementation, we'd have a notifications table
      // For now, return from alerts and usage patterns
      const alerts = await prisma.alert.findMany({
        where: {
          userId,
          isActive: true
        },
        orderBy: { triggeredAt: 'desc' },
        take: limit,
        skip: offset
      })

      return alerts.map(alert => ({
        id: alert.id,
        type: alert.type,
        title: `${alert.type.replace('_', ' ').toUpperCase()}: ${alert.provider}`,
        message: alert.message,
        severity: this.getSeverityFromType(alert.type),
        provider: alert.provider,
        metadata: alert.metadata,
        timestamp: alert.triggeredAt,
        isRead: false // Would be tracked in a notifications table
      }))

    } catch (error) {
      console.error('Error fetching user notifications:', error)
      return []
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    try {
      // In a real implementation, we'd update the notifications table
      // For now, we'll update the alert if it matches
      await prisma.alert.updateMany({
        where: {
          id: notificationId,
          userId
        },
        data: {
          updatedAt: new Date()
        }
      })
      return true
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  /**
   * Get notification statistics for user
   */
  async getNotificationStats(userId: string): Promise<{
    total: number
    unread: number
    bySeverity: Record<string, number>
    byType: Record<string, number>
  }> {
    try {
      const alerts = await prisma.alert.findMany({
        where: { userId }
      })

      const stats = {
        total: alerts.length,
        unread: alerts.filter(a => a.isActive).length,
        bySeverity: {} as Record<string, number>,
        byType: {} as Record<string, number>
      }

      alerts.forEach(alert => {
        const severity = this.getSeverityFromType(alert.type)
        stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1
        stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('Error fetching notification stats:', error)
      return { total: 0, unread: 0, bySeverity: {}, byType: {} }
    }
  }

  /**
   * Store notification in database
   */
  private async storeNotification(notification: NotificationData): Promise<void> {
    try {
      // Create corresponding alert record
      await prisma.alert.create({
        data: {
          type: notification.type,
          provider: notification.provider || 'system',
          threshold: 0,
          message: notification.message,
          metadata: notification.metadata || {},
          isActive: true,
          triggeredAt: notification.timestamp,
          userId: notification.userId
        }
      })
    } catch (error) {
      console.error('Error storing notification:', error)
    }
  }

  /**
   * Process notification queue
   */
  private async processNotificationQueue(): Promise<void> {
    if (this.isProcessing || this.notificationQueue.length === 0) return

    this.isProcessing = true

    try {
      while (this.notificationQueue.length > 0) {
        const notification = this.notificationQueue.shift()
        if (notification) {
          await this.deliverNotification(notification)
        }
      }
    } catch (error) {
      console.error('Error processing notification queue:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Deliver notification via available channels
   */
  private async deliverNotification(notification: NotificationData): Promise<void> {
    try {
      // Real-time delivery (WebSocket, SSE, etc.)
      // For now, we'll log the notification
      console.log('📱 NOTIFICATION:', {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        severity: notification.severity,
        provider: notification.provider,
        userId: notification.userId,
        timestamp: notification.timestamp.toISOString()
      })

      // In a real implementation, you would:
      // 1. Send via WebSocket to connected clients
      // 2. Send push notifications to mobile apps
      // 3. Update real-time dashboard
      // 4. Store in notification center

    } catch (error) {
      console.error('Error delivering notification:', error)
    }
  }

  /**
   * Send email notification for critical alerts
   */
  private async sendEmailNotification(notification: NotificationData): Promise<void> {
    try {
      // Get user email
      const user = await prisma.user.findUnique({
        where: { id: notification.userId }
      })

      if (!user?.email) return

      const emailData: EmailNotificationData = {
        ...notification,
        recipientEmail: user.email,
        subject: `AI Cost Guardian Alert: ${notification.title}`,
        htmlContent: this.generateEmailHTML(notification)
      }

      this.emailQueue.push(emailData)
      await this.processEmailQueue()

    } catch (error) {
      console.error('Error sending email notification:', error)
    }
  }

  /**
   * Process email queue
   */
  private async processEmailQueue(): Promise<void> {
    // In a real implementation, you would integrate with:
    // - SendGrid, AWS SES, or similar email service
    // - Template engine for HTML emails
    // - Retry logic for failed sends
    
    while (this.emailQueue.length > 0) {
      const email = this.emailQueue.shift()
      if (email) {
        console.log('📧 EMAIL NOTIFICATION:', {
          to: email.recipientEmail,
          subject: email.subject,
          type: email.type,
          severity: email.severity
        })
        // await emailService.send(email)
      }
    }
  }

  /**
   * Generate HTML content for email notifications
   */
  private generateEmailHTML(notification: NotificationData): string {
    const severityColors = {
      info: '#3B82F6',
      warning: '#F59E0B',
      error: '#EF4444',
      critical: '#DC2626'
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${notification.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { border-left: 4px solid ${severityColors[notification.severity]}; padding-left: 16px; margin-bottom: 24px; }
            .title { font-size: 20px; font-weight: bold; margin: 0; color: #1f2937; }
            .severity { font-size: 14px; color: ${severityColors[notification.severity]}; text-transform: uppercase; margin: 4px 0 0 0; }
            .message { font-size: 16px; line-height: 1.5; color: #4b5563; margin: 16px 0; }
            .metadata { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 16px 0; }
            .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="title">${notification.title}</div>
              <div class="severity">${notification.severity} Alert</div>
            </div>
            <div class="message">${notification.message}</div>
            ${notification.metadata ? `
              <div class="metadata">
                <strong>Details:</strong><br>
                ${Object.entries(notification.metadata)
                  .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                  .join('<br>')}
              </div>
            ` : ''}
            <div class="footer">
              <p>This alert was generated by AI Cost Guardian at ${notification.timestamp.toLocaleString()}</p>
              <p>Log in to your dashboard to view more details and manage alerts.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  /**
   * Get severity from alert type
   */
  private getSeverityFromType(type: string): 'info' | 'warning' | 'error' | 'critical' {
    switch (type) {
      case 'cost_alert':
        return 'warning'
      case 'usage_spike':
        return 'warning'
      case 'error_rate':
        return 'error'
      case 'system_notification':
        return 'info'
      default:
        return 'info'
    }
  }
}

export const notificationService = new NotificationService()