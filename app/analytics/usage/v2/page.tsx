'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Zap,
  DollarSign,
  Target,
  Eye,
  Filter,
  Download,
  Settings,
  Bell,
  Lightbulb,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react'
import { getAIProviderLogo } from '@/components/ui/ai-logos'

export default function UsageAnalyticsV2() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [selectedView, setSelectedView] = useState('overview')

  // Enhanced mock data for SaaS-focused analytics
  const executiveSummary = {
    currentSpend: 1247.85,
    projectedSpend: 1680.32,
    savings: 425.67,
    efficiency: 82,
    budget: 1500,
    budgetUtilized: 83.2,
    topOptimization: "Switch 40% queries to Gemini",
    potentialSaving: 156.32
  }

  const quickWins = [
    {
      id: 1,
      type: 'cost-reduction',
      title: 'Switch Simple Queries to Gemini',
      impact: '$156/month savings',
      effort: 'Low',
      description: '823 queries can be migrated to reduce costs by 47%',
      action: 'Auto-migrate',
      priority: 'high'
    },
    {
      id: 2,
      type: 'efficiency',
      title: 'Optimize GPT-4 Usage Pattern',
      impact: '23% faster responses',
      effort: 'Medium',
      description: 'Batch similar requests to reduce API overhead',
      action: 'Set up batching',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'budget',
      title: 'Set Usage Alerts',
      impact: 'Prevent 15% overspend',
      effort: 'Low',
      description: 'Daily budget alerts when approaching 80% threshold',
      action: 'Enable alerts',
      priority: 'high'
    }
  ]

  const costBreakdown = {
    byProvider: [
      { provider: 'openai', name: 'OpenAI', cost: 487.32, percentage: 39.1, trend: 'up', change: 12.3 },
      { provider: 'claude', name: 'Claude', cost: 312.45, percentage: 25.0, trend: 'down', change: -8.7 },
      { provider: 'gemini', name: 'Gemini', cost: 234.67, percentage: 18.8, trend: 'up', change: 45.2 },
      { provider: 'grok', name: 'Grok', cost: 213.41, percentage: 17.1, trend: 'stable', change: 2.1 }
    ],
    byCategory: [
      { category: 'Content Generation', cost: 456.78, percentage: 36.6, requests: 12847 },
      { category: 'Data Analysis', cost: 342.12, percentage: 27.4, requests: 8934 },
      { category: 'Code Generation', cost: 234.56, percentage: 18.8, requests: 5623 },
      { category: 'Translation', cost: 214.39, percentage: 17.2, requests: 9876 }
    ]
  }

  const anomalies = [
    {
      id: 1,
      type: 'spike',
      severity: 'high',
      title: 'Unusual Cost Spike',
      time: '2 hours ago',
      description: 'GPT-4 usage increased 340% between 2-4 PM',
      impact: '+$89 unexpected spend',
      action: 'Investigate'
    },
    {
      id: 2,
      type: 'pattern',
      severity: 'medium',
      title: 'New Usage Pattern',
      time: '6 hours ago',
      description: 'Weekend usage increased 120% vs historical average',
      impact: 'Budget projection +8%',
      action: 'Review'
    }
  ]

  const benchmarks = {
    industry: {
      avgCostPerUser: 45.32,
      yourCostPerUser: 38.67,
      efficiency: 117 // 17% better than average
    },
    optimization: {
      potentialSavings: 425.67,
      implementationTime: '< 1 week',
      roi: '340%'
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
          {/* Header with Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Activity className="w-6 h-6 text-blue-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">AI Usage Intelligence</h1>
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 text-sm font-medium rounded-full border border-purple-500/30">
                    v2.0
                  </span>
                </div>
                <p className="text-gray-400">AI-powered cost optimization and usage analytics</p>
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 3 months</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex space-x-1 bg-gray-800/30 rounded-lg p-1">
              {['overview', 'optimization', 'deep-dive'].map((view) => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view)}
                  className={`px-4 py-2 rounded-md font-medium transition-all capitalize ${
                    selectedView === view
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {view === 'deep-dive' ? 'Deep Dive' : view}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Executive Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* Budget Health */}
            <div className="lg:col-span-2 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Budget Health</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  executiveSummary.budgetUtilized > 90 ? 'bg-red-500/20 text-red-300' :
                  executiveSummary.budgetUtilized > 80 ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-green-500/20 text-green-300'
                }`}>
                  {executiveSummary.budgetUtilized}% utilized
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Current Spend</span>
                  <span className="text-2xl font-bold text-white">${executiveSummary.currentSpend.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Monthly Budget</span>
                  <span className="text-gray-300">${executiveSummary.budget.toLocaleString()}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Budget Progress</span>
                    <span className="text-gray-300">${(executiveSummary.budget - executiveSummary.currentSpend).toLocaleString()} remaining</span>
                  </div>
                  <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        executiveSummary.budgetUtilized > 90 ? 'bg-gradient-to-r from-red-500 to-red-400' :
                        executiveSummary.budgetUtilized > 80 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                        'bg-gradient-to-r from-green-500 to-emerald-400'
                      }`}
                      style={{ width: `${Math.min(executiveSummary.budgetUtilized, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Efficiency Score */}
            <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Efficiency</h3>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-300 mb-2">{executiveSummary.efficiency}%</div>
                <p className="text-purple-200 text-sm mb-4">Cost Efficiency Score</p>
                <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12% vs last month</span>
                </div>
              </div>
            </div>

            {/* Optimization Impact */}
            <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Quick Win</h3>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-300 mb-1">${executiveSummary.potentialSaving}</div>
                <p className="text-green-200 text-sm mb-3">Potential Monthly Savings</p>
                <button className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                  Apply Optimization
                </button>
              </div>
            </div>
          </motion.div>

          {selectedView === 'overview' && (
            <>
              {/* Quick Wins Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-xl font-semibold text-white">Optimization Opportunities</h2>
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-medium rounded-full">
                    3 available
                  </span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {quickWins.map((win, index) => (
                    <motion.div
                      key={win.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6 hover:border-blue-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-2 rounded-lg ${
                          win.priority === 'high' ? 'bg-red-500/20' :
                          win.priority === 'medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'
                        }`}>
                          {win.type === 'cost-reduction' && <DollarSign className={`w-5 h-5 ${
                            win.priority === 'high' ? 'text-red-400' : 'text-green-400'
                          }`} />}
                          {win.type === 'efficiency' && <Zap className="w-5 h-5 text-yellow-400" />}
                          {win.type === 'budget' && <Target className="w-5 h-5 text-blue-400" />}
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          win.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                          win.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {win.priority} priority
                        </span>
                      </div>
                      
                      <h3 className="text-white font-semibold mb-2">{win.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{win.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-green-400 font-medium">{win.impact}</span>
                        <span className="text-gray-400 text-sm">{win.effort} effort</span>
                      </div>
                      
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                        {win.action}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Cost Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
              >
                {/* By Provider */}
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Cost by Provider</h3>
                    <PieChart className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-4">
                    {costBreakdown.byProvider.map((provider, index) => (
                      <div key={provider.provider} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getAIProviderLogo(provider.provider, 'w-6 h-6')}
                          <div>
                            <div className="text-white font-medium">{provider.name}</div>
                            <div className="text-gray-400 text-sm">{provider.percentage}% of total</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">${provider.cost}</div>
                          <div className={`text-sm flex items-center gap-1 ${
                            provider.trend === 'up' ? 'text-red-400' : 
                            provider.trend === 'down' ? 'text-green-400' : 'text-gray-400'
                          }`}>
                            {provider.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : 
                             provider.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : 
                             <span className="w-3 h-3 text-center">—</span>}
                            {provider.change > 0 ? '+' : ''}{provider.change}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Category */}
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Cost by Use Case</h3>
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-4">
                    {costBreakdown.byCategory.map((category, index) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">{category.category}</span>
                          <span className="text-white font-semibold">${category.cost}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{category.requests.toLocaleString()} requests</span>
                          <span className="text-gray-400">{category.percentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Anomalies & Alerts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <AlertCircle className="w-6 h-6 text-orange-400" />
                  <h2 className="text-xl font-semibold text-white">Anomalies & Alerts</h2>
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs font-medium rounded-full">
                    2 active
                  </span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {anomalies.map((anomaly, index) => (
                    <div key={anomaly.id} className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-2 rounded-lg ${
                          anomaly.severity === 'high' ? 'bg-red-500/20' :
                          anomaly.severity === 'medium' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                        }`}>
                          <AlertCircle className={`w-5 h-5 ${
                            anomaly.severity === 'high' ? 'text-red-400' :
                            anomaly.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                          }`} />
                        </div>
                        <span className="text-gray-400 text-sm">{anomaly.time}</span>
                      </div>
                      
                      <h3 className="text-white font-semibold mb-2">{anomaly.title}</h3>
                      <p className="text-gray-400 text-sm mb-3">{anomaly.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-orange-400 font-medium">{anomaly.impact}</span>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                          {anomaly.action}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}

          {selectedView === 'optimization' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              {/* AI Optimization Engine */}
              <div className="bg-gradient-to-br from-green-900/20 to-emerald-800/20 backdrop-blur-xl rounded-2xl border border-green-500/30 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Lightbulb className="w-8 h-8 text-green-400" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">AI Optimization Engine</h2>
                    <p className="text-green-300">Automated cost reduction recommendations powered by machine learning</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm font-medium rounded-full border border-green-500/30">
                    ML v2.4
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">$892</div>
                    <p className="text-green-300 text-sm">Potential Monthly Savings</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">23%</div>
                    <p className="text-blue-300 text-sm">Cost Reduction Potential</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">94%</div>
                    <p className="text-purple-300 text-sm">Quality Maintained</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {quickWins.map((win, index) => (
                    <div key={win.id} className="bg-gray-800/30 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold text-lg">{win.title}</h3>
                        <div className="flex items-center gap-3">
                          <span className="text-green-400 font-semibold">{win.impact}</span>
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                            Auto-Implement
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-4">{win.description}</p>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-gray-400">Effort: {win.effort}</span>
                        <span className="text-gray-400">Priority: {win.priority}</span>
                        <span className="text-blue-400">Expected completion: 2-3 weeks</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Routing */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Smart Request Routing</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-white font-medium mb-4">Current Routing Logic</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <span className="text-gray-300">Complex Tasks</span>
                        <div className="flex items-center gap-2">
                          {getAIProviderLogo('openai', 'w-4 h-4')}
                          <span className="text-white">OpenAI GPT-4</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <span className="text-gray-300">Long Context</span>
                        <div className="flex items-center gap-2">
                          {getAIProviderLogo('claude', 'w-4 h-4')}
                          <span className="text-white">Claude 3</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <span className="text-gray-300">Simple Queries</span>
                        <div className="flex items-center gap-2">
                          {getAIProviderLogo('gemini', 'w-4 h-4')}
                          <span className="text-white">Gemini Flash</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-4">Optimization Opportunities</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-green-300 font-medium">Route 40% to Gemini</span>
                          <span className="text-green-400">+$234/month</span>
                        </div>
                        <p className="text-green-200 text-sm">Identified 823 queries that can use lower-cost provider without quality loss</p>
                      </div>
                      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-blue-300 font-medium">Batch Similar Requests</span>
                          <span className="text-blue-400">+15% speed</span>
                        </div>
                        <p className="text-blue-200 text-sm">Combine similar API calls to reduce overhead and improve response times</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {selectedView === 'deep-dive' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              {/* Detailed Analytics */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Eye className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Detailed Usage Analytics</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Request Patterns</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Peak Hours</span>
                        <span className="text-white">2-4 PM EST</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Avg Request Size</span>
                        <span className="text-white">2,847 tokens</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Cache Hit Rate</span>
                        <span className="text-green-400">67%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Error Rate</span>
                        <span className="text-red-400">1.2%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Cost Efficiency</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Cost per Request</span>
                        <span className="text-white">$0.0124</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Cost per Token</span>
                        <span className="text-white">$0.000043</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Quality Score</span>
                        <span className="text-green-400">94%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">User Satisfaction</span>
                        <span className="text-green-400">4.7/5</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">P95 Response Time</span>
                        <span className="text-white">2.3s</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Throughput</span>
                        <span className="text-white">145 req/min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Availability</span>
                        <span className="text-green-400">99.8%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Retry Rate</span>
                        <span className="text-yellow-400">3.1%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Usage Timeline */}
                <div className="border-t border-gray-700 pt-6">
                  <h4 className="text-white font-medium mb-4">24-Hour Usage Timeline</h4>
                  <div className="h-32 bg-gray-800/30 rounded-lg flex items-end justify-center p-4">
                    <div className="flex items-end gap-1 h-full w-full">
                      {Array.from({ length: 24 }, (_, i) => {
                        const height = Math.random() * 100;
                        return (
                          <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-sm opacity-70 hover:opacity-100 transition-opacity" 
                               style={{ height: `${height}%` }}
                               title={`${i}:00 - ${height.toFixed(0)}% of peak usage`}>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>23:59</span>
                  </div>
                </div>
              </div>

              {/* Advanced Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Model Performance Comparison</h3>
                  <div className="space-y-4">
                    {costBreakdown.byProvider.map((provider, index) => (
                      <div key={provider.provider} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getAIProviderLogo(provider.provider, 'w-5 h-5')}
                            <span className="text-white font-medium">{provider.name}</span>
                          </div>
                          <span className="text-gray-400">{provider.percentage}%</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Quality</span>
                            <div className="text-white font-medium">
                              {provider.provider === 'openai' ? '94%' :
                               provider.provider === 'claude' ? '91%' :
                               provider.provider === 'gemini' ? '87%' : '82%'}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">Speed</span>
                            <div className="text-white font-medium">
                              {provider.provider === 'gemini' ? '1.2s' :
                               provider.provider === 'claude' ? '1.4s' :
                               provider.provider === 'openai' ? '1.8s' : '2.1s'}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">Cost/1K</span>
                            <div className="text-white font-medium">
                              ${provider.provider === 'gemini' ? '0.04' :
                                provider.provider === 'grok' ? '0.09' :
                                provider.provider === 'claude' ? '0.12' : '0.18'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Cost Breakdown Analysis</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-white font-medium mb-3">By Time of Day</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Business Hours (9-17)</span>
                          <span className="text-white">$847.32 (68%)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Evening (18-23)</span>
                          <span className="text-white">$256.78 (21%)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Night (0-8)</span>
                          <span className="text-white">$143.75 (11%)</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-3">By User Type</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Power Users (10%)</span>
                          <span className="text-white">$623.89 (50%)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Regular Users (70%)</span>
                          <span className="text-white">$498.73 (40%)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Light Users (20%)</span>
                          <span className="text-white">$125.23 (10%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}