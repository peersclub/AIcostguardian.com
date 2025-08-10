/**
 * Usage Service - Real Implementation
 * Handles all usage tracking, logging, and cost calculations
 */

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns'

// Define Provider type locally since it's not an enum in Prisma
type Provider = 'OPENAI' | 'CLAUDE' | 'GEMINI' | 'GROK' | 'PERPLEXITY'

// Pricing configuration for each provider
const PROVIDER_PRICING = {
  OPENAI: {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    'dall-e-3': { perImage: 0.04 },
    'whisper': { perMinute: 0.006 }
  },
  CLAUDE: {
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-sonnet': { input: 0.003, output: 0.015 },
    'claude-3-haiku': { input: 0.00025, output: 0.00125 }
  },
  GEMINI: {
    'gemini-pro': { input: 0.00025, output: 0.0005 },
    'gemini-pro-vision': { input: 0.00025, output: 0.0005 }
  },
  GROK: {
    'grok-1': { input: 0.05, output: 0.15 }
  },
  PERPLEXITY: {
    'sonar-small': { input: 0.0002, output: 0.0002 },
    'sonar-medium': { input: 0.0006, output: 0.0018 }
  }
} as const

export interface UsageMetrics {
  totalCost: number
  totalTokens: number
  totalRequests: number
  providers: {
    name: Provider
    cost: number
    tokens: number
    requests: number
  }[]
  timeRange: {
    start: Date
    end: Date
  }
}

export interface UsageByModel {
  model: string
  provider: Provider
  requests: number
  tokens: number
  cost: number
}

export class UsageService {
  /**
   * Log usage for a specific API call
   */
  async logUsage(params: {
    userId: string
    provider: Provider
    model: string
    operation: string
    inputTokens: number
    outputTokens: number
    responseTime?: number
    metadata?: any
  }) {
    const { userId, provider, model, operation, inputTokens, outputTokens, responseTime, metadata } = params
    
    // Calculate cost based on provider and model
    const cost = this.calculateCost(provider, model, inputTokens, outputTokens)
    
    // Get user's organization if exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true }
    })
    
    // Create usage log entry
    const usageLog = await prisma.usageLog.create({
      data: {
        userId,
        organizationId: user?.organizationId || userId, // Fallback to userId if no org
        provider,
        model,
        promptTokens: inputTokens,
        completionTokens: outputTokens,
        totalTokens: inputTokens + outputTokens,
        cost,
        metadata: {
          operation,
          responseTime,
          ...(metadata || {})
        }
      }
    })
    
    // Check for alerts
    await this.checkUsageAlerts(userId, cost)
    
    return usageLog
  }
  
  /**
   * Get usage metrics for a user within a time range
   */
  async getUserUsage(userId: string, startDate?: Date, endDate?: Date): Promise<UsageMetrics> {
    const start = startDate || startOfMonth(new Date())
    const end = endDate || endOfDay(new Date())
    
    const logs = await prisma.usageLog.findMany({
      where: {
        userId,
        timestamp: {
          gte: start,
          lte: end
        }
      }
    })
    
    // Aggregate by provider
    const providerMap = new Map<string, { cost: number; tokens: number; requests: number }>()
    
    let totalCost = 0
    let totalTokens = 0
    
    for (const log of logs) {
      const cost = log.cost
      totalCost += cost
      totalTokens += log.totalTokens
      
      const existing = providerMap.get(log.provider) || { cost: 0, tokens: 0, requests: 0 }
      providerMap.set(log.provider, {
        cost: existing.cost + cost,
        tokens: existing.tokens + log.totalTokens,
        requests: existing.requests + 1
      })
    }
    
    return {
      totalCost,
      totalTokens,
      totalRequests: logs.length,
      providers: Array.from(providerMap.entries()).map(([name, data]) => ({
        name: name as Provider,
        ...data
      })),
      timeRange: { start, end }
    }
  }
  
  /**
   * Get organization-wide usage
   */
  async getOrganizationUsage(organizationId: string, startDate?: Date, endDate?: Date): Promise<UsageMetrics> {
    const start = startDate || startOfMonth(new Date())
    const end = endDate || endOfDay(new Date())
    
    const logs = await prisma.usageLog.findMany({
      where: {
        organizationId,
        timestamp: {
          gte: start,
          lte: end
        }
      }
    })
    
    // Similar aggregation logic as getUserUsage
    const providerMap = new Map<string, { cost: number; tokens: number; requests: number }>()
    
    let totalCost = 0
    let totalTokens = 0
    
    for (const log of logs) {
      const cost = log.cost
      totalCost += cost
      totalTokens += log.totalTokens
      
      const existing = providerMap.get(log.provider) || { cost: 0, tokens: 0, requests: 0 }
      providerMap.set(log.provider, {
        cost: existing.cost + cost,
        tokens: existing.tokens + log.totalTokens,
        requests: existing.requests + 1
      })
    }
    
    return {
      totalCost,
      totalTokens,
      totalRequests: logs.length,
      providers: Array.from(providerMap.entries()).map(([name, data]) => ({
        name: name as Provider,
        ...data
      })),
      timeRange: { start, end }
    }
  }
  
  /**
   * Get usage breakdown by model
   */
  async getUsageByModel(userId: string, startDate?: Date, endDate?: Date): Promise<UsageByModel[]> {
    const start = startDate || startOfMonth(new Date())
    const end = endDate || endOfDay(new Date())
    
    const logs = await prisma.usageLog.findMany({
      where: {
        userId,
        timestamp: {
          gte: start,
          lte: end
        }
      }
    })
    
    // Aggregate by model
    const modelMap = new Map<string, UsageByModel>()
    
    for (const log of logs) {
      const key = `${log.provider}-${log.model}`
      const existing = modelMap.get(key) || {
        model: log.model,
        provider: log.provider as Provider,
        requests: 0,
        tokens: 0,
        cost: 0
      }
      
      modelMap.set(key, {
        ...existing,
        requests: existing.requests + 1,
        tokens: existing.tokens + log.totalTokens,
        cost: existing.cost + log.cost
      })
    }
    
    return Array.from(modelMap.values()).sort((a, b) => b.cost - a.cost)
  }
  
  /**
   * Get daily usage trend
   */
  async getDailyUsageTrend(userId: string, days: number = 30) {
    const endDate = endOfDay(new Date())
    const startDate = startOfDay(subDays(endDate, days))
    
    const logs = await prisma.usageLog.findMany({
      where: {
        userId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timestamp: 'asc' }
    })
    
    // Group by day
    const dailyMap = new Map<string, { date: Date; cost: number; tokens: number; requests: number }>()
    
    for (const log of logs) {
      const dateKey = log.timestamp.toISOString().split('T')[0]
      const existing = dailyMap.get(dateKey) || {
        date: new Date(dateKey),
        cost: 0,
        tokens: 0,
        requests: 0
      }
      
      dailyMap.set(dateKey, {
        ...existing,
        cost: existing.cost + log.cost,
        tokens: existing.tokens + log.totalTokens,
        requests: existing.requests + 1
      })
    }
    
    return Array.from(dailyMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime())
  }
  
  /**
   * Calculate cost for a specific usage
   */
  private calculateCost(provider: Provider, model: string, inputTokens: number, outputTokens: number): number {
    const providerPricing = PROVIDER_PRICING[provider] as any
    if (!providerPricing) {
      console.warn(`No pricing found for provider ${provider}`)
      return 0
    }
    
    const pricing = providerPricing[model]
    if (!pricing) {
      console.warn(`No pricing found for ${provider} - ${model}`)
      return 0
    }
    
    // Handle per-token pricing
    if ('input' in pricing && 'output' in pricing) {
      const inputCost = (inputTokens / 1000) * pricing.input
      const outputCost = (outputTokens / 1000) * pricing.output
      return inputCost + outputCost
    }
    
    // Handle per-image or per-minute pricing
    if ('perImage' in pricing) {
      return pricing.perImage
    }
    
    if ('perMinute' in pricing) {
      // Assume 1 request = 1 minute for simplicity
      return pricing.perMinute
    }
    
    return 0
  }
  
  /**
   * Check if usage triggers any alerts
   */
  private async checkUsageAlerts(userId: string, cost: number) {
    // Get active alerts for user
    const alerts = await prisma.alert.findMany({
      where: {
        userId,
        isActive: true,
        type: 'COST_THRESHOLD'
      }
    })
    
    for (const alert of alerts) {
      // Get total cost for current day (default period)
      const periodStart = startOfDay(new Date())
      const periodUsage = await this.getUserUsage(userId, periodStart, new Date())
      
      // Check if threshold exceeded
      if (periodUsage.totalCost >= alert.threshold) {
        // Get user's organization
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { organizationId: true }
        })
        
        // Create notification
        await prisma.notification.create({
          data: {
            userId,
            organizationId: user?.organizationId || userId,
            type: 'COST_THRESHOLD_EXCEEDED',
            title: `Cost Alert`,
            message: alert.message || `Your spending has exceeded $${alert.threshold}`,
            priority: 'HIGH',
            channels: ['IN_APP', 'EMAIL'],
            data: {
              alertId: alert.id,
              currentCost: periodUsage.totalCost,
              threshold: alert.threshold,
              provider: alert.provider
            }
          }
        })
        
        // Update alert last triggered
        await prisma.alert.update({
          where: { id: alert.id },
          data: { triggeredAt: new Date() }
        })
      }
    }
  }
  
  /**
   * Get cost projection based on current usage
   */
  async getCostProjection(userId: string) {
    // Get last 7 days usage
    const weeklyUsage = await this.getUserUsage(
      userId,
      subDays(new Date(), 7),
      new Date()
    )
    
    // Calculate daily average
    const dailyAverage = weeklyUsage.totalCost / 7
    
    // Project for the month
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    const monthlyProjection = dailyAverage * daysInMonth
    
    // Get current month usage
    const currentMonthUsage = await this.getUserUsage(
      userId,
      startOfMonth(new Date()),
      new Date()
    )
    
    return {
      currentMonthUsage: currentMonthUsage.totalCost,
      dailyAverage,
      monthlyProjection,
      daysRemaining: daysInMonth - new Date().getDate(),
      projectedRemaining: monthlyProjection - currentMonthUsage.totalCost
    }
  }
}

// Export singleton instance
export const usageService = new UsageService()