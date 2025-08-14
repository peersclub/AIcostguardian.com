'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  Shield, Settings, Users, Eye, Plus, Edit, Trash2, 
  Key, Lock, UserCheck, AlertTriangle, Check, X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import Link from 'next/link'

// Permission resources and actions
const RESOURCES = ['users', 'billing', 'api_keys', 'roles', 'organization', 'usage', 'alerts']
const ACTIONS = ['read', 'write', 'delete']

interface Role {
  id: string
  name: string
  description: string
  isSystem: boolean
  permissions: Permission[]
  users: any[]
  createdAt: string
  updatedAt: string
}

interface Permission {
  id: string
  resource: string
  action: string
}

export default function OrganizationPermissionsPage() {
  const { data: session } = useSession()
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as { resource: string; action: string }[]
  })

  useEffect(() => {
    if (session) {
      fetchRoles()
    }
  }, [session])

  const fetchRoles = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/organization/roles')
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      } else {
        console.error('Failed to fetch roles')
        toast({
          title: 'Error',
          description: 'Failed to load roles',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
      toast({
        title: 'Error',
        description: 'Failed to load roles',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateRole = async () => {
    if (!newRole.name.trim()) {
      toast({
        title: 'Error',
        description: 'Role name is required',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch('/api/organization/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRole)
      })

      if (response.ok) {
        const role = await response.json()
        setRoles([...roles, role])
        setShowCreateDialog(false)
        setNewRole({
          name: '',
          description: '',
          permissions: []
        })
        toast({
          title: 'Success',
          description: 'Role created successfully'
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to create role',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error creating role:', error)
      toast({
        title: 'Error',
        description: 'Failed to create role',
        variant: 'destructive'
      })
    }
  }

  const handleUpdateRole = async () => {
    if (!editingRole) return

    try {
      const response = await fetch('/api/organization/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: editingRole.id,
          name: editingRole.name,
          description: editingRole.description,
          permissions: editingRole.permissions
        })
      })

      if (response.ok) {
        const updatedRole = await response.json()
        setRoles(roles.map(r => r.id === updatedRole.id ? updatedRole : r))
        setEditingRole(null)
        toast({
          title: 'Success',
          description: 'Role updated successfully'
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update role',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return

    try {
      const response = await fetch(`/api/organization/roles?id=${roleId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setRoles(roles.filter(r => r.id !== roleId))
        toast({
          title: 'Success',
          description: 'Role deleted successfully'
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete role',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error deleting role:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete role',
        variant: 'destructive'
      })
    }
  }

  const togglePermission = (resource: string, action: string, roleState: any, setRoleState: any) => {
    const permissions = roleState.permissions || []
    const exists = permissions.some((p: any) => p.resource === resource && p.action === action)
    
    if (exists) {
      setRoleState({
        ...roleState,
        permissions: permissions.filter((p: any) => !(p.resource === resource && p.action === action))
      })
    } else {
      setRoleState({
        ...roleState,
        permissions: [...permissions, { resource, action }]
      })
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
                    <Shield className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Roles & Permissions</h1>
                </div>
                <p className="text-gray-400">Manage access control for your organization</p>
              </div>
              
              <div className="flex items-center gap-3">
                <Link href="/organization">
                  <Button variant="outline" className="border-gray-700 text-gray-300">
                    Back to Organization
                  </Button>
                </Link>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Create New Role</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Define a new role with specific permissions
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label className="text-gray-300">Role Name</Label>
                        <Input
                          value={newRole.name}
                          onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                          placeholder="e.g., Editor"
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Description</Label>
                        <Textarea
                          value={newRole.description}
                          onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                          placeholder="Describe what this role can do"
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300 mb-3 block">Permissions</Label>
                        <div className="space-y-4 max-h-64 overflow-y-auto">
                          {RESOURCES.map(resource => (
                            <div key={resource} className="space-y-2">
                              <div className="text-sm font-medium text-gray-400 capitalize">{resource}</div>
                              <div className="flex gap-2">
                                {ACTIONS.map(action => (
                                  <label
                                    key={action}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={newRole.permissions.some(p => 
                                        p.resource === resource && p.action === action
                                      )}
                                      onChange={() => togglePermission(resource, action, newRole, setNewRole)}
                                      className="rounded border-gray-600"
                                    />
                                    <span className="text-sm text-gray-300">{action}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowCreateDialog(false)}
                          className="border-gray-700 text-gray-300"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateRole}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          Create Role
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <Tabs defaultValue="roles" className="space-y-6">
            <TabsList className="bg-gray-900/50 border border-gray-700">
              <TabsTrigger value="roles" className="data-[state=active]:bg-indigo-600">
                <Shield className="w-4 h-4 mr-2" />
                Roles
              </TabsTrigger>
              <TabsTrigger value="permissions" className="data-[state=active]:bg-indigo-600">
                <Key className="w-4 h-4 mr-2" />
                Permission Matrix
              </TabsTrigger>
            </TabsList>

            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-6">
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Organization Roles</CardTitle>
                  <CardDescription className="text-gray-400">
                    {roles.length} roles configured for your organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-4"></div>
                      <p className="text-gray-400">Loading roles...</p>
                    </div>
                  ) : roles.length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No roles configured yet</p>
                      <p className="text-gray-500 text-sm mt-1">Create your first role to get started</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {roles.map((role) => (
                        <div
                          key={role.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:bg-gray-800/70 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                              <Shield className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white flex items-center gap-2">
                                {role.name}
                                {role.isSystem && (
                                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                    System
                                  </Badge>
                                )}
                              </h4>
                              <p className="text-sm text-gray-400">{role.description || 'No description'}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-gray-500">
                                  {role.permissions.length} permissions
                                </span>
                                <span className="text-xs text-gray-500">
                                  {role.users.length} users
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingRole(role)}
                              className="text-gray-400 hover:text-white"
                              disabled={role.isSystem}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRole(role.id)}
                              className="text-red-400 hover:text-red-300"
                              disabled={role.isSystem}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Permissions Tab */}
            <TabsContent value="permissions" className="space-y-6">
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Permission Matrix</CardTitle>
                  <CardDescription className="text-gray-400">
                    Overview of all permissions across roles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-400">Resource</th>
                          {roles.map(role => (
                            <th key={role.id} className="text-center py-3 px-4 text-gray-400">
                              {role.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {RESOURCES.map(resource => (
                          <tr key={resource} className="border-b border-gray-800">
                            <td className="py-3 px-4 text-white capitalize">{resource}</td>
                            {roles.map(role => {
                              const permissions = role.permissions.filter(p => p.resource === resource)
                              return (
                                <td key={role.id} className="text-center py-3 px-4">
                                  <div className="flex justify-center gap-1">
                                    {ACTIONS.map(action => {
                                      const hasPermission = permissions.some(p => p.action === action)
                                      return (
                                        <div
                                          key={action}
                                          className={`w-2 h-2 rounded-full ${
                                            hasPermission ? 'bg-green-500' : 'bg-gray-700'
                                          }`}
                                          title={`${action} ${resource}`}
                                        />
                                      )
                                    })}
                                  </div>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>Has permission</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-700" />
                      <span>No permission</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Role Dialog */}
      {editingRole && (
        <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Role</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update role details and permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-gray-300">Role Name</Label>
                <Input
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Description</Label>
                <Textarea
                  value={editingRole.description}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300 mb-3 block">Permissions</Label>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {RESOURCES.map(resource => (
                    <div key={resource} className="space-y-2">
                      <div className="text-sm font-medium text-gray-400 capitalize">{resource}</div>
                      <div className="flex gap-2">
                        {ACTIONS.map(action => (
                          <label
                            key={action}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={editingRole.permissions.some(p => 
                                p.resource === resource && p.action === action
                              )}
                              onChange={() => togglePermission(resource, action, editingRole, setEditingRole)}
                              className="rounded border-gray-600"
                            />
                            <span className="text-sm text-gray-300">{action}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setEditingRole(null)}
                  className="border-gray-700 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateRole}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Update Role
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}