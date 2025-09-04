'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Code, 
  FileText, 
  Image, 
  Database, 
  Globe, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  Activity,
  Layers,
  Target,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PromptAnalysis {
  complexity: 'simple' | 'moderate' | 'complex' | 'expert'
  type: 'question' | 'code' | 'creative' | 'analysis' | 'task'
  estimatedTokens: number
  suggestedModel: string
  confidence: number
  features: string[]
  warnings?: string[]
  optimizations?: string[]
}

interface PromptAnalyzerProps {
  prompt: string
  isAnalyzing: boolean
  analysis: PromptAnalysis | null
  mode?: string
}

export function PromptAnalyzer({ prompt, isAnalyzing, analysis, mode }: PromptAnalyzerProps) {
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'text-green-400 border-green-500/30 bg-green-500/10'
      case 'moderate': return 'text-blue-400 border-blue-500/30 bg-blue-500/10'
      case 'complex': return 'text-orange-400 border-orange-500/30 bg-orange-500/10'
      case 'expert': return 'text-red-400 border-red-500/30 bg-red-500/10'
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'code': return <Code className="w-4 h-4" />
      case 'creative': return <Sparkles className="w-4 h-4" />
      case 'analysis': return <Activity className="w-4 h-4" />
      case 'task': return <Target className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  if (!prompt || prompt.length < 5) return null

  return (
    <AnimatePresence>
      {(isAnalyzing || analysis) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-3"
        >
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-4">
            {isAnalyzing ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Brain className="w-5 h-5 text-indigo-400" />
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Brain className="w-5 h-5 text-indigo-400 opacity-50" />
                  </motion.div>
                </div>
                <span className="text-sm text-gray-400">Analyzing prompt complexity...</span>
              </div>
            ) : analysis && (
              <div className="space-y-3">
                {/* Main Analysis */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                      <Brain className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">Prompt Analysis</span>
                        <span className={cn(
                          "px-2 py-0.5 text-xs rounded-full border",
                          getComplexityColor(analysis.complexity)
                        )}>
                          {analysis.complexity.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          {getTypeIcon(analysis.type)}
                          <span>{analysis.type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>{analysis.estimatedTokens} tokens</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          <span>{analysis.confidence}% confidence</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Suggested Model */}
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Recommended</p>
                    <p className="text-sm font-medium text-indigo-400">{analysis.suggestedModel}</p>
                  </div>
                </div>

                {/* Features */}
                {analysis.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {analysis.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-gray-800/50 text-gray-300 rounded-lg border border-gray-700"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                )}

                {/* Warnings */}
                {analysis.warnings && analysis.warnings.length > 0 && (
                  <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                      <div className="space-y-1 flex-1">
                        {analysis.warnings.map((warning, idx) => (
                          <p key={idx} className="text-xs text-yellow-400">{warning}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Optimizations */}
                {analysis.optimizations && analysis.optimizations.length > 0 && (
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div className="space-y-1 flex-1">
                        <p className="text-xs font-medium text-green-400">Optimization Tips</p>
                        {analysis.optimizations.map((tip, idx) => (
                          <p key={idx} className="text-xs text-gray-300">• {tip}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function analyzePrompt(prompt: string, mode?: string): PromptAnalysis {
  const wordCount = prompt.split(/\s+/).length
  const hasCode = /```|function|const|let|var|import|class|def|public|private/.test(prompt)
  const hasQuestion = /\?|how|what|when|where|why|can|could|should/.test(prompt.toLowerCase())
  const hasCreative = /story|poem|creative|imagine|describe|write/.test(prompt.toLowerCase())
  const hasAnalysis = /analyze|explain|compare|evaluate|assess|review/.test(prompt.toLowerCase())
  const hasData = /data|csv|json|table|database|sql/.test(prompt.toLowerCase())
  const hasImage = /image|picture|photo|draw|sketch|visual/.test(prompt.toLowerCase())
  
  // Determine complexity
  let complexity: 'simple' | 'moderate' | 'complex' | 'expert' = 'simple'
  if (wordCount > 500 || (hasCode && wordCount > 100)) {
    complexity = 'expert'
  } else if (wordCount > 200 || hasAnalysis || hasData) {
    complexity = 'complex'
  } else if (wordCount > 50 || hasCode) {
    complexity = 'moderate'
  }

  // Determine type
  let type: 'question' | 'code' | 'creative' | 'analysis' | 'task' = 'question'
  if (hasCode) type = 'code'
  else if (hasCreative) type = 'creative'
  else if (hasAnalysis) type = 'analysis'
  else if (!hasQuestion) type = 'task'

  // Calculate estimated tokens (rough estimate)
  const estimatedTokens = Math.ceil(prompt.length / 4)

  // Suggest model based on complexity and type
  let suggestedModel = 'gpt-4o-mini'
  if (mode === 'coding' || hasCode) {
    suggestedModel = complexity === 'expert' ? 'claude-3-opus' : 'claude-3-sonnet'
  } else if (mode === 'creative' || hasCreative) {
    suggestedModel = 'gpt-4o'
  } else if (mode === 'analysis' || hasAnalysis) {
    suggestedModel = complexity === 'expert' ? 'claude-3-opus' : 'gemini-pro'
  } else if (complexity === 'simple') {
    suggestedModel = 'gpt-3.5-turbo'
  }

  // Detect features
  const features: string[] = []
  if (hasCode) features.push('Code')
  if (hasQuestion) features.push('Question')
  if (hasCreative) features.push('Creative')
  if (hasAnalysis) features.push('Analysis')
  if (hasData) features.push('Data')
  if (hasImage) features.push('Visual')
  if (wordCount > 100) features.push('Long-form')
  if (prompt.includes('```')) features.push('Formatted')

  // Generate warnings
  const warnings: string[] = []
  if (estimatedTokens > 3000) {
    warnings.push('Prompt may exceed context limit for some models')
  }
  if (hasImage && !mode) {
    warnings.push('Consider using vision-enabled models for image content')
  }
  if (complexity === 'expert' && estimatedTokens > 2000) {
    warnings.push('Complex prompt may benefit from breaking into smaller parts')
  }

  // Generate optimizations
  const optimizations: string[] = []
  if (wordCount < 20 && !hasCode) {
    optimizations.push('Add more context for better results')
  }
  if (hasQuestion && !prompt.includes('?')) {
    optimizations.push('Add question mark for clarity')
  }
  if (complexity === 'simple' && suggestedModel.includes('opus')) {
    optimizations.push('Consider using a faster model for simple queries')
  }

  return {
    complexity,
    type,
    estimatedTokens,
    suggestedModel,
    confidence: Math.min(95, 70 + features.length * 5),
    features,
    warnings: warnings.length > 0 ? warnings : undefined,
    optimizations: optimizations.length > 0 ? optimizations : undefined
  }
}