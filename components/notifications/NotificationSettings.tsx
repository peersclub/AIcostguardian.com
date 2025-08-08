'use client'

import React, { useState, useEffect } from 'react'
import { 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Webhook,
  Send,
  TestTube,
  CheckCircle,
  XCircle,
  Clock,
  Moon,
  Calendar,
  Settings2,
  AlertTriangle,
  Loader2,
  Eye,
  Download,
  Upload,
  Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import type { NotificationChannelConfig } from '@/lib/notifications/types'

interface DeliveryLog {
  id: string
  channel: string
  destination: string
  status: 'success' | 'failed' | 'pending'
  messageId?: string
  error?: string
  sentAt: Date
  latency?: number
}

interface NotificationSettingsProps {
  userId: string
  organizationId: string
  onSave?: (settings: any) => void
  className?: string
}

interface ChannelConfig {
  type: 'email' | 'slack' | 'sms' | 'webhook'
  enabled: boolean
  destination: string
  config: Record<string, any>
  testStatus?: 'idle' | 'testing' | 'success' | 'failed'
  testError?: string
}

const channelIcons = {
  email: Mail,
  slack: MessageSquare,
  sms: Smartphone,
  webhook: Webhook
} as const

const timezones = [
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'America/Denver',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'UTC'
]

export function NotificationSettings({
  userId,
  organizationId,
  onSave,
  className
}: NotificationSettingsProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [channels, setChannels] = useState<ChannelConfig[]>([
    { type: 'email', enabled: true, destination: '', config: {} },
    { type: 'slack', enabled: false, destination: '', config: {} },
    { type: 'sms', enabled: false, destination: '', config: {} },
    { type: 'webhook', enabled: false, destination: '', config: {} }
  ])
  
  const [preferences, setPreferences] = useState({
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    timezone: 'America/New_York',
    weekendQuiet: false,
    batchEmails: true,
    batchFrequency: 'daily' as 'immediate' | 'hourly' | 'daily',
    autoEscalate: false,
    escalateAfterMinutes: 60
  })
  
  const [templates, setTemplates] = useState({
    emailSubject: 'AI Cost Alert: {{title}}',
    emailBody: 'Hello {{user.name}},\n\n{{message}}\n\nBest regards,\nAI Cost Guardian',
    slackMessage: ':warning: *{{title}}*\n{{message}}',
    webhookPayload: '{"title": "{{title}}", "message": "{{message}}", "priority": "{{priority}}"}'
  })
  
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        
        const [prefsResponse, channelsResponse, logsResponse] = await Promise.all([
          fetch('/api/notifications/preferences'),
          fetch('/api/notifications/channels'),
          fetch('/api/notifications/logs?limit=10')
        ])
        
        if (prefsResponse.ok) {
          const prefs = await prefsResponse.json()
          setPreferences(prev => ({ ...prev, ...prefs }))
        }
        
        if (channelsResponse.ok) {
          const channelData = await channelsResponse.json()
          setChannels(channelData)
        }
        
        if (logsResponse.ok) {
          const logs = await logsResponse.json()
          setDeliveryLogs(logs)
        }
        
      } catch (err) {
        setError('Failed to load notification settings')
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Save settings
  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences,
          channels: channels.map(({ testStatus, testError, ...channel }) => channel),
          templates
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save settings')
      }
      
      onSave?.(await response.json())
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  // Test channel
  const testChannel = async (channelType: string) => {
    const channelIndex = channels.findIndex(c => c.type === channelType)
    if (channelIndex === -1) return

    setChannels(prev => prev.map((c, i) => 
      i === channelIndex 
        ? { ...c, testStatus: 'testing', testError: undefined }
        : c
    ))

    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: channels[channelIndex],
          message: {
            title: 'Test Notification',
            message: 'This is a test notification from AI Cost Guardian.',
            priority: 'MEDIUM'
          }
        })
      })

      const result = await response.json()
      
      setChannels(prev => prev.map((c, i) => 
        i === channelIndex 
          ? { 
              ...c, 
              testStatus: result.success ? 'success' : 'failed',
              testError: result.error
            }
          : c
      ))

    } catch (err) {
      setChannels(prev => prev.map((c, i) => 
        i === channelIndex 
          ? { 
              ...c, 
              testStatus: 'failed',
              testError: err instanceof Error ? err.message : 'Test failed'
            }
          : c
      ))
    }
  }

  // Update channel
  const updateChannel = (type: string, updates: Partial<ChannelConfig>) => {
    setChannels(prev => prev.map(c => 
      c.type === type ? { ...c, ...updates } : c
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading settings...
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
          <h2 className="text-2xl font-bold">Notification Settings</h2>
          <p className="text-muted-foreground">Configure how you receive notifications</p>
        </div>
        
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>

      <Tabs defaultValue="channels" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Delivery Logs</TabsTrigger>
        </TabsList>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-4">
          {channels.map((channel) => {
            const Icon = channelIcons[channel.type]
            
            return (
              <Card key={channel.type}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <div>
                        <CardTitle className="capitalize">{channel.type}</CardTitle>
                        <CardDescription>
                          {channel.type === 'email' && 'Send notifications to your email address'}
                          {channel.type === 'slack' && 'Post notifications to Slack channels'}
                          {channel.type === 'sms' && 'Send SMS notifications to your phone'}
                          {channel.type === 'webhook' && 'Send notifications to custom webhook endpoints'}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {channel.testStatus && (
                        <Badge 
                          variant={channel.testStatus === 'success' ? 'default' : 
                                 channel.testStatus === 'failed' ? 'destructive' : 'secondary'}
                        >
                          {channel.testStatus === 'testing' && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                          {channel.testStatus === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {channel.testStatus === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                          {channel.testStatus}
                        </Badge>
                      )}
                      
                      <Switch
                        checked={channel.enabled}
                        onCheckedChange={(enabled) => updateChannel(channel.type, { enabled })}
                      />
                    </div>
                  </div>
                </CardHeader>
                
                {channel.enabled && (
                  <CardContent className="space-y-4">
                    {/* Email Configuration */}
                    {channel.type === 'email' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor={`${channel.type}-destination`}>Email Address</Label>
                          <Input
                            id={`${channel.type}-destination`}
                            type="email"
                            placeholder="your-email@example.com"
                            value={channel.destination}
                            onChange={(e) => updateChannel(channel.type, { destination: e.target.value })}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Provider</Label>
                            <select className="w-full p-2 border rounded" defaultValue="sendgrid">
                              <option value="sendgrid">SendGrid</option>
                              <option value="ses">AWS SES</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Format</Label>
                            <select className="w-full p-2 border rounded" defaultValue="html">
                              <option value="html">HTML</option>
                              <option value="text">Plain Text</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Slack Configuration */}
                    {channel.type === 'slack' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor={`${channel.type}-destination`}>Channel or User</Label>
                          <Input
                            id={`${channel.type}-destination`}
                            placeholder="#general or @username"
                            value={channel.destination}
                            onChange={(e) => updateChannel(channel.type, { destination: e.target.value })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`${channel.type}-token`}>Bot Token</Label>
                          <Input
                            id={`${channel.type}-token`}
                            type="password"
                            placeholder="xoxb-your-bot-token"
                            value={channel.config.botToken || ''}
                            onChange={(e) => updateChannel(channel.type, { 
                              config: { ...channel.config, botToken: e.target.value }
                            })}
                          />
                        </div>
                      </>
                    )}

                    {/* SMS Configuration */}
                    {channel.type === 'sms' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor={`${channel.type}-destination`}>Phone Number</Label>
                          <Input
                            id={`${channel.type}-destination`}
                            placeholder="+1234567890"
                            value={channel.destination}
                            onChange={(e) => updateChannel(channel.type, { destination: e.target.value })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Provider</Label>
                          <select className="w-full p-2 border rounded" defaultValue="twilio">
                            <option value="twilio">Twilio</option>
                            <option value="aws-sns">AWS SNS</option>
                          </select>
                        </div>
                      </>
                    )}

                    {/* Webhook Configuration */}
                    {channel.type === 'webhook' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor={`${channel.type}-destination`}>Webhook URL</Label>
                          <Input
                            id={`${channel.type}-destination`}
                            type="url"
                            placeholder="https://your-webhook.com/notifications"
                            value={channel.destination}
                            onChange={(e) => updateChannel(channel.type, { destination: e.target.value })}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Method</Label>
                            <select className="w-full p-2 border rounded" defaultValue="POST">
                              <option value="POST">POST</option>
                              <option value="PUT">PUT</option>
                              <option value="PATCH">PATCH</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Authentication</Label>
                            <select className="w-full p-2 border rounded" defaultValue="none">
                              <option value="none">None</option>
                              <option value="bearer">Bearer Token</option>
                              <option value="basic">Basic Auth</option>
                              <option value="apikey">API Key</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Test Button */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testChannel(channel.type)}
                        disabled={!channel.destination || channel.testStatus === 'testing'}
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Channel
                      </Button>
                      
                      {channel.testError && (
                        <span className="text-xs text-red-600">{channel.testError}</span>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
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
                  onCheckedChange={(quietHoursEnabled) => 
                    setPreferences(prev => ({ ...prev, quietHoursEnabled }))
                  }
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
                        value={preferences.quietHoursStart}
                        onChange={(e) => setPreferences(prev => ({ 
                          ...prev, 
                          quietHoursStart: e.target.value 
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quiet-end">End time</Label>
                      <Input
                        id="quiet-end"
                        type="time"
                        value={preferences.quietHoursEnd}
                        onChange={(e) => setPreferences(prev => ({ 
                          ...prev, 
                          quietHoursEnd: e.target.value 
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select 
                      id="timezone"
                      className="w-full p-2 border rounded"
                      value={preferences.timezone}
                      onChange={(e) => setPreferences(prev => ({ 
                        ...prev, 
                        timezone: e.target.value 
                      }))}
                    >
                      {timezones.map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="weekend-quiet">Weekend quiet mode</Label>
                    <Switch
                      id="weekend-quiet"
                      checked={preferences.weekendQuiet}
                      onCheckedChange={(weekendQuiet) => 
                        setPreferences(prev => ({ ...prev, weekendQuiet }))
                      }
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="batch-emails">Batch email notifications</Label>
                <Switch
                  id="batch-emails"
                  checked={preferences.batchEmails}
                  onCheckedChange={(batchEmails) => 
                    setPreferences(prev => ({ ...prev, batchEmails }))
                  }
                />
              </div>
              
              {preferences.batchEmails && (
                <div className="space-y-2">
                  <Label htmlFor="batch-frequency">Batch frequency</Label>
                  <select 
                    id="batch-frequency"
                    className="w-full p-2 border rounded"
                    value={preferences.batchFrequency}
                    onChange={(e) => setPreferences(prev => ({ 
                      ...prev, 
                      batchFrequency: e.target.value as any
                    }))}
                  >
                    <option value="immediate">Immediate</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
              )}
            </CardContent>
          </Card>

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
                  onCheckedChange={(autoEscalate) => 
                    setPreferences(prev => ({ ...prev, autoEscalate }))
                  }
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
                    onChange={(e) => setPreferences(prev => ({ 
                      ...prev, 
                      escalateAfterMinutes: parseInt(e.target.value) || 60
                    }))}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>
                Customize notification message templates. Use variables like {'{{title}}'}, {'{{message}}'}, {'{{user.name}}'}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email-subject">Email Subject</Label>
                <Input
                  id="email-subject"
                  value={templates.emailSubject}
                  onChange={(e) => setTemplates(prev => ({ 
                    ...prev, 
                    emailSubject: e.target.value 
                  }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email-body">Email Body</Label>
                <Textarea
                  id="email-body"
                  rows={4}
                  value={templates.emailBody}
                  onChange={(e) => setTemplates(prev => ({ 
                    ...prev, 
                    emailBody: e.target.value 
                  }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slack-message">Slack Message</Label>
                <Textarea
                  id="slack-message"
                  rows={3}
                  value={templates.slackMessage}
                  onChange={(e) => setTemplates(prev => ({ 
                    ...prev, 
                    slackMessage: e.target.value 
                  }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhook-payload">Webhook JSON Payload</Label>
                <Textarea
                  id="webhook-payload"
                  rows={3}
                  value={templates.webhookPayload}
                  onChange={(e) => setTemplates(prev => ({ 
                    ...prev, 
                    webhookPayload: e.target.value 
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Delivery Logs</CardTitle>
                  <CardDescription>Recent notification delivery attempts</CardDescription>
                </div>
                
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deliveryLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No delivery logs yet
                  </p>
                ) : (
                  deliveryLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={log.status === 'success' ? 'default' : 
                                 log.status === 'failed' ? 'destructive' : 'secondary'}
                        >
                          {log.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {log.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                          {log.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {log.status}
                        </Badge>
                        
                        <div>
                          <p className="text-sm font-medium capitalize">{log.channel}</p>
                          <p className="text-xs text-muted-foreground">{log.destination}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {log.sentAt.toLocaleString()}
                        </p>
                        {log.latency && (
                          <p className="text-xs text-muted-foreground">
                            {log.latency}ms
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default NotificationSettings