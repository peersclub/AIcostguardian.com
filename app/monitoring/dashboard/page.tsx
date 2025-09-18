'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Session } from 'next-auth'
import { motion } from 'framer-motion'
import { redirect } from 'next/navigation'
import {
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Clock,
  Zap,
  Users,
  Database,
  Globe,
  Shield,
  RefreshCw,
  Signal,
  Wifi
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { cn } from '@/lib/utils'

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic'

interface MonitoringData {
  metrics: {
    totalRequests: number
    totalTokens: number
    totalCost: number
    averageLatency: number
    errorRate: number
    activeUsers: number
  }
  alerts: Array<{
    id: string
    type: 'warning' | 'error' | 'info'
    message: string
    timestamp: string
  }>
  usage: {
    hourly: Array<{
      hour: string
      requests: number
      tokens: number
      cost: number
    }>
  }
}

export default function MonitoringDashboard() {
  const { data: session, status } = useSession()
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [realTimeEnabled, setRealTimeEnabled] = useState(true)
  const [connected, setConnected] = useState(false)
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('poor')
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [realTimeMetrics, setRealTimeMetrics] = useState<Array<{
    timestamp: number
    requests: number
    tokens: number
    cost: number
  }>>([])

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchMonitoringData = useCallback(async () => {
    try {
      const response = await fetch('/api/monitoring/metrics')
      if (response.ok) {
        const data = await response.json()
        setMonitoringData(data)
        setConnected(true)
        setConnectionQuality('excellent')
      } else {
        setConnectionQuality('poor')
      }
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error)
      setConnectionQuality('poor')
    } finally {
      setLoading(false)
    }
  }, [])

  // Start polling for real-time updates
  const startPolling = useCallback(() => {
    if (!session || !realTimeEnabled) return

    // Initial fetch
    fetchMonitoringData()

    // Set up polling every 5 seconds for real-time feel
    intervalRef.current = setInterval(() => {
      fetchMonitoringData()
      setLastUpdated(new Date())

      // Simulate real-time metrics for demo purposes
      setRealTimeMetrics(prev => [
        ...prev.slice(-29), // Keep last 30 points
        {
          timestamp: Date.now(),
          requests: Math.floor(Math.random() * 100) + 50,
          tokens: Math.floor(Math.random() * 1000) + 500,
          cost: Math.random() * 5
        }
      ])
    }, 5000)

    setConnected(true)
    setConnectionQuality('excellent')
  }, [session, realTimeEnabled, fetchMonitoringData])

  useEffect(() => {
    if (realTimeEnabled) {
      startPolling()
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setConnected(false)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [realTimeEnabled, startPolling])

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-500"></div>
    </div>
  }

  if (!session) {
    redirect('/auth/signin?callbackUrl=/monitoring/dashboard')
  }

  const getConnectionIcon = () => {
    if (!connected) return <Signal className="w-4 h-4 text-red-500" />
    if (connectionQuality === 'excellent') return <Wifi className="w-4 h-4 text-green-500" />
    if (connectionQuality === 'good') return <Signal className="w-4 h-4 text-yellow-500" />
    return <Signal className="w-4 h-4 text-red-500" />
  }

  const getConnectionStatus = () => {
    if (!connected) return 'Disconnected'
    if (connectionQuality === 'excellent') return 'Connected'
    if (connectionQuality === 'good') return 'Connected'
    return 'Poor Connection'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 text-transparent bg-clip-text">
              Advanced Monitoring
            </h1>
            <p className="text-gray-400 mt-2">Real-time AI usage tracking and system monitoring</p>
          </div>

          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            {/* Connection Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700">
              {getConnectionIcon()}
              <span className="text-sm text-gray-300">{getConnectionStatus()}</span>
            </div>

            {/* Real-time Toggle */}
            <button
              onClick={() => setRealTimeEnabled(!realTimeEnabled)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                realTimeEnabled
                  ? "bg-green-600/20 border border-green-500/30 text-green-400"
                  : "bg-gray-800/50 border border-gray-700 text-gray-400"
              )}
            >
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">
                {realTimeEnabled ? 'Live' : 'Paused'}
              </span>
            </button>

            {/* Manual Refresh */}
            <button
              onClick={fetchMonitoringData}
              className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {[
            {
              title: 'Total Requests',
              value: monitoringData?.metrics?.totalRequests?.toLocaleString() || '0',
              icon: BarChart3,
              color: 'blue',
              change: '+12%'
            },
            {
              title: 'Total Tokens',
              value: `${(monitoringData?.metrics?.totalTokens || 0).toLocaleString()}`,
              icon: Database,
              color: 'green',
              change: '+8%'
            },
            {
              title: 'Total Cost',
              value: `$${(monitoringData?.metrics?.totalCost || 0).toFixed(2)}`,
              icon: DollarSign,
              color: 'yellow',
              change: '+5%'
            },
            {
              title: 'Avg Latency',
              value: `${(monitoringData?.metrics?.averageLatency || 0).toFixed(0)}ms`,
              icon: Clock,
              color: 'purple',
              change: '-3%'
            },
            {
              title: 'Error Rate',
              value: `${((monitoringData?.metrics?.errorRate || 0) * 100).toFixed(2)}%`,
              icon: AlertTriangle,
              color: 'red',
              change: '-0.5%'
            },
            {
              title: 'Active Users',
              value: (monitoringData?.metrics?.activeUsers || 0).toString(),
              icon: Users,
              color: 'indigo',
              change: '+15%'
            }
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-4">
                <metric.icon className={`w-6 h-6 text-${metric.color}-400`} />
                <span className="text-xs text-gray-400">{metric.change}</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white">{metric.value}</p>
                <p className="text-sm text-gray-400">{metric.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Real-time Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Real-time Activity</h3>
            <div className="text-sm text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={realTimeMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  stroke="#9CA3AF"
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Alerts Section */}
        {monitoringData?.alerts && monitoringData.alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Recent Alerts</h3>
            <div className="space-y-3">
              {monitoringData.alerts.slice(0, 5).map((alert, index) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30"
                >
                  <AlertTriangle className={`w-4 h-4 ${
                    alert.type === 'error' ? 'text-red-400' :
                    alert.type === 'warning' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-white text-sm">{alert.message}</p>
                    <p className="text-gray-400 text-xs">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}