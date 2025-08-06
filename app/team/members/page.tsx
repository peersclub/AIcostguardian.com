'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users,
  UserPlus,
  Crown,
  Shield,
  User,
  Mail,
  MoreVertical,
  Search,
  Filter,
  Settings,
  Trash2,
  Edit,
  Key,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

export default function TeamMembers() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  // Mock team members data
  const teamMembers = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@company.com',
      role: 'owner',
      status: 'active',
      avatar: 'JS',
      lastActive: '2024-01-29T10:30:00Z',
      joinDate: '2023-08-15',
      aiUsage: 2847.32,
      permissions: ['all'],
      twoFactorEnabled: true,
      inviteStatus: null
    },
    {
      id: '2',
      name: 'Sarah Chen',
      email: 'sarah.chen@company.com',
      role: 'admin',
      status: 'active',
      avatar: 'SC',
      lastActive: '2024-01-29T09:15:00Z',
      joinDate: '2023-09-20',
      aiUsage: 1923.45,
      permissions: ['analytics', 'team_management', 'billing'],
      twoFactorEnabled: true,
      inviteStatus: null
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      email: 'mike.rodriguez@company.com',
      role: 'member',
      status: 'active',
      avatar: 'MR',
      lastActive: '2024-01-28T16:45:00Z',
      joinDate: '2023-10-05',
      aiUsage: 1234.67,
      permissions: ['analytics'],
      twoFactorEnabled: false,
      inviteStatus: null
    },
    {
      id: '4',
      name: 'Emily Johnson',
      email: 'emily.johnson@company.com',
      role: 'member',
      status: 'inactive',
      avatar: 'EJ',
      lastActive: '2024-01-15T14:20:00Z',
      joinDate: '2023-11-12',
      aiUsage: 678.91,
      permissions: ['analytics'],
      twoFactorEnabled: false,
      inviteStatus: null
    },
    {
      id: '5',
      name: 'David Park',
      email: 'david.park@company.com',
      role: 'member',
      status: 'pending',
      avatar: 'DP',
      lastActive: null,
      joinDate: null,
      aiUsage: 0,
      permissions: ['analytics'],
      twoFactorEnabled: false,
      inviteStatus: 'pending'
    }
  ]

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return Crown
      case 'admin': return Shield
      default: return User
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'text-yellow-400'
      case 'admin': return 'text-purple-400'
      default: return 'text-blue-400'
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

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === 'all' || member.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const formatLastActive = (lastActive: string | null) => {
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
              
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Invite Member
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-xl font-bold text-white">{teamMembers.length}</div>
                    <div className="text-gray-400 text-sm">Total Members</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-xl font-bold text-white">
                      {teamMembers.filter(m => m.status === 'active').length}
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
                      {teamMembers.filter(m => m.status === 'pending').length}
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
                      {teamMembers.filter(m => m.role === 'admin' || m.role === 'owner').length}
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
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
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
                  {filteredMembers.map((member) => {
                    const RoleIcon = getRoleIcon(member.role)
                    const StatusIcon = getStatusIcon(member.status)
                    
                    return (
                      <tr key={member.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {member.avatar}
                            </div>
                            <div>
                              <div className="text-white font-medium">{member.name}</div>
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
                            <span className="capitalize font-medium">{member.role}</span>
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className={`flex items-center gap-2 ${getStatusColor(member.status)}`}>
                            <StatusIcon className="w-4 h-4" />
                            <span className="capitalize">{member.status}</span>
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="text-white font-medium">
                            ${member.aiUsage.toLocaleString()}
                          </div>
                          <div className="text-gray-400 text-sm">This month</div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="text-white">{formatLastActive(member.lastActive)}</div>
                          {member.joinDate && (
                            <div className="text-gray-400 text-sm flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Joined {new Date(member.joinDate).toLocaleDateString()}
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
                            {member.role !== 'owner' && (
                              <>
                                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                                  <Settings className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Empty State */}
          {filteredMembers.length === 0 && (
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
    </div>
  )
}