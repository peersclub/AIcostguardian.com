'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Cpu, Zap, DollarSign, Brain, Sparkles, Code,
  TrendingUp, Clock, BarChart3, Shield, Globe,
  ChevronDown, Check, AlertCircle, Info, Star,
  Lock, Unlock, Crown, Gauge, Database, Activity,
  ArrowUpRight, ArrowDownRight, Loader2, Filter,
  Search, Settings, RefreshCw, ExternalLink, Hash
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ModelOption {
  id: string
  name: string
  provider: string
  category: 'fast' | 'balanced' | 'powerful' | 'specialized'
  contextWindow: number
  inputCost: number
  outputCost: number
  speed: 'fast' | 'medium' | 'slow'
  capabilities: string[]
  icon: string
  description: string
  strengths: string[]
  weaknesses: string[]
  bestFor: string[]
  performance: {
    speed: number // 1-5
    quality: number // 1-5
    cost: number // 1-5 (5 = cheapest)
    reliability: number // 1-5
  }
  usage?: {
    requests: number
    tokens: number
    cost: number
    avgLatency: number
    successRate: number
  }
  limits?: {
    rateLimit: number
    dailyLimit: number
    available: boolean
    reason?: string
  }
}

const MODELS: ModelOption[] = [
  // Fast Models
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    category: 'fast',
    contextWindow: 16384,
    inputCost: 0.0005,
    outputCost: 0.0015,
    speed: 'fast',
    capabilities: ['chat', 'function-calling'],
    icon: '⚡',
    description: 'Fastest and most cost-effective for simple tasks',
    strengths: ['Speed', 'Cost', 'Availability'],
    weaknesses: ['Complex reasoning', 'Long context'],
    bestFor: ['Quick responses', 'Simple queries', 'High volume'],
    performance: { speed: 5, quality: 3, cost: 5, reliability: 5 }
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    category: 'fast',
    contextWindow: 200000,
    inputCost: 0.00025,
    outputCost: 0.00125,
    speed: 'fast',
    capabilities: ['chat', 'vision'],
    icon: '🎯',
    description: 'Ultra-fast with excellent context handling',
    strengths: ['Speed', 'Context window', 'Cost'],
    weaknesses: ['Creative tasks', 'Complex analysis'],
    bestFor: ['Document processing', 'Quick analysis', 'Summarization'],
    performance: { speed: 5, quality: 3, cost: 5, reliability: 5 }
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    category: 'fast',
    contextWindow: 1000000,
    inputCost: 0.00035,
    outputCost: 0.00105,
    speed: 'fast',
    capabilities: ['chat', 'vision', 'audio'],
    icon: '✨',
    description: 'Multimodal with massive context window',
    strengths: ['Context size', 'Multimodal', 'Speed'],
    weaknesses: ['Consistency', 'Code generation'],
    bestFor: ['Long documents', 'Media analysis', 'Research'],
    performance: { speed: 5, quality: 3, cost: 5, reliability: 4 }
  },
  
  // Balanced Models
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    category: 'balanced',
    contextWindow: 128000,
    inputCost: 0.00015,
    outputCost: 0.0006,
    speed: 'medium',
    capabilities: ['chat', 'vision', 'function-calling'],
    icon: '🔷',
    description: 'Best balance of performance and cost',
    strengths: ['Value', 'Versatility', 'Vision'],
    weaknesses: ['Not the fastest', 'Not the smartest'],
    bestFor: ['General use', 'Multimodal tasks', 'Production apps'],
    performance: { speed: 4, quality: 4, cost: 4, reliability: 5 }
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    category: 'balanced',
    contextWindow: 200000,
    inputCost: 0.003,
    outputCost: 0.015,
    speed: 'medium',
    capabilities: ['chat', 'vision', 'analysis'],
    icon: '🎭',
    description: 'Excellent for coding and analysis',
    strengths: ['Code generation', 'Reasoning', 'Safety'],
    weaknesses: ['Cost', 'Speed vs Haiku'],
    bestFor: ['Coding', 'Technical writing', 'Analysis'],
    performance: { speed: 3, quality: 5, cost: 3, reliability: 5 }
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    category: 'balanced',
    contextWindow: 32000,
    inputCost: 0.00125,
    outputCost: 0.00375,
    speed: 'medium',
    capabilities: ['chat', 'vision'],
    icon: '💎',
    description: 'Google\'s balanced multimodal model',
    strengths: ['Multimodal', 'Free tier', 'Integration'],
    weaknesses: ['Availability', 'Rate limits'],
    bestFor: ['General tasks', 'Google ecosystem', 'Prototyping'],
    performance: { speed: 4, quality: 4, cost: 4, reliability: 3 }
  },
  
  // Powerful Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    category: 'powerful',
    contextWindow: 128000,
    inputCost: 0.005,
    outputCost: 0.015,
    speed: 'medium',
    capabilities: ['chat', 'vision', 'function-calling', 'advanced-reasoning'],
    icon: '🚀',
    description: 'OpenAI\'s flagship multimodal model',
    strengths: ['Intelligence', 'Multimodal', 'Reliability'],
    weaknesses: ['Cost', 'Speed'],
    bestFor: ['Complex tasks', 'Creative work', 'Professional use'],
    performance: { speed: 3, quality: 5, cost: 2, reliability: 5 }
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    category: 'powerful',
    contextWindow: 200000,
    inputCost: 0.015,
    outputCost: 0.075,
    speed: 'slow',
    capabilities: ['chat', 'vision', 'analysis', 'research'],
    icon: '👑',
    description: 'Most capable for complex reasoning',
    strengths: ['Intelligence', 'Context', 'Safety'],
    weaknesses: ['Cost', 'Speed', 'Availability'],
    bestFor: ['Research', 'Complex analysis', 'Critical tasks'],
    performance: { speed: 2, quality: 5, cost: 1, reliability: 5 }
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    category: 'powerful',
    contextWindow: 128000,
    inputCost: 0.01,
    outputCost: 0.03,
    speed: 'slow',
    capabilities: ['chat', 'vision', 'function-calling', 'advanced-reasoning'],
    icon: '🧠',
    description: 'Previous flagship with proven performance',
    strengths: ['Reliability', 'Quality', 'Features'],
    weaknesses: ['Cost', 'Speed', 'Newer models available'],
    bestFor: ['Legacy systems', 'Proven workflows', 'High stakes'],
    performance: { speed: 2, quality: 5, cost: 1, reliability: 5 }
  },
  
  // Specialized Models
  {
    id: 'grok-beta',
    name: 'Grok Beta',
    provider: 'xAI',
    category: 'specialized',
    contextWindow: 100000,
    inputCost: 0.005,
    outputCost: 0.015,
    speed: 'fast',
    capabilities: ['chat', 'realtime', 'humor'],
    icon: '🤖',
    description: 'Real-time information with personality',
    strengths: ['Real-time data', 'Personality', 'Twitter integration'],
    weaknesses: ['Availability', 'Beta status'],
    bestFor: ['Current events', 'Social media', 'Casual chat'],
    performance: { speed: 4, quality: 4, cost: 2, reliability: 3 }
  },
  {
    id: 'llama-3-70b',
    name: 'Llama 3 70B',
    provider: 'Meta',
    category: 'specialized',
    contextWindow: 8192,
    inputCost: 0.0008,
    outputCost: 0.0008,
    speed: 'medium',
    capabilities: ['chat', 'open-source'],
    icon: '🦙',
    description: 'Open-source powerhouse',
    strengths: ['Open-source', 'Customizable', 'No vendor lock'],
    weaknesses: ['Context window', 'Infrastructure needed'],
    bestFor: ['Self-hosting', 'Custom deployments', 'Privacy'],
    performance: { speed: 3, quality: 4, cost: 4, reliability: 4 }
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral',
    category: 'specialized',
    contextWindow: 32000,
    inputCost: 0.004,
    outputCost: 0.012,
    speed: 'medium',
    capabilities: ['chat', 'code', 'european'],
    icon: '🌊',
    description: 'European alternative with strong performance',
    strengths: ['EU compliance', 'Multilingual', 'Code'],
    weaknesses: ['Ecosystem', 'Documentation'],
    bestFor: ['European markets', 'Code generation', 'Privacy'],
    performance: { speed: 3, quality: 4, cost: 3, reliability: 4 }
  }
]

interface ModelSwitcherProps {
  selectedModel: any // Accept any model structure for compatibility
  onModelChange: (model: any) => void
  mode?: 'focus' | 'coding' | 'creative' | 'analysis'
  usage?: {
    dailySpent: number
    dailyLimit: number
    tokensUsed: number
  }
  isEnterprise?: boolean
  onCompare?: (models: ModelOption[]) => void
}

export function ModelSwitcher({
  selectedModel,
  onModelChange,
  mode,
  usage,
  isEnterprise,
  onCompare
}: ModelSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [compareMode, setCompareMode] = useState(false)
  const [compareModels, setCompareModels] = useState<Set<string>>(new Set())
  const [showDetails, setShowDetails] = useState(false)
  
  // Filter models
  const filteredModels = MODELS.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          model.provider.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || model.category === selectedCategory
    return matchesSearch && matchesCategory
  })
  
  // Get recommended model based on mode
  const getRecommendedModel = () => {
    switch (mode) {
      case 'coding':
        return MODELS.find(m => m.id === 'claude-3-sonnet')
      case 'creative':
        return MODELS.find(m => m.id === 'gpt-4o')
      case 'analysis':
        return MODELS.find(m => m.id === 'claude-3-opus')
      case 'focus':
      default:
        return MODELS.find(m => m.id === 'gpt-4o-mini')
    }
  }
  
  const recommendedModel = getRecommendedModel()
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fast': return 'text-green-400 border-green-500/30 bg-green-500/10'
      case 'balanced': return 'text-blue-400 border-blue-500/30 bg-blue-500/10'
      case 'powerful': return 'text-purple-400 border-purple-500/30 bg-purple-500/10'
      case 'specialized': return 'text-orange-400 border-orange-500/30 bg-orange-500/10'
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10'
    }
  }
  
  const renderPerformanceBar = (value: number, color: string) => {
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 bg-gray-800 rounded-full h-1.5">
          <div 
            className={cn("h-full rounded-full", color)}
            style={{ width: `${(value / 5) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-400">{value}/5</span>
      </div>
    )
  }
  
  const handleModelSelect = (model: ModelOption) => {
    if (compareMode) {
      const newSet = new Set(compareModels)
      if (newSet.has(model.id)) {
        newSet.delete(model.id)
      } else if (newSet.size < 3) {
        newSet.add(model.id)
      }
      setCompareModels(newSet)
    } else {
      onModelChange(model)
      setIsOpen(false)
    }
  }
  
  const startComparison = () => {
    if (compareModels.size >= 2) {
      const models = Array.from(compareModels).map(id => 
        MODELS.find(m => m.id === id)!
      )
      onCompare?.(models)
      setCompareMode(false)
      setCompareModels(new Set())
      setIsOpen(false)
    }
  }
  
  return (
    <>
      {/* Model Selector Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsOpen(true)}
              variant="outline"
              className="border-gray-700 bg-gray-800/50 hover:bg-gray-700 text-white"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedModel.icon}</span>
                <div className="text-left">
                  <div className="text-sm font-medium">{selectedModel.name}</div>
                  <div className="text-xs text-gray-400">{selectedModel.provider}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">Current Model</p>
              <p className="text-xs text-gray-400">Click to switch models</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Model Selector Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" />
                <span>Select AI Model</span>
              </div>
              <div className="flex items-center gap-2">
                {!compareMode ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCompareMode(true)}
                    className="border-gray-700 bg-gray-800 hover:bg-gray-700"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Compare
                  </Button>
                ) : (
                  <>
                    <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                      {compareModels.size}/3 selected
                    </Badge>
                    <Button
                      size="sm"
                      onClick={startComparison}
                      disabled={compareModels.size < 2}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      Compare Selected
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setCompareMode(false)
                        setCompareModels(new Set())
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {compareMode 
                ? 'Select up to 3 models to compare'
                : `Choose the best model for your ${mode || 'current'} task`}
            </DialogDescription>
          </DialogHeader>
          
          {/* Filters */}
          <div className="flex gap-3 py-3 border-b border-gray-800">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models..."
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
            
            <div className="flex gap-2">
              {['all', 'fast', 'balanced', 'powerful', 'specialized'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all",
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          {/* Recommended Model */}
          {recommendedModel && !compareMode && (
            <div className="p-3 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-lg border border-indigo-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-white">
                    Recommended for {mode} mode
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleModelSelect(recommendedModel)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Use {recommendedModel.name}
                </Button>
              </div>
            </div>
          )}
          
          {/* Models Grid */}
          <div className="overflow-y-auto max-h-[50vh] space-y-2 py-3">
            {filteredModels.map((model) => {
              const isSelected = selectedModel.id === model.id
              const isComparing = compareModels.has(model.id)
              
              return (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-4 rounded-lg border transition-all cursor-pointer",
                    isSelected && !compareMode
                      ? "bg-indigo-900/20 border-indigo-500/50"
                      : isComparing
                      ? "bg-purple-900/20 border-purple-500/50"
                      : "bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600"
                  )}
                  onClick={() => handleModelSelect(model)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{model.icon}</span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white">{model.name}</h4>
                          <Badge className={cn("text-xs", getCategoryColor(model.category))}>
                            {model.category}
                          </Badge>
                          {isSelected && !compareMode && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <Check className="w-3 h-3 mr-1" />
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{model.description}</p>
                        
                        {/* Quick Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${model.inputCost}/1K in
                          </span>
                          <span className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {(model.contextWindow / 1000).toFixed(0)}K context
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {model.speed}
                          </span>
                        </div>
                        
                        {/* Performance Bars */}
                        {showDetails && (
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <div>
                              <span className="text-xs text-gray-400">Speed</span>
                              {renderPerformanceBar(model.performance.speed, 'bg-green-500')}
                            </div>
                            <div>
                              <span className="text-xs text-gray-400">Quality</span>
                              {renderPerformanceBar(model.performance.quality, 'bg-blue-500')}
                            </div>
                            <div>
                              <span className="text-xs text-gray-400">Cost</span>
                              {renderPerformanceBar(model.performance.cost, 'bg-yellow-500')}
                            </div>
                            <div>
                              <span className="text-xs text-gray-400">Reliability</span>
                              {renderPerformanceBar(model.performance.reliability, 'bg-purple-500')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{model.provider}</p>
                      {compareMode && (
                        <div className="mt-2">
                          <input
                            type="checkbox"
                            checked={isComparing}
                            onChange={() => {}}
                            className="w-4 h-4 text-indigo-600 bg-gray-800 border-gray-600 rounded focus:ring-indigo-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-800">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <Info className="w-4 h-4" />
              {showDetails ? 'Hide' : 'Show'} Details
            </button>
            
            {usage && (
              <div className="flex items-center gap-4">
                <div className="text-xs text-gray-400">
                  Daily usage: ${usage.dailySpent.toFixed(2)} / ${usage.dailyLimit}
                </div>
                <Progress 
                  value={(usage.dailySpent / usage.dailyLimit) * 100} 
                  className="w-32 h-2"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}