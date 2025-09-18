'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Session } from 'next-auth'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Zap,
  Brain,
  Target,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Gauge,
  Shield,
  Award,
  Activity,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Play,
  Pause,
  Sliders,
  Cpu,
  Database,
  Server,
  Globe,
  Building2,
  Users,
  ExternalLink,
  ChevronRight,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Filter,
  Calendar,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { getAIProviderLogo } from '@/components/ui/ai-logos'

interface ModelOptimizationClientProps {
  initialSession?: Session | null
}

interface AIModel {
  id: string
  name: string
  provider: string
  type: 'text' | 'chat' | 'completion' | 'embedding'
  costPer1kTokens: number
  performance: number
  reliability: number
  speed: number
  quality: number
  maxTokens: number
  capabilities: string[]
  recommendation: 'optimal' | 'good' | 'consider' | 'avoid'
  savings: number
  currentUsage: number
  trend: 'up' | 'down' | 'stable'
}

interface OptimizationStrategy {
  id: string
  name: string
  description: string
  impact: 'high' | 'medium' | 'low'
  difficulty: 'easy' | 'medium' | 'hard'
  category: 'cost' | 'performance' | 'quality' | 'efficiency'
  savingsPotential: number
  performanceImpact: number
  implemented: boolean
  confidence: number
}

interface PerformanceMetrics {
  averageLatency: number
  tokenThroughput: number
  errorRate: number
  costEfficiency: number
  qualityScore: number
  uptime: number
}

export default function ModelOptimizationClient({ initialSession }: ModelOptimizationClientProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const activeSession = session || initialSession

  const [selectedView, setSelectedView] = useState('models')
  const [selectedProvider, setSelectedProvider] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [autoOptimize, setAutoOptimize] = useState(false)
  const [optimizationData, setOptimizationData] = useState<any>(null)
  const [models, setModels] = useState<AIModel[]>([])
  const [strategies, setStrategies] = useState<OptimizationStrategy[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)

  useEffect(() => {
    fetchOptimizationData()
  }, [selectedProvider, selectedCategory])

  const fetchOptimizationData = async () => {
    try {
      setIsLoading(true)

      // Generate comprehensive model optimization data based on real AI models
      const mockModels: AIModel[] = [
        {
          id: 'gpt-4',
          name: 'GPT-4',
          provider: 'openai',
          type: 'chat',
          costPer1kTokens: 0.03,
          performance: 95,
          reliability: 99,
          speed: 75,
          quality: 98,
          maxTokens: 8192,
          capabilities: ['reasoning', 'coding', 'analysis', 'creative-writing'],
          recommendation: 'optimal',
          savings: 0,
          currentUsage: 45,
          trend: 'up'
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          provider: 'openai',
          type: 'chat',
          costPer1kTokens: 0.001,
          performance: 85,
          reliability: 97,
          speed: 95,
          quality: 82,
          maxTokens: 4096,
          capabilities: ['conversation', 'basic-coding', 'summaries'],
          recommendation: 'good',
          savings: 85,
          currentUsage: 25,
          trend: 'stable'
        },
        {
          id: 'claude-3-opus',
          name: 'Claude-3 Opus',
          provider: 'anthropic',
          type: 'chat',
          costPer1kTokens: 0.015,
          performance: 96,
          reliability: 98,
          speed: 80,
          quality: 97,
          maxTokens: 200000,
          capabilities: ['reasoning', 'analysis', 'long-context', 'coding'],
          recommendation: 'optimal',
          savings: 12,
          currentUsage: 20,
          trend: 'up'
        },
        {
          id: 'gemini-pro',
          name: 'Gemini Pro',
          provider: 'google',
          type: 'chat',
          costPer1kTokens: 0.0005,
          performance: 88,
          reliability: 94,
          speed: 92,
          quality: 85,
          maxTokens: 32768,
          capabilities: ['multimodal', 'reasoning', 'coding'],
          recommendation: 'good',
          savings: 92,
          currentUsage: 10,
          trend: 'up'
        }
      ]

      const mockStrategies: OptimizationStrategy[] = [
        {
          id: '1',
          name: 'Smart Model Routing',
          description: 'Route simple queries to cost-effective models and complex tasks to premium models',
          impact: 'high',
          difficulty: 'medium',
          category: 'cost',
          savingsPotential: 40,
          performanceImpact: 5,
          implemented: false,
          confidence: 92
        },
        {
          id: '2',
          name: 'Request Batching',
          description: 'Batch similar requests to reduce API overhead and improve throughput',
          impact: 'medium',
          difficulty: 'easy',
          category: 'efficiency',
          savingsPotential: 25,
          performanceImpact: 15,
          implemented: false,
          confidence: 88
        },
        {
          id: '3',
          name: 'Token Optimization',
          description: 'Optimize prompts and responses to reduce token usage without quality loss',
          impact: 'high',
          difficulty: 'medium',
          category: 'cost',
          savingsPotential: 35,
          performanceImpact: 2,
          implemented: false,
          confidence: 85
        },
        {
          id: '4',
          name: 'Caching Layer',
          description: 'Implement intelligent caching for frequently requested content',
          impact: 'high',
          difficulty: 'hard',
          category: 'performance',
          savingsPotential: 60,
          performanceImpact: 40,
          implemented: false,
          confidence: 95
        },
        {
          id: '5',
          name: 'Model Fallbacks',
          description: 'Configure automatic fallbacks to alternative models during outages',
          impact: 'medium',
          difficulty: 'medium',
          category: 'quality',
          savingsPotential: 10,
          performanceImpact: 20,
          implemented: true,
          confidence: 90
        }
      ]

      const mockPerformanceMetrics: PerformanceMetrics = {
        averageLatency: 850,
        tokenThroughput: 12500,
        errorRate: 0.8,
        costEfficiency: 78,
        qualityScore: 92,
        uptime: 99.7
      }

      setModels(mockModels)
      setStrategies(mockStrategies)
      setPerformanceMetrics(mockPerformanceMetrics)

    } catch (error) {
      console.error('Failed to fetch optimization data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOptimize = async (strategyId: string) => {
    setIsOptimizing(true)
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 2000))

    setStrategies(prev => prev.map(strategy =>
      strategy.id === strategyId
        ? { ...strategy, implemented: true }
        : strategy
    ))

    setIsOptimizing(false)
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
    return `$${value.toFixed(3)}`
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'optimal': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'good': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'consider': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default: return 'text-red-400 bg-red-500/20 border-red-500/30'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default: return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default: return 'text-red-400 bg-red-500/20 border-red-500/30'
    }
  }

  if (status === 'loading' && !initialSession) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!activeSession) {
    return null
  }

  const filteredModels = models.filter(model => {
    if (selectedProvider !== 'all' && model.provider !== selectedProvider) return false
    return true
  })

  const filteredStrategies = strategies.filter(strategy => {
    if (selectedCategory !== 'all' && strategy.category !== selectedCategory) return false
    return true
  })

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-indigo-900/20" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Zap className="w-6 h-6 text-purple-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Model Optimization</h1>
                    <Badge className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 font-medium border border-purple-500/30">
                      AI-Powered Optimization
                    </Badge>
                  </div>
                  <p className="text-gray-400">
                    Intelligent AI model selection and performance optimization for cost-effective operations
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 backdrop-blur-xl rounded-lg border border-gray-700">
                    <div className={cn("w-2 h-2 rounded-full", autoOptimize ? "bg-purple-400 animate-pulse" : "bg-gray-400")}></div>
                    <span className="text-sm text-gray-300">
                      {autoOptimize ? 'Auto-optimize' : 'Manual'}
                    </span>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAutoOptimize(!autoOptimize)}
                        className={cn(
                          "border-gray-700 hover:bg-gray-800/50",
                          autoOptimize ? "text-purple-300 hover:text-purple-200" : "text-gray-300 hover:text-white"
                        )}
                      >
                        {autoOptimize ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        {autoOptimize ? 'Pause' : 'Auto-optimize'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {autoOptimize ? 'Pause automatic optimization' : 'Enable continuous optimization'}
                    </TooltipContent>
                  </Tooltip>

                  <Button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Report
                  </Button>
                </div>
              </div>

              {/* Cross-Feature Navigation */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <button
                  onClick={() => router.push('/executive')}
                  className="group p-4 bg-gray-900/50 backdrop-blur-xl rounded-lg border border-gray-700 hover:border-indigo-500/50 transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5 text-indigo-400" />
                    <span className="text-indigo-300 font-medium">Executive Center</span>
                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <p className="text-gray-400 text-sm">Strategic intelligence dashboard</p>
                </button>

                <button
                  onClick={() => router.push('/analytics')}
                  className="group p-4 bg-gray-900/50 backdrop-blur-xl rounded-lg border border-gray-700 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Brain className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-300 font-medium">Predictive Analytics</span>
                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <p className="text-gray-400 text-sm">AI-powered forecasting</p>
                </button>

                <button
                  onClick={() => router.push('/monitoring/dashboard')}
                  className="group p-4 bg-gray-900/50 backdrop-blur-xl rounded-lg border border-gray-700 hover:border-green-500/50 transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    <span className="text-green-300 font-medium">Advanced Monitoring</span>
                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-green-400 transition-colors" />
                  </div>
                  <p className="text-gray-400 text-sm">Real-time performance metrics</p>
                </button>

                <button
                  onClick={() => router.push('/usage')}
                  className="group p-4 bg-gray-900/50 backdrop-blur-xl rounded-lg border border-gray-700 hover:border-yellow-500/50 transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-300 font-medium">Usage Analytics</span>
                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-yellow-400 transition-colors" />
                  </div>
                  <p className="text-gray-400 text-sm">Detailed consumption analysis</p>
                </button>
              </div>

              {/* View Controls */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-1 bg-gray-800/30 backdrop-blur-xl rounded-lg p-1 border border-gray-700">
                  {['models', 'strategies', 'performance', 'recommendations'].map((view) => (
                    <button
                      key={view}
                      onClick={() => setSelectedView(view)}
                      className={`px-4 py-2 rounded-md font-medium transition-all capitalize ${
                        selectedView === view
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      {view}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger className="w-40 bg-gray-800/50 border-gray-700 text-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Providers</SelectItem>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40 bg-gray-800/50 border-gray-700 text-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="cost">Cost</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="quality">Quality</SelectItem>
                      <SelectItem value="efficiency">Efficiency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>

            {/* Loading State */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-20"
              >
                <div className="text-center">
                  <Zap className="w-12 h-12 text-gray-400 animate-pulse mx-auto mb-4" />
                  <p className="text-gray-400">Analyzing optimization opportunities...</p>
                </div>
              </motion.div>
            )}

            {/* Models Tab */}
            {!isLoading && selectedView === 'models' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                {/* Model Comparison Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredModels.map((model) => (
                    <Card key={model.id} className="bg-gray-900/50 backdrop-blur-xl border border-gray-700 hover:border-purple-500/50 transition-all">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getAIProviderLogo(model.provider, 'w-8 h-8')}
                            <div>
                              <CardTitle className="text-white">{model.name}</CardTitle>
                              <p className="text-gray-400 text-sm">{model.type} model</p>
                            </div>
                          </div>
                          <Badge className={`px-2 py-1 text-xs font-medium ${getRecommendationColor(model.recommendation)}`}>
                            {model.recommendation}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Cost per 1K tokens</div>
                            <div className="text-lg font-bold text-white">{formatCurrency(model.costPer1kTokens)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Current usage</div>
                            <div className="text-lg font-bold text-white">{model.currentUsage}%</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Performance</span>
                            <span className="text-white">{model.performance}%</span>
                          </div>
                          <Progress value={model.performance} className="h-2 bg-gray-700" />

                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Quality</span>
                            <span className="text-white">{model.quality}%</span>
                          </div>
                          <Progress value={model.quality} className="h-2 bg-gray-700" />

                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Speed</span>
                            <span className="text-white">{model.speed}%</span>
                          </div>
                          <Progress value={model.speed} className="h-2 bg-gray-700" />
                        </div>

                        <div className="pt-3 border-t border-gray-700">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <span className="text-gray-400">Savings potential:</span>
                              <span className="text-green-400 font-medium ml-2">{model.savings}%</span>
                            </div>
                            <div className={`flex items-center gap-1 text-sm ${
                              model.trend === 'up' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {model.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {model.trend}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                            Optimize
                          </Button>
                          <Button size="sm" variant="outline" className="border-gray-700 text-gray-300">
                            Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Strategies Tab */}
            {!isLoading && selectedView === 'strategies' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6">
                  {filteredStrategies.map((strategy) => (
                    <Card key={strategy.id} className="bg-gray-900/50 backdrop-blur-xl border border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-white font-semibold">{strategy.name}</h3>
                              <Badge className={`px-2 py-1 text-xs font-medium ${getImpactColor(strategy.impact)}`}>
                                {strategy.impact} impact
                              </Badge>
                              <Badge className={`px-2 py-1 text-xs font-medium ${getDifficultyColor(strategy.difficulty)}`}>
                                {strategy.difficulty}
                              </Badge>
                              {strategy.implemented && (
                                <Badge className="px-2 py-1 bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                  Implemented
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-300 text-sm mb-4">{strategy.description}</p>
                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 font-medium">
                                  {strategy.savingsPotential}% savings
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-400" />
                                <span className="text-blue-400 font-medium">
                                  +{strategy.performanceImpact}% performance
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-purple-400" />
                                <span className="text-purple-400 font-medium">
                                  {strategy.confidence}% confidence
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right ml-4">
                            {strategy.implemented ? (
                              <Button size="sm" variant="outline" className="border-green-500 text-green-400" disabled>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Active
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleOptimize(strategy.id)}
                                disabled={isOptimizing}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                {isOptimizing ? (
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Zap className="w-4 h-4 mr-2" />
                                )}
                                Implement
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="p-3 bg-gray-800/30 rounded-lg">
                          <span className="text-gray-400 text-xs uppercase tracking-wide">Category</span>
                          <p className="text-gray-300 text-sm capitalize">{strategy.category}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Performance Tab */}
            {!isLoading && selectedView === 'performance' && performanceMetrics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-sm border border-blue-500/30">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <Clock className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-white">{performanceMetrics.averageLatency}ms</div>
                        <div className="text-blue-300 text-sm">Average Latency</div>
                        <div className="text-xs text-blue-200 mt-1">Target: &lt;1000ms</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-900/30 to-green-800/30 backdrop-blur-sm border border-green-500/30">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <Gauge className="w-8 h-8 text-green-400 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-white">{performanceMetrics.tokenThroughput.toLocaleString()}</div>
                        <div className="text-green-300 text-sm">Tokens/hour</div>
                        <div className="text-xs text-green-200 mt-1">Throughput rate</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 backdrop-blur-sm border border-purple-500/30">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <Target className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-white">{performanceMetrics.errorRate}%</div>
                        <div className="text-purple-300 text-sm">Error Rate</div>
                        <div className="text-xs text-purple-200 mt-1">Target: &lt;1%</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 backdrop-blur-sm border border-yellow-500/30">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <DollarSign className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-white">{performanceMetrics.costEfficiency}%</div>
                        <div className="text-yellow-300 text-sm">Cost Efficiency</div>
                        <div className="text-xs text-yellow-200 mt-1">Industry benchmark</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-indigo-900/30 to-indigo-800/30 backdrop-blur-sm border border-indigo-500/30">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <Star className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-white">{performanceMetrics.qualityScore}%</div>
                        <div className="text-indigo-300 text-sm">Quality Score</div>
                        <div className="text-xs text-indigo-200 mt-1">Output quality rating</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-teal-900/30 to-teal-800/30 backdrop-blur-sm border border-teal-500/30">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <Shield className="w-8 h-8 text-teal-400 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-white">{performanceMetrics.uptime}%</div>
                        <div className="text-teal-300 text-sm">Uptime</div>
                        <div className="text-xs text-teal-200 mt-1">Last 30 days</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gray-900/50 backdrop-blur-xl border border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-400" />
                      Performance Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-800/30 rounded-lg border border-gray-700 flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg font-medium">Performance Visualization</p>
                        <p className="text-gray-500 text-sm">Advanced charts would be integrated here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Recommendations Tab */}
            {!isLoading && selectedView === 'recommendations' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-purple-900/20 to-indigo-800/20 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Lightbulb className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">AI-Powered Optimization Recommendations</h3>
                    <Badge className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium">
                      {strategies.filter(s => !s.implemented).length} Available
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-gray-800/30 backdrop-blur-sm border border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white text-sm">Immediate Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {strategies.filter(s => s.difficulty === 'easy' && !s.implemented).map((strategy) => (
                          <div key={strategy.id} className="p-3 bg-gray-700/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium text-sm">{strategy.name}</span>
                              <Badge className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs">
                                Quick win
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-xs mb-2">{strategy.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-green-400 text-xs font-medium">
                                {strategy.savingsPotential}% savings
                              </span>
                              <Button size="sm" className="h-6 px-2 bg-purple-600 hover:bg-purple-700 text-xs">
                                Apply
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/30 backdrop-blur-sm border border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white text-sm">Strategic Improvements</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {strategies.filter(s => s.impact === 'high' && !s.implemented).map((strategy) => (
                          <div key={strategy.id} className="p-3 bg-gray-700/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium text-sm">{strategy.name}</span>
                              <Badge className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs">
                                High impact
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-xs mb-2">{strategy.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-green-400 text-xs font-medium">
                                {strategy.savingsPotential}% savings
                              </span>
                              <Button size="sm" className="h-6 px-2 bg-purple-600 hover:bg-purple-700 text-xs">
                                Plan
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-300 font-medium text-sm">Optimization Summary</span>
                    </div>
                    <p className="text-purple-200 text-xs">
                      Implementing all available optimizations could reduce costs by up to{' '}
                      <span className="font-bold">
                        {strategies.filter(s => !s.implemented).reduce((sum, s) => sum + s.savingsPotential, 0) / strategies.filter(s => !s.implemented).length}%
                      </span>{' '}
                      while improving performance by{' '}
                      <span className="font-bold">
                        {strategies.filter(s => !s.implemented).reduce((sum, s) => sum + s.performanceImpact, 0) / strategies.filter(s => !s.implemented).length}%
                      </span>.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Center */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Optimization Action Center</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => router.push('/executive')}
                  className="group p-4 bg-gradient-to-br from-indigo-900/30 to-indigo-800/30 rounded-lg border border-indigo-500/30 hover:border-indigo-400/50 transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5 text-indigo-400" />
                    <span className="text-indigo-300 font-medium">Executive Dashboard</span>
                  </div>
                  <p className="text-indigo-200 text-sm">Strategic optimization overview</p>
                </button>

                <button
                  onClick={() => router.push('/analytics')}
                  className="group p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-lg border border-blue-500/30 hover:border-blue-400/50 transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Brain className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-300 font-medium">Predictive Analytics</span>
                  </div>
                  <p className="text-blue-200 text-sm">Cost prediction & trends</p>
                </button>

                <button
                  onClick={() => router.push('/monitoring/dashboard')}
                  className="group p-4 bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg border border-green-500/30 hover:border-green-400/50 transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    <span className="text-green-300 font-medium">Live Monitoring</span>
                  </div>
                  <p className="text-green-200 text-sm">Real-time performance tracking</p>
                </button>

                <button
                  onClick={() => router.push('/settings/api-keys')}
                  className="group p-4 bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-lg border border-yellow-500/30 hover:border-yellow-400/50 transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Settings className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-300 font-medium">Configuration</span>
                  </div>
                  <p className="text-yellow-200 text-sm">Manage API keys & settings</p>
                </button>
              </div>
            </motion.div>

            {/* Cross-Feature Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl p-6 border border-indigo-500/20 backdrop-blur-sm"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                Enterprise Center
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/executive" className="group">
                  <div className="p-4 bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-lg border border-amber-500/30 hover:border-amber-400/50 transition-all group-hover:scale-105">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-5 h-5 text-amber-400" />
                      <span className="text-amber-300 font-medium">Executive Center</span>
                    </div>
                    <p className="text-amber-200 text-sm">Strategic AI insights & KPIs</p>
                  </div>
                </Link>

                <Link href="/analytics" className="group">
                  <div className="p-4 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-lg border border-blue-500/30 hover:border-blue-400/50 transition-all group-hover:scale-105">
                    <div className="flex items-center gap-3 mb-2">
                      <Brain className="w-5 h-5 text-blue-400" />
                      <span className="text-blue-300 font-medium">Predictive Analytics</span>
                    </div>
                    <p className="text-blue-200 text-sm">AI-powered forecasting & trends</p>
                  </div>
                </Link>

                <Link href="/monitoring/dashboard" className="group">
                  <div className="p-4 bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-lg border border-green-500/30 hover:border-green-400/50 transition-all group-hover:scale-105">
                    <div className="flex items-center gap-3 mb-2">
                      <Activity className="w-5 h-5 text-green-400" />
                      <span className="text-green-300 font-medium">Advanced Monitoring</span>
                    </div>
                    <p className="text-green-200 text-sm">Real-time AI usage tracking</p>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}