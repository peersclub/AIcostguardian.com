/**
 * Real-time AI Usage Monitoring Service
 * Fetches actual usage data from all providers
 */

import { PROVIDER_CONFIG, PRICING_CONFIG, ProviderName } from '@/config/providers'

export interface UsageData {
  provider: ProviderName
  timestamp: Date
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost: number
  requestId: string
  userId?: string
  metadata?: Record<string, any>
}

export interface AggregatedUsage {
  provider: ProviderName
  totalRequests: number
  totalTokens: number
  totalCost: number
  byModel: Record<string, {
    requests: number
    tokens: number
    cost: number
  }>
  timeRange: {
    start: Date
    end: Date
  }
}

class UsageMonitorService {
  private usageCache: Map<string, UsageData[]> = new Map()
  private costAlerts: Map<string, number> = new Map()

  /**
   * Fetch OpenAI usage data from their API
   */
  async fetchOpenAIUsage(startDate: Date, endDate: Date): Promise<UsageData[]> {
    const config = PROVIDER_CONFIG.OPENAI
    if (!config.apiKey || !config.organizationId) {
      throw new Error('OpenAI credentials not configured')
    }

    try {
      // OpenAI Usage API endpoint
      const response = await fetch(`${config.baseUrl}/usage`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'OpenAI-Organization': config.organizationId
        }
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Transform OpenAI usage data to our format
      return this.transformOpenAIData(data)
    } catch (error) {
      console.error('Error fetching OpenAI usage:', error)
      throw error
    }
  }

  /**
   * Fetch Anthropic usage data
   */
  async fetchAnthropicUsage(startDate: Date, endDate: Date): Promise<UsageData[]> {
    const config = PROVIDER_CONFIG.ANTHROPIC
    if (!config.apiKey) {
      throw new Error('Anthropic API key not configured')
    }

    try {
      // Anthropic doesn't have a direct usage API, so we track via request headers
      // For admin keys, we can get organization usage
      if (config.apiKey.startsWith('sk-ant-admin')) {
        const response = await fetch(`${config.baseUrl}/organizations/usage`, {
          headers: {
            'x-api-key': config.apiKey,
            'anthropic-version': '2023-06-01'
          }
        })

        if (response.ok) {
          const data = await response.json()
          return this.transformAnthropicData(data)
        }
      }

      // For regular keys, return cached usage data
      return this.getCachedUsage('ANTHROPIC', startDate, endDate)
    } catch (error) {
      console.error('Error fetching Anthropic usage:', error)
      throw error
    }
  }

  /**
   * Fetch Google Gemini usage data
   */
  async fetchGeminiUsage(startDate: Date, endDate: Date): Promise<UsageData[]> {
    const config = PROVIDER_CONFIG.GOOGLE_GEMINI
    if (!config.apiKey || !config.projectId) {
      throw new Error('Google Gemini credentials not configured')
    }

    try {
      // Google Cloud Monitoring API for usage metrics
      const metricsUrl = `https://monitoring.googleapis.com/v3/projects/${config.projectId}/timeSeries`
      
      const params = new URLSearchParams({
        'filter': 'metric.type="generativelanguage.googleapis.com/request_count"',
        'interval.startTime': startDate.toISOString(),
        'interval.endTime': endDate.toISOString()
      })

      const response = await fetch(`${metricsUrl}?${params}`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        return this.transformGeminiData(data)
      }

      // Fallback to cached data
      return this.getCachedUsage('GOOGLE_GEMINI', startDate, endDate)
    } catch (error) {
      console.error('Error fetching Gemini usage:', error)
      throw error
    }
  }

  /**
   * Fetch xAI Grok usage data
   */
  async fetchGrokUsage(startDate: Date, endDate: Date): Promise<UsageData[]> {
    const config = PROVIDER_CONFIG.GROK
    if (!config.apiKey) {
      throw new Error('Grok API key not configured')
    }

    try {
      // Grok usage endpoint (similar to OpenAI)
      const response = await fetch(`${config.baseUrl}/usage`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        return this.transformGrokData(data)
      }

      // Fallback to cached data
      return this.getCachedUsage('GROK', startDate, endDate)
    } catch (error) {
      console.error('Error fetching Grok usage:', error)
      throw error
    }
  }

  /**
   * Track usage from a real API call
   */
  async trackUsage(usage: UsageData): Promise<void> {
    const cacheKey = `${usage.provider}_${usage.timestamp.toISOString().split('T')[0]}`
    
    if (!this.usageCache.has(cacheKey)) {
      this.usageCache.set(cacheKey, [])
    }
    
    this.usageCache.get(cacheKey)!.push(usage)
    
    // Check cost alerts
    await this.checkCostAlerts(usage)
    
    // Store in database
    await this.storeUsageInDB(usage)
  }

  /**
   * Get aggregated usage across all providers
   */
  async getAggregatedUsage(
    startDate: Date,
    endDate: Date
  ): Promise<Record<ProviderName, AggregatedUsage>> {
    const providers: ProviderName[] = ['ANTHROPIC', 'OPENAI', 'GOOGLE_GEMINI', 'GROK']
    const result: Record<string, AggregatedUsage> = {}

    for (const provider of providers) {
      try {
        let usageData: UsageData[] = []
        
        switch (provider) {
          case 'OPENAI':
            usageData = await this.fetchOpenAIUsage(startDate, endDate)
            break
          case 'ANTHROPIC':
            usageData = await this.fetchAnthropicUsage(startDate, endDate)
            break
          case 'GOOGLE_GEMINI':
            usageData = await this.fetchGeminiUsage(startDate, endDate)
            break
          case 'GROK':
            usageData = await this.fetchGrokUsage(startDate, endDate)
            break
        }

        result[provider] = this.aggregateUsageData(provider, usageData, startDate, endDate)
      } catch (error) {
        console.error(`Error fetching ${provider} usage:`, error)
        // Continue with other providers
      }
    }

    return result as Record<ProviderName, AggregatedUsage>
  }

  /**
   * Set cost alert threshold
   */
  setCostAlert(provider: ProviderName, threshold: number): void {
    this.costAlerts.set(provider, threshold)
  }

  /**
   * Check if cost exceeds alert threshold
   */
  private async checkCostAlerts(usage: UsageData): Promise<void> {
    const threshold = this.costAlerts.get(usage.provider)
    if (!threshold) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayUsage = await this.getCachedUsage(
      usage.provider,
      today,
      new Date()
    )
    
    const totalCost = todayUsage.reduce((sum, u) => sum + u.cost, 0)
    
    if (totalCost > threshold) {
      await this.sendCostAlert(usage.provider, totalCost, threshold)
    }
  }

  /**
   * Send cost alert notification
   */
  private async sendCostAlert(
    provider: ProviderName,
    currentCost: number,
    threshold: number
  ): Promise<void> {
    // Implement notification logic (email, webhook, etc.)
    console.warn(`Cost alert for ${provider}: $${currentCost.toFixed(2)} exceeds threshold of $${threshold}`)
    
    // Store alert in database
    await fetch('/api/monitoring/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'cost_alert',
        provider,
        currentCost,
        threshold,
        timestamp: new Date()
      })
    })
  }

  /**
   * Transform provider-specific data to our format
   */
  private transformOpenAIData(data: any): UsageData[] {
    if (!data.data) return []
    
    return data.data.map((item: any) => ({
      provider: 'OPENAI' as ProviderName,
      timestamp: new Date(item.aggregation_timestamp * 1000),
      model: item.snapshot_id,
      inputTokens: item.n_context_tokens_total || 0,
      outputTokens: item.n_generated_tokens_total || 0,
      totalTokens: (item.n_context_tokens_total || 0) + (item.n_generated_tokens_total || 0),
      cost: this.calculateCost('OPENAI', item.snapshot_id, 
        item.n_context_tokens_total || 0,
        item.n_generated_tokens_total || 0
      ),
      requestId: item.request_id || `openai_${Date.now()}`,
      metadata: item
    }))
  }

  private transformAnthropicData(data: any): UsageData[] {
    if (!data.usage) return []
    
    return data.usage.map((item: any) => ({
      provider: 'ANTHROPIC' as ProviderName,
      timestamp: new Date(item.timestamp),
      model: item.model,
      inputTokens: item.input_tokens || 0,
      outputTokens: item.output_tokens || 0,
      totalTokens: (item.input_tokens || 0) + (item.output_tokens || 0),
      cost: this.calculateCost('ANTHROPIC', item.model,
        item.input_tokens || 0,
        item.output_tokens || 0
      ),
      requestId: item.request_id || `anthropic_${Date.now()}`,
      metadata: item
    }))
  }

  private transformGeminiData(data: any): UsageData[] {
    if (!data.timeSeries) return []
    
    return data.timeSeries.flatMap((series: any) => 
      series.points.map((point: any) => ({
        provider: 'GOOGLE_GEMINI' as ProviderName,
        timestamp: new Date(point.interval.endTime),
        model: series.resource.labels.model || 'gemini-1.5-pro',
        inputTokens: point.value.int64Value || 0,
        outputTokens: point.value.int64Value || 0,
        totalTokens: (point.value.int64Value || 0) * 2,
        cost: this.calculateCost('GOOGLE_GEMINI', 
          series.resource.labels.model || 'gemini-1.5-pro',
          point.value.int64Value || 0,
          point.value.int64Value || 0
        ),
        requestId: `gemini_${Date.now()}`,
        metadata: point
      }))
    )
  }

  private transformGrokData(data: any): UsageData[] {
    if (!data.usage) return []
    
    return data.usage.map((item: any) => ({
      provider: 'GROK' as ProviderName,
      timestamp: new Date(item.timestamp),
      model: item.model || 'grok-1',
      inputTokens: item.prompt_tokens || 0,
      outputTokens: item.completion_tokens || 0,
      totalTokens: (item.prompt_tokens || 0) + (item.completion_tokens || 0),
      cost: this.calculateCost('GROK', item.model || 'grok-1',
        item.prompt_tokens || 0,
        item.completion_tokens || 0
      ),
      requestId: item.request_id || `grok_${Date.now()}`,
      metadata: item
    }))
  }

  /**
   * Calculate cost based on provider pricing
   */
  private calculateCost(
    provider: ProviderName,
    model: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    const pricing = PRICING_CONFIG[provider]
    const modelPricing = pricing[model as keyof typeof pricing]
    
    if (!modelPricing) {
      console.warn(`No pricing found for ${provider} model ${model}`)
      return 0
    }

    const inputCost = (inputTokens / 1_000_000) * modelPricing.input
    const outputCost = (outputTokens / 1_000_000) * modelPricing.output
    
    return inputCost + outputCost
  }

  /**
   * Get cached usage data
   */
  private getCachedUsage(
    provider: ProviderName,
    startDate: Date,
    endDate: Date
  ): UsageData[] {
    const result: UsageData[] = []
    
    for (const [key, data] of this.usageCache.entries()) {
      if (key.startsWith(provider)) {
        const filtered = data.filter(u => 
          u.timestamp >= startDate && u.timestamp <= endDate
        )
        result.push(...filtered)
      }
    }
    
    return result
  }

  /**
   * Aggregate usage data
   */
  private aggregateUsageData(
    provider: ProviderName,
    data: UsageData[],
    startDate: Date,
    endDate: Date
  ): AggregatedUsage {
    const byModel: Record<string, any> = {}
    
    for (const usage of data) {
      if (!byModel[usage.model]) {
        byModel[usage.model] = {
          requests: 0,
          tokens: 0,
          cost: 0
        }
      }
      
      byModel[usage.model].requests++
      byModel[usage.model].tokens += usage.totalTokens
      byModel[usage.model].cost += usage.cost
    }

    return {
      provider,
      totalRequests: data.length,
      totalTokens: data.reduce((sum, u) => sum + u.totalTokens, 0),
      totalCost: data.reduce((sum, u) => sum + u.cost, 0),
      byModel,
      timeRange: { start: startDate, end: endDate }
    }
  }

  /**
   * Store usage in database
   */
  private async storeUsageInDB(usage: UsageData): Promise<void> {
    try {
      await fetch('/api/monitoring/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usage)
      })
    } catch (error) {
      console.error('Error storing usage in DB:', error)
    }
  }
}

export const usageMonitor = new UsageMonitorService()