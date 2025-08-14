'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  Activity, Users, DollarSign, Zap, AlertTriangle, 
  Settings, Save, Edit, Plus, Trash2, TrendingUp, X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/components/ui/use-toast'
import Link from 'next/link'

interface UserLimit {
  id: string
  name: string
  email: string
  role: string
  monthlyLimit: number
  currentUsage: number
  dailyLimit: number
  tokensLimit: number
  alertThreshold: number
  isActive: boolean
}

// Component for Global Limits Section
function GlobalLimitsSection() {
  const [isEditing, setIsEditing] = useState(false)
  const [limits, setLimits] = useState({
    organizationMonthly: 10000,
    organizationDaily: 1000,
    defaultUserMonthly: 500,
    defaultUserDaily: 50,
    autoSuspendThreshold: 120
  })
  const [tempLimits, setTempLimits] = useState(limits)

  const handleSave = () => {
    setLimits(tempLimits)
    setIsEditing(false)
    toast({
      title: 'Success',
      description: 'Global limits updated successfully'
    })
  }

  const handleCancel = () => {
    setTempLimits(limits)
    setIsEditing(false)
  }

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white">Global Limits</CardTitle>
          <CardDescription className="text-gray-400">
            Organization-wide usage limits and defaults
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
            <Label className="text-gray-400">Organization Monthly Limit ($)</Label>
            <Input
              type="number"
              value={tempLimits.organizationMonthly}
              onChange={(e) => setTempLimits({...tempLimits, organizationMonthly: parseInt(e.target.value)})}
              disabled={!isEditing}
              className="bg-gray-800 border-gray-700 text-white disabled:opacity-60"
            />
          </div>
          <div>
            <Label className="text-gray-400">Organization Daily Limit ($)</Label>
            <Input
              type="number"
              value={tempLimits.organizationDaily}
              onChange={(e) => setTempLimits({...tempLimits, organizationDaily: parseInt(e.target.value)})}
              disabled={!isEditing}
              className="bg-gray-800 border-gray-700 text-white disabled:opacity-60"
            />
          </div>
          <div>
            <Label className="text-gray-400">Default User Monthly Limit ($)</Label>
            <Input
              type="number"
              value={tempLimits.defaultUserMonthly}
              onChange={(e) => setTempLimits({...tempLimits, defaultUserMonthly: parseInt(e.target.value)})}
              disabled={!isEditing}
              className="bg-gray-800 border-gray-700 text-white disabled:opacity-60"
            />
          </div>
          <div>
            <Label className="text-gray-400">Default User Daily Limit ($)</Label>
            <Input
              type="number"
              value={tempLimits.defaultUserDaily}
              onChange={(e) => setTempLimits({...tempLimits, defaultUserDaily: parseInt(e.target.value)})}
              disabled={!isEditing}
              className="bg-gray-800 border-gray-700 text-white disabled:opacity-60"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-gray-400">Auto-Suspend Threshold (%)</Label>
            <Input
              type="number"
              value={tempLimits.autoSuspendThreshold}
              onChange={(e) => setTempLimits({...tempLimits, autoSuspendThreshold: parseInt(e.target.value)})}
              disabled={!isEditing}
              className="bg-gray-800 border-gray-700 text-white disabled:opacity-60"
            />
            <p className="text-xs text-gray-500 mt-1">
              Automatically suspend users when they exceed this percentage of their limit
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Component for User Limits Section
function UserLimitsSection() {
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [userLimits, setUserLimits] = useState<UserLimit[]>([
    {
      id: '1',
      name: 'John Developer',
      email: 'john@aicostguardian.com',
      role: 'Developer',
      monthlyLimit: 500,
      currentUsage: 234,
      dailyLimit: 50,
      tokensLimit: 10000000,
      alertThreshold: 80,
      isActive: true
    },
    {
      id: '2',
      name: 'Sarah Manager',
      email: 'sarah@aicostguardian.com',
      role: 'Manager',
      monthlyLimit: 1000,
      currentUsage: 567,
      dailyLimit: 100,
      tokensLimit: 20000000,
      alertThreshold: 90,
      isActive: true
    },
    {
      id: '3',
      name: 'Mike Analyst',
      email: 'mike@aicostguardian.com',
      role: 'Analyst',
      monthlyLimit: 300,
      currentUsage: 156,
      dailyLimit: 30,
      tokensLimit: 5000000,
      alertThreshold: 75,
      isActive: true
    }
  ])
  const [tempUser, setTempUser] = useState<UserLimit | null>(null)

  const handleEditUser = (user: UserLimit) => {
    setEditingUser(user.id)
    setTempUser({...user})
  }

  const handleSaveUser = () => {
    if (tempUser) {
      setUserLimits(userLimits.map(u => u.id === tempUser.id ? tempUser : u))
      setEditingUser(null)
      setTempUser(null)
      toast({
        title: 'Success',
        description: `Updated limits for ${tempUser.name}`
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setTempUser(null)
  }

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white">User Limits</CardTitle>
          <CardDescription className="text-gray-400">
            Individual user usage limits and thresholds
          </CardDescription>
        </div>
        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add User
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userLimits.map((user) => {
            const isEditing = editingUser === user.id
            const userData = isEditing && tempUser ? tempUser : user
            const usagePercent = (userData.currentUsage / userData.monthlyLimit) * 100

            return (
              <div key={user.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {user.role}
                    </Badge>
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="border-gray-700 text-gray-300"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveUser}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditUser(user)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400">Monthly Usage</span>
                      <span className="text-sm text-white">
                        ${userData.currentUsage} / ${userData.monthlyLimit}
                      </span>
                    </div>
                    <Progress value={usagePercent} className="h-2 bg-gray-700">
                      <div
                        className={`h-full transition-all ${
                          usagePercent > 90 ? 'bg-red-500' :
                          usagePercent > 75 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      />
                    </Progress>
                  </div>

                  {isEditing && (
                    <div className="grid gap-3 md:grid-cols-2 pt-3 border-t border-gray-700">
                      <div>
                        <Label className="text-gray-400 text-xs">Monthly Limit ($)</Label>
                        <Input
                          type="number"
                          value={userData.monthlyLimit}
                          onChange={(e) => setTempUser({...userData, monthlyLimit: parseInt(e.target.value)})}
                          className="bg-gray-900 border-gray-700 text-white h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400 text-xs">Daily Limit ($)</Label>
                        <Input
                          type="number"
                          value={userData.dailyLimit}
                          onChange={(e) => setTempUser({...userData, dailyLimit: parseInt(e.target.value)})}
                          className="bg-gray-900 border-gray-700 text-white h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400 text-xs">Token Limit</Label>
                        <Input
                          type="number"
                          value={userData.tokensLimit}
                          onChange={(e) => setTempUser({...userData, tokensLimit: parseInt(e.target.value)})}
                          className="bg-gray-900 border-gray-700 text-white h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400 text-xs">Alert Threshold (%)</Label>
                        <Input
                          type="number"
                          value={userData.alertThreshold}
                          onChange={(e) => setTempUser({...userData, alertThreshold: parseInt(e.target.value)})}
                          className="bg-gray-900 border-gray-700 text-white h-8 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Component for Alert Settings Section
function AlertSettingsSection() {
  const [isEditing, setIsEditing] = useState(false)
  const [settings, setSettings] = useState({
    enableAlerts: true,
    alertChannels: ['email', 'app'],
    escalationEnabled: true,
    escalationThreshold: 95,
    dailyDigest: true,
    weeklyReport: true
  })
  const [tempSettings, setTempSettings] = useState(settings)

  const handleSave = () => {
    setSettings(tempSettings)
    setIsEditing(false)
    toast({
      title: 'Success',
      description: 'Alert settings updated successfully'
    })
  }

  const handleCancel = () => {
    setTempSettings(settings)
    setIsEditing(false)
  }

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white">Alert Settings</CardTitle>
          <CardDescription className="text-gray-400">
            Configure usage alerts and notifications
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
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Enable Usage Alerts</p>
              <p className="text-gray-400 text-sm">Send notifications when limits are approached</p>
            </div>
            <Switch
              checked={tempSettings.enableAlerts}
              onCheckedChange={(checked) => setTempSettings({...tempSettings, enableAlerts: checked})}
              disabled={!isEditing}
              className="data-[state=checked]:bg-indigo-600"
            />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Automatic Escalation</p>
              <p className="text-gray-400 text-sm">Escalate to admin when threshold exceeded</p>
            </div>
            <Switch
              checked={tempSettings.escalationEnabled}
              onCheckedChange={(checked) => setTempSettings({...tempSettings, escalationEnabled: checked})}
              disabled={!isEditing}
              className="data-[state=checked]:bg-indigo-600"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Daily Usage Digest</p>
              <p className="text-gray-400 text-sm">Receive daily summary of usage</p>
            </div>
            <Switch
              checked={tempSettings.dailyDigest}
              onCheckedChange={(checked) => setTempSettings({...tempSettings, dailyDigest: checked})}
              disabled={!isEditing}
              className="data-[state=checked]:bg-indigo-600"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Weekly Reports</p>
              <p className="text-gray-400 text-sm">Detailed weekly usage reports</p>
            </div>
            <Switch
              checked={tempSettings.weeklyReport}
              onCheckedChange={(checked) => setTempSettings({...tempSettings, weeklyReport: checked})}
              disabled={!isEditing}
              className="data-[state=checked]:bg-indigo-600"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function UsageLimitsPage() {
  const { data: session } = useSession()

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
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Activity className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Usage Limits</h1>
                </div>
                <p className="text-gray-400">Configure spending limits and usage controls</p>
              </div>
              
              <Link href="/organization">
                <Button variant="outline" className="border-gray-700 text-gray-300">
                  <Settings className="w-4 h-4 mr-2" />
                  Back to Organization
                </Button>
              </Link>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Monthly Spend</p>
                      <p className="text-xl font-bold text-white">$4,567</p>
                      <p className="text-xs text-green-400">-12% from last month</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-400/20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Active Users</p>
                      <p className="text-xl font-bold text-white">23</p>
                      <p className="text-xs text-gray-400">of 30 total</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-400/20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Alerts Today</p>
                      <p className="text-xl font-bold text-yellow-400">3</p>
                      <p className="text-xs text-gray-400">2 acknowledged</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-yellow-400/20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Utilization</p>
                      <p className="text-xl font-bold text-purple-400">78%</p>
                      <p className="text-xs text-gray-400">of limit</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-400/20" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="space-y-6">
            <GlobalLimitsSection />
            <UserLimitsSection />
            <AlertSettingsSection />
          </div>
        </div>
      </div>
    </div>
  )
}