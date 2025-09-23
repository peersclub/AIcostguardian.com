'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Check, X, Loader2, ArrowRight, Shield, Zap, Link2, Settings, Key,
  AlertCircle, Activity, CheckCircle, Globe, ExternalLink, Copy,
  MessageSquare, Bell, Users, TrendingUp, Webhook, Bot,
  ChevronRight, Info, Download, Upload, Eye, EyeOff
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'

export const dynamic = 'force-dynamic'

interface SlackConfig {
  botToken?: string
  webhookUrl?: string
  appId?: string
  clientId?: string
  clientSecret?: string
  signingSecret?: string
  appToken?: string
  defaultChannel?: string
  workspace?: string
  enabled: boolean
}

interface NotificationSettings {
  costAlerts: boolean
  memberActivations: boolean
  highUsage: boolean
  weeklyReports: boolean
  systemUpdates: boolean
  customEvents: boolean
}

export default function SlackIntegrationPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [config, setConfig] = useState<SlackConfig>({
    enabled: false
  })
  const [notifications, setNotifications] = useState<NotificationSettings>({
    costAlerts: true,
    memberActivations: true,
    highUsage: true,
    weeklyReports: true,
    systemUpdates: true,
    customEvents: true
  })
  const [activeTab, setActiveTab] = useState('setup')
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [session])

  // Track changes to config and notifications
  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [config, notifications])

  // Reset unsaved changes after successful save
  const markAsSaved = () => {
    setHasUnsavedChanges(false)
  }

  const loadConfig = async () => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/integrations/slack')
      if (response.ok) {
        const data = await response.json()
        setConfig(data.config || { enabled: false })
        setNotifications(data.notifications || {
          costAlerts: true,
          memberActivations: true,
          highUsage: true,
          weeklyReports: true,
          systemUpdates: true,
          customEvents: true
        })
        setHasUnsavedChanges(false)
      }
    } catch (error) {
      console.error('Failed to load Slack config:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    if (!session?.user?.id) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to save your Slack configuration.',
        variant: 'destructive'
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/integrations/slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, notifications })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: '✅ Configuration saved',
          description: 'Your Slack integration settings have been saved successfully.',
        })

        // Reload configuration to ensure UI is in sync
        await loadConfig()
        markAsSaved()
      } else {
        toast({
          title: '❌ Save failed',
          description: data.error || 'Failed to save Slack configuration. Please try again.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to save config:', error)
      toast({
        title: '❌ Save error',
        description: 'An error occurred while saving your configuration. Please check your connection and try again.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async (type: 'webhook' | 'bot') => {
    setTesting(true)
    try {
      const response = await fetch('/api/integrations/slack/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, config })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: `✅ ${type === 'webhook' ? 'Webhook' : 'Bot'} test successful!`,
          description: `Test notification sent successfully. Check your Slack workspace for the message.`,
        })
      } else {
        toast({
          title: `❌ ${type === 'webhook' ? 'Webhook' : 'Bot'} test failed`,
          description: result.error || 'The test failed. Please check your configuration and try again.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: '❌ Test error',
        description: `Failed to test ${type} connection: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      })
    } finally {
      setTesting(false)
    }
  }

  const toggleSecret = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Could add toast notification here
  }

  const redirectUrls = [
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback/slack`,
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/slack/oauth`,
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/integrations/slack/callback`
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="mb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 px-4 py-2">
              <MessageSquare className="w-4 h-4 mr-2 inline" />
              Slack Integration
            </Badge>
            <h1 className="text-5xl font-bold text-white mb-6">
              Connect AI Cost Guardian to Slack
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get real-time notifications about AI costs, usage alerts, and team activities directly in your Slack workspace
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16 bg-black">
        <div className="max-w-5xl mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-gray-900/50 backdrop-blur-xl border border-gray-700">
              <TabsTrigger value="setup" className="data-[state=active]:bg-purple-600">
                <Bot className="w-4 h-4 mr-2" />
                Setup
              </TabsTrigger>
              <TabsTrigger value="webhook" className="data-[state=active]:bg-purple-600">
                <Webhook className="w-4 h-4 mr-2" />
                Webhook
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-purple-600">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="test" className="data-[state=active]:bg-purple-600">
                <Activity className="w-4 h-4 mr-2" />
                Test & Monitor
              </TabsTrigger>
            </TabsList>

            {/* Setup Tab */}
            <TabsContent value="setup" className="mt-8">
              <div className="grid gap-8">
                {/* Quick Setup Options */}
                <Card className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      Choose Your Integration Method
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Select the integration approach that best fits your needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Webhook Option (Recommended) */}
                    <div className="border border-green-500/30 bg-green-500/5 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <Webhook className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-white">Webhook Integration</h3>
                            <Badge className="bg-green-500 text-white text-xs">Recommended</Badge>
                          </div>
                          <p className="text-gray-300 mb-4">
                            Fastest setup - works immediately. Perfect for notifications and alerts.
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className="bg-gray-800 text-green-400 border border-green-500/30">
                              ✓ 30-second setup
                            </Badge>
                            <Badge className="bg-gray-800 text-green-400 border border-green-500/30">
                              ✓ Rich notifications
                            </Badge>
                            <Badge className="bg-gray-800 text-green-400 border border-green-500/30">
                              ✓ No app approval needed
                            </Badge>
                          </div>
                          <Button
                            onClick={() => setActiveTab('webhook')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Set Up Webhook
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Bot Integration Option */}
                    <div className="border border-blue-500/30 bg-blue-500/5 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <Bot className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-white">Full Bot Integration</h3>
                            <Badge className="bg-blue-500 text-white text-xs">Advanced</Badge>
                          </div>
                          <p className="text-gray-300 mb-4">
                            Complete Slack app with interactive features, slash commands, and advanced permissions.
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className="bg-gray-800 text-blue-400 border border-blue-500/30">
                              ✓ Interactive messages
                            </Badge>
                            <Badge className="bg-gray-800 text-blue-400 border border-blue-500/30">
                              ✓ Slash commands
                            </Badge>
                            <Badge className="bg-gray-800 text-blue-400 border border-blue-500/30">
                              ✓ User mentions
                            </Badge>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                            >
                              Manual Setup Guide
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                            <Button
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              disabled
                            >
                              OAuth Setup (Coming Soon)
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Manual Bot Setup Guide */}
                <Card className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-gray-400" />
                      Manual Bot Configuration
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Follow these steps to create and configure your Slack app manually
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Step-by-step guide */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          1
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-2">Create Slack App</h4>
                          <p className="text-gray-300 text-sm mb-3">
                            Go to Slack API console and create a new app from scratch
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                            onClick={() => window.open('https://api.slack.com/apps/new', '_blank')}
                          >
                            Create App
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          2
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-2">Configure OAuth & Permissions</h4>
                          <p className="text-gray-300 text-sm mb-3">
                            Add redirect URLs and required bot token scopes
                          </p>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-gray-400 text-xs">Redirect URLs:</Label>
                              {redirectUrls.map((url, i) => (
                                <div key={i} className="flex items-center gap-2 mt-1">
                                  <code className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded flex-1">
                                    {url}
                                  </code>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(url)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <div>
                              <Label className="text-gray-400 text-xs">Required Scopes:</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {['chat:write', 'chat:write.public', 'channels:read'].map(scope => (
                                  <code key={scope} className="text-xs bg-gray-800 text-blue-400 px-2 py-1 rounded">
                                    {scope}
                                  </code>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          3
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-2">Install App & Get Tokens</h4>
                          <p className="text-gray-300 text-sm mb-3">
                            Install the app to your workspace and copy the Bot User OAuth Token
                          </p>
                          <div className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
                            Look for: <code>xoxb-...</code> (not xapp- or xoxp-)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Configuration Form */}
                    <div className="border-t border-gray-700 pt-6">
                      <h4 className="font-medium text-white mb-4">Enter Your Configuration</h4>
                      <div className="grid gap-4">
                        <div>
                          <Label className="text-gray-300">Bot User OAuth Token *</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              type={showSecrets.botToken ? 'text' : 'password'}
                              placeholder="xoxb-..."
                              value={config.botToken || ''}
                              onChange={(e) => setConfig(prev => ({ ...prev, botToken: e.target.value }))}
                              className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleSecret('botToken')}
                              className="border-gray-600"
                            >
                              {showSecrets.botToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-300">App ID</Label>
                            <Input
                              placeholder="A09A81C7KQU"
                              value={config.appId || ''}
                              onChange={(e) => setConfig(prev => ({ ...prev, appId: e.target.value }))}
                              className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20 mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300">Client ID</Label>
                            <Input
                              placeholder="1234567890.1234567890"
                              value={config.clientId || ''}
                              onChange={(e) => setConfig(prev => ({ ...prev, clientId: e.target.value }))}
                              className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20 mt-1"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-300">Client Secret</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                type={showSecrets.clientSecret ? 'text' : 'password'}
                                placeholder="abc123..."
                                value={config.clientSecret || ''}
                                onChange={(e) => setConfig(prev => ({ ...prev, clientSecret: e.target.value }))}
                                className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleSecret('clientSecret')}
                                className="border-gray-600"
                              >
                                {showSecrets.clientSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-gray-300">Signing Secret</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                type={showSecrets.signingSecret ? 'text' : 'password'}
                                placeholder="abc123..."
                                value={config.signingSecret || ''}
                                onChange={(e) => setConfig(prev => ({ ...prev, signingSecret: e.target.value }))}
                                className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleSecret('signingSecret')}
                                className="border-gray-600"
                              >
                                {showSecrets.signingSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-300">Default Channel</Label>
                            <Input
                              placeholder="#ai-cost-guardian"
                              value={config.defaultChannel || ''}
                              onChange={(e) => setConfig(prev => ({ ...prev, defaultChannel: e.target.value }))}
                              className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20 mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300">Workspace Name</Label>
                            <Input
                              placeholder="AiCostGuardian"
                              value={config.workspace || ''}
                              onChange={(e) => setConfig(prev => ({ ...prev, workspace: e.target.value }))}
                              className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20 mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Webhook Tab */}
            <TabsContent value="webhook" className="mt-8">
              <Card className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Webhook className="w-5 h-5 text-green-400" />
                    Webhook Integration Setup
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    The fastest way to get Slack notifications working in under 60 seconds
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quick Setup Steps */}
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                    <h3 className="font-semibold text-green-400 mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Quick Setup (3 steps)
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                        <span className="text-gray-300">Create a Slack webhook URL</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('https://api.slack.com/messaging/webhooks', '_blank')}
                          className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                        >
                          Create Webhook
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                        <span className="text-gray-300">Paste the webhook URL below</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                        <span className="text-gray-300">Test and start receiving notifications!</span>
                      </div>
                    </div>
                  </div>

                  {/* Webhook URL Input */}
                  <div>
                    <Label className="text-gray-300 font-medium">Slack Webhook URL *</Label>
                    <p className="text-gray-400 text-sm mt-1 mb-3">
                      Should start with: <code className="bg-gray-800 px-1 rounded text-xs">https://hooks.slack.com/services/...</code>
                    </p>
                    <Input
                      placeholder="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
                      value={config.webhookUrl || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                      className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500/20"
                    />
                  </div>

                  {/* Test Button */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => testConnection('webhook')}
                      disabled={!config.webhookUrl || testing}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {testing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Test Webhook
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={saveConfig}
                      disabled={saving}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Configuration'
                      )}
                    </Button>
                  </div>

                  {/* Webhook Info */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      What you'll get with Webhooks
                    </h4>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        Rich, formatted notifications with Block Kit
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        Cost alerts, usage warnings, and weekly reports
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        Team member activation notifications
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        System health and update alerts
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        Works immediately - no app approval needed
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-8">
              <Card className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-400" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure which events trigger Slack notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Master Enable Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-white">Enable Slack Notifications</h3>
                      <p className="text-gray-400 text-sm">Master switch for all Slack notifications</p>
                    </div>
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
                    />
                  </div>

                  {config.enabled && (
                    <div className="space-y-4">
                      {/* Cost & Usage Notifications */}
                      <div className="border border-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-yellow-400" />
                          Cost & Usage Alerts
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-gray-300">Cost Threshold Alerts</span>
                              <p className="text-gray-400 text-xs">When spending approaches or exceeds limits</p>
                            </div>
                            <Switch
                              checked={notifications.costAlerts}
                              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, costAlerts: checked }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-gray-300">High Usage Warnings</span>
                              <p className="text-gray-400 text-xs">When users consume unusually high tokens</p>
                            </div>
                            <Switch
                              checked={notifications.highUsage}
                              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, highUsage: checked }))}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Team Notifications */}
                      <div className="border border-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-400" />
                          Team Activities
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-gray-300">Member Activations</span>
                              <p className="text-gray-400 text-xs">When team members join or activate accounts</p>
                            </div>
                            <Switch
                              checked={notifications.memberActivations}
                              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, memberActivations: checked }))}
                            />
                          </div>
                        </div>
                      </div>

                      {/* System Notifications */}
                      <div className="border border-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-green-400" />
                          System Updates
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-gray-300">Weekly Reports</span>
                              <p className="text-gray-400 text-xs">Weekly cost summaries and insights</p>
                            </div>
                            <Switch
                              checked={notifications.weeklyReports}
                              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReports: checked }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-gray-300">System Updates</span>
                              <p className="text-gray-400 text-xs">Platform updates and maintenance notifications</p>
                            </div>
                            <Switch
                              checked={notifications.systemUpdates}
                              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, systemUpdates: checked }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-gray-300">Custom Events</span>
                              <p className="text-gray-400 text-xs">Special announcements and custom alerts</p>
                            </div>
                            <Switch
                              checked={notifications.customEvents}
                              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, customEvents: checked }))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={saveConfig}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Notification Settings'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Test & Monitor Tab */}
            <TabsContent value="test" className="mt-8">
              <div className="grid gap-6">
                {/* Test Notifications */}
                <Card className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-400" />
                      Test Your Integration
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Send test notifications to verify your Slack integration is working
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={() => testConnection('webhook')}
                        disabled={!config.webhookUrl || testing}
                        variant="outline"
                        className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                      >
                        Test Webhook
                      </Button>
                      <Button
                        onClick={() => testConnection('bot')}
                        disabled={!config.botToken || testing}
                        variant="outline"
                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                      >
                        Test Bot
                      </Button>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-400 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Test Message Types
                      </h4>
                      <p className="text-gray-300 text-sm">
                        Test messages will include: Cost alerts, member notifications, high usage warnings,
                        weekly reports, system updates, and custom events. Check your Slack workspace after testing.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Integration Status */}
                <Card className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      Integration Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300">Webhook</span>
                          {config.webhookUrl ? (
                            <Badge className="bg-green-500/20 text-green-400 border border-green-500/50">
                              Configured
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400 border border-gray-500/50">
                              Not Set
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs">
                          {config.webhookUrl ? 'Ready to send notifications' : 'Webhook URL required'}
                        </p>
                      </div>

                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300">Bot Token</span>
                          {config.botToken ? (
                            <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/50">
                              Configured
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400 border border-gray-500/50">
                              Not Set
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs">
                          {config.botToken ? 'Advanced features available' : 'Optional for enhanced features'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}