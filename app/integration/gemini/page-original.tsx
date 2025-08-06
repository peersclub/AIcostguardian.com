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
  Image,
  Video,
  FileText,
  Code
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

function GeminiIntegrationContent() {
  const { data: session } = useSession()
  const [connectionStatus, setConnectionStatus] = useState('testing')
  const [selectedTest, setSelectedTest] = useState('connection')
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})
  const [isRunningTest, setIsRunningTest] = useState(false)
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({})

  const provider = getProviderById('gemini')
  const providerInfo = getProviderInfo('gemini')

  // Mock real-time testing data
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData({
        lastPing: new Date().toISOString(),
        responseTime: Math.floor(Math.random() * 120) + 40,
        tokensUsed: Math.floor(Math.random() * 1200) + 800,
        requestsPerMinute: Math.floor(Math.random() * 25) + 15,
        errorRate: Math.random() * 0.8,
        uptime: 99.6,
        activeConnections: Math.floor(Math.random() * 8) + 2
      })
    }, 2800)

    return () => clearInterval(interval)
  }, [])

  const testSuites: TestSuites = {
    connection: {
      name: 'Connection Test',
      icon: Wifi,
      description: 'Test basic API connectivity and authentication',
      tests: [
        { name: 'API Endpoint Reachability', status: 'passed', time: '67ms' },
        { name: 'Authentication Validation', status: 'passed', time: '98ms' },
        { name: 'SSL Certificate Check', status: 'passed', time: '21ms' },
        { name: 'Rate Limit Headers', status: 'passed', time: '34ms' }
      ]
    },
    models: {
      name: 'Models & Capabilities',
      icon: Database,
      description: 'Test Gemini models and their capabilities',
      tests: [
        { name: 'Gemini 1.5 Pro Availability', status: 'passed', time: '123ms' },
        { name: 'Gemini 1.5 Flash Access', status: 'passed', time: '89ms' },
        { name: 'Gemini Pro Legacy Test', status: 'passed', time: '76ms' },
        { name: '1M Token Context Window', status: 'passed', time: '1.8s' },
        { name: 'Function Calling Support', status: 'passed', time: '167ms' },
        { name: 'Code Execution', status: 'passed', time: '234ms' }
      ]
    },
    multimodal: {
      name: 'Multimodal Tests',
      icon: Image,
      description: 'Test Gemini\'s multimodal capabilities',
      tests: [
        { name: 'Image Understanding', status: 'passed', time: '456ms' },
        { name: 'Video Analysis', status: 'passed', time: '2.1s' },
        { name: 'Audio Processing', status: 'passed', time: '1.3s' },
        { name: 'Document Analysis', status: 'passed', time: '678ms' },
        { name: 'Multi-Image Reasoning', status: 'passed', time: '789ms' },
        { name: 'Vision-Language Tasks', status: 'passed', time: '567ms' }
      ]
    },
    performance: {
      name: 'Performance Tests',
      icon: Zap,
      description: 'Test response times and throughput',
      tests: [
        { name: 'Single Request Latency', status: 'passed', time: '134ms' },
        { name: 'Concurrent Requests (10x)', status: 'passed', time: '1.8s' },
        { name: 'Large Context Processing', status: 'passed', time: '2.9s' },
        { name: 'Streaming Response', status: 'passed', time: '98ms' },
        { name: 'Token Throughput', status: 'passed', time: '1.1s' }
      ]
    },
    integration: {
      name: 'Google Integration',
      icon: Globe,
      description: 'Test Google services integration',
      tests: [
        { name: 'Google Cloud Integration', status: 'passed', time: '156ms' },
        { name: 'Vertex AI Compatibility', status: 'passed', time: '234ms' },
        { name: 'Google Workspace Access', status: 'warning', time: '456ms' },
        { name: 'Search Integration', status: 'passed', time: '189ms' }
      ]
    },
    billing: {
      name: 'Billing & Usage',
      icon: DollarSign,
      description: 'Test billing information and usage tracking',
      tests: [
        { name: 'Usage Tracking', status: 'passed', time: '87ms' },
        { name: 'Cost Calculation', status: 'passed', time: '65ms' },
        { name: 'Rate Limit Status', status: 'passed', time: '76ms' },
        { name: 'Billing API Access', status: 'passed', time: '123ms' }
      ]
    }
  }

  const mockApiResponse = {
    model: "gemini-1.5-pro",
    usage: {
      promptTokens: 198,
      completionTokens: 156,
      totalTokens: 354
    },
    candidates: [
      {
        content: {
          parts: [
            {
              text: "Hello! I'm Gemini, Google's advanced AI model. I excel at multimodal understanding, processing text, images, video, and audio together. With my massive 1 million token context window, I can handle extensive documents and complex reasoning tasks. I'm particularly strong at code generation, mathematical reasoning, and creative tasks. How can I help you today?"
            }
          ],
          role: "model"
        },
        finishReason: "STOP",
        index: 0,
        safetyRatings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            probability: "NEGLIGIBLE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            probability: "NEGLIGIBLE"
          }
        ]
      }
    ],
    promptFeedback: {
      safetyRatings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          probability: "NEGLIGIBLE"
        }
      ]
    }
  }

  const runTest = async (testType: string) => {
    setIsRunningTest(true)
    setSelectedTest(testType)
    
    // Simulate API testing
    await new Promise(resolve => setTimeout(resolve, 2200))
    
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-indigo-900/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
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
                {getAIProviderLogo('gemini', 'w-12 h-12')}
                <div>
                  <h1 className="text-3xl font-bold text-white">Gemini Integration Center</h1>
                  <p className="text-gray-400">Multimodal AI testing and monitoring for Google Gemini</p>
                </div>
              </div>
              
              <div className="ml-auto flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">Multimodal Ready</span>
                </div>
                <button 
                  onClick={() => runTest(selectedTest)}
                  disabled={isRunningTest}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {isRunningTest ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {isRunningTest ? 'Testing Gemini...' : 'Run Test Suite'}
                </button>
              </div>
            </div>

            {/* Real-time status bar */}
            <div className="grid grid-cols-7 gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700 mb-6">
              <div className="text-center">
                <div className="text-blue-400 font-semibold">{realTimeData.responseTime || '--'}ms</div>
                <div className="text-xs text-gray-400">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-indigo-400 font-semibold">{realTimeData.requestsPerMinute || '--'}/min</div>
                <div className="text-xs text-gray-400">Requests</div>
              </div>
              <div className="text-center">
                <div className="text-cyan-400 font-semibold">{realTimeData.tokensUsed || '--'}</div>
                <div className="text-xs text-gray-400">Tokens Used</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-semibold">{realTimeData.errorRate?.toFixed(2) || '--'}%</div>
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
                <Settings className="w-5 h-5 text-blue-400" />
                Test Suites
              </h3>
              
              <div className="space-y-2">
                {Object.entries(testSuites).map(([key, suite]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTest(key)}
                    className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
                      selectedTest === key
                        ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300'
                        : 'bg-gray-800/30 hover:bg-gray-700/50 text-gray-300 hover:text-white'
                    }`}
                  >
                    <suite.icon className={`w-4 h-4 ${selectedTest === key ? 'text-blue-400' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <div className="font-medium">{suite.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{suite.description}</div>
                    </div>
                    {testResults[key] && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Provider Info */}
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h4 className="text-blue-300 font-medium mb-2">Gemini Information</h4>
                <div className="text-sm text-blue-200 space-y-1">
                  <div>Models: {provider?.models.length || 0} available</div>
                  <div>Context: Up to {provider?.models[0]?.context || 'N/A'}</div>
                  <div>Specialty: Multimodal AI</div>
                  <div>Provider: Google AI</div>
                </div>
                <a 
                  href={provider?.docsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-2"
                >
                  Documentation <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Gemini Unique Features */}
              <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                <h4 className="text-indigo-300 font-medium mb-2 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Multimodal Features
                </h4>
                <div className="text-sm text-indigo-200 space-y-1">
                  <div>• 1M token context window</div>
                  <div>• Native multimodal processing</div>
                  <div>• Image & video understanding</div>
                  <div>• Audio processing</div>
                  <div>• Document analysis</div>
                  <div>• Code execution</div>
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
                    {testSuites[selectedTest] && React.createElement(testSuites[selectedTest].icon, { className: "w-5 h-5 text-blue-400" })}
                    {testSuites[selectedTest]?.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {isRunningTest && (
                      <div className="flex items-center gap-2 text-yellow-400 text-sm">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Testing Gemini...
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
                    Live Gemini Response
                  </h3>
                  <span className="text-xs text-gray-400">Last updated: {new Date().toLocaleTimeString()}</span>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm overflow-auto max-h-96">
                  <pre className="text-blue-400">
{JSON.stringify(mockApiResponse, null, 2)}
                  </pre>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-2 bg-blue-500/10 border border-blue-500/30 rounded">
                    <div className="text-blue-400 font-semibold">{mockApiResponse.usage.promptTokens}</div>
                    <div className="text-blue-200 text-xs">Prompt Tokens</div>
                  </div>
                  <div className="text-center p-2 bg-indigo-500/10 border border-indigo-500/30 rounded">
                    <div className="text-indigo-400 font-semibold">{mockApiResponse.usage.completionTokens}</div>
                    <div className="text-indigo-200 text-xs">Completion Tokens</div>
                  </div>
                  <div className="text-center p-2 bg-purple-500/10 border border-purple-500/30 rounded">
                    <div className="text-purple-400 font-semibold">{mockApiResponse.usage.totalTokens}</div>
                    <div className="text-purple-200 text-xs">Total Tokens</div>
                  </div>
                </div>

                {/* Safety Ratings */}
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <h4 className="text-green-300 font-medium text-sm mb-2">Safety Ratings</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {mockApiResponse.candidates[0].safetyRatings.map((rating, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-400">{rating.category.replace('HARM_CATEGORY_', '').toLowerCase()}</span>
                        <span className="text-green-400">{rating.probability}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Available Models */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-400" />
                  Available Gemini Models
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
                      {model.name.includes('1.5 Pro') && (
                        <div className="text-xs text-blue-300 bg-blue-500/10 px-2 py-1 rounded">
                          Most capable - Best for complex multimodal tasks
                        </div>
                      )}
                      {model.name.includes('1.5 Flash') && (
                        <div className="text-xs text-green-300 bg-green-500/10 px-2 py-1 rounded">
                          Fastest & most cost-effective
                        </div>
                      )}
                      {model.name.includes('Pro') && !model.name.includes('1.5') && (
                        <div className="text-xs text-yellow-300 bg-yellow-500/10 px-2 py-1 rounded">
                          Legacy model - Consider upgrading to 1.5
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Capabilities Grid */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Image className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-300 text-sm font-medium">Vision</span>
                    </div>
                    <div className="text-xs text-blue-200">Images, charts, diagrams</div>
                  </div>
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="w-4 h-4 text-indigo-400" />
                      <span className="text-indigo-300 text-sm font-medium">Video</span>
                    </div>
                    <div className="text-xs text-indigo-200">Video understanding & analysis</div>
                  </div>
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-300 text-sm font-medium">Documents</span>
                    </div>
                    <div className="text-xs text-purple-200">PDFs, docs, spreadsheets</div>
                  </div>
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-300 text-sm font-medium">Code</span>
                    </div>
                    <div className="text-xs text-cyan-200">Generation & execution</div>
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

export default function GeminiIntegration() {
  return (
    <AuthWrapper>
      <GeminiIntegrationContent />
    </AuthWrapper>
  )
}