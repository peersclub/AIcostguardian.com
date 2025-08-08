'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Bell, Mail, MessageSquare, Webhook, Smartphone,
  Moon, Sun, Clock, Save, TestTube, ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchPreferences()
    }
  }, [status, router])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences')
      
      if (!response.ok) {
        console.error('Failed to fetch preferences:', response.status)
        // Use default preferences if fetch fails
        setLoading(false)
        return
      }
      
      const data = await response.json()
      
      if (data.success && data.data) {
        // Remove any fields that don't exist in our state
        const { stats, ...prefs } = data.data
        setPreferences(prev => ({ ...prev, ...prefs }))
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
      // Continue with default preferences
    } finally {
      setLoading(false)
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

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
          <p className="mt-4 text-gray-500">
            {status === 'loading' ? 'Checking authentication...' : 'Loading settings...'}
          </p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null // Will redirect to signin
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/notifications">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Notification Settings</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Configure how and when you receive notifications
              </p>
            </div>
          </div>
          
          <Button onClick={savePreferences} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Tabs defaultValue="channels" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Channels Tab */}
          <TabsContent value="channels" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Channels</CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="email"
                      checked={preferences.emailEnabled}
                      onCheckedChange={(checked) => 
                        setPreferences({ ...preferences, emailEnabled: checked })
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testChannel('EMAIL')}
                    >
                      <TestTube className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  </div>
                </div>

                {/* In-App */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Bell className="h-5 w-5 text-gray-500" />
                    <div>
                      <Label htmlFor="inapp">In-App</Label>
                      <p className="text-sm text-gray-500">Show notifications in the app</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="inapp"
                      checked={preferences.inAppEnabled}
                      onCheckedChange={(checked) => 
                        setPreferences({ ...preferences, inAppEnabled: checked })
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testChannel('IN_APP')}
                    >
                      <TestTube className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  </div>
                </div>

                {/* Slack */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <MessageSquare className="h-5 w-5 text-gray-500" />
                    <div>
                      <Label htmlFor="slack">Slack</Label>
                      <p className="text-sm text-gray-500">Send notifications to Slack</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="slack"
                      checked={preferences.slackEnabled}
                      onCheckedChange={(checked) => 
                        setPreferences({ ...preferences, slackEnabled: checked })
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testChannel('SLACK')}
                    >
                      <TestTube className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  </div>
                </div>

                {/* Push */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Smartphone className="h-5 w-5 text-gray-500" />
                    <div>
                      <Label htmlFor="push">Push Notifications</Label>
                      <p className="text-sm text-gray-500">Browser push notifications</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="push"
                      checked={preferences.pushEnabled}
                      onCheckedChange={(checked) => 
                        setPreferences({ ...preferences, pushEnabled: checked })
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testChannel('PUSH')}
                    >
                      <TestTube className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Categories</CardTitle>
                <CardDescription>
                  Choose which types of notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="cost">Cost Alerts</Label>
                    <p className="text-sm text-gray-500">Notifications about spending and budgets</p>
                  </div>
                  <Switch
                    id="cost"
                    checked={preferences.costAlerts}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, costAlerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="usage">Usage Alerts</Label>
                    <p className="text-sm text-gray-500">API rate limits and quota warnings</p>
                  </div>
                  <Switch
                    id="usage"
                    checked={preferences.usageAlerts}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, usageAlerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="system">System Alerts</Label>
                    <p className="text-sm text-gray-500">API key expiry and system events</p>
                  </div>
                  <Switch
                    id="system"
                    checked={preferences.systemAlerts}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, systemAlerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reports">Reports</Label>
                    <p className="text-sm text-gray-500">Weekly and monthly usage reports</p>
                  </div>
                  <Switch
                    id="reports"
                    checked={preferences.reports}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, reports: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="recommendations">Recommendations</Label>
                    <p className="text-sm text-gray-500">AI optimization suggestions</p>
                  </div>
                  <Switch
                    id="recommendations"
                    checked={preferences.recommendations}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, recommendations: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quiet Hours</CardTitle>
                <CardDescription>
                  Set times when you don't want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Moon className="h-5 w-5 text-gray-500" />
                    <div>
                      <Label htmlFor="quiet">Enable Quiet Hours</Label>
                      <p className="text-sm text-gray-500">Pause non-critical notifications</p>
                    </div>
                  </div>
                  <Switch
                    id="quiet"
                    checked={preferences.quietHoursEnabled}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, quietHoursEnabled: checked })
                    }
                  />
                </div>

                {preferences.quietHoursEnabled && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start">Start Time</Label>
                        <Input
                          id="start"
                          type="time"
                          value={preferences.quietHoursStart}
                          onChange={(e) => 
                            setPreferences({ ...preferences, quietHoursStart: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="end">End Time</Label>
                        <Input
                          id="end"
                          type="time"
                          value={preferences.quietHoursEnd}
                          onChange={(e) => 
                            setPreferences({ ...preferences, quietHoursEnd: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="weekend">Weekend Quiet Mode</Label>
                        <p className="text-sm text-gray-500">Extend quiet hours on weekends</p>
                      </div>
                      <Switch
                        id="weekend"
                        checked={preferences.weekendQuiet}
                        onCheckedChange={(checked) => 
                          setPreferences({ ...preferences, weekendQuiet: checked })
                        }
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) => 
                      setPreferences({ ...preferences, timezone: value })
                    }
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Fine-tune your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="batch">Email Batching</Label>
                  <p className="text-sm text-gray-500 mb-2">Group multiple notifications into digests</p>
                  <Select
                    value={preferences.batchFrequency}
                    onValueChange={(value) => 
                      setPreferences({ ...preferences, batchFrequency: value })
                    }
                  >
                    <SelectTrigger id="batch">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Send Immediately</SelectItem>
                      <SelectItem value="hourly">Hourly Digest</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="preferred">Preferred Channel</Label>
                  <p className="text-sm text-gray-500 mb-2">Default channel for notifications</p>
                  <Select
                    value={preferences.preferredChannel}
                    onValueChange={(value) => 
                      setPreferences({ ...preferences, preferredChannel: value })
                    }
                  >
                    <SelectTrigger id="preferred">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="IN_APP">In-App</SelectItem>
                      <SelectItem value="SLACK">Slack</SelectItem>
                      <SelectItem value="PUSH">Push</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="escalate">Auto-Escalate Critical Alerts</Label>
                    <p className="text-sm text-gray-500">
                      Automatically escalate unacknowledged critical alerts
                    </p>
                  </div>
                  <Switch
                    id="escalate"
                    checked={preferences.autoEscalate}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, autoEscalate: checked })
                    }
                  />
                </div>

                {preferences.autoEscalate && (
                  <div>
                    <Label htmlFor="escalateTime">Escalate After (minutes)</Label>
                    <Input
                      id="escalateTime"
                      type="number"
                      value={preferences.escalateAfterMinutes}
                      onChange={(e) => 
                        setPreferences({ 
                          ...preferences, 
                          escalateAfterMinutes: parseInt(e.target.value) || 30 
                        })
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}