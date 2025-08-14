'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
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
  Database,
  Settings,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { getAIProviderLogo } from '@/components/ui/ai-logos'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts'
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

export default function UsageClient() {
  const { data: session } = useSession()
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [selectedProvider, setSelectedProvider] = useState('all')
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [usageData, setUsageData] = useState<UsageStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    if (session?.user) {
      fetchUsageData()
    }
  }, [session, selectedTimeframe, selectedProvider])

  const fetchUsageData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch usage stats
      const statsResponse = await fetch(
        `/api/usage/stats?timeframe=${selectedTimeframe}${
          selectedProvider !== 'all' ? `&provider=${selectedProvider}` : ''
        }`
      )
      
      if (statsResponse.ok) {
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
      }

      // Fetch recent activity
      const recentResponse = await fetch('/api/usage/recent?limit=10')
      if (recentResponse.ok) {
        const recent = await recentResponse.json()
        setRecentActivity(Array.isArray(recent) ? recent : [])
      }
    } catch (error) {
      console.error('Failed to fetch usage data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load usage data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toString()
  }

  // Calculate provider data for charts
  const providerChartData = usageData ? Object.entries(usageData.byProvider).map(([provider, data]: [string, any]) => ({
    name: provider,
    cost: data.cost || 0,
    requests: data.requests || 0,
    tokens: data.tokens || 0
  })) : []

  // Calculate daily trend data
  const trendData = usageData?.dailyUsage?.map((day: any) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    cost: day.cost,
    requests: day.requests,
    tokens: day.tokens / 1000 // Convert to K tokens
  })) || []

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

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
                    <SelectItem value="claude">Claude</SelectItem>
                    <SelectItem value="gemini">Gemini</SelectItem>
                    <SelectItem value="grok">Grok</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={fetchUsageData}
                  variant="outline"
                  className="bg-gray-900/50 border-gray-700 text-white hover:bg-gray-800"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>

                <Button
                  variant="outline"
                  className="bg-gray-900/50 border-gray-700 text-white hover:bg-gray-800"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-2xl border border-blue-500/30 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-400" />
                  </div>
                  {usageData?.monthlyTrend !== undefined && (
                    <div className={`flex items-center gap-1 text-sm ${
                      usageData.monthlyTrend >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {usageData.monthlyTrend >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {Math.abs(usageData.monthlyTrend)}%
                    </div>
                  )}
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {formatCurrency(usageData?.totalCost || 0)}
                </div>
                <div className="text-gray-400 text-sm">Total Spend</div>
                {usageData?.budgetUtilization !== undefined && (
                  <div className="mt-3">
                    <Progress 
                      value={usageData.budgetUtilization} 
                      className="h-2 bg-gray-700"
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      {usageData.budgetUtilization}% of budget
                    </div>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-2xl border border-purple-500/30 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Activity className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {formatNumber(usageData?.totalRequests || 0)}
                </div>
                <div className="text-gray-400 text-sm">API Calls</div>
                {usageData?.avgCostPerRequest !== undefined && (
                  <div className="text-xs text-gray-500 mt-2">
                    {formatCurrency(usageData.avgCostPerRequest)} avg/call
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-2xl border border-green-500/30 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Zap className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {formatNumber(usageData?.totalTokens || 0)}
                </div>
                <div className="text-gray-400 text-sm">Tokens Used</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-orange-900/30 to-orange-800/30 rounded-2xl border border-orange-500/30 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <Globe className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {Object.keys(usageData?.byProvider || {}).length}
                </div>
                <div className="text-gray-400 text-sm">Active Providers</div>
              </motion.div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-gray-900/50 border border-gray-700 p-1">
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
                  value="trends" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trends
                </TabsTrigger>
                <TabsTrigger 
                  value="activity" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Cost Trend Chart */}
                  <Card className="bg-gray-900/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        Usage Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={trendData}>
                          <defs>
                            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="date" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                            labelStyle={{ color: '#9ca3af' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="cost" 
                            stroke="#3b82f6" 
                            fillOpacity={1} 
                            fill="url(#colorCost)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Provider Distribution */}
                  <Card className="bg-gray-900/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-400" />
                        Provider Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RePieChart>
                          <Pie
                            data={providerChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: ${formatCurrency(entry.cost)}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="cost"
                          >
                            {providerChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RePieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="providers" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(usageData?.byProvider || {}).map(([provider, data]: [string, any]) => (
                    <motion.div
                      key={provider}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-900/50 rounded-xl border border-gray-700 p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getAIProviderLogo(provider, 'w-8 h-8')}
                          <h3 className="text-lg font-semibold text-white capitalize">
                            {provider}
                          </h3>
                        </div>
                        <Badge variant="outline" className="text-green-400 border-green-400/30">
                          Active
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Cost</span>
                          <span className="text-white font-semibold">
                            {formatCurrency(data.cost || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Requests</span>
                          <span className="text-white font-semibold">
                            {formatNumber(data.requests || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Tokens</span>
                          <span className="text-white font-semibold">
                            {formatNumber(data.tokens || 0)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Avg Cost/Request</span>
                          <span className="text-white">
                            {formatCurrency((data.cost || 0) / (data.requests || 1))}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="trends" className="mt-6">
                <div className="grid grid-cols-1 gap-6">
                  <Card className="bg-gray-900/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Multi-Metric Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="date" stroke="#9ca3af" />
                          <YAxis yAxisId="left" stroke="#9ca3af" />
                          <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                            labelStyle={{ color: '#9ca3af' }}
                          />
                          <Legend />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="cost" 
                            stroke="#3b82f6" 
                            name="Cost ($)"
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="requests" 
                            stroke="#8b5cf6" 
                            name="Requests"
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="tokens" 
                            stroke="#10b981" 
                            name="Tokens (K)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="mt-6">
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700"
                        >
                          <div className="flex items-center gap-4">
                            {getAIProviderLogo(activity.provider, 'w-6 h-6')}
                            <div>
                              <div className="text-white font-medium">{activity.model}</div>
                              <div className="text-gray-400 text-sm">
                                {new Date(activity.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold">
                              {formatCurrency(activity.cost)}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {formatNumber(activity.tokens)} tokens
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  )
}