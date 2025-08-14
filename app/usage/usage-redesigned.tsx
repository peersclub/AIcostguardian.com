'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
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
  ExternalLink,
  Users,
  Sparkles,
  Database,
  Cpu,
  Code,
  FileText,
  Settings,
  ChevronDown,
  Eye,
  EyeOff,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as ReChartPie, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap
} from 'recharts'
import { getAIProviderLogo } from '@/components/ui/ai-logos'
import { cn } from '@/lib/utils'

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

const PROVIDER_COLORS = {
  openai: '#10a37f',
  anthropic: '#8b5cf6',
  google: '#4285f4',
  xai: '#1d9bf0',
  perplexity: '#ff4545',
  mistral: '#ff7000'
}

const GRADIENT_COLORS = [
  'from-indigo-500 to-purple-500',
  'from-purple-500 to-pink-500',
  'from-blue-500 to-indigo-500',
  'from-green-500 to-emerald-500',
  'from-orange-500 to-red-500',
  'from-cyan-500 to-blue-500'
]

export default function UsageRedesigned() {
  const { data: session, status } = useSession()
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [selectedProvider, setSelectedProvider] = useState('all')
  const [selectedView, setSelectedView] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [usageData, setUsageData] = useState<UsageStats | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchUsageData()
    }
  }, [status, session, selectedTimeframe, selectedProvider])

  const fetchUsageData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/usage/stats?timeframe=${selectedTimeframe}${
          selectedProvider !== 'all' ? `&provider=${selectedProvider}` : ''
        }`
      )
      
      if (response.ok) {
        const data = await response.json()
        setUsageData(data)
      }
    } catch (error) {
      console.error('Failed to fetch usage data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/usage/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeframe: selectedTimeframe })
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `usage-report-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
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
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(value)
  }

  const getChangeIndicator = (value: number) => {
    if (value > 0) {
      return (
        <div className="flex items-center gap-1 text-green-400">
          <ArrowUpRight className="w-4 h-4" />
          <span className="text-sm">+{value.toFixed(1)}%</span>
        </div>
      )
    } else if (value < 0) {
      return (
        <div className="flex items-center gap-1 text-red-400">
          <ArrowDownRight className="w-4 h-4" />
          <span className="text-sm">{value.toFixed(1)}%</span>
        </div>
      )
    }
    return <span className="text-gray-400 text-sm">0%</span>
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20" />
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Usage Analytics</h1>
                  <p className="text-gray-400 mt-1">Track and optimize your AI spending</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search models, providers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Timeframe Selector */}
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="px-4 py-2 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="ytd">Year to date</option>
                </select>

                {/* Provider Filter */}
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="px-4 py-2 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Providers</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google</option>
                  <option value="xai">xAI</option>
                </select>

                {/* Actions */}
                <button
                  onClick={() => fetchUsageData()}
                  disabled={isLoading}
                  className="p-2 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-lg text-white hover:bg-gray-800 transition-colors"
                >
                  <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
                </button>

                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Export
                </button>
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex space-x-1 bg-gray-900/30 backdrop-blur-xl rounded-xl p-1">
              {['overview', 'providers', 'models', 'trends', 'costs', 'insights'].map((view) => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view)}
                  className={cn(
                    "px-6 py-2 rounded-lg font-medium transition-all capitalize",
                    selectedView === view
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  )}
                >
                  {view}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading usage data...</p>
              </div>
            </div>
          )}

          {/* Content */}
          {!isLoading && selectedView === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {/* Total Spend */}
                <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-xl rounded-2xl border border-green-500/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-500/20 rounded-xl">
                      <DollarSign className="w-6 h-6 text-green-400" />
                    </div>
                    {getChangeIndicator(usageData?.monthlyTrend || 0)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm">Total Spend</p>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(usageData?.totalCost || 0)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-gray-800 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full"
                          style={{ width: `${Math.min((usageData?.budgetUtilization || 0), 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">
                        {(usageData?.budgetUtilization || 0).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Total Requests */}
                <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <Activity className="w-6 h-6 text-blue-400" />
                    </div>
                    {getChangeIndicator(12.5)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm">Total Requests</p>
                    <p className="text-3xl font-bold text-white">
                      {formatNumber(usageData?.totalRequests || 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Avg: {formatCurrency(usageData?.avgCostPerRequest || 0)}/request
                    </p>
                  </div>
                </div>

                {/* Total Tokens */}
                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <Cpu className="w-6 h-6 text-purple-400" />
                    </div>
                    {getChangeIndicator(8.3)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm">Total Tokens</p>
                    <p className="text-3xl font-bold text-white">
                      {formatNumber(usageData?.totalTokens || 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {((usageData?.totalTokens || 0) / (usageData?.totalRequests || 1)).toFixed(0)} tokens/req
                    </p>
                  </div>
                </div>

                {/* Active Models */}
                <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 backdrop-blur-xl rounded-2xl border border-orange-500/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-500/20 rounded-xl">
                      <Layers className="w-6 h-6 text-orange-400" />
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Active
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm">Active Models</p>
                    <p className="text-3xl font-bold text-white">
                      {Object.keys(usageData?.byModel || {}).length}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Across {Object.keys(usageData?.byProvider || {}).length} providers
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Usage Trend Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-2 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                      Usage Trend
                    </h3>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700">
                        Cost
                      </button>
                      <button className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg">
                        Requests
                      </button>
                    </div>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={usageData?.dailyUsage || []}>
                      <defs>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: '#f3f4f6' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="cost"
                        stroke="#8b5cf6"
                        fillOpacity={1}
                        fill="url(#colorCost)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Provider Breakdown */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
                >
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                    <PieChart className="w-5 h-5 text-indigo-400" />
                    Provider Share
                  </h3>
                  
                  <ResponsiveContainer width="100%" height={250}>
                    <ReChartPie>
                      <Pie
                        data={Object.entries(usageData?.byProvider || {}).map(([name, data]) => ({
                          name,
                          value: data.cost
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {Object.entries(usageData?.byProvider || {}).map(([provider], index) => (
                          <Cell key={`cell-${index}`} fill={PROVIDER_COLORS[provider] || '#6b7280'} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                    </ReChartPie>
                  </ResponsiveContainer>
                  
                  <div className="space-y-2 mt-4">
                    {Object.entries(usageData?.byProvider || {}).map(([provider, data]: [string, any]) => (
                      <div key={provider} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: PROVIDER_COLORS[provider] || '#6b7280' }}
                          />
                          <span className="text-sm text-gray-300 capitalize">{provider}</span>
                        </div>
                        <span className="text-sm font-medium text-white">
                          {formatCurrency(data.cost)}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Model Performance Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-400" />
                    Model Performance
                  </h3>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showDetails ? 'Hide' : 'Show'} Details
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(usageData?.byModel || {}).slice(0, 6).map(([model, data]: [string, any], index) => (
                    <motion.div
                      key={model}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * index }}
                      className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-indigo-500/50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getAIProviderLogo(data.provider)}
                          <div>
                            <p className="text-sm font-medium text-white">{model}</p>
                            <p className="text-xs text-gray-400">{data.provider}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Cost</span>
                          <span className="text-xs font-medium text-white">{formatCurrency(data.cost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Requests</span>
                          <span className="text-xs font-medium text-white">{formatNumber(data.requests)}</span>
                        </div>
                        {showDetails && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-400">Tokens</span>
                              <span className="text-xs font-medium text-white">{formatNumber(data.tokens)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-400">Avg Cost</span>
                              <span className="text-xs font-medium text-white">
                                {formatCurrency(data.cost / data.requests)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Other View Content */}
          {!isLoading && selectedView !== 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-12 text-center"
            >
              <Sparkles className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                {selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} View
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Advanced analytics for {selectedView} coming soon. This view will provide detailed insights and visualizations.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}