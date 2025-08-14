'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  Building2, Users, Shield, Settings, CreditCard, Activity,
  TrendingUp, DollarSign, Calendar, Globe, Mail, Phone,
  MapPin, Edit, Save, X, Plus, Trash2, Check, AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'
import Link from 'next/link'

// Individual section components with their own edit state
function OrganizationDetailsSection() {
  const [isEditing, setIsEditing] = useState(false)
  const [data, setData] = useState({
    name: 'AI Cost Guardian',
    website: 'https://aicostguardian.com',
    email: 'contact@aicostguardian.com',
    phone: '+1 (555) 123-4567',
    address: 'San Francisco, CA',
    industry: 'Technology',
    size: '11-50',
    founded: '2024'
  })
  const [tempData, setTempData] = useState(data)

  const handleSave = async () => {
    // TODO: API call to save organization details
    setData(tempData)
    setIsEditing(false)
    toast({
      title: 'Success',
      description: 'Organization details updated successfully'
    })
  }

  const handleCancel = () => {
    setTempData(data)
    setIsEditing(false)
  }

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white">Organization Information</CardTitle>
          <CardDescription className="text-gray-400">
            Basic information about your organization
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="border-gray-700 text-gray-300"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Label className="text-gray-400">Organization Name</Label>
            <Input
              value={tempData.name}
              onChange={(e) => setTempData({...tempData, name: e.target.value})}
              disabled={!isEditing}
              className="bg-gray-800 border-gray-700 text-white disabled:opacity-60"
            />
          </div>
          <div>
            <Label className="text-gray-400">Website</Label>
            <Input
              value={tempData.website}
              onChange={(e) => setTempData({...tempData, website: e.target.value})}
              disabled={!isEditing}
              className="bg-gray-800 border-gray-700 text-white disabled:opacity-60"
            />
          </div>
          <div>
            <Label className="text-gray-400">Contact Email</Label>
            <Input
              value={tempData.email}
              onChange={(e) => setTempData({...tempData, email: e.target.value})}
              disabled={!isEditing}
              className="bg-gray-800 border-gray-700 text-white disabled:opacity-60"
            />
          </div>
          <div>
            <Label className="text-gray-400">Phone</Label>
            <Input
              value={tempData.phone}
              onChange={(e) => setTempData({...tempData, phone: e.target.value})}
              disabled={!isEditing}
              className="bg-gray-800 border-gray-700 text-white disabled:opacity-60"
            />
          </div>
          <div>
            <Label className="text-gray-400">Address</Label>
            <Input
              value={tempData.address}
              onChange={(e) => setTempData({...tempData, address: e.target.value})}
              disabled={!isEditing}
              className="bg-gray-800 border-gray-700 text-white disabled:opacity-60"
            />
          </div>
          <div>
            <Label className="text-gray-400">Industry</Label>
            <Input
              value={tempData.industry}
              onChange={(e) => setTempData({...tempData, industry: e.target.value})}
              disabled={!isEditing}
              className="bg-gray-800 border-gray-700 text-white disabled:opacity-60"
            />
          </div>
          <div>
            <Label className="text-gray-400">Company Size</Label>
            <Input
              value={tempData.size}
              onChange={(e) => setTempData({...tempData, size: e.target.value})}
              disabled={!isEditing}
              className="bg-gray-800 border-gray-700 text-white disabled:opacity-60"
            />
          </div>
          <div>
            <Label className="text-gray-400">Founded Year</Label>
            <Input
              value={tempData.founded}
              onChange={(e) => setTempData({...tempData, founded: e.target.value})}
              disabled={!isEditing}
              className="bg-gray-800 border-gray-700 text-white disabled:opacity-60"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TeamMembersSection() {
  const [members, setMembers] = useState([
    { id: '1', name: 'Victor Admin', email: 'victor@aicostguardian.ai', role: 'Admin', status: 'active' },
    { id: '2', name: 'John Developer', email: 'john@aicostguardian.com', role: 'Developer', status: 'active' },
    { id: '3', name: 'Sarah Manager', email: 'sarah@aicostguardian.com', role: 'Manager', status: 'active' }
  ])

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white">Team Members</CardTitle>
          <CardDescription className="text-gray-400">
            Manage your organization's team members
          </CardDescription>
        </div>
        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          Invite Member
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-white font-medium">{member.name}</p>
                  <p className="text-gray-400 text-sm">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {member.role}
                </Badge>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  {member.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function BillingSection() {
  const [isEditing, setIsEditing] = useState(false)
  const [billingData, setBillingData] = useState({
    plan: 'Professional',
    billingCycle: 'monthly',
    nextBillingDate: '2024-04-01',
    paymentMethod: '**** 4242',
    billingEmail: 'billing@aicostguardian.com'
  })
  const [tempData, setTempData] = useState(billingData)

  const handleSave = () => {
    setBillingData(tempData)
    setIsEditing(false)
    toast({
      title: 'Success',
      description: 'Billing information updated successfully'
    })
  }

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white">Billing Information</CardTitle>
          <CardDescription className="text-gray-400">
            Manage your subscription and payment methods
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTempData(billingData)
                  setIsEditing(false)
                }}
                className="border-gray-700 text-gray-300"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Label className="text-gray-400">Current Plan</Label>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                {billingData.plan}
              </Badge>
              <Link href="/billing">
                <Button variant="link" className="text-indigo-400 p-0 h-auto">
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </div>
          <div>
            <Label className="text-gray-400">Billing Cycle</Label>
            <p className="text-white mt-1 capitalize">{billingData.billingCycle}</p>
          </div>
          <div>
            <Label className="text-gray-400">Next Billing Date</Label>
            <p className="text-white mt-1">{billingData.nextBillingDate}</p>
          </div>
          <div>
            <Label className="text-gray-400">Payment Method</Label>
            <p className="text-white mt-1">{billingData.paymentMethod}</p>
          </div>
          <div>
            <Label className="text-gray-400">Billing Email</Label>
            <Input
              value={tempData.billingEmail}
              onChange={(e) => setTempData({...tempData, billingEmail: e.target.value})}
              disabled={!isEditing}
              className="bg-gray-800 border-gray-700 text-white disabled:opacity-60"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SecuritySection() {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    ssoEnabled: false,
    ipWhitelisting: false,
    auditLogging: true
  })

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Security Settings</CardTitle>
        <CardDescription className="text-gray-400">
          Configure security settings for your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Two-Factor Authentication</p>
              <p className="text-gray-400 text-sm">Require 2FA for all team members</p>
            </div>
            <Button
              variant={securitySettings.twoFactorEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setSecuritySettings({...securitySettings, twoFactorEnabled: !securitySettings.twoFactorEnabled})}
              className={securitySettings.twoFactorEnabled ? "bg-green-600 hover:bg-green-700" : "border-gray-700"}
            >
              {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Single Sign-On (SSO)</p>
              <p className="text-gray-400 text-sm">Enable SSO with your identity provider</p>
            </div>
            <Button
              variant={securitySettings.ssoEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setSecuritySettings({...securitySettings, ssoEnabled: !securitySettings.ssoEnabled})}
              className={securitySettings.ssoEnabled ? "bg-green-600 hover:bg-green-700" : "border-gray-700"}
            >
              {securitySettings.ssoEnabled ? 'Enabled' : 'Configure'}
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">IP Whitelisting</p>
              <p className="text-gray-400 text-sm">Restrict access to specific IP addresses</p>
            </div>
            <Button
              variant={securitySettings.ipWhitelisting ? "default" : "outline"}
              size="sm"
              onClick={() => setSecuritySettings({...securitySettings, ipWhitelisting: !securitySettings.ipWhitelisting})}
              className={securitySettings.ipWhitelisting ? "bg-green-600 hover:bg-green-700" : "border-gray-700"}
            >
              {securitySettings.ipWhitelisting ? 'Enabled' : 'Configure'}
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Audit Logging</p>
              <p className="text-gray-400 text-sm">Track all activities within your organization</p>
            </div>
            <Button
              variant={securitySettings.auditLogging ? "default" : "outline"}
              size="sm"
              onClick={() => setSecuritySettings({...securitySettings, auditLogging: !securitySettings.auditLogging})}
              className={securitySettings.auditLogging ? "bg-green-600 hover:bg-green-700" : "border-gray-700"}
            >
              {securitySettings.auditLogging ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function OrganizationPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalSpend: 0,
    monthlyBudget: 30000,
    apiKeys: 0,
    providers: 0
  })

  useEffect(() => {
    // Fetch real stats from API
    fetchOrganizationStats()
  }, [session])

  const fetchOrganizationStats = async () => {
    try {
      // TODO: Replace with actual API calls
      const response = await fetch('/api/organization/stats')
      if (response.ok) {
        const data = await response.json()
        setStats({
          totalMembers: data.totalMembers || 0,
          activeMembers: data.activeMembers || 0,
          totalSpend: data.totalSpend || 0,
          monthlyBudget: data.monthlyBudget || 30000,
          apiKeys: data.apiKeys || 0,
          providers: data.providers || 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch organization stats:', error)
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 min-h-screen py-6">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Building2 className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Organization Settings</h1>
                </div>
                <p className="text-gray-400">Manage your organization details and configuration</p>
              </div>
              
              <div className="flex items-center gap-3">
                <Link href="/organization/permissions">
                  <Button variant="outline" className="border-gray-700 text-gray-300">
                    <Shield className="w-4 h-4 mr-2" />
                    Permissions
                  </Button>
                </Link>
                <Link href="/organization/usage-limits">
                  <Button variant="outline" className="border-gray-700 text-gray-300">
                    <Activity className="w-4 h-4 mr-2" />
                    Usage Limits
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700 p-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-xl font-bold text-white">{stats.totalMembers}</div>
                    <div className="text-xs text-gray-400">Members</div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700 p-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <div>
                    <div className="text-xl font-bold text-white">{stats.activeMembers}</div>
                    <div className="text-xs text-gray-400">Active</div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700 p-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-yellow-400" />
                  <div>
                    <div className="text-xl font-bold text-white">
                      ${stats.totalSpend > 0 ? (stats.totalSpend/1000).toFixed(1) + 'k' : '0'}
                    </div>
                    <div className="text-xs text-gray-400">Spend</div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700 p-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-xl font-bold text-white">${(stats.monthlyBudget/1000).toFixed(0)}k</div>
                    <div className="text-xs text-gray-400">Budget</div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700 p-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-400" />
                  <div>
                    <div className="text-xl font-bold text-white">{stats.apiKeys}</div>
                    <div className="text-xs text-gray-400">API Keys</div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700 p-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-xl font-bold text-white">{stats.providers}</div>
                    <div className="text-xs text-gray-400">Providers</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="bg-gray-900/50 border border-gray-700">
              <TabsTrigger value="details" className="data-[state=active]:bg-indigo-600">
                <Building2 className="w-4 h-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger value="team" className="data-[state=active]:bg-indigo-600">
                <Users className="w-4 h-4 mr-2" />
                Team
              </TabsTrigger>
              <TabsTrigger value="billing" className="data-[state=active]:bg-indigo-600">
                <CreditCard className="w-4 h-4 mr-2" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-indigo-600">
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <OrganizationDetailsSection />
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <TeamMembersSection />
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <BillingSection />
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <SecuritySection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}