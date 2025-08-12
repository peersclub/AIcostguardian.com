'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Rocket, 
  Bug, 
  Sparkles, 
  Code2, 
  Database, 
  Server, 
  Package,
  GitBranch,
  Shield,
  Zap,
  Globe,
  Bell,
  MessageSquare,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  CheckSquare,
  Square,
  ArrowRight,
  Activity,
  Award,
  Target,
  TrendingUp
} from 'lucide-react'

interface ReleaseItem {
  id: string
  type: 'feature' | 'fix' | 'improvement' | 'breaking' | 'security'
  title: string
  description: string
  status: 'completed' | 'in-progress' | 'pending'
  date?: string
  details?: string[]
}

interface ReleaseSection {
  version: string
  date: string
  status: 'released' | 'current' | 'upcoming'
  summary: string
  items: ReleaseItem[]
}

const releases: ReleaseSection[] = [
  {
    version: 'v2.0.0',
    date: '2025-08-12',
    status: 'current',
    summary: 'Production-Ready Build with Enhanced Features',
    items: [
      {
        id: 'prod-build',
        type: 'improvement',
        title: 'Production Build Optimization',
        description: 'Complete TypeScript compilation fixes and production-ready build pipeline',
        status: 'completed',
        details: [
          'Fixed all TypeScript compilation errors',
          'Resolved Prisma model mismatches',
          'Optimized build configuration',
          'Removed server-side compilation issues',
          'Enhanced type safety across the application'
        ]
      },
      {
        id: 'notification-system',
        type: 'feature',
        title: 'Real-time Notification System',
        description: 'Socket.io-based notification service with site-wide alerts and navbar integration',
        status: 'completed',
        details: [
          'WebSocket-based real-time notifications',
          'Site-wide notification banners',
          'Navbar notification dropdown with unread counter',
          'Multiple notification channels (in-app, email, Slack)',
          'Notification preferences and rules management',
          'Toast notifications with Sonner integration'
        ]
      },
      {
        id: 'ai-chat',
        type: 'feature',
        title: 'AI Chat Interface (AIOptimise)',
        description: 'Claude-style unified chat interface with advanced features',
        status: 'completed',
        details: [
          'Unified input field combining query and chat',
          'Multiple chat modes (Standard, Focus, Coding, Research, Creative)',
          'Thread management with collaboration',
          'Voice input with transcription',
          'Model selector for different AI providers',
          'Real-time metrics and usage tracking',
          'Thread sharing and collaboration features'
        ]
      },
      {
        id: 'queue-system',
        type: 'improvement',
        title: 'Bull Queue Integration',
        description: 'Redis-backed queue system for background job processing',
        status: 'completed',
        details: [
          'Installed Bull and Redis dependencies',
          'Configured queue processors for data fetching',
          'Implemented retry policies and rate limiting',
          'Added job scheduling and monitoring'
        ]
      },
      {
        id: 'database-sync',
        type: 'fix',
        title: 'Database Schema Alignment',
        description: 'Fixed all Prisma schema mismatches and model references',
        status: 'completed',
        details: [
          'Aligned CollaboratorRole with Prisma enums',
          'Fixed notification field mappings',
          'Updated thread model references (aIThread)',
          'Corrected ChatMode enum values',
          'Resolved field name inconsistencies'
        ]
      },
      {
        id: 'vercel-ready',
        type: 'improvement',
        title: 'Vercel Deployment Ready',
        description: 'Application configured and tested for Vercel deployment',
        status: 'completed',
        details: [
          'Configured vercel.json with proper settings',
          'Fixed all build-time errors',
          'Optimized API routes for serverless',
          'Set up environment variable structure',
          'Tested local development server'
        ]
      }
    ]
  },
  {
    version: 'v1.9.0',
    date: '2025-08-10',
    status: 'released',
    summary: 'Dark Mode & UI Enhancements',
    items: [
      {
        id: 'dark-mode',
        type: 'feature',
        title: 'Dark Mode Support',
        description: 'Full dark mode implementation with glassmorphic design',
        status: 'completed',
        details: [
          'Theme-aware color system',
          'Glassmorphic card designs',
          'Smooth theme transitions',
          'Persistent theme preferences'
        ]
      },
      {
        id: 'ui-components',
        type: 'improvement',
        title: 'Enhanced UI Components',
        description: 'Upgraded Radix UI components with dark mode support',
        status: 'completed'
      },
      {
        id: 'ai-logos',
        type: 'feature',
        title: 'AI Provider Logos',
        description: 'Custom logos for all AI providers',
        status: 'completed'
      }
    ]
  },
  {
    version: 'v2.1.0',
    date: 'Q3 2025',
    status: 'upcoming',
    summary: 'Advanced Analytics & Monitoring',
    items: [
      {
        id: 'analytics-dashboard',
        type: 'feature',
        title: 'Advanced Analytics Dashboard',
        description: 'Comprehensive analytics with predictive insights',
        status: 'pending'
      },
      {
        id: 'cost-predictions',
        type: 'feature',
        title: 'AI Cost Predictions',
        description: 'ML-based cost forecasting and optimization recommendations',
        status: 'pending'
      },
      {
        id: 'webhooks',
        type: 'feature',
        title: 'Webhook Integrations',
        description: 'Provider webhooks for real-time usage updates',
        status: 'pending'
      }
    ]
  }
]

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'feature': return <Sparkles className="h-4 w-4" />
    case 'fix': return <Bug className="h-4 w-4" />
    case 'improvement': return <Zap className="h-4 w-4" />
    case 'breaking': return <AlertCircle className="h-4 w-4" />
    case 'security': return <Shield className="h-4 w-4" />
    default: return <Code2 className="h-4 w-4" />
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'feature': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0'
    case 'fix': return 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-0'
    case 'improvement': return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0'
    case 'breaking': return 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0'
    case 'security': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0'
    default: return 'bg-gray-700 text-gray-300 border-gray-600'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case 'in-progress': return <Clock className="h-4 w-4 text-yellow-500" />
    case 'pending': return <Circle className="h-4 w-4 text-muted-foreground" />
    default: return null
  }
}

export default function CurrentReleaseNotesPage() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [selectedVersion, setSelectedVersion] = useState('v2.0.0')

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const currentRelease = releases.find(r => r.version === selectedVersion) || releases[0]

  // Calculate progress
  const totalItems = currentRelease.items.length
  const completedItems = currentRelease.items.filter(i => i.status === 'completed').length
  const inProgressItems = currentRelease.items.filter(i => i.status === 'in-progress').length
  const progressPercentage = (completedItems / totalItems) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative container mx-auto py-8 max-w-7xl px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
              <Rocket className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Release Notes
              </h1>
              <p className="text-gray-400 mt-1">Track our progress and latest updates</p>
            </div>
          </div>
        </motion.div>

        {/* Current Release Banner */}
        {currentRelease.status === 'current' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl blur-xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-1">
                      CURRENT RELEASE
                    </Badge>
                    <h2 className="text-3xl font-bold text-white">{currentRelease.version}</h2>
                    <span className="text-gray-400">{currentRelease.date}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl rounded-lg px-4 py-2">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <span className="text-sm font-medium text-gray-200">
                      {completedItems}/{totalItems} Complete
                    </span>
                  </div>
                </div>
                <p className="text-lg text-gray-300 mb-4">
                  {currentRelease.summary}
                </p>
                <div className="relative">
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-xl">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-md opacity-30" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Version Selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs value={selectedVersion} onValueChange={setSelectedVersion} className="mb-8">
            <TabsList className="grid w-full grid-cols-3 bg-white/5 backdrop-blur-xl border border-white/10">
              {releases.map(release => (
                <TabsTrigger 
                  key={release.version} 
                  value={release.version}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                >
                  <div className="flex items-center gap-2">
                    {release.status === 'current' && <Zap className="h-4 w-4" />}
                    {release.status === 'upcoming' && <Clock className="h-4 w-4" />}
                    {release.version}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedVersion} className="mt-6">
              {/* Statistics */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
              >
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <div className="text-sm font-medium text-gray-400 mb-2">
                    Total Changes
                  </div>
                  <div className="text-3xl font-bold text-white">{currentRelease.items.length}</div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <div className="text-sm font-medium text-gray-400 mb-2">
                    Features
                  </div>
                  <div className="text-3xl font-bold text-blue-400">
                    {currentRelease.items.filter(i => i.type === 'feature').length}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <div className="text-sm font-medium text-gray-400 mb-2">
                    Fixes
                  </div>
                  <div className="text-3xl font-bold text-red-400">
                    {currentRelease.items.filter(i => i.type === 'fix').length}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <div className="text-sm font-medium text-gray-400 mb-2">
                    Improvements
                  </div>
                  <div className="text-3xl font-bold text-purple-400">
                    {currentRelease.items.filter(i => i.type === 'improvement').length}
                  </div>
                </div>
              </motion.div>

              {/* Release Items */}
              <div className="space-y-4">
                {currentRelease.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 backdrop-blur-xl rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                    onClick={() => toggleExpanded(item.id)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <motion.div 
                            className="mt-1"
                            animate={{ rotate: expandedItems.has(item.id) ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </motion.div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Badge className={getTypeColor(item.type)}>
                                {getTypeIcon(item.type)}
                                <span className="ml-1.5 capitalize">{item.type}</span>
                              </Badge>
                              {getStatusIcon(item.status)}
                            </div>
                            <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                            <p className="text-gray-300">{item.description}</p>
                          </div>
                        </div>
                        {item.date && (
                          <div className="flex items-center gap-2 text-gray-400 text-sm bg-white/5 px-3 py-1 rounded-lg">
                            <Calendar className="h-3 w-3" />
                            {item.date}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {expandedItems.has(item.id) && item.details && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6">
                            <div className="pl-8 pt-4 border-t border-white/10">
                              <div className="text-sm font-medium text-indigo-400 mb-3">
                                Implementation Details:
                              </div>
                              <ul className="space-y-2">
                                {item.details.map((detail, idx) => (
                                  <motion.li 
                                    key={idx} 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-start gap-3 text-sm text-gray-300"
                                  >
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5" />
                                    <span>{detail}</span>
                                  </motion.li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
              <Target className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">
              Quick Actions
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.a
              href="https://github.com/peersclub/AIcostguardian.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:bg-white/10 transition-colors text-gray-200"
            >
              <GitBranch className="h-5 w-5 text-indigo-400" />
              <span>GitHub</span>
            </motion.a>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:bg-white/10 transition-colors text-gray-200"
            >
              <Package className="h-5 w-5 text-purple-400" />
              <span>Download</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:bg-white/10 transition-colors text-gray-200"
            >
              <Bell className="h-5 w-5 text-yellow-400" />
              <span>Subscribe</span>
            </motion.button>
            
            <motion.a
              href="mailto:feedback@aicostguardian.com"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:bg-white/10 transition-colors text-gray-200"
            >
              <MessageSquare className="h-5 w-5 text-pink-400" />
              <span>Feedback</span>
            </motion.a>
          </div>
        </motion.div>

        {/* Deployment Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-xl rounded-2xl border border-green-500/20 p-8 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Production Deployment Ready
                </h3>
              </div>
              <p className="text-gray-300 ml-11">
                Application has been successfully prepared for Vercel deployment
              </p>
            </div>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-2">
              READY TO DEPLOY
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0 }}
              className="flex items-center gap-3 bg-white/5 backdrop-blur-xl rounded-lg p-3"
            >
              <CheckSquare className="h-5 w-5 text-green-400" />
              <span className="text-sm text-gray-200">Build Successful</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 }}
              className="flex items-center gap-3 bg-white/5 backdrop-blur-xl rounded-lg p-3"
            >
              <CheckSquare className="h-5 w-5 text-green-400" />
              <span className="text-sm text-gray-200">TypeScript Fixed</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center gap-3 bg-white/5 backdrop-blur-xl rounded-lg p-3"
            >
              <CheckSquare className="h-5 w-5 text-green-400" />
              <span className="text-sm text-gray-200">Dependencies Ready</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3 }}
              className="flex items-center gap-3 bg-white/5 backdrop-blur-xl rounded-lg p-3"
            >
              <CheckSquare className="h-5 w-5 text-green-400" />
              <span className="text-sm text-gray-200">Production Ready</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-12 text-center text-gray-400 pb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400">All Systems Operational</span>
          </div>
          <p className="text-sm">Version {selectedVersion} • Last updated: {currentRelease.date}</p>
          <p className="text-xs mt-2">Continuous deployment via GitHub Actions</p>
        </motion.div>
      </div>
    </div>
  )
}