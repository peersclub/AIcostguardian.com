'use client'

import { io, Socket } from 'socket.io-client'
import { toast } from 'sonner'
import { NotificationEvent } from '../types/notification-events'

export { NotificationEvent }

export interface NotificationData {
  id: string
  type: NotificationEvent
  title: string
  message: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  icon?: string
  iconColor?: string
  actionUrl?: string
  actionLabel?: string
  metadata?: Record<string, any>
  createdAt: Date
  expiresAt?: Date
  persistent?: boolean
}

export interface SiteWideNotification extends NotificationData {
  showUntil?: Date
  dismissible?: boolean
  style?: 'info' | 'warning' | 'error' | 'success'
}

class NotificationSocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Set<(data: NotificationData) => void>> = new Map()
  private siteWideNotifications: SiteWideNotification[] = []
  private siteWideListeners: Set<(notifications: SiteWideNotification[]) => void> = new Set()
  private unreadCount: number = 0
  private unreadListeners: Set<(count: number) => void> = new Set()
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.connect()
    }
  }

  private connect() {
    if (typeof window === 'undefined') return
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    
    this.socket = io(`${protocol}//${host}`, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    this.socket.on('connect', () => {
      console.log('Connected to notification service')
      this.subscribeToChannels()
    })

    this.socket.on('notification', (data: NotificationData) => {
      this.handleNotification(data)
    })

    this.socket.on('site-wide-notification', (data: SiteWideNotification) => {
      this.handleSiteWideNotification(data)
    })

    this.socket.on('notification:read', (notificationId: string) => {
      this.updateUnreadCount(-1)
    })

    this.socket.on('notification:unread-count', (count: number) => {
      this.setUnreadCount(count)
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from notification service')
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  }

  private subscribeToChannels() {
    if (!this.socket) return

    // Subscribe to user-specific channel
    this.socket.emit('subscribe', { channel: 'user' })
    
    // Subscribe to organization channel
    this.socket.emit('subscribe', { channel: 'organization' })
    
    // Subscribe to system-wide channel
    this.socket.emit('subscribe', { channel: 'system' })
  }

  private handleNotification(data: NotificationData) {
    // Update unread count
    this.updateUnreadCount(1)
    
    // Show toast notification
    this.showToast(data)
    
    // Notify listeners
    const listeners = this.listeners.get(data.type) || new Set()
    listeners.forEach(listener => listener(data))
    
    // Notify global listeners
    const globalListeners = this.listeners.get('*') || new Set()
    globalListeners.forEach(listener => listener(data))
  }

  private handleSiteWideNotification(data: SiteWideNotification) {
    // Add to site-wide notifications if not expired
    if (!data.showUntil || new Date(data.showUntil) > new Date()) {
      this.siteWideNotifications = [data, ...this.siteWideNotifications]
      
      // Notify site-wide listeners
      this.siteWideListeners.forEach(listener => 
        listener(this.siteWideNotifications)
      )
    }
  }

  private showToast(notification: NotificationData) {
    const options: any = {
      description: notification.message,
      duration: notification.persistent ? Infinity : 5000,
    }

    if (notification.actionUrl) {
      options.action = {
        label: notification.actionLabel || 'View',
        onClick: () => {
          if (typeof window !== 'undefined') {
            window.location.href = notification.actionUrl!
          }
        }
      }
    }

    switch (notification.priority) {
      case 'CRITICAL':
        toast.error(notification.title, options)
        break
      case 'HIGH':
        toast.warning(notification.title, options)
        break
      case 'MEDIUM':
        toast.info(notification.title, options)
        break
      default:
        toast(notification.title, options)
    }
  }

  // Public methods
  public on(event: NotificationEvent | '*', callback: (data: NotificationData) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
    
    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  public onSiteWide(callback: (notifications: SiteWideNotification[]) => void) {
    this.siteWideListeners.add(callback)
    // Immediately call with current notifications
    callback(this.siteWideNotifications)
    
    return () => {
      this.siteWideListeners.delete(callback)
    }
  }

  public onUnreadCountChange(callback: (count: number) => void) {
    this.unreadListeners.add(callback)
    // Immediately call with current count
    callback(this.unreadCount)
    
    return () => {
      this.unreadListeners.delete(callback)
    }
  }

  public dismissSiteWideNotification(notificationId: string) {
    this.siteWideNotifications = this.siteWideNotifications.filter(
      n => n.id !== notificationId
    )
    
    // Notify listeners
    this.siteWideListeners.forEach(listener => 
      listener(this.siteWideNotifications)
    )
    
    // Emit dismissal to server
    this.socket?.emit('notification:dismiss-site-wide', notificationId)
  }

  public markAsRead(notificationId: string) {
    this.socket?.emit('notification:mark-read', notificationId)
  }

  public markAllAsRead() {
    this.socket?.emit('notification:mark-all-read')
    this.setUnreadCount(0)
  }

  private updateUnreadCount(delta: number) {
    this.unreadCount = Math.max(0, this.unreadCount + delta)
    this.unreadListeners.forEach(listener => listener(this.unreadCount))
  }

  private setUnreadCount(count: number) {
    this.unreadCount = count
    this.unreadListeners.forEach(listener => listener(this.unreadCount))
  }

  // Send notifications (for triggering from other parts of the app)
  public emit(event: NotificationEvent, data: Partial<NotificationData>) {
    if (!this.socket) return
    
    this.socket.emit('notification:trigger', {
      type: event,
      ...data
    })
  }

  public emitSiteWide(data: Partial<SiteWideNotification>) {
    if (!this.socket) return
    
    this.socket.emit('notification:trigger-site-wide', data)
  }

  public get isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  public disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }
}

// Singleton instance
export const notificationService = new NotificationSocketService()

// Helper functions for common notifications
export const notifyApiKeyCreated = (provider: string, keyName?: string) => {
  notificationService.emit(NotificationEvent.API_KEY_CREATED, {
    title: 'API Key Created',
    message: `New ${provider} API key ${keyName ? `"${keyName}" ` : ''}has been created`,
    priority: 'LOW',
    icon: 'key',
    iconColor: 'text-green-500',
    actionUrl: '/settings/api-keys',
    actionLabel: 'View Keys'
  })
}

export const notifyApiKeyExpiring = (provider: string, daysLeft: number) => {
  notificationService.emit(NotificationEvent.API_KEY_EXPIRING, {
    title: 'API Key Expiring Soon',
    message: `Your ${provider} API key will expire in ${daysLeft} days`,
    priority: daysLeft <= 3 ? 'HIGH' : 'MEDIUM',
    icon: 'alert-triangle',
    iconColor: 'text-yellow-500',
    actionUrl: '/settings/api-keys',
    actionLabel: 'Renew Key'
  })
}

export const notifyCostThreshold = (percentage: number, amount: number, limit: number) => {
  const event = percentage >= 100 
    ? NotificationEvent.COST_THRESHOLD_EXCEEDED
    : percentage >= 90 
    ? NotificationEvent.COST_THRESHOLD_CRITICAL
    : NotificationEvent.COST_THRESHOLD_WARNING
    
  notificationService.emit(event, {
    title: percentage >= 100 ? 'Cost Limit Exceeded!' : `Cost Alert: ${percentage}% of Limit`,
    message: `You've used $${amount.toFixed(2)} of your $${limit.toFixed(2)} monthly limit`,
    priority: percentage >= 100 ? 'CRITICAL' : percentage >= 90 ? 'HIGH' : 'MEDIUM',
    icon: 'dollar-sign',
    iconColor: percentage >= 100 ? 'text-red-500' : percentage >= 90 ? 'text-orange-500' : 'text-yellow-500',
    actionUrl: '/dashboard?tab=usage',
    actionLabel: 'View Usage',
    persistent: percentage >= 100
  })
}

export const notifyApiTestResult = (provider: string, success: boolean, latency?: number) => {
  notificationService.emit(
    success ? NotificationEvent.API_TEST_COMPLETED : NotificationEvent.API_TEST_FAILED,
    {
      title: success ? 'API Test Successful' : 'API Test Failed',
      message: success 
        ? `${provider} API is working correctly${latency ? ` (${latency}ms)` : ''}`
        : `Failed to connect to ${provider} API`,
      priority: success ? 'LOW' : 'HIGH',
      icon: success ? 'check-circle' : 'x-circle',
      iconColor: success ? 'text-green-500' : 'text-red-500',
      actionUrl: '/settings/api-keys',
      actionLabel: 'View Details'
    }
  )
}

export const notifyUserAdded = (userName: string, role: string) => {
  notificationService.emit(NotificationEvent.USER_CREATED, {
    title: 'New Team Member',
    message: `${userName} has joined as ${role}`,
    priority: 'LOW',
    icon: 'user-plus',
    iconColor: 'text-blue-500',
    actionUrl: '/settings/team',
    actionLabel: 'View Team'
  })
}

export const notifyOrgLimitWarning = (resource: string, percentage: number) => {
  notificationService.emit(NotificationEvent.ORG_LIMIT_WARNING, {
    title: 'Organization Limit Warning',
    message: `${resource} usage is at ${percentage}% of your organization limit`,
    priority: percentage >= 90 ? 'HIGH' : 'MEDIUM',
    icon: 'alert-triangle',
    iconColor: 'text-yellow-500',
    actionUrl: '/settings/billing',
    actionLabel: 'Upgrade Plan'
  })
}

export default notificationService