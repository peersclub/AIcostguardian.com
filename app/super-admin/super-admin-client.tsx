'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, Users, Shield, Activity, DollarSign, Settings, 
  Plus, Search, Filter, Download, Upload, Edit, Trash2, 
  CheckCircle, XCircle, AlertTriangle, TrendingUp, Mail,
  Phone, Globe, Calendar, BarChart3, Eye, Ban, Check
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { Session } from 'next-auth'

interface Organization {
  id: string
  name: string
  domain: string
  subscription: string
  isActive: boolean
  createdAt: Date
  monthlySpend: number
  spendLimit: number | null
  _count: {
    users: number
    apiKeys: number
  }
  contactEmail: string | null
  industry: string | null
  size: string | null
}

interface SuperAdminClientProps {
  initialSession: Session
}

export default function SuperAdminClient({ initialSession }: SuperAdminClientProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('organizations')
  const [showAddOrgModal, setShowAddOrgModal] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)

  // Stats
  const [stats, setStats] = useState({
    totalOrgs: 0,
    activeOrgs: 0,
    totalUsers: 0,
    totalRevenue: 0,
    avgOrgSize: 0,
    monthlyGrowth: 0
  })

  useEffect(() => {
    fetchOrganizations()
    fetchStats()
  }, [])

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/super-admin/organizations')
      const data = await res.json()
      setOrganizations(data.organizations || [])
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
      toast({
        title: 'Error',
        description: 'Failed to load organizations',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/super-admin/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleCreateOrganization = async (orgData: any) => {
    try {
      const res = await fetch('/api/super-admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgData)
      })
      
      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Organization created successfully'
        })
        setShowAddOrgModal(false)
        fetchOrganizations()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create organization',
        variant: 'destructive'
      })
    }
  }

  const handleToggleOrgStatus = async (orgId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/super-admin/organizations/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })
      
      if (res.ok) {
        toast({
          title: 'Success',
          description: `Organization ${!isActive ? 'activated' : 'deactivated'} successfully`
        })
        fetchOrganizations()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update organization status',
        variant: 'destructive'
      })
    }
  }

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.domain.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-indigo-400" />
                <h1 className="text-3xl font-bold text-white">Super Admin Dashboard</h1>
              </div>
              <p className="text-gray-400">Manage organizations and platform settings</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowAddOrgModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Organization
              </Button>
              <Button variant="outline" className="border-gray-700">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-8">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Orgs</p>
                  <p className="text-2xl font-bold text-white">{stats.totalOrgs}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Orgs</p>
                  <p className="text-2xl font-bold text-white">{stats.activeOrgs}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Org Size</p>
                  <p className="text-2xl font-bold text-white">{stats.avgOrgSize}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Growth</p>
                  <p className="text-2xl font-bold text-green-400">+{stats.monthlyGrowth}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-8">
          <TabsList className="bg-gray-900/50 border border-gray-800">
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="organizations" className="mt-6">
            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-800 text-white"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px] bg-gray-900/50 border-gray-800 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px] bg-gray-900/50 border-gray-800 text-white">
                  <SelectValue placeholder="Filter by tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Organizations Table */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left p-4 text-gray-400 font-medium">Organization</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Domain</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Plan</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Users</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Monthly Spend</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrgs.map((org) => (
                        <tr key={org.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="p-4">
                            <div>
                              <p className="text-white font-medium">{org.name}</p>
                              <p className="text-gray-400 text-sm">{org.industry || 'Not specified'}</p>
                            </div>
                          </td>
                          <td className="p-4 text-gray-300">{org.domain}</td>
                          <td className="p-4">
                            <Badge className={
                              org.subscription === 'ENTERPRISE' 
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                : org.subscription === 'GROWTH'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : org.subscription === 'STARTER'
                                ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                : 'bg-gray-700/50 text-gray-400 border-gray-600'
                            }>
                              {org.subscription}
                            </Badge>
                          </td>
                          <td className="p-4 text-gray-300">{org._count.users}</td>
                          <td className="p-4 text-gray-300">${org.monthlySpend.toFixed(2)}</td>
                          <td className="p-4">
                            {org.isActive ? (
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                                Inactive
                              </Badge>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedOrg(org)}
                                className="text-gray-400 hover:text-white"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleOrgStatus(org.id, org.isActive)}
                                className="text-gray-400 hover:text-white"
                              >
                                {org.isActive ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />}
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

          <TabsContent value="users">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">User management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Billing Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Billing management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Platform Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Platform settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Organization Modal */}
      {showAddOrgModal && (
        <AddOrganizationModal
          onClose={() => setShowAddOrgModal(false)}
          onSubmit={handleCreateOrganization}
        />
      )}

      {/* Organization Details Modal */}
      {selectedOrg && (
        <OrganizationDetailsModal
          organization={selectedOrg}
          onClose={() => setSelectedOrg(null)}
        />
      )}
    </div>
  )
}

// Add Organization Modal Component
function AddOrganizationModal({ onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    contactEmail: '',
    industry: '',
    size: '1-50',
    subscription: 'FREE'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-2xl border border-gray-800 p-6 max-w-md w-full mx-4"
      >
        <h2 className="text-xl font-bold text-white mb-4">Add New Organization</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Organization Name *
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Domain *
            </label>
            <Input
              required
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              placeholder="company.com"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Contact Email
            </label>
            <Input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Industry
            </label>
            <Input
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Company Size
            </label>
            <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-50">1-50 employees</SelectItem>
                <SelectItem value="51-200">51-200 employees</SelectItem>
                <SelectItem value="201-500">201-500 employees</SelectItem>
                <SelectItem value="501-1000">501-1000 employees</SelectItem>
                <SelectItem value="1000+">1000+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Subscription Tier
            </label>
            <Select value={formData.subscription} onValueChange={(value) => setFormData({ ...formData, subscription: value })}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FREE">Free</SelectItem>
                <SelectItem value="STARTER">Starter</SelectItem>
                <SelectItem value="GROWTH">Growth</SelectItem>
                <SelectItem value="SCALE">Scale</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Create Organization
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Organization Details Modal Component
function OrganizationDetailsModal({ organization, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-2xl border border-gray-800 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Organization Details</h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <XCircle className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Name</p>
                <p className="text-white">{organization.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Domain</p>
                <p className="text-white">{organization.domain}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Industry</p>
                <p className="text-white">{organization.industry || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Size</p>
                <p className="text-white">{organization.size || 'Not specified'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Usage & Billing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Subscription</p>
                <Badge className="mt-1">{organization.subscription}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-400">Monthly Spend</p>
                <p className="text-white">${organization.monthlySpend.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Spend Limit</p>
                <p className="text-white">{organization.spendLimit ? `$${organization.spendLimit}` : 'No limit'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-white">{organization._count.users}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">{organization.contactEmail || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Created</p>
                <p className="text-white">{new Date(organization.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-800">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-700"
          >
            Close
          </Button>
          <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
            Edit Organization
          </Button>
        </div>
      </motion.div>
    </div>
  )
}