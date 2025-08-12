'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Rocket, CheckCircle, Clock, AlertTriangle, Users, 
  TrendingUp, Zap, Shield, Database, Code, Activity,
  Star, ExternalLink, GitBranch, Package, Bell,
  MessageSquare, Calendar, Target, Award, Sparkles,
  ArrowUpRight, ChevronRight, Download, Filter,
  RefreshCw, Settings, Brain, Globe, DollarSign
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export default function ReleaseNotesPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('current')
  const [isLoading, setIsLoading] = useState(false)
  
  const currentVersion = "2.0.0"
  const releaseDate = "August 12, 2025"
  const completionPercentage = 95

  const features = [
    {
      category: "Authentication & Security",
      icon: Shield,
      color: "from-green-900/50 to-emerald-800/50",
      borderColor: "border-green-500/30",
      iconColor: "text-green-400",
      items: [
        { name: "Google OAuth", status: "complete", badge: "Production" },
        { name: "Enterprise SSO", status: "complete", badge: "Production" },
        { name: "Session Management", status: "complete", badge: "Production" },
        { name: "2FA Authentication", status: "planned", badge: "Q3 2025" }
      ]
    },
    {
      category: "AI Integration",
      icon: Brain,
      color: "from-purple-900/50 to-purple-800/50",
      borderColor: "border-purple-500/30",
      iconColor: "text-purple-400",
      items: [
        { name: "OpenAI GPT-4", status: "complete", badge: "Live" },
        { name: "Claude 3.5", status: "complete", badge: "Live" },
        { name: "Google Gemini", status: "complete", badge: "Live" },
        { name: "Custom Models", status: "in-progress", badge: "Beta" }
      ]
    },
    {
      category: "Analytics & Monitoring",
      icon: Activity,
      color: "from-blue-900/50 to-blue-800/50",
      borderColor: "border-blue-500/30",
      iconColor: "text-blue-400",
      items: [
        { name: "Real-time Dashboard", status: "complete", badge: "Production" },
        { name: "Cost Analytics", status: "complete", badge: "Production" },
        { name: "Usage Tracking", status: "complete", badge: "Production" },
        { name: "Predictive Insights", status: "in-progress", badge: "Beta" }
      ]
    },
    {
      category: "Team Collaboration",
      icon: Users,
      color: "from-yellow-900/50 to-orange-800/50",
      borderColor: "border-yellow-500/30",
      iconColor: "text-yellow-400",
      items: [
        { name: "Team Management", status: "complete", badge: "Production" },
        { name: "Role-based Access", status: "complete", badge: "Production" },
        { name: "Usage Attribution", status: "complete", badge: "Production" },
        { name: "Department Groups", status: "planned", badge: "Q4 2025" }
      ]
    }
  ]

  const metrics = {
    totalFeatures: 120,
    completedFeatures: 95,
    inProgress: 15,
    planned: 10
  }

  const roadmapItems = [
    {
      version: "v2.0.0",
      date: "August 2025",
      status: "current",
      title: "Production Launch",
      description: "Complete platform with enterprise features",
      progress: 100,
      icon: Rocket,
      highlights: ["Real-time monitoring", "Multi-provider support", "Team collaboration"]
    },
    {
      version: "v2.1.0",
      date: "September 2025",
      status: "next",
      title: "Advanced Analytics",
      description: "AI-powered insights and predictions",
      progress: 35,
      icon: Brain,
      highlights: ["Predictive analytics", "Cost optimization", "ML recommendations"]
    },
    {
      version: "v3.0.0",
      date: "Q4 2025",
      status: "planned",
      title: "Enterprise Suite",
      description: "Full enterprise deployment capabilities",
      progress: 0,
      icon: Globe,
      highlights: ["SSO integration", "Advanced RBAC", "Compliance tools"]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Executive Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 backdrop-blur-xl rounded-full border border-indigo-500/30 mb-6">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-indigo-300 text-sm font-medium">Version {currentVersion} Now Live</span>
            </div>
            
            <h1 className="text-5xl font-bold text-white mb-4">
              AI Cost Guardian Release Notes
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Track our journey to revolutionize AI cost management with enterprise-grade features and insights
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Executive Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12"
        >
          {/* Platform Status */}
          <div className="bg-gradient-to-br from-green-900/50 to-emerald-800/50 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">LIVE</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">Production Ready</div>
            <div className="text-green-300 text-sm">All systems operational</div>
            <div className="mt-4 pt-4 border-t border-green-500/20">
              <div className="flex items-center gap-2 text-xs text-green-200">
                <Activity className="w-3 h-3" />
                <span>99.9% Uptime</span>
              </div>
            </div>
          </div>

          {/* Feature Completion */}
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-white">{completionPercentage}%</span>
            </div>
            <div className="text-blue-300 text-sm mb-2">Features Complete</div>
            <Progress value={completionPercentage} className="h-2 bg-blue-900/50" />
            <div className="mt-4 pt-4 border-t border-blue-500/20">
              <div className="flex items-center gap-2 text-xs text-blue-200">
                <TrendingUp className="w-3 h-3" />
                <span>+15% this month</span>
              </div>
            </div>
          </div>

          {/* Active Development */}
          <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Code className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-white">{metrics.inProgress}</span>
            </div>
            <div className="text-purple-300 text-sm">In Development</div>
            <div className="mt-4 pt-4 border-t border-purple-500/20">
              <div className="flex items-center gap-2 text-xs text-purple-200">
                <Clock className="w-3 h-3" />
                <span>Daily updates</span>
              </div>
            </div>
          </div>

          {/* Next Release */}
          <div className="bg-gradient-to-br from-yellow-900/50 to-orange-800/50 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-400" />
              </div>
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">v2.1.0</Badge>
            </div>
            <div className="text-yellow-300 text-sm">Next Release</div>
            <div className="text-white font-semibold">September 2025</div>
            <div className="mt-4 pt-4 border-t border-yellow-500/20">
              <div className="flex items-center gap-2 text-xs text-yellow-200">
                <Rocket className="w-3 h-3" />
                <span>35% Complete</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Feature Implementation</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-800/50 backdrop-blur-xl rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-700/50 transition-all flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button className="px-4 py-2 bg-gray-800/50 backdrop-blur-xl rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-700/50 transition-all flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {features.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`bg-gradient-to-br ${category.color} backdrop-blur-xl rounded-2xl border ${category.borderColor} p-6`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-black/20 rounded-xl">
                    <category.icon className={`w-6 h-6 ${category.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{category.category}</h3>
                    <p className="text-gray-400 text-sm">
                      {category.items.filter(i => i.status === 'complete').length}/{category.items.length} Complete
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {category.items.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        {item.status === 'complete' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : item.status === 'in-progress' ? (
                          <Clock className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
                        )}
                        <span className="text-gray-200">{item.name}</span>
                      </div>
                      <Badge className={
                        item.status === 'complete' 
                          ? "bg-green-500/20 text-green-300 border-green-500/30"
                          : item.status === 'in-progress'
                          ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                          : "bg-gray-700/50 text-gray-400 border-gray-600"
                      }>
                        {item.badge}
                      </Badge>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Roadmap Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <h2 className="text-3xl font-bold text-white mb-8">Development Roadmap</h2>
          
          <div className="space-y-6">
            {roadmapItems.map((item, index) => (
              <motion.div
                key={item.version}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    item.status === 'current' 
                      ? 'bg-green-500/20' 
                      : item.status === 'next'
                      ? 'bg-blue-500/20'
                      : 'bg-gray-700/50'
                  }`}>
                    <item.icon className={`w-6 h-6 ${
                      item.status === 'current' 
                        ? 'text-green-400' 
                        : item.status === 'next'
                        ? 'text-blue-400'
                        : 'text-gray-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-white">{item.title}</h3>
                        <Badge className={
                          item.status === 'current'
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : item.status === 'next'
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : "bg-gray-700/50 text-gray-400 border-gray-600"
                        }>
                          {item.version}
                        </Badge>
                      </div>
                      <span className="text-gray-400 text-sm">{item.date}</span>
                    </div>
                    
                    <p className="text-gray-400 mb-4">{item.description}</p>
                    
                    {item.progress > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white font-medium">{item.progress}%</span>
                        </div>
                        <Progress value={item.progress} className="h-2 bg-gray-800" />
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {item.highlights.map((highlight) => (
                        <div key={highlight} className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-lg">
                          <ChevronRight className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-300">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Get notified about new features, updates, and improvements to AI Cost Guardian
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Subscribe to Updates
            </button>
            <a 
              href="https://github.com/peersclub/AIcostguardian.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <GitBranch className="w-4 h-4" />
              View on GitHub
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}