'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, UserPlus, Upload, Download, Search, Filter, 
  Mail, Shield, Activity, DollarSign, Settings, Edit,
  Trash2, Ban, Check, X, AlertTriangle, FileText,
  MoreVertical, ChevronDown, UserCheck, UserX, Clock,
  Crown, User, Calendar, CheckCircle, AlertCircle, Key
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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
  twoFactorEnabled?: boolean
  status?: 'active' | 'inactive' | 'pending'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [inviteEmails, setInviteEmails] = useState('')
  const [inviteRole, setInviteRole] = useState('USER')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [csrfToken, setCsrfToken] = useState<string | null>(null)

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
    // Fetch CSRF token
    fetch('/api/csrf')
      .then(res => res.json())
      .then(data => setCsrfToken(data.token))
      .catch(err => console.error('Failed to fetch CSRF token:', err))
    
    fetchMembers()
    fetchInvitations()
    fetchStats()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/organization/members')
      const data = await res.json()
      
      // Add status based on lastActiveAt and acceptedAt
      const membersWithStatus = (data.members || []).map((member: Member) => ({
        ...member,
        status: member.acceptedAt ? 
          (member.lastActiveAt && new Date(member.lastActiveAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 'active' : 'inactive') 
          : 'pending',
        twoFactorEnabled: Math.random() > 0.5 // Mock 2FA status
      }))
      
      setMembers(membersWithStatus)
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

  const handleInviteMember = async () => {
    const emailList = inviteEmails.split(',').map(e => e.trim()).filter(e => e)
    
    if (emailList.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter at least one email address',
        variant: 'destructive'
      })
      return
    }

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken
      }

      const res = await fetch('/api/organization/members/invite', {
        method: 'POST',
        headers,
        body: JSON.stringify({ emails: emailList, role: inviteRole })
      })
      
      if (res.ok) {
        toast({
          title: 'Success',
          description: `Invited ${emailList.length} member(s) successfully`
        })
        setShowInviteModal(false)
        setInviteEmails('')
        fetchInvitations()
        fetchMembers()
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
      const headers: HeadersInit = {}
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken
      }

      const res = await fetch('/api/organization/members/bulk-upload', {
        method: 'POST',
        headers,
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
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive'
      })
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken
      }

      const res = await fetch(`/api/organization/members/${memberId}`, {
        method: 'DELETE',
        headers
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

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken
      }

      const res = await fetch(`/api/organization/members/${memberId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ role: newRole })
      })
      
      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Role updated successfully'
        })
        fetchMembers()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive'
      })
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER': 
      case 'SUPER_ADMIN': 
        return Crown
      case 'ADMIN': 
      case 'MANAGER': 
        return Shield
      default: 
        return User
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER':
      case 'SUPER_ADMIN':
        return 'text-yellow-400'
      case 'ADMIN':
      case 'MANAGER':
        return 'text-purple-400'
      default:
        return 'text-blue-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'inactive': return 'text-gray-400'
      case 'pending': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle
      case 'inactive': return AlertCircle
      case 'pending': return Clock
      default: return AlertCircle
    }
  }

  const formatLastActive = (lastActive: Date | null) => {
    if (!lastActive) return 'Never'
    const date = new Date(lastActive)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === 'all' || member.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const allMembers = [...filteredMembers, ...invitations.map(inv => ({
    ...inv,
    status: 'pending' as const,
    role: inv.role || 'USER',
    usage: { totalCost: 0, totalTokens: 0, lastUsed: null }
  }))]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
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
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Team Members</h1>
                </div>
                <p className="text-gray-400">Manage your team members, roles, and permissions</p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowBulkUploadModal(true)}
                  variant="outline"
                  className="bg-gray-900/50 border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Upload
                </Button>
                <Button 
                  onClick={() => setShowInviteModal(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-xl font-bold text-white">{members.length}</div>
                    <div className="text-gray-400 text-sm">Total Members</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-xl font-bold text-white">
                      {members.filter(m => m.status === 'active').length}
                    </div>
                    <div className="text-gray-400 text-sm">Active</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <div>
                    <div className="text-xl font-bold text-white">
                      {invitations.length}
                    </div>
                    <div className="text-gray-400 text-sm">Pending</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-xl font-bold text-white">
                      {members.filter(m => m.role === 'ADMIN' || m.role === 'MANAGER' || m.role === 'OWNER').length}
                    </div>
                    <div className="text-gray-400 text-sm">Admins</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-[180px] bg-gray-800/50 border-gray-700 text-white">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="OWNER">Owner</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="USER">Member</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[180px] bg-gray-800/50 border-gray-700 text-white">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Members Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50 border-b border-gray-700">
                  <tr>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Member</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Role</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">AI Usage</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Last Active</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Security</th>
                    <th className="text-center py-4 px-6 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        Loading members...
                      </td>
                    </tr>
                  ) : allMembers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        No members found
                      </td>
                    </tr>
                  ) : (
                    allMembers.map((member) => {
                      const RoleIcon = getRoleIcon(member.role)
                      const StatusIcon = getStatusIcon(member.status!)
                      
                      return (
                        <tr key={member.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {member.name?.[0] || member.email[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="text-white font-medium">{member.name || 'Pending'}</div>
                                <div className="text-gray-400 text-sm flex items-center gap-2">
                                  <Mail className="w-3 h-3" />
                                  {member.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="py-4 px-6">
                            <div className={`flex items-center gap-2 ${getRoleColor(member.role)}`}>
                              <RoleIcon className="w-4 h-4" />
                              <span className="capitalize font-medium">
                                {member.role.toLowerCase().replace('_', ' ')}
                              </span>
                            </div>
                          </td>
                          
                          <td className="py-4 px-6">
                            <div className={`flex items-center gap-2 ${getStatusColor(member.status!)}`}>
                              <StatusIcon className="w-4 h-4" />
                              <span className="capitalize">{member.status}</span>
                            </div>
                          </td>
                          
                          <td className="py-4 px-6">
                            <div className="text-white font-medium">
                              ${member.usage.totalCost.toFixed(2)}
                            </div>
                            <div className="text-gray-400 text-sm">This month</div>
                          </td>
                          
                          <td className="py-4 px-6">
                            <div className="text-white">{formatLastActive(member.lastActiveAt)}</div>
                            {member.createdAt && (
                              <div className="text-gray-400 text-sm flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Joined {new Date(member.createdAt).toLocaleDateString()}
                              </div>
                            )}
                          </td>
                          
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              {member.twoFactorEnabled ? (
                                <div className="flex items-center gap-1 text-green-400">
                                  <Shield className="w-4 h-4" />
                                  <span className="text-sm">2FA</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-gray-400">
                                  <Key className="w-4 h-4" />
                                  <span className="text-sm">Basic</span>
                                </div>
                              )}
                            </div>
                          </td>
                          
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              {member.role !== 'OWNER' && member.role !== 'SUPER_ADMIN' && (
                                <>
                                  <Select 
                                    value={member.role} 
                                    onValueChange={(value) => handleUpdateRole(member.id, value)}
                                  >
                                    <SelectTrigger className="w-24 h-8 bg-gray-800/50 border-gray-700 text-white text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900 border-gray-700">
                                      <SelectItem value="USER">Member</SelectItem>
                                      <SelectItem value="MANAGER">Manager</SelectItem>
                                      {userRole === 'OWNER' || userRole === 'SUPER_ADMIN' ? (
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                      ) : null}
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    onClick={() => handleRemoveMember(member.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-red-400 hover:bg-gray-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-white hover:bg-gray-700"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Empty State */}
          {!loading && filteredMembers.length === 0 && invitations.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-12"
            >
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No members found</p>
              <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
            <DialogDescription className="text-gray-400">
              Send invitations to new team members. They'll receive an email to join your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="emails">Email Addresses</Label>
              <Textarea
                id="emails"
                placeholder="Enter email addresses separated by commas..."
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                rows={3}
              />
              <p className="text-sm text-gray-400">
                Example: john@company.com, jane@company.com
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Default Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="USER">Member</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  {userRole === 'OWNER' || userRole === 'SUPER_ADMIN' ? (
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  ) : null}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInviteModal(false)}
              className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInviteMember}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Send Invitations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Modal */}
      <Dialog open={showBulkUploadModal} onOpenChange={setShowBulkUploadModal}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Bulk Upload Members</DialogTitle>
            <DialogDescription className="text-gray-400">
              Upload a CSV file with member information to add multiple members at once.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>CSV Format</Label>
              <div className="bg-gray-800 rounded-lg p-3 text-sm font-mono text-gray-300">
                email,name,role,department<br/>
                john@company.com,John Smith,USER,Engineering<br/>
                jane@company.com,Jane Doe,MANAGER,Product
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="csv-file">Choose CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                ref={fileInputRef}
                className="bg-gray-800 border-gray-700 text-white file:bg-gray-700 file:text-gray-300 file:border-0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkUploadModal(false)}
              className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const file = fileInputRef.current?.files?.[0]
                if (file) {
                  handleBulkUpload(file)
                }
              }}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Upload & Process
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}