/**
 * Unified Usage Tracking Service
 * Central service for all usage tracking and cost calculations
 * Standardizes token counting, cost calculation, and usage logging
 */

import { prisma } from '@/lib/prisma'
import { Provider } from './api-key.service'

export interface UsageInput {
  userId: string
  organizationId: string
  provider: Provider
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
  metadata?: any
  requestId?: string
}

export interface UsageStats {
  totalCost: number
  totalTokens: number
  totalRequests: number
  byProvider: Record<Provider, {
    cost: number
    tokens: number
    requests: number
  }>
  byModel: Record<string, {
    cost: number
    tokens: number
    requests: number
  }>
}

export interface CostCalculation {
  promptCost: number
  completionCost: number
  totalCost: number
}

// Standardized pricing per 1K tokens (keeping existing rates)
const PRICING = {
  openai: {
    'gpt-4o': { input: 0.005, output: 0.015 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    'gpt-3.5-turbo-16k': { input: 0.003, output: 0.004 },
  },
  claude: {
    'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
    'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
    'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
    'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
    'claude-2.1': { input: 0.008, output: 0.024 },
    'claude-2.0': { input: 0.008, output: 0.024 },
    'claude-instant-1.2': { input: 0.0008, output: 0.0024 },
  },
  gemini: {
    'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
    'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
    'gemini-pro': { input: 0.00025, output: 0.0005 },
    'gemini-pro-vision': { input: 0.00025, output: 0.0005 },
  },
  grok: {
    'grok-beta': { input: 0.005, output: 0.015 },
    'grok-2-beta': { input: 0.002, output: 0.01 },
  },
  perplexity: {
    'llama-3.1-sonar-small-128k-online': { input: 0.0002, output: 0.0002 },
    'llama-3.1-sonar-large-128k-online': { input: 0.001, output: 0.001 },
    'llama-3.1-sonar-huge-128k-online': { input: 0.005, output: 0.005 },
  },
  cohere: {
    'command': { input: 0.0015, output: 0.002 },
    'command-light': { input: 0.00015, output: 0.0006 },
    'command-r': { input: 0.0005, output: 0.0015 },
    'command-r-plus': { input: 0.003, output: 0.015 },
  },
  mistral: {
    'mistral-large-latest': { input: 0.004, output: 0.012 },
    'mistral-medium-latest': { input: 0.0027, output: 0.0081 },
    'mistral-small-latest': { input: 0.0002, output: 0.0006 },
    'open-mistral-7b': { input: 0.00025, output: 0.00025 },
    'open-mixtral-8x7b': { input: 0.0007, output: 0.0007 },
    'open-mixtral-8x22b': { input: 0.002, output: 0.006 },
  },
}

class UsageService {
  private static instance: UsageService

  private constructor() {}

  static getInstance(): UsageService {
    if (!UsageService.instance) {
      UsageService.instance = new UsageService()
    }
    return UsageService.instance
  }

  /**
   * Calculate cost for a specific model and token usage
   */
  calculateCost(
    provider: Provider,
    model: string,
    promptTokens: number,
    completionTokens: number
  ): CostCalculation {
    const providerPricing = PRICING[provider as keyof typeof PRICING]
    if (!providerPricing) {
      console.warn(`No pricing found for provider: ${provider}`)
      return { promptCost: 0, completionCost: 0, totalCost: 0 }
    }

    // Find the model pricing, with fallback to first available model
    let modelPricing: { input: number; output: number } | undefined = 
      providerPricing[model as keyof typeof providerPricing] as { input: number; output: number } | undefined
    
    if (!modelPricing) {
      // Try to find a partial match
      const modelKey = Object.keys(providerPricing).find(key => 
        model.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(model.toLowerCase())
      )
      
      if (modelKey) {
        modelPricing = providerPricing[modelKey as keyof typeof providerPricing] as { input: number; output: number }
      } else {
        // Fallback to first model in provider
        const firstModel = Object.keys(providerPricing)[0]
        modelPricing = providerPricing[firstModel as keyof typeof providerPricing] as { input: number; output: number }
        console.warn(`No pricing found for model ${model}, using ${firstModel} as fallback`)
      }
    }

    const promptCost = (promptTokens / 1000) * modelPricing.input
    const completionCost = (completionTokens / 1000) * modelPricing.output
    const totalCost = promptCost + completionCost

    return {
      promptCost: Math.round(promptCost * 1000000) / 1000000, // Round to 6 decimal places
      completionCost: Math.round(completionCost * 1000000) / 1000000,
      totalCost: Math.round(totalCost * 1000000) / 1000000
    }
  }

  /**
   * Log usage to database
   */
  async logUsage(input: UsageInput): Promise<void> {
    try {
      // Create usage log entry
      await prisma.usageLog.create({
        data: {
          userId: input.userId,
          organizationId: input.organizationId,
          provider: input.provider,
          model: input.model,
          promptTokens: input.promptTokens,
          completionTokens: input.completionTokens,
          totalTokens: input.totalTokens,
          cost: input.cost,
          metadata: input.metadata || {},
          timestamp: new Date()
        }
      })

      // Also create a Usage entry for backwards compatibility
      await prisma.usage.create({
        data: {
          userId: input.userId,
          provider: input.provider,
          model: input.model,
          inputTokens: input.promptTokens,
          outputTokens: input.completionTokens,
          totalTokens: input.totalTokens,
          cost: input.cost,
          requestId: input.requestId,
          metadata: input.metadata || {},
          timestamp: new Date()
        }
      })

      // Update organization monthly spend
      await this.updateOrganizationSpend(input.organizationId, input.cost)

      // Check and trigger alerts if needed
      await this.checkUsageAlerts(input.userId, input.organizationId, input.cost)

    } catch (error) {
      console.error('Failed to log usage:', error)
      // Don't throw - we don't want to break the API call if logging fails
    }
  }

  /**
   * Update organization monthly spend
   */
  private async updateOrganizationSpend(organizationId: string, cost: number): Promise<void> {
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        monthlySpend: {
          increment: cost
        }
      }
    })
  }

  /**
   * Check usage alerts and limits
   */
  private async checkUsageAlerts(
    userId: string, 
    organizationId: string, 
    cost: number
  ): Promise<void> {
    // Get organization with spending limit
    const org = await prisma.organization.findUnique({
      where: { id: organizationId }
    })

    if (!org) return

    // Check if spending limit exceeded
    if (org.spendingLimit && org.monthlySpend > org.spendingLimit) {
      await this.createAlert(userId, 'spending_limit_exceeded', {
        limit: org.spendingLimit,
        current: org.monthlySpend
      })
    }

    // Check if alert threshold reached
    if (org.alertThreshold && org.spendingLimit) {
      const thresholdAmount = (org.alertThreshold / 100) * org.spendingLimit
      if (org.monthlySpend > thresholdAmount) {
        await this.createAlert(userId, 'spending_threshold_reached', {
          threshold: org.alertThreshold,
          current: org.monthlySpend,
          limit: org.spendingLimit
        })
      }
    }
  }

  /**
   * Create an alert
   */
  private async createAlert(userId: string, type: string, metadata: any): Promise<void> {
    // Check if similar alert already exists in last 24 hours
    const existingAlert = await prisma.alert.findFirst({
      where: {
        userId,
        type,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })

    if (existingAlert) return

    await prisma.alert.create({
      data: {
        userId,
        type,
        provider: 'system',
        message: this.getAlertMessage(type, metadata),
        metadata,
        isActive: true
      }
    })
  }

  /**
   * Get alert message
   */
  private getAlertMessage(type: string, metadata: any): string {
    switch (type) {
      case 'spending_limit_exceeded':
        return `Monthly spending limit of $${metadata.limit} exceeded. Current: $${metadata.current.toFixed(2)}`
      case 'spending_threshold_reached':
        return `Spending alert: ${metadata.threshold}% of monthly limit reached. Current: $${metadata.current.toFixed(2)}`
      default:
        return 'Usage alert triggered'
    }
  }

  /**
   * Get usage statistics for a time period
   */
  async getUsageStats(
    userId: string,
    organizationId: string,
    startDate: Date,
    endDate: Date = new Date()
  ): Promise<UsageStats> {
    const usageLogs = await prisma.usageLog.findMany({
      where: {
        organizationId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    const stats: UsageStats = {
      totalCost: 0,
      totalTokens: 0,
      totalRequests: usageLogs.length,
      byProvider: {} as any,
      byModel: {} as any
    }

    for (const log of usageLogs) {
      stats.totalCost += log.cost
      stats.totalTokens += log.totalTokens

      // By provider
      if (!stats.byProvider[log.provider as Provider]) {
        stats.byProvider[log.provider as Provider] = {
          cost: 0,
          tokens: 0,
          requests: 0
        }
      }
      stats.byProvider[log.provider as Provider].cost += log.cost
      stats.byProvider[log.provider as Provider].tokens += log.totalTokens
      stats.byProvider[log.provider as Provider].requests += 1

      // By model
      if (!stats.byModel[log.model]) {
        stats.byModel[log.model] = {
          cost: 0,
          tokens: 0,
          requests: 0
        }
      }
      stats.byModel[log.model].cost += log.cost
      stats.byModel[log.model].tokens += log.totalTokens
      stats.byModel[log.model].requests += 1
    }

    // Round all costs to 6 decimal places
    stats.totalCost = Math.round(stats.totalCost * 1000000) / 1000000
    
    for (const provider in stats.byProvider) {
      stats.byProvider[provider as Provider].cost = 
        Math.round(stats.byProvider[provider as Provider].cost * 1000000) / 1000000
    }
    
    for (const model in stats.byModel) {
      stats.byModel[model].cost = 
        Math.round(stats.byModel[model].cost * 1000000) / 1000000
    }

    return stats
  }

  /**
   * Get available models for a provider
   */
  getAvailableModels(provider: Provider): string[] {
    const providerPricing = PRICING[provider as keyof typeof PRICING]
    if (!providerPricing) return []
    return Object.keys(providerPricing)
  }

  /**
   * Get all supported providers
   */
  getSupportedProviders(): Provider[] {
    return Object.keys(PRICING) as Provider[]
  }

  /**
   * Reset monthly usage (for scheduled jobs)
   */
  async resetMonthlyUsage(organizationId: string): Promise<void> {
    await prisma.organization.update({
      where: { id: organizationId },
      data: { monthlySpend: 0 }
    })
  }
}

// Export singleton instance
export const usageService = UsageService.getInstance()