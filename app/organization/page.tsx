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
import Link from 'next/link'

export default function OrganizationPage() {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [organizationData, setOrganizationData] = useState({
    name: 'AI Cost Guardian',
    website: 'https://aicostguardian.com',
    email: 'contact@aicostguardian.com',
    phone: '+1 (555) 123-4567',
    address: 'San Francisco, CA',
    industry: 'Technology',
    size: '11-50',
    founded: '2024'
  })

  const stats = {
    totalMembers: 12,
    activeMembers: 10,
    totalSpend: 24580,
    monthlyBudget: 30000,
    apiKeys: 5,
    providers: 4
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
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "destructive" : "outline"}
                  className={isEditing ? "" : "border-gray-700 text-gray-300"}
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
                {isEditing && (
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                )}
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
                    <div className="text-xl font-bold text-white">${(stats.totalSpend/1000).toFixed(1)}k</div>
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
            <TabsList className="bg-gray-800/30 border border-gray-700">
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

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Organization Information</CardTitle>
                  <CardDescription className="text-gray-400">
                    Basic information about your organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label className="text-gray-400">Organization Name</Label>
                      <Input
                        value={organizationData.name}
                        disabled={!isEditing}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-400">Website</Label>
                      <Input
                        value={organizationData.website}
                        disabled={!isEditing}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-400">Email</Label>
                      <Input
                        value={organizationData.email}
                        disabled={!isEditing}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-400">Phone</Label>
                      <Input
                        value={organizationData.phone}
                        disabled={!isEditing}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-400">Industry</Label>
                      <Input
                        value={organizationData.industry}
                        disabled={!isEditing}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-400">Company Size</Label>
                      <Input
                        value={organizationData.size}
                        disabled={!isEditing}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-6">
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Team Management</CardTitle>
                  <CardDescription className="text-gray-400">
                    Quick links to manage your team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Link href="/organization/members">
                      <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:bg-gray-800/70 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Users className="w-8 h-8 text-blue-400" />
                          <div>
                            <h4 className="font-semibold text-white">Team Members</h4>
                            <p className="text-sm text-gray-400">Manage team members and invitations</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/organization/permissions">
                      <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:bg-gray-800/70 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Shield className="w-8 h-8 text-purple-400" />
                          <div>
                            <h4 className="font-semibold text-white">Permissions</h4>
                            <p className="text-sm text-gray-400">Configure roles and permissions</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/organization/usage-limits">
                      <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:bg-gray-800/70 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Activity className="w-8 h-8 text-green-400" />
                          <div>
                            <h4 className="font-semibold text-white">Usage Limits</h4>
                            <p className="text-sm text-gray-400">Set usage limits per team member</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Billing Settings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage billing and subscription
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                    <div>
                      <h4 className="font-semibold text-white">Current Plan</h4>
                      <p className="text-sm text-gray-400">Enterprise - $299/month</p>
                    </div>
                    <Link href="/billing">
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        Manage Billing
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Security Settings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure security options for your organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                      <div>
                        <h4 className="font-semibold text-white">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-400">Require 2FA for all team members</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Enabled
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                      <div>
                        <h4 className="font-semibold text-white">SSO Integration</h4>
                        <p className="text-sm text-gray-400">Single Sign-On with Google Workspace</p>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}