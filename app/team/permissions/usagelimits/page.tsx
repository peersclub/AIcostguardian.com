'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Target,
  DollarSign,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Settings,
  Bell,
  Zap,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Info,
  Shield,
  Activity
} from 'lucide-react'
import { getAIProviderLogo } from '@/components/ui/ai-logos'

export default function UsageLimits() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly')
  const [showInactive, setShowInactive] = useState(false)

  // Mock usage limits data
  const usageLimits = [
    {
      id: '1',
      name: 'Monthly Spending Cap',
      type: 'spending',
      scope: 'organization',
      limit: 5000,
      current: 3247.85,
      unit: 'USD',
      period: 'monthly',
      status: 'active',
      alertThresholds: [75, 90],
      lastTriggered: null,
      createdBy: 'John Smith',
      createdAt: '2024-01-15',
      providers: ['all'],
      members: ['all'],
      actions: ['email_alert', 'slack_alert'],
      description: 'Organization-wide monthly spending limit'
    },
    {
      id: '2',
      name: 'OpenAI Daily Limit',
      type: 'requests',
      scope: 'provider',
      limit: 1000,
      current: 743,
      unit: 'requests',
      period: 'daily',
      status: 'active',
      alertThresholds: [80, 95],
      lastTriggered: '2024-01-28',
      createdBy: 'Sarah Chen',
      createdAt: '2024-01-20',
      providers: ['openai'],
      members: ['all'],
      actions: ['email_alert', 'rate_limit'],
      description: 'Daily request limit for OpenAI API'
    },
    {
      id: '3',
      name: 'Team Member Quota',
      type: 'spending',
      scope: 'member',
      limit: 500,
      current: 234.67,
      unit: 'USD',
      period: 'monthly',
      status: 'active',
      alertThresholds: [70, 85],
      lastTriggered: null,
      createdBy: 'John Smith',
      createdAt: '2024-01-10',
      providers: ['all'],
      members: ['member'],
      actions: ['email_alert', 'disable_access'],
      description: 'Monthly spending limit per team member'
    },
    {
      id: '4',
      name: 'Claude Token Limit',
      type: 'tokens',
      scope: 'provider',
      limit: 1000000,
      current: 687432,
      unit: 'tokens',
      period: 'monthly',
      status: 'warning',
      alertThresholds: [85, 95],
      lastTriggered: '2024-01-27',
      createdBy: 'Sarah Chen',
      createdAt: '2024-01-12',
      providers: ['claude'],
      members: ['all'],
      actions: ['email_alert', 'switch_provider'],
      description: 'Monthly token consumption limit for Claude'
    },
    {
      id: '5',
      name: 'Weekend Usage Cap',
      type: 'spending',
      scope: 'time',
      limit: 200,
      current: 45.23,
      unit: 'USD',
      period: 'weekly',
      status: 'inactive',
      alertThresholds: [60, 80],
      lastTriggered: null,
      createdBy: 'Mike Rodriguez',
      createdAt: '2024-01-05',
      providers: ['all'],
      members: ['all'],
      actions: ['email_alert'],
      description: 'Spending cap for weekend usage (Sat-Sun)'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'exceeded': return 'text-red-400'
      case 'inactive': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle
      case 'warning': return AlertTriangle
      case 'exceeded': return AlertTriangle
      case 'inactive': return Eye
      default: return Activity
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spending': return DollarSign
      case 'requests': return Zap
      case 'tokens': return BarChart3
      default: return Target
    }
  }

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'organization': return Shield
      case 'provider': return Settings
      case 'member': return Users
      case 'time': return Clock
      default: return Target
    }
  }

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.round((current / limit) * 100)
  }

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 95) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const filteredLimits = usageLimits.filter(limit => 
    showInactive || limit.status !== 'inactive'
  )

  // Summary stats
  const activeCount = usageLimits.filter(l => l.status === 'active').length
  const warningCount = usageLimits.filter(l => l.status === 'warning').length
  const exceededCount = usageLimits.filter(l => l.status === 'exceeded').length

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-orange-900/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
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
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <Target className="w-6 h-6 text-red-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Usage Limits & Controls</h1>
                </div>
                <p className="text-gray-400">Set spending limits, request quotas, and automated controls</p>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowInactive(!showInactive)}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                    showInactive 
                      ? 'bg-gray-600 text-white hover:bg-gray-700' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {showInactive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showInactive ? 'Hide Inactive' : 'Show All'}
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Limit
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-xl font-bold text-white">{activeCount}</div>
                    <div className="text-gray-400 text-sm">Active Limits</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <div>
                    <div className="text-xl font-bold text-white">{warningCount}</div>
                    <div className="text-gray-400 text-sm">Warnings</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <div>
                    <div className="text-xl font-bold text-white">{exceededCount}</div>
                    <div className="text-gray-400 text-sm">Exceeded</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-4">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-xl font-bold text-white">
                      {usageLimits.filter(l => l.lastTriggered).length}
                    </div>
                    <div className="text-gray-400 text-sm">Recent Alerts</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="daily">Daily Limits</option>
                  <option value="weekly">Weekly Limits</option>
                  <option value="monthly">Monthly Limits</option>
                  <option value="all">All Timeframes</option>
                </select>
                <span className="text-gray-400 text-sm">
                  Showing {filteredLimits.length} of {usageLimits.length} limits
                </span>
              </div>
            </div>
          </motion.div>

          {/* Usage Limits Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {filteredLimits.map((limit, index) => {
              const TypeIcon = getTypeIcon(limit.type)
              const ScopeIcon = getScopeIcon(limit.scope)
              const StatusIcon = getStatusIcon(limit.status)
              const percentage = getUsagePercentage(limit.current, limit.limit)
              
              return (
                <motion.div
                  key={limit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`bg-gray-900/50 backdrop-blur-xl rounded-2xl border p-6 ${
                    limit.status === 'warning' ? 'border-yellow-500/50' :
                    limit.status === 'exceeded' ? 'border-red-500/50' :
                    limit.status === 'inactive' ? 'border-gray-700 opacity-60' :
                    'border-gray-800'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        <TypeIcon className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{limit.name}</h3>
                        <p className="text-gray-400 text-sm">{limit.description}</p>
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-2 ${getStatusColor(limit.status)}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm capitalize">{limit.status}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Current Usage</span>
                      <span className="text-white font-medium">{percentage}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getProgressBarColor(percentage)} transition-all duration-500`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-white font-semibold">
                        {limit.current.toLocaleString()} {limit.unit}
                      </span>
                      <span className="text-gray-400">
                        of {limit.limit.toLocaleString()} {limit.unit}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ScopeIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400 text-sm">Scope</span>
                      </div>
                      <span className="text-white capitalize">{limit.scope}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400 text-sm">Period</span>
                      </div>
                      <span className="text-white capitalize">{limit.period}</span>
                    </div>

                    {/* Alert Thresholds */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400 text-sm">Alerts at</span>
                      </div>
                      <div className="flex gap-2">
                        {limit.alertThresholds.map((threshold, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                            {threshold}%
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Providers */}
                    {limit.providers.includes('all') ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">Providers</span>
                        </div>
                        <span className="text-white">All providers</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">Providers</span>
                        </div>
                        <div className="flex gap-2">
                          {limit.providers.map((providerId, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              {getAIProviderLogo(providerId, 'w-4 h-4')}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Last Triggered */}
                    {limit.lastTriggered && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-400 text-sm">Last Alert</span>
                        </div>
                        <span className="text-yellow-300">
                          {new Date(limit.lastTriggered).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
                    <span className="text-gray-400 text-sm">
                      Created by {limit.createdBy}
                    </span>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Empty State */}
          {filteredLimits.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-12"
            >
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No usage limits found</p>
              <p className="text-gray-500 text-sm">Create your first usage limit to control AI spending and usage</p>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Info className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Quick Actions & Templates</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 bg-gradient-to-r from-green-900/30 to-green-800/30 rounded-lg border border-green-500/30 text-left hover:border-green-400/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-medium">Monthly Budget</span>
                </div>
                <p className="text-green-200 text-sm">Set organization-wide monthly spending limits</p>
              </button>

              <button className="p-4 bg-gradient-to-r from-blue-900/30 to-blue-800/30 rounded-lg border border-blue-500/30 text-left hover:border-blue-400/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-300 font-medium">API Rate Limits</span>
                </div>
                <p className="text-blue-200 text-sm">Control request rates per provider or user</p>
              </button>

              <button className="p-4 bg-gradient-to-r from-purple-900/30 to-purple-800/30 rounded-lg border border-purple-500/30 text-left hover:border-purple-400/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-300 font-medium">User Quotas</span>
                </div>
                <p className="text-purple-200 text-sm">Set individual spending or usage quotas</p>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}