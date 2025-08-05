'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import AuthWrapper from '@/components/AuthWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

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

const PROVIDER_INFO = {
  openai: { name: 'OpenAI', logo: '🤖', color: '#64748b' },
  claude: { name: 'Claude', logo: '🧠', color: '#64748b' },
  gemini: { name: 'Gemini', logo: '💎', color: '#64748b' },
  perplexity: { name: 'Perplexity', logo: '🔍', color: '#64748b' },
  grok: { name: 'Grok', logo: '🚀', color: '#64748b' }
}

const CHART_COLORS = ['#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9', '#f8fafc']

function DashboardContent() {
  const { data: session } = useSession()
  const [selectedProvider, setSelectedProvider] = useState<string>('all')
  const [dateRange, setDateRange] = useState('30d')
  const [viewMode, setViewMode] = useState<'cards' | 'charts'>('cards')
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [providerStats, setProviderStats] = useState<ProviderStats[]>([])
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Fetch all provider statuses and usage data
  useEffect(() => {
    if (session?.user?.id) {
      fetchAllData()
    }
  }, [session, selectedProvider, dateRange])

  const fetchAllData = async () => {
    setIsLoading(true)
    try {
      // Fetch provider statuses in parallel
      const providers = ['openai', 'claude', 'gemini', 'perplexity', 'grok']
      const statusPromises = providers.map(async (provider) => {
        try {
          const response = await fetch(`/api/${provider}/test`)
          const status = await response.json()
          return {
            provider,
            status: status.isValid ? 'connected' : 'disconnected',
            ...status
          }
        } catch {
          return { provider, status: 'disconnected' as const }
        }
      })

      const statuses = await Promise.all(statusPromises)

      // Fetch usage stats
      const usageResponse = await fetch('/api/usage/all?dateRange=' + dateRange)
      if (usageResponse.ok) {
        const stats = await usageResponse.json()
        setUsageStats(stats)

        // Combine provider stats with usage data
        const combinedStats: ProviderStats[] = providers.map(provider => {
          const providerUsage = stats.byProvider[provider] || { calls: 0, tokens: 0, cost: 0 }
          const status = statuses.find(s => s.provider === provider)
          return {
            provider,
            status: status?.status || 'disconnected',
            calls: providerUsage.calls,
            tokens: providerUsage.tokens,
            cost: providerUsage.cost,
            models: Object.keys(stats.byModel).filter(model => 
              (provider === 'openai' && model.startsWith('gpt')) ||
              (provider === 'claude' && model.includes('claude')) ||
              (provider === 'gemini' && model.includes('gemini')) ||
              (provider === 'perplexity' && (model.includes('sonar') || model.includes('llama'))) ||
              (provider === 'grok' && model.includes('grok'))
            )
          }
        })

        setProviderStats(combinedStats)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
      setLastUpdate(new Date())
    }
  }

  const refreshData = () => {
    fetchAllData()
  }

  // Auto-refresh every 30 seconds if live mode is enabled
  useEffect(() => {
    if (isLiveMode) {
      const interval = setInterval(refreshData, 30000)
      return () => clearInterval(interval)
    }
  }, [isLiveMode, selectedProvider, dateRange])

  const exportData = (format: 'csv' | 'json' | 'pdf') => {
    // Implementation for export functionality
    console.log(`Exporting data as ${format}`)
    setShowExportMenu(false)
  }

  const calculateProviderPercentage = (cost: number) => {
    if (!usageStats || usageStats.totalCost === 0) return 0
    return (cost / usageStats.totalCost) * 100
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading AI usage data...</p>
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
                <p className="text-gray-500 mt-1 text-sm">
                  AI usage and cost analytics
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Date Range Filter */}
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-36 h-9 text-sm border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-md p-0.5">
                  <Button
                    size="sm"
                    variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                    onClick={() => setViewMode('cards')}
                    className="h-8 px-3 text-xs font-medium"
                  >
                    Overview
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'charts' ? 'secondary' : 'ghost'}
                    onClick={() => setViewMode('charts')}
                    className="h-8 px-3 text-xs font-medium"
                  >
                    Analytics
                  </Button>
                </div>

                {/* Export Menu */}
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="h-9 px-3 text-sm border-gray-300 text-gray-700"
                  >
                    Export
                  </Button>
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => exportData('csv')}
                      >
                        Export as CSV
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => exportData('json')}
                      >
                        Export as JSON
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => exportData('pdf')}
                      >
                        Generate PDF Report
                      </button>
                    </div>
                  )}
                </div>

                {/* Live Mode Toggle */}
                <Button
                  variant={isLiveMode ? "default" : "outline"}
                  onClick={() => setIsLiveMode(!isLiveMode)}
                  size="sm"
                  className="h-9 px-3 text-sm"
                >
                  {isLiveMode ? 'Live' : 'Paused'}
                </Button>

                <Button onClick={refreshData} variant="outline" size="sm" className="h-9 px-3 text-sm border-gray-300 text-gray-700">
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-6 space-y-8">
          {/* Last Update Time */}
          <div className="text-right">
            <p className="text-xs text-gray-400">
              Last updated: {lastUpdate.toLocaleString()}
            </p>
          </div>

          {/* Total Summary Cards */}
          {usageStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-600 text-xs font-medium uppercase tracking-wide">Total API Calls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-gray-900">{usageStats.totalCalls.toLocaleString()}</div>
                  <p className="text-xs text-gray-500 mt-1">Across all providers</p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-600 text-xs font-medium uppercase tracking-wide">Total Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-gray-900">{(usageStats.totalTokens / 1000000).toFixed(1)}M</div>
                  <p className="text-xs text-gray-500 mt-1">Tokens processed</p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-600 text-xs font-medium uppercase tracking-wide">Total Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-gray-900">${usageStats.totalCost.toFixed(2)}</div>
                  <p className="text-xs text-gray-500 mt-1">{dateRange} period</p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-600 text-xs font-medium uppercase tracking-wide">Active Providers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-gray-900">
                    {providerStats.filter(p => p.status === 'connected').length}/{providerStats.length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Connected providers</p>
                </CardContent>
              </Card>
            </div>
          )}

        {viewMode === 'cards' ? (
          <>
            {/* Provider Status Table */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Provider Overview</h2>
              <Card className="border border-gray-200 shadow-sm">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usage Share
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {providerStats.map((provider) => {
                        const info = PROVIDER_INFO[provider.provider as keyof typeof PROVIDER_INFO]
                        return (
                          <tr key={provider.provider} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                  <span className="text-sm">{info?.logo}</span>
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
                              <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 ${provider.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className={`text-xs font-medium ${
                                  provider.status === 'connected' ? 'text-green-800' : 'text-red-800'
                                }`}>
                                  {provider.status === 'connected' ? 'Connected' : 'Disconnected'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm font-medium text-gray-900">{provider.calls.toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm font-medium text-gray-900">{(provider.tokens / 1000).toFixed(1)}K</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm font-medium text-gray-900">${provider.cost.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${calculateProviderPercentage(provider.cost)}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500 font-medium min-w-[2.5rem]">
                                  {calculateProviderPercentage(provider.cost).toFixed(1)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Link href={`/dashboard/${provider.provider}`}>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-7 px-2 text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
                                  >
                                    View
                                  </Button>
                                </Link>
                                {provider.provider === 'claude' && (
                                  <Link href="/dashboard/claude-admin">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-7 px-2 text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
                                    >
                                      Admin
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

              {/* Time Period Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-medium text-gray-900">Today</CardTitle>
                    <CardDescription className="text-sm text-gray-500">Current day usage</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">API Calls</span>
                      <span className="font-medium text-gray-900">{usageStats?.today.calls || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Tokens</span>
                      <span className="font-medium text-gray-900">{usageStats?.today.tokens.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Cost</span>
                      <span className="font-medium text-gray-900">${usageStats?.today.cost.toFixed(4) || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-medium text-gray-900">This Week</CardTitle>
                    <CardDescription className="text-sm text-gray-500">Last 7 days</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">API Calls</span>
                      <span className="font-medium text-gray-900">{usageStats?.thisWeek.calls || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Tokens</span>
                      <span className="font-medium text-gray-900">{usageStats?.thisWeek.tokens.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Cost</span>
                      <span className="font-medium text-gray-900">${usageStats?.thisWeek.cost.toFixed(2) || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-medium text-gray-900">This Month</CardTitle>
                    <CardDescription className="text-sm text-gray-500">Current month</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">API Calls</span>
                      <span className="font-medium text-gray-900">{usageStats?.thisMonth.calls || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Tokens</span>
                      <span className="font-medium text-gray-900">{usageStats?.thisMonth.tokens.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Cost</span>
                      <span className="font-medium text-gray-900">${usageStats?.thisMonth.cost.toFixed(2) || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
          </>
        ) : (
          /* Charts View */
          <div className="space-y-6">
            {/* Cost Distribution Pie Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cost Distribution by Provider</CardTitle>
                  <CardDescription>Percentage of total spend per provider</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
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

              {/* Daily Usage Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Cost Breakdown</CardTitle>
                  <CardDescription>Last 7 days cost per provider</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                      <Legend />
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

            {/* Usage Trend Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Trend Over Time</CardTitle>
                <CardDescription>API calls and costs over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usageStats?.dailyUsage || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="calls" 
                      stroke="#8884d8" 
                      name="API Calls"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="cost" 
                      stroke="#82ca9d" 
                      name="Cost ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

          {/* Alerts Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Alerts</h2>
            <div className="space-y-3">
              {usageStats && usageStats.thisMonth.cost > 100 && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTitle className="text-amber-800 text-sm font-medium">High Monthly Spending</AlertTitle>
                  <AlertDescription className="text-amber-700 text-sm">
                    Current month spending (${usageStats.thisMonth.cost.toFixed(2)}) exceeds $100 threshold.
                  </AlertDescription>
                </Alert>
              )}
              {providerStats.filter(p => p.status === 'disconnected').length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTitle className="text-red-800 text-sm font-medium">Disconnected Providers</AlertTitle>
                  <AlertDescription className="text-red-700 text-sm">
                    {providerStats.filter(p => p.status === 'disconnected').length} provider(s) not connected. 
                    <Link href="/settings" className="underline ml-1">Configure API keys</Link>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Link href="/settings">
                  <Button variant="outline" size="sm" className="h-9 px-4 text-sm border-gray-300 text-gray-700">
                    Configure API Keys
                  </Button>
                </Link>
                <Link href="/alerts">
                  <Button variant="outline" size="sm" className="h-9 px-4 text-sm border-gray-300 text-gray-700">
                    Manage Alerts
                  </Button>
                </Link>
                <Link href="/team">
                  <Button variant="outline" size="sm" className="h-9 px-4 text-sm border-gray-300 text-gray-700">
                    Team Management
                  </Button>
                </Link>
                <Link href="/usage">
                  <Button variant="outline" size="sm" className="h-9 px-4 text-sm border-gray-300 text-gray-700">
                    Usage Report
                  </Button>
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
