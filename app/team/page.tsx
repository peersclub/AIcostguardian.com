'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, DollarSign, Phone, CheckCircle, UserCheck, Crown, Settings, Trash2, Mail } from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'member'
  status: 'active' | 'pending' | 'inactive'
  joinedAt: Date
  lastActive: Date
  usage: {
    totalCalls: number
    totalCost: number
    thisMonth: number
  }
  company: string
}

interface InviteData {
  email: string
  role: 'admin' | 'manager' | 'member'
  message?: string
}

export default function TeamManagement() {
  const { data: session } = useSession()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteData, setInviteData] = useState<InviteData>({ email: '', role: 'member' })
  const [isInviting, setIsInviting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')

  useEffect(() => {
    if (session?.user?.id) {
      fetchTeamMembers()
    }
  }, [session])

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/organization/members')
      if (response.ok) {
        const members = await response.json()
        setTeamMembers(members.map((member: any) => ({
          ...member,
          joinedAt: new Date(member.joinedAt),
          lastActive: new Date(member.lastActive)
        })))
      }
    } catch (error) {
      console.error('Failed to fetch team members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteMember = async () => {
    if (!inviteData.email.trim()) {
      alert('Please enter an email address')
      return
    }

    setIsInviting(true)
    try {
      const response = await fetch('/api/organization/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteData)
      })

      const result = await response.json()

      if (response.ok) {
        await fetchTeamMembers() // Refresh the list
        setInviteData({ email: '', role: 'member' })
        setShowInviteModal(false)
        alert('✅ Invitation sent successfully!')
      } else {
        alert(`❌ ${result.error || 'Failed to send invitation'}`)
      }
    } catch (error) {
      alert('❌ Failed to send invitation')
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return
    
    try {
      const response = await fetch(`/api/organization/members/${memberId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchTeamMembers() // Refresh the list
        alert('Team member removed successfully')
      } else {
        const result = await response.json()
        alert(`❌ ${result.error || 'Failed to remove team member'}`)
      }
    } catch (error) {
      alert('❌ Failed to remove team member')
    }
  }

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'manager' | 'member') => {
    try {
      const response = await fetch('/api/organization/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, updates: { role: newRole } })
      })

      if (response.ok) {
        await fetchTeamMembers() // Refresh the list
        alert('Role updated successfully')
      } else {
        const result = await response.json()
        alert(`❌ ${result.error || 'Failed to update role'}`)
      }
    } catch (error) {
      alert('❌ Failed to update role')
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-900/20 text-red-300 border-red-500/30'
      case 'manager': return 'bg-blue-900/20 text-blue-300 border-blue-500/30'
      case 'member': return 'bg-green-900/20 text-green-300 border-green-500/30'
      default: return 'bg-gray-800/30 text-gray-300 border-gray-600/50'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-900/20 text-green-300 border-green-500/30'
      case 'pending': return 'bg-yellow-900/20 text-yellow-300 border-yellow-500/30'
      case 'inactive': return 'bg-gray-800/30 text-gray-400 border-gray-600/50'
      default: return 'bg-gray-800/30 text-gray-300 border-gray-600/50'
    }
  }

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(cost)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === 'all' || member.role === selectedRole
    return matchesSearch && matchesRole
  })

  const totalUsage = teamMembers.reduce((sum, member) => ({
    calls: sum.calls + member.usage.totalCalls,
    cost: sum.cost + member.usage.totalCost
  }), { calls: 0, cost: 0 })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 p-6 relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-green-600 to-blue-600 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-10 animate-pulse delay-500"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading team management...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-green-600 to-blue-600 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-10 animate-pulse delay-500"></div>
      </div>
      
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <motion.div 
          className="flex justify-between items-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Users className="w-8 h-8 mr-3 text-blue-400" />
              Team Management
            </h1>
            <p className="text-gray-300 mt-2">
              Manage your team members, roles, and Claude API usage
            </p>
          </div>
          <Button
            onClick={() => setShowInviteModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </motion.div>

        {/* Team Overview Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <motion.div 
            className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Total Members</p>
                <p className="text-2xl font-bold text-blue-300">{teamMembers.length}</p>
              </div>
              <div className="p-3 bg-blue-900/30 rounded-full">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-green-900/50 to-emerald-800/50 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Active Members</p>
                <p className="text-2xl font-bold text-green-300">
                  {teamMembers.filter(m => m.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-green-900/30 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Total API Calls</p>
                <p className="text-2xl font-bold text-purple-300">{totalUsage.calls.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-900/30 rounded-full">
                <Phone className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 backdrop-blur-xl rounded-2xl border border-orange-500/30 p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Total Costs</p>
                <p className="text-2xl font-bold text-orange-300">{formatCost(totalUsage.cost)}</p>
              </div>
              <div className="p-3 bg-orange-900/30 rounded-full">
                <DollarSign className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="member">Member</option>
            </select>
          </div>
        </motion.div>

        {/* Team Members List */}
        <motion.div 
          className="bg-gradient-to-br from-indigo-900/50 to-purple-800/50 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white">Team Members ({filteredMembers.length})</h3>
            <p className="text-gray-300 mt-1">
              Manage your team members and their access levels
            </p>
          </div>
          <div className="space-y-4">
            {filteredMembers.map((member, index) => (
              <motion.div 
                key={member.id} 
                className="p-4 border border-gray-600 rounded-lg bg-gray-800/30 hover:bg-gray-700/30 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * index }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{member.name}</h3>
                      <p className="text-sm text-gray-300">{member.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getRoleBadgeColor(member.role)}>
                          {member.role}
                        </Badge>
                        <Badge className={getStatusBadgeColor(member.status)}>
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Usage Stats */}
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {member.usage.totalCalls.toLocaleString()} calls
                      </p>
                      <p className="text-sm text-gray-300">
                        {formatCost(member.usage.totalCost)} total
                      </p>
                      <p className="text-xs text-gray-400">
                        Last active: {formatDate(member.lastActive)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {session?.user?.email !== member.email && (
                        <>
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                            className="text-sm px-2 py-1 bg-gray-800/50 border border-gray-600 rounded text-white focus:border-blue-400 focus:outline-none"
                          >
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="member">Member</option>
                          </select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-400 hover:text-red-300 border-gray-600 hover:bg-gray-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {session?.user?.email === member.email && (
                        <Badge className="bg-blue-900/20 text-blue-300 border-blue-500/30">You</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredMembers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">No team members found matching your criteria.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <motion.div 
              className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 w-full max-w-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-blue-400" />
                Invite Team Member
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="john.doe@company.com"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Must be an enterprise email address (no gmail.com, yahoo.com, etc.)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={inviteData.role}
                    onChange={(e) => setInviteData({ ...inviteData, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="member">Member - Basic access</option>
                    <option value="manager">Manager - Team oversight</option>
                    <option value="admin">Admin - Full access</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Welcome Message (Optional)
                  </label>
                  <textarea
                    placeholder="Welcome to our AI Credit Tracker team!"
                    value={inviteData.message || ''}
                    onChange={(e) => setInviteData({ ...inviteData, message: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowInviteModal(false)}
                  disabled={isInviting}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInviteMember}
                  disabled={isInviting}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0"
                >
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}