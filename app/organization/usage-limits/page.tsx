'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  Activity, Users, DollarSign, Zap, AlertTriangle, 
  Settings, Save, Edit, Plus, Trash2, TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
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

export default function UsageLimitsPage() {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
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

  const globalLimits = {
    organizationMonthly: 10000,
    organizationDaily: 1000,
    defaultUserMonthly: 500,
    defaultUserDaily: 50,
    autoSuspendThreshold: 120
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
                    <Activity className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Usage Limits</h1>
                </div>
                <p className="text-gray-400">Configure spending limits and usage thresholds for team members</p>
              </div>
              
              <div className="flex items-center gap-3">
                <Link href="/organization">
                  <Button variant="outline" className="border-gray-700 text-gray-300">
                    Back to Organization
                  </Button>
                </Link>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  className={isEditing ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"}
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Limits
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Global Limits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Organization Limits</CardTitle>
                <CardDescription className="text-gray-400">
                  Global spending limits for your entire organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <Label className="text-gray-400">Monthly Limit</Label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <Input
                        type="number"
                        value={globalLimits.organizationMonthly}
                        disabled={!isEditing}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-400">Daily Limit</Label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-blue-400" />
                      <Input
                        type="number"
                        value={globalLimits.organizationDaily}
                        disabled={!isEditing}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-400">Default User Monthly</Label>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <Input
                        type="number"
                        value={globalLimits.defaultUserMonthly}
                        disabled={!isEditing}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-400">Default User Daily</Label>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-orange-400" />
                      <Input
                        type="number"
                        value={globalLimits.defaultUserDaily}
                        disabled={!isEditing}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-400">Auto-Suspend at %</Label>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <Input
                        type="number"
                        value={globalLimits.autoSuspendThreshold}
                        disabled={!isEditing}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Limits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Individual User Limits</CardTitle>
                <CardDescription className="text-gray-400">
                  Set custom limits for each team member
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userLimits.map((user) => {
                    const usagePercent = (user.currentUsage / user.monthlyLimit) * 100
                    const isNearLimit = usagePercent > user.alertThreshold
                    const isOverLimit = usagePercent > 100

                    return (
                      <div
                        key={user.id}
                        className="p-4 rounded-xl bg-gray-800/50 border border-gray-700"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{user.name}</h4>
                              <p className="text-sm text-gray-400">{user.email}</p>
                            </div>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              {user.role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.isActive}
                              disabled={!isEditing}
                            />
                            {isEditing && (
                              <Button variant="ghost" size="sm" className="text-red-400">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-4 mb-4">
                          <div>
                            <Label className="text-xs text-gray-500">Monthly Limit</Label>
                            <Input
                              type="number"
                              value={user.monthlyLimit}
                              disabled={!isEditing}
                              className="h-8 bg-gray-900 border-gray-700 text-white text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Daily Limit</Label>
                            <Input
                              type="number"
                              value={user.dailyLimit}
                              disabled={!isEditing}
                              className="h-8 bg-gray-900 border-gray-700 text-white text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Token Limit</Label>
                            <Input
                              type="number"
                              value={user.tokensLimit}
                              disabled={!isEditing}
                              className="h-8 bg-gray-900 border-gray-700 text-white text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Alert at %</Label>
                            <Input
                              type="number"
                              value={user.alertThreshold}
                              disabled={!isEditing}
                              className="h-8 bg-gray-900 border-gray-700 text-white text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-400">Current Usage</span>
                            <span className={`text-sm font-semibold ${
                              isOverLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-green-400'
                            }`}>
                              ${user.currentUsage} / ${user.monthlyLimit} ({usagePercent.toFixed(1)}%)
                            </span>
                          </div>
                          <Progress 
                            value={Math.min(usagePercent, 100)} 
                            className={`h-2 ${
                              isOverLimit ? 'bg-red-900' : isNearLimit ? 'bg-yellow-900' : 'bg-gray-700'
                            }`}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {isEditing && (
                  <Button className="w-full mt-4 bg-gray-800 hover:bg-gray-700 border border-gray-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User Limit
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}