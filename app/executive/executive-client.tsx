'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Session } from 'next-auth'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Shield,
  Brain,
  Clock,
  Award,
  Activity,
  BarChart3,
  PieChart,
  Globe,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  ExternalLink,
  ChevronRight,
  Eye,
  Lightbulb,
  Zap,
  Building2,
  Settings,
  Bell,
  Filter,
  Calendar,
  Star,
  Gauge
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getAIProviderLogo } from '@/components/ui/ai-logos'

interface ExecutiveDashboardClientProps {
  initialSession?: Session | null
}

interface ExecutiveMetrics {
  totalSpend: number
  monthlyBudget: number
  budgetUtilization: number
  costPerEmployee: number
  efficiency: number
  riskScore: number
  forecastAccuracy: number
  complianceScore: number
  savingsOpportunity: number
  monthlyGrowth: number
  quarterlyTrend: number
  avgCostPerRequest: number
  peakHourMultiplier: number
  responseTime: number
  availability: number
  errorRate: number
  throughput: number
}

interface BusinessInsight {
  type: 'success' | 'warning' | 'danger' | 'info'
  title: string
  message: string
  metric?: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  confidence: number
  timeframe: string
  category: string
  impact: string
  action: string
}

interface ProviderPerformance {
  id: string
  name: string
  spend: number
  share: number
  performance: number
  reliability: number
  costEfficiency: number
  trend: 'up' | 'down' | 'stable'
  change: number
  status: string
  recommendation: string
}

interface ForecastData {
  period: string
  spend: number
  confidence: number
  status: string
}

export default function ExecutiveDashboardClient({ initialSession }: ExecutiveDashboardClientProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const activeSession = session || initialSession

  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [selectedView, setSelectedView] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [executiveData, setExecutiveData] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchExecutiveData()
  }, [selectedTimeframe])

  const fetchExecutiveData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/executive/metrics?timeframe=${selectedTimeframe}`)

      if (!response.ok) {
        throw new Error('Failed to fetch executive data')
      }

      const data = await response.json()
      setExecutiveData(data)
    } catch (error) {
      console.error('Failed to fetch executive data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchExecutiveData()
    setIsRefreshing(false)
  }

  const executiveMetrics: ExecutiveMetrics = executiveData?.executiveMetrics || {
    totalSpend: 0,
    monthlyBudget: 0,
    budgetUtilization: 0,
    costPerEmployee: 0,
    efficiency: 0,
    riskScore: 0,
    forecastAccuracy: 0,
    complianceScore: 0,
    savingsOpportunity: 0,
    monthlyGrowth: 0,
    quarterlyTrend: 0,
    avgCostPerRequest: 0,
    peakHourMultiplier: 1,
    responseTime: 250,
    availability: 99.9,
    errorRate: 0.1,
    throughput: 100
  }

  const businessInsights: BusinessInsight[] = executiveData?.businessInsights || []
  const providers: ProviderPerformance[] = executiveData?.performanceMetrics?.providers || []
  const forecasts: ForecastData[] = executiveData?.forecasts || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': case 'excellent': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'good': case 'on-track': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'review': case 'over-budget': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'urgent': return 'text-red-400 bg-red-500/20 border-red-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default: return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
    return `$${value.toFixed(2)}`
  }

  if (status === 'loading' && !initialSession) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!activeSession) {
    return null
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 min-h-screen py-6">
          <div className="max-w-7xl mx-auto px-6">

            {/* Executive Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                      <Award className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Executive Command Center</h1>
                    <span className="px-3 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 text-sm font-medium rounded-full border border-indigo-500/30">
                      Real-time Intelligence
                    </span>
                  </div>
                  <p className="text-gray-400">Strategic AI operations oversight for C-level decision-making</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 backdrop-blur-xl rounded-lg border border-gray-700">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-300">Live Data</span>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:text-white"
                      >
                        <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                        Refresh
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Sync latest data</TooltipContent>
                  </Tooltip>

                  <Button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Executive Report
                  </Button>
                </div>
              </div>

              {/* Quick Navigation */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Link href="/analytics/usage" className="group">
                  <div className="p-4 bg-gray-900/50 backdrop-blur-xl rounded-lg border border-gray-700 hover:border-indigo-500/50 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <BarChart3 className="w-5 h-5 text-indigo-400" />
                      <span className="text-indigo-300 font-medium">Predictive Analytics</span>
                      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <p className="text-gray-400 text-sm">AI-powered forecasting and trends</p>
                  </div>
                </Link>

                <Link href="/monitoring/dashboard" className="group">
                  <div className="p-4 bg-gray-900/50 backdrop-blur-xl rounded-lg border border-gray-700 hover:border-green-500/50 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Activity className="w-5 h-5 text-green-400" />
                      <span className="text-green-300 font-medium">Advanced Monitoring</span>
                      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-green-400 transition-colors" />
                    </div>
                    <p className="text-gray-400 text-sm">Real-time performance metrics</p>
                  </div>
                </Link>

                <Link href="/optimization" className="group">
                  <div className="p-4 bg-gray-900/50 backdrop-blur-xl rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="w-5 h-5 text-purple-400" />
                      <span className="text-purple-300 font-medium">Model Optimization</span>
                      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <p className="text-gray-400 text-sm">AI model selection & tuning</p>
                  </div>
                </Link>

                <Link href="/usage" className="group">
                  <div className="p-4 bg-gray-900/50 backdrop-blur-xl rounded-lg border border-gray-700 hover:border-yellow-500/50 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Gauge className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-300 font-medium">Usage Analytics</span>
                      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-yellow-400 transition-colors" />
                    </div>
                    <p className="text-gray-400 text-sm">Detailed consumption analysis</p>
                  </div>
                </Link>
              </div>

              {/* View Tabs */}
              <div className="flex space-x-1 bg-gray-800/30 backdrop-blur-xl rounded-lg p-1 border border-gray-700">
                {['overview', 'insights', 'performance', 'forecasts'].map((view) => (
                  <button
                    key={view}
                    onClick={() => setSelectedView(view)}
                    className={`px-4 py-2 rounded-md font-medium transition-all capitalize ${
                      selectedView === view
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Loading State */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-20"
              >
                <div className="text-center">
                  <RefreshCw className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Loading executive intelligence...</p>
                </div>
              </motion.div>
            )}

            {/* Overview Tab */}
            {!isLoading && selectedView === 'overview' && (
              <>
                {/* Strategic KPI Dashboard */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                  {/* Total AI Investment */}
                  <Card className="bg-gradient-to-br from-green-900/50 to-emerald-800/50 backdrop-blur-xl border border-green-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <DollarSign className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{formatCurrency(executiveMetrics.totalSpend)}</div>
                          <div className="text-green-300 text-sm">Total Investment</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-300 text-sm">+{executiveMetrics.monthlyGrowth.toFixed(1)}% MoM</span>
                      </div>
                      <div className="mt-3 text-xs text-green-200">
                        Budget utilization: {executiveMetrics.budgetUtilization.toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>

                  {/* Operational Efficiency */}
                  <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 backdrop-blur-xl border border-blue-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Target className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{executiveMetrics.efficiency.toFixed(1)}%</div>
                          <div className="text-blue-300 text-sm">Efficiency Score</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-300 text-sm">Industry leader</span>
                      </div>
                      <div className="mt-3 text-xs text-blue-200">
                        Quarterly trend: +{executiveMetrics.quarterlyTrend.toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>

                  {/* Risk Management */}
                  <Card className="bg-gradient-to-br from-yellow-900/50 to-orange-800/50 backdrop-blur-xl border border-yellow-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                          <Shield className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{executiveMetrics.riskScore}</div>
                          <div className="text-yellow-300 text-sm">Risk Score</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-300 text-sm">Low Risk</span>
                      </div>
                      <div className="mt-3 text-xs text-yellow-200">
                        Compliance: {executiveMetrics.complianceScore.toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>

                  {/* Team Productivity */}
                  <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 backdrop-blur-xl border border-purple-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <Users className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{formatCurrency(executiveMetrics.costPerEmployee)}</div>
                          <div className="text-purple-300 text-sm">Cost/Employee</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-300 text-sm">Optimized spend</span>
                      </div>
                      <div className="mt-3 text-xs text-purple-200">
                        ROI: 347% productivity gain
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Strategic Insights Panel */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
                >
                  {/* Business Intelligence */}
                  <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Brain className="w-5 h-5 text-indigo-400" />
                        Strategic Intelligence
                      </h3>
                      <Link href="/analytics/usage" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
                        Deep Analysis <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>

                    <div className="space-y-4">
                      {businessInsights.slice(0, 3).map((insight, index) => (
                        <div key={index} className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Badge className={`px-2 py-1 text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                                {insight.priority}
                              </Badge>
                              <h4 className="text-white font-medium">{insight.title}</h4>
                            </div>
                            <span className="text-gray-400 text-xs">{insight.confidence}% confidence</span>
                          </div>
                          <p className="text-gray-300 text-sm mb-3">{insight.message}</p>
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <span className="text-green-400 font-medium">{insight.impact}</span>
                              <span className="text-gray-400 ml-2">• {insight.timeframe}</span>
                            </div>
                            <Button size="sm" className="px-3 py-1 bg-indigo-600 text-white hover:bg-indigo-700 text-xs">
                              {insight.action}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Provider Performance Summary */}
                  <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Globe className="w-5 h-5 text-green-400" />
                        Provider Performance
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {providers.slice(0, 4).map((provider, index) => (
                        <div key={provider.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getAIProviderLogo(provider.id, 'w-6 h-6')}
                            <div>
                              <div className="text-sm font-medium text-white">{provider.name}</div>
                              <div className="text-xs text-gray-400">{provider.share.toFixed(1)}% share</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium flex items-center gap-1 ${
                              provider.trend === 'up' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {provider.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {provider.change > 0 ? '+' : ''}{provider.change.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-400">{formatCurrency(provider.spend)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </>
            )}

            {/* Insights Tab */}
            {!isLoading && selectedView === 'insights' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-indigo-900/20 to-purple-800/20 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Lightbulb className="w-6 h-6 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-white">AI-Powered Business Intelligence</h3>
                    <Badge className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-medium">
                      Real-time Analysis
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {businessInsights.map((insight, index) => (
                      <div key={index} className="p-6 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={`px-2 py-1 text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                                {insight.priority}
                              </Badge>
                              <span className="text-gray-400 text-xs capitalize">{insight.category}</span>
                            </div>
                            <h4 className="text-white font-semibold mb-2">{insight.title}</h4>
                            <p className="text-gray-300 text-sm">{insight.message}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 font-semibold">{insight.impact}</div>
                            <div className="text-gray-400 text-xs">{insight.confidence}% confidence</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Timeline: {insight.timeframe}</span>
                          <Button size="sm" className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700">
                            {insight.action}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Performance Tab */}
            {!isLoading && selectedView === 'performance' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-400" />
                      Performance Analytics
                    </h3>
                    <Link href="/monitoring/dashboard" className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1">
                      Live Monitoring <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <Card className="bg-gradient-to-br from-green-900/30 to-green-800/30 backdrop-blur-sm border border-green-500/30">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{executiveMetrics.availability.toFixed(1)}%</div>
                          <div className="text-green-300 text-sm">Availability</div>
                          <div className="text-xs text-green-200 mt-1">SLA: 99.9%</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-sm border border-blue-500/30">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{executiveMetrics.responseTime}ms</div>
                          <div className="text-blue-300 text-sm">Response Time</div>
                          <div className="text-xs text-blue-200 mt-1">Target: &lt;300ms</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 backdrop-blur-sm border border-purple-500/30">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">{executiveMetrics.throughput}</div>
                          <div className="text-purple-300 text-sm">Req/min</div>
                          <div className="text-xs text-purple-200 mt-1">Peak capacity</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 backdrop-blur-sm border border-yellow-500/30">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400">{executiveMetrics.errorRate.toFixed(2)}%</div>
                          <div className="text-yellow-300 text-sm">Error Rate</div>
                          <div className="text-xs text-yellow-200 mt-1">Target: &lt;0.1%</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    {providers.map((provider) => (
                      <div key={provider.id} className="p-6 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getAIProviderLogo(provider.id, 'w-8 h-8')}
                            <div>
                              <h4 className="text-white font-semibold">{provider.name}</h4>
                              <Badge className={`px-2 py-1 text-xs font-medium ${getStatusColor(provider.status)}`}>
                                {provider.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-white font-semibold text-lg">{formatCurrency(provider.spend)}</div>
                            <div className={`text-sm flex items-center gap-1 justify-end ${
                              provider.trend === 'up' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {provider.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {provider.change > 0 ? '+' : ''}{provider.change.toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 mb-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-white">{provider.performance.toFixed(1)}%</div>
                            <div className="text-xs text-gray-400">Performance</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-white">{provider.reliability.toFixed(1)}%</div>
                            <div className="text-xs text-gray-400">Reliability</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-white">{provider.costEfficiency.toFixed(1)}%</div>
                            <div className="text-xs text-gray-400">Cost Efficiency</div>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <p className="text-blue-200 text-sm">{provider.recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Forecasts Tab */}
            {!isLoading && selectedView === 'forecasts' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Clock className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Predictive Financial Analytics</h3>
                    <Badge className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium">
                      AI Forecast
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {forecasts.map((forecast, index) => (
                      <Card key={index} className={`backdrop-blur-sm border ${
                        forecast.status === 'over-budget'
                          ? 'bg-red-900/20 border-red-500/30'
                          : 'bg-gray-800/30 border-gray-700'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-white font-semibold">{forecast.period}</h4>
                            <Badge className={`px-2 py-1 text-xs font-medium ${getStatusColor(forecast.status)}`}>
                              {forecast.status}
                            </Badge>
                          </div>

                          <div className="text-center mb-4">
                            <div className="text-2xl font-bold text-white">{formatCurrency(forecast.spend)}</div>
                            <div className="text-sm text-gray-400">Projected Spend</div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Confidence</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                                  style={{ width: `${forecast.confidence}%` }}
                                />
                              </div>
                              <span className="text-gray-300 text-sm">{forecast.confidence}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-5 h-5 text-indigo-400" />
                      <span className="text-indigo-300 font-medium">Forecast Accuracy</span>
                    </div>
                    <p className="text-indigo-200 text-sm">
                      Current model accuracy: {executiveMetrics.forecastAccuracy.toFixed(1)}% based on 90-day historical data.
                      Savings opportunity of {formatCurrency(executiveMetrics.savingsOpportunity)} identified through optimization.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Executive Action Center */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Executive Action Center</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/analytics/usage" className="group">
                  <div className="p-4 bg-gradient-to-br from-indigo-900/30 to-indigo-800/30 rounded-lg border border-indigo-500/30 hover:border-indigo-400/50 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <BarChart3 className="w-5 h-5 text-indigo-400" />
                      <span className="text-indigo-300 font-medium">Predictive Analytics</span>
                    </div>
                    <p className="text-indigo-200 text-sm">AI-powered forecasting and optimization</p>
                  </div>
                </Link>

                <Link href="/monitoring/dashboard" className="group">
                  <div className="p-4 bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg border border-green-500/30 hover:border-green-400/50 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Activity className="w-5 h-5 text-green-400" />
                      <span className="text-green-300 font-medium">Live Monitoring</span>
                    </div>
                    <p className="text-green-200 text-sm">Real-time performance metrics</p>
                  </div>
                </Link>

                <Link href="/optimization" className="group">
                  <div className="p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-lg border border-purple-500/30 hover:border-purple-400/50 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="w-5 h-5 text-purple-400" />
                      <span className="text-purple-300 font-medium">Model Optimization</span>
                    </div>
                    <p className="text-purple-200 text-sm">AI model selection and tuning</p>
                  </div>
                </Link>

                <Link href="/organization/members" className="group">
                  <div className="p-4 bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-lg border border-yellow-500/30 hover:border-yellow-400/50 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-300 font-medium">Team Management</span>
                    </div>
                    <p className="text-yellow-200 text-sm">Manage users and permissions</p>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}