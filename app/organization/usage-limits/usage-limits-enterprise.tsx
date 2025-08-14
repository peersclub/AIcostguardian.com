'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { 
  Activity, Users, DollarSign, Zap, AlertTriangle, 
  Settings, Save, Edit2, Plus, Trash2, TrendingUp,
  ChevronRight, Shield, Lock, Unlock, Eye, EyeOff,
  BarChart3, PieChart, Clock, Calendar, AlertCircle,
  Info, CheckCircle, XCircle, RefreshCw, Download,
  Upload, Filter, Search, ArrowUp, ArrowDown,
  Gauge, Database, Cpu, Globe, Package, Crown,
  Star, Award, Target, Layers, Hash, Percent,
  CreditCard, Wallet, Receipt, FileText, Mail,
  Bell, MessageSquare, Phone, Loader2, ChevronDown,
  ArrowUpRight, ArrowDownRight, MoreVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LineChart, Line, BarChart, Bar, PieChart as ReChartPie, 
  Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, Area, AreaChart, RadialBarChart, 
  RadialBar, Treemap
} from 'recharts'

interface UserLimit {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  department?: string
  limits: {
    monthly: number
    daily: number
    tokens: number
    requests: number
  }
  usage: {
    monthly: number
    daily: number
    tokens: number
    requests: number
  }
  alerts: {
    threshold: number
    enabled: boolean
    channels: string[]
  }
  status: 'active' | 'warning' | 'exceeded' | 'suspended'
  lastActive: string
}

interface OrganizationLimits {
  tier: 'free' | 'starter' | 'growth' | 'scale' | 'enterprise'
  limits: {
    monthly: number
    daily: number
    tokens: number
    requests: number
    members: number
    apiKeys: number
  }
  usage: {
    monthly: number
    daily: number
    tokens: number
    requests: number
    members: number
    apiKeys: number
  }
  billing: {
    nextBillingDate: string
    estimatedCost: number
    overage: number
  }
}

const TIER_LIMITS = {
  free: { monthly: 100, daily: 10, tokens: 100000, requests: 1000, members: 3, apiKeys: 2 },
  starter: { monthly: 500, daily: 50, tokens: 500000, requests: 5000, members: 5, apiKeys: 5 },
  growth: { monthly: 2000, daily: 200, tokens: 2000000, requests: 20000, members: 10, apiKeys: 10 },
  scale: { monthly: 10000, daily: 1000, tokens: 10000000, requests: 100000, members: 25, apiKeys: 25 },
  enterprise: { monthly: -1, daily: -1, tokens: -1, requests: -1, members: -1, apiKeys: -1 } // Unlimited
}

export default function EnterpriseUsageLimits() {
  const { data: session } = useSession()
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [orgLimits, setOrgLimits] = useState<OrganizationLimits>({
    tier: 'growth',
    limits: TIER_LIMITS.growth,
    usage: {
      monthly: 1234.56,
      daily: 123.45,
      tokens: 1234567,
      requests: 12345,
      members: 7,
      apiKeys: 6
    },
    billing: {
      nextBillingDate: '2025-09-01',
      estimatedCost: 1567.89,
      overage: 67.89
    }
  })
  
  const [userLimits, setUserLimits] = useState<UserLimit[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'owner',
      department: 'Engineering',
      limits: { monthly: 500, daily: 50, tokens: 500000, requests: 5000 },
      usage: { monthly: 234.56, daily: 23.45, tokens: 234567, requests: 2345 },
      alerts: { threshold: 80, enabled: true, channels: ['email', 'slack'] },
      status: 'active',
      lastActive: '2 hours ago'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'admin',
      department: 'Product',
      limits: { monthly: 300, daily: 30, tokens: 300000, requests: 3000 },
      usage: { monthly: 289.12, daily: 28.91, tokens: 289123, requests: 2891 },
      alerts: { threshold: 90, enabled: true, channels: ['email'] },
      status: 'warning',
      lastActive: '5 minutes ago'
    }
  ])
  
  const [showAddUserDialog, setShowAddUserDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<UserLimit | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  
  // Mock data for charts
  const usageTrendData = [
    { date: 'Mon', cost: 145, requests: 2300, tokens: 234000 },
    { date: 'Tue', cost: 178, requests: 2800, tokens: 278000 },
    { date: 'Wed', cost: 156, requests: 2500, tokens: 256000 },
    { date: 'Thu', cost: 189, requests: 3100, tokens: 289000 },
    { date: 'Fri', cost: 234, requests: 3800, tokens: 334000 },
    { date: 'Sat', cost: 198, requests: 3200, tokens: 298000 },
    { date: 'Sun', cost: 167, requests: 2700, tokens: 267000 }
  ]
  
  const departmentUsage = [
    { name: 'Engineering', value: 45, color: '#8b5cf6' },
    { name: 'Product', value: 25, color: '#3b82f6' },
    { name: 'Marketing', value: 15, color: '#10b981' },
    { name: 'Sales', value: 10, color: '#f59e0b' },
    { name: 'Support', value: 5, color: '#ef4444' }
  ]
  
  const filteredUsers = userLimits.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'exceeded': return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      case 'suspended': return 'text-red-400 bg-red-500/20 border-red-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }
  
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return Crown
      case 'admin': return Shield
      case 'member': return Users
      default: return Eye
    }
  }
  
  const calculatePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((used / limit) * 100, 100)
  }
  
  const formatLimit = (value: number) => {
    if (value === -1) return 'Unlimited'
    return value.toLocaleString()
  }
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20" />
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [180, 90, 180],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                  <Gauge className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Usage Limits</h1>
                  <p className="text-gray-400 mt-1">Manage organization and user limits</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Tier Badge */}
                <Badge className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-purple-500/30">
                  <Package className="w-4 h-4 mr-2" />
                  {orgLimits.tier.toUpperCase()} PLAN
                </Badge>
                
                <Button
                  variant="outline"
                  className="border-gray-700 bg-gray-800/50 hover:bg-gray-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                
                <Button
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </motion.div>
          
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            {/* Monthly Usage */}
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                  </div>
                  <Badge className={cn(
                    "text-xs",
                    calculatePercentage(orgLimits.usage.monthly, orgLimits.limits.monthly) > 90
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : "bg-green-500/20 text-green-400 border-green-500/30"
                  )}>
                    {calculatePercentage(orgLimits.usage.monthly, orgLimits.limits.monthly).toFixed(0)}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mb-1">Monthly Usage</p>
                <p className="text-2xl font-bold text-white">
                  ${orgLimits.usage.monthly.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  of ${formatLimit(orgLimits.limits.monthly)}
                </p>
                <Progress 
                  value={calculatePercentage(orgLimits.usage.monthly, orgLimits.limits.monthly)}
                  className="mt-3 h-1.5"
                />
              </CardContent>
            </Card>
            
            {/* Daily Usage */}
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                    Today
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mb-1">Daily Usage</p>
                <p className="text-2xl font-bold text-white">
                  ${orgLimits.usage.daily.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  of ${formatLimit(orgLimits.limits.daily)}
                </p>
                <Progress 
                  value={calculatePercentage(orgLimits.usage.daily, orgLimits.limits.daily)}
                  className="mt-3 h-1.5"
                />
              </CardContent>
            </Card>
            
            {/* Active Users */}
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-green-400">Live</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-1">Team Members</p>
                <p className="text-2xl font-bold text-white">
                  {orgLimits.usage.members}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  of {formatLimit(orgLimits.limits.members)} allowed
                </p>
                <div className="flex -space-x-2 mt-3">
                  {[...Array(Math.min(5, orgLimits.usage.members))].map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-2 border-gray-900" />
                  ))}
                  {orgLimits.usage.members > 5 && (
                    <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center">
                      <span className="text-xs text-gray-300">+{orgLimits.usage.members - 5}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Estimated Bill */}
            <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/30 backdrop-blur-xl border-orange-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Receipt className="w-5 h-5 text-orange-400" />
                  </div>
                  {orgLimits.billing.overage > 0 && (
                    <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                      Overage
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-1">Estimated Bill</p>
                <p className="text-2xl font-bold text-white">
                  ${orgLimits.billing.estimatedCost.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Due {new Date(orgLimits.billing.nextBillingDate).toLocaleDateString()}
                </p>
                {orgLimits.billing.overage > 0 && (
                  <div className="mt-3 p-2 bg-red-500/10 rounded-lg border border-red-500/30">
                    <p className="text-xs text-red-400">
                      +${orgLimits.billing.overage.toFixed(2)} overage charges
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600">
                <Users className="w-4 h-4 mr-2" />
                User Limits
              </TabsTrigger>
              <TabsTrigger value="alerts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600">
                <Bell className="w-4 h-4 mr-2" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="policies" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600">
                <Shield className="w-4 h-4 mr-2" />
                Policies
              </TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Usage Trend Chart */}
                <Card className="lg:col-span-2 bg-gray-900/50 backdrop-blur-xl border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                      Usage Trend
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Daily usage over the past week
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={usageTrendData}>
                        <defs>
                          <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="cost"
                          stroke="#8b5cf6"
                          fillOpacity={1}
                          fill="url(#colorCost)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                {/* Department Usage */}
                <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-indigo-400" />
                      By Department
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Usage distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <ReChartPie>
                        <Pie
                          data={departmentUsage}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {departmentUsage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </ReChartPie>
                    </ResponsiveContainer>
                    
                    <div className="space-y-2 mt-4">
                      {departmentUsage.map((dept) => (
                        <div key={dept.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: dept.color }}
                            />
                            <span className="text-sm text-gray-300">{dept.name}</span>
                          </div>
                          <span className="text-sm font-medium text-white">{dept.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              {/* Filters */}
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users..."
                        className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      />
                    </div>
                    
                    <Select value={filterRole} onValueChange={setFilterRole}>
                      <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="exceeded">Exceeded</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      onClick={() => setShowAddUserDialog(true)}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Users List */}
              <div className="space-y-3">
                {filteredUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role)
                  const monthlyPercentage = calculatePercentage(user.usage.monthly, user.limits.monthly)
                  
                  return (
                    <Card key={user.id} className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                              {user.name[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-medium text-white">{user.name}</h3>
                                <Badge className={cn("text-xs", getStatusColor(user.status))}>
                                  {user.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-400">{user.email}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1">
                                  <RoleIcon className="w-3 h-3 text-gray-500" />
                                  <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                                </div>
                                {user.department && (
                                  <span className="text-xs text-gray-500">{user.department}</span>
                                )}
                                <span className="text-xs text-gray-500">{user.lastActive}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setEditingUser(user)}
                              className="text-gray-400 hover:text-white"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Reset Limits</DropdownMenuItem>
                                <DropdownMenuItem>Send Alert</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-400">Suspend User</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        {/* Usage Metrics */}
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Monthly</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-medium text-white">
                                ${user.usage.monthly.toFixed(0)}
                              </span>
                              <span className="text-xs text-gray-500">
                                / ${user.limits.monthly}
                              </span>
                            </div>
                            <Progress 
                              value={monthlyPercentage}
                              className="mt-1 h-1"
                            />
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Daily</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-medium text-white">
                                ${user.usage.daily.toFixed(0)}
                              </span>
                              <span className="text-xs text-gray-500">
                                / ${user.limits.daily}
                              </span>
                            </div>
                            <Progress 
                              value={calculatePercentage(user.usage.daily, user.limits.daily)}
                              className="mt-1 h-1"
                            />
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Tokens</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-medium text-white">
                                {(user.usage.tokens / 1000).toFixed(0)}K
                              </span>
                              <span className="text-xs text-gray-500">
                                / {(user.limits.tokens / 1000).toFixed(0)}K
                              </span>
                            </div>
                            <Progress 
                              value={calculatePercentage(user.usage.tokens, user.limits.tokens)}
                              className="mt-1 h-1"
                            />
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Requests</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-medium text-white">
                                {user.usage.requests.toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-500">
                                / {user.limits.requests.toLocaleString()}
                              </span>
                            </div>
                            <Progress 
                              value={calculatePercentage(user.usage.requests, user.limits.requests)}
                              className="mt-1 h-1"
                            />
                          </div>
                        </div>
                        
                        {/* Alerts */}
                        {user.alerts.enabled && (
                          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-400">
                                  Alert at {user.alerts.threshold}% usage
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {user.alerts.channels.map((channel) => (
                                  <Badge key={channel} className="text-xs bg-gray-700 text-gray-300">
                                    {channel}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
            
            {/* Other tabs with placeholder content */}
            <TabsContent value="alerts" className="space-y-6">
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                <CardContent className="p-12 text-center">
                  <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Alert Configuration</h3>
                  <p className="text-gray-400">Configure usage alerts and notifications</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="policies" className="space-y-6">
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                <CardContent className="p-12 text-center">
                  <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Usage Policies</h3>
                  <p className="text-gray-400">Define and enforce usage policies</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}