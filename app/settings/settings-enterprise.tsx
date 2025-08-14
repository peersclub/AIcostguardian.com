'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { 
  Settings, Key, Shield, Users, Bell, Globe, Database,
  Activity, Lock, Unlock, Eye, EyeOff, Plus, Edit2,
  Trash2, Copy, Check, X, AlertTriangle, Info,
  ChevronRight, RefreshCw, Download, Upload, ExternalLink,
  CreditCard, Package, Zap, Brain, Code, Palette,
  Monitor, Smartphone, Mail, MessageSquare, Phone,
  Calendar, Clock, MapPin, Building, User, UserPlus,
  ShieldCheck, ShieldAlert, FileText, BarChart3,
  Layers, Terminal, Workflow, BookOpen, HelpCircle,
  Sun, Moon, ChevronDown, Search, Filter, Save,
  ArrowRight, ArrowLeft, LogOut, Sparkles, Crown,
  CheckCircle, XCircle, AlertCircle, Loader2,
  GitBranch, Github, Twitter, Linkedin, Hash
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'
import { getAIProviderLogo } from '@/components/ui/ai-logos'

interface SettingsSection {
  id: string
  title: string
  description: string
  icon: any
  badge?: string
  badgeColor?: string
}

const settingsSections: SettingsSection[] = [
  {
    id: 'general',
    title: 'General',
    description: 'Basic settings and preferences',
    icon: Settings
  },
  {
    id: 'api-keys',
    title: 'API Keys',
    description: 'Manage AI provider credentials',
    icon: Key,
    badge: 'Required',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Alerts and communication preferences',
    icon: Bell
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Privacy and security settings',
    icon: Shield
  },
  {
    id: 'billing',
    title: 'Billing',
    description: 'Subscription and payment settings',
    icon: CreditCard,
    badge: 'Pro',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  },
  {
    id: 'team',
    title: 'Team',
    description: 'Organization and member management',
    icon: Users,
    badge: 'Enterprise',
    badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Third-party connections',
    icon: Layers
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'Developer and power user settings',
    icon: Terminal
  }
]

export default function EnterpriseSettings() {
  const { data: session } = useSession()
  const [selectedSection, setSelectedSection] = useState('general')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Settings state
  const [settings, setSettings] = useState({
    // General
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    notificationFrequency: 'realtime',
    digestTime: '09:00',
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: 30,
    ipWhitelist: [],
    apiRateLimit: 1000,
    
    // AI Settings
    defaultModel: 'gpt-4o',
    autoOptimize: true,
    streamResponses: true,
    saveHistory: true,
    contextWindow: 8000,
    temperature: 0.7,
    maxTokens: 4000,
    
    // Billing
    billingEmail: session?.user?.email || '',
    invoiceFrequency: 'monthly',
    paymentMethod: 'card',
    spendingLimit: 1000,
    alertThreshold: 80,
    
    // Team
    allowInvites: true,
    defaultRole: 'viewer',
    requireApproval: true,
    maxMembers: 10,
    
    // Advanced
    debugMode: false,
    telemetry: true,
    betaFeatures: false,
    customEndpoint: '',
    webhookUrl: ''
  })
  
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [showAddKeyDialog, setShowAddKeyDialog] = useState(false)
  const [newKey, setNewKey] = useState({ provider: '', key: '', name: '' })
  
  useEffect(() => {
    loadSettings()
    loadApiKeys()
  }, [])
  
  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const loadApiKeys = async () => {
    try {
      const response = await fetch('/api/keys')
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.keys || [])
      }
    } catch (error) {
      console.error('Failed to load API keys:', error)
    }
  }
  
  const saveSettings = async () => {
    try {
      setIsSaving(true)
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        toast.success('Settings saved successfully')
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      toast.error('Failed to save settings')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }
  
  const addApiKey = async () => {
    if (!newKey.provider || !newKey.key) return
    
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKey)
      })
      
      if (response.ok) {
        toast.success('API key added successfully')
        setShowAddKeyDialog(false)
        setNewKey({ provider: '', key: '', name: '' })
        loadApiKeys()
      }
    } catch (error) {
      toast.error('Failed to add API key')
    }
  }
  
  const deleteApiKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/keys/${keyId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('API key deleted')
        loadApiKeys()
      }
    } catch (error) {
      toast.error('Failed to delete API key')
    }
  }
  
  const renderSectionContent = () => {
    switch (selectedSection) {
      case 'general':
        return (
          <div className="space-y-6">
            {/* Appearance */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-indigo-400" />
                  Appearance
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Customize the look and feel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Theme</p>
                    <p className="text-xs text-gray-400">Choose your preferred theme</p>
                  </div>
                  <Select value={settings.theme} onValueChange={(v) => setSettings(s => ({ ...s, theme: v }))}>
                    <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Compact Mode</p>
                    <p className="text-xs text-gray-400">Reduce spacing and padding</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Animations</p>
                    <p className="text-xs text-gray-400">Enable smooth transitions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
            
            {/* Localization */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  Localization
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Language and regional settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Language</label>
                    <Select value={settings.language} onValueChange={(v) => setSettings(s => ({ ...s, language: v }))}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Timezone</label>
                    <Select value={settings.timezone} onValueChange={(v) => setSettings(s => ({ ...s, timezone: v }))}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">Eastern</SelectItem>
                        <SelectItem value="CST">Central</SelectItem>
                        <SelectItem value="MST">Mountain</SelectItem>
                        <SelectItem value="PST">Pacific</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Date Format</label>
                    <Select value={settings.dateFormat} onValueChange={(v) => setSettings(s => ({ ...s, dateFormat: v }))}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Currency</label>
                    <Select value={settings.currency} onValueChange={(v) => setSettings(s => ({ ...s, currency: v }))}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
        
      case 'api-keys':
        // Redirect to the centralized API keys page
        if (typeof window !== 'undefined') {
          window.location.href = '/settings/api-keys'
        }
        return (
          <div className="space-y-6">
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
              <CardContent className="p-12 text-center">
                <Key className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Redirecting to API Keys...</h3>
                <p className="text-gray-400 mb-4">Taking you to the API keys management page</p>
                <Button
                  onClick={() => window.location.href = '/settings/api-keys'}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Go to API Keys
                </Button>
              </CardContent>
            </Card>
          </div>
        )
        
      case 'notifications':
        return (
          <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-400" />
                  Notification Preferences
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Choose how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Email Notifications</p>
                      <p className="text-xs text-gray-400">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.emailNotifications}
                    onCheckedChange={(v) => setSettings(s => ({ ...s, emailNotifications: v }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Push Notifications</p>
                      <p className="text-xs text-gray-400">Browser and mobile alerts</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.pushNotifications}
                    onCheckedChange={(v) => setSettings(s => ({ ...s, pushNotifications: v }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-white">SMS Notifications</p>
                      <p className="text-xs text-gray-400">Critical alerts via SMS</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.smsNotifications}
                    onCheckedChange={(v) => setSettings(s => ({ ...s, smsNotifications: v }))}
                  />
                </div>
                
                <div className="pt-4 border-t border-gray-800">
                  <label className="text-sm text-gray-400 mb-2 block">Notification Frequency</label>
                  <Select 
                    value={settings.notificationFrequency} 
                    onValueChange={(v) => setSettings(s => ({ ...s, notificationFrequency: v }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly Digest</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        )
        
      default:
        return (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Settings className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Section Under Construction</h3>
              <p className="text-gray-400">This section is being developed</p>
            </div>
          </div>
        )
    }
  }
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20" />
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Settings</h1>
                  <p className="text-gray-400 mt-1">Manage your account and preferences</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="border-gray-700 bg-gray-800/50 hover:bg-gray-700 text-gray-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  onClick={saveSettings}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.div>
          
          {/* Main Content */}
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="col-span-3"
            >
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-4">
                <div className="space-y-1">
                  {settingsSections.map((section) => {
                    const Icon = section.icon
                    return (
                      <button
                        key={section.id}
                        onClick={() => setSelectedSection(section.id)}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3",
                          selectedSection === section.id
                            ? "bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 text-white"
                            : "hover:bg-gray-800/50 text-gray-400 hover:text-white"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <div className="flex-1">
                          <p className="font-medium">{section.title}</p>
                          <p className="text-xs opacity-60">{section.description}</p>
                        </div>
                        {section.badge && (
                          <Badge className={cn("text-xs", section.badgeColor)}>
                            {section.badge}
                          </Badge>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
            
            {/* Content Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-9"
            >
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  </div>
                ) : (
                  renderSectionContent()
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Add API Key Dialog */}
      <Dialog open={showAddKeyDialog} onOpenChange={setShowAddKeyDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-400" />
              Add API Key
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Connect your AI provider account
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Provider</label>
              <Select value={newKey.provider} onValueChange={(v) => setNewKey(k => ({ ...k, provider: v }))}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="google">Google AI</SelectItem>
                  <SelectItem value="xai">xAI (Grok)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Key Name (Optional)</label>
              <Input
                value={newKey.name}
                onChange={(e) => setNewKey(k => ({ ...k, name: e.target.value }))}
                placeholder="e.g., Production Key"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">API Key</label>
              <Input
                type="password"
                value={newKey.key}
                onChange={(e) => setNewKey(k => ({ ...k, key: e.target.value }))}
                placeholder="sk-..."
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setShowAddKeyDialog(false)}
              className="border-gray-700 bg-gray-800 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={addApiKey}
              disabled={!newKey.provider || !newKey.key}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Add Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}