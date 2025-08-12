'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  CheckCircle, Circle, Clock, Rocket, Bug, Sparkles, 
  Code, Shield, Zap, Globe, Bell, MessageSquare, Users,
  ChevronRight, Calendar, Target, Award, Activity,
  GitBranch, Package, Download, Filter, TrendingUp,
  Database, Brain, DollarSign, ArrowRight, ChevronDown,
  ExternalLink, Star, AlertTriangle, Settings
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface ReleaseItem {
  id: string
  type: 'feature' | 'fix' | 'improvement' | 'breaking' | 'security'
  title: string
  description: string
  status: 'completed' | 'in-progress' | 'pending'
  date?: string
  details?: string[]
  impact?: 'high' | 'medium' | 'low'
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
    summary: 'Production-Ready Platform with Enterprise Features',
    items: [
      {
        id: 'real-time-notifications',
        type: 'feature',
        title: 'Real-time Notification System',
        description: 'Socket.io-based notifications with multi-channel support',
        status: 'completed',
        impact: 'high',
        details: [
          'WebSocket real-time updates',
          'Email, Slack, and in-app channels',
          'Customizable notification rules',
          'Site-wide announcement system',
          'Notification center with history'
        ]
      },
      {
        id: 'ai-chat-interface',
        type: 'feature',
        title: 'Claude-style AI Chat Interface',
        description: 'Unified AI chat with advanced capabilities',
        status: 'completed',
        impact: 'high',
        details: [
          'Thread management system',
          'Voice input with transcription',
          'Multi-model support (GPT-4, Claude, Gemini)',
          'Collaboration features',
          'Context persistence'
        ]
      },
      {
        id: 'production-optimization',
        type: 'improvement',
        title: 'Production Build Optimization',
        description: 'Complete TypeScript fixes and build pipeline improvements',
        status: 'completed',
        impact: 'high',
        details: [
          'Zero TypeScript errors',
          'Optimized bundle size',
          'Improved build performance',
          'Enhanced type safety',
          'Vercel deployment ready'
        ]
      },
      {
        id: 'dashboard-redesign',
        type: 'improvement',
        title: 'Executive Dashboard Redesign',
        description: 'Enterprise-grade dashboard with advanced metrics',
        status: 'completed',
        impact: 'medium',
        details: [
          'Real-time KPI tracking',
          'Advanced visualizations',
          'Predictive analytics',
          'Custom reporting'
        ]
      },
      {
        id: 'security-enhancements',
        type: 'security',
        title: 'Security & Compliance Updates',
        description: 'Enhanced security features for enterprise deployment',
        status: 'completed',
        impact: 'high',
        details: [
          'API key encryption',
          'Row-level security',
          'Audit logging',
          'GDPR compliance'
        ]
      }
    ]
  },
  {
    version: 'v2.1.0',
    date: 'Q3 2025',
    status: 'upcoming',
    summary: 'Advanced Analytics & ML Features',
    items: [
      {
        id: 'ml-predictions',
        type: 'feature',
        title: 'ML-based Cost Predictions',
        description: 'AI-powered cost forecasting and optimization',
        status: 'in-progress',
        impact: 'high'
      },
      {
        id: 'custom-dashboards',
        type: 'feature',
        title: 'Custom Dashboard Builder',
        description: 'Drag-and-drop dashboard customization',
        status: 'pending',
        impact: 'medium'
      },
      {
        id: 'advanced-reporting',
        type: 'feature',
        title: 'Advanced Reporting Suite',
        description: 'Scheduled reports with custom templates',
        status: 'pending',
        impact: 'medium'
      }
    ]
  }
]

export default function CurrentReleaseNotesPage() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [selectedVersion, setSelectedVersion] = useState('v2.0.0')
  const [filterType, setFilterType] = useState<string>('all')

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
  
  const filteredItems = filterType === 'all' 
    ? currentRelease.items 
    : currentRelease.items.filter(item => item.type === filterType)

  const stats = {
    total: currentRelease.items.length,
    completed: currentRelease.items.filter(i => i.status === 'completed').length,
    inProgress: currentRelease.items.filter(i => i.status === 'in-progress').length,
    features: currentRelease.items.filter(i => i.type === 'feature').length,
    improvements: currentRelease.items.filter(i => i.type === 'improvement').length,
    fixes: currentRelease.items.filter(i => i.type === 'fix').length
  }

  const completionPercentage = (stats.completed / stats.total) * 100

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'feature':
        return {
          icon: Sparkles,
          bgColor: 'bg-blue-500/20',
          iconColor: 'text-blue-400',
          borderColor: 'border-blue-500/30',
          badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        }
      case 'improvement':
        return {
          icon: TrendingUp,
          bgColor: 'bg-purple-500/20',
          iconColor: 'text-purple-400',
          borderColor: 'border-purple-500/30',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
        }
      case 'fix':
        return {
          icon: Bug,
          bgColor: 'bg-red-500/20',
          iconColor: 'text-red-400',
          borderColor: 'border-red-500/30',
          badge: 'bg-red-500/20 text-red-300 border-red-500/30'
        }
      case 'security':
        return {
          icon: Shield,
          bgColor: 'bg-yellow-500/20',
          iconColor: 'text-yellow-400',
          borderColor: 'border-yellow-500/30',
          badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
        }
      default:
        return {
          icon: Code,
          bgColor: 'bg-gray-700/50',
          iconColor: 'text-gray-400',
          borderColor: 'border-gray-600',
          badge: 'bg-gray-700/50 text-gray-400 border-gray-600'
        }
    }
  }

  const getImpactBadge = (impact?: string) => {
    switch (impact) {
      case 'high':
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">High Impact</Badge>
      case 'medium':
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">Medium Impact</Badge>
      case 'low':
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">Low Impact</Badge>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header with Version Info */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link href="/release-notes" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span>Back to Release Notes</span>
            </Link>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-5xl font-bold text-white">{currentRelease.version}</h1>
                  <Badge className={
                    currentRelease.status === 'current'
                      ? "bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1"
                      : "bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1"
                  }>
                    {currentRelease.status === 'current' ? 'CURRENT RELEASE' : 'UPCOMING'}
                  </Badge>
                </div>
                <p className="text-xl text-gray-400 mb-2">{currentRelease.summary}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{currentRelease.date}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-800/50 backdrop-blur-xl rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-700/50 transition-all flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  View on GitHub
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Release Progress</h2>
            <span className="text-2xl font-bold text-white">{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-3 bg-gray-800 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-gray-400">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
              <div className="text-xs text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.inProgress}</div>
              <div className="text-xs text-gray-400">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.features}</div>
              <div className="text-xs text-gray-400">Features</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.improvements}</div>
              <div className="text-xs text-gray-400">Improvements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{stats.fixes}</div>
              <div className="text-xs text-gray-400">Fixes</div>
            </div>
          </div>
        </motion.div>

        {/* Version Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex gap-2">
            {releases.map(release => (
              <button
                key={release.version}
                onClick={() => setSelectedVersion(release.version)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedVersion === release.version
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700'
                }`}
              >
                {release.version}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-gray-800/50 backdrop-blur-xl rounded-lg border border-gray-700 text-gray-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="feature">Features</option>
              <option value="improvement">Improvements</option>
              <option value="fix">Fixes</option>
              <option value="security">Security</option>
            </select>
          </div>
        </motion.div>

        {/* Release Items */}
        <div className="space-y-4">
          {filteredItems.map((item, index) => {
            const typeStyles = getTypeStyles(item.type)
            const TypeIcon = typeStyles.icon
            const isExpanded = expandedItems.has(item.id)

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden"
              >
                <div
                  className="p-6 cursor-pointer hover:bg-gray-800/30 transition-colors"
                  onClick={() => toggleExpanded(item.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${typeStyles.bgColor}`}>
                      <TypeIcon className={`w-6 h-6 ${typeStyles.iconColor}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">{item.title}</h3>
                            {getImpactBadge(item.impact)}
                          </div>
                          <p className="text-gray-400">{item.description}</p>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </motion.div>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-3">
                        <Badge className={typeStyles.badge}>
                          {item.type}
                        </Badge>
                        {item.status === 'completed' ? (
                          <div className="flex items-center gap-2 text-green-400 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            <span>Completed</span>
                          </div>
                        ) : item.status === 'in-progress' ? (
                          <div className="flex items-center gap-2 text-yellow-400 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>In Progress</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Circle className="w-4 h-4" />
                            <span>Pending</span>
                          </div>
                        )}
                        {item.date && (
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Calendar className="w-3 h-3" />
                            <span>{item.date}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {isExpanded && item.details && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-800"
                    >
                      <div className="p-6 pl-20">
                        <h4 className="text-sm font-semibold text-gray-300 mb-3">Implementation Details:</h4>
                        <ul className="space-y-2">
                          {item.details.map((detail, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="flex items-start gap-3 text-gray-400"
                            >
                              <ArrowRight className="w-4 h-4 text-gray-600 mt-0.5" />
                              <span>{detail}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Get Involved</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 hover:bg-gray-700/50 transition-all text-center">
              <GitBranch className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
              <div className="text-white font-medium">Contribute</div>
              <div className="text-xs text-gray-400">Join development</div>
            </button>
            <button className="p-4 bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 hover:bg-gray-700/50 transition-all text-center">
              <MessageSquare className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-white font-medium">Feedback</div>
              <div className="text-xs text-gray-400">Share your thoughts</div>
            </button>
            <button className="p-4 bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 hover:bg-gray-700/50 transition-all text-center">
              <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-white font-medium">Star</div>
              <div className="text-xs text-gray-400">Support the project</div>
            </button>
            <button className="p-4 bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 hover:bg-gray-700/50 transition-all text-center">
              <Bell className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-white font-medium">Subscribe</div>
              <div className="text-xs text-gray-400">Get updates</div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}