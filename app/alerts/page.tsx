'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTriangle, Bell, Settings, BarChart3, Shield, FileText, AlertCircle } from 'lucide-react'

interface AlertRule {
  id: string
  name: string
  type: 'cost' | 'usage' | 'anomaly' | 'quota' | 'security' | 'compliance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'paused' | 'triggered'
  threshold: number
  condition: 'exceeds' | 'below' | 'equals' | 'change_percent'
  timeframe: 'hourly' | 'daily' | 'weekly' | 'monthly'
  description: string
  channels: string[]
  lastTriggered?: Date
  triggerCount: number
  createdAt: Date
}

interface ActiveAlert {
  id: string
  ruleId: string
  ruleName: string
  type: 'cost' | 'usage' | 'anomaly' | 'quota' | 'security' | 'compliance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  currentValue: number
  threshold: number
  triggeredAt: Date
  acknowledged: boolean
  acknowledgedBy?: string
  escalated: boolean
}

export default function AlertsManagement() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('active')
  const [alertRules, setAlertRules] = useState<AlertRule[]>([])
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newAlert, setNewAlert] = useState({
    name: '',
    type: 'cost' as AlertRule['type'],
    severity: 'medium' as AlertRule['severity'],
    threshold: 0,
    condition: 'exceeds' as AlertRule['condition'],
    timeframe: 'daily' as AlertRule['timeframe'],
    description: '',
    channels: ['email']
  })

  useEffect(() => {
    if (session?.user?.id) {
      fetchAlertsData()
    }
  }, [session])

  const fetchAlertsData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch alert rules
      const rulesResponse = await fetch('/api/alerts/rules')
      if (rulesResponse.ok) {
        const rules = await rulesResponse.json()
        setAlertRules(rules.map((rule: any) => ({
          ...rule,
          createdAt: new Date(rule.createdAt),
          lastTriggered: rule.lastTriggered ? new Date(rule.lastTriggered) : undefined
        })))
      }

      // Fetch active alerts
      const alertsResponse = await fetch('/api/alerts/active')
      if (alertsResponse.ok) {
        const alerts = await alertsResponse.json()
        setActiveAlerts(alerts.map((alert: any) => ({
          ...alert,
          triggeredAt: new Date(alert.triggeredAt)
        })))
      }
    } catch (error) {
      console.error('Failed to fetch alerts data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAlert = async () => {
    if (!newAlert.name.trim()) {
      alert('Please enter an alert name')
      return
    }

    try {
      const response = await fetch('/api/alerts/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert)
      })

      const result = await response.json()

      if (response.ok) {
        await fetchAlertsData() // Refresh data
        setNewAlert({
          name: '',
          type: 'cost',
          severity: 'medium',
          threshold: 0,
          condition: 'exceeds',
          timeframe: 'daily',
          description: '',
          channels: ['email']
        })
        setShowCreateModal(false)
        alert('✅ Alert rule created successfully!')
      } else {
        alert(`❌ ${result.error || 'Failed to create alert rule'}`)
      }
    } catch (error) {
      alert('❌ Failed to create alert rule')
    }
  }

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/alerts/active', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, action: 'acknowledge' })
      })

      if (response.ok) {
        await fetchAlertsData() // Refresh data
        alert('Alert acknowledged')
      } else {
        alert('Failed to acknowledge alert')
      }
    } catch (error) {
      alert('Failed to acknowledge alert')
    }
  }

  const handleToggleAlertRule = async (ruleId: string) => {
    try {
      const rule = alertRules.find(r => r.id === ruleId)
      if (!rule) return

      const newStatus = rule.status === 'active' ? 'paused' : 'active'
      
      const response = await fetch('/api/alerts/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId, updates: { status: newStatus } })
      })

      if (response.ok) {
        await fetchAlertsData() // Refresh data
        alert(`Alert rule ${newStatus === 'active' ? 'activated' : 'paused'}`)
      } else {
        alert('Failed to update alert rule')
      }
    } catch (error) {
      alert('Failed to update alert rule')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-900/20 text-red-300 border-red-500/30'
      case 'high': return 'bg-orange-900/20 text-orange-300 border-orange-500/30'
      case 'medium': return 'bg-yellow-900/20 text-yellow-300 border-yellow-500/30'
      case 'low': return 'bg-blue-900/20 text-blue-300 border-blue-500/30'
      default: return 'bg-gray-900/20 text-gray-300 border-gray-500/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cost': return <BarChart3 className="w-5 h-5" />
      case 'usage': return <BarChart3 className="w-5 h-5" />
      case 'anomaly': return <AlertTriangle className="w-5 h-5" />
      case 'quota': return <FileText className="w-5 h-5" />
      case 'security': return <Shield className="w-5 h-5" />
      case 'compliance': return <FileText className="w-5 h-5" />
      default: return <Bell className="w-5 h-5" />
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  const alertRuleTypes = [
    { value: 'cost', label: 'Cost Threshold', description: 'Monitor spending limits' },
    { value: 'usage', label: 'Usage Volume', description: 'Track API call volumes' },
    { value: 'anomaly', label: 'Anomaly Detection', description: 'Detect unusual patterns' },
    { value: 'quota', label: 'Quota Management', description: 'Monitor API quotas' },
    { value: 'security', label: 'Security Events', description: 'Security-related alerts' },
    { value: 'compliance', label: 'Compliance', description: 'Regulatory compliance' }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 p-6 relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-green-600 to-blue-600 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-10 animate-pulse delay-500"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading alerts management...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-green-600 to-blue-600 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-10 animate-pulse delay-500"></div>
      </div>
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <motion.div 
          className="flex justify-between items-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Alerts & Monitoring</h1>
            <p className="text-gray-300 mt-2">
              Enterprise-grade monitoring and alerting for your AI operations
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0"
          >
            <Bell className="w-4 h-4 mr-2" />
            Create Alert
          </Button>
        </motion.div>

        {/* Alert Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div 
            className="bg-gradient-to-br from-red-900/50 to-red-800/50 backdrop-blur-xl rounded-2xl border border-red-500/30 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Active Alerts</p>
                <p className="text-2xl font-bold text-red-300">{activeAlerts.filter(a => !a.acknowledged).length}</p>
              </div>
              <div className="p-3 bg-red-900/30 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Alert Rules</p>
                <p className="text-2xl font-bold text-blue-300">{alertRules.length}</p>
              </div>
              <div className="p-3 bg-blue-900/30 rounded-full">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 backdrop-blur-xl rounded-2xl border border-orange-500/30 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Critical Alerts</p>
                <p className="text-2xl font-bold text-orange-300">
                  {activeAlerts.filter(a => a.severity === 'critical').length}
                </p>
              </div>
              <div className="p-3 bg-orange-900/30 rounded-full">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Escalated</p>
                <p className="text-2xl font-bold text-purple-300">
                  {activeAlerts.filter(a => a.escalated).length}
                </p>
              </div>
              <div className="p-3 bg-purple-900/30 rounded-full">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'active', name: 'Active Alerts', icon: AlertCircle },
              { id: 'rules', name: 'Alert Rules', icon: FileText },
              { id: 'history', name: 'History', icon: FileText },
              { id: 'settings', name: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-400 text-blue-300'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            <motion.div 
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white">Active Alerts ({activeAlerts.filter(a => !a.acknowledged).length})</h3>
                <p className="text-gray-300 mt-1">
                  Alerts requiring attention or acknowledgment
                </p>
              </div>
              <div className="space-y-4">
                {activeAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${
                      alert.acknowledged ? 'bg-gray-800/30 border-gray-600/50' : getSeverityColor(alert.severity)
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="text-gray-300">{getTypeIcon(alert.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-white">{alert.ruleName}</h3>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                            {alert.escalated && (
                              <Badge className="bg-purple-900/20 text-purple-300 border-purple-500/30">
                                ESCALATED
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-300 mb-2">{alert.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <span>Triggered: {formatDate(alert.triggeredAt)}</span>
                            {alert.acknowledged && (
                              <span>Acknowledged by: {alert.acknowledgedBy}</span>
                            )}
                          </div>
                          </div>
                        </div>
                      <div className="flex items-center space-x-2">
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                          >
                            Acknowledge
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {activeAlerts.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <p className="text-gray-400">No active alerts. All systems are running normally.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-4">
            <motion.div 
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white">Alert Rules ({alertRules.length})</h3>
                <p className="text-gray-300 mt-1">
                  Configure and manage your alert rules
                </p>
              </div>
              <div className="space-y-4">
                {alertRules.map((rule) => (
                  <motion.div 
                    key={rule.id} 
                    className="p-4 border border-gray-600 rounded-lg hover:bg-gray-800/30 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="text-gray-300">{getTypeIcon(rule.type)}</div>
                          <div>
                            <h3 className="font-semibold text-white">{rule.name}</h3>
                            <p className="text-sm text-gray-300">{rule.description}</p>
                          </div>
                        </div>
                      </div>
                        
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge className={getSeverityColor(rule.severity)}>
                              {rule.severity.toUpperCase()}
                            </Badge>
                            <Badge 
                              className={rule.status === 'active' ? 'bg-green-900/20 text-green-300 border-green-500/30' : 'bg-gray-800/30 text-gray-400 border-gray-600/50'}
                            >
                              {rule.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-400">
                            Triggered {rule.triggerCount} times
                            {rule.lastTriggered && ` • Last: ${formatDate(rule.lastTriggered)}`}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleAlertRule(rule.id)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                          >
                            {rule.status === 'active' ? 'Pause' : 'Activate'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                      </div>
                      
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div>
                          <strong className="text-gray-300">Condition:</strong> {rule.condition} {rule.threshold} ({rule.timeframe})
                        </div>
                        <div>
                          <strong className="text-gray-300">Channels:</strong> {rule.channels.join(', ')}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Create Alert Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <motion.div 
              className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold text-white mb-6">Create New Alert Rule</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Alert Name
                    </label>
                    <Input
                      placeholder="e.g., Monthly Cost Threshold"
                      value={newAlert.name}
                      onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                      className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Alert Type
                    </label>
                    <select
                      value={newAlert.type}
                      onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as AlertRule['type'] })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {alertRuleTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label} - {type.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Severity
                    </label>
                    <select
                      value={newAlert.severity}
                      onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value as AlertRule['severity'] })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Condition
                    </label>
                    <select
                      value={newAlert.condition}
                      onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value as AlertRule['condition'] })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="exceeds">Exceeds</option>
                      <option value="below">Below</option>
                      <option value="equals">Equals</option>
                      <option value="change_percent">% Change</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Threshold
                    </label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={newAlert.threshold}
                      onChange={(e) => setNewAlert({ ...newAlert, threshold: parseFloat(e.target.value) || 0 })}
                      className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Time Frame
                    </label>
                    <select
                      value={newAlert.timeframe}
                      onChange={(e) => setNewAlert({ ...newAlert, timeframe: e.target.value as AlertRule['timeframe'] })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Notification Channels
                    </label>
                    <div className="space-y-2">
                      {['email', 'slack', 'webhook'].map(channel => (
                        <label key={channel} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newAlert.channels.includes(channel)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewAlert({ ...newAlert, channels: [...newAlert.channels, channel] })
                              } else {
                                setNewAlert({ ...newAlert, channels: newAlert.channels.filter(c => c !== channel) })
                              }
                            }}
                            className="mr-2 accent-blue-500"
                          />
                          <span className="capitalize text-gray-300">{channel}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe when this alert should trigger..."
                    value={newAlert.description}
                    onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateAlert}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0"
                >
                  Create Alert Rule
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}