'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, UserPlus, Upload, Download, Search, Filter, 
  Mail, Shield, Activity, DollarSign, Settings, Edit,
  Trash2, Ban, Check, X, AlertTriangle, FileText,
  MoreVertical, ChevronDown, UserCheck, UserX, Clock
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { Session } from 'next-auth'
import { Checkbox } from '@/components/ui/checkbox'

interface Member {
  id: string
  email: string
  name: string | null
  role: string
  department: string | null
  jobTitle: string | null
  lastActiveAt: Date | null
  createdAt: Date
  invitedBy: string | null
  acceptedAt: Date | null
  usage: {
    totalCost: number
    totalTokens: number
    lastUsed: Date | null
  }
}

interface MembersClientProps {
  initialSession: Session
  organization: any
  userRole: string
}

export default function MembersClient({ initialSession, organization, userRole }: MembersClientProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Stats
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingInvites: 0,
    totalSpend: 0,
    avgSpendPerUser: 0,
    memberLimit: organization.maxUsers || null
  })

  useEffect(() => {
    fetchMembers()
    fetchInvitations()
    fetchStats()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/organization/members')
      const data = await res.json()
      setMembers(data.members || [])
    } catch (error) {
      console.error('Failed to fetch members:', error)
      toast({
        title: 'Error',
        description: 'Failed to load team members',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchInvitations = async () => {
    try {
      const res = await fetch('/api/organization/invitations')
      const data = await res.json()
      setInvitations(data.invitations || [])
    } catch (error) {
      console.error('Failed to fetch invitations:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/organization/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleInviteMember = async (emailList: string[], role: string) => {
    try {
      const res = await fetch('/api/organization/members/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emailList, role })
      })
      
      if (res.ok) {
        toast({
          title: 'Success',
          description: `Invited ${emailList.length} member(s) successfully`
        })
        setShowInviteModal(false)
        fetchInvitations()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invitations',
        variant: 'destructive'
      })
    }
  }

  const handleBulkUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/organization/members/bulk-upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast({
          title: 'Success',
          description: `Successfully processed ${data.processed} members`
        })
        setShowBulkUploadModal(false)
        fetchMembers()
        fetchInvitations()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to process file',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive'
      })
    }
  }

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/organization/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      
      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Member role updated successfully'
        })
        fetchMembers()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update member role',
        variant: 'destructive'
      })
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      const res = await fetch(`/api/organization/members/${memberId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Member removed successfully'
        })
        fetchMembers()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive'
      })
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = selectedRole === 'all' || member.role === selectedRole
    
    return matchesSearch && matchesRole
  })

  const canManageMembers = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'MANAGER'

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-indigo-400" />
                <h1 className="text-3xl font-bold text-white">Team Management</h1>
              </div>
              <p className="text-gray-400">{organization.name} - Manage your team members and permissions</p>
            </div>
            {canManageMembers && (
              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowInviteModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Members
                </Button>
                <Button 
                  onClick={() => setShowBulkUploadModal(true)}
                  variant="outline" 
                  className="border-gray-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Upload
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Members</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalMembers}
                    {stats.memberLimit && (
                      <span className="text-sm text-gray-400">/{stats.memberLimit}</span>
                    )}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Members</p>
                  <p className="text-2xl font-bold text-white">{stats.activeMembers}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending Invites</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingInvites}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Spend</p>
                  <p className="text-2xl font-bold text-white">${stats.totalSpend.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg/User</p>
                  <p className="text-2xl font-bold text-white">${stats.avgSpendPerUser.toFixed(2)}</p>
                </div>
                <Activity className="w-8 h-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="members" className="mt-8">
          <TabsList className="bg-gray-900/50 border border-gray-800">
            <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
            <TabsTrigger value="invitations">Invitations ({invitations.length})</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-6">
            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-800 text-white"
                />
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[180px] bg-gray-900/50 border-gray-800 text-white">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-gray-700">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            {/* Members Table */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        {canManageMembers && (
                          <th className="text-left p-4">
                            <Checkbox 
                              checked={selectedMembers.size === filteredMembers.length && filteredMembers.length > 0}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedMembers(new Set(filteredMembers.map(m => m.id)))
                                } else {
                                  setSelectedMembers(new Set())
                                }
                              }}
                            />
                          </th>
                        )}
                        <th className="text-left p-4 text-gray-400 font-medium">Member</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Role</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Department</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Usage</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Last Active</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                        {canManageMembers && (
                          <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((member) => (
                        <tr key={member.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                          {canManageMembers && (
                            <td className="p-4">
                              <Checkbox 
                                checked={selectedMembers.has(member.id)}
                                onCheckedChange={(checked) => {
                                  const newSelected = new Set(selectedMembers)
                                  if (checked) {
                                    newSelected.add(member.id)
                                  } else {
                                    newSelected.delete(member.id)
                                  }
                                  setSelectedMembers(newSelected)
                                }}
                              />
                            </td>
                          )}
                          <td className="p-4">
                            <div>
                              <p className="text-white font-medium">{member.name || 'Unnamed'}</p>
                              <p className="text-gray-400 text-sm">{member.email}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={
                              member.role === 'ADMIN' 
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                : member.role === 'MANAGER'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : member.role === 'USER'
                                ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                : 'bg-gray-700/50 text-gray-400 border-gray-600'
                            }>
                              {member.role}
                            </Badge>
                          </td>
                          <td className="p-4 text-gray-300">
                            {member.department || '-'}
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-white">${member.usage.totalCost.toFixed(2)}</p>
                              <p className="text-gray-400 text-sm">{member.usage.totalTokens.toLocaleString()} tokens</p>
                            </div>
                          </td>
                          <td className="p-4 text-gray-300">
                            {member.lastActiveAt 
                              ? new Date(member.lastActiveAt).toLocaleDateString()
                              : 'Never'
                            }
                          </td>
                          <td className="p-4">
                            {member.acceptedAt ? (
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                Invited
                              </Badge>
                            )}
                          </td>
                          {canManageMembers && (
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Select
                                  value={member.role}
                                  onValueChange={(value) => handleUpdateMemberRole(member.id, value)}
                                  disabled={member.email === initialSession.user?.email}
                                >
                                  <SelectTrigger className="w-[100px] h-8 bg-gray-800 border-gray-700 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="MANAGER">Manager</SelectItem>
                                    <SelectItem value="USER">User</SelectItem>
                                    <SelectItem value="VIEWER">Viewer</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveMember(member.id)}
                                  disabled={member.email === initialSession.user?.email}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitations">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left p-4 text-gray-400 font-medium">Email</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Role</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Invited By</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Invited On</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Expires</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invitations.map((invitation) => (
                        <tr key={invitation.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="p-4 text-white">{invitation.email}</td>
                          <td className="p-4">
                            <Badge>{invitation.role}</Badge>
                          </td>
                          <td className="p-4 text-gray-300">{invitation.invitedBy}</td>
                          <td className="p-4 text-gray-300">
                            {new Date(invitation.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-gray-300">
                            {new Date(invitation.expiresAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-400 hover:text-white"
                            >
                              Resend
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

          <TabsContent value="permissions">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Role Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Admin</h3>
                      <ul className="space-y-2 text-gray-400">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400" />
                          Manage team members
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400" />
                          Configure API keys
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400" />
                          View all usage data
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400" />
                          Manage billing
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Manager</h3>
                      <ul className="space-y-2 text-gray-400">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400" />
                          Invite team members
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400" />
                          View team usage
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400" />
                          Manage own API keys
                        </li>
                        <li className="flex items-center gap-2">
                          <X className="w-4 h-4 text-red-400" />
                          Manage billing
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteMembersModal
          onClose={() => setShowInviteModal(false)}
          onSubmit={handleInviteMember}
        />
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <BulkUploadModal
          onClose={() => setShowBulkUploadModal(false)}
          onUpload={handleBulkUpload}
        />
      )}
    </div>
  )
}

// Invite Members Modal
function InviteMembersModal({ onClose, onSubmit }: any) {
  const [emails, setEmails] = useState('')
  const [role, setRole] = useState('USER')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const emailList = emails.split(',').map(e => e.trim()).filter(e => e)
    onSubmit(emailList, role)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-2xl border border-gray-800 p-6 max-w-md w-full mx-4"
      >
        <h2 className="text-xl font-bold text-white mb-4">Invite Team Members</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Email Addresses *
            </label>
            <textarea
              required
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="email1@company.com, email2@company.com"
              className="w-full h-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Role
            </label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="VIEWER">Viewer</SelectItem>
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
              Send Invitations
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Bulk Upload Modal
function BulkUploadModal({ onClose, onUpload }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (file) {
      onUpload(file)
    }
  }

  const downloadTemplate = () => {
    const csv = `email,name,role,department,jobTitle
john.doe@company.com,John Doe,USER,Engineering,Software Engineer
jane.smith@company.com,Jane Smith,MANAGER,Product,Product Manager
bob.wilson@company.com,Bob Wilson,USER,Sales,Sales Representative`
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'member_upload_template.csv'
    a.click()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-2xl border border-gray-800 p-6 max-w-md w-full mx-4"
      >
        <h2 className="text-xl font-bold text-white mb-4">Bulk Upload Members</h2>
        
        <div className="mb-4 p-4 bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-400 mb-2">
            Upload a CSV file with member information. The file should include:
          </p>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• email (required)</li>
            <li>• name (optional)</li>
            <li>• role (ADMIN, MANAGER, USER, VIEWER)</li>
            <li>• department (optional)</li>
            <li>• jobTitle (optional)</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full border-gray-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              {file ? file.name : 'Choose CSV File'}
            </Button>
          </div>

          <Button
            type="button"
            onClick={downloadTemplate}
            variant="ghost"
            className="w-full text-indigo-400 hover:text-indigo-300"
          >
            <FileText className="w-4 h-4 mr-2" />
            Download Template
          </Button>

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
              disabled={!file}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
            >
              Upload & Process
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}