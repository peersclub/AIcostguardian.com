'use client'

import { motion } from 'framer-motion'
import { 
  Calendar, CheckCircle, Clock, AlertTriangle, Users, 
  TrendingUp, Zap, Shield, Database, Code, Smartphone,
  Globe, Mail, MessageSquare, Star, ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

export default function ReleaseNotesPage() {
  const currentVersion = "2.0.0"
  const releaseDate = "August 12, 2025"
  const completionPercentage = 85

  const features = [
    {
      category: "Authentication",
      items: [
        { name: "Google OAuth", ui: "✅", backend: "✅", api: "✅", database: "✅", status: "✅ Complete", available: "Now" },
        { name: "Enterprise Email Validation", ui: "✅", backend: "✅", api: "✅", database: "✅", status: "✅ Complete", available: "Now" },
        { name: "Session Management", ui: "✅", backend: "✅", api: "✅", database: "✅", status: "✅ Complete", available: "Now" },
        { name: "Email/Password Login", ui: "❌", backend: "❌", api: "❌", database: "❌", status: "📋 Planned", available: "v2.1" }
      ]
    },
    {
      category: "Dashboard & Analytics",
      items: [
        { name: "Main Dashboard", ui: "✅", backend: "✅", api: "✅", database: "✅", status: "✅ Complete", available: "Now" },
        { name: "Cost Analytics", ui: "✅", backend: "✅", api: "✅", database: "✅", status: "✅ Complete", available: "Now" },
        { name: "Usage Charts", ui: "✅", backend: "✅", api: "✅", database: "✅", status: "✅ Complete", available: "Now" },
        { name: "Real-time Updates", ui: "✅", backend: "✅", api: "✅", database: "✅", status: "✅ Complete", available: "Now" }
      ]
    },
    {
      category: "Provider Integration",
      items: [
        { name: "OpenAI Integration", ui: "✅", backend: "✅", api: "✅", database: "✅", status: "✅ Complete", available: "Now" },
        { name: "Claude Integration", ui: "✅", backend: "✅", api: "✅", database: "✅", status: "✅ Complete", available: "Now" },
        { name: "Gemini Integration", ui: "✅", backend: "✅", api: "✅", database: "✅", status: "✅ Complete", available: "Now" },
        { name: "Grok Integration", ui: "✅", backend: "✅", api: "✅", database: "✅", status: "✅ Complete", available: "Now" }
      ]
    },
    {
      category: "Team Management",
      items: [
        { name: "Team Dashboard", ui: "✅", backend: "❌", api: "❌", database: "❌", status: "🎨 UI Ready", available: "Now*" },
        { name: "Member Management", ui: "✅", backend: "❌", api: "❌", database: "❌", status: "🎨 UI Ready", available: "v0.9" },
        { name: "Role-based Access", ui: "✅", backend: "❌", api: "❌", database: "❌", status: "📋 Planned", available: "v1.1" },
        { name: "Usage Attribution", ui: "✅", backend: "❌", api: "❌", database: "❌", status: "🚧 Building", available: "v0.9" }
      ]
    },
    {
      category: "Notifications",
      items: [
        { name: "Real-time Socket.io Notifications", ui: "✅", backend: "✅", api: "✅", database: "✅", status: "✅ Complete", available: "Now" },
        { name: "In-App Notifications", ui: "✅", backend: "✅", api: "✅", database: "✅", status: "✅ Complete", available: "Now" },
        { name: "Site-wide Announcements", ui: "✅", backend: "✅", api: "✅", database: "✅", status: "✅ Complete", available: "Now" },
        { name: "Email Notifications", ui: "✅", backend: "🔧", api: "✅", database: "✅", status: "🔧 Needs Keys", available: "Now" }
      ]
    },
    {
      category: "AI Chat (AIOptimise)",
      items: [
        { name: "Claude-style Unified Input", ui: "✅", backend: "✅", api: "✅", database: "✅", status: "✅ Complete", available: "Now" },
        { name: "Thread Management", ui: "✅", backend: "✅", api: "✅", database: "✅", status: "✅ Complete", available: "Now" },
        { name: "Voice Transcription", ui: "✅", backend: "✅", api: "✅", database: "✅", status: "✅ Complete", available: "Now" },
        { name: "Multi-Model Support", ui: "✅", backend: "✅", api: "✅", database: "✅", status: "✅ Complete", available: "Now" }
      ]
    },
    {
      category: "Billing & Settings",
      items: [
        { name: "Settings Dashboard", ui: "✅", backend: "🔧", api: "🔧", database: "✅", status: "🔧 Partial", available: "Now" },
        { name: "API Key Management", ui: "✅", backend: "🔧", api: "🔧", database: "✅", status: "🔧 Partial", available: "Now" },
        { name: "Payment Processing", ui: "❌", backend: "❌", api: "❌", database: "❌", status: "📋 Planned", available: "v1.0" },
        { name: "Billing History", ui: "✅", backend: "❌", api: "❌", database: "❌", status: "🎨 UI Ready", available: "v1.0" }
      ]
    }
  ]

  const roadmapItems = [
    {
      version: "v2.0.0",
      date: "August 12, 2025",
      status: "current",
      title: "Production Ready",
      description: "Full-featured release with real-time notifications, AI chat, and complete integrations",
      completion: 100
    },
    {
      version: "v2.1.0",
      date: "September 2025",
      status: "next",
      title: "Advanced Analytics",
      description: "Predictive analytics, cost forecasting, ML-based recommendations",
      completion: 0
    },
    {
      version: "v2.2.0",
      date: "October 2025",
      status: "future",
      title: "Enterprise Suite",
      description: "SSO, advanced RBAC, audit logging, compliance features",
      completion: 0
    },
    {
      version: "v3.0.0",
      date: "Q4 2025",
      status: "future",
      title: "AI Marketplace",
      description: "Multi-tenant platform, API marketplace, developer ecosystem",
      completion: 0
    }
  ]

  const metrics = {
    totalFeatures: features.reduce((sum, cat) => sum + cat.items.length, 0),
    completedFeatures: features.reduce((sum, cat) => sum + cat.items.filter(item => item.status.includes('Complete')).length, 0),
    uiReadyFeatures: features.reduce((sum, cat) => sum + cat.items.filter(item => item.status.includes('UI Ready')).length, 0)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* New Release Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-blue-500" />
                <div>
                  <CardTitle>🎉 Production-Ready Release Available!</CardTitle>
                  <CardDescription>
                    Version 2.0.0 is now production-ready with all major features implemented
                  </CardDescription>
                </div>
              </div>
              <a href="/release-notes/current">
                <Button>
                  View Current Release
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="px-4 py-1 text-lg">
              Current Release
            </Badge>
          </div>
          
          <h1 className="text-4xl font-bold">
            AI Cost Guardian <span className="text-blue-600">{currentVersion}</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Released {releaseDate} • Platform Status: Beta Development
          </p>
          
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Completion</span>
              <span className="font-semibold">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>
        </div>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Platform Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold">Core UI/UX</div>
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Complete</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <Code className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="font-semibold">Backend Integration</div>
                <div className="text-2xl font-bold text-orange-600">40%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Smartphone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="font-semibold">Frontend Features</div>
                <div className="text-2xl font-bold text-blue-600">85%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Nearly Complete</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <Shield className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="font-semibold">Production Readiness</div>
                <div className="text-2xl font-bold text-red-600">30%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Early Stage</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Implementation Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Feature Implementation Matrix
            </CardTitle>
            <CardDescription>
              Track progress across all platform components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {features.map((category) => (
                <div key={category.category}>
                  <h3 className="text-lg font-semibold mb-3">{category.category}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 w-1/3">Feature</th>
                          <th className="text-center py-2 w-16">UI</th>
                          <th className="text-center py-2 w-16">Backend</th>
                          <th className="text-center py-2 w-16">API</th>
                          <th className="text-center py-2 w-16">Database</th>
                          <th className="text-left py-2 w-1/4">Status</th>
                          <th className="text-center py-2 w-20">Available</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.items.map((item) => (
                          <tr key={item.name} className="border-b">
                            <td className="py-2">{item.name}</td>
                            <td className="text-center py-2">{item.ui}</td>
                            <td className="text-center py-2">{item.backend}</td>
                            <td className="text-center py-2">{item.api}</td>
                            <td className="text-center py-2">{item.database}</td>
                            <td className="py-2">
                              <Badge variant={
                                item.status.includes('Complete') ? 'default' :
                                item.status.includes('UI Ready') ? 'secondary' :
                                item.status.includes('Partial') ? 'outline' :
                                'destructive'
                              }>
                                {item.status}
                              </Badge>
                            </td>
                            <td className="text-center py-2 text-xs">{item.available}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>*Using demonstration data</strong> - These features have complete UI implementations 
                but are displaying mock data until database integration is complete in v0.9.0
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Roadmap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Development Roadmap
            </CardTitle>
            <CardDescription>
              Our path to production readiness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roadmapItems.map((item, index) => (
                <div key={item.version} className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                    item.status === 'current' ? 'bg-blue-600' :
                    item.status === 'next' ? 'bg-orange-500' :
                    'bg-gray-300'
                  }`} />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{item.version}</h4>
                      <Badge variant={
                        item.status === 'current' ? 'default' :
                        item.status === 'next' ? 'secondary' :
                        'outline'
                      }>
                        {item.status === 'current' ? 'Current' :
                         item.status === 'next' ? 'Next' : 'Planned'}
                      </Badge>
                      <span className="text-sm text-gray-500">{item.date}</span>
                    </div>
                    <h5 className="font-medium mb-1">{item.title}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                    
                    {item.completion > 0 && (
                      <div className="mt-2">
                        <Progress value={item.completion} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* What's Working Now */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              What's Working Right Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-600">✅ Fully Functional</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Google OAuth authentication
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Enterprise notification system
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Complete responsive UI/UX
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Session management
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-blue-600">🎨 Beautiful UI (Demo Data)</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Interactive cost analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Provider usage dashboards
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Team management interface
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Settings and API key management
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Limitations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Current Limitations (Beta)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Data Persistence</h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• API keys stored locally (database integration in v0.9)</li>
                  <li>• Usage history limited to session (full history in v0.9)</li>
                  <li>• Team data is demonstration only (real teams in v0.9)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Provider Integration</h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• API connections show mock data (live data in v0.9)</li>
                  <li>• Cost calculations use static pricing (dynamic pricing in v0.9)</li>
                  <li>• Real-time updates not yet available (WebSockets in v1.0)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Features Not Yet Available</h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Payment processing (coming in v1.0)</li>
                  <li>• Data export functionality (coming in v0.9)</li>
                  <li>• Webhook integrations (coming in v1.1)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              A Message from Our Team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We're building AI Cost Guardian in public, and we're excited to share our progress with you!
            </p>
            
            <div>
              <h4 className="font-semibold mb-2">Where We Are:</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We've completed the entire user interface and experience design. Every screen, every interaction, 
                and every visualization is ready. What you see is exactly how the final product will look and feel.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">What's Next:</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We're now connecting these beautiful interfaces to real data. Over the next 30 days, we'll be 
                replacing all demonstration data with live connections to your actual AI providers.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Why Beta?</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We believe in transparency. While our UI is production-ready, we're still building the backend 
                infrastructure. By joining our beta, you're helping shape the future of AI cost management.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm">
                <strong>Your Data is Safe:</strong> Even in beta, we use enterprise-grade encryption for all 
                API keys and never store your AI prompts or responses.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Help Us Build Better
            </CardTitle>
            <CardDescription>
              Your feedback shapes our development priorities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start">
                <a href="https://github.com/peersclub/AIcostguardian.com/issues" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Report Issues on GitHub
                </a>
              </Button>
              
              <Button variant="outline" className="justify-start">
                <a href="mailto:feedback@aicostguardian.com">
                  <Mail className="h-4 w-4 mr-2" />
                  Request Features
                </a>
              </Button>
              
              <Button variant="outline" className="justify-start">
                <a href="https://roadmap.aicostguardian.com" target="_blank" rel="noopener noreferrer">
                  <Star className="h-4 w-4 mr-2" />
                  Vote on Features
                </a>
              </Button>
              
              <Button variant="outline" className="justify-start">
                <a href="https://discord.gg/aicostguardian" target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Join Discussion
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Version History */}
        <Card>
          <CardHeader>
            <CardTitle>Version History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-2 border-blue-600 pl-4">
                <h4 className="font-semibold">v0.8.0-beta (Current)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">August 8, 2025</p>
                <ul className="text-sm space-y-1">
                  <li>• Complete UI/UX implementation</li>
                  <li>• Enterprise notification system</li>
                  <li>• Google OAuth authentication</li>
                  <li>• Mock data integration</li>
                  <li>• Basic API structure</li>
                </ul>
              </div>
              
              <div className="border-l-2 border-gray-300 pl-4">
                <h4 className="font-semibold">v0.7.0-alpha</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">July 2025</p>
                <ul className="text-sm space-y-1">
                  <li>• Initial dashboard design</li>
                  <li>• Component library setup</li>
                  <li>• Navigation system</li>
                  <li>• Provider integration mockups</li>
                </ul>
              </div>
              
              <div className="border-l-2 border-gray-300 pl-4">
                <h4 className="font-semibold">v0.6.0-alpha</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">June 2025</p>
                <ul className="text-sm space-y-1">
                  <li>• Project initialization</li>
                  <li>• Technology stack selection</li>
                  <li>• Architecture planning</li>
                  <li>• Design system foundation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Last updated: {releaseDate}</p>
          <p>Next update: Weekly on Fridays</p>
        </div>
      </motion.div>
    </div>
  )
}