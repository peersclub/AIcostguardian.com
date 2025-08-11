'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Activity, DollarSign, Zap, TrendingUp, Calendar } from 'lucide-react'

interface UsageData {
  usage: any[]
  summary: {
    totalRequests: number
    totalTokens: number
    totalCost: number
    averageLatency: number
    byProvider: Record<string, any>
    byModel: Record<string, any>
    byDay: Record<string, any>
  }
  totalRecords: number
}

export default function UsageDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<UsageData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState('30')
  const [provider, setProvider] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  const fetchUsageData = async () => {
    try {
      setRefreshing(true)
      const params = new URLSearchParams({
        days,
        ...(provider !== 'all' && { provider })
      })
      
      const response = await fetch(`/api/usage?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch usage data')
      }
      
      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      console.error('Error fetching usage data:', err)
      setError('Failed to load usage data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchUsageData()
  }, [days, provider])

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(cost)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-800">{error}</p>
          <Button onClick={fetchUsageData} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  const { summary } = data

  // Get top providers
  const topProviders = Object.entries(summary.byProvider)
    .sort((a, b) => b[1].cost - a[1].cost)
    .slice(0, 5)

  // Get top models
  const topModels = Object.entries(summary.byModel)
    .sort((a, b) => b[1].requests - a[1].requests)
    .slice(0, 5)

  // Get daily trend data (last 7 days)
  const dailyTrend = Object.entries(summary.byDay)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-7)

  return (
    <div className="space-y-6 text-foreground">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All providers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All providers</SelectItem>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="claude">Claude</SelectItem>
            <SelectItem value="gemini">Gemini</SelectItem>
            <SelectItem value="perplexity">Perplexity</SelectItem>
            <SelectItem value="grok">Grok</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          onClick={fetchUsageData} 
          disabled={refreshing}
          variant="outline"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">
              Total Requests
            </CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatNumber(summary.totalRequests)}</div>
            <p className="text-xs text-gray-400">
              {data.totalRecords} total records
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">
              Total Cost
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCost(summary.totalCost)}</div>
            <p className="text-xs text-gray-400">
              Last {days} days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">
              Total Tokens
            </CardTitle>
            <Zap className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatNumber(summary.totalTokens)}</div>
            <p className="text-xs text-gray-400">
              Input + Output tokens
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">
              Avg Latency
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{summary.averageLatency}ms</div>
            <p className="text-xs text-gray-400">
              Response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Provider Breakdown */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-200">
            <BarChart className="h-5 w-5" />
            Top Providers by Cost
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProviders.map(([provider, stats]) => {
              const percentage = (stats.cost / summary.totalCost) * 100
              return (
                <div key={provider} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{provider}</span>
                      <span className="text-sm text-muted-foreground">
                        ({stats.requests} requests)
                      </span>
                    </div>
                    <span className="font-medium">{formatCost(stats.cost)}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Model Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Top Models by Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topModels.map(([model, stats]) => (
              <div key={model} className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{model}</span>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(stats.tokens)} tokens
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{stats.requests} requests</p>
                  <p className="text-sm text-muted-foreground">{formatCost(stats.cost)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Usage Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailyTrend.map(([date, stats]) => {
              const maxCost = Math.max(...dailyTrend.map(([_, s]) => s.cost))
              const percentage = (stats.cost / maxCost) * 100
              
              return (
                <div key={date} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{new Date(date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        {stats.requests} requests
                      </span>
                      <span className="font-medium">{formatCost(stats.cost)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent API Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Time</th>
                  <th className="text-left py-2">Provider</th>
                  <th className="text-left py-2">Model</th>
                  <th className="text-right py-2">Tokens</th>
                  <th className="text-right py-2">Cost</th>
                  <th className="text-right py-2">Latency</th>
                </tr>
              </thead>
              <tbody>
                {data.usage.slice(0, 10).map((usage) => (
                  <tr key={usage.id} className="border-b">
                    <td className="py-2">
                      {new Date(usage.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-2 capitalize">{usage.provider}</td>
                    <td className="py-2">{usage.model}</td>
                    <td className="py-2 text-right">{formatNumber(usage.totalTokens)}</td>
                    <td className="py-2 text-right">{formatCost(usage.cost)}</td>
                    <td className="py-2 text-right">{usage.latency}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}