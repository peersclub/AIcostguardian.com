'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Bell, Mail, MessageSquare, Smartphone, Settings, ExternalLink,
  Moon, Clock, Save, TestTube, ArrowLeft, CheckCircle, AlertCircle,
  Zap, Shield, TrendingUp, Users, Activity, Globe, DollarSign,
  Hash, Volume2, VolumeX, Edit3, Copy, RefreshCw, Database,
  Webhook, Bot, Link2, Eye, EyeOff, AlertTriangle, Info, Loader2
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import Link from 'next/link'

export default function NotificationSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [preferences, setPreferences] = useState({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    inAppEnabled: true,
    slackEnabled: false,
    teamsEnabled: false,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    timezone: 'UTC',
    weekendQuiet: false,
    batchEmails: false,
    batchFrequency: 'immediate',
    preferredChannel: 'EMAIL',
    costAlerts: true,
    usageAlerts: true,
    systemAlerts: true,
    teamAlerts: true,
    reports: true,
    recommendations: true,
    autoEscalate: false,
    escalateAfterMinutes: 30
  })

  // Slack integration state
  const [slackIntegration, setSlackIntegration] = useState(null)
  const [slackChannels, setSlackChannels] = useState({
    costAlerts: '#cost-alerts',
    systemAlerts: '#system-alerts',
    usageAlerts: '#usage-alerts',
    billingAlerts: '#billing-alerts',
    teamUpdates: '#team-updates',
    securityAlerts: '#security-alerts',
    aiActivity: '#ai-activity',
    collaboration: '#collaboration',
    reports: '#reports',
    optimization: '#optimization'
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [loadingSlack, setLoadingSlack] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchPreferences()
    }
  }, [status, router])

  const fetchPreferences = async () => {
    try {
      // Fetch notification preferences
      const response = await fetch('/api/notifications/preferences')

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          const { stats, ...prefs } = data.data
          setPreferences(prev => ({ ...prev, ...prefs }))
        }
      }

      // Fetch Slack integration details
      await fetchSlackIntegration()
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSlackIntegration = async () => {
    try {
      setLoadingSlack(true)
      const response = await fetch('/api/integrations/slack')

      if (response.ok) {
        const data = await response.json()
        if (data.config) {
          setSlackIntegration(data.config)
          setPreferences(prev => ({ ...prev, slackEnabled: data.config.enabled }))

          // Update channel routing if available
          if (data.notifications) {
            setSlackChannels(prev => ({ ...prev, ...data.config.channels }))
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch Slack integration:', error)
    } finally {
      setLoadingSlack(false)
    }
  }

  const savePreferences = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Settings saved',
          description: 'Your notification preferences have been updated.'
        })
      }
    } catch (error) {
      console.error('Failed to save preferences:', error)
      toast({
        title: 'Error',
        description: 'Failed to save preferences. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const testChannel = async (channel: string) => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channels: [channel],
          message: `Test notification for ${channel} channel`
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Test sent',
          description: `Test notification sent to ${channel} channel.`
        })
      }
    } catch (error) {
      console.error('Failed to test channel:', error)
      toast({
        title: 'Test failed',
        description: `Failed to send test notification to ${channel}.`,
        variant: 'destructive'
      })
    }
  }

  const testSlackIntegration = async (eventType = 'NOTIFICATION_TEST') => {
    try {
      setTesting(true)
      const response = await fetch('/api/integrations/slack/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'webhook',
          config: {
            webhookUrl: slackIntegration?.webhookUrl
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Slack test successful',
          description: 'Test notification sent to your Slack workspace!'
        })
      } else {
        toast({
          title: 'Slack test failed',
          description: data.error || 'Failed to send test notification',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to test Slack:', error)
      toast({
        title: 'Test failed',
        description: 'Unable to test Slack integration',
        variant: 'destructive'
      })
    } finally {
      setTesting(false)
    }
  }

  const updateSlackChannels = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/integrations/slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            ...slackIntegration,
            channels: slackChannels,
            notifications: {
              costAlerts: preferences.costAlerts,
              memberActivations: preferences.teamAlerts,
              highUsage: preferences.usageAlerts,
              weeklyReports: preferences.reports,
              systemUpdates: preferences.systemAlerts,
              customEvents: true
            }
          },
          notifications: {
            costAlerts: preferences.costAlerts,
            memberActivations: preferences.teamAlerts,
            highUsage: preferences.usageAlerts,
            weeklyReports: preferences.reports,
            systemUpdates: preferences.systemAlerts,
            customEvents: true
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Slack settings updated',
          description: 'Your Slack notification preferences have been saved.'
        })
        await fetchSlackIntegration()
      }
    } catch (error) {
      console.error('Failed to update Slack settings:', error)
      toast({
        title: 'Update failed',
        description: 'Failed to update Slack settings',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20" />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            <p className="mt-4 text-indigo-300">
              {status === 'loading' ? 'Checking authentication...' : 'Loading settings...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-br from-indigo-900/30 to-purple-800/30 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/notifications">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 hover:border-indigo-400/50 transition-all"
                  >
                    <ArrowLeft className="h-5 w-5 text-indigo-400" />
                  </motion.button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Notification Settings
                  </h1>
                  <p className="text-indigo-300/80 mt-1">
                    Configure how and when you receive notifications
                  </p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={savePreferences}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50"
              >
                <Save className="inline h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </div>

          <Tabs defaultValue="channels" className="space-y-6">
            <TabsList className="bg-gradient-to-br from-indigo-900/30 to-purple-800/30 backdrop-blur-xl border border-indigo-500/30 p-1 h-auto grid w-full grid-cols-3">
              <TabsTrigger value="channels" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=inactive]:text-gray-400 hover:text-white transition-all">
                <Bell className="w-4 h-4 mr-2" />
                Channels
              </TabsTrigger>
              <TabsTrigger value="categories" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=inactive]:text-gray-400 hover:text-white transition-all">
                <Settings className="w-4 h-4 mr-2" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="slack" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=inactive]:text-gray-400 hover:text-white transition-all">
                <MessageSquare className="w-4 h-4 mr-2" />
                Slack Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="channels" className="space-y-4">
              <div className="bg-gradient-to-br from-indigo-900/30 to-purple-800/30 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Notification Channels</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-indigo-500/20">
                    <div className="flex items-center space-x-4">
                      <Mail className="h-5 w-5 text-blue-400" />
                      <div>
                        <Label htmlFor="email" className="text-white">Email</Label>
                        <p className="text-sm text-indigo-300/60">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch
                      id="email"
                      checked={preferences.emailEnabled}
                      onCheckedChange={(checked) => 
                        setPreferences({ ...preferences, emailEnabled: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-indigo-500/20">
                    <div className="flex items-center space-x-4">
                      <Bell className="h-5 w-5 text-purple-400" />
                      <div>
                        <Label htmlFor="inapp" className="text-white">In-App</Label>
                        <p className="text-sm text-indigo-300/60">Show notifications in the app</p>
                      </div>
                    </div>
                    <Switch
                      id="inapp"
                      checked={preferences.inAppEnabled}
                      onCheckedChange={(checked) => 
                        setPreferences({ ...preferences, inAppEnabled: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-indigo-500/20">
                    <div className="flex items-center space-x-4">
                      <MessageSquare className="h-5 w-5 text-green-400" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="slack" className="text-white">Slack</Label>
                          {slackIntegration && (
                            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
                              Configured
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-indigo-300/60">Send notifications to Slack workspace</p>
                        {slackIntegration && (
                          <p className="text-xs text-green-400 mt-1">
                            Workspace: {slackIntegration.workspace || 'Connected'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {slackIntegration && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={testSlackIntegration}
                          disabled={testing}
                          className="bg-gray-800/50 border-green-500/30 text-green-400 hover:bg-green-500/10"
                        >
                          {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <TestTube className="w-3 h-3" />}
                        </Button>
                      )}
                      <Switch
                        id="slack"
                        checked={preferences.slackEnabled}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, slackEnabled: checked })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-indigo-500/20">
                    <div className="flex items-center space-x-4">
                      <Smartphone className="h-5 w-5 text-orange-400" />
                      <div>
                        <Label htmlFor="push" className="text-white">Push Notifications</Label>
                        <p className="text-sm text-indigo-300/60">Browser push notifications</p>
                      </div>
                    </div>
                    <Switch
                      id="push"
                      checked={preferences.pushEnabled}
                      onCheckedChange={(checked) => 
                        setPreferences({ ...preferences, pushEnabled: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <div className="bg-gradient-to-br from-indigo-900/30 to-purple-800/30 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Notification Categories</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-indigo-500/20">
                    <div>
                      <Label htmlFor="cost" className="text-white">Cost Alerts</Label>
                      <p className="text-sm text-indigo-300/60">Notifications about spending and budgets</p>
                    </div>
                    <Switch
                      id="cost"
                      checked={preferences.costAlerts}
                      onCheckedChange={(checked) => 
                        setPreferences({ ...preferences, costAlerts: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-indigo-500/20">
                    <div>
                      <Label htmlFor="usage" className="text-white">Usage Alerts</Label>
                      <p className="text-sm text-indigo-300/60">API rate limits and quota warnings</p>
                    </div>
                    <Switch
                      id="usage"
                      checked={preferences.usageAlerts}
                      onCheckedChange={(checked) => 
                        setPreferences({ ...preferences, usageAlerts: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-indigo-500/20">
                    <div>
                      <Label htmlFor="system" className="text-white">System Alerts</Label>
                      <p className="text-sm text-indigo-300/60">API key expiry and system events</p>
                    </div>
                    <Switch
                      id="system"
                      checked={preferences.systemAlerts}
                      onCheckedChange={(checked) => 
                        setPreferences({ ...preferences, systemAlerts: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Slack Details Tab */}
            <TabsContent value="slack" className="space-y-6">
              {/* Integration Status */}
              <Card className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white">Slack Integration Status</CardTitle>
                        <CardDescription className="text-gray-400">
                          Current configuration and connection details
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${slackIntegration ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                        {slackIntegration ? 'Connected' : 'Not Connected'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50"
                      >
                        <Link href="/integrations/slack">
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {slackIntegration ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4 text-blue-400" />
                            <Label className="text-white font-medium">Workspace</Label>
                          </div>
                          <p className="text-gray-300">{slackIntegration.workspace || 'AI Cost Guardian Team'}</p>
                          <p className="text-xs text-gray-500 mt-1">Team ID: {slackIntegration.teamId || 'N/A'}</p>
                        </div>

                        <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Hash className="w-4 h-4 text-green-400" />
                            <Label className="text-white font-medium">Default Channel</Label>
                          </div>
                          <p className="text-gray-300">{slackIntegration.defaultChannel || '#ai-cost-guardian'}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Webhook className="w-4 h-4 text-purple-400" />
                            <Label className="text-white font-medium">Integration Type</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              {slackIntegration.botToken ? 'Dual (Webhook + Bot)' : 'Webhook'}
                            </Badge>
                            {slackIntegration.webhookUrl && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                ✓ Webhook
                              </Badge>
                            )}
                            {slackIntegration.botToken && (
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                ✓ Bot
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-orange-400" />
                            <Label className="text-white font-medium">Last Updated</Label>
                          </div>
                          <p className="text-gray-300 text-sm">
                            {slackIntegration.setupDate ? new Date(slackIntegration.setupDate).toLocaleString() : 'Recently'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">No Slack Integration</h3>
                      <p className="text-gray-400 mb-6">Set up Slack integration to receive notifications in your workspace</p>
                      <Button asChild className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                        <Link href="/integrations/slack">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Set Up Slack Integration
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notification Events Configuration */}
              {slackIntegration && (
                <Card className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Bell className="w-5 h-5 text-blue-400" />
                      Enabled Notification Types
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Configure which events trigger Slack notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Cost Management */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-white flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          Cost Management
                        </h4>
                        {[
                          { key: 'costAlerts', label: 'Cost Threshold Alerts', enabled: preferences.costAlerts },
                          { key: 'dailySpikes', label: 'Daily Cost Spikes', enabled: true },
                          { key: 'budgetWarnings', label: 'Budget Warnings', enabled: true }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                            <span className="text-gray-300 text-sm">{item.label}</span>
                            <Badge className={`text-xs ${item.enabled ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                              {item.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                        ))}
                      </div>

                      {/* System & Usage */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-white flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-400" />
                          System & Usage
                        </h4>
                        {[
                          { key: 'systemAlerts', label: 'System Alerts', enabled: preferences.systemAlerts },
                          { key: 'usageAlerts', label: 'Usage Warnings', enabled: preferences.usageAlerts },
                          { key: 'apiKeyExpiry', label: 'API Key Expiry', enabled: true }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                            <span className="text-gray-300 text-sm">{item.label}</span>
                            <Badge className={`text-xs ${item.enabled ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                              {item.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                        ))}
                      </div>

                      {/* Team & Reports */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-400" />
                          Team & Collaboration
                        </h4>
                        {[
                          { key: 'teamAlerts', label: 'Team Updates', enabled: preferences.teamAlerts },
                          { key: 'memberActivations', label: 'Member Activations', enabled: true },
                          { key: 'collaboration', label: 'Thread Sharing', enabled: true }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                            <span className="text-gray-300 text-sm">{item.label}</span>
                            <Badge className={`text-xs ${item.enabled ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                              {item.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                        ))}
                      </div>

                      {/* Reports & Analytics */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-white flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-orange-400" />
                          Reports & Analytics
                        </h4>
                        {[
                          { key: 'reports', label: 'Weekly Reports', enabled: preferences.reports },
                          { key: 'monthlyReports', label: 'Monthly Reports', enabled: true },
                          { key: 'optimization', label: 'Optimization Tips', enabled: true }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                            <span className="text-gray-300 text-sm">{item.label}</span>
                            <Badge className={`text-xs ${item.enabled ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                              {item.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Channel Routing Configuration */}
              {slackIntegration && (
                <Card className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Hash className="w-5 h-5 text-green-400" />
                          Channel Routing
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Configure which Slack channels receive specific notification types
                        </CardDescription>
                      </div>
                      <Button
                        onClick={updateSlackChannels}
                        disabled={saving}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      >
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Routing
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(slackChannels).map(([key, channel]) => (
                        <div key={key} className="space-y-2">
                          <Label className="text-white text-sm font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </Label>
                          <Input
                            value={channel}
                            onChange={(e) => setSlackChannels(prev => ({ ...prev, [key]: e.target.value }))}
                            placeholder="#channel-name"
                            className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-white font-medium mb-1">Channel Routing Tips</h4>
                          <ul className="text-sm text-blue-300 space-y-1">
                            <li>• Use dedicated channels for different alert types to avoid noise</li>
                            <li>• Channel names must start with # (e.g., #cost-alerts)</li>
                            <li>• Make sure the channels exist in your Slack workspace</li>
                            <li>• The bot must be invited to private channels to send messages</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Test & Monitor */}
              {slackIntegration && (
                <Card className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TestTube className="w-5 h-5 text-purple-400" />
                      Test & Monitor
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Test your Slack integration and monitor notification delivery
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium text-white">Quick Tests</h4>
                        <div className="space-y-3">
                          <Button
                            onClick={() => testSlackIntegration('INTEGRATION_TEST')}
                            disabled={testing}
                            className="w-full bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30"
                          >
                            {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                            Test Webhook Connection
                          </Button>

                          <Button
                            onClick={() => testSlackIntegration('COST_ALERT_TEST')}
                            disabled={testing}
                            className="w-full bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
                          >
                            {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <DollarSign className="w-4 h-4 mr-2" />}
                            Test Cost Alert
                          </Button>

                          <Button
                            onClick={() => testSlackIntegration('SYSTEM_ALERT_TEST')}
                            disabled={testing}
                            className="w-full bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30"
                          >
                            {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
                            Test System Alert
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium text-white">Integration Health</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                            <span className="text-gray-300 text-sm">Webhook Status</span>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                              ✓ Connected
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                            <span className="text-gray-300 text-sm">Bot Authentication</span>
                            <Badge className={`text-xs ${slackIntegration.botToken ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                              {slackIntegration.botToken ? '✓ Authenticated' : '- Not configured'}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                            <span className="text-gray-300 text-sm">Notifications Enabled</span>
                            <Badge className={`text-xs ${preferences.slackEnabled ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                              {preferences.slackEnabled ? '✓ Active' : '✗ Disabled'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}