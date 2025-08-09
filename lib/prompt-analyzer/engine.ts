export enum ContentType {
  // Writing & Creative
  CREATIVE_WRITING = 'creative_writing',
  PROFESSIONAL_WRITING = 'professional_writing',
  MARKETING_COPY = 'marketing_copy',
  
  // Technical
  CODE_GENERATION = 'code_generation',
  CODE_DEBUGGING = 'code_debugging',
  CODE_EXPLANATION = 'code_explanation',
  CODE_REVIEW = 'code_review',
  
  // Analysis & Reasoning
  DATA_ANALYSIS = 'data_analysis',
  MATH_PROBLEM = 'math_problem',
  LOGICAL_REASONING = 'logical_reasoning',
  RESEARCH = 'research',
  
  // Conversational
  SIMPLE_QA = 'simple_qa',
  COMPLEX_QA = 'complex_qa',
  CHAT = 'chat',
  ROLE_PLAY = 'role_play',
  
  // Specialized
  TRANSLATION = 'translation',
  SUMMARIZATION = 'summarization',
  EXTRACTION = 'extraction',
  CLASSIFICATION = 'classification',
  
  // Visual & Multimodal
  IMAGE_GENERATION = 'image_generation',
  IMAGE_ANALYSIS = 'image_analysis',
  VISION_TASKS = 'vision_tasks',
}

export enum ComplexityLevel {
  TRIVIAL = 1,
  SIMPLE = 2,
  MODERATE = 3,
  COMPLEX = 4,
  EXPERT = 5,
}

export interface ModelRecommendation {
  provider: 'openai' | 'anthropic' | 'google' | 'xai' | 'perplexity';
  model: string;
  displayName: string;
  reasoning: string[];
  estimatedCost: {
    prompt: number;
    completion: number;
    total: number;
  };
  scores: {
    quality: number;
    speed: number;
    cost: number;
    overall: number;
  };
  badge?: 'best' | 'fastest' | 'cheapest' | 'balanced';
}

export interface AnalysisResult {
  contentType: ContentType;
  complexity: ComplexityLevel;
  confidence: number;
  tokens: {
    estimated: number;
    prompt: number;
    maxResponse: number;
  };
  features: {
    hasCode: boolean;
    hasMath: boolean;
    hasMultipleQuestions: boolean;
    requiresCreativity: boolean;
    requiresLatestInfo: boolean;
    requiresVisualOutput: boolean;
    requiresLongContext: boolean;
    requiresCitation: boolean;
    languageDetected?: string;
  };
  recommendations: ModelRecommendation[];
  summary: string;
}

interface ModelProfile {
  provider: 'openai' | 'anthropic' | 'google' | 'xai' | 'perplexity';
  model: string;
  displayName: string;
  pricing: {
    promptPer1M: number;
    completionPer1M: number;
  };
  capabilities: {
    maxTokens: number;
    contextWindow: number;
    speed: number; // 1-10
    quality: number; // 1-10
    strengths: string[];
    weaknesses: string[];
  };
  bestFor: ContentType[];
}

import { findBestModelForPrompt, MODEL_USE_CASES } from './use-cases';

export class PromptAnalyzer {
  public availableModels: string[] = [];
  private lastInput: string = '';
  private readonly modelProfiles: ModelProfile[] = [
    // OpenAI Models
    {
      provider: 'openai',
      model: 'gpt-4o',
      displayName: 'GPT-4 Omni',
      pricing: { promptPer1M: 2.50, completionPer1M: 10.00 },
      capabilities: {
        maxTokens: 128000,
        contextWindow: 128000,
        speed: 7,
        quality: 10,
        strengths: ['reasoning', 'code', 'vision', 'creative'],
        weaknesses: ['cost', 'speed'],
      },
      bestFor: [
        ContentType.CODE_GENERATION,
        ContentType.CODE_DEBUGGING,
        ContentType.CREATIVE_WRITING,
        ContentType.IMAGE_ANALYSIS,
        ContentType.COMPLEX_QA,
      ],
    },
    {
      provider: 'openai',
      model: 'gpt-4o-mini',
      displayName: 'GPT-4 Omni Mini',
      pricing: { promptPer1M: 0.15, completionPer1M: 0.60 },
      capabilities: {
        maxTokens: 128000,
        contextWindow: 128000,
        speed: 9,
        quality: 7,
        strengths: ['affordable', 'fast', 'general'],
        weaknesses: ['complex-reasoning'],
      },
      bestFor: [
        ContentType.SIMPLE_QA,
        ContentType.CHAT,
        ContentType.SUMMARIZATION,
        ContentType.PROFESSIONAL_WRITING,
      ],
    },
    
    // Anthropic Models
    {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      displayName: 'Claude 3.5 Sonnet',
      pricing: { promptPer1M: 3.00, completionPer1M: 15.00 },
      capabilities: {
        maxTokens: 8192,
        contextWindow: 200000,
        speed: 8,
        quality: 10,
        strengths: ['code', 'writing', 'analysis', 'long-context'],
        weaknesses: ['cost'],
      },
      bestFor: [
        ContentType.CODE_GENERATION,
        ContentType.CODE_REVIEW,
        ContentType.CREATIVE_WRITING,
        ContentType.DATA_ANALYSIS,
        ContentType.RESEARCH,
      ],
    },
    {
      provider: 'anthropic',
      model: 'claude-3-haiku-20240307',
      displayName: 'Claude 3 Haiku',
      pricing: { promptPer1M: 0.25, completionPer1M: 1.25 },
      capabilities: {
        maxTokens: 8192,
        contextWindow: 200000,
        speed: 10,
        quality: 7,
        strengths: ['fast', 'affordable', 'efficient'],
        weaknesses: ['creative-tasks'],
      },
      bestFor: [
        ContentType.SIMPLE_QA,
        ContentType.EXTRACTION,
        ContentType.CLASSIFICATION,
        ContentType.SUMMARIZATION,
      ],
    },
    
    // Google Models
    {
      provider: 'google',
      model: 'gemini-1.5-pro',
      displayName: 'Gemini 1.5 Pro',
      pricing: { promptPer1M: 1.25, completionPer1M: 5.00 },
      capabilities: {
        maxTokens: 8192,
        contextWindow: 2000000,
        speed: 7,
        quality: 9,
        strengths: ['multimodal', 'massive-context', 'reasoning'],
        weaknesses: ['availability'],
      },
      bestFor: [
        ContentType.IMAGE_ANALYSIS,
        ContentType.VISION_TASKS,
        ContentType.DATA_ANALYSIS,
        ContentType.RESEARCH,
      ],
    },
    {
      provider: 'google',
      model: 'gemini-1.5-flash',
      displayName: 'Gemini 1.5 Flash',
      pricing: { promptPer1M: 0.075, completionPer1M: 0.30 },
      capabilities: {
        maxTokens: 8192,
        contextWindow: 1000000,
        speed: 10,
        quality: 6,
        strengths: ['ultra-fast', 'cheapest', 'high-volume'],
        weaknesses: ['complex-tasks'],
      },
      bestFor: [
        ContentType.SIMPLE_QA,
        ContentType.CHAT,
        ContentType.CLASSIFICATION,
      ],
    },
    
    // X.AI Models
    {
      provider: 'xai',
      model: 'grok-2-1212',
      displayName: 'Grok 2',
      pricing: { promptPer1M: 2.00, completionPer1M: 10.00 },
      capabilities: {
        maxTokens: 131072,
        contextWindow: 131072,
        speed: 8,
        quality: 8,
        strengths: ['reasoning', 'humor', 'real-time'],
        weaknesses: ['availability'],
      },
      bestFor: [
        ContentType.COMPLEX_QA,
        ContentType.CREATIVE_WRITING,
        ContentType.CHAT,
        ContentType.ROLE_PLAY,
      ],
    },
    
    // Perplexity Models
    {
      provider: 'perplexity',
      model: 'sonar-pro',
      displayName: 'Perplexity Sonar Pro',
      pricing: { promptPer1M: 3.00, completionPer1M: 15.00 },
      capabilities: {
        maxTokens: 4096,
        contextWindow: 32768,
        speed: 7,
        quality: 9,
        strengths: ['research', 'citations', 'real-time-web'],
        weaknesses: ['creative-tasks'],
      },
      bestFor: [
        ContentType.RESEARCH,
        ContentType.COMPLEX_QA,
        ContentType.DATA_ANALYSIS,
      ],
    },
  ];

  private readonly patterns = {
    code: {
      keywords: ['function', 'class', 'import', 'const', 'let', 'var', 'def', 'return', 'if', 'for', 'while', 'async', 'await'],
      patterns: [
        /```[\s\S]*?```/g,
        /`[^`]+`/g,
        /\b(function|class|import|export|const|let|var|def|return)\b/gi,
        /[{}[\]();]/g,
      ],
      languages: ['javascript', 'python', 'java', 'typescript', 'c++', 'go', 'rust', 'sql', 'react', 'vue'],
    },
    math: {
      keywords: ['calculate', 'solve', 'equation', 'formula', 'integral', 'derivative', 'sum', 'multiply'],
      patterns: [
        /\d+\s*[\+\-\*\/\^]\s*\d+/g,
        /\b(sin|cos|tan|log|sqrt|exp)\b/gi,
        /[∫∑∏√∂∇∞π]/g,
      ],
    },
    creative: {
      keywords: ['story', 'poem', 'write', 'creative', 'imagine', 'fiction', 'character', 'plot', 'narrative'],
      patterns: [
        /write\s+(a|an|me)\s+\w+/gi,
        /create\s+(a|an|me)\s+\w+/gi,
        /imagine\s+\w+/gi,
      ],
    },
    professional: {
      keywords: ['email', 'report', 'proposal', 'memo', 'documentation', 'brief', 'letter', 'resume'],
      patterns: [
        /dear\s+\w+/gi,
        /sincerely|regards|best\s+regards/gi,
        /subject:/gi,
      ],
    },
    research: {
      keywords: ['research', 'analyze', 'investigate', 'study', 'examine', 'explore', 'compare'],
      patterns: [
        /what\s+are\s+the\s+\w+/gi,
        /how\s+does\s+\w+\s+work/gi,
        /explain\s+\w+/gi,
      ],
    },
  };

  public analyze(input: string): AnalysisResult {
    const startTime = performance.now();
    
    // Store the input for use case matching
    this.lastInput = input;
    
    // Clean and normalize input
    const normalizedInput = input.toLowerCase().trim();
    
    // Extract features
    const features = this.extractFeatures(input);
    
    // Classify content type
    const contentType = this.classifyContent(normalizedInput, features);
    
    // Assess complexity
    const complexity = this.assessComplexity(input, contentType, features);
    
    // Estimate tokens
    const tokens = this.estimateTokens(input);
    
    // Calculate confidence
    const confidence = this.calculateConfidence(normalizedInput, contentType);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      contentType,
      complexity,
      features,
      tokens
    );
    
    // Generate summary
    const summary = this.generateSummary(contentType, complexity, features);
    
    const analysisTime = performance.now() - startTime;
    console.log(`Analysis completed in ${analysisTime.toFixed(2)}ms`);
    
    return {
      contentType,
      complexity,
      confidence,
      tokens,
      features,
      recommendations,
      summary,
    };
  }

  private extractFeatures(input: string): AnalysisResult['features'] {
    const features = {
      hasCode: false,
      hasMath: false,
      hasMultipleQuestions: false,
      requiresCreativity: false,
      requiresLatestInfo: false,
      requiresVisualOutput: false,
      requiresLongContext: false,
      requiresCitation: false,
      languageDetected: 'en',
    };

    // Code detection
    features.hasCode = 
      this.patterns.code.patterns.some(p => p.test(input)) ||
      this.patterns.code.keywords.some(k => input.toLowerCase().includes(k)) ||
      this.patterns.code.languages.some(l => input.toLowerCase().includes(l));

    // Math detection
    features.hasMath = 
      this.patterns.math.patterns.some(p => p.test(input)) ||
      this.patterns.math.keywords.some(k => input.toLowerCase().includes(k));

    // Multiple questions
    features.hasMultipleQuestions = (input.match(/\?/g) || []).length > 1;

    // Creativity requirement
    features.requiresCreativity = 
      this.patterns.creative.keywords.some(k => input.toLowerCase().includes(k)) ||
      this.patterns.creative.patterns.some(p => p.test(input));

    // Latest info requirement
    features.requiresLatestInfo = /\b(latest|current|today|now|recent|2024|2025)\b/gi.test(input);

    // Visual output
    features.requiresVisualOutput = /\b(image|picture|draw|sketch|diagram|chart|graph|visual)\b/gi.test(input);

    // Long context
    features.requiresLongContext = input.length > 2000 || input.includes('context:') || input.includes('background:');

    // Citations
    features.requiresCitation = /\b(cite|source|reference|proof|evidence|study|paper)\b/gi.test(input);

    return features;
  }

  private classifyContent(input: string, features: AnalysisResult['features']): ContentType {
    // Priority-based classification with scoring
    const scores: Partial<Record<ContentType, number>> = {};

    // Code-related
    if (features.hasCode) {
      if (/\b(debug|fix|error|bug)\b/gi.test(input)) {
        scores[ContentType.CODE_DEBUGGING] = 10;
      } else if (/\b(explain|understand|what does)\b/gi.test(input)) {
        scores[ContentType.CODE_EXPLANATION] = 10;
      } else if (/\b(review|optimize|improve|refactor)\b/gi.test(input)) {
        scores[ContentType.CODE_REVIEW] = 10;
      } else {
        scores[ContentType.CODE_GENERATION] = 10;
      }
    }

    // Math
    if (features.hasMath) {
      scores[ContentType.MATH_PROBLEM] = 9;
    }

    // Visual
    if (features.requiresVisualOutput) {
      if (/\b(analyze|describe|what is in)\b/gi.test(input)) {
        scores[ContentType.IMAGE_ANALYSIS] = 10;
      } else {
        scores[ContentType.IMAGE_GENERATION] = 10;
      }
    }

    // Translation
    if (/\b(translate|translation)\b/gi.test(input)) {
      scores[ContentType.TRANSLATION] = 10;
    }

    // Summarization
    if (/\b(summarize|summary|tldr|brief)\b/gi.test(input)) {
      scores[ContentType.SUMMARIZATION] = 9;
    }

    // Research
    if (this.patterns.research.keywords.some(k => input.includes(k))) {
      scores[ContentType.RESEARCH] = 7;
    }

    // Creative writing
    if (features.requiresCreativity) {
      if (this.patterns.creative.keywords.some(k => input.includes(k))) {
        scores[ContentType.CREATIVE_WRITING] = 8;
      }
    }

    // Professional writing
    if (this.patterns.professional.keywords.some(k => input.includes(k))) {
      scores[ContentType.PROFESSIONAL_WRITING] = 7;
    }

    // Simple vs Complex QA
    if (Object.keys(scores).length === 0) {
      if (input.length < 50 && /^(what|who|when|where|why|how|is|are|can|will|does)/gi.test(input)) {
        scores[ContentType.SIMPLE_QA] = 5;
      } else {
        scores[ContentType.COMPLEX_QA] = 5;
      }
    }

    // Return highest scoring type
    const sortedTypes = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return sortedTypes[0]?.[0] as ContentType || ContentType.COMPLEX_QA;
  }

  private assessComplexity(
    input: string,
    contentType: ContentType,
    features: AnalysisResult['features']
  ): ComplexityLevel {
    let score = 1;

    // Length-based scoring
    if (input.length > 200) score += 0.5;
    if (input.length > 500) score += 0.5;
    if (input.length > 1000) score += 1;
    if (input.length > 2000) score += 1;

    // Feature-based scoring
    if (features.hasMultipleQuestions) score += 1;
    if (features.requiresCreativity) score += 1;
    if (features.requiresLatestInfo) score += 0.5;
    if (features.requiresCitation) score += 1;
    if (features.requiresLongContext) score += 1;

    // Content type adjustments
    const complexTypes = [
      ContentType.CODE_GENERATION,
      ContentType.CODE_DEBUGGING,
      ContentType.CREATIVE_WRITING,
      ContentType.DATA_ANALYSIS,
      ContentType.RESEARCH,
      ContentType.IMAGE_GENERATION,
    ];

    const simpleTypes = [
      ContentType.SIMPLE_QA,
      ContentType.CHAT,
      ContentType.TRANSLATION,
      ContentType.CLASSIFICATION,
    ];

    if (complexTypes.includes(contentType)) {
      score = Math.max(score, 3);
    } else if (simpleTypes.includes(contentType)) {
      score = Math.min(score, 3);
    }

    // Round to nearest integer
    return Math.max(1, Math.min(5, Math.round(score))) as ComplexityLevel;
  }

  private estimateTokens(input: string): AnalysisResult['tokens'] {
    // Rough estimation: ~1 token per 4 characters for English
    const promptTokens = Math.ceil(input.length / 4);
    
    // Estimate response tokens based on input length and complexity
    let responseMultiplier = 2; // Default: response is 2x input
    
    if (input.includes('brief') || input.includes('short')) {
      responseMultiplier = 0.5;
    } else if (input.includes('detailed') || input.includes('comprehensive')) {
      responseMultiplier = 4;
    }
    
    const maxResponse = Math.ceil(promptTokens * responseMultiplier);
    const estimated = promptTokens + maxResponse;
    
    return {
      estimated,
      prompt: promptTokens,
      maxResponse,
    };
  }

  private calculateConfidence(input: string, contentType: ContentType): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence for clear indicators
    const typeKeywords: Partial<Record<ContentType, string[]>> = {
      [ContentType.CODE_GENERATION]: ['write code', 'create function', 'implement'],
      [ContentType.CREATIVE_WRITING]: ['write story', 'create poem', 'fiction'],
      [ContentType.TRANSLATION]: ['translate', 'translation'],
      [ContentType.MATH_PROBLEM]: ['calculate', 'solve equation'],
    };

    const keywords = typeKeywords[contentType] || [];
    if (keywords.some(k => input.toLowerCase().includes(k))) {
      confidence += 0.3;
    }

    // Adjust based on input clarity
    if (input.length > 50) confidence += 0.1;
    if (input.includes('?')) confidence += 0.1;

    return Math.min(confidence, 1);
  }

  private generateRecommendations(
    contentType: ContentType,
    complexity: ComplexityLevel,
    features: AnalysisResult['features'],
    tokens: AnalysisResult['tokens']
  ): ModelRecommendation[] {
    const recommendations: ModelRecommendation[] = [];
    
    // Check use cases for better matching
    const useCaseMatch = findBestModelForPrompt(this.lastInput || '');

    this.modelProfiles.forEach(profile => {
      // Filter by available models if set
      if (this.availableModels.length > 0 && !this.availableModels.includes(profile.model)) {
        return;
      }
      let qualityScore = 0;
      let reasoning: string[] = [];

      // Boost score if model matches use cases
      if (useCaseMatch.model === profile.model) {
        qualityScore += 5;
        reasoning.push('Best match for your specific use case');
      }
      
      // Check if model is best for this content type
      if (profile.bestFor.includes(contentType)) {
        qualityScore += 3;
        reasoning.push(`Optimized for ${this.getContentTypeLabel(contentType)}`);
      }

      // Check capability matches
      if (features.hasCode && profile.capabilities.strengths.includes('code')) {
        qualityScore += 2;
        reasoning.push('Strong code capabilities');
      }

      if (features.requiresCreativity && profile.capabilities.strengths.includes('creative')) {
        qualityScore += 2;
        reasoning.push('Excellent creative abilities');
      }

      if (features.requiresLatestInfo && profile.capabilities.strengths.includes('real-time')) {
        qualityScore += 2;
        reasoning.push('Access to current information');
      }

      if (features.requiresLongContext && profile.capabilities.contextWindow > 100000) {
        qualityScore += 2;
        reasoning.push(`Supports ${(profile.capabilities.contextWindow / 1000).toFixed(0)}K context`);
      }

      // Complexity matching
      const complexityMatch = this.matchComplexityToModel(complexity, profile);
      qualityScore += complexityMatch.score;
      if (complexityMatch.reason) reasoning.push(complexityMatch.reason);

      // Calculate costs
      const promptCost = (tokens.prompt / 1000000) * profile.pricing.promptPer1M;
      const completionCost = (tokens.maxResponse / 1000000) * profile.pricing.completionPer1M;
      const totalCost = promptCost + completionCost;

      // Calculate overall score
      const speedScore = profile.capabilities.speed;
      const costScore = 10 - Math.min(10, totalCost * 2); // Inverse cost score
      const overallScore = (qualityScore * 0.5) + (speedScore * 0.2) + (costScore * 0.3);

      recommendations.push({
        provider: profile.provider,
        model: profile.model,
        displayName: profile.displayName,
        reasoning,
        estimatedCost: {
          prompt: promptCost,
          completion: completionCost,
          total: totalCost,
        },
        scores: {
          quality: Math.min(10, qualityScore),
          speed: speedScore,
          cost: costScore,
          overall: Math.round(overallScore * 10) / 10,
        },
      });
    });

    // Sort by overall score
    recommendations.sort((a, b) => b.scores.overall - a.scores.overall);

    // Add badges
    if (recommendations.length > 0) {
      // Best overall
      recommendations[0].badge = 'best';

      // Find fastest
      const fastest = [...recommendations].sort((a, b) => b.scores.speed - a.scores.speed)[0];
      if (fastest && !fastest.badge) fastest.badge = 'fastest';

      // Find cheapest
      const cheapest = [...recommendations].sort((a, b) => a.estimatedCost.total - b.estimatedCost.total)[0];
      if (cheapest && !cheapest.badge) cheapest.badge = 'cheapest';

      // Find balanced (good score, reasonable price)
      const balanced = recommendations.find(r => 
        !r.badge && 
        r.scores.overall > 6 && 
        r.estimatedCost.total < recommendations[0].estimatedCost.total * 0.5
      );
      if (balanced) balanced.badge = 'balanced';
    }

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  private matchComplexityToModel(
    complexity: ComplexityLevel,
    profile: ModelProfile
  ): { score: number; reason?: string } {
    const modelQuality = profile.capabilities.quality;

    // Perfect matches
    if (complexity <= 2 && modelQuality <= 7) {
      return { score: 3, reason: 'Efficient for simple tasks' };
    }
    if (complexity >= 4 && modelQuality >= 9) {
      return { score: 3, reason: 'Capable of complex reasoning' };
    }
    if (complexity === 3 && modelQuality >= 7 && modelQuality <= 8) {
      return { score: 3, reason: 'Well-matched complexity' };
    }

    // Over-qualified (expensive for simple tasks)
    if (complexity <= 2 && modelQuality >= 9) {
      return { score: 1, reason: 'May be overkill for this task' };
    }

    // Under-qualified
    if (complexity >= 4 && modelQuality <= 6) {
      return { score: 0, reason: 'May struggle with complexity' };
    }

    return { score: 2 };
  }

  private getContentTypeLabel(contentType: ContentType): string {
    const labels: Record<ContentType, string> = {
      [ContentType.CREATIVE_WRITING]: 'creative writing',
      [ContentType.PROFESSIONAL_WRITING]: 'professional writing',
      [ContentType.MARKETING_COPY]: 'marketing copy',
      [ContentType.CODE_GENERATION]: 'code generation',
      [ContentType.CODE_DEBUGGING]: 'debugging',
      [ContentType.CODE_EXPLANATION]: 'code explanation',
      [ContentType.CODE_REVIEW]: 'code review',
      [ContentType.DATA_ANALYSIS]: 'data analysis',
      [ContentType.MATH_PROBLEM]: 'mathematical problems',
      [ContentType.LOGICAL_REASONING]: 'logical reasoning',
      [ContentType.RESEARCH]: 'research',
      [ContentType.SIMPLE_QA]: 'simple Q&A',
      [ContentType.COMPLEX_QA]: 'complex Q&A',
      [ContentType.CHAT]: 'conversation',
      [ContentType.ROLE_PLAY]: 'role-play',
      [ContentType.TRANSLATION]: 'translation',
      [ContentType.SUMMARIZATION]: 'summarization',
      [ContentType.EXTRACTION]: 'data extraction',
      [ContentType.CLASSIFICATION]: 'classification',
      [ContentType.IMAGE_GENERATION]: 'image generation',
      [ContentType.IMAGE_ANALYSIS]: 'image analysis',
      [ContentType.VISION_TASKS]: 'vision tasks',
    };
    return labels[contentType] || contentType;
  }

  private generateSummary(
    contentType: ContentType,
    complexity: ComplexityLevel,
    features: AnalysisResult['features']
  ): string {
    const complexityLabels = ['', 'trivial', 'simple', 'moderate', 'complex', 'expert'];
    const typeLabel = this.getContentTypeLabel(contentType);
    const complexityLabel = complexityLabels[complexity];

    let summary = `This appears to be a ${complexityLabel} ${typeLabel} task`;

    const keyFeatures: string[] = [];
    if (features.hasCode) keyFeatures.push('code');
    if (features.hasMath) keyFeatures.push('mathematics');
    if (features.requiresCreativity) keyFeatures.push('creativity');
    if (features.requiresLatestInfo) keyFeatures.push('current information');
    if (features.requiresLongContext) keyFeatures.push('extensive context');

    if (keyFeatures.length > 0) {
      summary += ` involving ${keyFeatures.join(', ')}`;
    }

    summary += '.';
    return summary;
  }
}