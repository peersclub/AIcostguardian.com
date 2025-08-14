'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  Shield, Users, Lock, Key, Settings, Eye, Edit, 
  Trash2, Plus, Check, X, AlertTriangle, Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

const PERMISSION_GROUPS = {
  admin: {
    name: 'Administrator',
    description: 'Full system access',
    color: 'text-red-400 bg-red-500/20 border-red-500/30',
    permissions: ['all']
  },
  manager: {
    name: 'Manager',
    description: 'Team and budget management',
    color: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
    permissions: ['view_usage', 'manage_team', 'manage_budgets', 'view_reports']
  },
  developer: {
    name: 'Developer',
    description: 'API access and usage tracking',
    color: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    permissions: ['view_usage', 'manage_api_keys', 'view_reports']
  },
  viewer: {
    name: 'Viewer',
    description: 'Read-only access',
    color: 'text-gray-400 bg-gray-500/20 border-gray-500/30',
    permissions: ['view_usage', 'view_reports']
  }
}

const PERMISSIONS_LIST = [
  { id: 'view_usage', name: 'View Usage', description: 'View AI usage and costs', category: 'viewing' },
  { id: 'view_reports', name: 'View Reports', description: 'Access analytics and reports', category: 'viewing' },
  { id: 'manage_api_keys', name: 'Manage API Keys', description: 'Add, edit, delete API keys', category: 'management' },
  { id: 'manage_team', name: 'Manage Team', description: 'Invite and remove team members', category: 'management' },
  { id: 'manage_budgets', name: 'Manage Budgets', description: 'Set and modify budget limits', category: 'management' },
  { id: 'manage_billing', name: 'Manage Billing', description: 'Access billing and payments', category: 'admin' },
  { id: 'manage_organization', name: 'Manage Organization', description: 'Organization settings', category: 'admin' },
  { id: 'all', name: 'All Permissions', description: 'Complete system access', category: 'admin' }
]

export default function OrganizationPermissions() {
  const { data: session } = useSession()
  const [selectedRole, setSelectedRole] = useState('developer')
  const [customRoles, setCustomRoles] = useState<any[]>([])
  const [isCreatingRole, setIsCreatingRole] = useState(false)

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background - matching dashboard */}
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
                    <Shield className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Organization Permissions</h1>
                </div>
                <p className="text-gray-400">Manage roles and permissions for your organization</p>
              </div>
              
              <div className="flex items-center gap-3">
                <Link href="/organization/members">
                  <Button variant="outline" className="border-gray-700 text-gray-300">
                    <Users className="w-4 h-4 mr-2" />
                    Team Members
                  </Button>
                </Link>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Role
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="roles" className="space-y-6">
            <TabsList className="bg-gray-800/30 border border-gray-700">
              <TabsTrigger value="roles" className="data-[state=active]:bg-indigo-600">
                <Shield className="w-4 h-4 mr-2" />
                Roles
              </TabsTrigger>
              <TabsTrigger value="permissions" className="data-[state=active]:bg-indigo-600">
                <Key className="w-4 h-4 mr-2" />
                Permissions
              </TabsTrigger>
              <TabsTrigger value="audit" className="data-[state=active]:bg-indigo-600">
                <Eye className="w-4 h-4 mr-2" />
                Audit Log
              </TabsTrigger>
            </TabsList>

            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-6">
              <div className="grid gap-6">
                {/* Default Roles */}
                <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Default Roles</CardTitle>
                    <CardDescription className="text-gray-400">
                      Pre-configured roles for common use cases
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {Object.entries(PERMISSION_GROUPS).map(([key, role]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:bg-gray-800/70 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${role.color.replace('text-', 'bg-').replace('400', '500/20')}`}>
                              <Shield className={`w-5 h-5 ${role.color.split(' ')[0]}`} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{role.name}</h4>
                              <p className="text-sm text-gray-400">{role.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={role.color}>
                              {role.permissions.length} permissions
                            </Badge>
                            <Button variant="ghost" size="sm" className="text-gray-400">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Custom Roles */}
                {customRoles.length > 0 && (
                  <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Custom Roles</CardTitle>
                      <CardDescription className="text-gray-400">
                        Roles created for your organization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-gray-500 text-center py-8">
                        No custom roles created yet
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Permissions Tab */}
            <TabsContent value="permissions" className="space-y-6">
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Permission Matrix</CardTitle>
                  <CardDescription className="text-gray-400">
                    Overview of all permissions by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {['viewing', 'management', 'admin'].map(category => (
                      <div key={category}>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                          {category} Permissions
                        </h3>
                        <div className="grid gap-3">
                          {PERMISSIONS_LIST
                            .filter(p => p.category === category)
                            .map(permission => (
                              <div
                                key={permission.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700"
                              >
                                <div className="flex items-center gap-3">
                                  <Key className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <div className="font-medium text-white">{permission.name}</div>
                                    <div className="text-sm text-gray-400">{permission.description}</div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {Object.entries(PERMISSION_GROUPS).map(([key, role]) => (
                                    <div
                                      key={key}
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        role.permissions.includes(permission.id) || role.permissions.includes('all')
                                          ? 'bg-green-500/20 text-green-400'
                                          : 'bg-gray-700 text-gray-500'
                                      }`}
                                      title={role.name}
                                    >
                                      {role.permissions.includes(permission.id) || role.permissions.includes('all') ? (
                                        <Check className="w-4 h-4" />
                                      ) : (
                                        <X className="w-4 h-4" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audit Log Tab */}
            <TabsContent value="audit" className="space-y-6">
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Permission Changes</CardTitle>
                  <CardDescription className="text-gray-400">
                    Recent permission and role modifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-500 text-center py-12">
                    <Eye className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p>No permission changes to display</p>
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