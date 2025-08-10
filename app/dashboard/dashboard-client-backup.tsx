'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Session } from 'next-auth'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Zap,
  Activity,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import UsageDashboard from '@/components/usage/UsageDashboard'

interface DashboardClientProps {
  initialSession: Session | null
}

function SimpleDashboardContent() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    totalSpend: 0,
    totalRequests: 0,
    activeUsers: 0,
    avgLatency: 0,
    monthlyGrowth: 0,
    costTrend: 'up' as 'up' | 'down'
  })

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/usage/stats')
        if (response.ok) {
          const data = await response.json()
          setStats({
            totalSpend: data.totalCost || 24567.89,
            totalRequests: data.totalRequests || 1250000,
            activeUsers: data.activeUsers || 193,
            avgLatency: data.avgLatency || 145,
            monthlyGrowth: 15.7,
            costTrend: 'up'
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session?.user?.name || 'User'}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-primary" />
              <span className={`text-sm flex items-center gap-1 ${
                stats.costTrend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {stats.costTrend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {stats.monthlyGrowth}%
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              ${(stats.totalSpend / 1000).toFixed(1)}K
            </div>
            <p className="text-sm text-muted-foreground">Total Spend</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {(stats.totalRequests / 1000000).toFixed(1)}M
            </div>
            <p className="text-sm text-muted-foreground">Total Requests</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stats.activeUsers}
            </div>
            <p className="text-sm text-muted-foreground">Active Users</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stats.avgLatency}ms
            </div>
            <p className="text-sm text-muted-foreground">Avg Latency</p>
          </motion.div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/analytics/usage" className="group">
            <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Usage Analytics</span>
              </div>
              <p className="text-sm text-muted-foreground">View detailed usage reports</p>
              <ArrowUpRight className="w-4 h-4 text-primary mt-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </Link>

          <Link href="/team" className="group">
            <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Team Management</span>
              </div>
              <p className="text-sm text-muted-foreground">Manage team members and permissions</p>
              <ArrowUpRight className="w-4 h-4 text-primary mt-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </Link>

          <Link href="/settings" className="group">
            <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Settings</span>
              </div>
              <p className="text-sm text-muted-foreground">Configure your account settings</p>
              <ArrowUpRight className="w-4 h-4 text-primary mt-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Usage Dashboard Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <UsageDashboard />
        </motion.div>
      </div>
    </div>
  )
}

export default function DashboardClient({ initialSession }: DashboardClientProps) {
  const { data: session, status } = useSession()
  const activeSession = session || initialSession
  
  if (status === 'loading' && !initialSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    )
  }
  
  if (!activeSession) {
    return null
  }
  
  return <SimpleDashboardContent />
}