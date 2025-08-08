'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Session } from 'next-auth'
import { motion } from 'framer-motion'
import Link from 'next/link'
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
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [selectedView, setSelectedView] = useState('overview')

  // Executive KPIs and Business Intelligence Data
  const executiveMetrics = {
    totalSpend: 24567.89,
    monthlyBudget: 30000,
    budgetUtilization: 81.9,
    costPerEmployee: 127.45,
    efficiency: 94.2,
    riskScore: 23,
    forecastAccuracy: 87.3,
    complianceScore: 98.5,
    monthlyGrowth: 15.7,
    quarterlyTrend: 8.3,
    avgCostPerRequest: 0.0247,
    peakHourMultiplier: 1.34
  }

  const businessInsights = [
    {
      type: 'opportunity',
      priority: 'high',
      title: 'Smart Routing Opportunity',
      description: 'Implementing intelligent routing could reduce costs by 23% ($5,670/month)',
      impact: '$68,000 annual savings',
      action: 'Deploy AI routing',
      confidence: 89,
      timeframe: '2-3 weeks',
      category: 'cost-optimization'
    },
    {
      type: 'risk',
      priority: 'medium',
      title: 'Vendor Concentration Risk',
      description: '67% of spend concentrated in single provider. Consider diversification',
      impact: 'Business continuity risk',
      action: 'Diversify providers',
      confidence: 76,
      timeframe: '1-2 months',
      category: 'risk-management'
    },
    {
      type: 'trend',
      priority: 'high',
      title: 'Usage Spike Pattern',
      description: 'Consistent 3PM EST usage spikes suggest optimization opportunity',
      impact: '15% efficiency gain',
      action: 'Implement load balancing',
      confidence: 92,
      timeframe: '1 week',
      category: 'performance'
    },
    {
      type: 'alert',
      priority: 'urgent',
      title: 'Budget Threshold Alert',
      description: 'On track to exceed monthly budget by 12% at current usage rate',
      impact: '$3,600 overrun',
      action: 'Review and adjust',
      confidence: 94,
      timeframe: 'Immediate',
      category: 'budget'
    }
  ]

  const performanceMetrics = {
    providers: [
      {
        id: 'openai',
        name: 'OpenAI',
        spend: 16456.32,
        share: 67.0,
        performance: 94.2,
        reliability: 99.8,
        costEfficiency: 87.3,
        trend: 'up',
        change: 12.4,
        status: 'optimal',
        recommendation: 'Maintain current usage level'
      },
      {
        id: 'claude',
        name: 'Anthropic Claude',
        spend: 5234.67,
        share: 21.3,
        performance: 91.7,
        reliability: 99.2,
        costEfficiency: 92.8,
        trend: 'up',
        change: 18.7,
        status: 'excellent',
        recommendation: 'Consider expanding usage'
      },
      {
        id: 'gemini',
        name: 'Google Gemini',
        spend: 2456.78,
        share: 10.0,
        performance: 88.9,
        reliability: 98.4,
        costEfficiency: 96.2,
        trend: 'down',
        change: -3.2,
        status: 'good',
        recommendation: 'Monitor performance closely'
      },
      {
        id: 'grok',
        name: 'X.AI Grok',
        spend: 420.12,
        share: 1.7,
        performance: 82.1,
        reliability: 97.1,
        costEfficiency: 78.9,
        trend: 'down',
        change: -8.1,
        status: 'review',
        recommendation: 'Evaluate ROI and usage patterns'
      }
    ]
  }

  const forecastData = [
    { period: 'Next Week', spend: 6789.45, confidence: 94, status: 'on-track' },
    { period: 'Next Month', spend: 28456.78, confidence: 87, status: 'over-budget' },
    { period: 'Next Quarter', spend: 82345.67, confidence: 73, status: 'on-track' }
  ]

  const teamMetrics = {
    totalUsers: 193,
    activeUsers: 187,
    powerUsers: 23,
    avgUsagePerUser: 127.45,
    topDepartments: [
      { name: 'Engineering', users: 78, spend: 12456.78, efficiency: 96.2 },
      { name: 'Product', users: 34, spend: 5234.67, efficiency: 91.8 },
      { name: 'Data Science', users: 28, spend: 4567.89, efficiency: 88.9 },
      { name: 'Marketing', users: 21, spend: 2108.34, efficiency: 87.3 },
      { name: 'Operations', users: 32, spend: 200.21, efficiency: 94.1 }
    ]
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

          {selectedView === 'overview' && (
            <>
              {/* Executive KPI Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
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
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
              >
                {/* Top Business Insights */}
                <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      Strategic Intelligence
                    </h3>
                    <Link href="/analytics/usage/v2" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
                      View Details <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    {businessInsights.slice(0, 3).map((insight, index) => (
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
                    {performanceMetrics.providers.slice(0, 4).map((provider, index) => (
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
                  <Link href="/team/members" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
                    Manage Team <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                  {teamMetrics.topDepartments.map((dept, index) => (
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
              className="space-y-6"
            >
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
                  {businessInsights.map((insight, index) => (
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
            </motion.div>
          )}

          {selectedView === 'performance' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Provider Performance Matrix */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-green-400" />
                    Provider Performance Matrix
                  </h3>
                  <Link href="/analytics/providers/v2" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
                    Detailed Analysis <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {performanceMetrics.providers.map((provider) => (
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
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {selectedView === 'forecast' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
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
                  {forecastData.map((forecast, index) => (
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
              <Link href="/analytics/usage/v2" className="group">
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

              <Link href="/team/members" className="group">
                <div className="p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-lg border border-purple-500/30 hover:border-purple-400/50 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-300 font-medium">Team Management</span>
                  </div>
                  <p className="text-purple-200 text-sm">Manage users and permissions</p>
                </div>
              </Link>

              <Link href="/analytics/trends/v2" className="group">
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