'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Bell, Mail, MessageSquare, Smartphone,
  Moon, Clock, Save, TestTube, ArrowLeft
} from 'lucide-react'
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
        setLoading(false)
        return
      }
      
      const data = await response.json()
      
      if (data.success && data.data) {
        const { stats, ...prefs } = data.data
        setPreferences(prev => ({ ...prev, ...prefs }))
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
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
            <TabsList className="bg-gradient-to-br from-indigo-900/30 to-purple-800/30 backdrop-blur-xl border border-indigo-500/30 p-1 h-auto grid w-full grid-cols-2">
              <TabsTrigger value="channels" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=inactive]:text-gray-400 hover:text-white transition-all">
                Channels
              </TabsTrigger>
              <TabsTrigger value="categories" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=inactive]:text-gray-400 hover:text-white transition-all">
                Categories
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
                      <div>
                        <Label htmlFor="slack" className="text-white">Slack</Label>
                        <p className="text-sm text-indigo-300/60">Send notifications to Slack</p>
                      </div>
                    </div>
                    <Switch
                      id="slack"
                      checked={preferences.slackEnabled}
                      onCheckedChange={(checked) => 
                        setPreferences({ ...preferences, slackEnabled: checked })
                      }
                    />
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
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}