'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Settings,
  Users,
  BarChart3,
  CreditCard,
  Globe,
  Database,
  Key,
  Crown,
  User,
  AlertTriangle,
  CheckCircle,
  Info,
  Plus,
  Edit,
  Trash2,
  Copy
} from 'lucide-react'

export default function TeamPermissions() {
  const [selectedRole, setSelectedRole] = useState('admin')

  // Permission categories and their permissions
  const permissionCategories = {
    'Team Management': {
      icon: Users,
      color: 'blue',
      permissions: [
        { id: 'invite_members', name: 'Invite team members', description: 'Send invitations to new team members' },
        { id: 'remove_members', name: 'Remove team members', description: 'Remove members from the team' },
        { id: 'edit_member_roles', name: 'Edit member roles', description: 'Change roles and permissions for team members' },
        { id: 'view_member_activity', name: 'View member activity', description: 'See activity logs and usage statistics for team members' }
      ]
    },
    'Analytics & Reports': {
      icon: BarChart3,
      color: 'green',
      permissions: [
        { id: 'view_analytics', name: 'View analytics', description: 'Access all analytics dashboards and reports' },
        { id: 'export_reports', name: 'Export reports', description: 'Download and export usage reports and data' },
        { id: 'create_custom_reports', name: 'Create custom reports', description: 'Build custom analytics reports and dashboards' },
        { id: 'view_cost_trends', name: 'View cost trends', description: 'Access cost analysis and forecasting tools' }
      ]
    },
    'Billing & Payments': {
      icon: CreditCard,
      color: 'purple',
      permissions: [
        { id: 'view_billing', name: 'View billing information', description: 'See billing history, invoices, and payment methods' },
        { id: 'manage_billing', name: 'Manage billing', description: 'Update payment methods and billing information' },
        { id: 'view_usage_costs', name: 'View usage costs', description: 'See detailed cost breakdowns and spending' },
        { id: 'set_budgets', name: 'Set budgets and limits', description: 'Configure spending limits and budget alerts' }
      ]
    },
    'AI Provider Settings': {
      icon: Globe,
      color: 'orange',
      permissions: [
        { id: 'view_providers', name: 'View AI providers', description: 'See configured AI providers and their settings' },
        { id: 'manage_providers', name: 'Manage AI providers', description: 'Add, remove, and configure AI provider connections' },
        { id: 'view_api_keys', name: 'View API keys', description: 'See masked API keys and connection status' },
        { id: 'manage_api_keys', name: 'Manage API keys', description: 'Add, edit, and revoke API keys for AI providers' }
      ]
    },
    'Data & Security': {
      icon: Database,
      color: 'red',
      permissions: [
        { id: 'view_audit_logs', name: 'View audit logs', description: 'Access security logs and user activity records' },
        { id: 'manage_security', name: 'Manage security settings', description: 'Configure 2FA requirements and security policies' },
        { id: 'export_data', name: 'Export data', description: 'Download organization data and usage information' },
        { id: 'delete_data', name: 'Delete data', description: 'Permanently delete usage data and records' }
      ]
    }
  }

  // Role definitions with their permissions
  const roles = {
    owner: {
      name: 'Owner',
      description: 'Full access to all features and settings',
      icon: Crown,
      color: 'yellow',
      permissions: Object.values(permissionCategories).flatMap(cat => cat.permissions.map(p => p.id)),
      isSystemRole: true
    },
    admin: {
      name: 'Administrator',
      description: 'Manage team members and most organizational settings',
      icon: Shield,
      color: 'purple',
      permissions: [
        'invite_members', 'remove_members', 'edit_member_roles', 'view_member_activity',
        'view_analytics', 'export_reports', 'create_custom_reports', 'view_cost_trends',
        'view_billing', 'view_usage_costs', 'set_budgets',
        'view_providers', 'manage_providers', 'view_api_keys',
        'view_audit_logs', 'manage_security', 'export_data'
      ],
      isSystemRole: true
    },
    member: {
      name: 'Member',
      description: 'View analytics and basic organizational information',
      icon: User,
      color: 'blue',
      permissions: [
        'view_analytics', 'export_reports', 'view_cost_trends',
        'view_billing', 'view_usage_costs',
        'view_providers'
      ],
      isSystemRole: true
    },
    analyst: {
      name: 'Analyst',
      description: 'Advanced analytics access with reporting capabilities',
      icon: BarChart3,
      color: 'green',
      permissions: [
        'view_analytics', 'export_reports', 'create_custom_reports', 'view_cost_trends',
        'view_billing', 'view_usage_costs', 'set_budgets',
        'view_providers', 'view_audit_logs'
      ],
      isSystemRole: false
    }
  }

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
      green: 'text-green-400 bg-green-500/20 border-green-500/30',
      purple: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
      orange: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
      red: 'text-red-400 bg-red-500/20 border-red-500/30',
      yellow: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const hasPermission = (roleKey: string, permissionId: string) => {
    return roles[roleKey as keyof typeof roles]?.permissions.includes(permissionId) || false
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-red-900/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
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
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Shield className="w-6 h-6 text-purple-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Permissions & Roles</h1>
                </div>
                <p className="text-gray-400">Manage team roles and control access to features</p>
              </div>
              
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Clone Role
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Custom Role
                </button>
              </div>
            </div>

            {/* Role Selector */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <Key className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-white">Select Role to View/Edit</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(roles).map(([roleKey, role]) => {
                  const RoleIcon = role.icon
                  const isSelected = selectedRole === roleKey
                  
                  return (
                    <button
                      key={roleKey}
                      onClick={() => setSelectedRole(roleKey)}
                      className={`p-4 rounded-lg border transition-all text-left ${
                        isSelected
                          ? `${getColorClasses(role.color)} border-opacity-100`
                          : 'bg-gray-800/30 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <RoleIcon className={`w-5 h-5 ${isSelected ? '' : 'text-gray-400'}`} />
                        <span className={`font-semibold ${isSelected ? '' : 'text-white'}`}>
                          {role.name}
                        </span>
                        {role.isSystemRole && (
                          <span className="px-2 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-full">
                            System
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${isSelected ? 'opacity-90' : 'text-gray-400'}`}>
                        {role.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Permissions Matrix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {Object.entries(permissionCategories).map(([categoryName, category], index) => {
              const CategoryIcon = category.icon
              
              return (
                <div key={categoryName} className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden">
                  <div className={`p-6 border-b border-gray-800 ${getColorClasses(category.color).replace('border-opacity-30', 'border-opacity-10')}`}>
                    <div className="flex items-center gap-3">
                      <CategoryIcon className={`w-6 h-6 text-${category.color}-400`} />
                      <h3 className="text-lg font-semibold text-white">{categoryName}</h3>
                      <span className="text-gray-400 text-sm">
                        {category.permissions.filter(p => hasPermission(selectedRole, p.id)).length} / {category.permissions.length} permissions
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-4">
                      {category.permissions.map((permission) => {
                        const hasAccess = hasPermission(selectedRole, permission.id)
                        
                        return (
                          <div key={permission.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                                  hasAccess
                                    ? `bg-${category.color}-500 border-${category.color}-500`
                                    : 'border-gray-600'
                                }`}>
                                  {hasAccess && (
                                    <CheckCircle className={`w-4 h-4 text-white`} />
                                  )}
                                </div>
                                <h4 className="text-white font-medium">{permission.name}</h4>
                                {hasAccess && (
                                  <CheckCircle className={`w-4 h-4 text-${category.color}-400`} />
                                )}
                              </div>
                              <p className="text-gray-400 text-sm ml-7">{permission.description}</p>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              {roles[selectedRole as keyof typeof roles]?.isSystemRole ? (
                                <span className="px-3 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-full">
                                  System Role
                                </span>
                              ) : (
                                <button
                                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                    hasAccess
                                      ? `bg-${category.color}-600 text-white hover:bg-${category.color}-700`
                                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  }`}
                                >
                                  {hasAccess ? 'Revoke' : 'Grant'}
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </motion.div>

          {/* Role Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Info className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Role Summary</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-800/30 rounded-lg">
                <div className="text-2xl font-bold text-white mb-2">
                  {roles[selectedRole as keyof typeof roles]?.permissions.length || 0}
                </div>
                <div className="text-gray-400 text-sm">Total Permissions</div>
              </div>
              
              <div className="p-4 bg-gray-800/30 rounded-lg">
                <div className="text-2xl font-bold text-white mb-2">
                  {Object.keys(permissionCategories).length}
                </div>
                <div className="text-gray-400 text-sm">Permission Categories</div>
              </div>
              
              <div className="p-4 bg-gray-800/30 rounded-lg">
                <div className="text-2xl font-bold text-white mb-2">
                  {roles[selectedRole as keyof typeof roles]?.isSystemRole ? 'System' : 'Custom'}
                </div>
                <div className="text-gray-400 text-sm">Role Type</div>
              </div>
            </div>
            
            {!roles[selectedRole as keyof typeof roles]?.isSystemRole && (
              <div className="mt-6 flex gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Save Changes
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Role
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}