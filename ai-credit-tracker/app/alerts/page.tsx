'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

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
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cost': return '💰'
      case 'usage': return '📊'
      case 'anomaly': return '⚠️'
      case 'quota': return '📏'
      case 'security': return '🔒'
      case 'compliance': return '📋'
      default: return '🔔'
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading alerts management...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alerts & Monitoring</h1>
            <p className="text-gray-600 mt-2">
              Enterprise-grade monitoring and alerting for your AI operations
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            🔔 Create Alert
          </Button>
        </div>

        {/* Alert Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{activeAlerts.filter(a => !a.acknowledged).length}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <span className="text-2xl">🚨</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Alert Rules</p>
                  <p className="text-2xl font-bold text-gray-900">{alertRules.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {activeAlerts.filter(a => a.severity === 'critical').length}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Escalated</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {activeAlerts.filter(a => a.escalated).length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'active', name: 'Active Alerts', icon: '🚨' },
              { id: 'rules', name: 'Alert Rules', icon: '📋' },
              { id: 'history', name: 'History', icon: '📚' },
              { id: 'settings', name: 'Settings', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Alerts ({activeAlerts.filter(a => !a.acknowledged).length})</CardTitle>
                <CardDescription>
                  Alerts requiring attention or acknowledgment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg ${
                        alert.acknowledged ? 'bg-gray-50 border-gray-200' : getSeverityColor(alert.severity)
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{alert.ruleName}</h3>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              {alert.escalated && (
                                <Badge className="bg-purple-100 text-purple-800">
                                  ESCALATED
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
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
                            >
                              Acknowledge
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {activeAlerts.length === 0 && (
                    <div className="text-center py-8">
                      <span className="text-4xl mb-4 block">✅</span>
                      <p className="text-gray-500">No active alerts. All systems are running normally.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Alert Rules ({alertRules.length})</CardTitle>
                <CardDescription>
                  Configure and manage your alert rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alertRules.map((rule) => (
                    <div key={rule.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{getTypeIcon(rule.type)}</span>
                            <div>
                              <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                              <p className="text-sm text-gray-600">{rule.description}</p>
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
                                className={rule.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                              >
                                {rule.status.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500">
                              Triggered {rule.triggerCount} times
                              {rule.lastTriggered && ` • Last: ${formatDate(rule.lastTriggered)}`}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleAlertRule(rule.id)}
                            >
                              {rule.status === 'active' ? 'Pause' : 'Activate'}
                            </Button>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div>
                            <strong>Condition:</strong> {rule.condition} {rule.threshold} ({rule.timeframe})
                          </div>
                          <div>
                            <strong>Channels:</strong> {rule.channels.join(', ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Alert Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Alert Rule</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alert Name
                    </label>
                    <Input
                      placeholder="e.g., Monthly Cost Threshold"
                      value={newAlert.name}
                      onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alert Type
                    </label>
                    <select
                      value={newAlert.type}
                      onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as AlertRule['type'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Severity
                    </label>
                    <select
                      value={newAlert.severity}
                      onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value as AlertRule['severity'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition
                    </label>
                    <select
                      value={newAlert.condition}
                      onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value as AlertRule['condition'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="exceeds">Exceeds</option>
                      <option value="below">Below</option>
                      <option value="equals">Equals</option>
                      <option value="change_percent">% Change</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Threshold
                    </label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={newAlert.threshold}
                      onChange={(e) => setNewAlert({ ...newAlert, threshold: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Frame
                    </label>
                    <select
                      value={newAlert.timeframe}
                      onChange={(e) => setNewAlert({ ...newAlert, timeframe: e.target.value as AlertRule['timeframe'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            className="mr-2"
                          />
                          <span className="capitalize">{channel}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe when this alert should trigger..."
                    value={newAlert.description}
                    onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateAlert}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Alert Rule
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}