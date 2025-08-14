'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Session } from 'next-auth'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  BarChart3,
  PieChart,
  Globe,
  Shield,
  Brain,
  Clock,
  Star,
  Award,
  Lightbulb,
  Activity,
  Settings,
  Filter,
  Calendar,
  Download,
  RefreshCw,
  Bell,
  ChevronRight,
  ExternalLink,
  TrendingDown as TrendingDownIcon
} from 'lucide-react'
import { getAIProviderLogo } from '@/components/ui/ai-logos'
import AuthWrapper from '@/components/AuthWrapper'
import UsageDashboard from '@/components/usage/UsageDashboard'

function DashboardV2Content() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [selectedView, setSelectedView] = useState(searchParams.get('tab') || 'overview')
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [hasApiKeys, setHasApiKeys] = useState<boolean | null>(null)

  useEffect(() => {
    fetchDashboardData()
    checkApiKeys()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTimeframe])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['overview', 'insights', 'performance', 'forecast', 'usage'].includes(tab)) {
      setSelectedView(tab)
    }
  }, [searchParams])

  const checkApiKeys = async () => {
    try {
      const response = await fetch('/api/keys/status')
      if (response.ok) {
        const data = await response.json()
        setHasApiKeys(data.hasAnyKeys || false)
      }
    } catch (error) {
      console.error('Failed to check API keys:', error)
      setHasApiKeys(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/dashboard/metrics?timeframe=${selectedTimeframe}`)
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Failed to fetch dashboard data'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If JSON parsing fails, try text
          try {
            errorMessage = await response.text()
          } catch {
            // Use default error message
          }
        }
        console.error('Dashboard API error:', errorMessage)
        return
      }
      
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Use real data if available, otherwise show defaults
  const executiveMetrics = dashboardData?.executiveMetrics ? {
    totalSpend: dashboardData.executiveMetrics.totalSpend || 0,
    monthlyBudget: dashboardData.executiveMetrics.monthlyBudget || 30000,
    budgetUtilization: dashboardData.executiveMetrics.budgetUtilization || 0,
    costPerEmployee: dashboardData.executiveMetrics.costPerEmployee || 0,
    efficiency: dashboardData.executiveMetrics.efficiency || 94.2,
    riskScore: dashboardData.executiveMetrics.riskScore || 23,
    forecastAccuracy: dashboardData.executiveMetrics.forecastAccuracy || 87.3,
    complianceScore: dashboardData.executiveMetrics.complianceScore || 98.5,
    monthlyGrowth: dashboardData.executiveMetrics.monthlyGrowth || 0,
    quarterlyTrend: dashboardData.executiveMetrics.quarterlyTrend || 8.3,
    avgCostPerRequest: dashboardData.executiveMetrics.avgCostPerRequest || 0.0247,
    peakHourMultiplier: dashboardData.executiveMetrics.peakHourMultiplier || 1.34
  } : {
    totalSpend: 0,
    monthlyBudget: 0,
    budgetUtilization: 0,
    costPerEmployee: 0,
    efficiency: 0,
    riskScore: 0,
    forecastAccuracy: 0,
    complianceScore: 0,
    monthlyGrowth: 0,
    quarterlyTrend: 0,
    avgCostPerRequest: 0,
    peakHourMultiplier: 0
  }

  // Generate insights based on real data
  const businessInsights = dashboardData?.businessInsights || [
    {
      type: 'info',
      priority: 'low',
      title: 'Start Using AI Services',
      description: 'Add your API keys in Settings to begin tracking AI usage and costs',
      impact: 'Get started',
      action: 'Configure API keys',
      confidence: 100,
      timeframe: 'Now',
      category: 'getting-started'
    }
  ]

  // Use real provider data or show empty state
  const performanceMetrics = {
    providers: dashboardData?.providers?.map((provider: any) => ({
      id: provider.provider.toLowerCase(),
      name: provider.provider,
      spend: provider.cost,
      share: provider.percentage,
      performance: 90 + Math.random() * 10, // Placeholder until we have real performance data
      reliability: 95 + Math.random() * 5,
      costEfficiency: 85 + Math.random() * 15,
      trend: provider.trend || 'stable',
      change: provider.change || 0,
      status: provider.cost > 0 ? 'active' : 'inactive',
      recommendation: provider.cost > 0 ? 'Monitor usage' : 'Not in use'
    })) || []
  }

  // Use real forecast data if available
  const forecastData = dashboardData?.forecast || [
    { period: 'Next Week', spend: 0, confidence: 0, status: 'no-data' },
    { period: 'Next Month', spend: 0, confidence: 0, status: 'no-data' },
    { period: 'Next Quarter', spend: 0, confidence: 0, status: 'no-data' }
  ]

  // Use real team data
  const teamMetrics = dashboardData?.teamMetrics ? {
    totalUsers: dashboardData.teamMetrics.totalUsers || 1,
    activeUsers: dashboardData.teamMetrics.activeUsers || 1,
    powerUsers: dashboardData.teamMetrics.powerUsers || 0,
    avgUsagePerUser: dashboardData.teamMetrics.avgUsagePerUser || 0,
    topDepartments: dashboardData.teamMetrics.topDepartments || []
  } : {
    totalUsers: 1,
    activeUsers: 1,
    powerUsers: 0,
    avgUsagePerUser: 0,
    topDepartments: []
  }

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

  return (
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
                    <Brain className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">AI Intelligence Center</h1>
                  <span className="px-3 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 text-sm font-medium rounded-full border border-indigo-500/30">
                    v2.0 Enterprise
                  </span>
                </div>
                <p className="text-gray-400">Strategic AI operations dashboard for executive decision-making</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">Live Monitoring</span>
                </div>
                <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Sync Data
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Executive Report
                </button>
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex space-x-1 bg-gray-800/30 rounded-lg p-1">
              {['overview', 'insights', 'performance', 'forecast', 'usage'].map((view) => (
                <button
                  key={view}
                  onClick={() => {
                    setSelectedView(view)
                    router.push(`/dashboard?tab=${view}`, { scroll: false })
                  }}
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
              className="flex items-center justify-center py-20 mt-8"
            >
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading dashboard data...</p>
              </div>
            </motion.div>
          )}

          {/* Empty State - Show when no API keys are configured */}
          {!isLoading && hasApiKeys === false && selectedView === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-12 text-center mt-8"
            >
              <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Welcome to AI Cost Guardian</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Start tracking your AI usage and costs by adding your API keys.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/settings/api-keys"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Configure API Keys
                </Link>
                <Link
                  href="/budgets"
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  Set Budgets
                </Link>
              </div>
            </motion.div>
          )}

          {!isLoading && dashboardData && selectedView === 'overview' && (
            <>
              {/* Executive KPI Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
              >
                {/* Total AI Investment */}
                <div className="bg-gradient-to-br from-green-900/50 to-emerald-800/50 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">${(executiveMetrics.totalSpend / 1000).toFixed(1)}K</div>
                      <div className="text-green-300 text-sm">Monthly Investment</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-300 text-sm">+{executiveMetrics.monthlyGrowth}% vs last month</span>
                  </div>
                  <div className="mt-3 text-xs text-green-200">
                    Budget utilization: {executiveMetrics.budgetUtilization}%
                  </div>
                </div>

                {/* Operational Efficiency */}
                <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Target className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{executiveMetrics.efficiency}%</div>
                      <div className="text-blue-300 text-sm">Efficiency Score</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 text-sm">+{executiveMetrics.quarterlyTrend}% this quarter</span>
                  </div>
                  <div className="mt-3 text-xs text-blue-200">
                    Industry benchmark: 87.2%
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="bg-gradient-to-br from-yellow-900/50 to-orange-800/50 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-6">
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
                    <span className="text-green-300 text-sm">Low Risk Level</span>
                  </div>
                  <div className="mt-3 text-xs text-yellow-200">
                    Compliance: {executiveMetrics.complianceScore}%
                  </div>
                </div>

                {/* Team Productivity */}
                <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Users className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{teamMetrics.activeUsers}</div>
                      <div className="text-purple-300 text-sm">Active Users</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300 text-sm">${executiveMetrics.costPerEmployee}/user</span>
                  </div>
                  <div className="mt-3 text-xs text-purple-200">
                    Productivity index: 127%
                  </div>
                </div>
              </motion.div>

              {/* Strategic Insights Panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6"
              >
                {/* Top Business Insights */}
                <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      Strategic Intelligence
                    </h3>
                    <Link href="/usage" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
                      View Details <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    {businessInsights.slice(0, 3).map((insight: any, index: number) => (
                      <div key={index} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                              {insight.priority}
                            </div>
                            <h4 className="text-white font-medium">{insight.title}</h4>
                          </div>
                          <span className="text-gray-400 text-xs">{insight.confidence}% confidence</span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className="text-green-400 font-medium">{insight.impact}</span>
                            <span className="text-gray-400 ml-2">• {insight.timeframe}</span>
                          </div>
                          <button className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 transition-colors">
                            {insight.action}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Performance Summary */}
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-400" />
                      Provider Performance
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {performanceMetrics.providers.slice(0, 4).map((provider: any, index: number) => (
                      <div key={provider.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getAIProviderLogo(provider.id, 'w-6 h-6')}
                          <div>
                            <div className="text-sm font-medium text-white">{provider.name}</div>
                            <div className="text-xs text-gray-400">{provider.share}% share</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium flex items-center gap-1 ${
                            provider.trend === 'up' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {provider.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDownIcon className="w-3 h-3" />}
                            {provider.change > 0 ? '+' : ''}{provider.change}%
                          </div>
                          <div className="text-xs text-gray-400">${(provider.spend / 1000).toFixed(1)}K</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Department Performance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 mb-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    Department Performance
                  </h3>
                  <Link href="/organization/members" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
                    Manage Team <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                  {teamMetrics.topDepartments.map((dept: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{dept.name}</h4>
                        <span className="text-xs text-gray-400">{dept.users} users</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Spend</span>
                          <span className="text-white">${(dept.spend / 1000).toFixed(1)}K</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Efficiency</span>
                          <span className={`${dept.efficiency > 90 ? 'text-green-400' : dept.efficiency > 85 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {dept.efficiency}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}

          {selectedView === 'insights' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-8"
            >
              {businessInsights.length > 0 ? (
                <div className="space-y-6">
                  {/* AI-Powered Recommendations */}
                  <div className="bg-gradient-to-br from-indigo-900/20 to-purple-800/20 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Brain className="w-6 h-6 text-indigo-400" />
                      <h3 className="text-lg font-semibold text-white">AI-Powered Business Intelligence</h3>
                      <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-medium rounded-full">
                        Real-time
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {businessInsights.map((insight: any, index: number) => (
                        <div key={index} className="p-6 bg-gray-800/30 rounded-xl border border-gray-700">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                                  {insight.priority}
                                </div>
                                <span className="text-gray-400 text-xs capitalize">{insight.category}</span>
                              </div>
                              <h4 className="text-white font-semibold mb-2">{insight.title}</h4>
                              <p className="text-gray-300 text-sm">{insight.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-green-400 font-semibold">{insight.impact}</div>
                              <div className="text-gray-400 text-xs">{insight.confidence}% confidence</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Timeline: {insight.timeframe}</span>
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                              {insight.action}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-12 text-center">
                  <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">No Insights Available</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Start using AI services to generate insights and recommendations.
                  </p>
                  <Link
                    href="/settings"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Configure AI Services
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {selectedView === 'performance' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6 mt-8"
            >
              {/* Provider Performance Matrix */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-green-400" />
                    Provider Performance Matrix
                  </h3>
                  <Link href="/usage" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
                    Detailed Analysis <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {performanceMetrics.providers && performanceMetrics.providers.length > 0 ? (
                    performanceMetrics.providers.map((provider: any) => (
                    <div key={provider.id} className="p-6 bg-gray-800/30 rounded-xl border border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getAIProviderLogo(provider.id, 'w-8 h-8')}
                          <div>
                            <h4 className="text-white font-semibold">{provider.name}</h4>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(provider.status)}`}>
                                {provider.status}
                              </span>
                              <span className="text-gray-400 text-sm">{provider.share}% market share</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-white font-semibold text-lg">${(provider.spend / 1000).toFixed(1)}K</div>
                          <div className={`text-sm flex items-center gap-1 justify-end ${
                            provider.trend === 'up' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {provider.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDownIcon className="w-3 h-3" />}
                            {provider.change > 0 ? '+' : ''}{provider.change}%
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-6 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{provider.performance}%</div>
                          <div className="text-xs text-gray-400">Performance</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{provider.reliability}%</div>
                          <div className="text-xs text-gray-400">Reliability</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{provider.costEfficiency}%</div>
                          <div className="text-xs text-gray-400">Cost Efficiency</div>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-200 text-sm">{provider.recommendation}</p>
                      </div>
                    </div>
                  ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Globe className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="text-gray-400 text-lg font-medium mb-2">No Provider Data Available</p>
                      <p className="text-gray-500 text-sm">Start using AI providers to see performance metrics here</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {selectedView === 'forecast' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6 mt-8"
            >
              {/* Predictive Analytics */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Predictive Financial Analytics</h3>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full">
                    AI Forecast
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {forecastData.map((forecast: any, index: number) => (
                    <div key={index} className={`p-6 rounded-xl border ${
                      forecast.status === 'over-budget' 
                        ? 'bg-red-900/20 border-red-500/30' 
                        : 'bg-gray-800/30 border-gray-700'
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-semibold">{forecast.period}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(forecast.status)}`}>
                          {forecast.status}
                        </span>
                      </div>
                      
                      <div className="text-center mb-4">
                        <div className="text-2xl font-bold text-white">${(forecast.spend / 1000).toFixed(1)}K</div>
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
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {selectedView === 'usage' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-8"
            >
              <UsageDashboard />
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/usage" className="group">
                <div className="p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-lg border border-blue-500/30 hover:border-blue-400/50 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-300 font-medium">Usage Analytics</span>
                  </div>
                  <p className="text-blue-200 text-sm">Deep dive into consumption patterns</p>
                </div>
              </Link>

              <Link href="/team/permissions/usagelimits" className="group">
                <div className="p-4 bg-gradient-to-br from-red-900/30 to-red-800/30 rounded-lg border border-red-500/30 hover:border-red-400/50 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-red-400" />
                    <span className="text-red-300 font-medium">Usage Controls</span>
                  </div>
                  <p className="text-red-200 text-sm">Set limits and automated policies</p>
                </div>
              </Link>

              <Link href="/organization/members" className="group">
                <div className="p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-lg border border-purple-500/30 hover:border-purple-400/50 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-300 font-medium">Team Management</span>
                  </div>
                  <p className="text-purple-200 text-sm">Manage users and permissions</p>
                </div>
              </Link>

              <Link href="/usage" className="group">
                <div className="p-4 bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg border border-green-500/30 hover:border-green-400/50 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-green-300 font-medium">Cost Trends</span>
                  </div>
                  <p className="text-green-200 text-sm">Analyze spending patterns</p>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

interface DashboardClientProps {
  initialSession?: Session | null
}

export default function DashboardClient({ initialSession }: DashboardClientProps) {
  const { data: session, status } = useSession()
  const activeSession = session || initialSession
  
  if (status === 'loading' && !initialSession) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }
  
  if (!activeSession) {
    return null // This shouldn't happen as the server component handles redirect
  }
  
  return <DashboardV2Content />
}