'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  ArrowRight
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
    case 'feature': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    case 'fix': return 'bg-red-500/10 text-red-500 border-red-500/20'
    case 'improvement': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    case 'breaking': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    case 'security': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
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
    <div className="container mx-auto py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Rocket className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Release Notes</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Track the latest updates, features, and improvements to AI Cost Guardian
        </p>
      </div>

      {/* Current Release Banner */}
      {currentRelease.status === 'current' && (
        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge className="bg-primary text-primary-foreground">
                  CURRENT RELEASE
                </Badge>
                <CardTitle className="text-2xl">{currentRelease.version}</CardTitle>
                <span className="text-muted-foreground">{currentRelease.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">
                  {completedItems}/{totalItems} Complete
                </span>
              </div>
            </div>
            <CardDescription className="text-base mt-2">
              {currentRelease.summary}
            </CardDescription>
            <div className="mt-4">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Version Selector */}
      <Tabs value={selectedVersion} onValueChange={setSelectedVersion} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          {releases.map(release => (
            <TabsTrigger key={release.version} value={release.version}>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Changes
                </CardTitle>
                <div className="text-2xl font-bold">{currentRelease.items.length}</div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Features
                </CardTitle>
                <div className="text-2xl font-bold text-blue-500">
                  {currentRelease.items.filter(i => i.type === 'feature').length}
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Fixes
                </CardTitle>
                <div className="text-2xl font-bold text-red-500">
                  {currentRelease.items.filter(i => i.type === 'fix').length}
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Improvements
                </CardTitle>
                <div className="text-2xl font-bold text-purple-500">
                  {currentRelease.items.filter(i => i.type === 'improvement').length}
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Release Items */}
          <div className="space-y-4">
            {currentRelease.items.map(item => (
              <Card 
                key={item.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => toggleExpanded(item.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {expandedItems.has(item.id) ? 
                          <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        }
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={getTypeColor(item.type)}
                          >
                            {getTypeIcon(item.type)}
                            <span className="ml-1 capitalize">{item.type}</span>
                          </Badge>
                          {getStatusIcon(item.status)}
                        </div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </div>
                    </div>
                    {item.date && (
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <Calendar className="h-3 w-3" />
                        {item.date}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                {expandedItems.has(item.id) && item.details && (
                  <CardContent>
                    <div className="pl-7 space-y-2">
                      <div className="text-sm font-medium text-muted-foreground mb-2">
                        Implementation Details:
                      </div>
                      <ul className="space-y-1">
                        {item.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <ArrowRight className="h-3 w-3 text-muted-foreground mt-0.5" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <GitBranch className="h-4 w-4 mr-2" />
            View on GitHub
          </Button>
          <Button variant="outline" size="sm">
            <Package className="h-4 w-4 mr-2" />
            Download Release
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Subscribe to Updates
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Provide Feedback
          </Button>
        </CardContent>
      </Card>

      {/* Deployment Status */}
      <Card className="mt-8 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Production Deployment Ready
              </CardTitle>
              <CardDescription className="mt-2">
                Application has been successfully prepared for Vercel deployment
              </CardDescription>
            </div>
            <Badge className="bg-green-500 text-white">
              READY TO DEPLOY
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-green-500" />
              <span className="text-sm">Build Successful</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-green-500" />
              <span className="text-sm">TypeScript Fixed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-green-500" />
              <span className="text-sm">Dependencies Installed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-green-500" />
              <span className="text-sm">Tests Passing</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}