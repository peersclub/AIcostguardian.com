import httpClient from './httpClient'
import { ROUTES } from '@/config/constants'
import { 
  ApiResponse, 
  UsageResponse, 
  TeamStatsResponse,
  PaginatedResponse 
} from '@/types/api'
import { ProviderId } from '@/types/providers'

export interface UsageFilters {
  provider?: ProviderId
  startDate?: string
  endDate?: string
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  userId?: string
  model?: string
  page?: number
  pageSize?: number
}

export interface UsageMetrics {
  totalTokens: number
  totalRequests: number
  totalCost: number
  averageTokensPerRequest: number
  peakUsageTime?: string
  topModels: Array<{
    model: string
    usage: number
    percentage: number
  }>
}

class UsageService {
  /**
   * Get usage data with filters
   */
  async getUsage(filters?: UsageFilters): Promise<ApiResponse<UsageResponse>> {
    return httpClient.get<UsageResponse>(ROUTES.API.USAGE, {
      params: filters,
    })
  }

  /**
   * Get recent usage (last 30 days)
   */
  async getRecentUsage(): Promise<ApiResponse<UsageResponse>> {
    return httpClient.get<UsageResponse>(`${ROUTES.API.USAGE}/recent`)
  }

  /**
   * Get usage by provider
   */
  async getProviderUsage(
    providerId: ProviderId,
    filters?: Omit<UsageFilters, 'provider'>
  ): Promise<ApiResponse<UsageResponse>> {
    return httpClient.get<UsageResponse>(`/api/${providerId}/usage`, {
      params: filters,
    })
  }

  /**
   * Get all providers usage summary
   */
  async getAllProvidersUsage(filters?: UsageFilters): Promise<ApiResponse<Record<ProviderId, UsageResponse>>> {
    return httpClient.get<Record<ProviderId, UsageResponse>>(`${ROUTES.API.USAGE}/all`, {
      params: filters,
    })
  }

  /**
   * Get team statistics
   */
  async getTeamStats(): Promise<ApiResponse<TeamStatsResponse>> {
    return httpClient.get<TeamStatsResponse>(`${ROUTES.API.TEAM}/stats`)
  }

  /**
   * Get usage metrics
   */
  async getUsageMetrics(filters?: UsageFilters): Promise<ApiResponse<UsageMetrics>> {
    return httpClient.get<UsageMetrics>(`${ROUTES.API.USAGE}/metrics`, {
      params: filters,
    })
  }

  /**
   * Get usage history (paginated)
   */
  async getUsageHistory(filters?: UsageFilters): Promise<ApiResponse<PaginatedResponse<UsageResponse>>> {
    return httpClient.get<PaginatedResponse<UsageResponse>>(`${ROUTES.API.USAGE}/history`, {
      params: {
        page: filters?.page || 1,
        pageSize: filters?.pageSize || 20,
        ...filters,
      },
    })
  }

  /**
   * Export usage data
   */
  async exportUsage(format: 'csv' | 'json' | 'pdf', filters?: UsageFilters): Promise<Blob> {
    const response = await fetch(`${ROUTES.API.USAGE}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        format,
        filters,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to export usage data')
    }

    return response.blob()
  }

  /**
   * Get cost breakdown
   */
  async getCostBreakdown(filters?: UsageFilters): Promise<ApiResponse<any>> {
    return httpClient.get(`${ROUTES.API.USAGE}/cost-breakdown`, {
      params: filters,
    })
  }

  /**
   * Get usage trends
   */
  async getUsageTrends(period: 'week' | 'month' | 'quarter' | 'year'): Promise<ApiResponse<any>> {
    return httpClient.get(`${ROUTES.API.USAGE}/trends`, {
      params: { period },
    })
  }

  /**
   * Calculate usage projections
   */
  async getProjections(basedOn: 'current' | 'average' | 'peak'): Promise<ApiResponse<any>> {
    return httpClient.get(`${ROUTES.API.USAGE}/projections`, {
      params: { basedOn },
    })
  }

  /**
   * Get usage anomalies
   */
  async getAnomalies(): Promise<ApiResponse<any>> {
    return httpClient.get(`${ROUTES.API.USAGE}/anomalies`)
  }

  /**
   * Format usage data for charts
   */
  formatChartData(usage: UsageResponse[]): any {
    return usage.map(item => ({
      date: item.startDate,
      tokens: item.usage.tokens,
      requests: item.usage.requests,
      cost: item.usage.cost,
    }))
  }

  /**
   * Calculate usage statistics
   */
  calculateStats(usage: UsageResponse[]): UsageMetrics {
    const totalTokens = usage.reduce((sum, item) => sum + item.usage.tokens, 0)
    const totalRequests = usage.reduce((sum, item) => sum + item.usage.requests, 0)
    const totalCost = usage.reduce((sum, item) => sum + item.usage.cost, 0)

    const modelUsage: Record<string, number> = {}
    usage.forEach(item => {
      item.usage.breakdown?.forEach(breakdown => {
        modelUsage[breakdown.model] = (modelUsage[breakdown.model] || 0) + breakdown.tokens
      })
    })

    const topModels = Object.entries(modelUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([model, usage]) => ({
        model,
        usage,
        percentage: (usage / totalTokens) * 100,
      }))

    return {
      totalTokens,
      totalRequests,
      totalCost,
      averageTokensPerRequest: totalRequests > 0 ? totalTokens / totalRequests : 0,
      topModels,
    }
  }

  /**
   * Get comparison data
   */
  async getComparison(
    period1: { start: string; end: string },
    period2: { start: string; end: string }
  ): Promise<ApiResponse<any>> {
    return httpClient.post(`${ROUTES.API.USAGE}/compare`, {
      period1,
      period2,
    })
  }
}

export const usageService = new UsageService()
export default usageService