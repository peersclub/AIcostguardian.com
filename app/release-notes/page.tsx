'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  Rocket, CheckCircle, Clock, AlertTriangle, Users, 
  TrendingUp, Zap, Shield, Database, Code, Activity,
  Star, GitBranch, Package, Bell, Bug, Server,
  MessageSquare, Calendar, Target, Award, Sparkles,
  ArrowUpRight, ChevronRight, Download, Filter,
  RefreshCw, Settings, Brain, Globe, DollarSign,
  Wrench, Info, ChevronDown, Search, Hash, Box,
  FileText, BarChart3, Lock, Cpu, Cloud, ArrowRight,
  Layers, Terminal, Workflow, BookOpen, HelpCircle
} from 'lucide-react'
import Link from 'next/link'

export default function ReleaseNotesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedVersion, setSelectedVersion] = useState('2.0.0')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Handle URL routing for version selection
  useEffect(() => {
    const version = searchParams.get('version')
    if (version && versions.some(v => v.version === version)) {
      setSelectedVersion(version)
    }
  }, [searchParams])

  const handleVersionChange = (version: string) => {
    setSelectedVersion(version)
    const params = new URLSearchParams(searchParams)
    params.set('version', version)
    router.push(`?${params.toString()}`)
  }

  const currentVersion = "2.0.0"
  const releaseDate = "August 13, 2025"

  const versions = [
    { version: '2.0.0', date: 'August 13, 2025', type: 'major', status: 'current' },
    { version: '1.9.0', date: 'July 28, 2025', type: 'minor', status: 'stable' },
    { version: '1.8.0', date: 'July 15, 2025', type: 'minor', status: 'stable' },
    { version: '1.7.0', date: 'June 30, 2025', type: 'minor', status: 'deprecated' }
  ]

  const releaseHighlights = [
    {
      category: "Authentication & Security",
      icon: Shield,
      color: "from-green-900/50 to-emerald-800/50",
      borderColor: "border-green-500/30",
      iconBg: "bg-green-500/20",
      iconColor: "text-green-400",
      textColor: "text-green-300",
      items: [
        { name: "Google OAuth Integration", status: "complete", description: "Seamless login with Google accounts" },
        { name: "Enterprise SSO", status: "complete", description: "Support for SAML 2.0 and OpenID Connect" },
        { name: "Session Management", status: "complete", description: "Improved session handling and security" },
        { name: "2FA Authentication", status: "planned", description: "Two-factor authentication for enhanced security" }
      ]
    },
    {
      category: "AI Provider Integration",
      icon: Brain,
      color: "from-purple-900/50 to-purple-800/50",
      borderColor: "border-purple-500/30",
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-400",
      textColor: "text-purple-300",
      items: [
        { name: "OpenAI GPT-4o", status: "complete", description: "Full support for latest GPT-4o models" },
        { name: "Claude 3.5 Sonnet", status: "complete", description: "Anthropic Claude integration" },
        { name: "Google Gemini Pro", status: "complete", description: "Google AI models support" },
        { name: "Grok Integration", status: "complete", description: "X.AI Grok model support" }
      ]
    },
    {
      category: "Analytics & Monitoring",
      icon: Activity,
      color: "from-blue-900/50 to-blue-800/50",
      borderColor: "border-blue-500/30",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
      textColor: "text-blue-300",
      items: [
        { name: "Real-time Dashboard", status: "complete", description: "Live cost tracking and monitoring" },
        { name: "Cost Analytics", status: "complete", description: "Detailed cost breakdown and analysis" },
        { name: "Usage Patterns", status: "complete", description: "AI usage pattern recognition" },
        { name: "Predictive Insights", status: "in-progress", description: "ML-powered cost predictions" }
      ]
    },
    {
      category: "Team Collaboration",
      icon: Users,
      color: "from-yellow-900/50 to-orange-800/50",
      borderColor: "border-yellow-500/30",
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-400",
      textColor: "text-yellow-300",
      items: [
        { name: "Team Management", status: "complete", description: "Invite and manage team members" },
        { name: "Role-based Access", status: "complete", description: "Granular permission controls" },
        { name: "Usage Attribution", status: "complete", description: "Track usage by team member" },
        { name: "Department Budgets", status: "planned", description: "Budget allocation by department" }
      ]
    }
  ]

  const improvements = [
    { text: "Dashboard load time reduced by 60%", icon: Zap },
    { text: "Improved API response caching", icon: Server },
    { text: "Enhanced mobile responsiveness", icon: Globe },
    { text: "Optimized database queries", icon: Database },
    { text: "Dark mode improvements", icon: Settings }
  ]

  const bugFixes = [
    "Fixed authentication timeout issues with Google OAuth",
    "Resolved chart rendering problems on Safari browser",
    "Corrected timezone handling for international users",
    "Fixed CSV export formatting for large datasets",
    "Resolved WebSocket connection stability issues"
  ]

  // Version-specific content
  const getVersionData = (version: string) => {
    const versionData: { [key: string]: any } = {
      '2.0.0': {
        highlights: releaseHighlights,
        improvements: improvements,
        bugFixes: bugFixes,
        breakingChanges: [
          'API key format has changed - all users must regenerate their keys',
          'Legacy v1 endpoints have been deprecated',
          'Minimum Node.js version is now 18.0.0'
        ],
        metrics: {
          version: '2.0.0',
          newFeatures: '45+',
          bugsFixed: '28',
          contributors: '15'
        }
      },
      '1.9.0': {
        highlights: [
          {
            category: "Authentication Improvements",
            icon: Shield,
            color: "from-green-900/50 to-emerald-800/50",
            borderColor: "border-green-500/30",
            iconBg: "bg-green-500/20",
            iconColor: "text-green-400",
            textColor: "text-green-300",
            items: [
              { name: "Enhanced Session Security", status: "complete", description: "Improved session handling and timeout management" },
              { name: "OAuth Token Refresh", status: "complete", description: "Automatic token refresh for seamless experience" },
              { name: "Login Rate Limiting", status: "complete", description: "Protection against brute force attacks" }
            ]
          },
          {
            category: "Performance Enhancements",
            icon: Zap,
            color: "from-blue-900/50 to-blue-800/50",
            borderColor: "border-blue-500/30",
            iconBg: "bg-blue-500/20",
            iconColor: "text-blue-400",
            textColor: "text-blue-300",
            items: [
              { name: "Database Query Optimization", status: "complete", description: "40% faster response times" },
              { name: "Caching Layer", status: "complete", description: "Redis-based caching for API responses" },
              { name: "CDN Integration", status: "complete", description: "Global content delivery network" }
            ]
          }
        ],
        improvements: [
          { text: "API response time improved by 40%", icon: Zap },
          { text: "Enhanced error handling and logging", icon: Shield },
          { text: "Updated UI components with better accessibility", icon: Globe },
          { text: "Improved mobile app experience", icon: Globe }
        ],
        bugFixes: [
          "Fixed memory leak in real-time dashboard updates",
          "Resolved OAuth redirect issues on mobile Safari",
          "Corrected cost calculation edge cases for partial token usage",
          "Fixed WebSocket reconnection logic"
        ],
        breakingChanges: [],
        metrics: {
          version: '1.9.0',
          newFeatures: '22',
          bugsFixed: '18',
          contributors: '12'
        }
      },
      '1.8.0': {
        highlights: [
          {
            category: "API Integration Expansion",
            icon: Code,
            color: "from-purple-900/50 to-purple-800/50",
            borderColor: "border-purple-500/30",
            iconBg: "bg-purple-500/20",
            iconColor: "text-purple-400",
            textColor: "text-purple-300",
            items: [
              { name: "Grok Integration", status: "complete", description: "Full X.AI Grok model support" },
              { name: "Enhanced Claude Support", status: "complete", description: "Claude 3.5 Sonnet optimization" },
              { name: "Gemini Pro Updates", status: "complete", description: "Latest Gemini model versions" }
            ]
          },
          {
            category: "Analytics Dashboard",
            icon: BarChart3,
            color: "from-yellow-900/50 to-orange-800/50",
            borderColor: "border-yellow-500/30",
            iconBg: "bg-yellow-500/20",
            iconColor: "text-yellow-400",
            textColor: "text-yellow-300",
            items: [
              { name: "Cost Breakdown Charts", status: "complete", description: "Detailed cost analysis by provider and model" },
              { name: "Usage Trends", status: "complete", description: "Historical usage pattern analysis" },
              { name: "Export Functionality", status: "complete", description: "CSV and PDF export options" }
            ]
          }
        ],
        improvements: [
          { text: "New interactive dashboard widgets", icon: Activity },
          { text: "Enhanced data visualization charts", icon: BarChart3 },
          { text: "Improved API key management interface", icon: Shield },
          { text: "Better error messages and user feedback", icon: Info }
        ],
        bugFixes: [
          "Fixed chart rendering issues in Firefox",
          "Resolved API key validation edge cases",
          "Corrected timezone display in usage reports",
          "Fixed responsive layout issues on tablets"
        ],
        breakingChanges: [],
        metrics: {
          version: '1.8.0',
          newFeatures: '18',
          bugsFixed: '15',
          contributors: '10'
        }
      },
      '1.7.0': {
        highlights: [
          {
            category: "Foundation & Setup",
            icon: Database,
            color: "from-gray-900/50 to-gray-800/50",
            borderColor: "border-gray-500/30",
            iconBg: "bg-gray-500/20",
            iconColor: "text-gray-400",
            textColor: "text-gray-300",
            items: [
              { name: "Initial Platform Launch", status: "complete", description: "Core AI cost tracking functionality" },
              { name: "Basic Authentication", status: "complete", description: "User registration and login system" },
              { name: "OpenAI Integration", status: "complete", description: "First AI provider integration" }
            ]
          },
          {
            category: "Core Features",
            icon: Activity,
            color: "from-blue-900/50 to-blue-800/50",
            borderColor: "border-blue-500/30",
            iconBg: "bg-blue-500/20",
            iconColor: "text-blue-400",
            textColor: "text-blue-300",
            items: [
              { name: "Usage Tracking", status: "complete", description: "Basic token and cost tracking" },
              { name: "Simple Dashboard", status: "complete", description: "Overview of AI usage and costs" },
              { name: "API Key Storage", status: "complete", description: "Encrypted storage of API keys" }
            ]
          }
        ],
        improvements: [
          { text: "Initial application architecture", icon: Code },
          { text: "Basic responsive design", icon: Globe },
          { text: "Fundamental security implementation", icon: Shield },
          { text: "Core database schema", icon: Database }
        ],
        bugFixes: [
          "Fixed initial setup and configuration issues",
          "Resolved basic authentication flow problems",
          "Corrected initial cost calculation logic"
        ],
        breakingChanges: [],
        metrics: {
          version: '1.7.0',
          newFeatures: '12',
          bugsFixed: '8',
          contributors: '6'
        }
      }
    }
    return versionData[version] || versionData['2.0.0']
  }

  const currentVersionData = getVersionData(selectedVersion)

  const upcomingFeatures = [
    {
      title: "AI-Powered Optimization",
      description: "Machine learning algorithms to optimize your AI usage",
      progress: 65,
      targetDate: "September 2025",
      icon: Brain
    },
    {
      title: "Custom Model Support",
      description: "Integration with self-hosted and custom AI models",
      progress: 40,
      targetDate: "September 2025",
      icon: Box
    },
    {
      title: "Advanced RBAC",
      description: "Granular permission system with custom roles",
      progress: 25,
      targetDate: "October 2025",
      icon: Lock
    },
    {
      title: "Compliance Dashboard",
      description: "SOC2, GDPR, and HIPAA compliance tracking",
      progress: 10,
      targetDate: "Q4 2025",
      icon: Shield
    }
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 py-6">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Executive Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Rocket className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Release Notes</h1>
                  <span className="px-3 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 text-sm font-medium rounded-full border border-indigo-500/30">
                    v{currentVersion}
                  </span>
                </div>
                <p className="text-gray-400">Track platform updates, new features, and improvements</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-gray-800/50 backdrop-blur-xl rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-700/50 transition-all flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Subscribe
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>

            {/* Version Selector */}
            <div className="flex space-x-1 bg-gray-800/30 rounded-lg p-1">
              {versions.map((v) => (
                <button
                  key={v.version}
                  onClick={() => handleVersionChange(v.version)}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    selectedVersion === v.version
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  v{v.version}
                  {v.status === 'current' && (
                    <span className="ml-2 text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-gradient-to-br from-green-900/50 to-emerald-800/50 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Package className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-2xl font-bold text-white">v{selectedVersion}</span>
              </div>
              <div className="text-green-300 text-sm">{selectedVersion === currentVersion ? 'Latest Version' : 'Previous Version'}</div>
              <div className="mt-2 text-xs text-green-200">Released {versions.find(v => v.version === selectedVersion)?.date || releaseDate}</div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-2xl font-bold text-white">{currentVersionData.metrics.newFeatures}</span>
              </div>
              <div className="text-blue-300 text-sm">New Features</div>
              <div className="mt-2 text-xs text-blue-200">This release</div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Bug className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-2xl font-bold text-white">{currentVersionData.metrics.bugsFixed}</span>
              </div>
              <div className="text-purple-300 text-sm">Bugs Fixed</div>
              <div className="mt-2 text-xs text-purple-200">Stability improved</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-900/50 to-orange-800/50 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-yellow-400" />
                </div>
                <span className="text-2xl font-bold text-white">{currentVersionData.metrics.contributors}</span>
              </div>
              <div className="text-yellow-300 text-sm">Contributors</div>
              <div className="mt-2 text-xs text-yellow-200">This release</div>
            </div>
          </motion.div>

          {/* Release Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">What&apos;s New</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentVersionData.highlights.map((category: any, index: number) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`bg-gradient-to-br ${category.color} backdrop-blur-xl rounded-2xl border ${category.borderColor} p-6`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 ${category.iconBg} rounded-lg`}>
                      <category.icon className={`w-6 h-6 ${category.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold text-white">{category.category}</h3>
                  </div>

                  <div className="space-y-3">
                    {category.items.map((item: any) => (
                      <div key={item.name} className="flex items-start gap-3">
                        <div className="mt-1">
                          {item.status === 'complete' ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : item.status === 'in-progress' ? (
                            <Clock className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{item.name}</div>
                          <div className={`text-sm ${category.textColor} opacity-80`}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Improvements & Bug Fixes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Improvements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Performance Improvements</h3>
              </div>
              
              <div className="space-y-3">
                {currentVersionData.improvements.map((improvement: any, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <improvement.icon className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">{improvement.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Bug Fixes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Bug className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Bug Fixes</h3>
              </div>
              
              <div className="space-y-3">
                {currentVersionData.bugFixes.map((fix: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <span className="text-gray-300">{fix}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Breaking Changes Alert - Only show if there are breaking changes */}
          {currentVersionData.breakingChanges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-red-900/50 to-red-800/50 backdrop-blur-xl rounded-2xl border border-red-500/30 p-6 mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Breaking Changes</h3>
              </div>
              
              <ul className="space-y-2 text-red-200">
                {currentVersionData.breakingChanges.map((change: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-red-400" />
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Upcoming Features - Only show for current version */}
          {selectedVersion === currentVersion && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Roadmap</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                          <feature.icon className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">{feature.title}</h4>
                          <p className="text-sm text-gray-400 mt-1">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white font-medium">{feature.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${feature.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>Target: {feature.targetDate}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-8 text-center"
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
              <Link
                href="https://github.com/peersclub/AIcostguardian.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <GitBranch className="w-4 h-4" />
                View on GitHub
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}