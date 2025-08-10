import {
  NotificationData,
  NotificationRule,
  NotificationConditions,
  EvaluationContext,
  DeliveryResult,
  QueueJob,
  BatchNotification,
  ConditionEvaluator,
  NotificationChannel,
  NotificationServiceConfig
} from './types'
import { NotificationTemplateEngine } from './template.engine'
import { NotificationQueueService } from './queue.service'
import { NotificationRealtimeService } from './realtime.service'
import { EmailNotificationChannel } from './channels/email.channel'
import { SlackNotificationChannel } from './channels/slack.channel'
import { InAppNotificationChannel } from './channels/in-app.channel'
import { WebhookNotificationChannel } from './channels/webhook.channel'
import prisma from '@/lib/prisma'

/**
 * Main notification service orchestrator
 * Handles rule evaluation, routing, throttling, and delivery coordination
 */
export class NotificationService {
  private templateEngine: NotificationTemplateEngine
  private queueService: NotificationQueueService
  private realtimeService: NotificationRealtimeService
  private channels = new Map<string, NotificationChannel>()
  private conditionEvaluator: ConditionEvaluator
  private config: NotificationServiceConfig

  // Throttling and cooldown tracking
  private ruleThrottling = new Map<string, { lastTriggered: Date; count: number }>()
  private userQuietHours = new Map<string, { start: string; end: string; timezone: string }>()

  constructor(
    config: NotificationServiceConfig,
    templateEngine?: NotificationTemplateEngine,
    queueService?: NotificationQueueService,
    realtimeService?: NotificationRealtimeService
  ) {
    this.config = config
    this.templateEngine = templateEngine || new NotificationTemplateEngine()
    this.queueService = queueService || new NotificationQueueService()
    this.realtimeService = realtimeService || new NotificationRealtimeService()
    this.conditionEvaluator = new DefaultConditionEvaluator()

    this.initializeChannels()
    this.startScheduledNotifications()
  }

  /**
   * Process a notification and route to appropriate channels
   */
  async processNotification(
    notification: NotificationData,
    rules?: NotificationRule[]
  ): Promise<DeliveryResult[]> {
    try {
      console.log(`Processing notification: ${notification.id} (${notification.type})`)

      // Get applicable rules
      const applicableRules = rules || await this.getApplicableRules(notification)
      
      if (applicableRules.length === 0) {
        console.log(`No rules found for notification ${notification.id}`)
        return []
      }

      const results: DeliveryResult[] = []

      // Process each rule
      for (const rule of applicableRules) {
        try {
          const ruleResults = await this.processRule(notification, rule)
          results.push(...ruleResults)
        } catch (error) {
          console.error(`Failed to process rule ${rule.id}:`, error)
          
          // Create failed delivery result
          results.push({
            success: false,
            channel: 'UNKNOWN' as any,
            destination: 'unknown',
            error: `Rule processing failed: ${(error as Error).message}`,
            attempts: 1,
            metadata: {
              ruleId: rule.id,
              ruleName: rule.name
            }
          })
        }
      }

      // Update notification status
      await this.updateNotificationStatus(notification.id!, results)

      return results
    } catch (error) {
      console.error('Failed to process notification:', error)
      throw error
    }
  }

  /**
   * Send a direct notification bypassing rules
   */
  async sendDirect(
    notification: NotificationData,
    channels: Array<{ type: string; destination: string; config?: any }>
  ): Promise<DeliveryResult[]> {
    try {
      console.log(`Sending direct notification: ${notification.id}`)

      const results: DeliveryResult[] = []

      for (const channelConfig of channels) {
        try {
          const result = await this.deliverToChannel(
            notification,
            channelConfig.type as any,
            channelConfig.destination,
            channelConfig.config || {}
          )
          results.push(result)
        } catch (error) {
          console.error(`Direct delivery failed for channel ${channelConfig.type}:`, error)
          
          results.push({
            success: false,
            channel: channelConfig.type as any,
            destination: channelConfig.destination,
            error: (error as Error).message,
            attempts: 1
          })
        }
      }

      return results
    } catch (error) {
      console.error('Failed to send direct notification:', error)
      throw error
    }
  }

  /**
   * Create and process a notification from usage data
   */
  async createFromUsage(
    userId: string,
    organizationId: string,
    usageData: any
  ): Promise<NotificationData[]> {
    try {
      const context = await this.buildEvaluationContext(userId, organizationId, usageData)
      const rules = await this.getActiveRules(userId, organizationId)
      
      const triggeredNotifications: NotificationData[] = []

      for (const rule of rules) {
        if (await this.evaluateRule(rule, context)) {
          const notification = await this.createNotificationFromRule(rule, context)
          triggeredNotifications.push(notification)

          // Queue for processing
          await this.queueNotification(notification, rule)
        }
      }

      return triggeredNotifications
    } catch (error) {
      console.error('Failed to create notifications from usage:', error)
      return []
    }
  }

  /**
   * Schedule a notification for future delivery
   */
  async scheduleNotification(
    notification: NotificationData,
    scheduledFor: Date,
    ruleId?: string
  ): Promise<void> {
    const job: QueueJob = {
      id: `scheduled_${notification.id}_${Date.now()}`,
      type: 'notification',
      priority: this.getPriorityNumber(notification.priority),
      data: { notification, ruleId },
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      scheduledFor
    }

    await this.queueService.enqueue(job)
    console.log(`Notification ${notification.id} scheduled for ${scheduledFor}`)
  }

  /**
   * Create and send batch notifications (digests)
   */
  async createBatchNotification(
    userId: string,
    notifications: NotificationData[],
    frequency: 'hourly' | 'daily' | 'weekly'
  ): Promise<void> {
    if (notifications.length === 0) return

    try {
      const batchNotification: BatchNotification = {
        userId,
        notifications,
        frequency,
        template: `${frequency}_digest`,
        scheduledFor: new Date()
      }

      const job: QueueJob = {
        id: `batch_${userId}_${Date.now()}`,
        type: 'batch',
        priority: 5, // Medium priority for batches
        data: batchNotification,
        attempts: 0,
        maxAttempts: 3,
        createdAt: new Date()
      }

      await this.queueService.enqueue(job)
      console.log(`Batch notification created for user ${userId} (${notifications.length} items)`)
    } catch (error) {
      console.error('Failed to create batch notification:', error)
      throw error
    }
  }

  /**
   * Get notification statistics
   */
  async getStats(organizationId?: string): Promise<any> {
    try {
      const [queueStats, realtimeStats, deliveryStats] = await Promise.all([
        this.queueService.getStats(),
        Promise.resolve(this.realtimeService.getStats()),
        this.getDeliveryStats(organizationId)
      ])

      return {
        queue: queueStats,
        realtime: realtimeStats,
        delivery: deliveryStats,
        throttling: {
          activeThrottles: this.ruleThrottling.size,
          totalRuleExecutions: Array.from(this.ruleThrottling.values())
            .reduce((total, throttle) => total + throttle.count, 0)
        }
      }
    } catch (error) {
      console.error('Failed to get notification stats:', error)
      return null
    }
  }

  // Private methods

  private initializeChannels(): void {
    // Initialize email channel
    if (this.config.channels.email.enabled) {
      this.channels.set('EMAIL', new EmailNotificationChannel(this.config.channels.email))
    }

    // Initialize Slack channel
    if (this.config.channels.slack.enabled) {
      this.channels.set('SLACK', new SlackNotificationChannel(this.config.channels.slack))
    }

    // Initialize webhook channel
    if (this.config.channels.webhook.enabled) {
      this.channels.set('WEBHOOK', new WebhookNotificationChannel())
    }

    // Initialize in-app channel
    if (this.config.channels.inApp.enabled) {
      this.channels.set('IN_APP', new InAppNotificationChannel(this.realtimeService))
    }

    console.log(`Initialized ${this.channels.size} notification channels`)
  }

  private async processRule(
    notification: NotificationData,
    rule: NotificationRule
  ): Promise<DeliveryResult[]> {
    // Check throttling/cooldown
    if (await this.isThrottled(rule)) {
      console.log(`Rule ${rule.id} is throttled, skipping`)
      return []
    }

    // Check quiet hours
    if (await this.isInQuietHours(rule.userId)) {
      console.log(`User ${rule.userId} is in quiet hours, skipping`)
      return []
    }

    // Update throttling
    await this.updateThrottling(rule)

    const results: DeliveryResult[] = []

    // Process each channel
    for (const channelConfig of rule.channels) {
      if (!channelConfig.enabled) continue

      try {
        const result = await this.deliverToChannel(
          notification,
          channelConfig.type,
          channelConfig.destination,
          channelConfig.config || {}
        )
        results.push(result)
      } catch (error) {
        console.error(`Delivery failed for channel ${channelConfig.type}:`, error)
        
        results.push({
          success: false,
          channel: channelConfig.type,
          destination: channelConfig.destination,
          error: (error as Error).message,
          attempts: 1,
          metadata: {
            ruleId: rule.id,
            channelConfig
          }
        })
      }
    }

    return results
  }

  private async deliverToChannel(
    notification: NotificationData,
    channelType: any,
    destination: string,
    channelConfig: any
  ): Promise<DeliveryResult> {
    const channel = this.channels.get(channelType)
    if (!channel) {
      throw new Error(`Channel ${channelType} not configured`)
    }

    // Add destination to channel config
    const config = { ...channelConfig, destination }

    // Render template if needed
    let template
    try {
      template = await this.templateEngine.render(
        `${notification.type.toLowerCase()}_${channelType.toLowerCase()}`,
        {
          user: await this.getUserData(notification.userId),
          organization: await this.getOrganizationData(notification.organizationId),
          notification: {
            type: notification.type,
            priority: notification.priority,
            title: notification.title,
            message: notification.message,
            data: notification.data
          },
          context: notification.data?.context || {},
          branding: this.config.templates.brandConfig
        },
        notification.type,
        channelType
      )
    } catch (error) {
      console.warn(`Template rendering failed, using raw content:`, (error as Error).message)
    }

    // Deliver notification
    return channel.send(notification, config, template)
  }

  private async getApplicableRules(notification: NotificationData): Promise<NotificationRule[]> {
    try {
      const dbRules = await prisma.notificationRule.findMany({
        where: {
          userId: notification.userId,
          organizationId: notification.organizationId,
          type: notification.type,
          enabled: true
        },
        include: {
          channels: true
        }
      })

      // Convert to our internal format
      return dbRules.map(rule => ({
        id: rule.id,
        userId: rule.userId,
        organizationId: rule.organizationId,
        name: rule.name,
        description: rule.description || undefined,
        type: rule.type,
        enabled: rule.enabled,
        conditions: rule.conditions as NotificationConditions,
        threshold: rule.threshold || undefined,
        comparisonOp: rule.comparisonOp as any,
        timeWindow: rule.timeWindow || undefined,
        schedule: rule.schedule || undefined,
        timezone: rule.timezone,
        cooldownMinutes: rule.cooldownMinutes,
        maxPerDay: rule.maxPerDay,
        priority: rule.priority,
        tags: rule.tags,
        channels: rule.channels.map(ch => ({
          type: ch.type,
          destination: ch.destination,
          config: ch.config as any,
          enabled: ch.enabled,
          includeDetails: ch.includeDetails,
          format: ch.format as any
        }))
      }))
    } catch (error) {
      console.error('Failed to get applicable rules:', error)
      return []
    }
  }

  private async evaluateRule(rule: NotificationRule, context: EvaluationContext): Promise<boolean> {
    try {
      return this.conditionEvaluator.evaluate(rule.conditions, context)
    } catch (error) {
      console.error(`Rule evaluation failed for ${rule.id}:`, error)
      return false
    }
  }

  private async buildEvaluationContext(
    userId: string,
    organizationId: string,
    usageData: any
  ): Promise<EvaluationContext> {
    // Get current and historical data for evaluation
    const [currentCost, previousCost, alerts] = await Promise.all([
      this.getCurrentCost(userId, organizationId),
      this.getPreviousCost(userId, organizationId),
      this.getActiveAlerts(userId, organizationId)
    ])

    return {
      userId,
      organizationId,
      currentCost,
      previousCost,
      costIncrease: currentCost - previousCost,
      usageData: Array.isArray(usageData) ? usageData : [usageData],
      timeframe: {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        end: new Date()
      },
      alerts,
      metadata: {
        evaluatedAt: new Date().toISOString()
      }
    }
  }

  private async createNotificationFromRule(
    rule: NotificationRule,
    context: EvaluationContext
  ): Promise<NotificationData> {
    return {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      userId: rule.userId,
      organizationId: rule.organizationId,
      type: rule.type,
      priority: rule.priority,
      title: `${rule.name}: Alert Triggered`,
      message: rule.description || 'A notification rule has been triggered.',
      data: {
        rule: {
          id: rule.id,
          name: rule.name,
          type: rule.type
        },
        context: {
          currentCost: context.currentCost,
          previousCost: context.previousCost,
          costIncrease: context.costIncrease,
          timeframe: `${context.timeframe.start.toISOString()} to ${context.timeframe.end.toISOString()}`
        },
        evaluation: {
          triggeredAt: new Date().toISOString(),
          conditions: rule.conditions
        }
      }
    }
  }

  private async queueNotification(
    notification: NotificationData,
    rule: NotificationRule
  ): Promise<void> {
    const job: QueueJob = {
      id: `notif_${notification.id}`,
      type: 'notification',
      priority: this.getPriorityNumber(notification.priority),
      data: { notification, rule },
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date()
    }

    await this.queueService.enqueue(job)
  }

  private async isThrottled(rule: NotificationRule): Promise<boolean> {
    const throttle = this.ruleThrottling.get(rule.id!)
    if (!throttle) return false

    const now = new Date()
    const timeSinceLastTrigger = now.getTime() - throttle.lastTriggered.getTime()
    const cooldownMs = rule.cooldownMinutes * 60 * 1000

    // Check cooldown period
    if (timeSinceLastTrigger < cooldownMs) {
      return true
    }

    // Check daily limit
    const dayStart = new Date()
    dayStart.setHours(0, 0, 0, 0)
    
    if (throttle.lastTriggered >= dayStart && throttle.count >= rule.maxPerDay) {
      return true
    }

    return false
  }

  private async updateThrottling(rule: NotificationRule): Promise<void> {
    const now = new Date()
    const existing = this.ruleThrottling.get(rule.id!)
    
    const dayStart = new Date()
    dayStart.setHours(0, 0, 0, 0)

    // Reset daily count if it's a new day
    const count = existing && existing.lastTriggered >= dayStart ? existing.count + 1 : 1

    this.ruleThrottling.set(rule.id!, {
      lastTriggered: now,
      count
    })

    // Update database
    await prisma.notificationRule.update({
      where: { id: rule.id },
      data: {
        lastTriggeredAt: now,
        triggerCount: count
      }
    })
  }

  private async isInQuietHours(userId: string): Promise<boolean> {
    try {
      const preferences = await prisma.notificationPreferences.findUnique({
        where: { userId }
      })

      if (!preferences?.quietHoursEnabled || !preferences.quietHoursStart || !preferences.quietHoursEnd) {
        return false
      }

      const now = new Date()
      const timezone = preferences.timezone || 'UTC'
      
      // Convert to user's timezone (simplified implementation)
      const userTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
      const currentHour = userTime.getHours()
      const currentMinute = userTime.getMinutes()
      const currentTime = currentHour * 60 + currentMinute

      const [startHour, startMin] = preferences.quietHoursStart.split(':').map(Number)
      const [endHour, endMin] = preferences.quietHoursEnd.split(':').map(Number)
      const startTime = startHour * 60 + startMin
      const endTime = endHour * 60 + endMin

      // Handle overnight quiet hours
      if (startTime > endTime) {
        return currentTime >= startTime || currentTime <= endTime
      } else {
        return currentTime >= startTime && currentTime <= endTime
      }
    } catch (error) {
      console.error('Failed to check quiet hours:', error)
      return false
    }
  }

  private getPriorityNumber(priority: string): number {
    const priorityMap: Record<string, number> = {
      'CRITICAL': 1,
      'HIGH': 2,
      'MEDIUM': 5,
      'LOW': 8
    }
    return priorityMap[priority] || 5
  }

  private async updateNotificationStatus(
    notificationId: string,
    results: DeliveryResult[]
  ): Promise<void> {
    try {
      const allSuccessful = results.every(r => r.success)
      const channels: Record<string, any> = {}

      for (const result of results) {
        channels[result.channel] = {
          success: result.success,
          messageId: result.messageId,
          error: result.error,
          attempts: result.attempts,
          latency: result.latency,
          timestamp: new Date().toISOString()
        }
      }

      await prisma.notification.updateMany({
        where: { id: notificationId },
        data: {
          status: allSuccessful ? 'DELIVERED' : (results.some(r => r.success) ? 'SENT' : 'FAILED'),
          channels,
          deliveredAt: allSuccessful ? new Date() : undefined,
          attempts: Math.max(...results.map(r => r.attempts || 1)),
          error: allSuccessful ? undefined : results.find(r => !r.success)?.error
        }
      })
    } catch (error) {
      console.error('Failed to update notification status:', error)
    }
  }

  private async startScheduledNotifications(): Promise<void> {
    // This would integrate with a cron job scheduler
    // For now, just log that scheduled notifications are ready
    console.log('Scheduled notification processing is ready')
  }

  private async getUserData(userId: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { id: true, name: true, email: true, company: true }
      })
      return user
    } catch (error) {
      console.error('Failed to get user data:', error)
      return { id: userId, name: 'Unknown User', email: 'unknown@example.com' }
    }
  }

  private async getOrganizationData(organizationId: string): Promise<any> {
    try {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { id: true, name: true, domain: true }
      })
      return org
    } catch (error) {
      console.error('Failed to get organization data:', error)
      return { id: organizationId, name: 'Unknown Organization', domain: 'unknown.com' }
    }
  }

  private async getCurrentCost(userId: string, organizationId: string): Promise<number> {
    try {
      const result = await prisma.usageLog.aggregate({
        where: {
          userId,
          organizationId,
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        _sum: { cost: true }
      })
      return result._sum.cost || 0
    } catch (error) {
      console.error('Failed to get current cost:', error)
      return 0
    }
  }

  private async getPreviousCost(userId: string, organizationId: string): Promise<number> {
    try {
      const result = await prisma.usageLog.aggregate({
        where: {
          userId,
          organizationId,
          timestamp: {
            gte: new Date(Date.now() - 48 * 60 * 60 * 1000), // 24-48 hours ago
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        _sum: { cost: true }
      })
      return result._sum.cost || 0
    } catch (error) {
      console.error('Failed to get previous cost:', error)
      return 0
    }
  }

  private async getActiveAlerts(userId: string, organizationId: string): Promise<any[]> {
    try {
      return await prisma.alert.findMany({
        where: { userId, isActive: true },
        orderBy: { triggeredAt: 'desc' },
        take: 10
      })
    } catch (error) {
      console.error('Failed to get active alerts:', error)
      return []
    }
  }

  private async getActiveRules(userId: string, organizationId: string): Promise<NotificationRule[]> {
    return this.getApplicableRules({ userId, organizationId } as NotificationData)
  }

  private async getDeliveryStats(organizationId?: string): Promise<any> {
    try {
      const where = organizationId ? { organizationId } : {}
      
      const [total, delivered, failed, pending] = await Promise.all([
        prisma.notification.count({ where }),
        prisma.notification.count({ where: { ...where, status: 'DELIVERED' } }),
        prisma.notification.count({ where: { ...where, status: 'FAILED' } }),
        prisma.notification.count({ where: { ...where, status: 'PENDING' } })
      ])

      return {
        total,
        delivered,
        failed,
        pending,
        deliveryRate: total > 0 ? (delivered / total) * 100 : 0
      }
    } catch (error) {
      console.error('Failed to get delivery stats:', error)
      return { total: 0, delivered: 0, failed: 0, pending: 0, deliveryRate: 0 }
    }
  }
}

/**
 * Default condition evaluator implementation
 */
class DefaultConditionEvaluator implements ConditionEvaluator {
  evaluate(conditions: NotificationConditions, context: EvaluationContext): boolean {
    try {
      // Cost threshold evaluation
      if (conditions.costThreshold !== undefined) {
        if (context.currentCost < conditions.costThreshold) {
          return false
        }
      }

      // Usage threshold evaluation
      if (conditions.usageThreshold !== undefined) {
        const totalUsage = context.usageData.reduce((sum, usage) => sum + (usage.tokens || 0), 0)
        if (totalUsage < conditions.usageThreshold) {
          return false
        }
      }

      // Provider filters
      if (conditions.providerFilters?.length) {
        const hasMatchingProvider = context.usageData.some(usage =>
          conditions.providerFilters!.includes(usage.provider)
        )
        if (!hasMatchingProvider) {
          return false
        }
      }

      // Model filters
      if (conditions.modelFilters?.length) {
        const hasMatchingModel = context.usageData.some(usage =>
          conditions.modelFilters!.includes(usage.model)
        )
        if (!hasMatchingModel) {
          return false
        }
      }

      // Custom conditions
      if (conditions.customConditions?.length) {
        for (const customCondition of conditions.customConditions) {
          if (!this.evaluateCustomCondition(customCondition, context)) {
            return false
          }
        }
      }

      return true
    } catch (error) {
      console.error('Condition evaluation failed:', error)
      return false
    }
  }

  private evaluateCustomCondition(condition: any, context: EvaluationContext): boolean {
    const { field, operator, value } = condition
    
    // Get field value from context
    const fieldValue = this.getFieldValue(field, context)
    
    // Evaluate based on operator
    switch (operator) {
      case 'gt': return fieldValue > value
      case 'gte': return fieldValue >= value
      case 'lt': return fieldValue < value
      case 'lte': return fieldValue <= value
      case 'eq': return fieldValue === value
      case 'neq': return fieldValue !== value
      case 'contains': return String(fieldValue).includes(String(value))
      default:
        console.warn(`Unknown operator: ${operator}`)
        return false
    }
  }

  private getFieldValue(field: string, context: EvaluationContext): any {
    const parts = field.split('.')
    let value: any = context
    
    for (const part of parts) {
      value = value?.[part]
      if (value === undefined) break
    }
    
    return value
  }
}

// Default configuration
export const DEFAULT_NOTIFICATION_CONFIG: NotificationServiceConfig = {
  queue: {
    concurrency: 5,
    retryDelays: [1000, 5000, 15000, 60000, 300000],
    maxRetries: 5,
    defaultJobExpiry: 86400,
    cleanupInterval: 300000
  },
  retry: {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 300000,
    backoffMultiplier: 2.0,
    jitter: true
  },
  channels: {
    email: {
      enabled: true,
      providers: {
        sendgrid: {
          apiKey: process.env.SENDGRID_API_KEY || '',
          fromEmail: process.env.FROM_EMAIL || 'noreply@ai-cost-guardian.com',
          fromName: 'AI Cost Guardian'
        }
      }
    },
    slack: {
      enabled: !!process.env.SLACK_BOT_TOKEN,
      botToken: process.env.SLACK_BOT_TOKEN
    },
    webhook: {
      enabled: true,
      defaultTimeout: 10000,
      maxRetries: 3
    },
    inApp: {
      enabled: true,
      persistDuration: 86400 * 7 // 7 days
    }
  },
  templates: {
    defaultLocale: 'en',
    supportedLocales: ['en'],
    brandConfig: {
      primaryColor: '#3b82f6',
      logoUrl: '/logo.png',
      companyName: 'AI Cost Guardian',
      brandName: 'AI Cost Guardian',
      footerText: 'Manage your AI costs intelligently'
    }
  },
  realtime: {
    enabled: true,
    pingInterval: 30000,
    connectionTimeout: 60000
  }
}

// Singleton instance
export const notificationService = new NotificationService(DEFAULT_NOTIFICATION_CONFIG)

// Export for testing and custom configurations
export { DefaultConditionEvaluator }