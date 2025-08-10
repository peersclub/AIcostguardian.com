import {
  NotificationChannel,
  NotificationData,
  DeliveryResult,
  TemplateRenderResult,
  InAppChannelConfig,
  ChannelError
} from '../types'
import prisma from '@/lib/prisma'

/**
 * In-app notification channel for real-time notifications
 * Handles browser notifications, UI toasts, and persistent notifications
 */
export class InAppNotificationChannel implements NotificationChannel {
  readonly type = 'IN_APP' as const
  readonly name = 'In-App'

  private realtimeService?: any // Will be injected when available

  constructor(realtimeService?: any) {
    this.realtimeService = realtimeService
  }

  /**
   * Send in-app notification
   */
  async send(
    notification: NotificationData,
    channelConfig: InAppChannelConfig,
    template?: TemplateRenderResult
  ): Promise<DeliveryResult> {
    const startTime = Date.now()

    try {
      // Validate inputs
      this.validateInputs(notification, channelConfig)

      // Store notification in database for persistence
      const persistedNotification = await this.persistNotification(
        notification,
        channelConfig,
        template
      )

      // Send real-time notification if user is connected
      let realtimeDelivered = false
      if (this.realtimeService) {
        realtimeDelivered = await this.sendRealtime(
          notification,
          channelConfig,
          template
        )
      }

      // Prepare browser notification if supported
      const browserNotificationSent = await this.sendBrowserNotification(
        notification,
        channelConfig
      )

      const latency = Date.now() - startTime

      // Log delivery
      await this.logDelivery(notification, {
        persisted: !!persistedNotification,
        realtime: realtimeDelivered,
        browser: browserNotificationSent
      })

      return {
        success: true,
        channel: 'IN_APP',
        destination: notification.userId,
        messageId: persistedNotification?.id,
        latency,
        attempts: 1,
        metadata: {
          persisted: !!persistedNotification,
          realtime: realtimeDelivered,
          browser: browserNotificationSent,
          persistent: channelConfig.persistent !== false
        }
      }
    } catch (error) {
      const latency = Date.now() - startTime
      console.error('In-app notification send failed:', error)

      return {
        success: false,
        channel: 'IN_APP',
        destination: notification.userId,
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
   * Validate in-app configuration
   */
  validate(channelConfig: InAppChannelConfig): boolean {
    try {
      // In-app notifications don't require complex validation
      // Just check if user preferences allow in-app notifications
      return true
    } catch (error) {
      console.error('In-app channel validation failed:', error)
      return false
    }
  }

  /**
   * Test in-app configuration
   */
  async test(channelConfig: InAppChannelConfig): Promise<boolean> {
    try {
      const testNotification: NotificationData = {
        userId: 'test-user',
        organizationId: 'test-org',
        type: 'COST_THRESHOLD_WARNING',
        priority: 'LOW',
        title: 'Test Notification',
        message: 'This is a test in-app notification.'
      }

      const result = await this.send(testNotification, channelConfig)
      return result.success
    } catch (error) {
      console.error('In-app test failed:', error)
      return false
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const updated = await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId: userId
        },
        data: {
          readAt: new Date()
        }
      })

      // Send real-time update to remove from UI
      if (this.realtimeService && updated.count > 0) {
        await this.realtimeService.send(userId, {
          type: 'notification_read',
          id: notificationId,
          data: { notificationId },
          timestamp: new Date()
        })
      }

      return updated.count > 0
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      return false
    }
  }

  /**
   * Mark notification as acknowledged
   */
  async acknowledge(notificationId: string, userId: string): Promise<boolean> {
    try {
      const updated = await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId: userId
        },
        data: {
          acknowledgedAt: new Date()
        }
      })

      // Send real-time update
      if (this.realtimeService && updated.count > 0) {
        await this.realtimeService.send(userId, {
          type: 'notification_acknowledged',
          id: notificationId,
          data: { notificationId },
          timestamp: new Date()
        })
      }

      return updated.count > 0
    } catch (error) {
      console.error('Failed to acknowledge notification:', error)
      return false
    }
  }

  /**
   * Get unread notifications for a user
   */
  async getUnreadNotifications(
    userId: string,
    limit = 50
  ): Promise<any[]> {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          readAt: null,
          status: 'DELIVERED'
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          rule: {
            select: {
              name: true,
              type: true
            }
          }
        }
      })

      return notifications.map(notification => ({
        id: notification.id,
        type: notification.type,
        priority: notification.priority,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        createdAt: notification.createdAt,
        expiresAt: notification.expiresAt,
        groupId: notification.groupId,
        parentId: notification.parentId,
        rule: notification.rule
      }))
    } catch (error) {
      console.error('Failed to get unread notifications:', error)
      return []
    }
  }

  /**
   * Get notification count for a user
   */
  async getNotificationCount(userId: string): Promise<{
    total: number
    unread: number
    byPriority: Record<string, number>
  }> {
    try {
      const [total, unread, priorityCounts] = await Promise.all([
        prisma.notification.count({
          where: { userId, status: 'DELIVERED' }
        }),
        prisma.notification.count({
          where: { userId, readAt: null, status: 'DELIVERED' }
        }),
        prisma.notification.groupBy({
          by: ['priority'],
          where: { userId, readAt: null, status: 'DELIVERED' },
          _count: { priority: true }
        })
      ])

      const byPriority: Record<string, number> = {}
      for (const count of priorityCounts) {
        byPriority[count.priority] = count._count.priority
      }

      return { total, unread, byPriority }
    } catch (error) {
      console.error('Failed to get notification count:', error)
      return { total: 0, unread: 0, byPriority: {} }
    }
  }

  /**
   * Delete old notifications
   */
  async cleanup(userId: string, olderThanDays = 30): Promise<number> {
    try {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - olderThanDays)

      const deleted = await prisma.notification.deleteMany({
        where: {
          userId,
          createdAt: { lt: cutoff },
          readAt: { not: null } // Only delete read notifications
        }
      })

      return deleted.count
    } catch (error) {
      console.error('Failed to cleanup notifications:', error)
      return 0
    }
  }

  // Private methods

  private validateInputs(
    notification: NotificationData,
    channelConfig: InAppChannelConfig
  ): void {
    if (!notification.userId) {
      throw new ChannelError('User ID is required', 'IN_APP')
    }

    if (!notification.title && !notification.message) {
      throw new ChannelError('Notification content is required', 'IN_APP')
    }
  }

  private async persistNotification(
    notification: NotificationData,
    channelConfig: InAppChannelConfig,
    template?: TemplateRenderResult
  ): Promise<any> {
    if (channelConfig.persistent === false) {
      return null // Don't persist if explicitly disabled
    }

    try {
      const data = {
        id: notification.id,
        ruleId: notification.ruleId,
        userId: notification.userId,
        organizationId: notification.organizationId,
        type: notification.type,
        priority: notification.priority,
        title: template?.subject || notification.title,
        message: template?.body || notification.message,
        data: {
          ...notification.data,
          template: template ? {
            subject: template.subject,
            html: template.html,
            metadata: template.metadata
          } : undefined,
          channelConfig: {
            persistent: channelConfig.persistent,
            actionable: channelConfig.actionable,
            actions: channelConfig.actions
          }
        },
        status: 'DELIVERED' as any,
        channels: { [this.type]: { delivered: true, timestamp: new Date() } },
        groupId: notification.groupId,
        parentId: notification.parentId,
        expiresAt: notification.expiresAt,
        createdAt: new Date()
      }

      const persisted = await prisma.notification.create({ data })
      return persisted
    } catch (error) {
      console.error('Failed to persist notification:', error)
      throw new ChannelError('Failed to persist notification', 'IN_APP')
    }
  }

  private async sendRealtime(
    notification: NotificationData,
    channelConfig: InAppChannelConfig,
    template?: TemplateRenderResult
  ): Promise<boolean> {
    if (!this.realtimeService) {
      return false
    }

    try {
      const realtimeMessage = {
        type: 'notification',
        id: notification.id,
        data: {
          id: notification.id,
          type: notification.type,
          priority: notification.priority,
          title: template?.subject || notification.title,
          message: template?.body || notification.message,
          data: notification.data,
          groupId: notification.groupId,
          parentId: notification.parentId,
          persistent: channelConfig.persistent !== false,
          actionable: channelConfig.actionable,
          actions: channelConfig.actions,
          sound: channelConfig.sound,
          vibration: channelConfig.vibration,
          createdAt: new Date().toISOString()
        },
        timestamp: new Date()
      }

      const delivered = await this.realtimeService.send(
        notification.userId,
        realtimeMessage
      )

      return delivered
    } catch (error) {
      console.error('Failed to send real-time notification:', error)
      return false
    }
  }

  private async sendBrowserNotification(
    notification: NotificationData,
    channelConfig: InAppChannelConfig
  ): Promise<boolean> {
    // Browser notifications are handled client-side
    // This would typically trigger a real-time message to the client
    // to show a browser notification
    
    if (!this.realtimeService) {
      return false
    }

    try {
      const browserNotification = {
        type: 'browser_notification',
        id: notification.id,
        data: {
          title: notification.title,
          body: notification.message.substring(0, 200), // Browser notifications have limits
          icon: this.getNotificationIcon(notification.type),
          badge: '/icons/notification-badge.png',
          tag: notification.groupId || notification.id,
          requireInteraction: notification.priority === 'CRITICAL',
          silent: !channelConfig.sound,
          vibrate: channelConfig.vibration ? [200, 100, 200] : undefined,
          actions: channelConfig.actions?.slice(0, 2).map(action => ({
            action: action.action,
            title: action.label,
            icon: this.getActionIcon(action.action)
          })),
          data: {
            notificationId: notification.id,
            url: this.getNotificationUrl(notification)
          }
        },
        timestamp: new Date()
      }

      const delivered = await this.realtimeService.send(
        notification.userId,
        browserNotification
      )

      return delivered
    } catch (error) {
      console.error('Failed to send browser notification:', error)
      return false
    }
  }

  private getNotificationIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'COST_THRESHOLD_WARNING': '/icons/warning.png',
      'COST_THRESHOLD_CRITICAL': '/icons/critical.png',
      'COST_THRESHOLD_EXCEEDED': '/icons/exceeded.png',
      'API_RATE_LIMIT_WARNING': '/icons/rate-limit.png',
      'API_KEY_EXPIRING': '/icons/key.png',
      'PROVIDER_OUTAGE': '/icons/outage.png',
      'PAYMENT_FAILED': '/icons/payment.png'
    }
    
    return iconMap[type] || '/icons/notification.png'
  }

  private getActionIcon(action: string): string {
    const iconMap: Record<string, string> = {
      'view': '/icons/view.png',
      'acknowledge': '/icons/check.png',
      'snooze': '/icons/snooze.png',
      'dismiss': '/icons/dismiss.png'
    }
    
    return iconMap[action] || '/icons/action.png'
  }

  private getNotificationUrl(notification: NotificationData): string {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    switch (notification.type) {
      case 'COST_THRESHOLD_WARNING':
      case 'COST_THRESHOLD_CRITICAL':
      case 'COST_THRESHOLD_EXCEEDED':
        return `${baseUrl}/analytics/usage`
      case 'API_RATE_LIMIT_WARNING':
      case 'API_RATE_LIMIT_EXCEEDED':
        return `${baseUrl}/monitoring/dashboard`
      case 'API_KEY_EXPIRING':
      case 'API_KEY_EXPIRED':
        return `${baseUrl}/settings`
      case 'PAYMENT_FAILED':
        return `${baseUrl}/billing`
      case 'NEW_TEAM_MEMBER':
        return `${baseUrl}/team`
      default:
        return `${baseUrl}/dashboard`
    }
  }

  private async logDelivery(
    notification: NotificationData,
    deliveryInfo: {
      persisted: boolean
      realtime: boolean
      browser: boolean
    }
  ): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      notificationId: notification.id,
      channel: 'IN_APP',
      destination: notification.userId,
      success: true,
      userId: notification.userId,
      organizationId: notification.organizationId,
      type: notification.type,
      deliveryMethods: deliveryInfo
    }

    console.log('In-app delivery logged:', logEntry)
  }
}

/**
 * Factory function to create in-app channel
 */
export function createInAppChannel(realtimeService?: any): InAppNotificationChannel {
  return new InAppNotificationChannel(realtimeService)
}

/**
 * In-app notification UI components and utilities
 */
export const InAppNotificationUtils = {
  /**
   * Format notification for UI display
   */
  formatForUI(notification: any) {
    return {
      id: notification.id,
      type: notification.type,
      priority: notification.priority,
      title: notification.title,
      message: notification.message,
      icon: this.getTypeIcon(notification.type),
      color: this.getPriorityColor(notification.priority),
      timestamp: notification.createdAt,
      actions: notification.data?.channelConfig?.actions || [],
      persistent: notification.data?.channelConfig?.persistent !== false
    }
  },

  /**
   * Get icon for notification type
   */
  getTypeIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'COST_THRESHOLD_WARNING': '⚠️',
      'COST_THRESHOLD_CRITICAL': '🚨',
      'COST_THRESHOLD_EXCEEDED': '💸',
      'DAILY_COST_SPIKE': '📈',
      'API_RATE_LIMIT_WARNING': '🚦',
      'API_KEY_EXPIRING': '🔑',
      'PROVIDER_OUTAGE': '🔧',
      'PAYMENT_FAILED': '💳',
      'NEW_TEAM_MEMBER': '👋'
    }
    
    return iconMap[type] || '📢'
  },

  /**
   * Get color for notification priority
   */
  getPriorityColor(priority: string): string {
    const colorMap: Record<string, string> = {
      'LOW': 'green',
      'MEDIUM': 'orange',
      'HIGH': 'red',
      'CRITICAL': 'red'
    }
    
    return colorMap[priority] || 'blue'
  },

  /**
   * Group notifications by type or time
   */
  groupNotifications(
    notifications: any[],
    groupBy: 'type' | 'time' = 'time'
  ): Record<string, any[]> {
    const groups: Record<string, any[]> = {}

    for (const notification of notifications) {
      let key: string

      if (groupBy === 'type') {
        key = notification.type
      } else {
        // Group by day
        const date = new Date(notification.createdAt)
        key = date.toDateString()
      }

      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(notification)
    }

    return groups
  }
}