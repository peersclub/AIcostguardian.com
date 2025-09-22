import { NextRequest } from 'next/server'
import EventNotifier from '@/lib/services/event-notifier'

/**
 * Slack Event Middleware
 * Automatically triggers Slack notifications for various API endpoints
 */
export class SlackEventMiddleware {

  /**
   * Hook into AI chat responses to monitor usage
   */
  static async onAIChatResponse(
    userId: string,
    organizationId: string,
    provider: string,
    model: string,
    tokenCount: number,
    estimatedCost: number
  ): Promise<void> {
    // Notify if high token usage (>10k tokens or >$1 cost)
    if (tokenCount > 10000 || estimatedCost > 1.0) {
      await EventNotifier.notifyHighTokenUsage(
        userId,
        organizationId,
        tokenCount,
        estimatedCost,
        provider,
        model
      )
    }
  }

  /**
   * Hook into user registration/activation
   */
  static async onUserActivated(
    userId: string,
    organizationId: string,
    userEmail: string,
    role: string,
    invitedBy?: string
  ): Promise<void> {
    await EventNotifier.notifyNewMember(
      userId,
      organizationId,
      userEmail,
      role,
      invitedBy
    )
  }

  /**
   * Hook into cost tracking
   */
  static async onCostThresholdCheck(
    organizationId: string,
    currentCost: number,
    threshold: number,
    provider: string,
    timeframe: string = 'daily'
  ): Promise<void> {
    const thresholdPercent = (currentCost / threshold) * 100

    if (thresholdPercent >= 100) {
      await EventNotifier.notifyCostThresholdExceeded(
        organizationId,
        currentCost,
        threshold,
        provider,
        timeframe
      )
    } else if (thresholdPercent >= 80) {
      await EventNotifier.sendCustomNotification('COST_THRESHOLD_WARNING', {
        organizationId,
        title: '⚠️ Cost Threshold Warning',
        message: `Approaching ${timeframe} cost limit for ${provider}: $${currentCost.toFixed(2)} of $${threshold.toFixed(2)} (${thresholdPercent.toFixed(1)}%)`,
        context: {
          currentCost,
          threshold,
          thresholdPercent,
          provider,
          timeframe
        }
      })
    }
  }

  /**
   * Hook into rate limit monitoring
   */
  static async onRateLimitHit(
    userId: string,
    organizationId: string,
    provider: string,
    endpoint: string,
    resetTime?: Date
  ): Promise<void> {
    await EventNotifier.notifyRateLimitExceeded(
      userId,
      organizationId,
      provider,
      endpoint,
      resetTime
    )
  }

  /**
   * Hook into thread sharing
   */
  static async onThreadShared(
    threadId: string,
    ownerId: string,
    collaboratorId: string,
    organizationId: string,
    ownerEmail: string,
    collaboratorEmail: string
  ): Promise<void> {
    await EventNotifier.notifyThreadShared(
      threadId,
      ownerId,
      collaboratorId,
      organizationId,
      ownerEmail,
      collaboratorEmail
    )
  }

  /**
   * Hook into payment failures
   */
  static async onPaymentFailed(
    organizationId: string,
    amount: number,
    reason: string,
    nextRetryDate?: Date
  ): Promise<void> {
    await EventNotifier.notifyPaymentFailed(
      organizationId,
      amount,
      reason,
      nextRetryDate
    )
  }

  /**
   * Hook into API key expiration monitoring
   */
  static async onApiKeyExpiring(
    userId: string,
    organizationId: string,
    provider: string,
    keyName: string,
    expiresAt: Date
  ): Promise<void> {
    await EventNotifier.notifyApiKeyExpiring(
      userId,
      organizationId,
      provider,
      keyName,
      expiresAt
    )
  }

  /**
   * Hook into system integration failures
   */
  static async onIntegrationFailure(
    organizationId: string,
    service: string,
    errorMessage: string,
    affectedFeatures: string[]
  ): Promise<void> {
    await EventNotifier.notifyIntegrationFailure(
      organizationId,
      service,
      errorMessage,
      affectedFeatures
    )
  }

  /**
   * Generic webhook trigger for any event
   */
  static async triggerWebhook(
    eventType: string,
    data: {
      userId?: string
      organizationId?: string
      title: string
      message: string
      context?: any
      metadata?: any
    }
  ): Promise<void> {
    try {
      // Send to Slack via webhook
      const webhookUrl = process.env.SLACK_WEBHOOK_URL
      if (webhookUrl) {
        const payload = {
          eventType,
          data,
          timestamp: new Date().toISOString()
        }

        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
      }

      // Also send via our internal service
      await EventNotifier.sendCustomNotification(eventType, data)

    } catch (error) {
      console.error(`Failed to trigger webhook for ${eventType}:`, error)
    }
  }
}

/**
 * Utility function to add Slack event tracking to API routes
 */
export function withSlackEvents<T extends any[]>(
  handler: (...args: T) => Promise<any>,
  eventConfig: {
    eventType: string
    extractData: (...args: T) => {
      userId?: string
      organizationId?: string
      title: string
      message: string
      context?: any
    }
  }
) {
  return async (...args: T) => {
    try {
      const result = await handler(...args)

      // Extract event data and send notification
      const eventData = eventConfig.extractData(...args)
      await SlackEventMiddleware.triggerWebhook(eventConfig.eventType, eventData)

      return result
    } catch (error) {
      // Send error notification
      await SlackEventMiddleware.triggerWebhook('API_ERROR', {
        title: `API Error in ${eventConfig.eventType}`,
        message: `Error occurred: ${(error as Error).message}`,
        context: {
          eventType: eventConfig.eventType,
          error: (error as Error).message,
          timestamp: new Date().toISOString()
        }
      })

      throw error
    }
  }
}

export default SlackEventMiddleware