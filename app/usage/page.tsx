'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import AuthWrapper from '@/components/AuthWrapper'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getAIProviderLogo, getProviderInfo } from '@/components/ui/ai-logos'
import { TrendingUp, TrendingDown, Activity, DollarSign, Zap, Clock, Filter, ChevronRight } from 'lucide-react'

interface AIUsage {
  id: string
  userId: string
  provider: string
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  inputCost: number
  outputCost: number
  totalCost: number
  timestamp: Date
  requestId?: string
  prompt?: string
  response?: string
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

const AI_PROVIDERS = {
  openai: { 
    name: 'OpenAI', 
    color: '#10a37f',
    models: {
      'gpt-4o': { name: 'GPT-4o', tier: 'premium' },
      'gpt-4o-mini': { name: 'GPT-4o Mini', tier: 'fast' },
      'gpt-4-turbo': { name: 'GPT-4 Turbo', tier: 'intelligent' },
      'gpt-4': { name: 'GPT-4', tier: 'intelligent' },
      'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', tier: 'fast' }
    }
  },
  claude: { 
    name: 'Claude', 
    color: '#6366f1',
    models: {
      'claude-3-5-sonnet-20241022': { name: 'Claude 3.5 Sonnet', tier: 'premium' },
      'claude-3-5-haiku-20241022': { name: 'Claude 3.5 Haiku', tier: 'fast' },
      'claude-3-opus-20240229': { name: 'Claude 3 Opus', tier: 'intelligent' }
    }
  },
  gemini: { 
    name: 'Gemini', 
    color: '#4285f4',
    models: {
      'gemini-1.5-pro': { name: 'Gemini 1.5 Pro', tier: 'intelligent' },
      'gemini-1.5-flash': { name: 'Gemini 1.5 Flash', tier: 'fast' },
      'gemini-pro': { name: 'Gemini Pro', tier: 'premium' }
    }
  },
  perplexity: { 
    name: 'Perplexity', 
    color: '#9333ea',
    models: {
      'llama-3.1-sonar-small-128k-online': { name: 'Sonar Small Online', tier: 'fast' },
      'llama-3.1-sonar-large-128k-online': { name: 'Sonar Large Online', tier: 'intelligent' },
      'llama-3.1-sonar-huge-128k-online': { name: 'Sonar Huge Online', tier: 'premium' }
    }
  },
  grok: { 
    name: 'Grok', 
    logo: '🚀', 
    color: '#1DA1F2',
    models: {
      'grok-beta': { name: 'Grok Beta', tier: 'premium' },
      'grok-vision-beta': { name: 'Grok Vision Beta', tier: 'intelligent' }
    }
  }
}

function UsageContent() {
  const { data: session } = useSession()
  const [selectedProvider, setSelectedProvider] = useState<string>('all')
  const [timeRange, setTimeRange] = useState('7d')
  const [activeTab, setActiveTab] = useState('overview')
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [recentUsage, setRecentUsage] = useState<AIUsage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchUsageData()
    }
  }, [session, timeRange, selectedProvider])

  const fetchUsageData = async () => {
    try {
      setIsLoading(true)
      
      // Check if user is authenticated
      if (!session?.user?.id) {
        console.error('No session found, cannot fetch usage data')
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
        setRecentUsage([])
        return
      }
      
      // Fetch aggregate usage stats from all providers
      const statsResponse = await fetch(`/api/usage/all?dateRange=${timeRange}&provider=${selectedProvider}`)
      if (statsResponse.ok) {
        const stats = await statsResponse.json()
        setUsageStats(stats)
      } else {
        console.error('Stats API error:', statsResponse.status, statsResponse.statusText)
        // Set default empty stats if API fails
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
      }

      // Fetch recent usage from all providers
      const recentResponse = await fetch(`/api/usage/recent?limit=20&provider=${selectedProvider}`)
      if (recentResponse.ok) {
        const recent = await recentResponse.json()
        if (Array.isArray(recent)) {
          setRecentUsage(recent.map((usage: any) => ({
            ...usage,
            timestamp: new Date(usage.timestamp)
          })))
        } else {
          setRecentUsage([])
        }
      } else {
        console.error('Recent usage API error:', recentResponse.status, recentResponse.statusText)
        setRecentUsage([])
      }
    } catch (error) {
      console.error('Failed to fetch usage data:', error)
      // Set fallback data
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
      setRecentUsage([])
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredData = () => {
    if (!usageStats) return null

    // Apply time range filtering to daily usage
    let filteredDays = usageStats.dailyUsage

    switch (timeRange) {
      case '1d':
        filteredDays = usageStats.dailyUsage.slice(-1)
        break
      case '7d':
        filteredDays = usageStats.dailyUsage.slice(-7)
        break
      case '30d':
        filteredDays = usageStats.dailyUsage.slice(-30)
        break
    }

    return {
      ...usageStats,
      dailyUsage: filteredDays
    }
  }

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    }).format(cost)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  const getProviderInfo = (provider: string) => {
    return AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS] || { 
      name: provider.charAt(0).toUpperCase() + provider.slice(1), 
      logo: '🔧', 
      color: '#6b7280',
      models: {}
    }
  }

  const getModelInfo = (provider: string, model: string): { name: string; tier: string } => {
    const providerInfo = getProviderInfo(provider)
    const modelInfo = providerInfo.models[model as keyof typeof providerInfo.models]
    return modelInfo || { 
      name: model, 
      tier: 'unknown' 
    }
  }

  const filteredData = getFilteredData()

  // Show loading while session is loading
  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading AI usage analytics...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white">AI Usage Analytics</h1>
            <p className="text-gray-400 mt-2">
              Comprehensive analytics and insights for all your AI provider usage
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex flex-wrap items-center gap-4"
          >
            {/* Provider Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-300">Provider:</label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="w-40 bg-gray-800/50 border-gray-700 text-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  <SelectItem value="all">All Providers</SelectItem>
                  {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center space-x-2">
                        <span>{getAIProviderLogo(key, 'w-4 h-4')}</span>
                        <span>{provider.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Range Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-300">Time Range:</label>
              <div className="flex space-x-2">
                {[
                  { value: '1d', label: 'Last 24h' },
                  { value: '7d', label: 'Last 7 days' },
                  { value: '30d', label: 'Last 30 days' }
                ].map((range) => (
                  <Button
                    key={range.value}
                    className={timeRange === range.value 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'}
                    size="sm"
                    onClick={() => setTimeRange(range.value)}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="border-b border-gray-800">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', name: 'Overview', icon: '📊' },
                  { id: 'providers', name: 'Providers', icon: '🏭' },
                  { id: 'models', name: 'Models', icon: '🤖' },
                  { id: 'costs', name: 'Costs', icon: '💰' },
                  { id: 'history', name: 'History', icon: '📝' },
                  { id: 'insights', name: 'Insights', icon: '💡' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

        {/* Tab Content */}
        {activeTab === 'overview' && filteredData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Requests</p>
                    <p className="text-2xl font-bold text-white">{filteredData.totalCalls.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <Activity className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Tokens</p>
                    <p className="text-2xl font-bold text-white">{filteredData.totalTokens.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-full">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-900/50 to-emerald-800/50 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Cost</p>
                    <p className="text-2xl font-bold text-white">{formatCost(filteredData.totalCost)}</p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-900/50 to-orange-800/50 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Active Providers</p>
                    <p className="text-2xl font-bold text-white">{Object.keys(filteredData.byProvider).length}</p>
                  </div>
                  <div className="p-3 bg-yellow-500/20 rounded-full">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Usage Chart */}
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white">Daily Usage Trend</h3>
                <p className="text-gray-300 mt-1">API calls and costs over time</p>
              </div>
              <div className="space-y-4">
                {filteredData.dailyUsage.slice(-7).map((day, index) => (
                  <div key={day.date} className="flex items-center space-x-4">
                    <div className="w-20 text-sm text-gray-400">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-white">{day.calls} calls</span>
                        <span className="text-sm text-gray-400">{formatCost(day.cost)}</span>
                      </div>
                      <Progress 
                        value={filteredData.dailyUsage.length > 0 ? (day.calls / Math.max(...filteredData.dailyUsage.map(d => d.calls))) * 100 : 0} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'providers' && filteredData && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white">Usage by Provider</h3>
                <p className="text-gray-300 mt-1">Breakdown of usage across different AI providers</p>
              </div>
              <div className="space-y-4">
                {Object.entries(filteredData.byProvider).map(([provider, data]) => {
                  const providerInfo = getProviderInfo(provider)
                  return (
                    <div key={provider} className="p-4 border border-gray-600 rounded-lg bg-gray-800/30">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          {'logo' in providerInfo && (
                            <span className="text-2xl">{providerInfo.logo}</span>
                          )}
                          <div>
                            <h3 className="font-semibold text-white">{providerInfo.name}</h3>
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: providerInfo.color }}></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">{formatCost(data.cost)}</p>
                          <p className="text-sm text-gray-400">{data.calls} calls</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Tokens</p>
                          <p className="font-semibold text-white">{data.tokens.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Avg Tokens/Call</p>
                          <p className="font-semibold text-white">{data.calls > 0 ? Math.round(data.tokens / data.calls).toLocaleString() : '0'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Avg Cost/Call</p>
                          <p className="font-semibold text-white">{data.calls > 0 ? formatCost(data.cost / data.calls) : '$0.0000'}</p>
                        </div>
                      </div>
                      <Progress 
                        value={filteredData.totalCost > 0 ? (data.cost / filteredData.totalCost) * 100 : 0} 
                        className="mt-3 h-2" 
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'models' && filteredData && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white">Usage by Model</h3>
                <p className="text-gray-300 mt-1">Breakdown of usage across different AI models</p>
              </div>
              <div className="space-y-4">
                {Object.entries(filteredData.byModel).map(([model, data]) => {
                  // Try to determine provider from model name
                  let provider = 'unknown'
                  if (model.includes('gpt')) provider = 'openai'
                  else if (model.includes('claude')) provider = 'claude'
                  else if (model.includes('gemini')) provider = 'gemini'
                  else if (model.includes('sonar') || model.includes('llama')) provider = 'perplexity'
                  else if (model.includes('grok')) provider = 'grok'
                  
                  const modelInfo = getModelInfo(provider, model)
                  const providerInfo = getProviderInfo(provider)
                  
                  return (
                    <div key={model} className="p-4 border border-gray-600 rounded-lg bg-gray-800/30">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          {'logo' in providerInfo && (
                            <span className="text-xl">{providerInfo.logo}</span>
                          )}
                          <div>
                            <h3 className="font-semibold text-white">{modelInfo.name}</h3>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline" 
                                className={
                                  modelInfo.tier === 'premium' ? 'border-purple-500/30 text-purple-300 bg-purple-500/10' :
                                  modelInfo.tier === 'intelligent' ? 'border-blue-500/30 text-blue-300 bg-blue-500/10' :
                                  'border-green-500/30 text-green-300 bg-green-500/10'
                                }
                              >
                                {modelInfo.tier}
                              </Badge>
                              <span className="text-sm text-gray-400">{providerInfo.name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">{formatCost(data.cost)}</p>
                          <p className="text-sm text-gray-400">{data.calls} calls</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Tokens</p>
                          <p className="font-semibold text-white">{data.tokens.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Avg Tokens/Call</p>
                          <p className="font-semibold text-white">{data.calls > 0 ? Math.round(data.tokens / data.calls).toLocaleString() : '0'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Avg Cost/Call</p>
                          <p className="font-semibold text-white">{data.calls > 0 ? formatCost(data.cost / data.calls) : '$0.0000'}</p>
                        </div>
                      </div>
                      <Progress 
                        value={filteredData.totalCost > 0 ? (data.cost / filteredData.totalCost) * 100 : 0} 
                        className="mt-3 h-2" 
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white">Recent API Calls</h3>
                <p className="text-gray-300 mt-1">Latest API requests across all providers</p>
              </div>
              <div className="space-y-4">
                {recentUsage.map((usage) => {
                  const providerInfo = getProviderInfo(usage.provider)
                  const modelInfo = getModelInfo(usage.provider, usage.model)
                  
                  return (
                    <div key={usage.id} className="p-4 border border-gray-600 rounded-lg bg-gray-800/30">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          {'logo' in providerInfo && (
                            <span className="text-lg">{providerInfo.logo}</span>
                          )}
                          <Badge variant="outline" className="font-mono text-xs border-gray-500/30 text-gray-300 bg-gray-700/30">
                            {modelInfo.name}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-gray-500/30 text-gray-300 bg-gray-700/30" style={{ borderColor: providerInfo.color, color: providerInfo.color }}>
                            {providerInfo.name}
                          </Badge>
                          <span className="text-sm text-gray-400">
                            {formatDate(usage.timestamp)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-400">{formatCost(usage.totalCost)}</p>
                          <p className="text-xs text-gray-400">{usage.totalTokens.toLocaleString()} tokens</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Input Tokens</p>
                          <p className="font-semibold text-white">{usage.inputTokens.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Output Tokens</p>
                          <p className="font-semibold text-white">{usage.outputTokens.toLocaleString()}</p>
                        </div>
                      </div>
                      {usage.requestId && (
                        <p className="text-xs text-gray-500 mt-2 font-mono">
                          Request ID: {usage.requestId}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && filteredData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white">Cost Optimization Tips</h3>
                  <p className="text-gray-300 mt-1">Ways to reduce your AI API costs</p>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h4 className="font-semibold text-blue-300 mb-1">💡 Choose the Right Model</h4>
                    <p className="text-sm text-blue-200">Use faster/cheaper models for simple tasks and premium models for complex reasoning</p>
                  </div>
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <h4 className="font-semibold text-green-300 mb-1">🎯 Optimize Prompts</h4>
                    <p className="text-sm text-green-200">Shorter, more specific prompts reduce token usage and costs across all providers</p>
                  </div>
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <h4 className="font-semibold text-purple-300 mb-1">📊 Monitor Usage Patterns</h4>
                    <p className="text-sm text-purple-200">Track peak usage times to optimize API call scheduling and provider selection</p>
                  </div>
                  <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <h4 className="font-semibold text-orange-300 mb-1">🔄 Multi-Provider Strategy</h4>
                    <p className="text-sm text-orange-200">Use different providers for different use cases to optimize cost and performance</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white">Usage Statistics</h3>
                  <p className="text-gray-300 mt-1">Key metrics for your AI usage</p>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Most Used Provider</span>
                    <span className="font-semibold text-white">
                      {Object.keys(filteredData.byProvider).length > 0 ? 
                        getProviderInfo(Object.entries(filteredData.byProvider).reduce((a, b) => a[1].calls > b[1].calls ? a : b)[0]).name :
                        'None'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Most Used Model</span>
                    <span className="font-semibold text-white">
                      {Object.keys(filteredData.byModel).length > 0 ? 
                        Object.entries(filteredData.byModel).reduce((a, b) => a[1].calls > b[1].calls ? a : b)[0] :
                        'None'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Average Daily Calls</span>
                    <span className="font-semibold text-white">
                      {filteredData.dailyUsage.length > 0 ? 
                        Math.round(filteredData.dailyUsage.reduce((sum, day) => sum + day.calls, 0) / filteredData.dailyUsage.length) :
                        0
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Average Daily Cost</span>
                    <span className="font-semibold text-white">
                      {filteredData.dailyUsage.length > 0 ? 
                        formatCost(filteredData.dailyUsage.reduce((sum, day) => sum + day.cost, 0) / filteredData.dailyUsage.length) :
                        '$0.0000'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Peak Usage Day</span>
                    <span className="font-semibold text-white">
                      {filteredData.dailyUsage.length > 0 ? 
                        new Date(filteredData.dailyUsage.reduce((a, b) => a.calls > b.calls ? a : b).date).toLocaleDateString('en-US', { weekday: 'long' }) :
                        'No data'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

export default function Usage() {
  return (
    <AuthWrapper>
      <UsageContent />
    </AuthWrapper>
  )
}
