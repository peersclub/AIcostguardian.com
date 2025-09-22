import { slackNotificationService } from './slack-notifications.service'

/**
 * Event Notifier Service
 * Automatically triggers Slack notifications for various application events
 */
export class EventNotifier {

  /**
   * Notify when new AI chat session starts
   */
  static async notifyAIChatStarted(
    userId: string,
    organizationId: string,
    provider: string,
    model: string
  ): Promise<void> {
    try {
      await slackNotificationService.sendEventNotification('AI_CHAT_STARTED', {
        userId,
        organizationId,
        title: '🤖 AI Chat Session Started',
        message: `User started a new AI chat session using ${provider} (${model})`,
        context: {
          provider,
          model,
          startedAt: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Failed to notify AI chat started:', error)
    }
  }

  /**
   * Notify when cost threshold is exceeded
   */
  static async notifyCostThresholdExceeded(
    organizationId: string,
    currentCost: number,
    threshold: number,
    provider: string,
    timeframe: string = 'daily'
  ): Promise<void> {
    try {
      const exceedancePercent = ((currentCost - threshold) / threshold * 100).toFixed(1)

      await slackNotificationService.sendEventNotification('COST_THRESHOLD_EXCEEDED', {
        organizationId,
        title: '🚨 Cost Threshold Exceeded',
        message: `${timeframe} cost limit exceeded for ${provider}! Current: $${currentCost.toFixed(2)}, Threshold: $${threshold.toFixed(2)} (+${exceedancePercent}%)`,
        context: {
          currentCost,
          threshold,
          exceedancePercent: parseFloat(exceedancePercent),
          provider,
          timeframe
        }
      })
    } catch (error) {
      console.error('Failed to notify cost threshold exceeded:', error)
    }
  }

  /**
   * Notify when API rate limit is hit
   */
  static async notifyRateLimitExceeded(
    userId: string,
    organizationId: string,
    provider: string,
    endpoint: string,
    resetTime?: Date
  ): Promise<void> {
    try {
      const resetMessage = resetTime
        ? ` Rate limit resets at ${resetTime.toLocaleTimeString()}.`
        : ''

      await slackNotificationService.sendEventNotification('API_RATE_LIMIT_EXCEEDED', {
        userId,
        organizationId,
        title: '🚦 API Rate Limit Exceeded',
        message: `Rate limit exceeded for ${provider} ${endpoint}.${resetMessage}`,
        context: {
          provider,
          endpoint,
          resetTime: resetTime?.toISOString(),
          triggeredAt: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Failed to notify rate limit exceeded:', error)
    }
  }

  /**
   * Notify when user joins organization
   */
  static async notifyNewMember(
    userId: string,
    organizationId: string,
    userEmail: string,
    role: string,
    invitedBy?: string
  ): Promise<void> {
    try {
      const inviterMessage = invitedBy ? ` Invited by ${invitedBy}.` : ''

      await slackNotificationService.sendNewMemberNotification(
        userId,
        organizationId,
        userEmail,
        role
      )

      // Also send a more detailed notification
      await slackNotificationService.sendEventNotification('MEMBER_ACTIVATED', {
        userId,
        organizationId,
        title: '✅ Member Account Activated',
        message: `${userEmail} has successfully activated their account as ${role}.${inviterMessage}`,
        context: {
          userEmail,
          role,
          invitedBy,
          activatedAt: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Failed to notify new member:', error)
    }
  }

  /**
   * Notify when high token usage detected
   */
  static async notifyHighTokenUsage(
    userId: string,
    organizationId: string,
    tokenCount: number,
    estimatedCost: number,
    provider: string,
    model: string,
    conversationId?: string
  ): Promise<void> {
    try {
      await slackNotificationService.sendHighUsageAlert(
        userId,
        organizationId,
        tokenCount,
        estimatedCost,
        provider
      )

      // Additional context notification
      await slackNotificationService.sendEventNotification('HIGH_TOKEN_USAGE', {
        userId,
        organizationId,
        title: '📊 Detailed Token Usage Alert',
        message: `High token usage in conversation: ${tokenCount.toLocaleString()} tokens used with ${provider}/${model}`,
        context: {
          tokenCount,
          estimatedCost,
          provider,
          model,
          conversationId,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Failed to notify high token usage:', error)
    }
  }

  /**
   * Notify when API key is about to expire
   */
  static async notifyApiKeyExpiring(
    userId: string,
    organizationId: string,
    provider: string,
    keyName: string,
    expiresAt: Date
  ): Promise<void> {
    try {
      const daysUntilExpiration = Math.ceil(
        (expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )

      await slackNotificationService.sendApiKeyExpirationWarning(
        userId,
        organizationId,
        provider,
        daysUntilExpiration
      )
    } catch (error) {
      console.error('Failed to notify API key expiring:', error)
    }
  }

  /**
   * Notify when thread is shared
   */
  static async notifyThreadShared(
    threadId: string,
    ownerId: string,
    collaboratorId: string,
    organizationId: string,
    ownerEmail: string,
    collaboratorEmail: string
  ): Promise<void> {
    try {
      await slackNotificationService.sendCollaborationNotification(
        threadId,
        ownerEmail,
        collaboratorEmail,
        organizationId
      )
    } catch (error) {
      console.error('Failed to notify thread shared:', error)
    }
  }

  /**
   * Notify when unusual spending pattern detected
   */
  static async notifyUnusualSpending(
    organizationId: string,
    anomalyDetails: {
      provider: string
      expectedCost: number
      actualCost: number
      timeframe: string
      confidence: number
    }
  ): Promise<void> {
    try {
      const { provider, expectedCost, actualCost, timeframe, confidence } = anomalyDetails
      const deviationPercent = ((actualCost - expectedCost) / expectedCost * 100).toFixed(1)

      await slackNotificationService.sendEventNotification('UNUSUAL_SPENDING_PATTERN', {
        organizationId,
        title: '🔍 Unusual Spending Pattern Detected',
        message: `Anomalous spending detected for ${provider}: Expected $${expectedCost.toFixed(2)}, Actual $${actualCost.toFixed(2)} (${deviationPercent}% deviation) over ${timeframe}`,
        context: {
          provider,
          expectedCost,
          actualCost,
          deviationPercent: parseFloat(deviationPercent),
          timeframe,
          confidence,
          detectedAt: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Failed to notify unusual spending:', error)
    }
  }

  /**
   * Notify when payment fails
   */
  static async notifyPaymentFailed(
    organizationId: string,
    amount: number,
    reason: string,
    nextRetryDate?: Date
  ): Promise<void> {
    try {
      const retryMessage = nextRetryDate
        ? ` Next retry: ${nextRetryDate.toLocaleDateString()}.`
        : ''

      await slackNotificationService.sendEventNotification('PAYMENT_FAILED', {
        organizationId,
        title: '💳 Payment Failed',
        message: `Payment of $${amount.toFixed(2)} failed. Reason: ${reason}.${retryMessage}`,
        context: {
          amount,
          reason,
          nextRetryDate: nextRetryDate?.toISOString(),
          failedAt: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Failed to notify payment failed:', error)
    }
  }

  /**
   * Notify when system integration fails
   */
  static async notifyIntegrationFailure(
    organizationId: string,
    service: string,
    errorMessage: string,
    affectedFeatures: string[]
  ): Promise<void> {
    try {
      await slackNotificationService.sendEventNotification('INTEGRATION_FAILURE', {
        organizationId,
        title: '❌ System Integration Failure',
        message: `${service} integration failed: ${errorMessage}. Affected features: ${affectedFeatures.join(', ')}`,
        context: {
          service,
          errorMessage,
          affectedFeatures,
          failedAt: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Failed to notify integration failure:', error)
    }
  }

  /**
   * Send bulk activation completion notification
   */
  static async notifyBulkActivationComplete(
    activatedCount: number,
    organizationCount: number
  ): Promise<void> {
    try {
      await slackNotificationService.sendBulkActivationNotification(activatedCount)

      // Additional detailed notification
      await slackNotificationService.sendEventNotification('BULK_MEMBER_ACTIVATION', {
        title: '🎉 System-Wide Member Activation Complete',
        message: `Successfully activated ${activatedCount} members across ${organizationCount} organizations. All pending users now have full platform access.`,
        context: {
          activatedCount,
          organizationCount,
          completedAt: new Date().toISOString(),
          action: 'system_activation'
        }
      })
    } catch (error) {
      console.error('Failed to notify bulk activation complete:', error)
    }
  }

  /**
   * Send weekly cost summary
   */
  static async sendWeeklyCostSummary(
    organizationId: string,
    weeklyData: {
      totalCost: number
      costByProvider: Array<{ provider: string; cost: number }>
      topUsers: Array<{ email: string; cost: number }>
      insights: string[]
    }
  ): Promise<void> {
    try {
      await slackNotificationService.sendWeeklyCostReport(organizationId, weeklyData)
    } catch (error) {
      console.error('Failed to send weekly cost summary:', error)
    }
  }

  /**
   * Utility method to send custom event notification
   */
  static async sendCustomNotification(
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
      await slackNotificationService.sendEventNotification(eventType, data)
    } catch (error) {
      console.error(`Failed to send custom notification (${eventType}):`, error)
    }
  }
}

// Export for use throughout the application
export default EventNotifier