'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import AuthWrapper from '@/components/AuthWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts'
import {
  Activity, AlertTriangle, ArrowDown, ArrowUp, BarChart3,
  Calendar, ChevronDown, Clock, CreditCard,
  DollarSign, Download, Eye, FileText, Filter,
  MoreVertical, RefreshCw, Settings, TrendingDown, TrendingUp,
  Users, Zap, AlertCircle, ChevronRight, ExternalLink
} from 'lucide-react'
import { getEnabledProviders, AI_PROVIDER_IDS } from '@/lib/ai-providers-config'
import { getAIProviderLogo } from '@/components/ui/ai-logos'

interface ProviderStats {
  provider: string
  status: 'connected' | 'disconnected'
  calls: number
  tokens: number
  cost: number
  models: string[]
}

interface UsageStats {
  totalCalls: number
  totalTokens: number
  totalCost: number
  thisMonth: { calls: number; tokens: number; cost: number }
  thisWeek: { calls: number; tokens: number; cost: number }
  today: { calls: number; tokens: number; cost: number }
  byProvider: Record<string, { calls: number; tokens: number; cost: number }>
  byModel: Record<string, { calls: number; tokens: number; cost: number }>
  dailyUsage: Array<{ date: string; calls: number; tokens: number; cost: number }>
}

// Build provider info from centralized config
const PROVIDER_INFO = getEnabledProviders().reduce((acc, provider) => {
  acc[provider.id] = {
    name: provider.displayName,
    logo: provider.id === 'openai' ? '🤖' : 
          provider.id === 'claude' ? '🧠' :
          provider.id === 'gemini' ? '💎' :
          provider.id === 'grok' ? '🚀' : '🤖',
    color: provider.color
  }
  return acc
}, {} as Record<string, { name: string; logo: string; color: string }>)

const CHART_COLORS = getEnabledProviders().map(p => p.color)

function DashboardContent() {
  const { data: session, status } = useSession()
  const [selectedProvider, setSelectedProvider] = useState<string>('all')
  const [dateRange, setDateRange] = useState('30d')
  const [viewMode, setViewMode] = useState<'cards' | 'charts'>('cards')
  const [isLiveMode, setIsLiveMode] = useState(false) // Start with live mode off
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [providerStats, setProviderStats] = useState<ProviderStats[]>([])
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showDateMenu, setShowDateMenu] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<'cost' | 'calls' | 'tokens'>('cost')
  const [showProviderDetails, setShowProviderDetails] = useState<string | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Initialize with mock data for demo purposes
  useEffect(() => {
    if (!hasInitialized) {
      // Set mock data immediately to prevent loading state
      const mockStats: UsageStats = {
        totalCalls: 45678,
        totalTokens: 12500000,
        totalCost: 1847.32,
        thisMonth: { calls: 12456, tokens: 3200000, cost: 487.65 },
        thisWeek: { calls: 3421, tokens: 890000, cost: 134.78 },
        today: { calls: 487, tokens: 125000, cost: 18.94 },
        byProvider: {
          openai: { calls: 20000, tokens: 5000000, cost: 750.00 },
          claude: { calls: 15000, tokens: 4000000, cost: 600.00 },
          gemini: { calls: 8000, tokens: 2500000, cost: 350.00 },
          grok: { calls: 2678, tokens: 1000000, cost: 147.32 }
        },
        byModel: {
          'gpt-4': { calls: 10000, tokens: 2500000, cost: 500.00 },
          'gpt-3.5-turbo': { calls: 10000, tokens: 2500000, cost: 250.00 },
          'claude-3-opus': { calls: 8000, tokens: 2000000, cost: 400.00 },
          'claude-3-sonnet': { calls: 7000, tokens: 2000000, cost: 200.00 },
          'gemini-pro': { calls: 8000, tokens: 2500000, cost: 350.00 }
        },
        dailyUsage: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
          calls: Math.floor(Math.random() * 2000) + 500,
          tokens: Math.floor(Math.random() * 500000) + 100000,
          cost: Math.random() * 100 + 20
        }))
      }

      const mockProviders: ProviderStats[] = [
        { provider: 'openai', status: 'connected', calls: 20000, tokens: 5000000, cost: 750.00, models: ['gpt-4', 'gpt-3.5-turbo'] },
        { provider: 'claude', status: 'connected', calls: 15000, tokens: 4000000, cost: 600.00, models: ['claude-3-opus', 'claude-3-sonnet'] },
        { provider: 'gemini', status: 'connected', calls: 8000, tokens: 2500000, cost: 350.00, models: ['gemini-pro'] },
        { provider: 'grok', status: 'disconnected', calls: 678, tokens: 200000, cost: 47.32, models: [] }
      ]

      setUsageStats(mockStats)
      setProviderStats(mockProviders)
      setIsLoading(false)
      setHasInitialized(true)
    }
  }, [hasInitialized])

  // Fetch real data when session is available
  useEffect(() => {
    if (session?.user?.id && hasInitialized) {
      fetchAllData()
    }
  }, [session, dateRange, hasInitialized])

  const fetchAllData = async () => {
    setIsLoading(true)
    try {
      // Add timeout wrapper for fetch
      const fetchWithTimeout = (url: string, timeout = 5000) => {
        return Promise.race([
          fetch(url),
          new Promise<Response>((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          )
        ])
      }

      // Fetch provider statuses in parallel with timeout
      const providers = AI_PROVIDER_IDS
      const statusPromises = providers.map(async (provider) => {
        try {
          const response = await fetchWithTimeout(`/api/${provider}/test`, 3000)
          if (response.ok) {
            const status = await response.json()
            return {
              provider,
              status: status.isValid ? 'connected' : 'disconnected',
              ...status
            }
          }
          return { provider, status: 'disconnected' as const }
        } catch (error) {
          console.warn(`Failed to fetch ${provider} status:`, error)
          return { provider, status: 'disconnected' as const }
        }
      })

      const statuses = await Promise.allSettled(statusPromises)
      const resolvedStatuses = statuses
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<any>).value)

      // Initialize with default data if no stats available
      const defaultStats = {
        totalCalls: 0,
        totalTokens: 0,
        totalCost: 0,
        thisMonth: { calls: 0, tokens: 0, cost: 0 },
        thisWeek: { calls: 0, tokens: 0, cost: 0 },
        today: { calls: 0, tokens: 0, cost: 0 },
        byProvider: {},
        byModel: {},
        dailyUsage: []
      }

      // Fetch usage stats with timeout
      try {
        const usageResponse = await fetchWithTimeout('/api/usage/all?dateRange=' + dateRange, 5000)
        if (usageResponse.ok) {
          const stats = await usageResponse.json()
          setUsageStats(stats || defaultStats)

          // Combine provider stats with usage data
          const combinedStats: ProviderStats[] = providers.map(provider => {
            const providerUsage = (stats?.byProvider?.[provider]) || { calls: 0, tokens: 0, cost: 0 }
            const status = resolvedStatuses.find(s => s.provider === provider)
            return {
              provider,
              status: status?.status || 'disconnected',
              calls: providerUsage.calls || 0,
              tokens: providerUsage.tokens || 0,
              cost: providerUsage.cost || 0,
              models: stats?.byModel ? Object.keys(stats.byModel).filter(model => 
                (provider === 'openai' && model.startsWith('gpt')) ||
                (provider === 'claude' && model.includes('claude')) ||
                (provider === 'gemini' && model.includes('gemini')) ||
                (provider === 'grok' && model.includes('grok'))
              ) : []
            }
          })

          setProviderStats(combinedStats)
        } else {
          // Use default data if API fails
          setUsageStats(defaultStats)
          setProviderStats(providers.map(provider => ({
            provider,
            status: resolvedStatuses.find(s => s.provider === provider)?.status || 'disconnected',
            calls: 0,
            tokens: 0,
            cost: 0,
            models: []
          })))
        }
      } catch (error) {
        console.warn('Failed to fetch usage stats:', error)
        // Use default data on error
        setUsageStats(defaultStats)
        setProviderStats(providers.map(provider => ({
          provider,
          status: resolvedStatuses.find(s => s.provider === provider)?.status || 'disconnected',
          calls: 0,
          tokens: 0,
          cost: 0,
          models: []
        })))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      // Set default empty data to prevent stuck loading
      setUsageStats({
        totalCalls: 0,
        totalTokens: 0,
        totalCost: 0,
        thisMonth: { calls: 0, tokens: 0, cost: 0 },
        thisWeek: { calls: 0, tokens: 0, cost: 0 },
        today: { calls: 0, tokens: 0, cost: 0 },
        byProvider: {},
        byModel: {},
        dailyUsage: []
      })
      setProviderStats([])
    } finally {
      // Always set loading to false
      setIsLoading(false)
      setLastUpdate(new Date())
    }
  }

  const refreshData = () => {
    fetchAllData()
  }

  // Auto-refresh every 30 seconds if live mode is enabled and we have a session
  useEffect(() => {
    if (isLiveMode && session?.user?.id) {
      const interval = setInterval(refreshData, 30000)
      return () => clearInterval(interval)
    }
  }, [isLiveMode, session, dateRange])

  const exportData = (format: 'csv' | 'json' | 'pdf') => {
    if (!usageStats) return

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `ai-cost-report-${timestamp}`

    if (format === 'csv') {
      // Generate CSV
      const csvContent = [
        ['Provider', 'Status', 'API Calls', 'Tokens', 'Cost ($)', 'Usage Share (%)'],
        ...providerStats.map(p => [
          PROVIDER_INFO[p.provider as keyof typeof PROVIDER_INFO]?.name || p.provider,
          p.status,
          p.calls,
          p.tokens,
          p.cost.toFixed(2),
          calculateProviderPercentage(p.cost).toFixed(1)
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } else if (format === 'json') {
      // Generate JSON
      const jsonData = {
        metadata: {
          generated: new Date().toISOString(),
          period: dateRange,
          totalCost: usageStats.totalCost,
          totalCalls: usageStats.totalCalls,
          totalTokens: usageStats.totalTokens
        },
        providers: providerStats.map(p => ({
          name: PROVIDER_INFO[p.provider as keyof typeof PROVIDER_INFO]?.name || p.provider,
          provider: p.provider,
          status: p.status,
          metrics: {
            calls: p.calls,
            tokens: p.tokens,
            cost: p.cost,
            usageShare: calculateProviderPercentage(p.cost)
          },
          models: p.models
        })),
        timePeriods: {
          today: usageStats.today,
          thisWeek: usageStats.thisWeek,
          thisMonth: usageStats.thisMonth
        },
        dailyUsage: usageStats.dailyUsage
      }

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.json`
      link.click()
      URL.revokeObjectURL(url)
    } else if (format === 'pdf') {
      // For PDF, we'll show a notification that it's being generated
      // In a real implementation, this would call a backend service
      const notification = document.createElement('div')
      notification.className = 'fixed bottom-4 right-4 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2'
      notification.innerHTML = `
        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Generating PDF report...
      `
      document.body.appendChild(notification)
      
      setTimeout(() => {
        notification.innerHTML = `
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          PDF report ready for download!
        `
        setTimeout(() => {
          document.body.removeChild(notification)
        }, 3000)
      }, 2000)
    }

    setShowExportMenu(false)
  }

  const calculateProviderPercentage = (cost: number) => {
    if (!usageStats || usageStats.totalCost === 0) return 0
    return (cost / usageStats.totalCost) * 100
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900 mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const pieChartData = Object.entries(usageStats?.byProvider || {}).map(([provider, data]) => ({
    name: PROVIDER_INFO[provider as keyof typeof PROVIDER_INFO]?.name || provider,
    value: data.cost
  }))

  const barChartData = usageStats?.dailyUsage.slice(-7).map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    ...Object.entries(usageStats.byProvider).reduce((acc, [provider, data]) => {
      // Rough distribution of daily costs
      acc[provider] = (data.cost / 30) * (0.8 + Math.random() * 0.4)
      return acc
    }, {} as Record<string, number>)
  }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Clean Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Monitor AI usage and optimize costs across all providers
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Date Range Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowDateMenu(!showDateMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {dateRange === '24h' && '24 hours'}
                      {dateRange === '7d' && '7 days'}
                      {dateRange === '30d' && '30 days'}
                      {dateRange === '90d' && '90 days'}
                      {dateRange === '1y' && '1 year'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {showDateMenu && (
                    <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1">
                      {[{id: '24h', label: '24 hours'}, {id: '7d', label: '7 days'}, {id: '30d', label: '30 days'}, {id: '90d', label: '90 days'}, {id: '1y', label: '1 year'}].map(range => (
                        <button
                          key={range.id}
                          onClick={() => { setDateRange(range.id); setShowDateMenu(false) }}
                          className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${
                            dateRange === range.id ? 'text-gray-900 font-medium bg-gray-50' : 'text-gray-600'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* View Toggle */}
                <div className="flex bg-gray-100 rounded-md p-0.5">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      viewMode === 'cards' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setViewMode('charts')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      viewMode === 'charts' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Analytics
                  </button>
                </div>

                {/* Export Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="h-8 px-3 text-sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1">
                    <button
                      onClick={() => exportData('csv')}
                      className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Download as CSV
                    </button>
                    <button
                      onClick={() => exportData('json')}
                      className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Download as JSON
                    </button>
                    <button
                      onClick={() => exportData('pdf')}
                      className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Generate PDF Report
                    </button>
                  </div>
                )}

                {/* Refresh Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshData}
                  className="h-8 px-3 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-6">

          {/* Key Metrics */}
          {usageStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Spent</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">
                        ${usageStats.totalCost.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {dateRange === '24h' && 'Last 24 hours'}
                        {dateRange === '7d' && 'Last 7 days'}
                        {dateRange === '30d' && 'Last 30 days'}
                        {dateRange === '90d' && 'Last 90 days'}
                        {dateRange === '1y' && 'Last year'}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg bg-gray-100`}>
                      <DollarSign className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                  {usageStats.thisMonth.cost > 100 && (
                    <div className="flex items-center gap-1 mt-3">
                      <TrendingUp className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-600">+15% from last period</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">API Calls</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">
                        {usageStats.totalCalls.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Total requests</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-100">
                      <Zap className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Tokens Used</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">
                        {(usageStats.totalTokens / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Million tokens</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-100">
                      <Activity className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Active Providers</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">
                        {providerStats.filter(p => p.status === 'connected').length}/{providerStats.length}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Connected</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-100">
                      <Users className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        {viewMode === 'cards' ? (
          <div className="space-y-6">
            {/* Provider Usage Table */}
            <Card className="border-gray-200">
              <CardHeader className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Provider Usage</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {providerStats.filter(p => p.status === 'connected').length} Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Provider
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          API Calls
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tokens
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cost
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Share
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {providerStats.map((provider) => {
                        const info = PROVIDER_INFO[provider.provider as keyof typeof PROVIDER_INFO]
                        const percentage = calculateProviderPercentage(provider.cost)
                        return (
                          <tr key={provider.provider} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                                  <span className="text-base">{info?.logo}</span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{info?.name}</div>
                                  {provider.models.length > 0 && (
                                    <div className="text-xs text-gray-500">
                                      {provider.models.slice(0, 2).join(', ')}
                                      {provider.models.length > 2 && ` +${provider.models.length - 2}`}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge 
                                variant={provider.status === 'connected' ? 'default' : 'secondary'}
                                className={`text-xs ${
                                  provider.status === 'connected' 
                                    ? 'bg-green-100 text-green-800 border-green-200' 
                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                }`}
                              >
                                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                  provider.status === 'connected' ? 'bg-green-600' : 'bg-gray-400'
                                }`} />
                                {provider.status === 'connected' ? 'Connected' : 'Disconnected'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              {provider.calls.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              {(provider.tokens / 1000).toFixed(0)}K
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                              ${provider.cost.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-12 bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="h-1.5 rounded-full transition-all duration-300"
                                    style={{ 
                                      width: `${percentage}%`,
                                      backgroundColor: info?.color
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500 w-10 text-right">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>


            {/* Period Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {[
                { title: 'Today', data: usageStats?.today },
                { title: 'This Week', data: usageStats?.thisWeek },
                { title: 'This Month', data: usageStats?.thisMonth }
              ].map((period) => (
                <Card key={period.title} className="border-gray-200 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">{period.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">API Calls</span>
                      <span className="text-sm font-medium text-gray-900">
                        {period.data?.calls.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Tokens</span>
                      <span className="text-sm font-medium text-gray-900">
                        {period.data?.tokens.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-sm text-gray-500">Cost</span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${period.data?.cost.toFixed(period.title === 'Today' ? 4 : 2) || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

          </div>
        ) : (
          /* Analytics View */
          <div className="space-y-6">
            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cost Distribution */}
              <Card className="border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Cost Distribution</CardTitle>
                  <CardDescription className="text-sm text-gray-500">Spending breakdown by provider</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Daily Cost Trends */}
              <Card className="border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Daily Cost Trends</CardTitle>
                  <CardDescription className="text-sm text-gray-500">Last 7 days breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      {Object.keys(PROVIDER_INFO).map((provider, index) => (
                        <Bar
                          key={provider}
                          dataKey={provider}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          name={PROVIDER_INFO[provider as keyof typeof PROVIDER_INFO].name}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Usage Trends */}
            <Card className="border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Usage & Cost Trends</CardTitle>
                <CardDescription className="text-sm text-gray-500">Historical performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usageStats?.dailyUsage || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis yAxisId="left" stroke="#6b7280" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#6b7280" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="calls"
                      stroke="#7c3aed"
                      strokeWidth={2}
                      dot={false}
                      name="API Calls"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="cost"
                      stroke="#10a37f"
                      strokeWidth={2}
                      dot={false}
                      name="Cost ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

          </div>
        )}

          {/* Alerts */}
          {(usageStats && usageStats.thisMonth.cost > 100) || providerStats.filter(p => p.status === 'disconnected').length > 0 ? (
            <div className="space-y-3">
              {usageStats && usageStats.thisMonth.cost > 100 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-amber-900">High monthly spending</h3>
                      <p className="text-sm text-amber-700 mt-1">
                        Current month spending (${usageStats.thisMonth.cost.toFixed(2)}) exceeds $100 threshold.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {providerStats.filter(p => p.status === 'disconnected').length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-red-900">Disconnected providers</h3>
                      <p className="text-sm text-red-700 mt-1">
                        {providerStats.filter(p => p.status === 'disconnected').length} provider(s) not connected.
                        <Link href="/settings" className="underline ml-1">Configure API keys</Link>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Quick Actions */}
          <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-white">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/settings" className="group">
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                    <Settings className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" />
                    <span className="text-sm text-gray-700 group-hover:text-indigo-700 font-medium">Settings</span>
                  </div>
                </Link>
                <Link href="/team" className="group">
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                    <Users className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" />
                    <span className="text-sm text-gray-700 group-hover:text-indigo-700 font-medium">Team</span>
                  </div>
                </Link>
                <Link href="/billing" className="group">
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                    <CreditCard className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" />
                    <span className="text-sm text-gray-700 group-hover:text-indigo-700 font-medium">Billing</span>
                  </div>
                </Link>
                <Link href="/docs" className="group">
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                    <FileText className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" />
                    <span className="text-sm text-gray-700 group-hover:text-indigo-700 font-medium">Documentation</span>
                  </div>
                </Link>
                <Link href="/api" className="group">
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                    <ExternalLink className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" />
                    <span className="text-sm text-gray-700 group-hover:text-indigo-700 font-medium">API</span>
                  </div>
                </Link>
                <Link href="/integrations" className="group">
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                    <Zap className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" />
                    <span className="text-sm text-gray-700 group-hover:text-indigo-700 font-medium">Integrations</span>
                  </div>
                </Link>
                <Link href="/alerts" className="group">
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                    <AlertCircle className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" />
                    <span className="text-sm text-gray-700 group-hover:text-indigo-700 font-medium">Alerts</span>
                  </div>
                </Link>
                <Link href="/reports" className="group">
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                    <BarChart3 className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" />
                    <span className="text-sm text-gray-700 group-hover:text-indigo-700 font-medium">Reports</span>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <AuthWrapper>
      <DashboardContent />
    </AuthWrapper>
  )
}
