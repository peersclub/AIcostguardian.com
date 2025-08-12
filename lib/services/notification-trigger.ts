// Server-side notification trigger utility
import { prisma } from '../prisma'
import { NotificationEvent } from './notification-socket.service'

export interface NotificationTriggerData {
  type: NotificationEvent
  userId?: string
  organizationId?: string
  title: string
  message: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  icon?: string
  iconColor?: string
  actionUrl?: string
  actionLabel?: string
  metadata?: Record<string, any>
}

/**
 * Server-side function to trigger notifications
 * This creates the notification in the database and will be picked up by Socket.io
 */
export async function triggerNotification(data: NotificationTriggerData) {
  try {
    // Map NotificationEvent to database NotificationType
    const typeMapping: Record<string, string> = {
      'API_KEY_CREATED': 'SERVICE_UPDATE',
      'API_KEY_UPDATED': 'SERVICE_UPDATE',
      'API_KEY_DELETED': 'SERVICE_UPDATE',
      'API_KEY_EXPIRING': 'API_KEY_EXPIRING',
      'API_KEY_EXPIRED': 'API_KEY_EXPIRED',
      'USER_CREATED': 'NEW_TEAM_MEMBER',
      'USER_UPDATED': 'SERVICE_UPDATE',
      'USER_DELETED': 'SERVICE_UPDATE',
      'USER_ROLE_CHANGED': 'SERVICE_UPDATE',
      'USER_JOINED_ORG': 'NEW_TEAM_MEMBER',
      'ORG_CREATED': 'SERVICE_UPDATE',
      'ORG_UPDATED': 'SERVICE_UPDATE',
      'ORG_SUBSCRIPTION_CHANGED': 'SERVICE_UPDATE',
      'ORG_LIMIT_WARNING': 'USAGE_QUOTA_WARNING',
      'ORG_LIMIT_EXCEEDED': 'USAGE_QUOTA_EXCEEDED',
      'COST_THRESHOLD_WARNING': 'COST_THRESHOLD_WARNING',
      'COST_THRESHOLD_CRITICAL': 'COST_THRESHOLD_CRITICAL',
      'COST_THRESHOLD_EXCEEDED': 'COST_THRESHOLD_EXCEEDED',
      'DAILY_COST_SPIKE': 'DAILY_COST_SPIKE',
      'UNUSUAL_SPENDING_PATTERN': 'UNUSUAL_SPENDING_PATTERN',
      'API_TEST_STARTED': 'SERVICE_UPDATE',
      'API_TEST_COMPLETED': 'SERVICE_UPDATE',
      'API_TEST_FAILED': 'INTEGRATION_FAILURE',
      'API_PROVIDER_OUTAGE': 'PROVIDER_OUTAGE',
      'API_RATE_LIMIT_WARNING': 'API_RATE_LIMIT_WARNING',
      'API_RATE_LIMIT_EXCEEDED': 'API_RATE_LIMIT_EXCEEDED',
      'THREAD_SHARED': 'SERVICE_UPDATE',
      'THREAD_COLLABORATION_INVITE': 'NEW_TEAM_MEMBER',
      'THREAD_MESSAGE_RECEIVED': 'SERVICE_UPDATE',
      'SYSTEM_UPDATE': 'SERVICE_UPDATE',
      'MAINTENANCE_SCHEDULED': 'SERVICE_UPDATE',
      'SECURITY_ALERT': 'SUSPICIOUS_ACTIVITY',
    }

    const notificationType = typeMapping[data.type] || 'SERVICE_UPDATE'

    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        organizationId: data.organizationId,
        type: notificationType as any,
        priority: data.priority || 'MEDIUM',
        title: data.title,
        message: data.message,
        status: 'SENT',
        channels: { inApp: true },
        metadata: {
          ...data.metadata,
          originalType: data.type,
          icon: data.icon,
          iconColor: data.iconColor,
          actionUrl: data.actionUrl,
          actionLabel: data.actionLabel,
        },
        deliveredAt: new Date(),
      },
    })

    // The Socket.io server will pick this up via database listeners or polling
    // and broadcast to connected clients
    
    return notification
  } catch (error) {
    console.error('Error triggering notification:', error)
    throw error
  }
}

// Helper functions for common notification scenarios
export async function notifyApiKeyCreatedServer(
  userId: string,
  provider: string,
  keyName?: string
) {
  return triggerNotification({
    type: NotificationEvent.API_KEY_CREATED,
    userId,
    title: 'API Key Created',
    message: `New ${provider} API key ${keyName ? `"${keyName}" ` : ''}has been created`,
    priority: 'LOW',
    icon: 'key',
    iconColor: 'text-green-500',
    actionUrl: '/settings/api-keys',
    actionLabel: 'View Keys',
  })
}

export async function notifyApiKeyUpdatedServer(
  userId: string,
  provider: string
) {
  return triggerNotification({
    type: NotificationEvent.API_KEY_UPDATED,
    userId,
    title: 'API Key Updated',
    message: `Your ${provider} API key has been updated`,
    priority: 'LOW',
    icon: 'key',
    iconColor: 'text-blue-500',
    actionUrl: '/settings/api-keys',
    actionLabel: 'View Keys',
  })
}

export async function notifyApiKeyDeletedServer(
  userId: string,
  provider: string
) {
  return triggerNotification({
    type: NotificationEvent.API_KEY_DELETED,
    userId,
    title: 'API Key Deleted',
    message: `Your ${provider} API key has been deleted`,
    priority: 'MEDIUM',
    icon: 'key',
    iconColor: 'text-red-500',
  })
}

export async function notifyUserAddedServer(
  organizationId: string,
  userName: string,
  role: string,
  addedByName?: string
) {
  return triggerNotification({
    type: NotificationEvent.USER_CREATED,
    organizationId,
    title: 'New Team Member',
    message: `${userName} has joined as ${role}${addedByName ? ` (added by ${addedByName})` : ''}`,
    priority: 'LOW',
    icon: 'users',
    iconColor: 'text-blue-500',
    actionUrl: '/settings/team',
    actionLabel: 'View Team',
  })
}

export async function notifyApiTestResultServer(
  userId: string,
  provider: string,
  success: boolean,
  latency?: number,
  error?: string
) {
  return triggerNotification({
    type: success ? NotificationEvent.API_TEST_COMPLETED : NotificationEvent.API_TEST_FAILED,
    userId,
    title: success ? 'API Test Successful' : 'API Test Failed',
    message: success
      ? `${provider} API is working correctly${latency ? ` (${latency}ms)` : ''}`
      : `Failed to connect to ${provider} API${error ? `: ${error}` : ''}`,
    priority: success ? 'LOW' : 'HIGH',
    icon: success ? 'check-circle' : 'x-circle',
    iconColor: success ? 'text-green-500' : 'text-red-500',
    actionUrl: '/settings/api-keys',
    actionLabel: 'View Details',
  })
}

export async function notifyCostThresholdServer(
  userId: string,
  organizationId: string,
  percentage: number,
  amount: number,
  limit: number
) {
  const event =
    percentage >= 100
      ? NotificationEvent.COST_THRESHOLD_EXCEEDED
      : percentage >= 90
      ? NotificationEvent.COST_THRESHOLD_CRITICAL
      : NotificationEvent.COST_THRESHOLD_WARNING

  return triggerNotification({
    type: event,
    userId,
    organizationId,
    title:
      percentage >= 100
        ? 'Cost Limit Exceeded!'
        : `Cost Alert: ${percentage}% of Limit`,
    message: `You've used $${amount.toFixed(2)} of your $${limit.toFixed(
      2
    )} monthly limit`,
    priority: percentage >= 100 ? 'CRITICAL' : percentage >= 90 ? 'HIGH' : 'MEDIUM',
    icon: 'dollar-sign',
    iconColor:
      percentage >= 100
        ? 'text-red-500'
        : percentage >= 90
        ? 'text-orange-500'
        : 'text-yellow-500',
    actionUrl: '/dashboard?tab=usage',
    actionLabel: 'View Usage',
  })
}

export async function notifyOrgLimitWarningServer(
  organizationId: string,
  resource: string,
  percentage: number
) {
  return triggerNotification({
    type: NotificationEvent.ORG_LIMIT_WARNING,
    organizationId,
    title: 'Organization Limit Warning',
    message: `${resource} usage is at ${percentage}% of your organization limit`,
    priority: percentage >= 90 ? 'HIGH' : 'MEDIUM',
    icon: 'alert-triangle',
    iconColor: 'text-yellow-500',
    actionUrl: '/settings/billing',
    actionLabel: 'Upgrade Plan',
  })
}