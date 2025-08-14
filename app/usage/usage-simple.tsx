'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Activity,
  Zap,
  Clock,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getAIProviderLogo } from '@/components/ui/ai-logos'

interface UsageStats {
  totalCost: number
  totalTokens: number
  totalRequests: number
  byProvider: Record<string, any>
  byModel: Record<string, any>
  dailyUsage: Array<any>
  budgetUtilization?: number
  monthlyTrend?: number
  avgCostPerRequest?: number
}

export default function SimpleUsageClient() {
  const { data: session, status } = useSession()
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [isLoading, setIsLoading] = useState(true)
  const [usageData, setUsageData] = useState<UsageStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchUsageData()
    } else if (status === 'unauthenticated') {
      setIsLoading(false)
      setError('Please sign in to view usage analytics')
    }
  }, [status, session, selectedTimeframe])

  const fetchUsageData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const statsResponse = await fetch(
        `/api/usage/stats?timeframe=${selectedTimeframe}`
      )
      
      if (!statsResponse.ok) {
        throw new Error(`Failed to fetch stats: ${statsResponse.status}`)
      }
      
      const data = await statsResponse.json()
      setUsageData({
        totalCost: data.totalCost || 0,
        totalTokens: data.totalTokens || 0,
        totalRequests: data.totalRequests || 0,
        byProvider: data.byProvider || {},
        byModel: data.byModel || {},
        dailyUsage: data.dailyUsage || [],
        budgetUtilization: data.budgetUtilization || 0,
        monthlyTrend: data.monthlyTrend || 0,
        avgCostPerRequest: data.avgCostPerRequest || 0
      })
    } catch (error) {
      console.error('Failed to fetch usage data:', error)
      setError('Failed to load usage data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value)
  }

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toString()
  }

  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Unable to Load Usage Data</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Usage Analytics
                </h1>
                <p className="text-gray-400">
                  Track and optimize your AI API usage across all providers
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger className="w-40 bg-gray-900/50 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  onClick={fetchUsageData}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <div className="h-4 bg-gray-700 rounded animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-700 rounded animate-pulse mb-2" />
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Total Cost</CardTitle>
                    <DollarSign className="w-4 h-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(usageData?.totalCost || 0)}
                    </div>
                    {usageData?.monthlyTrend !== undefined && (
                      <div className={`flex items-center text-sm mt-2 ${
                        usageData.monthlyTrend >= 0 ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {usageData.monthlyTrend >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(usageData.monthlyTrend)}% from last period
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Total Requests</CardTitle>
                    <Activity className="w-4 h-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {formatNumber(usageData?.totalRequests || 0)}
                    </div>
                    {usageData?.avgCostPerRequest !== undefined && (
                      <p className="text-sm text-gray-400 mt-2">
                        {formatCurrency(usageData.avgCostPerRequest)} per request
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Total Tokens</CardTitle>
                    <Zap className="w-4 h-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {formatNumber(usageData?.totalTokens || 0)}
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      Across all providers
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Provider Breakdown */}
              {usageData?.byProvider && Object.keys(usageData.byProvider).length > 0 && (
                <Card className="bg-gray-900/50 border-gray-700 mb-8">
                  <CardHeader>
                    <CardTitle className="text-white">Usage by Provider</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(usageData.byProvider).map(([provider, data]: [string, any]) => (
                        <div key={provider} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getAIProviderLogo(provider, 'w-6 h-6')}
                            <span className="text-white font-medium capitalize">{provider}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold">{formatCurrency(data.cost || 0)}</div>
                            <div className="text-gray-400 text-sm">{formatNumber(data.requests || 0)} requests</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Daily Usage Trend - Text only, no chart */}
              {usageData?.dailyUsage && usageData.dailyUsage.length > 0 && (
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Daily Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {usageData.dailyUsage.slice(0, 7).map((day: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                          <span className="text-gray-400 text-sm">
                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-white font-medium">{formatCurrency(day.cost)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}