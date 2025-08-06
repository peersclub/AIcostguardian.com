'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Clock,
  BarChart3
} from 'lucide-react'
import { getAIProviderLogo } from '@/components/ui/ai-logos'
import { AI_PROVIDER_IDS } from '@/lib/ai-providers-config'

export default function UsageReports() {
  const [dateRange, setDateRange] = useState('30d')
  const [selectedProvider, setSelectedProvider] = useState('all')
  const [reportType, setReportType] = useState('detailed')

  // Mock data for demonstration
  const usageData = [
    {
      date: '2024-01-15',
      provider: 'openai',
      model: 'GPT-4',
      requests: 1247,
      tokens: 428390,
      cost: 127.85,
      avgResponseTime: 2.3
    },
    {
      date: '2024-01-15',
      provider: 'claude',
      model: 'Claude 3 Opus',
      requests: 892,
      tokens: 324560,
      cost: 89.42,
      avgResponseTime: 1.8
    },
    {
      date: '2024-01-15',
      provider: 'gemini',
      model: 'Gemini Pro',
      requests: 2134,
      tokens: 567890,
      cost: 45.23,
      avgResponseTime: 1.2
    },
    {
      date: '2024-01-15',
      provider: 'grok',
      model: 'Grok-1.5',
      requests: 567,
      tokens: 189234,
      cost: 56.78,
      avgResponseTime: 2.1
    }
  ]

  const summaryStats = {
    totalCost: 319.28,
    totalRequests: 4840,
    totalTokens: 1509074,
    avgResponseTime: 1.85,
    costChange: +12.5,
    requestsChange: +8.3,
    tokensChange: +15.2
  }

  const exportFormats = ['CSV', 'Excel', 'PDF', 'JSON']

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
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold text-white">Usage Reports</h1>
            </div>
            <p className="text-gray-400">Detailed analytics of your AI usage and spending</p>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 3 months</option>
                  <option value="1y">Last year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Provider</label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Providers</option>
                  <option value="openai">OpenAI</option>
                  <option value="claude">Anthropic Claude</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="grok">X.AI Grok</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="summary">Summary</option>
                  <option value="detailed">Detailed</option>
                  <option value="cost-breakdown">Cost Breakdown</option>
                  <option value="performance">Performance</option>
                </select>
              </div>

              <div className="flex items-end">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </motion.div>

          {/* Summary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${summaryStats.costChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {summaryStats.costChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(summaryStats.costChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">${summaryStats.totalCost}</div>
              <div className="text-sm text-gray-400">Total Cost</div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex items-center gap-1 text-sm text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  {summaryStats.requestsChange}%
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{summaryStats.totalRequests.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Requests</div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex items-center gap-1 text-sm text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  {summaryStats.tokensChange}%
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{summaryStats.totalTokens.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Tokens</div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex items-center gap-1 text-sm text-green-400">
                  <TrendingDown className="w-4 h-4" />
                  5.2%
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{summaryStats.avgResponseTime}s</div>
              <div className="text-sm text-gray-400">Avg Response Time</div>
            </div>
          </motion.div>

          {/* Usage Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">Detailed Usage Report</h2>
              <p className="text-gray-400 mt-1">Breakdown by provider and model</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Provider</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Model</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Requests</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tokens</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Avg Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {usageData.map((row, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {getAIProviderLogo(row.provider, 'w-6 h-6')}
                          <span className="text-white font-medium capitalize">{row.provider}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{row.model}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{row.requests.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{row.tokens.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-400 font-medium">${row.cost}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{row.avgResponseTime}s</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Export Options */}
            <div className="p-6 border-t border-gray-800 bg-gray-800/30">
              <div className="flex items-center justify-between">
                <p className="text-gray-400">Export this report in various formats</p>
                <div className="flex gap-2">
                  {exportFormats.map((format) => (
                    <button
                      key={format}
                      className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}