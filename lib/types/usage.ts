// Unified types for usage statistics across the application

export interface UsageStats {
  totalCalls: number
  totalTokens: number
  totalCost: number
  avgResponseTime: number
  successRate: number
  errorRate: number
  period: {
    start: string
    end: string
  }
}

export interface ProviderUsageStats extends UsageStats {
  provider: string
  models: ModelUsage[]
  topUsers?: UserUsage[]
  costBreakdown: CostBreakdown
}

export interface ModelUsage {
  model: string
  calls: number
  tokens: number
  cost: number
  avgResponseTime: number
}

export interface UserUsage {
  userId: string
  email: string
  calls: number
  tokens: number
  cost: number
}

export interface CostBreakdown {
  inputTokens: number
  outputTokens: number
  inputCost: number
  outputCost: number
  totalCost: number
}

export interface UsageTrend {
  date: string
  calls: number
  tokens: number
  cost: number
}

export interface ProviderConnectionStatus {
  isConfigured: boolean
  isValid: boolean
  lastChecked?: string
  error?: string
  apiKeyId?: string
  limits?: {
    rateLimit: number
    tokenLimit: number
    costLimit: number
  }
}

export type TimeRange = '1h' | '24h' | '7d' | '30d' | '90d' | '1y' | 'custom'

export interface TimeRangeFilter {
  range: TimeRange
  customStart?: string
  customEnd?: string
}