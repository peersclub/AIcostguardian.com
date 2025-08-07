export type ProviderId = 'openai' | 'claude' | 'gemini' | 'grok' | 'perplexity'

export type ProviderStatus = 'connected' | 'disconnected' | 'error' | 'checking'

export interface ProviderConfig {
  id: ProviderId
  name: string
  displayName: string
  description: string
  icon: string
  color: string
  baseUrl: string
  docsUrl: string
  pricingUrl: string
  features: string[]
  models: AIModel[]
  pricing: ProviderPricing
  limits: ProviderLimits
  adminKeyPattern?: RegExp
  regularKeyPattern?: RegExp
  keyValidation?: (key: string) => boolean
}

export interface AIModel {
  id: string
  name: string
  type: 'text' | 'image' | 'audio' | 'embedding'
  contextWindow: number
  maxTokens: number
  pricing: ModelPricing
  capabilities: string[]
  deprecated?: boolean
}

export interface ModelPricing {
  inputCost: number // per 1k tokens
  outputCost: number // per 1k tokens
  imageCost?: number // per image
  audioCost?: number // per minute
}

export interface ProviderPricing {
  avgCostPerUser: number
  baseMonthlyFee?: number
  overageRate?: number
  enterprise?: {
    customPricing: boolean
    contactSales: boolean
    minimumSeats?: number
  }
}

export interface ProviderLimits {
  rateLimit: {
    requests: number
    window: 'second' | 'minute' | 'hour'
  }
  dailyTokenLimit?: number
  monthlyTokenLimit?: number
  maxConcurrentRequests?: number
}

export interface ProviderConnection {
  providerId: ProviderId
  status: ProviderStatus
  apiKey?: string
  isAdmin: boolean
  lastChecked?: Date
  error?: string
  usage?: ProviderUsage
}

export interface ProviderUsage {
  providerId: ProviderId
  currentMonth: {
    tokens: number
    requests: number
    cost: number
  }
  lastMonth: {
    tokens: number
    requests: number
    cost: number
  }
  lifetime: {
    tokens: number
    requests: number
    cost: number
  }
}

export interface ProviderCredentials {
  providerId: ProviderId
  apiKey: string
  organizationId?: string
  projectId?: string
  region?: string
}

export interface ProviderTestResult {
  success: boolean
  isAdmin: boolean
  message: string
  details?: {
    model?: string
    organization?: string
    limits?: any
  }
  error?: string
}