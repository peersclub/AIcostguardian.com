/**
 * System-level notification service for AI Cost Guardian
 * Provides operating system native notifications instead of browser-based polling
 */

import { notificationService } from '@/lib/notifications/notification.service'
import { createAuditLog, AuditAction, AuditSeverity } from './audit-log'

export interface SystemNotificationData {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
  userId: string
  organizationId: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  data?: Record<string, any>
}

export interface SystemNotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

/**
 * System Notification Service
 * Handles OS-level notifications with proper permission management
 */
export class SystemNotificationService {
  private static instance: SystemNotificationService
  private permissionStatus: NotificationPermission = 'default'
  private registrationPromise: Promise<ServiceWorkerRegistration> | null = null

  private constructor() {
    this.initializeService()
  }

  public static getInstance(): SystemNotificationService {
    if (!SystemNotificationService.instance) {
      SystemNotificationService.instance = new SystemNotificationService()
    }
    return SystemNotificationService.instance
  }

  /**
   * Initialize the system notification service
   */
  private async initializeService(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      // Check if service workers are supported
      if ('serviceWorker' in navigator) {
        this.registrationPromise = this.registerServiceWorker()
      }

      // Check current permission status
      if ('Notification' in window) {
        this.permissionStatus = Notification.permission
      }

      // Set up visibility change handler for better notification management
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))

    } catch (error) {
      console.error('Failed to initialize system notification service:', error)
    }
  }

  /**
   * Register service worker for background notifications
   */
  private async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    try {
      const registration = await navigator.serviceWorker.register('/sw-notifications.js', {
        scope: '/'
      })

      console.log('Notification service worker registered:', registration)
      return registration
    } catch (error) {
      console.error('Service worker registration failed:', error)
      throw error
    }
  }

  /**
   * Request notification permission from the user
   */
  async requestPermission(): Promise<SystemNotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { granted: false, denied: true, default: false }
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission()
      this.permissionStatus = permission

      // Log permission request
      await createAuditLog({
        action: AuditAction.SETTINGS_CHANGED,
        severity: AuditSeverity.LOW,
        metadata: {
          setting: 'notification_permission',
          value: permission,
          type: 'system_notification'
        },
        success: true
      })

      return {
        granted: permission === 'granted',
        denied: permission === 'denied',
        default: permission === 'default'
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return { granted: false, denied: true, default: false }
    }
  }

  /**
   * Check if notifications are supported and permitted
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' &&
           'Notification' in window &&
           'serviceWorker' in navigator
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): SystemNotificationPermission {
    if (!this.isSupported()) {
      return { granted: false, denied: true, default: false }
    }

    return {
      granted: this.permissionStatus === 'granted',
      denied: this.permissionStatus === 'denied',
      default: this.permissionStatus === 'default'
    }
  }

  /**
   * Send a system-level notification
   */
  async sendSystemNotification(data: SystemNotificationData): Promise<boolean> {
    try {
      // Check if we can send notifications
      if (!this.isSupported() || this.permissionStatus !== 'granted') {
        console.warn('System notifications not supported or not permitted')
        return false
      }

      // Don't send notifications if the user is actively using the app
      if (document.visibilityState === 'visible') {
        console.log('User is active, skipping system notification')
        return false
      }

      // Create notification options
      const options: NotificationOptions = {
        body: data.body,
        icon: data.icon || '/icons/notification-icon.png',
        badge: data.badge || '/icons/badge-icon.png',
        tag: data.tag || `notification-${Date.now()}`,
        requireInteraction: data.requireInteraction || data.priority === 'urgent',
        silent: data.silent || false,
        data: {
          ...data.data,
          userId: data.userId,
          organizationId: data.organizationId,
          timestamp: new Date().toISOString(),
          url: '/notifications' // Default action URL
        }
      }

      // Add action buttons if provided
      if (data.actions && data.actions.length > 0) {
        options.actions = data.actions
      }

      // Set priority-based properties
      switch (data.priority) {
        case 'urgent':
          options.requireInteraction = true
          options.silent = false
          break
        case 'high':
          options.requireInteraction = true
          break
        case 'low':
          options.silent = true
          break
      }

      // Try to use service worker for background notifications
      if (this.registrationPromise) {
        try {
          const registration = await this.registrationPromise
          await registration.showNotification(data.title, options)
        } catch (error) {
          console.warn('Service worker notification failed, falling back to direct notification:', error)
          new Notification(data.title, options)
        }
      } else {
        // Fallback to direct notification
        new Notification(data.title, options)
      }

      // Log successful notification
      await createAuditLog({
        action: AuditAction.ADMIN_ACTION,
        severity: AuditSeverity.LOW,
        userId: data.userId,
        metadata: {
          adminAction: 'system_notification_sent',
          notificationType: 'system',
          title: data.title,
          priority: data.priority
        },
        success: true
      })

      return true
    } catch (error) {
      console.error('Failed to send system notification:', error)

      // Log failed notification
      await createAuditLog({
        action: AuditAction.ADMIN_ACTION,
        severity: AuditSeverity.MEDIUM,
        userId: data.userId,
        metadata: {
          adminAction: 'system_notification_failed',
          error: (error as Error).message
        },
        success: false
      })

      return false
    }
  }

  /**
   * Send critical system alert (bypasses active user check)
   */
  async sendCriticalAlert(data: SystemNotificationData): Promise<boolean> {
    if (!this.isSupported() || this.permissionStatus !== 'granted') {
      return false
    }

    try {
      const options: NotificationOptions = {
        body: data.body,
        icon: '/icons/critical-alert.png',
        badge: '/icons/critical-badge.png',
        tag: `critical-${Date.now()}`,
        requireInteraction: true,
        silent: false,
        data: {
          ...data.data,
          userId: data.userId,
          organizationId: data.organizationId,
          timestamp: new Date().toISOString(),
          type: 'critical_alert',
          url: '/alerts'
        }
      }

      if (this.registrationPromise) {
        const registration = await this.registrationPromise
        await registration.showNotification(`🚨 CRITICAL: ${data.title}`, options)
      } else {
        new Notification(`🚨 CRITICAL: ${data.title}`, options)
      }

      return true
    } catch (error) {
      console.error('Failed to send critical alert:', error)
      return false
    }
  }

  /**
   * Clear all notifications with a specific tag
   */
  async clearNotifications(tag?: string): Promise<void> {
    if (!this.registrationPromise) return

    try {
      const registration = await this.registrationPromise
      const notifications = await registration.getNotifications({ tag })

      notifications.forEach(notification => notification.close())
    } catch (error) {
      console.error('Failed to clear notifications:', error)
    }
  }

  /**
   * Handle visibility change to manage notification behavior
   */
  private handleVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      // User returned to the app, clear non-critical notifications
      this.clearNotifications()
    }
  }

  /**
   * Integration with existing notification service
   */
  async integrateWithNotificationService(userId: string, organizationId: string): Promise<void> {
    try {
      // Get user's notification preferences
      const response = await fetch('/api/notifications/preferences')
      const preferences = await response.json()

      // If user has system notifications enabled, upgrade their experience
      if (preferences.pushEnabled && this.permissionStatus === 'granted') {
        console.log('System notifications enabled for user')

        // Set up notification rule for system-level delivery
        await fetch('/api/notifications/rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'System Level Notifications',
            type: 'SYSTEM',
            enabled: true,
            conditions: {
              priority: ['HIGH', 'CRITICAL']
            },
            channels: [{
              type: 'SYSTEM',
              destination: 'system',
              config: {
                requireInteraction: true,
                badge: true
              },
              enabled: true
            }]
          })
        })
      }
    } catch (error) {
      console.error('Failed to integrate with notification service:', error)
    }
  }
}

// Export singleton instance
export const systemNotificationService = SystemNotificationService.getInstance()

// Helper functions for common notification types
export async function sendCostAlert(
  userId: string,
  organizationId: string,
  provider: string,
  amount: number,
  threshold: number
): Promise<boolean> {
  return systemNotificationService.sendSystemNotification({
    title: `Cost Alert: ${provider}`,
    body: `Your spending ($${amount.toFixed(2)}) has exceeded the threshold of $${threshold.toFixed(2)}`,
    priority: 'high',
    requireInteraction: true,
    userId,
    organizationId,
    tag: `cost-alert-${provider}`,
    data: {
      type: 'cost_alert',
      provider,
      amount,
      threshold,
      url: '/analytics/usage'
    }
  })
}

export async function sendUsageSpike(
  userId: string,
  organizationId: string,
  provider: string,
  increase: number
): Promise<boolean> {
  return systemNotificationService.sendSystemNotification({
    title: `Usage Spike: ${provider}`,
    body: `Unusual activity detected: ${increase}% increase in usage`,
    priority: 'high',
    userId,
    organizationId,
    tag: `usage-spike-${provider}`,
    data: {
      type: 'usage_spike',
      provider,
      increase,
      url: '/monitoring'
    }
  })
}

export async function sendSecurityAlert(
  userId: string,
  organizationId: string,
  alertType: string,
  message: string
): Promise<boolean> {
  return systemNotificationService.sendCriticalAlert({
    title: `Security Alert: ${alertType}`,
    body: message,
    priority: 'urgent',
    requireInteraction: true,
    userId,
    organizationId,
    tag: `security-${alertType}`,
    data: {
      type: 'security_alert',
      alertType,
      url: '/security'
    }
  })
}