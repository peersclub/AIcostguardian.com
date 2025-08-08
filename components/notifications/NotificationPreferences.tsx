'use client'

import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  AlertTriangle,
  Settings2,
  Moon,
  Volume2,
  VolumeX,
  Clock,
  Calendar,
  Upload,
  Download,
  RotateCcw,
  Save,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { NotificationPreferences as NotificationPreferencesType, NotificationChannelConfig } from '@/lib/notifications/types'
import type { ChannelType } from '@prisma/client'

interface NotificationPreferencesProps {
  userId: string
  onSave?: (preferences: NotificationPreferencesType) => void
  className?: string
}

interface CategoryPreference {
  category: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  enabled: boolean
  channels: {
    email: boolean
    sms: boolean
    push: boolean
    inApp: boolean
    slack: boolean
    teams: boolean
  }
}

const defaultCategories: Omit<CategoryPreference, 'enabled' | 'channels'>[] = [
  {
    category: 'costAlerts',
    label: 'Cost Alerts',
    description: 'Notifications about spending thresholds and cost increases',
    icon: DollarSign
  },
  {
    category: 'usageAlerts',
    label: 'Usage Alerts',
    description: 'Notifications about token usage and API limits',
    icon: TrendingUp
  },
  {
    category: 'systemAlerts',
    label: 'System Alerts',
    description: 'System status, errors, and maintenance notifications',
    icon: AlertTriangle
  },
  {
    category: 'teamAlerts',
    label: 'Team Alerts',
    description: 'Team member activities and permission changes',
    icon: Users
  },
  {
    category: 'reports',
    label: 'Reports',
    description: 'Daily, weekly, and monthly usage reports',
    icon: FileText
  },
  {
    category: 'recommendations',
    label: 'Recommendations',
    description: 'AI-powered cost optimization and usage recommendations',
    icon: Settings2
  }
]

const channelIcons = {
  email: Mail,
  sms: Smartphone,
  push: Bell,
  inApp: Bell,
  slack: MessageSquare,
  teams: MessageSquare
}

const channelLabels = {
  email: 'Email',
  sms: 'SMS',
  push: 'Push',
  inApp: 'In-App',
  slack: 'Slack',
  teams: 'Teams'
}

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
  { value: 'UTC', label: 'UTC' }
]

export function NotificationPreferences({
  userId,
  onSave,
  className
}: NotificationPreferencesProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  const [preferences, setPreferences] = useState<NotificationPreferencesType>({
    userId,
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    inAppEnabled: true,
    slackEnabled: false,
    teamsEnabled: false,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    timezone: 'America/New_York',
    weekendQuiet: false,
    batchEmails: true,
    batchFrequency: 'daily',
    preferredChannel: 'EMAIL',
    costAlerts: true,
    usageAlerts: true,
    systemAlerts: true,
    teamAlerts: true,
    reports: true,
    recommendations: true,
    autoEscalate: false,
    escalateAfterMinutes: 60
  })

  const [categories, setCategories] = useState<CategoryPreference[]>(
    defaultCategories.map(cat => ({
      ...cat,
      enabled: true,
      channels: {
        email: true,
        sms: false,
        push: true,
        inApp: true,
        slack: false,
        teams: false
      }
    }))
  )

  // Load preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/notifications/preferences')
        
        if (response.ok) {
          const data = await response.json()
          setPreferences(prev => ({ ...prev, ...data }))
          
          // Update categories based on loaded preferences
          setCategories(prev => prev.map(cat => ({
            ...cat,
            enabled: data[cat.category] ?? cat.enabled,
            channels: {
              email: data.emailEnabled && data[cat.category],
              sms: data.smsEnabled && data[cat.category],
              push: data.pushEnabled && data[cat.category],
              inApp: data.inAppEnabled && data[cat.category],
              slack: data.slackEnabled && data[cat.category],
              teams: data.teamsEnabled && data[cat.category]
            }
          })))
        }
      } catch (err) {
        setError('Failed to load preferences')
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [])

  // Update preferences
  const updatePreference = (key: keyof NotificationPreferencesType, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  // Update category
  const updateCategory = (categoryId: string, updates: Partial<CategoryPreference>) => {
    setCategories(prev => prev.map(cat => 
      cat.category === categoryId ? { ...cat, ...updates } : cat
    ))
    
    if (updates.enabled !== undefined) {
      updatePreference(categoryId as keyof NotificationPreferencesType, updates.enabled)
    }
    
    setHasChanges(true)
  }

  // Update category channel
  const updateCategoryChannel = (categoryId: string, channel: keyof CategoryPreference['channels'], enabled: boolean) => {
    setCategories(prev => prev.map(cat => 
      cat.category === categoryId 
        ? { 
            ...cat, 
            channels: { ...cat.channels, [channel]: enabled }
          } 
        : cat
    ))
    setHasChanges(true)
  }

  // Save preferences
  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      })
      
      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }
      
      setHasChanges(false)
      onSave?.(preferences)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  // Export preferences
  const exportPreferences = () => {
    const dataStr = JSON.stringify(preferences, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'notification-preferences.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Import preferences
  const importPreferences = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        setPreferences(prev => ({ ...prev, ...imported }))
        setHasChanges(true)
      } catch (err) {
        setError('Invalid preferences file')
      }
    }
    reader.readAsText(file)
  }

  // Reset to defaults
  const resetToDefaults = () => {
    setPreferences({
      userId,
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      inAppEnabled: true,
      slackEnabled: false,
      teamsEnabled: false,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      timezone: 'America/New_York',
      weekendQuiet: false,
      batchEmails: true,
      batchFrequency: 'daily',
      preferredChannel: 'EMAIL',
      costAlerts: true,
      usageAlerts: true,
      systemAlerts: true,
      teamAlerts: true,
      reports: true,
      recommendations: true,
      autoEscalate: false,
      escalateAfterMinutes: 60
    })
    
    setCategories(defaultCategories.map(cat => ({
      ...cat,
      enabled: true,
      channels: {
        email: true,
        sms: false,
        push: true,
        inApp: true,
        slack: false,
        teams: false
      }
    })))
    
    setHasChanges(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading preferences...
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Preferences</h2>
          <p className="text-muted-foreground">
            Customize how and when you receive notifications
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportPreferences}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <input
            type="file"
            accept=".json"
            onChange={importPreferences}
            className="hidden"
            id="import-preferences"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('import-preferences')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          
          <Button 
            onClick={handleSave} 
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Alert>
          <Settings2 className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Click "Save Changes" to apply your preferences.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Categories</CardTitle>
              <CardDescription>
                Choose which types of notifications you want to receive and through which channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {categories.map((category) => {
                const IconComponent = category.icon
                
                return (
                  <div key={category.category} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{category.label}</h4>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                      
                      <Switch
                        checked={category.enabled}
                        onCheckedChange={(enabled) => updateCategory(category.category, { enabled })}
                      />
                    </div>
                    
                    {category.enabled && (
                      <div className="ml-8 space-y-3">
                        <h5 className="text-sm font-medium text-muted-foreground">Delivery channels:</h5>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(category.channels).map(([channel, enabled]) => {
                            const ChannelIcon = channelIcons[channel as keyof typeof channelIcons]
                            const channelEnabled = preferences[`${channel}Enabled` as keyof NotificationPreferencesType] as boolean
                            
                            return (
                              <div
                                key={channel}
                                className={cn(
                                  'flex items-center gap-2 p-2 border rounded',
                                  !channelEnabled && 'opacity-50'
                                )}
                              >
                                <Switch
                                  checked={enabled && channelEnabled}
                                  onCheckedChange={(checked) => updateCategoryChannel(category.category, channel as keyof CategoryPreference['channels'], checked)}
                                  disabled={!channelEnabled}
                                />
                                <ChannelIcon className="h-4 w-4" />
                                <span className="text-sm">{channelLabels[channel as keyof typeof channelLabels]}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>
                Enable or disable notification channels globally
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(channelIcons).map(([channel, Icon]) => {
                const enabledKey = `${channel}Enabled` as keyof NotificationPreferencesType
                
                return (
                  <div key={channel} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <div>
                        <h4 className="font-medium capitalize">{channelLabels[channel as keyof typeof channelLabels]}</h4>
                        <p className="text-sm text-muted-foreground">
                          {channel === 'email' && 'Receive notifications via email'}
                          {channel === 'sms' && 'Receive notifications via SMS'}
                          {channel === 'push' && 'Receive browser push notifications'}
                          {channel === 'inApp' && 'Show notifications in the application'}
                          {channel === 'slack' && 'Send notifications to Slack'}
                          {channel === 'teams' && 'Send notifications to Microsoft Teams'}
                        </p>
                      </div>
                    </div>
                    
                    <Switch
                      checked={preferences[enabledKey] as boolean}
                      onCheckedChange={(enabled) => updatePreference(enabledKey, enabled)}
                    />
                  </div>
                )
              })}
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="preferred-channel">Preferred Channel</Label>
                <select
                  id="preferred-channel"
                  className="w-full p-2 border rounded"
                  value={preferences.preferredChannel}
                  onChange={(e) => updatePreference('preferredChannel', e.target.value as ChannelType)}
                >
                  <option value="EMAIL">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="PUSH">Push</option>
                  <option value="IN_APP">In-App</option>
                  <option value="SLACK">Slack</option>
                  <option value="WEBHOOK">Webhook</option>
                </select>
                <p className="text-sm text-muted-foreground">
                  Primary channel for important notifications
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Quiet Hours
              </CardTitle>
              <CardDescription>
                Set times when you don't want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="quiet-hours">Enable quiet hours</Label>
                <Switch
                  id="quiet-hours"
                  checked={preferences.quietHoursEnabled}
                  onCheckedChange={(enabled) => updatePreference('quietHoursEnabled', enabled)}
                />
              </div>
              
              {preferences.quietHoursEnabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quiet-start">Start time</Label>
                      <Input
                        id="quiet-start"
                        type="time"
                        value={preferences.quietHoursStart || '22:00'}
                        onChange={(e) => updatePreference('quietHoursStart', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quiet-end">End time</Label>
                      <Input
                        id="quiet-end"
                        type="time"
                        value={preferences.quietHoursEnd || '08:00'}
                        onChange={(e) => updatePreference('quietHoursEnd', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="weekend-quiet">Weekend quiet mode</Label>
                    <Switch
                      id="weekend-quiet"
                      checked={preferences.weekendQuiet}
                      onCheckedChange={(enabled) => updatePreference('weekendQuiet', enabled)}
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  className="w-full p-2 border rounded"
                  value={preferences.timezone}
                  onChange={(e) => updatePreference('timezone', e.target.value)}
                >
                  {timezones.map(tz => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Batching
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="batch-emails">Batch email notifications</Label>
                <Switch
                  id="batch-emails"
                  checked={preferences.batchEmails}
                  onCheckedChange={(enabled) => updatePreference('batchEmails', enabled)}
                />
              </div>
              
              {preferences.batchEmails && (
                <div className="space-y-2">
                  <Label htmlFor="batch-frequency">Batch frequency</Label>
                  <select
                    id="batch-frequency"
                    className="w-full p-2 border rounded"
                    value={preferences.batchFrequency}
                    onChange={(e) => updatePreference('batchFrequency', e.target.value)}
                  >
                    <option value="immediate">Immediate</option>
                    <option value="hourly">Hourly digest</option>
                    <option value="daily">Daily digest</option>
                  </select>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Escalation
              </CardTitle>
              <CardDescription>
                Automatically escalate critical notifications if not acknowledged
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-escalate">Enable auto-escalation</Label>
                <Switch
                  id="auto-escalate"
                  checked={preferences.autoEscalate}
                  onCheckedChange={(enabled) => updatePreference('autoEscalate', enabled)}
                />
              </div>
              
              {preferences.autoEscalate && (
                <div className="space-y-2">
                  <Label htmlFor="escalate-after">Escalate after (minutes)</Label>
                  <Input
                    id="escalate-after"
                    type="number"
                    min="5"
                    max="1440"
                    value={preferences.escalateAfterMinutes}
                    onChange={(e) => updatePreference('escalateAfterMinutes', parseInt(e.target.value) || 60)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Send escalated notification if original is not acknowledged within this time
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Summary</CardTitle>
              <CardDescription>
                Current notification configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Enabled Channels</h4>
                  <div className="space-y-1">
                    {Object.entries(channelLabels).map(([channel, label]) => {
                      const enabledKey = `${channel}Enabled` as keyof NotificationPreferencesType
                      return (
                        <div key={channel} className="flex items-center gap-2">
                          {preferences[enabledKey] ? (
                            <Badge variant="default" className="text-xs">{label}</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs opacity-50">{label}</Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Enabled Categories</h4>
                  <div className="space-y-1">
                    {categories.map(cat => (
                      <div key={cat.category} className="flex items-center gap-2">
                        {cat.enabled ? (
                          <Badge variant="default" className="text-xs">{cat.label}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs opacity-50">{cat.label}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default NotificationPreferences