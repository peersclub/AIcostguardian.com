'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  Zap,
  BarChart3,
  LineChart,
  Target,
  AlertTriangle,
  Activity
} from 'lucide-react'
import { getAIProviderLogo } from '@/components/ui/ai-logos'

export default function CostTrends() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('cost')

  // Mock trend data
  const trendData = {
    cost: [
      { date: '2024-01-01', value: 245.32, change: 0 },
      { date: '2024-01-08', value: 267.89, change: 9.2 },
      { date: '2024-01-15', value: 298.45, change: 11.4 },
      { date: '2024-01-22', value: 319.28, change: 7.0 },
      { date: '2024-01-29', value: 342.67, change: 7.3 }
    ],
    usage: [
      { date: '2024-01-01', value: 3245, change: 0 },
      { date: '2024-01-08', value: 3567, change: 9.9 },
      { date: '2024-01-15', value: 4123, change: 15.6 },
      { date: '2024-01-22', value: 4840, change: 17.4 },
      { date: '2024-01-29', value: 5234, change: 8.1 }
    ]
  }

  const insights = [
    {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Cost Spike Detected',
      description: 'AI spending increased by 23% this week compared to last week',
      value: '+23%',
      color: 'orange'
    },
    {
      type: 'positive',
      icon: Target,
      title: 'Efficiency Improved',
      description: 'Average cost per request decreased by 8% due to better model selection',
      value: '-8%',
      color: 'green'
    },
    {
      type: 'info',
      icon: Activity,
      title: 'Peak Usage Hours',
      description: 'Highest activity between 2-4 PM EST, consider rate limiting',
      value: '2-4 PM',
      color: 'blue'
    },
    {
      type: 'negative',
      icon: TrendingUp,
      title: 'Monthly Projection',
      description: 'On track to exceed monthly budget by 15% at current usage rate',
      value: '+15%',
      color: 'red'
    }
  ]

  const providerTrends = [
    {
      provider: 'openai',
      name: 'OpenAI',
      currentCost: 127.85,
      previousCost: 115.32,
      change: 10.9,
      trend: 'up',
      percentage: 37.8
    },
    {
      provider: 'claude',
      name: 'Anthropic Claude',
      currentCost: 89.42,
      previousCost: 94.67,
      change: -5.5,
      trend: 'down',
      percentage: 26.4
    },
    {
      provider: 'gemini',
      name: 'Google Gemini',
      currentCost: 45.23,
      previousCost: 38.91,
      change: 16.2,
      trend: 'up',
      percentage: 13.4
    },
    {
      provider: 'grok',
      name: 'X.AI Grok',
      currentCost: 56.78,
      previousCost: 62.34,
      change: -8.9,
      trend: 'down',
      percentage: 16.8
    }
  ]

  const forecastData = [
    { period: 'Next Week', cost: 375.40, confidence: 85 },
    { period: 'Next Month', cost: 1450.20, confidence: 72 },
    { period: 'Next Quarter', cost: 4200.60, confidence: 58 }
  ]

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
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <h1 className="text-3xl font-bold text-white">Cost Trends</h1>
            </div>
            <p className="text-gray-400">Analyze spending patterns and forecast future costs</p>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Time Period</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 3 months</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">Metric</label>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="cost">Cost ($)</option>
                  <option value="usage">Usage (Requests)</option>
                  <option value="tokens">Tokens</option>
                  <option value="efficiency">Cost Efficiency</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Key Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {insights.map((insight, index) => (
              <div key={index} className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 bg-${insight.color}-500/20 rounded-lg`}>
                    <insight.icon className={`w-5 h-5 text-${insight.color}-400`} />
                  </div>
                  <span className={`text-sm font-medium text-${insight.color}-400`}>
                    {insight.value}
                  </span>
                </div>
                <h3 className="text-white font-semibold mb-2">{insight.title}</h3>
                <p className="text-gray-400 text-sm">{insight.description}</p>
              </div>
            ))}
          </motion.div>

          {/* Main Chart Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Cost Trend Analysis</h2>
              <div className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm">Interactive Chart</span>
              </div>
            </div>
            
            {/* Placeholder for chart - would integrate with Chart.js or similar */}
            <div className="h-80 bg-gray-800/30 rounded-lg flex items-center justify-center border border-gray-700">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Interactive Cost Trend Chart</p>
                <p className="text-gray-500 text-sm">Chart visualization would be displayed here</p>
                <div className="mt-4 flex justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-400">Current Period</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-400">Previous Period</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-400">Forecast</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Provider Breakdown and Forecast */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Provider Trends */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Provider Trends</h2>
              <div className="space-y-4">
                {providerTrends.map((provider, index) => (
                  <div key={provider.provider} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getAIProviderLogo(provider.provider, 'w-6 h-6')}
                      <div>
                        <div className="text-white font-medium">{provider.name}</div>
                        <div className="text-gray-400 text-sm">{provider.percentage}% of total</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">${provider.currentCost}</div>
                      <div className={`text-sm flex items-center gap-1 ${
                        provider.trend === 'up' ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {provider.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(provider.change)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Cost Forecast */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Cost Forecast</h2>
              <div className="space-y-6">
                {forecastData.map((forecast, index) => (
                  <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{forecast.period}</span>
                      <span className="text-white font-semibold">${forecast.cost.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Confidence Level</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                            style={{ width: `${forecast.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-300 text-sm">{forecast.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <div className="text-yellow-300 font-medium mb-1">Budget Alert</div>
                    <div className="text-yellow-200 text-sm">
                      Current trajectory suggests monthly budget will be exceeded by 15%. Consider implementing cost controls.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}