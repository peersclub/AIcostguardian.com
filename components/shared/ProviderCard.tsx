'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Settings, 
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap
} from 'lucide-react'
import { getAIProviderLogo } from '@/components/ui/ai-logos'
import { ProviderConnectionStatus, UsageStats } from '@/lib/types/usage'

interface ProviderCardProps {
  providerId: string
  providerName: string
  status: ProviderConnectionStatus
  stats?: Partial<UsageStats>
  onConfigure?: () => void
  onViewDetails?: () => void
  variant?: 'compact' | 'detailed'
  showTrends?: boolean
  className?: string
}

export default function ProviderCard({
  providerId,
  providerName,
  status,
  stats,
  onConfigure,
  onViewDetails,
  variant = 'compact',
  showTrends = true,
  className = ''
}: ProviderCardProps) {
  const getStatusIcon = () => {
    if (!status.isConfigured) return <AlertCircle className="w-5 h-5 text-gray-400" />
    if (status.isValid) return <CheckCircle className="w-5 h-5 text-green-400" />
    return <XCircle className="w-5 h-5 text-red-400" />
  }

  const getStatusText = () => {
    if (!status.isConfigured) return 'Not Configured'
    if (status.isValid) return 'Active'
    return 'Error'
  }

  const getStatusColor = () => {
    if (!status.isConfigured) return 'text-gray-400'
    if (status.isValid) return 'text-green-400'
    return 'text-red-400'
  }

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatCost = (cost: number | undefined) => {
    if (cost === undefined) return '$0'
    return `$${cost.toFixed(2)}`
  }

  if (variant === 'detailed') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 ${className}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            {getAIProviderLogo(providerId, 'w-8 h-8')}
            <div>
              <h3 className="text-lg font-semibold text-white">{providerName}</h3>
              <div className={`flex items-center gap-1 mt-1 ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="text-sm">{getStatusText()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {onConfigure && (
              <button
                onClick={onConfigure}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-400" />
              </button>
            )}
            {onViewDetails && (
              <button
                onClick={onViewDetails}
                className="px-3 py-1.5 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-white text-sm font-medium"
              >
                View Details
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        {stats && status.isValid && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-4 h-4 text-blue-400" />
                {showTrends && (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    12%
                  </span>
                )}
              </div>
              <div className="text-xl font-semibold text-white">
                {formatNumber(stats.totalCalls)}
              </div>
              <div className="text-xs text-gray-400">API Calls</div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-4 h-4 text-purple-400" />
                {showTrends && (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    8%
                  </span>
                )}
              </div>
              <div className="text-xl font-semibold text-white">
                {formatNumber(stats.totalTokens)}
              </div>
              <div className="text-xs text-gray-400">Tokens</div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                {showTrends && (
                  <span className="text-xs text-red-400 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    5%
                  </span>
                )}
              </div>
              <div className="text-xl font-semibold text-white">
                {formatCost(stats.totalCost)}
              </div>
              <div className="text-xs text-gray-400">Total Cost</div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-4 h-4 text-orange-400" />
                {showTrends && (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    15%
                  </span>
                )}
              </div>
              <div className="text-xl font-semibold text-white">
                {stats.avgResponseTime?.toFixed(1) || '0'}s
              </div>
              <div className="text-xs text-gray-400">Avg Response</div>
            </div>
          </div>
        )}

        {/* Error State */}
        {status.error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-sm text-red-400">{status.error}</p>
          </div>
        )}

        {/* Not Configured State */}
        {!status.isConfigured && (
          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-400 mb-3">
              Configure this provider to start tracking usage and costs
            </p>
            {onConfigure && (
              <button
                onClick={onConfigure}
                className="w-full px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-white font-medium"
              >
                Configure {providerName}
              </button>
            )}
          </div>
        )}
      </motion.div>
    )
  }

  // Compact variant
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-4 hover:border-gray-700 transition-all ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getAIProviderLogo(providerId, 'w-6 h-6')}
          <div>
            <h4 className="text-sm font-medium text-white">{providerName}</h4>
            <div className={`flex items-center gap-1 mt-0.5 ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="text-xs">{getStatusText()}</span>
            </div>
          </div>
        </div>

        {stats && status.isValid && (
          <div className="text-right">
            <div className="text-sm font-semibold text-white">
              {formatCost(stats.totalCost)}
            </div>
            <div className="text-xs text-gray-400">
              {formatNumber(stats.totalCalls)} calls
            </div>
          </div>
        )}

        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="ml-4 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Activity className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    </motion.div>
  )
}