'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
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
      <div className="min-h-screen bg-gray-950 relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-green-600 to-blue-600 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-10 animate-pulse delay-500"></div>
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
                className="bg-gray-800/50 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none"
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
                className="bg-gray-800/50 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none"
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
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <Download className="w-4 h-4 mr-1" />
                  CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportData('json')}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <Download className="w-4 h-4 mr-1" />
                  JSON
                </Button>
              </div>
            </div>
      </div>

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
              className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-300">Total Cost</h3>
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-300">
                ${totals.cost.toFixed(2)}
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Across {Object.keys(usageData).length} providers
              </p>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-green-900/50 to-emerald-800/50 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-300">Total Tokens</h3>
                <Zap className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-300">
                {totals.tokens.toLocaleString()}
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {totals.requests.toLocaleString()} requests
              </p>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 backdrop-blur-xl rounded-2xl border border-orange-500/30 p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-300">Active Alerts</h3>
                <Bell className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-3xl font-bold text-orange-300">
                {alerts.filter(a => a.isActive).length}
              </div>
              <p className="text-sm text-gray-400 mt-1">
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
                  className="px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/20 bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
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
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white">Usage by Provider</h3>
              <p className="text-gray-300 mt-1">Cost and token distribution across AI providers</p>
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
                {Object.entries(usageData).map(([provider, data], index) => (
                  <motion.div 
                    key={provider} 
                    className="flex items-center justify-between p-4 border border-gray-600 rounded-lg bg-gray-800/30 hover:bg-gray-700/30 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="font-medium capitalize text-white">{provider.replace('_', ' ')}</div>
                      <Badge className="bg-blue-900/20 text-blue-300 border-blue-500/30">
                        {data.totalRequests} requests
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">${data.totalCost.toFixed(2)}</div>
                      <div className="text-sm text-gray-400">
                        {data.totalTokens.toLocaleString()} tokens
                      </div>
                    </div>
                  </motion.div>
                ))}
                )}
              </LoadingOverlay>
            </CardContent>
          </Card>

          {/* Top Models */}
          <Card>
            <CardHeader>
              <CardTitle>Top Models by Cost</CardTitle>
              <CardDescription>Most expensive models in the selected time period</CardDescription>
            </CardHeader>
            <CardContent>
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
                    <div key={`${provider}-${model}`} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{model}</div>
                          <div className="text-sm text-gray-600 capitalize">{provider.replace('_', ' ')}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${cost.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">{tokens.toLocaleString()} tokens</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(usageData).map(([provider, data]) => (
              <Card key={provider}>
                <CardHeader>
                  <CardTitle className="capitalize flex items-center justify-between">
                    {provider.replace('_', ' ')}
                    <Badge variant={data.totalCost > 0 ? "default" : "secondary"}>
                      {data.totalCost > 0 ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Usage data for the {selectedPeriod} period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          ${data.totalCost.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">Cost</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {data.totalTokens.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Tokens</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {data.totalRequests}
                        </div>
                        <div className="text-sm text-gray-600">Requests</div>
                      </div>
                    </div>

                    {/* Model Breakdown */}
                    {data.byModel && Object.keys(data.byModel).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Model Breakdown</h4>
                        <div className="space-y-2">
                          {Object.entries(data.byModel)
                            .sort(([,a], [,b]) => b.cost - a.cost)
                            .map(([model, modelData]) => (
                              <div key={model} className="flex justify-between items-center text-sm">
                                <span className="truncate">{model}</span>
                                <span className="font-medium">${modelData.cost.toFixed(2)}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>
                Intelligent recommendations to optimize your AI usage and reduce costs
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                            <h4 className="font-semibold">{insight.title}</h4>
                            <Badge className={getImpactColor(insight.impact)}>
                              {insight.impact} impact
                            </Badge>
                          </div>
                          <p className="text-sm mb-3">{insight.description}</p>
                          {insight.actionItems.length > 0 && (
                            <div>
                              <h5 className="font-medium text-sm mb-1">Recommended Actions:</h5>
                              <ul className="text-sm space-y-1">
                                {insight.actionItems.map((item, itemIndex) => (
                                  <li key={itemIndex} className="flex items-start">
                                    <span className="text-xs mr-2 mt-1">•</span>
                                    {item}
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          {/* Create New Alert */}
          <Card>
            <CardHeader>
              <CardTitle>Create Cost Alert</CardTitle>
              <CardDescription>
                Set up alerts to monitor your AI spending in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Provider</Label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1">
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Claude</option>
                    <option value="google_gemini">Gemini</option>
                    <option value="grok">Grok</option>
                  </select>
                </div>
                <div>
                  <Label>Daily Threshold ($)</Label>
                  <Input 
                    type="number" 
                    placeholder="50.00" 
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button className="w-full">Create Alert</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>
                Manage your cost monitoring alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && alerts.length === 0 ? (
                <ListSkeleton items={3} />
              ) : alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${alert.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <div>
                          <div className="font-medium">{alert.message}</div>
                          <div className="text-sm text-gray-600 capitalize">
                            {alert.provider.replace('_', ' ')} • ${alert.threshold} threshold
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={alert.isActive}
                          onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
                        />
                        <Button variant="ghost" size="sm" className="text-red-600">
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Reports</CardTitle>
              <CardDescription>
                Export detailed usage reports for analysis and compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Export Options</h4>
                    <div className="space-y-2">
                      <Button 
                        onClick={() => exportData('csv')} 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        📊 Export as CSV
                        <span className="ml-auto text-sm text-gray-600">Spreadsheet format</span>
                      </Button>
                      <Button 
                        onClick={() => exportData('json')} 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        🔗 Export as JSON
                        <span className="ml-auto text-sm text-gray-600">API-friendly format</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Report Summary</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Total Records:</span>
                        <span className="font-medium">{totals.requests.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Cost:</span>
                        <span className="font-medium">${totals.cost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Tokens:</span>
                        <span className="font-medium">{totals.tokens.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Providers:</span>
                        <span className="font-medium">{Object.keys(usageData).length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </ErrorBoundary>
  )
}