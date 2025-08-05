import { getApiKey } from './api-key-store'

// Types for Claude Admin API
export interface ClaudeUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'member' | 'viewer'
  status: 'active' | 'suspended' | 'pending'
  usageLimit?: number
  permissions: string[]
  createdAt: string
  lastActiveAt: string
}

export interface ClaudeApiKey {
  id: string
  name: string
  keyPrefix: string
  permissions: string[]
  scopes: string[]
  expiresAt?: string
  createdAt: string
  lastUsedAt?: string
  status: 'active' | 'revoked'
}

export interface ClaudeUsageStats {
  userId?: string
  apiKeyId?: string
  totalTokens: number
  totalCost: number
  requestCount: number
  period: 'hour' | 'day' | 'week' | 'month'
  timestamp: string
  model: string
}

export interface ClaudeBillingInfo {
  organizationId: string
  currentPeriod: {
    startDate: string
    endDate: string
    totalCost: number
    totalTokens: number
  }
  paymentMethod: {
    type: 'card' | 'bank'
    last4: string
    expiresAt?: string
  }
  billingAddress: {
    company: string
    address: string
    city: string
    country: string
  }
  invoices: ClaudeInvoice[]
}

export interface ClaudeInvoice {
  id: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed'
  dueDate: string
  paidAt?: string
  downloadUrl: string
}

export interface ClaudeAuditLog {
  id: string
  userId: string
  action: string
  resource: string
  timestamp: string
  ipAddress: string
  userAgent: string
  metadata: Record<string, any>
}

export interface ClaudeOrganizationSettings {
  id: string
  name: string
  settings: {
    ssoEnabled: boolean
    mfaRequired: boolean
    ipAllowlist: string[]
    sessionTimeout: number
    dataRetentionDays: number
    allowedModels: string[]
    contentFilters: {
      harmfulContent: boolean
      personalInfo: boolean
      customFilters: string[]
    }
    rateLimits: {
      requestsPerMinute: number
      tokensPerDay: number
      burstLimit: number
    }
  }
}

// API Version tracking
export interface ApiVersionInfo {
  current: string
  latest: string
  deprecated: string[]
  changelogUrl: string
  lastChecked: string
}

// Claude Admin API Client
export class ClaudeAdminClient {
  private baseUrl = 'https://api.anthropic.com/v1/admin'
  private apiKey: string
  private organizationId: string

  constructor(apiKey: string, organizationId: string) {
    this.apiKey = apiKey
    this.organizationId = organizationId
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-organization': this.organizationId,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(`Claude Admin API Error: ${response.status} - ${error.error || error.message}`)
    }

    return response.json()
  }

  // User Management
  async getUsers(): Promise<ClaudeUser[]> {
    return this.makeRequest('/users')
  }

  async createUser(userData: Partial<ClaudeUser>): Promise<ClaudeUser> {
    return this.makeRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async updateUser(userId: string, updates: Partial<ClaudeUser>): Promise<ClaudeUser> {
    return this.makeRequest(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  async deleteUser(userId: string): Promise<void> {
    return this.makeRequest(`/users/${userId}`, { method: 'DELETE' })
  }

  async suspendUser(userId: string): Promise<ClaudeUser> {
    return this.makeRequest(`/users/${userId}/suspend`, { method: 'POST' })
  }

  async reactivateUser(userId: string): Promise<ClaudeUser> {
    return this.makeRequest(`/users/${userId}/reactivate`, { method: 'POST' })
  }

  // API Key Management
  async getApiKeys(): Promise<ClaudeApiKey[]> {
    return this.makeRequest('/api-keys')
  }

  async createApiKey(keyData: Partial<ClaudeApiKey>): Promise<ClaudeApiKey> {
    return this.makeRequest('/api-keys', {
      method: 'POST',
      body: JSON.stringify(keyData),
    })
  }

  async revokeApiKey(keyId: string): Promise<void> {
    return this.makeRequest(`/api-keys/${keyId}/revoke`, { method: 'POST' })
  }

  async rotateApiKey(keyId: string): Promise<ClaudeApiKey> {
    return this.makeRequest(`/api-keys/${keyId}/rotate`, { method: 'POST' })
  }

  // Usage Monitoring & Analytics
  async getUsageStats(params: {
    userId?: string
    apiKeyId?: string
    startDate: string
    endDate: string
    granularity?: 'hour' | 'day' | 'week' | 'month'
  }): Promise<ClaudeUsageStats[]> {
    const query = new URLSearchParams(params as any).toString()
    return this.makeRequest(`/usage/stats?${query}`)
  }

  async exportUsageReport(params: {
    startDate: string
    endDate: string
    format: 'csv' | 'json' | 'xlsx'
  }): Promise<{ downloadUrl: string }> {
    return this.makeRequest('/usage/export', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  // Billing & Finance
  async getBillingInfo(): Promise<ClaudeBillingInfo> {
    return this.makeRequest('/billing')
  }

  async getInvoices(): Promise<ClaudeInvoice[]> {
    return this.makeRequest('/billing/invoices')
  }

  async updatePaymentMethod(paymentData: any): Promise<void> {
    return this.makeRequest('/billing/payment-method', {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    })
  }

  async setBudgetLimit(limit: number, alertThresholds: number[]): Promise<void> {
    return this.makeRequest('/billing/budget', {
      method: 'PUT',
      body: JSON.stringify({ limit, alertThresholds }),
    })
  }

  // Security & Compliance
  async getAuditLogs(params: {
    startDate: string
    endDate: string
    userId?: string
    action?: string
  }): Promise<ClaudeAuditLog[]> {
    const query = new URLSearchParams(params as any).toString()
    return this.makeRequest(`/audit-logs?${query}`)
  }

  async exportAuditLogs(params: {
    startDate: string
    endDate: string
    format: 'csv' | 'json'
  }): Promise<{ downloadUrl: string }> {
    return this.makeRequest('/audit-logs/export', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async updateSecuritySettings(settings: {
    mfaRequired?: boolean
    ssoEnabled?: boolean
    ipAllowlist?: string[]
    sessionTimeout?: number
  }): Promise<void> {
    return this.makeRequest('/security/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }

  // Organization Settings
  async getOrganizationSettings(): Promise<ClaudeOrganizationSettings> {
    return this.makeRequest('/organization/settings')
  }

  async updateOrganizationSettings(settings: Partial<ClaudeOrganizationSettings['settings']>): Promise<void> {
    return this.makeRequest('/organization/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }

  // Model & Feature Management
  async getAvailableModels(): Promise<Array<{ id: string; name: string; description: string; enabled: boolean }>> {
    return this.makeRequest('/models')
  }

  async updateModelAccess(modelId: string, enabled: boolean, restrictions?: any): Promise<void> {
    return this.makeRequest(`/models/${modelId}`, {
      method: 'PUT',
      body: JSON.stringify({ enabled, restrictions }),
    })
  }

  async updateContentFilters(filters: {
    harmfulContent?: boolean
    personalInfo?: boolean
    customFilters?: string[]
  }): Promise<void> {
    return this.makeRequest('/content-filters', {
      method: 'PUT',
      body: JSON.stringify(filters),
    })
  }

  async updateRateLimits(limits: {
    requestsPerMinute?: number
    tokensPerDay?: number
    burstLimit?: number
  }): Promise<void> {
    return this.makeRequest('/rate-limits', {
      method: 'PUT',
      body: JSON.stringify(limits),
    })
  }

  // API Version Management
  async getApiVersionInfo(): Promise<ApiVersionInfo> {
    return this.makeRequest('/version')
  }

  // Enterprise Features
  async getAdvancedAnalytics(params: {
    startDate: string
    endDate: string
    metrics: string[]
  }): Promise<any> {
    return this.makeRequest('/analytics/advanced', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async getSLAMetrics(): Promise<{
    uptime: number
    latency: number
    errorRate: number
    period: string
  }> {
    return this.makeRequest('/sla/metrics')
  }

  async getComplianceReport(type: 'gdpr' | 'soc2' | 'hipaa'): Promise<{ downloadUrl: string }> {
    return this.makeRequest(`/compliance/reports/${type}`)
  }
}

// Factory function to create Claude Admin Client
export function getClaudeAdminClient(userId?: string, apiKey?: string, organizationId?: string): ClaudeAdminClient {
  let key = apiKey
  
  // Try to get from storage if not provided
  if (!key && userId) {
    key = getApiKey(userId, 'claude-admin')
  }
  
  // Fallback to environment variable
  if (!key) {
    key = process.env.CLAUDE_ADMIN_API_KEY
  }
  
  const orgId = organizationId || process.env.CLAUDE_ORGANIZATION_ID || 'default'
  
  if (!key) {
    throw new Error('Claude Admin API key is not configured')
  }
  
  return new ClaudeAdminClient(key, orgId)
}

// Mock data for development/demo
export const mockClaudeAdminData = {
  users: [
    {
      id: '1',
      email: 'admin@company.com',
      name: 'Admin User',
      role: 'admin' as const,
      status: 'active' as const,
      usageLimit: 1000000,
      permissions: ['read', 'write', 'admin'],
      createdAt: '2024-01-01T00:00:00Z',
      lastActiveAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      email: 'user@company.com',
      name: 'Regular User',
      role: 'member' as const,
      status: 'active' as const,
      usageLimit: 100000,
      permissions: ['read', 'write'],
      createdAt: '2024-01-05T00:00:00Z',
      lastActiveAt: '2024-01-15T09:15:00Z'
    }
  ],
  apiKeys: [
    {
      id: '1',
      name: 'Production API Key',
      keyPrefix: 'sk-ant-api03-...',
      permissions: ['read', 'write'],
      scopes: ['chat', 'completion'],
      expiresAt: '2024-12-31T23:59:59Z',
      createdAt: '2024-01-01T00:00:00Z',
      lastUsedAt: '2024-01-15T10:00:00Z',
      status: 'active' as const
    }
  ],
  organization: {
    id: 'org-123',
    name: 'My Organization',
    settings: {
      ssoEnabled: false,
      mfaRequired: true,
      ipAllowlist: ['192.168.1.0/24'],
      sessionTimeout: 3600,
      dataRetentionDays: 90,
      allowedModels: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
      contentFilters: {
        harmfulContent: true,
        personalInfo: true,
        customFilters: ['company-secrets']
      },
      rateLimits: {
        requestsPerMinute: 1000,
        tokensPerDay: 1000000,
        burstLimit: 100
      }
    }
  },
  apiVersion: {
    current: '2024-01-01',
    latest: '2024-01-15',
    deprecated: ['2023-06-01', '2023-12-01'],
    changelogUrl: 'https://docs.anthropic.com/claude/reference/changelog',
    lastChecked: new Date().toISOString()
  }
}