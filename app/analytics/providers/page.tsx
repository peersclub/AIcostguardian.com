'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Globe, 
  Zap,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Activity,
  BarChart3
} from 'lucide-react'
import { getAIProviderLogo } from '@/components/ui/ai-logos'
import { AI_PROVIDER_IDS, getProviderById } from '@/lib/ai-providers-config'

export default function ProviderInsights() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [comparisonMetric, setComparisonMetric] = useState('cost')

  // Mock provider performance data
  const providerPerformance = [
    {
      id: 'openai',
      name: 'OpenAI',
      status: 'healthy',
      uptime: 99.9,
      avgResponseTime: 2.3,
      successRate: 98.7,
      costEfficiency: 85,
      totalCost: 127.85,
      requests: 1247,
      errorRate: 1.3,
      modelCount: 3,
      popularModel: 'GPT-4',
      strengths: ['High quality responses', 'Wide model selection', 'Good documentation'],
      concerns: ['Higher cost per token', 'Rate limits'],
      recommendation: 'Excellent for complex tasks requiring high-quality output'
    },
    {
      id: 'claude',
      name: 'Anthropic Claude',
      status: 'healthy',
      uptime: 99.8,
      avgResponseTime: 1.8,
      successRate: 99.2,
      costEfficiency: 92,
      totalCost: 89.42,
      requests: 892,
      errorRate: 0.8,
      modelCount: 3,
      popularModel: 'Claude 3 Sonnet',
      strengths: ['Large context window', 'Strong reasoning', 'Lower error rate'],
      concerns: ['Limited availability', 'Newer ecosystem'],
      recommendation: 'Best for long-context tasks and detailed analysis'
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      status: 'healthy',
      uptime: 99.7,
      avgResponseTime: 1.2,
      successRate: 97.9,
      costEfficiency: 96,
      totalCost: 45.23,
      requests: 2134,
      errorRate: 2.1,
      modelCount: 3,
      popularModel: 'Gemini 1.5 Flash',
      strengths: ['Very cost effective', 'Fast responses', 'Large context'],
      concerns: ['Variable quality', 'Newer models'],
      recommendation: 'Ideal for high-volume, cost-sensitive applications'
    },
    {
      id: 'grok',
      name: 'X.AI Grok',
      status: 'warning',
      uptime: 98.9,
      avgResponseTime: 2.1,
      successRate: 96.8,
      costEfficiency: 78,
      totalCost: 56.78,
      requests: 567,
      errorRate: 3.2,
      modelCount: 2,
      popularModel: 'Grok-1.5',
      strengths: ['Real-time data access', 'Unique perspective', 'X integration'],
      concerns: ['Higher error rate', 'Limited model options'],
      recommendation: 'Good for real-time data needs and social media insights'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'green'
      case 'warning': return 'yellow'
      case 'error': return 'red'
      default: return 'gray'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle
      case 'warning': return AlertTriangle
      case 'error': return XCircle
      default: return Activity
    }
  }

  const comparisonData = {
    cost: providerPerformance.map(p => ({ name: p.name, value: p.totalCost, id: p.id })),
    performance: providerPerformance.map(p => ({ name: p.name, value: p.avgResponseTime, id: p.id })),
    reliability: providerPerformance.map(p => ({ name: p.name, value: p.successRate, id: p.id })),
    efficiency: providerPerformance.map(p => ({ name: p.name, value: p.costEfficiency, id: p.id }))
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Globe className="w-6 h-6 text-purple-400" />
              </div>
              <h1 className="text-3xl font-bold text-white">Provider Insights</h1>
            </div>
            <p className="text-gray-400">Compare AI provider performance, costs, and reliability</p>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">Timeframe</label>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 3 months</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">Compare by</label>
                <select
                  value={comparisonMetric}
                  onChange={(e) => setComparisonMetric(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="cost">Cost</option>
                  <option value="performance">Performance</option>
                  <option value="reliability">Reliability</option>
                  <option value="efficiency">Cost Efficiency</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Provider Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          >
            {providerPerformance.map((provider, index) => {
              const StatusIcon = getStatusIcon(provider.status)
              const statusColor = getStatusColor(provider.status)
              
              return (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
                >
                  {/* Provider Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      {getAIProviderLogo(provider.id, 'w-8 h-8')}
                      <div>
                        <h3 className="text-xl font-semibold text-white">{provider.name}</h3>
                        <p className="text-gray-400 text-sm">{provider.requests.toLocaleString()} requests</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 bg-${statusColor}-500/20 text-${statusColor}-400 rounded-full text-sm font-medium border border-${statusColor}-500/30`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="capitalize">{provider.status}</span>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-800/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-gray-400 text-sm">Total Cost</span>
                      </div>
                      <div className="text-xl font-bold text-white">${provider.totalCost}</div>
                    </div>

                    <div className="bg-gray-800/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-400 text-sm">Avg Response</span>
                      </div>
                      <div className="text-xl font-bold text-white">{provider.avgResponseTime}s</div>
                    </div>

                    <div className="bg-gray-800/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-400 text-sm">Success Rate</span>
                      </div>
                      <div className="text-xl font-bold text-white">{provider.successRate}%</div>
                    </div>

                    <div className="bg-gray-800/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-400 text-sm">Efficiency</span>
                      </div>
                      <div className="text-xl font-bold text-white">{provider.costEfficiency}%</div>
                    </div>
                  </div>

                  {/* Uptime Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Uptime</span>
                      <span className="text-white font-medium">{provider.uptime}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                        style={{ width: `${provider.uptime}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Strengths and Concerns */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {provider.strengths.map((strength, idx) => (
                          <li key={idx} className="text-gray-300 text-sm flex items-center gap-2">
                            <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-yellow-400 font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Areas of Concern
                      </h4>
                      <ul className="space-y-1">
                        {provider.concerns.map((concern, idx) => (
                          <li key={idx} className="text-gray-300 text-sm flex items-center gap-2">
                            <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                            {concern}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                      <h4 className="text-blue-400 font-medium mb-2">Recommendation</h4>
                      <p className="text-gray-300 text-sm">{provider.recommendation}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Comparison Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Provider Comparison</h2>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm">
                  {comparisonMetric.charAt(0).toUpperCase() + comparisonMetric.slice(1)}
                </span>
              </div>
            </div>

            {/* Simple bar chart representation */}
            <div className="space-y-4">
              {comparisonData[comparisonMetric as keyof typeof comparisonData].map((item, index) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="w-20 flex items-center gap-2">
                    {getAIProviderLogo(item.id, 'w-5 h-5')}
                    <span className="text-gray-300 text-sm">{item.name.split(' ')[0]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="h-6 bg-gray-700 rounded-full overflow-hidden flex-1 mr-3">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(() => {
                              const metricKey = comparisonMetric as keyof typeof comparisonData;
                              const maxValue = Math.max(...comparisonData[metricKey].map(d => d.value));
                              return comparisonMetric === 'cost' 
                                ? (item.value / maxValue) * 100
                                : comparisonMetric === 'performance'
                                  ? (1 - (item.value / maxValue)) * 100
                                  : (item.value / maxValue) * 100;
                            })()}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-white font-medium min-w-16 text-right">
                        {comparisonMetric === 'cost' && '$'}{item.value}
                        {comparisonMetric === 'performance' && 's'}
                        {(comparisonMetric === 'reliability' || comparisonMetric === 'efficiency') && '%'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Summary Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl border border-gray-800 p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Optimization Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="font-medium text-green-400">Cost Optimization</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Switch 40% of simple queries to Gemini to reduce costs by ~$25/month while maintaining quality.
                </p>
              </div>

              <div className="bg-gray-800/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <span className="font-medium text-blue-400">Performance</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Use Claude for long-context tasks and OpenAI for complex reasoning to optimize response quality.
                </p>
              </div>

              <div className="bg-gray-800/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                  <span className="font-medium text-purple-400">Reliability</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Monitor Grok error rates closely and implement fallback to Claude for critical operations.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}