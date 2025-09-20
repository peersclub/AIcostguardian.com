'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Settings,
  AlertTriangle,
  CheckCircle,
  Crown,
  Mail,
  Phone,
  Clock,
  Target,
  Zap,
  Database,
  BarChart3,
  PieChart,
  Activity,
  Bell,
  BellOff,
  MessageSquare,
  Eye,
  MoreHorizontal,
  UserCheck,
  UserX
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getAIProviderLogo } from '@/components/ui/ai-logos'
import { cn } from '@/lib/utils'

interface DepartmentDetailsClientProps {
  slug: string
}

interface DepartmentData {
  department: {
    id: string
    name: string
    slug: string
    description: string
    color: string
    icon: string
    manager: any
    monthlyBudget: number
    spendingLimit: number
    userCount: number
  }
  metrics: {
    totalSpend: number
    totalRequests: number
    totalTokens: number
    avgCostPerRequest: number
    budgetUtilization: number
    monthlyBudget: number
  }
  userInsights: Array<{
    user: any
    metrics: any
    insights: any
  }>
  analytics: {
    providerBreakdown: Array<any>
    modelBreakdown: Array<any>
    dailyUsage: Array<any>
  }
  recentActivity: Array<any>
  timeframe: string
}

const PROVIDER_COLORS: Record<string, string> = {
  openai: '#10a37f',
  anthropic: '#8b5cf6',
  google: '#4285f4',
  xai: '#1d9bf0',
  perplexity: '#ff4545',
  mistral: '#ff7000'
}

export default function DepartmentDetailsClient({ slug }: DepartmentDetailsClientProps) {
  const { data: session } = useSession()
  const router = useRouter()

  const [data, setData] = useState<DepartmentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    fetchDepartmentData()
  }, [slug, selectedTimeframe])

  const fetchDepartmentData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/departments/${slug}?timeframe=${selectedTimeframe}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      } else {
        console.error('Failed to fetch department data')
      }
    } catch (error) {
      console.error('Error fetching department data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(4)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleUserAction = async (userId: string, action: 'limit' | 'notify' | 'disable') => {
    // TODO: Implement user action functionality
    console.log(`Action ${action} for user ${userId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading department details...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Department Not Found</h2>
          <p className="text-gray-400 mb-6">The requested department could not be found.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
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

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-300" />
                </button>

                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: data.department.color || '#6366f1' }}
                  >
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">{data.department.name} Department</h1>
                    <p className="text-gray-400">{data.department.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>

                <button
                  onClick={fetchDepartmentData}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>

                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Manage
                </button>
              </div>
            </div>

            {/* Department Manager */}
            {data.department.manager && (
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700 p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-gray-400">Department Manager:</span>
                  <div className="flex items-center gap-2">
                    {data.department.manager.image && (
                      <img
                        src={data.department.manager.image}
                        alt={data.department.manager.name}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="text-white font-medium">{data.department.manager.name}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400 text-sm">{data.department.manager.jobTitle}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-800/30 rounded-lg p-1">
              {['overview', 'users', 'analytics', 'activity'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-4 py-2 rounded-md font-medium transition-all capitalize ${
                    selectedTab === tab
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-6 h-6 text-green-400" />
                    <span className="text-sm text-gray-400">Total Spend</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{formatCurrency(data.metrics.totalSpend)}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {data.metrics.budgetUtilization.toFixed(1)}% of budget used
                  </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-6 h-6 text-blue-400" />
                    <span className="text-sm text-gray-400">Requests</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{data.metrics.totalRequests.toLocaleString()}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {formatCurrency(data.metrics.avgCostPerRequest)} avg cost
                  </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-6 h-6 text-purple-400" />
                    <span className="text-sm text-gray-400">Team Size</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{data.department.userCount}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {data.userInsights.filter(u => u.metrics.totalRequests > 0).length} active users
                  </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-6 h-6 text-yellow-400" />
                    <span className="text-sm text-gray-400">Budget Status</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    ${(data.metrics.monthlyBudget / 1000).toFixed(1)}K
                  </div>
                  <div className={`text-sm mt-1 ${
                    data.metrics.budgetUtilization > 90 ? 'text-red-400' :
                    data.metrics.budgetUtilization > 75 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    ${((data.metrics.monthlyBudget - data.metrics.totalSpend) / 1000).toFixed(1)}K remaining
                  </div>
                </div>
              </div>

              {/* Daily Usage Chart */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  Daily Usage Trend
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.analytics.dailyUsage}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value: any, name: string) => [
                          name === 'spend' ? formatCurrency(value) : value.toLocaleString(),
                          name === 'spend' ? 'Spend' : 'Requests'
                        ]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="spend"
                        stroke="#6366F1"
                        strokeWidth={2}
                        name="Spend"
                      />
                      <Line
                        type="monotone"
                        dataKey="requests"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="Requests"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Provider Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-green-400" />
                    Provider Usage
                  </h3>
                  <div className="space-y-4">
                    {data.analytics.providerBreakdown.slice(0, 5).map((provider, index) => (
                      <div key={provider.provider} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getAIProviderLogo(provider.provider, 'w-6 h-6')}
                          <span className="text-white capitalize">{provider.provider}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">{formatCurrency(provider.spend)}</div>
                          <div className="text-xs text-gray-400">{provider.requests} requests</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-400" />
                    Top Models
                  </h3>
                  <div className="space-y-4">
                    {data.analytics.modelBreakdown.slice(0, 5).map((model, index) => (
                      <div key={`${model.provider}:${model.model}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getAIProviderLogo(model.provider, 'w-5 h-5')}
                          <div>
                            <div className="text-white text-sm font-medium">{model.model}</div>
                            <div className="text-xs text-gray-400 capitalize">{model.provider}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">{formatCurrency(model.spend)}</div>
                          <div className="text-xs text-gray-400">{model.requests} uses</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Users Tab */}
          {selectedTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    User Insights & Admin Controls
                  </h3>
                  <p className="text-gray-400 mt-1">Monitor user activity and manage access controls</p>
                </div>

                <div className="divide-y divide-gray-700">
                  {data.userInsights.map((userInsight, index) => (
                    <motion.div
                      key={userInsight.user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 hover:bg-gray-800/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          {userInsight.user.image ? (
                            <img
                              src={userInsight.user.image}
                              alt={userInsight.user.name}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-gray-400" />
                            </div>
                          )}

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="text-white font-semibold">{userInsight.user.name}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                userInsight.user.role === 'ADMIN' ? 'bg-gray-800/30 border border-gray-600 text-gray-300' :
                                userInsight.user.role === 'EDITOR' ? 'bg-gray-800/30 border border-gray-600 text-gray-300' :
                                'bg-gray-800/30 border border-gray-600 text-gray-400'
                              }`}>
                                {userInsight.user.role}
                              </span>
                              {userInsight.metrics.spendPercentage > 50 && (
                                <span className="px-2 py-1 bg-gray-800/30 border border-gray-600 text-indigo-400 rounded-full text-xs font-medium">
                                  High Usage
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-400 mb-2">
                              {userInsight.user.jobTitle} • {userInsight.user.email}
                            </div>

                            {/* User Metrics Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                              <div>
                                <div className="text-lg font-bold text-white">
                                  {formatCurrency(userInsight.metrics.totalSpend)}
                                </div>
                                <div className="text-xs text-gray-400">Total Spend</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-white">
                                  {userInsight.metrics.totalRequests.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-400">Requests</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-white">
                                  {userInsight.metrics.spendPercentage.toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-400">Dept. Share</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-white">
                                  {formatCurrency(userInsight.metrics.avgCostPerRequest)}
                                </div>
                                <div className="text-xs text-gray-400">Avg/Request</div>
                              </div>
                            </div>

                            {/* User Insights */}
                            {userInsight.insights.topModel && (
                              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400">Most Used:</span>
                                  {getAIProviderLogo(userInsight.insights.topModel.provider, 'w-4 h-4')}
                                  <span className="text-white">{userInsight.insights.topModel.model}</span>
                                  <span className="text-gray-400">({userInsight.insights.topModel.usage}x)</span>
                                </div>
                                {userInsight.insights.topOperation && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-400">Main Activity:</span>
                                    <span className="text-white capitalize">{userInsight.insights.topOperation.type}</span>
                                    <span className="text-gray-400">({userInsight.insights.topOperation.count}x)</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Admin Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUserAction(userInsight.user.id, 'notify')}
                            className="p-2 text-blue-400 hover:bg-gray-700/50 rounded-lg transition-colors"
                            title="Send notification"
                          >
                            <Bell className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUserAction(userInsight.user.id, 'limit')}
                            className="p-2 text-yellow-400 hover:bg-gray-700/50 rounded-lg transition-colors"
                            title="Set usage limit"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUserAction(userInsight.user.id, 'disable')}
                            className="p-2 text-red-400 hover:bg-gray-700/50 rounded-lg transition-colors"
                            title="Disable access"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:bg-gray-700/50 rounded-lg transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {selectedTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Provider Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie data={data.analytics.providerBreakdown}>
                        <Pie
                          dataKey="spend"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ provider, percent }: any) => `${provider} ${(percent * 100).toFixed(1)}%`}
                        >
                          {data.analytics.providerBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PROVIDER_COLORS[entry.provider] || '#6366F1'} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Model Usage</h3>
                  <div className="h-64 overflow-y-auto">
                    <div className="space-y-3">
                      {data.analytics.modelBreakdown.map((model, index) => (
                        <div key={`${model.provider}:${model.model}`} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getAIProviderLogo(model.provider, 'w-5 h-5')}
                            <div>
                              <div className="text-white text-sm font-medium">{model.model}</div>
                              <div className="text-xs text-gray-400 capitalize">{model.provider}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-medium">{formatCurrency(model.spend)}</div>
                            <div className="text-xs text-gray-400">{model.requests} requests</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Activity Tab */}
          {selectedTab === 'activity' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    Recent Activity
                  </h3>
                  <p className="text-gray-400 mt-1">Latest AI usage across the department</p>
                </div>

                <div className="divide-y divide-gray-700">
                  {data.recentActivity.slice(0, 20).map((activity, index) => (
                    <div key={activity.id} className="p-4 hover:bg-gray-800/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getAIProviderLogo(activity.provider, 'w-5 h-5')}
                          <div>
                            <div className="text-white text-sm font-medium">
                              {activity.user.name} used {activity.model}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatDate(activity.timestamp)} • {activity.operation}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">{formatCurrency(activity.cost)}</div>
                          <div className="text-xs text-gray-400">{activity.tokens.toLocaleString()} tokens</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}