import { prisma } from '@/lib/prisma'

export interface ModelCapabilities {
  contextWindow: number
  supportsVision: boolean
  supportsFunctionCalling: boolean
  supportsStreaming: boolean
  responseSpeed: 'fast' | 'medium' | 'slow'
  costPerMillion: {
    input: number
    output: number
  }
}

export interface TaskRequirements {
  taskType: 'chat' | 'completion' | 'code' | 'analysis' | 'creative' | 'translation' | 'summarization'
  estimatedTokens: number
  requiresVision?: boolean
  requiresFunctionCalling?: boolean
  requiresStreaming?: boolean
  maxLatency?: number // in milliseconds
  maxCost?: number // in USD
  minQuality?: 'low' | 'medium' | 'high' | 'very-high'
}

export interface ModelScore {
  model: string
  provider: string
  score: number
  estimatedCost: number
  estimatedLatency: number
  reasons: string[]
}

// Model capabilities database
const MODEL_CAPABILITIES: Record<string, ModelCapabilities> = {
  // OpenAI Models
  'gpt-4o': {
    contextWindow: 128000,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    responseSpeed: 'fast',
    costPerMillion: { input: 2.5, output: 10 }
  },
  'gpt-4o-mini': {
    contextWindow: 128000,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    responseSpeed: 'fast',
    costPerMillion: { input: 0.15, output: 0.6 }
  },
  'gpt-4-turbo': {
    contextWindow: 128000,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    responseSpeed: 'medium',
    costPerMillion: { input: 10, output: 30 }
  },
  'gpt-3.5-turbo': {
    contextWindow: 16385,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    responseSpeed: 'fast',
    costPerMillion: { input: 0.5, output: 1.5 }
  },
  
  // Claude Models
  'claude-3.5-sonnet': {
    contextWindow: 200000,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    responseSpeed: 'fast',
    costPerMillion: { input: 3, output: 15 }
  },
  'claude-3-opus': {
    contextWindow: 200000,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    responseSpeed: 'medium',
    costPerMillion: { input: 15, output: 75 }
  },
  'claude-3-haiku': {
    contextWindow: 200000,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    responseSpeed: 'fast',
    costPerMillion: { input: 0.25, output: 1.25 }
  },
  
  // Gemini Models
  'gemini-1.5-pro': {
    contextWindow: 2000000,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    responseSpeed: 'medium',
    costPerMillion: { input: 1.25, output: 5 }
  },
  'gemini-1.5-flash': {
    contextWindow: 1000000,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    responseSpeed: 'fast',
    costPerMillion: { input: 0.075, output: 0.3 }
  },
  
  // Grok Models
  'grok-2': {
    contextWindow: 32768,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    responseSpeed: 'medium',
    costPerMillion: { input: 5, output: 15 }
  },
  
  // Perplexity Models
  'llama-3.1-sonar-large': {
    contextWindow: 127072,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    responseSpeed: 'fast',
    costPerMillion: { input: 1, output: 1 }
  }
}

// Task-specific model preferences
const TASK_PREFERENCES: Record<string, { preferred: string[], quality: Record<string, number> }> = {
  'code': {
    preferred: ['gpt-4o', 'claude-3.5-sonnet', 'gpt-4-turbo'],
    quality: {
      'gpt-4o': 0.95,
      'claude-3.5-sonnet': 0.95,
      'gpt-4-turbo': 0.9,
      'gpt-4o-mini': 0.8,
      'claude-3-haiku': 0.75,
      'gpt-3.5-turbo': 0.7
    }
  },
  'creative': {
    preferred: ['claude-3-opus', 'gpt-4o', 'claude-3.5-sonnet'],
    quality: {
      'claude-3-opus': 0.98,
      'gpt-4o': 0.95,
      'claude-3.5-sonnet': 0.93,
      'gemini-1.5-pro': 0.9
    }
  },
  'analysis': {
    preferred: ['claude-3.5-sonnet', 'gpt-4o', 'gemini-1.5-pro'],
    quality: {
      'claude-3.5-sonnet': 0.95,
      'gpt-4o': 0.93,
      'gemini-1.5-pro': 0.9,
      'claude-3-opus': 0.95
    }
  },
  'chat': {
    preferred: ['gpt-4o-mini', 'claude-3-haiku', 'gemini-1.5-flash'],
    quality: {
      'gpt-4o-mini': 0.85,
      'claude-3-haiku': 0.85,
      'gemini-1.5-flash': 0.8,
      'gpt-3.5-turbo': 0.75
    }
  },
  'summarization': {
    preferred: ['gpt-4o-mini', 'claude-3-haiku', 'gemini-1.5-flash'],
    quality: {
      'gpt-4o-mini': 0.9,
      'claude-3-haiku': 0.88,
      'gemini-1.5-flash': 0.85
    }
  },
  'translation': {
    preferred: ['gpt-4o', 'claude-3.5-sonnet', 'gemini-1.5-pro'],
    quality: {
      'gpt-4o': 0.95,
      'claude-3.5-sonnet': 0.93,
      'gemini-1.5-pro': 0.9
    }
  }
}

class ModelOptimizerService {
  private static instance: ModelOptimizerService
  private userPreferences: Map<string, any> = new Map()
  private modelPerformanceHistory: Map<string, any[]> = new Map()

  private constructor() {}

  static getInstance(): ModelOptimizerService {
    if (!ModelOptimizerService.instance) {
      ModelOptimizerService.instance = new ModelOptimizerService()
    }
    return ModelOptimizerService.instance
  }

  /**
   * Select the optimal model based on task requirements
   */
  async selectOptimalModel(
    requirements: TaskRequirements,
    userId: string,
    availableProviders?: string[]
  ): Promise<ModelScore[]> {
    const scores: ModelScore[] = []
    
    // Get user's historical preferences and performance data
    const userHistory = await this.getUserModelHistory(userId)
    
    for (const [modelName, capabilities] of Object.entries(MODEL_CAPABILITIES)) {
      // Skip if provider not available
      const provider = this.getProviderFromModel(modelName)
      if (availableProviders && !availableProviders.includes(provider)) {
        continue
      }
      
      // Check if model meets basic requirements
      if (!this.meetsRequirements(capabilities, requirements)) {
        continue
      }
      
      // Calculate score
      const score = this.calculateModelScore(
        modelName,
        capabilities,
        requirements,
        userHistory
      )
      
      scores.push(score)
    }
    
    // Sort by score (higher is better)
    scores.sort((a, b) => b.score - a.score)
    
    // Apply fallback chains for reliability
    this.applyFallbackChains(scores)
    
    return scores
  }

  /**
   * Calculate cost-optimized model selection
   */
  optimizeForCost(
    requirements: TaskRequirements,
    qualityThreshold: number = 0.8
  ): ModelScore[] {
    const scores: ModelScore[] = []
    
    for (const [modelName, capabilities] of Object.entries(MODEL_CAPABILITIES)) {
      const taskQuality = TASK_PREFERENCES[requirements.taskType]?.quality[modelName] || 0.7
      
      if (taskQuality < qualityThreshold) {
        continue
      }
      
      const estimatedCost = this.calculateCost(capabilities, requirements.estimatedTokens)
      
      scores.push({
        model: modelName,
        provider: this.getProviderFromModel(modelName),
        score: (1 / estimatedCost) * taskQuality, // Inverse cost weighted by quality
        estimatedCost,
        estimatedLatency: this.estimateLatency(capabilities, requirements.estimatedTokens),
        reasons: [`Quality: ${(taskQuality * 100).toFixed(0)}%`, `Cost-optimized`]
      })
    }
    
    scores.sort((a, b) => b.score - a.score)
    return scores
  }

  /**
   * Build fallback chain for reliability
   */
  buildFallbackChain(
    primaryModel: string,
    requirements: TaskRequirements
  ): string[] {
    const chain: string[] = [primaryModel]
    const primaryProvider = this.getProviderFromModel(primaryModel)
    
    // Add same-provider fallback
    const sameProviderModels = Object.keys(MODEL_CAPABILITIES)
      .filter(m => this.getProviderFromModel(m) === primaryProvider && m !== primaryModel)
      .sort((a, b) => {
        const costA = this.calculateCost(MODEL_CAPABILITIES[a], requirements.estimatedTokens)
        const costB = this.calculateCost(MODEL_CAPABILITIES[b], requirements.estimatedTokens)
        return costA - costB
      })
    
    if (sameProviderModels.length > 0) {
      chain.push(sameProviderModels[0])
    }
    
    // Add cross-provider fallback
    const otherProviderModels = Object.keys(MODEL_CAPABILITIES)
      .filter(m => this.getProviderFromModel(m) !== primaryProvider)
      .filter(m => this.meetsRequirements(MODEL_CAPABILITIES[m], requirements))
      .sort((a, b) => {
        const qualityA = TASK_PREFERENCES[requirements.taskType]?.quality[a] || 0.7
        const qualityB = TASK_PREFERENCES[requirements.taskType]?.quality[b] || 0.7
        return qualityB - qualityA
      })
    
    if (otherProviderModels.length > 0) {
      chain.push(otherProviderModels[0])
    }
    
    return chain
  }

  /**
   * Track model performance for learning
   */
  async trackModelPerformance(
    userId: string,
    model: string,
    taskType: string,
    performance: {
      latency: number
      cost: number
      success: boolean
      userRating?: number
    }
  ): Promise<void> {
    try {
      await prisma.modelPerformance.create({
        data: {
          userId,
          model,
          taskType,
          latency: performance.latency,
          cost: performance.cost,
          success: performance.success,
          userRating: performance.userRating,
          timestamp: new Date()
        }
      })
      
      // Update in-memory cache
      const key = `${userId}-${model}`
      const history = this.modelPerformanceHistory.get(key) || []
      history.push(performance)
      
      // Keep only last 100 entries
      if (history.length > 100) {
        history.shift()
      }
      
      this.modelPerformanceHistory.set(key, history)
    } catch (error) {
      console.error('Failed to track model performance:', error)
    }
  }

  /**
   * Get model recommendations based on user history
   */
  async getPersonalizedRecommendations(
    userId: string,
    taskType: string
  ): Promise<{ model: string, confidence: number, reason: string }[]> {
    const history = await prisma.modelPerformance.findMany({
      where: {
        userId,
        taskType,
        success: true,
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 100
    })
    
    const modelStats = new Map<string, { count: number, avgRating: number, avgLatency: number }>()
    
    for (const record of history) {
      const stats = modelStats.get(record.model) || { count: 0, avgRating: 0, avgLatency: 0 }
      stats.count++
      stats.avgRating = (stats.avgRating * (stats.count - 1) + (record.userRating || 3)) / stats.count
      stats.avgLatency = (stats.avgLatency * (stats.count - 1) + record.latency) / stats.count
      modelStats.set(record.model, stats)
    }
    
    const recommendations = Array.from(modelStats.entries())
      .map(([model, stats]) => ({
        model,
        confidence: Math.min(stats.count / 10, 1) * (stats.avgRating / 5),
        reason: `Used ${stats.count} times with ${stats.avgRating.toFixed(1)}/5 rating`
      }))
      .sort((a, b) => b.confidence - a.confidence)
    
    return recommendations
  }

  // Helper methods
  private meetsRequirements(
    capabilities: ModelCapabilities,
    requirements: TaskRequirements
  ): boolean {
    if (requirements.requiresVision && !capabilities.supportsVision) return false
    if (requirements.requiresFunctionCalling && !capabilities.supportsFunctionCalling) return false
    if (requirements.requiresStreaming && !capabilities.supportsStreaming) return false
    if (requirements.estimatedTokens > capabilities.contextWindow) return false
    
    const estimatedLatency = this.estimateLatency(capabilities, requirements.estimatedTokens)
    if (requirements.maxLatency && estimatedLatency > requirements.maxLatency) return false
    
    const estimatedCost = this.calculateCost(capabilities, requirements.estimatedTokens)
    if (requirements.maxCost && estimatedCost > requirements.maxCost) return false
    
    return true
  }

  private calculateModelScore(
    modelName: string,
    capabilities: ModelCapabilities,
    requirements: TaskRequirements,
    userHistory: any[]
  ): ModelScore {
    let score = 100
    const reasons: string[] = []
    
    // Task-specific quality score
    const taskQuality = TASK_PREFERENCES[requirements.taskType]?.quality[modelName] || 0.7
    score *= taskQuality
    reasons.push(`Task fit: ${(taskQuality * 100).toFixed(0)}%`)
    
    // Cost efficiency score
    const estimatedCost = this.calculateCost(capabilities, requirements.estimatedTokens)
    const costScore = Math.max(0, 1 - (estimatedCost / 10)) // Normalize to 0-1
    score *= (0.7 + 0.3 * costScore) // Cost is 30% of score
    reasons.push(`Cost efficiency: ${(costScore * 100).toFixed(0)}%`)
    
    // Speed score
    const estimatedLatency = this.estimateLatency(capabilities, requirements.estimatedTokens)
    const speedScore = capabilities.responseSpeed === 'fast' ? 1 : 
                      capabilities.responseSpeed === 'medium' ? 0.7 : 0.5
    score *= (0.8 + 0.2 * speedScore) // Speed is 20% of score
    reasons.push(`Speed: ${capabilities.responseSpeed}`)
    
    // User preference score
    const userPreference = userHistory.filter(h => h.model === modelName).length / Math.max(userHistory.length, 1)
    if (userPreference > 0) {
      score *= (1 + 0.2 * userPreference) // Boost up to 20% for frequently used models
      reasons.push(`User preference: ${(userPreference * 100).toFixed(0)}%`)
    }
    
    // Preferred model boost
    if (TASK_PREFERENCES[requirements.taskType]?.preferred.includes(modelName)) {
      score *= 1.1
      reasons.push('Recommended for task')
    }
    
    return {
      model: modelName,
      provider: this.getProviderFromModel(modelName),
      score,
      estimatedCost,
      estimatedLatency,
      reasons
    }
  }

  private calculateCost(capabilities: ModelCapabilities, tokens: number): number {
    const inputTokens = tokens * 0.7 // Assume 70% input
    const outputTokens = tokens * 0.3 // Assume 30% output
    
    return (
      (inputTokens * capabilities.costPerMillion.input) / 1000000 +
      (outputTokens * capabilities.costPerMillion.output) / 1000000
    )
  }

  private estimateLatency(capabilities: ModelCapabilities, tokens: number): number {
    const baseLatency = capabilities.responseSpeed === 'fast' ? 500 :
                       capabilities.responseSpeed === 'medium' ? 1500 : 3000
    
    // Add token-based latency
    const tokenLatency = tokens * 0.5 // 0.5ms per token
    
    return baseLatency + tokenLatency
  }

  private getProviderFromModel(model: string): string {
    if (model.startsWith('gpt')) return 'openai'
    if (model.startsWith('claude')) return 'claude'
    if (model.startsWith('gemini')) return 'gemini'
    if (model.startsWith('grok')) return 'grok'
    if (model.includes('llama') || model.includes('sonar')) return 'perplexity'
    return 'unknown'
  }

  private async getUserModelHistory(userId: string): Promise<any[]> {
    try {
      const history = await prisma.modelPerformance.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 50
      })
      return history
    } catch {
      return []
    }
  }

  private applyFallbackChains(scores: ModelScore[]): void {
    // Group by provider
    const byProvider = new Map<string, ModelScore[]>()
    
    for (const score of scores) {
      const providerScores = byProvider.get(score.provider) || []
      providerScores.push(score)
      byProvider.set(score.provider, providerScores)
    }
    
    // Ensure diversity in top 3
    if (scores.length >= 3) {
      const providers = new Set(scores.slice(0, 3).map(s => s.provider))
      if (providers.size === 1) {
        // All top 3 are from same provider, inject diversity
        for (const [provider, providerScores] of Array.from(byProvider.entries())) {
          if (provider !== scores[0].provider && providerScores.length > 0) {
            // Swap 3rd position with best from different provider
            const temp = scores[2]
            scores[2] = providerScores[0]
            scores[scores.indexOf(providerScores[0])] = temp
            break
          }
        }
      }
    }
  }
}

// Export singleton instance
export const modelOptimizer = ModelOptimizerService.getInstance()

// Export types
export type { ModelOptimizerService }