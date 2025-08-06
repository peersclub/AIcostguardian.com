export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  metadata?: ResponseMetadata
}

export interface ApiError {
  code: string
  message: string
  details?: any
  statusCode: number
  timestamp: string
}

export interface ResponseMetadata {
  requestId: string
  timestamp: string
  duration: number
  version: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasNext: boolean
  hasPrev: boolean
}

export interface UsageResponse {
  provider: string
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  startDate: string
  endDate: string
  usage: {
    tokens: number
    requests: number
    cost: number
    breakdown?: UsageBreakdown[]
  }
}

export interface UsageBreakdown {
  model: string
  tokens: number
  requests: number
  cost: number
  percentage: number
}

export interface TeamStatsResponse {
  totalMembers: number
  activeMembers: number
  totalUsage: {
    tokens: number
    requests: number
    cost: number
  }
  topUsers: TeamMember[]
  providerBreakdown: ProviderBreakdown[]
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'member' | 'viewer'
  usage: {
    tokens: number
    requests: number
    cost: number
  }
  lastActive: string
}

export interface ProviderBreakdown {
  provider: string
  percentage: number
  cost: number
  trend: 'up' | 'down' | 'stable'
}

export interface AlertRule {
  id: string
  name: string
  type: 'cost' | 'usage' | 'error' | 'rate_limit'
  threshold: number
  comparison: 'greater' | 'less' | 'equal'
  period: 'hour' | 'day' | 'week' | 'month'
  enabled: boolean
  notifications: NotificationChannel[]
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook'
  destination: string
  enabled: boolean
}

export interface BillingInfo {
  currentPlan: 'free' | 'pro' | 'enterprise'
  billingCycle: 'monthly' | 'yearly'
  nextBillingDate: string
  amount: number
  currency: string
  paymentMethod?: {
    type: 'card' | 'invoice'
    last4?: string
    brand?: string
  }
  usage: {
    current: number
    limit: number
    percentage: number
  }
}

export interface ApiKeyCreateRequest {
  provider: string
  apiKey: string
  name?: string
  description?: string
}

export interface ApiKeyUpdateRequest {
  id: string
  name?: string
  description?: string
  enabled?: boolean
}

export interface ApiKeyResponse {
  id: string
  provider: string
  name: string
  description?: string
  isAdmin: boolean
  enabled: boolean
  createdAt: string
  lastUsed?: string
  status: 'active' | 'inactive' | 'error'
}