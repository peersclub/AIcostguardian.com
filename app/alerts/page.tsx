'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Bell, Settings, BarChart3, Shield, FileText, AlertCircle, TrendingUp, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

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

export default function AlertsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('active')
  const [alertRules, setAlertRules] = useState<AlertRule[]>([])
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['active', 'rules', 'history', 'settings'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    fetchAlertsData()
  }, [session])

  const fetchAlertsData = async () => {
    try {
      const [rulesRes, alertsRes] = await Promise.all([
        fetch('/api/alerts/rules'),
        fetch('/api/alerts/active')
      ])

      if (rulesRes.ok) {
        const rules = await rulesRes.json()
        setAlertRules(rules)
      }

      if (alertsRes.ok) {
        const alerts = await alertsRes.json()
        setActiveAlerts(alerts)
      }
    } catch (error) {
      console.error('Failed to fetch alerts data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/alerts?tab=${value}`)
  }

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/alerts/active', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, action: 'acknowledge' })
      })

      if (response.ok) {
        await fetchAlertsData()
        toast({
          title: 'Success',
          description: 'Alert acknowledged successfully'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to acknowledge alert',
        variant: 'destructive'
      })
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-gray-700 text-gray-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cost': return <BarChart3 className="w-4 h-4" />
      case 'usage': return <Activity className="w-4 h-4" />
      case 'anomaly': return <AlertTriangle className="w-4 h-4" />
      case 'quota': return <TrendingUp className="w-4 h-4" />
      case 'security': return <Shield className="w-4 h-4" />
      case 'compliance': return <FileText className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="relative z-10 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading alerts...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background - EXACTLY like dashboard */}
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
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Alerts & Monitoring</h1>
                </div>
                <p className="text-gray-400">Monitor and respond to important events</p>
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Bell className="w-4 h-4 mr-2" />
                Create Alert Rule
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Active Alerts</p>
                      <p className="text-2xl font-bold text-red-400">
                        {activeAlerts.filter(a => !a.acknowledged).length}
                      </p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-red-400/20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Alert Rules</p>
                      <p className="text-2xl font-bold text-blue-400">{alertRules.length}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-400/20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Critical</p>
                      <p className="text-2xl font-bold text-orange-400">
                        {activeAlerts.filter(a => a.severity === 'critical').length}
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-400/20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Escalated</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {activeAlerts.filter(a => a.escalated).length}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-400/20" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Tabs - URL-based like dashboard */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="bg-gray-900/50 border border-gray-700">
              <TabsTrigger value="active" className="data-[state=active]:bg-indigo-600">
                <AlertCircle className="w-4 h-4 mr-2" />
                Active Alerts
              </TabsTrigger>
              <TabsTrigger value="rules" className="data-[state=active]:bg-indigo-600">
                <FileText className="w-4 h-4 mr-2" />
                Alert Rules
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-indigo-600">
                <Activity className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-indigo-600">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Active Alerts</CardTitle>
                  <CardDescription className="text-gray-400">
                    Alerts requiring your attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg border ${
                          alert.acknowledged 
                            ? 'bg-gray-800/30 border-gray-700' 
                            : getSeverityColor(alert.severity)
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getTypeIcon(alert.type)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-white">{alert.ruleName}</h3>
                                <Badge className={getSeverityColor(alert.severity)}>
                                  {alert.severity.toUpperCase()}
                                </Badge>
                                {alert.escalated && (
                                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                    ESCALATED
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-300">{alert.message}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                Triggered: {new Date(alert.triggeredAt).toLocaleString()}
                                {alert.acknowledged && ` • Acknowledged by: ${alert.acknowledgedBy}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!alert.acknowledged && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAcknowledgeAlert(alert.id)}
                                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                              >
                                Acknowledge
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-700 text-gray-300 hover:bg-gray-800"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {activeAlerts.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertCircle className="w-8 h-8 text-green-400" />
                        </div>
                        <p className="text-gray-400">No active alerts</p>
                        <p className="text-sm text-gray-500 mt-1">All systems operating normally</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rules" className="space-y-4">
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Alert Rules</CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure when and how you receive alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alertRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(rule.type)}
                            <div>
                              <h3 className="font-semibold text-white">{rule.name}</h3>
                              <p className="text-sm text-gray-400">{rule.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getSeverityColor(rule.severity)}>
                              {rule.severity.toUpperCase()}
                            </Badge>
                            <Badge className={
                              rule.status === 'active' 
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-gray-700 text-gray-400'
                            }>
                              {rule.status.toUpperCase()}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-700 text-gray-300 hover:bg-gray-800"
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between text-sm text-gray-500">
                          <span>Triggered {rule.triggerCount} times</span>
                          {rule.lastTriggered && (
                            <span>Last: {new Date(rule.lastTriggered).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    ))}

                    {alertRules.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-gray-600" />
                        </div>
                        <p className="text-gray-400">No alert rules configured</p>
                        <p className="text-sm text-gray-500 mt-1">Create your first alert rule to get started</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Alert History</CardTitle>
                  <CardDescription className="text-gray-400">
                    View past alerts and resolutions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-gray-400">No alert history available</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Alert Settings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure global alert preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <Label className="text-gray-300">Notification Channels</Label>
                      <p className="text-sm text-gray-500 mb-3">Choose how you want to receive alerts</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="text-gray-300">Email notifications</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="text-gray-300">In-app notifications</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-gray-300">SMS notifications</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-gray-300">Slack notifications</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-300">Alert Grouping</Label>
                      <p className="text-sm text-gray-500 mb-3">Group similar alerts to reduce noise</p>
                      <Select defaultValue="5min">
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1min">1 minute</SelectItem>
                          <SelectItem value="5min">5 minutes</SelectItem>
                          <SelectItem value="15min">15 minutes</SelectItem>
                          <SelectItem value="30min">30 minutes</SelectItem>
                          <SelectItem value="1hour">1 hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}