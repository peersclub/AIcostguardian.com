'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  BarChart3,
  Activity,
  Settings,
  Filter,
  Calendar,
  Download,
  RefreshCw,
  Bell,
  ChevronRight,
  Clock,
  Shield,
  Brain
} from 'lucide-react'
import { getAIProviderLogo } from '@/components/ui/ai-logos'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter, useSearchParams } from 'next/navigation'

export default function MonitoringDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')
  const [selectedView, setSelectedView] = useState(searchParams.get('tab') || 'overview')
  const [isLoading, setIsLoading] = useState(true)
  const [monitoringData, setMonitoringData] = useState<any>(null)
  const [realTimeEnabled, setRealTimeEnabled] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Handle URL-based tab navigation
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['overview', 'alerts', 'performance', 'insights'].includes(tab)) {
      setSelectedView(tab)
    }
  }, [searchParams])

  // Fetch monitoring data
  useEffect(() => {
    if (session) {
      fetchMonitoringData()
    }
  }, [session, selectedTimeframe])

  // Real-time updates
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (realTimeEnabled && session) {
      interval = setInterval(() => {
        fetchMonitoringData()
      }, 5000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [realTimeEnabled, session, selectedTimeframe])

  const fetchMonitoringData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch all monitoring data
      const [metricsRes, alertsRes, insightsRes] = await Promise.all([
        fetch(`/api/monitoring/metrics?timeframe=${selectedTimeframe}`),
        fetch('/api/monitoring/alerts?active=true'),
        fetch(`/api/monitoring/insights?timeframe=${selectedTimeframe}`)
      ])

      const metrics = metricsRes.ok ? await metricsRes.json() : {}
      const alerts = alertsRes.ok ? await alertsRes.json() : []
      const insights = insightsRes.ok ? await insightsRes.json() : []

      setMonitoringData({
        metrics,
        alerts,
        insights
      })
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (value: string) => {
    setSelectedView(value)
    router.push(`/monitoring/dashboard?tab=${value}`)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-4">Please sign in to access the monitoring dashboard</p>
          <Button 
            onClick={() => router.push('/auth/signin')}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  // Default data structure
  const metrics = monitoringData?.metrics || {
    currentLoad: 0,
    avgResponseTime: 0,
    errorRate: 0,
    uptime: 99.9,
    activeAlerts: 0,
    totalRequests: 0,
    totalCost: 0,
    costTrend: 0
  }

  const alerts = monitoringData?.alerts || []
  const insights = monitoringData?.insights || []

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background gradient - EXACTLY like main dashboard */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header - EXACTLY like main dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Real-Time Monitoring
                </h1>
                <p className="text-gray-400">
                  Live system metrics and performance monitoring
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Real-time toggle */}
                <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-4 py-2 border border-gray-700">
                  <span className="text-gray-400 text-sm">Real-time</span>
                  <Switch
                    checked={realTimeEnabled}
                    onCheckedChange={setRealTimeEnabled}
                    className="data-[state=checked]:bg-green-600"
                  />
                  {realTimeEnabled && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>

                {/* Timeframe selector */}
                <div className="flex bg-gray-900/50 rounded-lg p-1 border border-gray-700">
                  {['1h', '6h', '24h', '7d', '30d'].map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => setSelectedTimeframe(timeframe)}
                      className={`px-3 py-1 rounded transition-colors ${
                        selectedTimeframe === timeframe
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {timeframe}
                    </button>
                  ))}
                </div>

                {/* Action buttons */}
                <Button
                  onClick={() => fetchMonitoringData()}
                  variant="outline"
                  className="bg-gray-900/50 border-gray-700 text-white hover:bg-gray-800"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Last updated */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </motion.div>

          {/* Key Metrics Cards - EXACTLY like main dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-green-900/50 to-emerald-800/50 backdrop-blur-xl rounded-2xl border border-green-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-400 text-sm font-medium">System Load</p>
                      <p className="text-3xl font-bold text-white mt-2">
                        {metrics.currentLoad.toFixed(1)}%
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        {metrics.currentLoad > 80 ? (
                          <TrendingUp className="w-4 h-4 text-red-400" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                        <span className="text-sm text-gray-400">
                          {metrics.currentLoad > 80 ? 'High load' : 'Normal'}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-xl">
                      <Activity className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-800/50 backdrop-blur-xl rounded-2xl border border-blue-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-400 text-sm font-medium">Response Time</p>
                      <p className="text-3xl font-bold text-white mt-2">
                        {metrics.avgResponseTime}ms
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        {metrics.avgResponseTime < 200 ? (
                          <Zap className="w-4 h-4 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        )}
                        <span className="text-sm text-gray-400">
                          {metrics.avgResponseTime < 200 ? 'Fast' : 'Slow'}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <Clock className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-purple-900/50 to-pink-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-400 text-sm font-medium">Error Rate</p>
                      <p className="text-3xl font-bold text-white mt-2">
                        {metrics.errorRate.toFixed(2)}%
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        {metrics.errorRate < 1 ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-sm text-gray-400">
                          {metrics.errorRate < 1 ? 'Healthy' : 'Issues detected'}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <AlertTriangle className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-orange-900/50 to-red-800/50 backdrop-blur-xl rounded-2xl border border-orange-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-400 text-sm font-medium">Uptime</p>
                      <p className="text-3xl font-bold text-white mt-2">
                        {metrics.uptime.toFixed(2)}%
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-400">
                          Last 30 days
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-orange-500/20 rounded-xl">
                      <Shield className="w-6 h-6 text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Tabs - EXACTLY like main dashboard */}
          <Tabs 
            value={selectedView} 
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="bg-gray-900/50 border border-gray-700 p-1 mb-6">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="alerts" 
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                <Bell className="w-4 h-4 mr-2" />
                Alerts ({alerts.filter((a: any) => a.isActive).length})
              </TabsTrigger>
              <TabsTrigger 
                value="performance" 
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger 
                value="insights" 
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                <Brain className="w-4 h-4 mr-2" />
                Insights
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Provider Status */}
                <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Provider Status</CardTitle>
                    <CardDescription className="text-gray-400">
                      Real-time provider health and performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {['openai', 'anthropic', 'gemini'].map((provider) => (
                      <div key={provider} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getAIProviderLogo(provider, 'w-6 h-6')}
                          <div>
                            <p className="text-white font-medium capitalize">{provider}</p>
                            <p className="text-gray-400 text-sm">Active</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-green-400 text-sm">99.9% uptime</p>
                            <p className="text-gray-400 text-xs">~45ms response</p>
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                    <CardDescription className="text-gray-400">
                      Latest API calls and events
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-800/30 rounded">
                          <div className="flex items-center gap-3">
                            <Activity className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-white">API Call to GPT-4</p>
                              <p className="text-xs text-gray-500">2 minutes ago</p>
                            </div>
                          </div>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Success
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Active Alerts</CardTitle>
                  <CardDescription className="text-gray-400">
                    Monitor and manage system alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {alerts.length > 0 ? (
                    <div className="space-y-3">
                      {alerts.map((alert: any) => (
                        <div key={alert.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                              <div>
                                <p className="text-white font-medium">{alert.message}</p>
                                <p className="text-gray-400 text-sm mt-1">
                                  Provider: {alert.provider} • Threshold: ${alert.threshold}
                                </p>
                                <p className="text-gray-500 text-xs mt-2">
                                  Triggered: {new Date(alert.triggeredAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={alert.isActive}
                              className="data-[state=checked]:bg-green-600"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                      <p className="text-gray-400">No active alerts</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400 text-sm">CPU Usage</span>
                        <span className="text-white text-sm">45%</span>
                      </div>
                      <Progress value={45} className="h-2 bg-gray-700" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400 text-sm">Memory Usage</span>
                        <span className="text-white text-sm">62%</span>
                      </div>
                      <Progress value={62} className="h-2 bg-gray-700" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400 text-sm">API Quota</span>
                        <span className="text-white text-sm">28%</span>
                      </div>
                      <Progress value={28} className="h-2 bg-gray-700" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Response Times</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {['OpenAI', 'Anthropic', 'Gemini'].map((provider) => (
                      <div key={provider} className="flex items-center justify-between">
                        <span className="text-gray-400">{provider}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono">
                            {Math.floor(Math.random() * 100 + 50)}ms
                          </span>
                          <TrendingDown className="w-4 h-4 text-green-400" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">System Insights</CardTitle>
                  <CardDescription className="text-gray-400">
                    AI-powered recommendations and optimizations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {insights.length > 0 ? (
                    <div className="space-y-3">
                      {insights.map((insight: any, index: number) => (
                        <div key={index} className="p-4 bg-gray-800/50 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Brain className="w-5 h-5 text-indigo-400 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-white font-medium">{insight.title}</p>
                              <p className="text-gray-400 text-sm mt-1">{insight.description}</p>
                              {insight.actionItems && (
                                <div className="mt-3 flex gap-2">
                                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                                    Apply
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-gray-700 text-gray-300">
                                    Learn More
                                  </Button>
                                </div>
                              )}
                            </div>
                            <Badge className={`
                              ${insight.impact === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                insight.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                'bg-green-500/20 text-green-400 border-green-500/30'}
                            `}>
                              {insight.impact} impact
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-400">No insights available yet</p>
                      <p className="text-gray-500 text-sm mt-1">Keep using the system to generate insights</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}