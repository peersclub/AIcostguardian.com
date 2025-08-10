import { ComplexityLevel, ContentType, OptimizationMode } from '@prisma/client';
import { PromptAnalyzer } from './analyzer';

export interface ModelOption {
  provider: string;
  model: string;
  contextWindow: number;
  inputCost: number; // per 1k tokens
  outputCost: number; // per 1k tokens
  avgLatency: number; // milliseconds
  qualityScore: number; // 0-1
  capabilities: string[];
  strengths: string[];
}

export interface SelectionResult {
  recommended: ModelOption;
  alternatives: ModelOption[];
  reasoning: string;
  estimatedCost: number;
  scores: {
    quality: number;
    cost: number;
    speed: number;
    capability: number;
    total: number;
  };
}

export interface SelectionPreferences {
  mode: OptimizationMode;
  qualityWeight: number;
  costWeight: number;
  speedWeight: number;
  capabilityWeight: number;
  maxCostPerMessage?: number;
  preferredProviders?: string[];
  blacklistedModels?: string[];
}

export class ModelSelector {
  private static readonly MODELS: ModelOption[] = [
    // OpenAI Models
    {
      provider: 'openai',
      model: 'gpt-4o',
      contextWindow: 128000,
      inputCost: 0.0025,
      outputCost: 0.01,
      avgLatency: 2000,
      qualityScore: 0.95,
      capabilities: ['vision', 'code_generation', 'reasoning', 'web_browsing', 'data_analysis'],
      strengths: ['complex_reasoning', 'code', 'multimodal'],
    },
    {
      provider: 'openai',
      model: 'gpt-4o-mini',
      contextWindow: 128000,
      inputCost: 0.00015,
      outputCost: 0.0006,
      avgLatency: 1200,
      qualityScore: 0.75,
      capabilities: ['vision', 'code_generation', 'reasoning'],
      strengths: ['cost_effective', 'fast', 'general_purpose'],
    },
    {
      provider: 'openai',
      model: 'gpt-4-turbo',
      contextWindow: 128000,
      inputCost: 0.01,
      outputCost: 0.03,
      avgLatency: 2500,
      qualityScore: 0.93,
      capabilities: ['vision', 'code_generation', 'reasoning', 'data_analysis'],
      strengths: ['complex_reasoning', 'detailed_analysis'],
    },
    {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      contextWindow: 16385,
      inputCost: 0.0005,
      outputCost: 0.0015,
      avgLatency: 800,
      qualityScore: 0.7,
      capabilities: ['code_generation', 'reasoning'],
      strengths: ['fast', 'cost_effective'],
    },
    
    // Anthropic Models
    {
      provider: 'anthropic',
      model: 'claude-3.5-sonnet',
      contextWindow: 200000,
      inputCost: 0.003,
      outputCost: 0.015,
      avgLatency: 2200,
      qualityScore: 0.96,
      capabilities: ['vision', 'code_generation', 'reasoning', 'data_analysis', 'creative_writing'],
      strengths: ['code', 'analysis', 'large_context', 'safety'],
    },
    {
      provider: 'anthropic',
      model: 'claude-3.5-haiku',
      contextWindow: 200000,
      inputCost: 0.0008,
      outputCost: 0.004,
      avgLatency: 1000,
      qualityScore: 0.78,
      capabilities: ['code_generation', 'reasoning'],
      strengths: ['fast', 'large_context', 'cost_effective'],
    },
    {
      provider: 'anthropic',
      model: 'claude-3-opus',
      contextWindow: 200000,
      inputCost: 0.015,
      outputCost: 0.075,
      avgLatency: 3000,
      qualityScore: 0.94,
      capabilities: ['vision', 'code_generation', 'reasoning', 'data_analysis', 'creative_writing'],
      strengths: ['complex_reasoning', 'research', 'large_context'],
    },
    
    // Google Models
    {
      provider: 'google',
      model: 'gemini-1.5-pro',
      contextWindow: 2000000,
      inputCost: 0.00125,
      outputCost: 0.005,
      avgLatency: 1800,
      qualityScore: 0.88,
      capabilities: ['vision', 'code_generation', 'reasoning', 'data_analysis'],
      strengths: ['massive_context', 'multimodal', 'cost_effective'],
    },
    {
      provider: 'google',
      model: 'gemini-1.5-flash',
      contextWindow: 1000000,
      inputCost: 0.000075,
      outputCost: 0.0003,
      avgLatency: 600,
      qualityScore: 0.72,
      capabilities: ['vision', 'code_generation', 'reasoning'],
      strengths: ['very_fast', 'very_cheap', 'large_context'],
    },
    {
      provider: 'google',
      model: 'gemini-1.5-flash-8b',
      contextWindow: 1000000,
      inputCost: 0.0000375,
      outputCost: 0.00015,
      avgLatency: 400,
      qualityScore: 0.65,
      capabilities: ['code_generation', 'reasoning'],
      strengths: ['ultra_fast', 'ultra_cheap', 'large_context'],
    },
    
    // Perplexity Models (for research)
    {
      provider: 'perplexity',
      model: 'sonar-pro',
      contextWindow: 32000,
      inputCost: 0.001,
      outputCost: 0.001,
      avgLatency: 3000,
      qualityScore: 0.85,
      capabilities: ['web_browsing', 'reasoning', 'research'],
      strengths: ['real_time_data', 'citations', 'research'],
    },
    {
      provider: 'perplexity',
      model: 'sonar',
      contextWindow: 32000,
      inputCost: 0.0005,
      outputCost: 0.0005,
      avgLatency: 2000,
      qualityScore: 0.75,
      capabilities: ['web_browsing', 'reasoning'],
      strengths: ['real_time_data', 'cost_effective'],
    },
    
    // X.AI Models
    {
      provider: 'xai',
      model: 'grok-2',
      contextWindow: 32000,
      inputCost: 0.002,
      outputCost: 0.01,
      avgLatency: 2000,
      qualityScore: 0.89,
      capabilities: ['code_generation', 'reasoning', 'real_time_data'],
      strengths: ['uncensored', 'real_time', 'humor'],
    },
    {
      provider: 'xai',
      model: 'grok-2-mini',
      contextWindow: 32000,
      inputCost: 0.0002,
      outputCost: 0.001,
      avgLatency: 1000,
      qualityScore: 0.73,
      capabilities: ['code_generation', 'reasoning'],
      strengths: ['fast', 'cost_effective', 'uncensored'],
    },
  ];

  static selectModel(
    prompt: string,
    files: any[] | undefined,
    preferences: SelectionPreferences
  ): SelectionResult {
    // Analyze the prompt
    const analysis = PromptAnalyzer.analyze(prompt, files);
    
    // Filter models based on requirements
    let availableModels = this.filterModelsByRequirements(analysis, preferences);
    
    // Score each model
    const scoredModels = availableModels.map(model => ({
      model,
      scores: this.scoreModel(model, analysis, preferences),
    }));
    
    // Sort by total score
    scoredModels.sort((a, b) => b.scores.total - a.scores.total);
    
    // Get top model and alternatives
    const recommended = scoredModels[0].model;
    const alternatives = scoredModels.slice(1, 4).map(s => s.model);
    
    // Calculate estimated cost
    const estimatedCost = this.calculateEstimatedCost(
      recommended,
      analysis.estimatedTokens
    );
    
    // Generate reasoning
    const reasoning = this.generateReasoning(
      recommended,
      analysis,
      scoredModels[0].scores,
      preferences
    );
    
    return {
      recommended,
      alternatives,
      reasoning,
      estimatedCost,
      scores: scoredModels[0].scores,
    };
  }

  private static filterModelsByRequirements(
    analysis: any,
    preferences: SelectionPreferences
  ): ModelOption[] {
    return this.MODELS.filter(model => {
      // Check context window
      if (model.contextWindow < analysis.minContextWindow) {
        return false;
      }
      
      // Check required capabilities
      const hasRequiredCapabilities = analysis.requiredCapabilities.every(
        (cap: string) => model.capabilities.includes(cap)
      );
      if (!hasRequiredCapabilities) {
        return false;
      }
      
      // Check provider preferences
      if (preferences.preferredProviders?.length) {
        if (!preferences.preferredProviders.includes(model.provider)) {
          return false;
        }
      }
      
      // Check blacklist
      if (preferences.blacklistedModels?.includes(`${model.provider}/${model.model}`)) {
        return false;
      }
      
      // Check cost limit
      if (preferences.maxCostPerMessage) {
        const estimatedCost = this.calculateEstimatedCost(model, analysis.estimatedTokens);
        if (estimatedCost > preferences.maxCostPerMessage) {
          return false;
        }
      }
      
      return true;
    });
  }

  private static scoreModel(
    model: ModelOption,
    analysis: any,
    preferences: SelectionPreferences
  ): SelectionResult['scores'] {
    // Quality score
    let qualityScore = model.qualityScore;
    
    // Boost quality for matching strengths
    if (analysis.contentType === ContentType.CODE && model.strengths.includes('code')) {
      qualityScore *= 1.1;
    }
    if (analysis.contentType === ContentType.CREATIVE && model.strengths.includes('creative_writing')) {
      qualityScore *= 1.1;
    }
    if (analysis.contentType === ContentType.RESEARCH && model.strengths.includes('research')) {
      qualityScore *= 1.15;
    }
    
    // Normalize quality score
    qualityScore = Math.min(1, qualityScore);
    
    // Cost score (inverted - lower cost = higher score)
    const estimatedCost = this.calculateEstimatedCost(model, analysis.estimatedTokens);
    const maxCost = 0.1; // Maximum expected cost per message
    const costScore = Math.max(0, 1 - (estimatedCost / maxCost));
    
    // Speed score (inverted - lower latency = higher score)
    const maxLatency = 5000; // Maximum expected latency
    const speedScore = Math.max(0, 1 - (model.avgLatency / maxLatency));
    
    // Capability score
    let capabilityScore = 0;
    const requiredCount = analysis.requiredCapabilities.length || 1;
    const matchedCount = analysis.requiredCapabilities.filter(
      (cap: string) => model.capabilities.includes(cap)
    ).length;
    capabilityScore = matchedCount / requiredCount;
    
    // Additional capability bonuses
    if (model.contextWindow >= analysis.minContextWindow * 2) {
      capabilityScore += 0.1;
    }
    if (model.strengths.includes('large_context') && analysis.estimatedTokens > 10000) {
      capabilityScore += 0.1;
    }
    
    // Normalize capability score
    capabilityScore = Math.min(1, capabilityScore);
    
    // Apply preference weights
    let weights = {
      quality: preferences.qualityWeight,
      cost: preferences.costWeight,
      speed: preferences.speedWeight,
      capability: preferences.capabilityWeight,
    };
    
    // Adjust weights based on optimization mode
    if (preferences.mode === OptimizationMode.QUALITY) {
      weights = { quality: 0.7, cost: 0.1, speed: 0.1, capability: 0.1 };
    } else if (preferences.mode === OptimizationMode.BUDGET) {
      weights = { quality: 0.2, cost: 0.6, speed: 0.1, capability: 0.1 };
    } else if (preferences.mode === OptimizationMode.SPEED) {
      weights = { quality: 0.2, cost: 0.2, speed: 0.5, capability: 0.1 };
    } else if (preferences.mode === OptimizationMode.BALANCED) {
      weights = { quality: 0.4, cost: 0.3, speed: 0.2, capability: 0.1 };
    }
    
    // Calculate total weighted score
    const total = 
      qualityScore * weights.quality +
      costScore * weights.cost +
      speedScore * weights.speed +
      capabilityScore * weights.capability;
    
    return {
      quality: qualityScore,
      cost: costScore,
      speed: speedScore,
      capability: capabilityScore,
      total,
    };
  }

  private static calculateEstimatedCost(model: ModelOption, estimatedTokens: number): number {
    // Assume roughly 50/50 split between input and output
    const inputTokens = estimatedTokens * 0.4;
    const outputTokens = estimatedTokens * 0.6;
    
    const inputCost = (inputTokens / 1000) * model.inputCost;
    const outputCost = (outputTokens / 1000) * model.outputCost;
    
    return inputCost + outputCost;
  }

  private static generateReasoning(
    model: ModelOption,
    analysis: any,
    scores: SelectionResult['scores'],
    preferences: SelectionPreferences
  ): string {
    const reasons: string[] = [];
    
    // Main reason based on optimization mode
    if (preferences.mode === OptimizationMode.QUALITY) {
      reasons.push(`Selected ${model.model} for highest quality output`);
    } else if (preferences.mode === OptimizationMode.BUDGET) {
      reasons.push(`Selected ${model.model} for cost efficiency`);
    } else if (preferences.mode === OptimizationMode.SPEED) {
      reasons.push(`Selected ${model.model} for fastest response time`);
    } else {
      reasons.push(`Selected ${model.model} for balanced performance`);
    }
    
    // Add specific strengths
    if (analysis.contentType === ContentType.CODE && model.strengths.includes('code')) {
      reasons.push('Excellent at code generation and debugging');
    }
    if (analysis.contentType === ContentType.RESEARCH && model.strengths.includes('research')) {
      reasons.push('Optimized for research with citations');
    }
    if (analysis.complexity === ComplexityLevel.EXPERT) {
      reasons.push('Capable of handling expert-level complexity');
    }
    
    // Add context window reason if relevant
    if (analysis.estimatedTokens > 10000) {
      reasons.push(`Large context window (${model.contextWindow.toLocaleString()} tokens)`);
    }
    
    // Add cost/speed benefits
    if (scores.cost > 0.8) {
      reasons.push('Very cost-effective for this query');
    }
    if (scores.speed > 0.8) {
      reasons.push('Fast response time');
    }
    
    return reasons.join('. ');
  }

  static getModelCapabilities(provider: string, model: string): ModelOption | undefined {
    return this.MODELS.find(m => m.provider === provider && m.model === model);
  }

  static getAllModels(): ModelOption[] {
    return [...this.MODELS];
  }

  static calculateSavingsVsPremium(selectedModel: ModelOption, estimatedTokens: number): number {
    // Compare against most expensive model (Claude Opus)
    const premiumModel = this.MODELS.find(m => m.model === 'claude-3-opus')!;
    
    const selectedCost = this.calculateEstimatedCost(selectedModel, estimatedTokens);
    const premiumCost = this.calculateEstimatedCost(premiumModel, estimatedTokens);
    
    return Math.max(0, premiumCost - selectedCost);
  }
}