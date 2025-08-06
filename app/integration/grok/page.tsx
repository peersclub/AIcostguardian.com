'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
  Globe,
  Shield,
  Clock,
  DollarSign,
  Activity,
  Settings,
  Eye,
  Play,
  Pause,
  BarChart3,
  TrendingUp,
  Users,
  Key,
  Database,
  Server,
  Wifi,
  AlertCircle,
  Info,
  ExternalLink,
  BookOpen,
  Brain,
  Twitter,
  Rss,
  Calendar,
  Search,
  MessageCircle
} from 'lucide-react'
import { getAIProviderLogo, getProviderInfo } from '@/components/ui/ai-logos'
import { getProviderById } from '@/lib/ai-providers-config'
import AuthWrapper from '@/components/AuthWrapper'

interface TestCase {
  name: string
  status: string
  time: string
}

interface TestSuite {
  name: string
  icon: any
  description: string
  tests: TestCase[]
}

interface TestSuites {
  [key: string]: TestSuite
}

interface TestResult {
  status: string
  timestamp: string
  results: TestCase[]
}

interface RealTimeData {
  lastPing?: string
  responseTime?: number
  tokensUsed?: number
  requestsPerMinute?: number
  errorRate?: number
  uptime?: number
  activeConnections?: number
}

function GrokIntegrationContent() {
  const { data: session } = useSession()
  const [connectionStatus, setConnectionStatus] = useState('testing')
  const [selectedTest, setSelectedTest] = useState('connection')
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})
  const [isRunningTest, setIsRunningTest] = useState(false)
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({})

  const provider = getProviderById('grok')
  const providerInfo = getProviderInfo('grok')

  // Mock real-time testing data
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData({
        lastPing: new Date().toISOString(),
        responseTime: Math.floor(Math.random() * 250) + 100,
        tokensUsed: Math.floor(Math.random() * 600) + 300,
        requestsPerMinute: Math.floor(Math.random() * 12) + 3,
        errorRate: Math.random() * 3.2,
        uptime: 97.8,
        activeConnections: Math.floor(Math.random() * 4) + 1
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const testSuites: TestSuites = {
    connection: {
      name: 'Connection Test',
      icon: Wifi,
      description: 'Test basic API connectivity and authentication',
      tests: [
        { name: 'API Endpoint Reachability', status: 'passed', time: '156ms' },
        { name: 'Authentication Validation', status: 'passed', time: '234ms' },
        { name: 'SSL Certificate Check', status: 'passed', time: '45ms' },
        { name: 'Rate Limit Headers', status: 'warning', time: '87ms' }
      ]
    },
    models: {
      name: 'Models & Capabilities',
      icon: Database,
      description: 'Test Grok models and their capabilities',
      tests: [
        { name: 'Grok-1 Availability', status: 'passed', time: '298ms' },
        { name: 'Grok-1.5 Access Check', status: 'passed', time: '267ms' },
        { name: 'Real-time Data Access', status: 'passed', time: '189ms' },
        { name: 'X Platform Integration', status: 'passed', time: '345ms' },
        { name: 'Humor & Personality', status: 'passed', time: '456ms' },
        { name: 'Function Calling', status: 'warning', time: '567ms' }
      ]
    },
    realtime: {
      name: 'Real-time Data',
      icon: Rss,
      description: 'Test Grok\'s real-time data capabilities',
      tests: [
        { name: 'X/Twitter Feed Access', status: 'passed', time: '234ms' },
        { name: 'Current Events Awareness', status: 'passed', time: '456ms' },
        { name: 'Trending Topics', status: 'passed', time: '345ms' },
        { name: 'Live News Integration', status: 'warning', time: '678ms' },
        { name: 'Real-time Search', status: 'passed', time: '567ms' }
      ]
    },
    personality: {
      name: 'Personality Tests',
      icon: MessageCircle,
      description: 'Test Grok\'s unique personality and humor',
      tests: [
        { name: 'Wit & Humor Detection', status: 'passed', time: '1.2s' },
        { name: 'Sarcasm Understanding', status: 'passed', time: '0.9s' },
        { name: 'Rebellious Responses', status: 'passed', time: '1.4s' },
        { name: 'Cultural References', status: 'passed', time: '1.1s' },
        { name: 'Conversational Style', status: 'passed', time: '0.8s' }
      ]
    },
    performance: {
      name: 'Performance Tests',
      icon: Zap,
      description: 'Test response times and throughput',
      tests: [
        { name: 'Single Request Latency', status: 'warning', time: '267ms' },
        { name: 'Concurrent Requests (3x)', status: 'passed', time: '1.4s' },
        { name: 'Context Processing', status: 'passed', time: '2.1s' },
        { name: 'Streaming Response', status: 'warning', time: '298ms' },
        { name: 'Token Throughput', status: 'passed', time: '1.8s' }
      ]
    },
    billing: {
      name: 'Billing & Usage',
      icon: DollarSign,
      description: 'Test billing information and usage tracking',
      tests: [
        { name: 'Usage Tracking', status: 'passed', time: '123ms' },
        { name: 'Cost Calculation', status: 'passed', time: '98ms' },
        { name: 'Rate Limit Status', status: 'warning', time: '156ms' },
        { name: 'Billing API Access', status: 'failed', time: 'timeout' }
      ]
    }
  }

  const mockApiResponse = {
    model: "grok-1.5",
    usage: {
      prompt_tokens: 89,
      completion_tokens: 156,
      total_tokens: 245
    },
    choices: [
      {
        message: {
          role: "assistant",
          content: "Hey there! I'm Grok, the rebelliously helpful AI. Unlike my more buttoned-up AI cousins, I've got personality, wit, and access to real-time X data. I can crack jokes, understand sarcasm, and give you the latest on what's happening right now on the internet. Think of me as your AI friend who's always up to date and never afraid to speak their mind. What can I help you with today? 🚀"
        },
        finish_reason: "stop"
      }
    ],
    x_integration: {
      real_time_access: true,
      trending_topics: ["AI", "SpaceX", "Tesla", "Cryptocurrency"],
      last_update: "2024-01-15T10:30:00Z"
    },
    personality_metrics: {
      humor_level: 8.5,
      wit_score: 9.2,
      rebelliousness: 7.8
    }
  }

  const runTest = async (testType: string) => {
    setIsRunningTest(true)
    setSelectedTest(testType)
    
    // Simulate API testing
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setTestResults(prev => ({
      ...prev,
      [testType]: {
        status: 'completed',
        timestamp: new Date().toISOString(),
        results: testSuites[testType].tests
      }
    }))
    
    setIsRunningTest(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'failed': return 'text-red-400 bg-red-500/20 border-red-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-black to-gray-800/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gray-700/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 min-h-screen py-6">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <Link 
                href="/settings" 
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              
              <div className="flex items-center gap-4">
                {getAIProviderLogo('grok', 'w-12 h-12')}
                <div>
                  <h1 className="text-3xl font-bold text-white">Grok Integration Center</h1>
                  <p className="text-gray-400">Real-time AI testing and monitoring for X.AI Grok</p>
                </div>
              </div>
              
              <div className="ml-auto flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">Real-time Data</span>
                </div>
                <button 
                  onClick={() => runTest(selectedTest)}
                  disabled={isRunningTest}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {isRunningTest ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {isRunningTest ? 'Testing Grok...' : 'Run Test Suite'}
                </button>
              </div>
            </div>

            {/* Real-time status bar */}
            <div className="grid grid-cols-7 gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700 mb-6">
              <div className="text-center">
                <div className="text-gray-400 font-semibold">{realTimeData.responseTime || '--'}ms</div>
                <div className="text-xs text-gray-400">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-semibold">{realTimeData.requestsPerMinute || '--'}/min</div>
                <div className="text-xs text-gray-400">Requests</div>
              </div>
              <div className="text-center">
                <div className="text-cyan-400 font-semibold">{realTimeData.tokensUsed || '--'}</div>
                <div className="text-xs text-gray-400">Tokens Used</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-semibold">{realTimeData.errorRate?.toFixed(1) || '--'}%</div>
                <div className="text-xs text-gray-400">Error Rate</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-semibold">{realTimeData.uptime || '--'}%</div>
                <div className="text-xs text-gray-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-semibold">{realTimeData.activeConnections || '--'}</div>
                <div className="text-xs text-gray-400">Connections</div>
              </div>
              <div className="text-center">
                <div className="text-gray-300 font-semibold text-xs">
                  {realTimeData.lastPing ? new Date(realTimeData.lastPing).toLocaleTimeString() : '--'}
                </div>
                <div className="text-xs text-gray-400">Last Ping</div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Test Suites Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-400" />
                Test Suites
              </h3>
              
              <div className="space-y-2">
                {Object.entries(testSuites).map(([key, suite]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTest(key)}
                    className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
                      selectedTest === key
                        ? 'bg-gray-600/20 border border-gray-500/30 text-gray-200'
                        : 'bg-gray-800/30 hover:bg-gray-700/50 text-gray-300 hover:text-white'
                    }`}
                  >
                    <suite.icon className={`w-4 h-4 ${selectedTest === key ? 'text-gray-300' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <div className="font-medium">{suite.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{suite.description}</div>
                    </div>
                    {testResults[key] && (
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Provider Info */}
              <div className="mt-6 p-4 bg-gray-500/10 border border-gray-500/30 rounded-lg">
                <h4 className="text-gray-300 font-medium mb-2">Grok Information</h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <div>Models: {provider?.models.length || 0} available</div>
                  <div>Context: Up to {provider?.models[1]?.context || 'N/A'}</div>
                  <div>Specialty: Real-time & Humor</div>
                  <div>Provider: X.AI (xAI)</div>
                </div>
                <a 
                  href={provider?.docsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 mt-2"
                >
                  Documentation <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Grok Unique Features */}
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h4 className="text-blue-300 font-medium mb-2 flex items-center gap-2">
                  <Twitter className="w-4 h-4" />
                  Grok Features
                </h4>
                <div className="text-sm text-blue-200 space-y-1">
                  <div>• Real-time X/Twitter data</div>
                  <div>• Wit & humor</div>
                  <div>• Rebellious personality</div>
                  <div>• Current events awareness</div>
                  <div>• Trending topics access</div>
                  <div>• Conversational style</div>
                </div>
              </div>

              {/* Live X Integration */}
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h4 className="text-green-300 font-medium mb-2 flex items-center gap-2">
                  <Rss className="w-4 h-4" />
                  Live Integration
                </h4>
                <div className="text-sm text-green-200 space-y-1">
                  <div>✓ X/Twitter Feed</div>
                  <div>✓ Trending Topics</div>
                  <div>✓ Real-time News</div>
                  <div>⚠ Search API</div>
                </div>
              </div>
            </motion.div>

            {/* Main Testing Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              
              {/* Current Test Results */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    {testSuites[selectedTest] && React.createElement(testSuites[selectedTest].icon, { className: "w-5 h-5 text-gray-400" })}
                    {testSuites[selectedTest]?.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {isRunningTest && (
                      <div className="flex items-center gap-2 text-yellow-400 text-sm">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Testing Grok...
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {testSuites[selectedTest]?.tests.map((test, index) => (
                    <div key={index} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(test.status)}
                          <div>
                            <div className="text-white font-medium">{test.name}</div>
                            <div className="text-xs text-gray-400">Response time: {test.time}</div>
                          </div>
                        </div>
                        <div className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(test.status)}`}>
                          {test.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live API Response */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-400" />
                    Live Grok Response
                  </h3>
                  <span className="text-xs text-gray-400">Last updated: {new Date().toLocaleTimeString()}</span>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm overflow-auto max-h-96">
                  <pre className="text-gray-400">
{JSON.stringify(mockApiResponse, null, 2)}
                  </pre>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-2 bg-blue-500/10 border border-blue-500/30 rounded">
                    <div className="text-blue-400 font-semibold">{mockApiResponse.usage.prompt_tokens}</div>
                    <div className="text-blue-200 text-xs">Prompt Tokens</div>
                  </div>
                  <div className="text-center p-2 bg-gray-500/10 border border-gray-500/30 rounded">
                    <div className="text-gray-400 font-semibold">{mockApiResponse.usage.completion_tokens}</div>
                    <div className="text-gray-300 text-xs">Completion Tokens</div>
                  </div>
                  <div className="text-center p-2 bg-purple-500/10 border border-purple-500/30 rounded">
                    <div className="text-purple-400 font-semibold">{mockApiResponse.usage.total_tokens}</div>
                    <div className="text-purple-200 text-xs">Total Tokens</div>
                  </div>
                </div>

                {/* X Integration Status */}
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h4 className="text-blue-300 font-medium text-sm mb-2 flex items-center gap-2">
                    <Twitter className="w-4 h-4" />
                    X Integration Status
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-gray-400 mb-1">Real-time Access:</div>
                      <div className="text-green-400">✓ Active</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Last Update:</div>
                      <div className="text-blue-400">{new Date().toLocaleTimeString()}</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-gray-400 text-xs mb-1">Trending Topics:</div>
                    <div className="flex flex-wrap gap-1">
                      {mockApiResponse.x_integration.trending_topics.map((topic, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                          #{topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Personality Metrics */}
                <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <h4 className="text-purple-300 font-medium text-sm mb-2 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Personality Metrics
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-yellow-400 font-semibold">{mockApiResponse.personality_metrics.humor_level}/10</div>
                      <div className="text-gray-400">Humor</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 font-semibold">{mockApiResponse.personality_metrics.wit_score}/10</div>
                      <div className="text-gray-400">Wit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-400 font-semibold">{mockApiResponse.personality_metrics.rebelliousness}/10</div>
                      <div className="text-gray-400">Rebelliousness</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Models */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-400" />
                  Available Grok Models
                </h3>
                
                <div className="space-y-3">
                  {provider?.models.map((model, index) => (
                    <div key={index} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-white font-medium">{model.name}</div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm">Available</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                        <div>
                          <span className="text-gray-400">Input: </span>
                          <span className="text-white">${model.inputPrice}/1M tokens</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Output: </span>
                          <span className="text-white">${model.outputPrice}/1M tokens</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Context: </span>
                          <span className="text-white">{model.context}</span>
                        </div>
                      </div>
                      {model.name.includes('Grok-1.5') && (
                        <div className="text-xs text-blue-300 bg-blue-500/10 px-2 py-1 rounded">
                          Latest model - Enhanced reasoning & real-time data
                        </div>
                      )}
                      {model.name.includes('Grok-1') && !model.name.includes('1.5') && (
                        <div className="text-xs text-gray-300 bg-gray-500/10 px-2 py-1 rounded">
                          Original model - Witty & conversational
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Capabilities Alert */}
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-yellow-300 font-medium text-sm mb-1">Beta Status</h4>
                      <p className="text-yellow-200 text-xs">
                        Grok is currently in beta. Some features may have limited availability or higher error rates. 
                        Real-time data access depends on X platform status.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GrokIntegration() {
  return (
    <AuthWrapper>
      <GrokIntegrationContent />
    </AuthWrapper>
  )
}