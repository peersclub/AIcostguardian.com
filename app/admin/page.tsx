'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Users, Building2, DollarSign, Activity, Shield, Database,
  TrendingUp, AlertTriangle, Settings, Key, CreditCard, Bell,
  BarChart3, PieChart, Eye, Edit2, Trash2, UserCheck, UserX,
  CheckCircle, XCircle, Clock, RefreshCw, Download, Search,
  Filter, ChevronRight, ExternalLink, Lock, Unlock
} from 'lucide-react'
import { format } from 'date-fns'

interface SystemStats {
  totalUsers: number
  totalOrganizations: number
  totalApiKeys: number
  totalRevenue: number
  activeUsers: number
  monthlyUsage: number
  systemHealth: 'healthy' | 'degraded' | 'critical'
  databaseSize: string
  apiCallsToday: number
  errorRate: number
}

interface Organization {
  id: string
  name: string
  domain: string
  subscription: string
  users: number
  monthlySpend: number
  spendLimit?: number
  createdAt: string
  status: 'active' | 'suspended' | 'trial'
}

interface User {
  id: string
  email: string
  name: string
  role: string
  organizationId: string
  organizationName: string
  lastActive: string
  apiCalls: number
  totalSpend: number
  status: 'active' | 'inactive' | 'suspended'
}

interface ApiKeyOverview {
  id: string
  provider: string
  userId: string
  userEmail: string
  organizationId: string
  isActive: boolean
  lastUsed?: string
  createdAt: string
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKeyOverview[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    checkAdminAccess()
  }, [session])

  useEffect(() => {
    // Fetch admin data if user has access
    // Admin verification is done in checkAdminAccess
    if (session?.user?.email) {
      fetchAdminData()
    }
  }, [session, activeTab])

  const checkAdminAccess = async () => {
    if (!session?.user?.email) {
      router.push('/auth/signin')
      return
    }

    // Check if user is admin
    const response = await fetch('/api/admin/verify')
    if (!response.ok) {
      router.push('/dashboard')
      return
    }
  }

  const fetchAdminData = async () => {
    setIsLoading(true)
    try {
      switch (activeTab) {
        case 'overview':
          await fetchSystemStats()
          break
        case 'organizations':
          await fetchOrganizations()
          break
        case 'users':
          await fetchUsers()
          break
        case 'api-keys':
          await fetchApiKeys()
          break
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSystemStats = async () => {
    const response = await fetch('/api/admin/stats')
    if (response.ok) {
      const data = await response.json()
      setSystemStats(data)
    }
  }

  const fetchOrganizations = async () => {
    const response = await fetch('/api/admin/organizations')
    if (response.ok) {
      const data = await response.json()
      setOrganizations(data)
    }
  }

  const fetchUsers = async () => {
    const response = await fetch('/api/admin/users')
    if (response.ok) {
      const data = await response.json()
      setUsers(data)
    }
  }

  const fetchApiKeys = async () => {
    const response = await fetch('/api/admin/api-keys')
    if (response.ok) {
      const data = await response.json()
      setApiKeys(data)
    }
  }

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'delete') => {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: action === 'delete' ? 'DELETE' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    })

    if (response.ok) {
      await fetchUsers()
    }
  }

  const handleOrgAction = async (orgId: string, action: 'suspend' | 'activate' | 'delete') => {
    const response = await fetch(`/api/admin/organizations/${orgId}`, {
      method: action === 'delete' ? 'DELETE' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    })

    if (response.ok) {
      await fetchOrganizations()
    }
  }

  const handleApiKeyToggle = async (keyId: string, isActive: boolean) => {
    const response = await fetch(`/api/admin/api-keys/${keyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive })
    })

    if (response.ok) {
      await fetchApiKeys()
    }
  }

  const exportData = async (type: string) => {
    const response = await fetch(`/api/admin/export?type=${type}`)
    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-export-${Date.now()}.csv`
      a.click()
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-500'
      case 'degraded': return 'text-yellow-500'
      case 'critical': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500">Active</Badge>
      case 'suspended':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500">Suspended</Badge>
      case 'trial':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500">Trial</Badge>
      case 'inactive':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500">Inactive</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Admin access is verified through checkAdminAccess function
  // which redirects if user is not admin
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400">Admin privileges required</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
            <Shield className="w-8 h-8 text-purple-400" />
            Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-2">System administration and monitoring</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => fetchAdminData()}
            variant="outline"
            className="border-gray-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => exportData(activeTab)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {systemStats && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-gray-400">Total Users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{systemStats.totalUsers}</div>
                    <p className="text-sm text-green-400 mt-1">
                      {systemStats.activeUsers} active
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-gray-400">Organizations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{systemStats.totalOrganizations}</div>
                    <p className="text-sm text-gray-400 mt-1">Across all plans</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-gray-400">Monthly Revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-400">
                      ${systemStats.totalRevenue.toLocaleString()}
                    </div>
                    <p className="text-sm text-green-400 mt-1">+12% from last month</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-gray-400">System Health</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getHealthColor(systemStats.systemHealth)}`}>
                      {systemStats.systemHealth.toUpperCase()}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {systemStats.errorRate}% error rate
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle>API Usage Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total API Calls</span>
                        <span className="text-white font-bold">{systemStats.apiCallsToday.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Average Response Time</span>
                        <span className="text-white font-bold">124ms</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Database Size</span>
                        <span className="text-white font-bold">{systemStats.databaseSize}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <Database className="w-4 h-4 mr-2" />
                      Backup Database
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Bell className="w-4 h-4 mr-2" />
                      Send System Notification
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      System Configuration
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Organizations Tab */}
        <TabsContent value="organizations" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search organizations..."
                className="pl-10 bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="trial">Trial</option>
            </select>
          </div>

          {/* Organizations Table */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50 border-b border-gray-700">
                    <tr>
                      <th className="text-left p-4 text-gray-400">Organization</th>
                      <th className="text-left p-4 text-gray-400">Domain</th>
                      <th className="text-left p-4 text-gray-400">Plan</th>
                      <th className="text-left p-4 text-gray-400">Users</th>
                      <th className="text-left p-4 text-gray-400">Monthly Spend</th>
                      <th className="text-left p-4 text-gray-400">Status</th>
                      <th className="text-left p-4 text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizations
                      .filter(org => 
                        (filterStatus === 'all' || org.status === filterStatus) &&
                        (org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         org.domain.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .map((org) => (
                        <tr key={org.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                          <td className="p-4">
                            <div>
                              <p className="text-white font-medium">{org.name}</p>
                              <p className="text-gray-400 text-sm">ID: {org.id}</p>
                            </div>
                          </td>
                          <td className="p-4 text-gray-300">{org.domain}</td>
                          <td className="p-4">
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500">
                              {org.subscription}
                            </Badge>
                          </td>
                          <td className="p-4 text-gray-300">{org.users}</td>
                          <td className="p-4 text-gray-300">${org.monthlySpend.toFixed(2)}</td>
                          <td className="p-4">{getStatusBadge(org.status)}</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedOrg(org)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOrgAction(org.id, org.status === 'active' ? 'suspend' : 'activate')}
                              >
                                {org.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-400"
                                onClick={() => handleOrgAction(org.id, 'delete')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-10 bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Users Table */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50 border-b border-gray-700">
                    <tr>
                      <th className="text-left p-4 text-gray-400">User</th>
                      <th className="text-left p-4 text-gray-400">Organization</th>
                      <th className="text-left p-4 text-gray-400">Role</th>
                      <th className="text-left p-4 text-gray-400">Last Active</th>
                      <th className="text-left p-4 text-gray-400">API Calls</th>
                      <th className="text-left p-4 text-gray-400">Total Spend</th>
                      <th className="text-left p-4 text-gray-400">Status</th>
                      <th className="text-left p-4 text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(user => 
                        (filterStatus === 'all' || user.status === filterStatus) &&
                        (user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .map((user) => (
                        <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                          <td className="p-4">
                            <div>
                              <p className="text-white font-medium">{user.name || 'No name'}</p>
                              <p className="text-gray-400 text-sm">{user.email}</p>
                            </div>
                          </td>
                          <td className="p-4 text-gray-300">{user.organizationName}</td>
                          <td className="p-4">
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500">
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-4 text-gray-300">{format(new Date(user.lastActive), 'MMM d, HH:mm')}</td>
                          <td className="p-4 text-gray-300">{user.apiCalls.toLocaleString()}</td>
                          <td className="p-4 text-gray-300">${user.totalSpend.toFixed(2)}</td>
                          <td className="p-4">{getStatusBadge(user.status)}</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
                              >
                                {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-400"
                                onClick={() => handleUserAction(user.id, 'delete')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>API Key Management</CardTitle>
              <CardDescription>Monitor and control all API keys in the system</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50 border-b border-gray-700">
                    <tr>
                      <th className="text-left p-4 text-gray-400">Provider</th>
                      <th className="text-left p-4 text-gray-400">User</th>
                      <th className="text-left p-4 text-gray-400">Organization</th>
                      <th className="text-left p-4 text-gray-400">Last Used</th>
                      <th className="text-left p-4 text-gray-400">Created</th>
                      <th className="text-left p-4 text-gray-400">Status</th>
                      <th className="text-left p-4 text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((key) => (
                      <tr key={key.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-gray-400" />
                            <span className="text-white">{key.provider}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{key.userEmail}</td>
                        <td className="p-4 text-gray-300">{key.organizationId}</td>
                        <td className="p-4 text-gray-300">
                          {key.lastUsed ? format(new Date(key.lastUsed), 'MMM d, HH:mm') : 'Never'}
                        </td>
                        <td className="p-4 text-gray-300">{format(new Date(key.createdAt), 'MMM d, yyyy')}</td>
                        <td className="p-4">
                          {key.isActive ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500">Active</Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500">Inactive</Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApiKeyToggle(key.id, key.isActive)}
                          >
                            {key.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}