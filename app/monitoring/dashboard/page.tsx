'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
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
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization': return '⚡'
      case 'cost_saving': return '💰'
      case 'usage_pattern': return '📊'
      case 'warning': return '⚠️'
      default: return '📈'
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
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Usage Monitoring Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring of AI provider usage, costs, and insights
          </p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${realTimeEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span>{realTimeEnabled ? 'Live' : 'Paused'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Time Period Selector */}
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
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
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
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
            <Label>Real-time</Label>
          </div>

          {/* Export Buttons */}
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportData('csv')}
            >
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportData('json')}
            >
              Export JSON
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              ${totals.cost.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Across {Object.keys(usageData).length} providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {totals.tokens.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {totals.requests.toLocaleString()} requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {alerts.filter(a => a.isActive).length}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {alerts.length} total alerts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="export">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Provider Usage Charts */}
          <Card>
            <CardHeader>
              <CardTitle>Usage by Provider</CardTitle>
              <CardDescription>Cost and token distribution across AI providers</CardDescription>
            </CardHeader>
            <CardContent>
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
                  <div className="space-y-4">
                    {Object.entries(usageData).map(([provider, data]) => (
                      <div key={provider} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="font-medium capitalize">{provider.replace('_', ' ')}</div>
                          <Badge variant="secondary">
                            {data.totalRequests} requests
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${data.totalCost.toFixed(2)}</div>
                          <div className="text-sm text-gray-600">
                            {data.totalTokens.toLocaleString()} tokens
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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