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
  Filter,
  ChevronRight,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Brain,
  Globe,
  Shield,
  Star,
  Award,
  Target,
  Layers,
  Box,
  Plus,
  ArrowRight,
  ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getAIProviderLogo } from '@/components/ui/ai-logos'
import { toast } from '@/components/ui/use-toast'

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

export default function FullUsageClient() {
  const { data: session, status } = useSession()
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [selectedProvider, setSelectedProvider] = useState('all')
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [usageData, setUsageData] = useState<UsageStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchUsageData()
    } else if (status === 'unauthenticated') {
      setIsLoading(false)
      setError('Please sign in to view usage analytics')
    }
  }, [status, session, selectedTimeframe, selectedProvider])

  const fetchUsageData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch usage stats
      const statsResponse = await fetch(
        `/api/usage/stats?timeframe=${selectedTimeframe}${
          selectedProvider !== 'all' ? `&provider=${selectedProvider}` : ''
        }`
      )
      
      if (!statsResponse.ok) {
        throw new Error(`Failed to fetch stats: ${statsResponse.status}`)
      }
      
      const data = await statsResponse.json()
      
      // Check if we have any data
      const hasAnyData = data.totalRequests > 0 || Object.keys(data.byProvider || {}).length > 0
      setHasData(hasAnyData)
      
      setUsageData({
        totalCost: data.totalCost || 0,
        totalTokens: data.totalTokens || 0,
        totalRequests: data.totalRequests || 0,
        byProvider: data.byProvider || {},
        byModel: data.byModel || {},
        dailyUsage: data.dailyUsage || [],
        budgetUtilization: data.budgetUtilization || 0,
        monthlyTrend: data.monthlyTrend || 0,
        avgCostPerRequest: data.totalRequests > 0 ? (data.totalCost / data.totalRequests) : 0
      })

      // Fetch recent activity
      try {
        const recentResponse = await fetch('/api/usage/recent?limit=10')
        if (recentResponse.ok) {
          const recent = await recentResponse.json()
          setRecentActivity(Array.isArray(recent) ? recent : [])
        }
      } catch (err) {
        console.error('Failed to fetch recent activity:', err)
      }
    } catch (error) {
      console.error('Failed to fetch usage data:', error)
      setError('Failed to load usage data. Please try again.')
      setHasData(false)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(value)
  }

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toString()
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: new Date(date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  // Calculate provider percentages
  const providerPercentages = usageData?.byProvider 
    ? Object.entries(usageData.byProvider).map(([provider, data]: [string, any]) => ({
        provider,
        percentage: usageData.totalCost > 0 ? (data.cost / usageData.totalCost) * 100 : 0,
        ...data
      })).sort((a, b) => b.percentage - a.percentage)
    : []

  // Get top models
  const topModels = usageData?.byModel 
    ? Object.entries(usageData.byModel)
        .map(([key, data]: [string, any]) => data)
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 5)
    : []

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
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
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
                
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger className="w-40 bg-gray-900/50 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="all">All Providers</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="cohere">Cohere</SelectItem>
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

          {/* No Data State */}
          {!isLoading && !hasData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="max-w-2xl mx-auto">
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-12">
                  <Box className="w-16 h-16 text-gray-500 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-4">
                    No Usage Data Yet
                  </h2>
                  <p className="text-gray-400 mb-8">
                    Start using AI providers to see your usage analytics here. 
                    Connect your API keys and make your first requests to begin tracking.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={() => window.location.href = '/settings/api-keys'}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add API Keys
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = '/aioptimise'}
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Try AI Chat
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Main Content - Only show if we have data */}
          {(hasData || isLoading) && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Total Cost</CardTitle>
                      <DollarSign className="w-4 h-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="h-8 bg-gray-700 rounded animate-pulse mb-2" />
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-white">
                            {formatCurrency(usageData?.totalCost || 0)}
                          </div>
                          {usageData?.monthlyTrend !== undefined && usageData.monthlyTrend !== 0 && (
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
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Total Requests</CardTitle>
                      <Activity className="w-4 h-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="h-8 bg-gray-700 rounded animate-pulse mb-2" />
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-white">
                            {formatNumber(usageData?.totalRequests || 0)}
                          </div>
                          {usageData?.avgCostPerRequest !== undefined && usageData.avgCostPerRequest > 0 && (
                            <p className="text-sm text-gray-400 mt-2">
                              {formatCurrency(usageData.avgCostPerRequest)} per request
                            </p>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Total Tokens</CardTitle>
                      <Zap className="w-4 h-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="h-8 bg-gray-700 rounded animate-pulse mb-2" />
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-white">
                            {formatNumber(usageData?.totalTokens || 0)}
                          </div>
                          <p className="text-sm text-gray-400 mt-2">
                            Across all providers
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Active Providers</CardTitle>
                      <Globe className="w-4 h-4 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="h-8 bg-gray-700 rounded animate-pulse mb-2" />
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-white">
                            {Object.keys(usageData?.byProvider || {}).length}
                          </div>
                          <p className="text-sm text-gray-400 mt-2">
                            AI providers used
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-gray-900/50 border border-gray-700">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="providers" 
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Providers
                  </TabsTrigger>
                  <TabsTrigger 
                    value="models" 
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Models
                  </TabsTrigger>
                  <TabsTrigger 
                    value="activity" 
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Activity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Provider Distribution */}
                  <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Provider Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 bg-gray-700 rounded animate-pulse" />
                          ))}
                        </div>
                      ) : providerPercentages.length > 0 ? (
                        <div className="space-y-4">
                          {providerPercentages.map((provider) => (
                            <div key={provider.provider} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  {getAIProviderLogo(provider.provider, 'w-5 h-5')}
                                  <span className="text-white font-medium capitalize">
                                    {provider.provider.replace('_', ' ')}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="text-white font-semibold">
                                    {formatCurrency(provider.cost)}
                                  </div>
                                  <div className="text-gray-500 text-sm">
                                    {provider.percentage.toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                              <Progress 
                                value={provider.percentage} 
                                className="h-2 bg-gray-800"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No provider data available</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Daily Usage Trend */}
                  <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Daily Usage Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="h-64 bg-gray-700 rounded animate-pulse" />
                      ) : usageData?.dailyUsage && usageData.dailyUsage.length > 0 ? (
                        <div className="space-y-2">
                          {usageData.dailyUsage.slice(-7).map((day) => (
                            <div key={day.date} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                              <span className="text-gray-400">
                                {formatDate(day.date)}
                              </span>
                              <div className="flex items-center gap-4">
                                <Badge variant="outline" className="border-gray-700">
                                  {day.requests} requests
                                </Badge>
                                <span className="text-white font-medium">
                                  {formatCurrency(day.cost)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No daily usage data available</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="providers" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {isLoading ? (
                      [1, 2, 3, 4].map(i => (
                        <Card key={i} className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                          <CardContent className="p-6">
                            <div className="h-32 bg-gray-700 rounded animate-pulse" />
                          </CardContent>
                        </Card>
                      ))
                    ) : Object.entries(usageData?.byProvider || {}).length > 0 ? (
                      Object.entries(usageData.byProvider).map(([provider, data]: [string, any]) => (
                        <Card key={provider} className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {getAIProviderLogo(provider, 'w-6 h-6')}
                                <CardTitle className="text-white capitalize">
                                  {provider.replace('_', ' ')}
                                </CardTitle>
                              </div>
                              <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                                Active
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <div className="text-2xl font-bold text-white">
                                  {formatCurrency(data.cost)}
                                </div>
                                <div className="text-sm text-gray-500">Cost</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-white">
                                  {formatNumber(data.tokens)}
                                </div>
                                <div className="text-sm text-gray-500">Tokens</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-white">
                                  {data.requests}
                                </div>
                                <div className="text-sm text-gray-500">Requests</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700 col-span-2">
                        <CardContent className="p-12 text-center">
                          <Globe className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                          <p className="text-gray-500">No provider usage data available</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="models" className="space-y-6">
                  <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Top Models by Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-3">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 bg-gray-700 rounded animate-pulse" />
                          ))}
                        </div>
                      ) : topModels.length > 0 ? (
                        <div className="space-y-3">
                          {topModels.map((model, index) => (
                            <div 
                              key={`${model.provider}-${model.model}`}
                              className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-800/70 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center text-sm font-bold text-purple-400">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-medium text-white">{model.model}</div>
                                  <div className="text-sm text-gray-500 capitalize">
                                    {model.provider.replace('_', ' ')}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-white">
                                  {formatCurrency(model.cost)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatNumber(model.tokens)} tokens • {model.requests} requests
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No model usage data available</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                  <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-20 bg-gray-700 rounded animate-pulse" />
                          ))}
                        </div>
                      ) : recentActivity.length > 0 ? (
                        <div className="space-y-4">
                          {recentActivity.map((activity, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-800/70 transition-all"
                            >
                              <div className="flex items-center gap-4">
                                {getAIProviderLogo(activity.provider, 'w-6 h-6')}
                                <div>
                                  <div className="text-white font-medium">{activity.model}</div>
                                  <div className="text-gray-500 text-sm">
                                    {new Date(activity.timestamp).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-white font-semibold">
                                  {formatCurrency(activity.cost)}
                                </div>
                                <div className="text-gray-500 text-sm">
                                  {formatNumber(activity.tokens)} tokens
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No recent activity</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  )
}