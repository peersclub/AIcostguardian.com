'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Calendar,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
  DollarSign,
  Zap,
  User,
  AlertTriangle,
  CheckCircle,
  Database,
  FileText,
  Brain,
  ArrowUpDown,
  Eye
} from 'lucide-react'
import { getAIProviderLogo } from '@/components/ui/ai-logos'
import { cn } from '@/lib/utils'

interface UsageLog {
  id: string
  timestamp: string
  provider: string
  model: string
  operation: string
  cost: number
  promptTokens: number
  completionTokens: number
  totalTokens: number
  user: {
    name: string
    email: string
  }
  success: boolean
  responseTime?: number
  endpoint?: string
}

interface UsageLogsData {
  logs: UsageLog[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  summary: {
    totalCost: number
    totalRequests: number
    avgCostPerRequest: number
    totalTokens: number
    providerBreakdown: Record<string, any>
  }
  filters: {
    startDate: string
    endDate: string
    provider: string
  }
}

export default function UsageLogsClient() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [data, setData] = useState<UsageLogsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProvider, setSelectedProvider] = useState(searchParams.get('provider') || 'all')
  const [currentPage, setCurrentPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<keyof UsageLog>('timestamp')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const limit = 50

  useEffect(() => {
    fetchLogs()
  }, [selectedProvider, currentPage])

  const fetchLogs = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        provider: selectedProvider,
        limit: limit.toString(),
        offset: (currentPage * limit).toString()
      })

      const response = await fetch(`/api/usage-logs/detail?${params}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch usage logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (column: keyof UsageLog) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(4)}`
  }

  const getStatusColor = (success: boolean) => {
    return success
      ? 'text-green-400 bg-gray-800/30 border-gray-600'
      : 'text-red-400 bg-gray-800/30 border-gray-600'
  }

  const filteredLogs = data?.logs.filter(log =>
    log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.operation.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }

    return 0
  })

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
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={() => router.back()}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-300" />
                  </button>
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Database className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Usage Logs Detail</h1>
                </div>
                <p className="text-gray-400">Detailed view of all AI API calls and usage logs</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchLogs}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            {data && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700 p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-lg font-bold text-white">{formatCurrency(data.summary.totalCost)}</div>
                      <div className="text-sm text-gray-400">Total Cost</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700 p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-lg font-bold text-white">{data.summary.totalRequests.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">Total Requests</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700 p-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="text-lg font-bold text-white">{data.summary.totalTokens.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">Total Tokens</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700 p-4">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-lg font-bold text-white">{formatCurrency(data.summary.avgCostPerRequest)}</div>
                      <div className="text-sm text-gray-400">Avg Cost/Request</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700 p-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Filters:</span>
              </div>

              <select
                value={selectedProvider}
                onChange={(e) => {
                  setSelectedProvider(e.target.value)
                  setCurrentPage(0)
                }}
                className="px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">All Providers</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google</option>
                <option value="xai">xAI</option>
                <option value="perplexity">Perplexity</option>
                <option value="mistral">Mistral</option>
              </select>

              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>
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
                <p className="text-gray-400">Loading usage logs...</p>
              </div>
            </motion.div>
          )}

          {/* Usage Logs Table */}
          {!isLoading && data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('timestamp')}
                          className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                          <Clock className="w-4 h-4" />
                          Timestamp
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Provider</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Model</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Operation</th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('cost')}
                          className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                          <DollarSign className="w-4 h-4" />
                          Cost
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Tokens</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">User</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {sortedLogs.map((log, index) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">{formatDate(log.timestamp)}</div>
                          {log.responseTime && (
                            <div className="text-xs text-gray-400">{log.responseTime}ms</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getAIProviderLogo(log.provider, 'w-5 h-5')}
                            <span className="text-sm text-white capitalize">{log.provider}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-300">{log.model}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-300 capitalize">{log.operation}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-green-400">{formatCurrency(log.cost)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300">
                            <div>Total: {log.totalTokens.toLocaleString()}</div>
                            <div className="text-xs text-gray-400">
                              In: {log.promptTokens.toLocaleString()} • Out: {log.completionTokens.toLocaleString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300">
                            <div>{log.user.name}</div>
                            <div className="text-xs text-gray-400">{log.user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                            getStatusColor(log.success)
                          )}>
                            {log.success ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            {log.success ? 'Success' : 'Error'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.pagination.total > limit && (
                <div className="border-t border-gray-700 px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Showing {currentPage * limit + 1} to {Math.min((currentPage + 1) * limit, data.pagination.total)} of {data.pagination.total} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                        currentPage === 0
                          ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                          : "bg-gray-700 text-white hover:bg-gray-600"
                      )}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1.5 text-sm text-gray-300">
                      Page {currentPage + 1} of {Math.ceil(data.pagination.total / limit)}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!data.pagination.hasMore}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                        !data.pagination.hasMore
                          ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                          : "bg-gray-700 text-white hover:bg-gray-600"
                      )}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && data && sortedLogs.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-12 text-center"
            >
              <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Usage Logs Found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm
                  ? `No logs match your search for "${searchTerm}"`
                  : "No usage logs available for the selected filters"
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Clear Search
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}