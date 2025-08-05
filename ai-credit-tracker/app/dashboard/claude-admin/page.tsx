'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import AuthWrapper from '@/components/AuthWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Loader2, 
  Shield, 
  Users, 
  Key, 
  BarChart3, 
  CreditCard, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Plus,
  Trash2,
  Edit,
  Eye,
  Bell,
  Globe,
  Lock,
  TrendingUp,
  DollarSign,
  Activity
} from 'lucide-react'
import Link from 'next/link'

// Types
interface ClaudeUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'member' | 'viewer'
  status: 'active' | 'suspended' | 'pending'
  usageLimit?: number
  permissions: string[]
  createdAt: string
  lastActiveAt: string
}

interface ClaudeApiKey {
  id: string
  name: string
  keyPrefix: string
  permissions: string[]
  scopes: string[]
  expiresAt?: string
  createdAt: string
  lastUsedAt?: string
  status: 'active' | 'revoked'
}

interface UsageStats {
  usageStats: Array<{
    timestamp: string
    totalTokens: number
    totalCost: number
    requestCount: number
    model: string
    period: string
  }>
  summary: {
    totalTokens: number
    totalCost: number
    totalRequests: number
    period: string
  }
}

interface BillingInfo {
  organizationId: string
  currentPeriod: {
    startDate: string
    endDate: string
    totalCost: number
    totalTokens: number
  }
  paymentMethod: {
    type: string
    last4: string
    expiresAt?: string
  }
  billingAddress: {
    company: string
    address: string
    city: string
    country: string
  }
  invoices: Array<{
    id: string
    amount: number
    currency: string
    status: string
    dueDate: string
    paidAt?: string
    downloadUrl: string
  }>
}

interface OrganizationSettings {
  id: string
  name: string
  settings: {
    ssoEnabled: boolean
    mfaRequired: boolean
    ipAllowlist: string[]
    sessionTimeout: number
    dataRetentionDays: number
    allowedModels: string[]
    contentFilters: {
      harmfulContent: boolean
      personalInfo: boolean
      customFilters: string[]
    }
    rateLimits: {
      requestsPerMinute: number
      tokensPerDay: number
      burstLimit: number
    }
  }
}

interface ApiVersionInfo {
  current: string
  latest: string
  deprecated: string[]
  changelogUrl: string
  lastChecked: string
  hasUpdate: boolean
  updateMessage: string | null
}

function ClaudeAdminDashboardContent() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<ClaudeUser[]>([])
  const [apiKeys, setApiKeys] = useState<ClaudeApiKey[]>([])
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null)
  const [organizationSettings, setOrganizationSettings] = useState<OrganizationSettings | null>(null)
  const [versionInfo, setVersionInfo] = useState<ApiVersionInfo | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [usingMockData, setUsingMockData] = useState(false)

  // Load all data when session is available
  useEffect(() => {
    if (session?.user?.id) {
      loadAllData()
    }
  }, [session])

  const loadAllData = async () => {
    setIsLoading(true)
    try {
      console.log('Loading Claude Admin data...')
      await Promise.all([
        loadUsers(),
        loadApiKeys(),
        loadUsageStats(),
        loadBillingInfo(),
        loadOrganizationSettings(),
        loadVersionInfo()
      ])
      console.log('Finished loading all data')
    } catch (error) {
      console.error('Failed to load admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/claude-admin/users')
      const data = await response.json()
      if (response.ok) {
        setUsers(data.users || [])
        console.log('Loaded users:', data.users)
      } else {
        console.error('Users API error:', response.status, data)
        setUsers([])
      }
    } catch (error) {
      console.error('Failed to load users:', error)
      setUsers([])
    }
  }

  const loadApiKeys = async () => {
    try {
      const response = await fetch('/api/claude-admin/api-keys')
      const data = await response.json()
      if (response.ok) {
        setApiKeys(data.apiKeys || [])
        console.log('Loaded API keys:', data.apiKeys)
      } else {
        console.error('API keys error:', response.status, data)
        setApiKeys([])
      }
    } catch (error) {
      console.error('Failed to load API keys:', error)
      setApiKeys([])
    }
  }

  const loadUsageStats = async () => {
    try {
      const response = await fetch('/api/claude-admin/usage')
      const data = await response.json()
      if (response.ok) {
        setUsageStats(data)
        console.log('Loaded usage stats:', data)
      } else {
        console.error('Usage stats error:', response.status, data)
      }
    } catch (error) {
      console.error('Failed to load usage stats:', error)
    }
  }

  const loadBillingInfo = async () => {
    try {
      const response = await fetch('/api/claude-admin/billing')
      const data = await response.json()
      if (response.ok) {
        setBillingInfo(data)
        console.log('Loaded billing info:', data)
      } else {
        console.error('Billing info error:', response.status, data)
      }
    } catch (error) {
      console.error('Failed to load billing info:', error)
    }
  }

  const loadOrganizationSettings = async () => {
    try {
      const response = await fetch('/api/claude-admin/organization')
      const data = await response.json()
      if (response.ok) {
        setOrganizationSettings(data)
        console.log('Loaded organization settings:', data)
      } else {
        console.error('Organization settings error:', response.status, data)
      }
    } catch (error) {
      console.error('Failed to load organization settings:', error)
    }
  }

  const loadVersionInfo = async () => {
    try {
      const response = await fetch('/api/claude-admin/version')
      const data = await response.json()
      if (response.ok) {
        setVersionInfo(data)
        console.log('Loaded version info:', data)
      } else {
        console.error('Version info error:', response.status, data)
      }
    } catch (error) {
      console.error('Failed to load version info:', error)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'member': return 'bg-blue-100 text-blue-800'
      case 'viewer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Show loading while data is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading Claude Admin Dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Claude Admin Console</h1>
                <p className="text-gray-600">Comprehensive administrative control for Claude API</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {versionInfo && (
                <div className="text-sm text-gray-500">
                  API Version: <span className="font-medium">{versionInfo.current}</span>
                </div>
              )}
              <Link href="/dashboard">
                <Button variant="outline">← Back to Overview</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mock Data Alert */}
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Demo Mode:</strong> This dashboard will try to fetch real data from your Claude Admin API key if configured, 
            otherwise it shows mock data for demonstration purposes. Configure your Claude Admin API key in{' '}
            <Link href="/settings" className="underline hover:no-underline">Settings</Link> to view real data.
          </AlertDescription>
        </Alert>

        {/* API Version Alert */}
        {versionInfo?.hasUpdate && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Bell className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>API Update Available:</strong> {versionInfo.updateMessage}{' '}
              <a 
                href={versionInfo.changelogUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                View Changelog
              </a>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>API Keys</span>
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Usage</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Billing</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Compliance</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {users?.filter(u => u.status === 'active').length || 0} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Keys</CardTitle>
                  <Key className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{apiKeys?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {apiKeys?.filter(k => k.status === 'active').length || 0} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${billingInfo?.currentPeriod.totalCost.toFixed(2) || '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current billing period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(usageStats?.summary.totalTokens || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {usageStats?.summary.totalRequests || 0} requests
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="justify-start" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New User
                  </Button>
                  <Button className="justify-start" variant="outline">
                    <Key className="mr-2 h-4 w-4" />
                    Generate API Key
                  </Button>
                  <Button className="justify-start" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Usage Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage team members and their permissions</CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                          <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                          <div className="flex items-center space-x-1">
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No users found. Click "Add User" to get started.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>API Key Management</CardTitle>
                    <CardDescription>Generate and manage API keys</CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Key
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys?.map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Key className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{key.name}</div>
                          <div className="text-sm text-gray-500 font-mono">{key.keyPrefix}</div>
                          <div className="text-xs text-gray-400">
                            Created {new Date(key.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={key.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {key.status}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Analytics</CardTitle>
                <CardDescription>Monitor API usage and performance</CardDescription>
              </CardHeader>
              <CardContent>
                {usageStats && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {usageStats.summary.totalTokens.toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-600">Total Tokens</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ${usageStats.summary.totalCost.toFixed(2)}
                        </div>
                        <div className="text-sm text-green-600">Total Cost</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {usageStats.summary.totalRequests.toLocaleString()}
                        </div>
                        <div className="text-sm text-purple-600">Total Requests</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Finance</CardTitle>
                <CardDescription>Manage billing information and view invoices</CardDescription>
              </CardHeader>
              <CardContent>
                {billingInfo && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-2">Current Period</h3>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold">${billingInfo.currentPeriod.totalCost}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(billingInfo.currentPeriod.startDate).toLocaleDateString()} - 
                            {new Date(billingInfo.currentPeriod.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Payment Method</h3>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="font-medium">**** **** **** {billingInfo.paymentMethod.last4}</div>
                          <div className="text-sm text-gray-500">
                            {billingInfo.paymentMethod.type.toUpperCase()}
                            {billingInfo.paymentMethod.expiresAt && 
                              ` • Expires ${new Date(billingInfo.paymentMethod.expiresAt).toLocaleDateString()}`
                            }
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold mb-4">Recent Invoices</h3>
                      <div className="space-y-2">
                        {billingInfo.invoices.map((invoice) => (
                          <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">{invoice.id}</div>
                              <div className="text-sm text-gray-500">
                                Due {new Date(invoice.dueDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-right">
                                <div className="font-medium">${invoice.amount}</div>
                                <Badge className={invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                  {invoice.status}
                                </Badge>
                              </div>
                              <Button size="sm" variant="ghost">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security & Access Control</CardTitle>
                <CardDescription>Configure security settings and access controls</CardDescription>
              </CardHeader>
              <CardContent>
                {organizationSettings && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Multi-Factor Authentication</Label>
                          <p className="text-sm text-gray-500">Require MFA for all users</p>
                        </div>
                        <Switch checked={organizationSettings.settings.mfaRequired} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Single Sign-On</Label>
                          <p className="text-sm text-gray-500">Enable SSO authentication</p>
                        </div>
                        <Switch checked={organizationSettings.settings.ssoEnabled} />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-base">IP Allowlist</Label>
                      <p className="text-sm text-gray-500 mb-2">Restrict access to specific IP addresses</p>
                      <div className="space-y-2">
                        {organizationSettings.settings.ipAllowlist.map((ip, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="font-mono text-sm">{ip}</span>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>Configure organizational preferences and limits</CardDescription>
              </CardHeader>
              <CardContent>
                {organizationSettings && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label>Session Timeout (seconds)</Label>
                        <Input 
                          type="number" 
                          value={organizationSettings.settings.sessionTimeout} 
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Data Retention (days)</Label>
                        <Input 
                          type="number" 
                          value={organizationSettings.settings.dataRetentionDays} 
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-base">Rate Limits</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div>
                          <Label>Requests per minute</Label>
                          <Input 
                            type="number" 
                            value={organizationSettings.settings.rateLimits.requestsPerMinute}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Tokens per day</Label>
                          <Input 
                            type="number" 
                            value={organizationSettings.settings.rateLimits.tokensPerDay}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Burst limit</Label>
                          <Input 
                            type="number" 
                            value={organizationSettings.settings.rateLimits.burstLimit}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-base">Content Filters</Label>
                      <div className="space-y-3 mt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Harmful Content Detection</Label>
                            <p className="text-sm text-gray-500">Block potentially harmful content</p>
                          </div>
                          <Switch checked={organizationSettings.settings.contentFilters.harmfulContent} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Personal Information Detection</Label>
                            <p className="text-sm text-gray-500">Detect and flag personal information</p>
                          </div>
                          <Switch checked={organizationSettings.settings.contentFilters.personalInfo} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance & Reporting</CardTitle>
                <CardDescription>Access compliance tools and generate reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <Shield className="h-6 w-6 mb-2" />
                      <span>GDPR Report</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Lock className="h-6 w-6 mb-2" />
                      <span>SOC 2 Report</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Activity className="h-6 w-6 mb-2" />
                      <span>Audit Logs</span>
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-4">Compliance Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span>GDPR Compliance</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span>SOC 2 Type II</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Certified</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                          <span>HIPAA Compliance</span>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function ClaudeAdminDashboard() {
  return (
    <AuthWrapper>
      <ClaudeAdminDashboardContent />
    </AuthWrapper>
  )
}
