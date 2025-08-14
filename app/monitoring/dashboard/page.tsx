'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Monitor, DollarSign, Zap, AlertTriangle, BarChart3, Settings, Download, Bell, Eye, Users, Shield } from 'lucide-react'
// import { ProviderCard } from '@/components/shared/ProviderCard'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  DashboardSkeleton, 
  CardSkeleton, 
  LoadingOverlay, 
  SpinnerLoader,
  InsightsSkeleton,
  ListSkeleton
} from '@/components/shared/LoadingStates'
import { 
  ErrorDisplay, 
  APIErrorDisplay, 
  EmptyStateDisplay, 
  ErrorBoundary 
} from '@/components/shared/ErrorStates'

interface UsageData {
  provider: string
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

interface InsightData {
  type: 'optimization' | 'cost_saving' | 'usage_pattern' | 'warning'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionItems: string[]
  data?: any
  createdAt: Date
}

interface AlertData {
  id: string
  type: string
  provider: string
  threshold: number
  message: string
  isActive: boolean
  triggeredAt: string
}

export default function MonitoringDashboard() {
  const { data: session, status } = useSession()
  const [usageData, setUsageData] = useState<Record<string, UsageData>>({})
  const [insights, setInsights] = useState<InsightData[]>([])
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [realTimeEnabled, setRealTimeEnabled] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('24h')
  const [selectedProvider, setSelectedProvider] = useState<string>('all')
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Real-time polling interval
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (realTimeEnabled && session) {
      interval = setInterval(() => {
        fetchUsageData()
        fetchInsights()
        fetchAlerts()
      }, 5000) // Poll every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [realTimeEnabled, session, selectedPeriod, selectedProvider])

  // Initial data load
  useEffect(() => {
    if (session) {
      fetchUsageData()
      fetchInsights()
      fetchAlerts()
    }
  }, [session, selectedPeriod, selectedProvider])

  const fetchUsageData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        realTime: 'true',
        ...(selectedProvider !== 'all' && { provider: selectedProvider })
      })

      // Calculate date range based on selected period
      const endDate = new Date()
      const startDate = new Date()
      switch (selectedPeriod) {
        case '1h':
          startDate.setHours(startDate.getHours() - 1)
          break
        case '6h':
          startDate.setHours(startDate.getHours() - 6)
          break
        case '24h':
          startDate.setHours(startDate.getHours() - 24)
          break
        case '7d':
          startDate.setDate(startDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(startDate.getDate() - 30)
          break
      }

      params.append('startDate', startDate.toISOString())
      params.append('endDate', endDate.toISOString())

      const response = await fetch(`/api/monitoring/usage?${params}`)
      if (!response.ok) throw new Error('Failed to fetch usage data')

      const data = await response.json()
      setUsageData(data)
      setLastUpdated(new Date())
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchInsights = async () => {
    try {
      const days = selectedPeriod === '1h' ? 1 : 
                   selectedPeriod === '6h' ? 1 :
                   selectedPeriod === '24h' ? 1 :
                   selectedPeriod === '7d' ? 7 : 30

      const response = await fetch(`/api/monitoring/insights?days=${days}`)
      if (!response.ok) throw new Error('Failed to fetch insights')

      const data = await response.json()
      setInsights(data)
    } catch (err: any) {
      console.error('Error fetching insights:', err)
    }
  }

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/monitoring/alerts?active=true')
      if (!response.ok) throw new Error('Failed to fetch alerts')

      const data = await response.json()
      setAlerts(data)
    } catch (err: any) {
      console.error('Error fetching alerts:', err)
    }
  }

  const exportData = async (format: 'csv' | 'json') => {
    try {
      const params = new URLSearchParams({
        format,
        ...(selectedProvider !== 'all' && { provider: selectedProvider })
      })

      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30) // Last 30 days for export

      params.append('startDate', startDate.toISOString())
      params.append('endDate', endDate.toISOString())

      const response = await fetch(`/api/monitoring/export?${params}`)
      if (!response.ok) throw new Error('Failed to export data')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-usage-report.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      setError(`Export failed: ${err.message}`)
    }
  }

  const createCostAlert = async (provider: string, threshold: number) => {
    try {
      const response = await fetch('/api/monitoring/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'cost_alert',
          provider,
          threshold,
          message: `Cost alert for ${provider} at $${threshold}`
        })
      })

      if (!response.ok) throw new Error('Failed to create alert')
      
      fetchAlerts() // Refresh alerts
    } catch (err: any) {
      setError(`Failed to create alert: ${err.message}`)
    }
  }

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/monitoring/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId, isActive })
      })

      if (!response.ok) throw new Error('Failed to update alert')
      
      fetchAlerts() // Refresh alerts
    } catch (err: any) {
      setError(`Failed to update alert: ${err.message}`)
    }
  }

  // Calculate totals across all providers
  const totals = Object.values(usageData).reduce(
    (acc, provider) => ({
      cost: acc.cost + (provider.totalCost || 0),
      tokens: acc.tokens + (provider.totalTokens || 0),
      requests: acc.requests + (provider.totalRequests || 0)
    }),
    { cost: 0, tokens: 0, requests: 0 }
  )

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-900/20 text-red-300 border-red-500/30'
      case 'medium': return 'bg-yellow-900/20 text-yellow-300 border-yellow-500/30'
      case 'low': return 'bg-green-900/20 text-green-300 border-green-500/30'
      default: return 'bg-gray-800/30 text-gray-300 border-gray-600/50'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <Zap className="w-5 h-5" />
      case 'cost_saving': return <DollarSign className="w-5 h-5" />
      case 'usage_pattern': return <BarChart3 className="w-5 h-5" />
      case 'warning': return <AlertTriangle className="w-5 h-5" />
      default: return <Monitor className="w-5 h-5" />
    }
  }

  if (status === 'loading') {
    return <DashboardSkeleton />
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyStateDisplay
          title="Authentication Required"
          message="Please sign in to access the monitoring dashboard"
          icon="🔐"
          actionText="Sign In"
          onAction={() => window.location.href = '/auth/signin'}
        />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <motion.div 
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Monitor className="w-8 h-8 mr-3 text-blue-400" />
                AI Usage Monitoring Dashboard
              </h1>
              <p className="text-gray-300 mt-2">
                Real-time monitoring of AI provider usage, costs, and insights
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${realTimeEnabled ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                  <span>{realTimeEnabled ? 'Live' : 'Paused'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Time Period Selector */}
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none backdrop-blur-xl"
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>

              {/* Provider Filter */}
              <select 
                value={selectedProvider} 
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none backdrop-blur-xl"
              >
                <option value="all">All Providers</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Claude</option>
                <option value="google_gemini">Gemini</option>
                <option value="grok">Grok</option>
              </select>

              {/* Real-time Toggle */}
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={realTimeEnabled}
                  onCheckedChange={setRealTimeEnabled}
                />
                <span className="text-gray-300 text-sm">Real-time</span>
              </div>

              {/* Export Buttons */}
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportData('csv')}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:text-white backdrop-blur-xl"
                >
                  <Download className="w-4 h-4 mr-1" />
                  CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportData('json')}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:text-white backdrop-blur-xl"
                >
                  <Download className="w-4 h-4 mr-1" />
                  JSON
                </Button>
              </div>
            </div>
          </motion.div>

      {/* Error Display */}
      {error && (
        <APIErrorDisplay 
          error={error}
          onRetry={() => {
            setError(null)
            fetchUsageData()
            fetchInsights()
            fetchAlerts()
          }}
          onDismiss={() => setError(null)}
        />
      )}

          {/* Summary Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div 
              className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-400">Total Cost</h3>
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                ${totals.cost.toFixed(2)}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Across {Object.keys(usageData).length} providers
              </p>
            </motion.div>

            <motion.div 
              className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-400">Total Tokens</h3>
                <Zap className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                {totals.tokens.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {totals.requests.toLocaleString()} requests
              </p>
            </motion.div>

            <motion.div 
              className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-400">Active Alerts</h3>
                <Bell className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                {alerts.filter(a => a.isActive).length}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {alerts.length} total alerts
              </p>
            </motion.div>
          </motion.div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'providers', label: 'Providers', icon: Users },
                { id: 'insights', label: 'Insights', icon: BarChart3 },
                { id: 'alerts', label: 'Alerts', icon: Bell },
                { id: 'export', label: 'Reports', icon: Download }
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id}
                  className="px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 bg-gray-900/50 text-gray-400 hover:bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 data-[state=active]:border-blue-600"
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Provider Usage Charts */}
          <motion.div 
            className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white">Usage by Provider</h3>
              <p className="text-gray-400 mt-1">Cost and token distribution across AI providers</p>
            </div>
            <div className="space-y-4">
              <LoadingOverlay isLoading={isLoading} message="Loading usage data...">
                {Object.keys(usageData).length === 0 && !isLoading ? (
                  <EmptyStateDisplay
                    title="No Usage Data"
                    message="No usage data available for the selected period"
                    icon="📊"
                    actionText="Refresh Data"
                    onAction={fetchUsageData}
                  />
                ) : (
                  Object.entries(usageData).map(([provider, data], index) => (
                    <motion.div 
                      key={provider} 
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:bg-gray-800/70 hover:border-gray-600/50 transition-all"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-400">
                            {provider.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium capitalize text-white">{provider.replace('_', ' ')}</div>
                          <div className="text-sm text-gray-500">
                            {data.totalRequests} requests
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">${data.totalCost.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">
                          {data.totalTokens.toLocaleString()} tokens
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </LoadingOverlay>
            </div>
          </motion.div>

          {/* Top Models */}
          <motion.div 
            className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white">Top Models by Cost</h3>
              <p className="text-gray-400 mt-1">Most expensive models in the selected time period</p>
            </div>
            <div className="space-y-3">
              {Object.entries(usageData)
                .flatMap(([provider, data]) => 
                  Object.entries(data.byModel || {}).map(([model, modelData]) => ({
                    provider,
                    model,
                    ...modelData
                  }))
                )
                .sort((a, b) => b.cost - a.cost)
                .slice(0, 5)
                .map(({ provider, model, cost, tokens, requests }, index) => (
                  <div key={`${provider}-${model}`} className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:bg-gray-800/70 hover:border-gray-600/50 transition-all">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center text-sm font-bold text-purple-400">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-white">{model}</div>
                        <div className="text-sm text-gray-500 capitalize">{provider.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">${cost.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">{tokens.toLocaleString()} tokens</div>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(usageData).map(([provider, data]) => (
              <motion.div 
                key={provider}
                className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-white capitalize">{provider.replace('_', ' ')}</h3>
                    <Badge 
                      variant={data.totalCost > 0 ? "default" : "secondary"}
                      className={data.totalCost > 0 ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-gray-500/20 text-gray-300 border-gray-500/30"}
                    >
                      {data.totalCost > 0 ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-gray-300">Usage data for the {selectedPeriod} period</p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-300">
                        ${data.totalCost.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-400">Cost</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-300">
                        {data.totalTokens.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">Tokens</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-300">
                        {data.totalRequests}
                      </div>
                      <div className="text-sm text-gray-400">Requests</div>
                    </div>
                  </div>

                  {/* Model Breakdown */}
                  {data.byModel && Object.keys(data.byModel).length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-white">Model Breakdown</h4>
                      <div className="space-y-2">
                        {Object.entries(data.byModel)
                          .sort(([,a], [,b]) => b.cost - a.cost)
                          .map(([model, modelData]) => (
                            <div key={model} className="flex justify-between items-center text-sm">
                              <span className="truncate text-gray-300">{model}</span>
                              <span className="font-medium text-white">${modelData.cost.toFixed(2)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <motion.div 
            className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white">AI-Powered Insights</h3>
              <p className="text-gray-300 mt-1">
                Intelligent recommendations to optimize your AI usage and reduce costs
              </p>
            </div>
            <div>
              {isLoading && insights.length === 0 ? (
                <InsightsSkeleton />
              ) : insights.length > 0 ? (
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${getImpactColor(insight.impact)}`}>
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{getInsightIcon(insight.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">{insight.title}</h4>
                            <Badge className={getImpactColor(insight.impact)}>
                              {insight.impact} impact
                            </Badge>
                          </div>
                          <p className="text-sm mb-3 text-gray-300">{insight.description}</p>
                          {insight.actionItems.length > 0 && (
                            <div>
                              <h5 className="font-medium text-sm mb-1 text-white">Recommended Actions:</h5>
                              <ul className="text-sm space-y-1">
                                {insight.actionItems.map((item, itemIndex) => (
                                  <li key={itemIndex} className="flex items-start">
                                    <span className="text-xs mr-2 mt-1 text-gray-400">•</span>
                                    <span className="text-gray-300">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyStateDisplay
                  title="No Insights Available"
                  message="Start using AI providers to get personalized optimization recommendations."
                  icon="📊"
                  actionText="Refresh Insights"
                  onAction={fetchInsights}
                />
              )}
            </div>
          </motion.div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          {/* Create New Alert */}
          <motion.div 
            className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white">Create Cost Alert</h3>
              <p className="text-gray-300 mt-1">
                Set up alerts to monitor your AI spending in real-time
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-300">Provider</Label>
                <select className="w-full border border-gray-700 bg-gray-900/50 text-white rounded-lg px-3 py-2 text-sm mt-1 focus:border-blue-500 focus:outline-none backdrop-blur-xl">
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Claude</option>
                  <option value="google_gemini">Gemini</option>
                  <option value="grok">Grok</option>
                </select>
              </div>
              <div>
                <Label className="text-gray-300">Daily Threshold ($)</Label>
                <Input 
                  type="number" 
                  placeholder="50.00" 
                  className="mt-1 bg-gray-900/50 border-gray-700 text-white focus:border-blue-500 backdrop-blur-xl"
                />
              </div>
              <div className="flex items-end">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Create Alert</Button>
              </div>
            </div>
          </motion.div>

          {/* Active Alerts */}
          <motion.div 
            className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white">Active Alerts</h3>
              <p className="text-gray-300 mt-1">
                Manage your cost monitoring alerts
              </p>
            </div>
            <div>
              {isLoading && alerts.length === 0 ? (
                <ListSkeleton items={3} />
              ) : alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:bg-gray-800/70 hover:border-gray-600/50 transition-all">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${alert.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                        <div>
                          <div className="font-medium text-white">{alert.message}</div>
                          <div className="text-sm text-gray-500 capitalize">
                            {alert.provider.replace('_', ' ')} • ${alert.threshold} threshold
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={alert.isActive}
                          onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
                        />
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyStateDisplay
                  title="No Alerts Configured"
                  message="Create alerts to monitor your AI spending and get notified when costs exceed thresholds."
                  icon="🔔"
                  actionText="Create Alert"
                  onAction={() => {/* Focus on alert creation form */}}
                />
              )}
            </div>
          </motion.div>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <motion.div 
            className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white">Usage Reports</h3>
              <p className="text-gray-300 mt-1">
                Export detailed usage reports for analysis and compliance
              </p>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-white">Export Options</h4>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => exportData('csv')} 
                      variant="outline" 
                      className="w-full justify-start bg-gray-900/50 border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:text-white backdrop-blur-xl"
                    >
                      📊 Export as CSV
                      <span className="ml-auto text-sm text-gray-400">Spreadsheet format</span>
                    </Button>
                    <Button 
                      onClick={() => exportData('json')} 
                      variant="outline" 
                      className="w-full justify-start bg-gray-900/50 border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:text-white backdrop-blur-xl"
                    >
                      🔗 Export as JSON
                      <span className="ml-auto text-sm text-gray-400">API-friendly format</span>
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-white">Report Summary</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Records:</span>
                      <span className="font-medium text-white">{totals.requests.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Cost:</span>
                      <span className="font-medium text-white">${totals.cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Tokens:</span>
                      <span className="font-medium text-white">{totals.tokens.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Active Providers:</span>
                      <span className="font-medium text-white">{Object.keys(usageData).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  )
}