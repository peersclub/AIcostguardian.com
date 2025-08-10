import { ComplexityLevel, ContentType } from '@prisma/client';

interface AnalysisResult {
  complexity: ComplexityLevel;
  contentType: ContentType;
  length: number;
  hasCode: boolean;
  hasImages: boolean;
  hasFiles: boolean;
  language: string;
  domain: string | null;
  techStack: string[];
  requiredFeatures: string[];
  minContextWindow: number;
  requiredCapabilities: string[];
  estimatedTokens: number;
  accuracyNeeded: number;
  creativityNeeded: number;
  speedPriority: number;
  budgetSensitivity: number;
  qualityThreshold: number;
}

export class PromptAnalyzer {
  private static readonly CODE_PATTERNS = {
    javascript: /\b(const|let|var|function|=>|async|await|import|export|class)\b/,
    python: /\b(def|class|import|from|if __name__|lambda|async def|yield)\b/,
    java: /\b(public|private|class|interface|extends|implements|static void)\b/,
    cpp: /\b(#include|std::|template|namespace|virtual|nullptr)\b/,
    sql: /\b(SELECT|FROM|WHERE|JOIN|INSERT|UPDATE|DELETE|CREATE TABLE)\b/i,
    html: /<[a-z][\s\S]*>/i,
    css: /\{[\s\S]*?[a-z-]+\s*:\s*[^}]+\}/,
    json: /^\s*\{[\s\S]*\}\s*$/,
    markdown: /^#{1,6}\s|^\*{1,2}[^*]+\*{1,2}|^\[.+\]\(.+\)/m,
  };

  private static readonly TECH_KEYWORDS = {
    react: ['react', 'jsx', 'component', 'usestate', 'useeffect', 'props'],
    vue: ['vue', 'v-model', 'v-if', 'v-for', 'computed', 'mounted'],
    angular: ['angular', 'ngmodel', 'ngif', 'ngfor', 'component', 'service'],
    nextjs: ['next.js', 'nextjs', 'getserversideprops', 'getstaticprops'],
    nodejs: ['node.js', 'nodejs', 'express', 'npm', 'package.json'],
    django: ['django', 'models.py', 'views.py', 'urls.py', 'migrations'],
    flask: ['flask', 'app.route', 'render_template', 'request'],
    docker: ['docker', 'dockerfile', 'container', 'image', 'compose'],
    kubernetes: ['kubernetes', 'k8s', 'kubectl', 'pod', 'deployment'],
    aws: ['aws', 'ec2', 's3', 'lambda', 'dynamodb', 'cloudformation'],
    azure: ['azure', 'blob storage', 'functions', 'cosmos db'],
    gcp: ['google cloud', 'gcp', 'bigquery', 'firestore', 'cloud run'],
  };

  private static readonly DOMAIN_INDICATORS = {
    coding: ['code', 'function', 'algorithm', 'debug', 'implement', 'fix', 'error', 'bug'],
    writing: ['write', 'article', 'blog', 'essay', 'story', 'content', 'copy'],
    analysis: ['analyze', 'evaluate', 'compare', 'assess', 'review', 'examine'],
    research: ['research', 'study', 'investigate', 'explore', 'sources', 'citations'],
    creative: ['creative', 'imagine', 'story', 'poem', 'design', 'brainstorm'],
    translation: ['translate', 'translation', 'language', 'convert to', 'in spanish', 'in french'],
    summarization: ['summarize', 'summary', 'tldr', 'brief', 'overview', 'key points'],
    conversation: ['chat', 'discuss', 'talk', 'conversation', 'dialogue'],
  };

  static analyze(prompt: string, files?: any[]): AnalysisResult {
    const lowerPrompt = prompt.toLowerCase();
    const wordCount = prompt.split(/\s+/).length;
    const charCount = prompt.length;
    
    // Detect code presence
    const hasCode = Object.values(this.CODE_PATTERNS).some(pattern => pattern.test(prompt));
    
    // Detect tech stack
    const techStack = this.detectTechStack(lowerPrompt);
    
    // Determine content type
    const contentType = this.determineContentType(lowerPrompt, hasCode);
    
    // Determine domain
    const domain = this.determineDomain(lowerPrompt);
    
    // Calculate complexity
    const complexity = this.calculateComplexity(wordCount, hasCode, techStack.length);
    
    // Determine required features
    const requiredFeatures = this.determineRequiredFeatures(prompt, files);
    
    // Calculate token estimation (rough approximation)
    const estimatedTokens = Math.ceil(charCount / 3.5);
    
    // Calculate quality requirements
    const accuracyNeeded = this.calculateAccuracyNeeded(contentType, domain);
    const creativityNeeded = this.calculateCreativityNeeded(contentType, domain);
    const speedPriority = this.calculateSpeedPriority(lowerPrompt);
    
    // Determine context window requirement
    const minContextWindow = this.calculateMinContextWindow(estimatedTokens, files);
    
    // Calculate budget sensitivity
    const budgetSensitivity = this.calculateBudgetSensitivity(lowerPrompt);
    
    // Determine quality threshold
    const qualityThreshold = this.calculateQualityThreshold(contentType, domain);
    
    // Determine required capabilities
    const requiredCapabilities = this.determineCapabilities(requiredFeatures, contentType);

    return {
      complexity,
      contentType,
      length: wordCount,
      hasCode,
      hasImages: files?.some(f => f.type?.startsWith('image/')) || false,
      hasFiles: !!files?.length,
      language: this.detectLanguage(prompt),
      domain,
      techStack,
      requiredFeatures,
      minContextWindow,
      requiredCapabilities,
      estimatedTokens,
      accuracyNeeded,
      creativityNeeded,
      speedPriority,
      budgetSensitivity,
      qualityThreshold,
    };
  }

  private static detectTechStack(prompt: string): string[] {
    const detected: string[] = [];
    
    for (const [tech, keywords] of Object.entries(this.TECH_KEYWORDS)) {
      if (keywords.some(keyword => prompt.includes(keyword))) {
        detected.push(tech);
      }
    }
    
    return detected;
  }

  private static determineContentType(prompt: string, hasCode: boolean): ContentType {
    if (hasCode) return ContentType.CODE;
    
    const typeScores = {
      [ContentType.CREATIVE]: 0,
      [ContentType.ANALYSIS]: 0,
      [ContentType.RESEARCH]: 0,
      [ContentType.TRANSLATION]: 0,
      [ContentType.SUMMARIZATION]: 0,
      [ContentType.CONVERSATION]: 0,
      [ContentType.GENERAL]: 0,
    };
    
    // Check for specific indicators
    if (this.DOMAIN_INDICATORS.creative.some(word => prompt.includes(word))) {
      typeScores[ContentType.CREATIVE] += 3;
    }
    if (this.DOMAIN_INDICATORS.analysis.some(word => prompt.includes(word))) {
      typeScores[ContentType.ANALYSIS] += 3;
    }
    if (this.DOMAIN_INDICATORS.research.some(word => prompt.includes(word))) {
      typeScores[ContentType.RESEARCH] += 3;
    }
    if (this.DOMAIN_INDICATORS.translation.some(word => prompt.includes(word))) {
      typeScores[ContentType.TRANSLATION] += 3;
    }
    if (this.DOMAIN_INDICATORS.summarization.some(word => prompt.includes(word))) {
      typeScores[ContentType.SUMMARIZATION] += 3;
    }
    if (this.DOMAIN_INDICATORS.conversation.some(word => prompt.includes(word))) {
      typeScores[ContentType.CONVERSATION] += 2;
    }
    
    // Find highest scoring type
    let maxScore = 0;
    let selectedType = ContentType.GENERAL;
    
    for (const [type, score] of Object.entries(typeScores)) {
      if (score > maxScore) {
        maxScore = score;
        selectedType = type as ContentType;
      }
    }
    
    return selectedType;
  }

  private static determineDomain(prompt: string): string | null {
    for (const [domain, indicators] of Object.entries(this.DOMAIN_INDICATORS)) {
      if (indicators.some(word => prompt.includes(word))) {
        return domain;
      }
    }
    return null;
  }

  private static calculateComplexity(wordCount: number, hasCode: boolean, techStackCount: number): ComplexityLevel {
    let score = 0;
    
    // Word count factor
    if (wordCount > 500) score += 3;
    else if (wordCount > 200) score += 2;
    else if (wordCount > 100) score += 1;
    
    // Code factor
    if (hasCode) score += 2;
    
    // Tech stack factor
    score += techStackCount;
    
    // Determine complexity level
    if (score >= 6) return ComplexityLevel.EXPERT;
    if (score >= 4) return ComplexityLevel.COMPLEX;
    if (score >= 2) return ComplexityLevel.MODERATE;
    return ComplexityLevel.SIMPLE;
  }

  private static determineRequiredFeatures(prompt: string, files?: any[]): string[] {
    const features: string[] = [];
    
    // Check for image requirements
    if (files?.some(f => f.type?.startsWith('image/')) || prompt.includes('image') || prompt.includes('picture')) {
      features.push('vision');
    }
    
    // Check for tool usage
    if (prompt.includes('search') || prompt.includes('browse') || prompt.includes('web')) {
      features.push('web_search');
    }
    
    // Check for code execution
    if (prompt.includes('run') || prompt.includes('execute') || prompt.includes('test')) {
      features.push('code_execution');
    }
    
    // Check for reasoning
    if (prompt.includes('explain') || prompt.includes('why') || prompt.includes('how')) {
      features.push('reasoning');
    }
    
    // Check for math
    if (/\d+[\+\-\*\/]\d+/.test(prompt) || prompt.includes('calculate') || prompt.includes('math')) {
      features.push('math');
    }
    
    return features;
  }

  private static calculateMinContextWindow(estimatedTokens: number, files?: any[]): number {
    let minWindow = 4096; // Base minimum
    
    // Add file content estimation
    if (files?.length) {
      minWindow += files.length * 1000; // Rough estimation
    }
    
    // Add prompt tokens with buffer
    minWindow = Math.max(minWindow, estimatedTokens * 3);
    
    // Round up to standard window sizes
    if (minWindow > 128000) return 200000;
    if (minWindow > 32000) return 128000;
    if (minWindow > 16000) return 32000;
    if (minWindow > 8000) return 16000;
    if (minWindow > 4000) return 8192;
    return 4096;
  }

  private static calculateAccuracyNeeded(contentType: ContentType, domain: string | null): number {
    // Higher accuracy for code and analysis
    if (contentType === ContentType.CODE) return 0.9;
    if (contentType === ContentType.ANALYSIS) return 0.85;
    if (contentType === ContentType.RESEARCH) return 0.8;
    if (domain === 'coding') return 0.85;
    
    // Medium accuracy for factual content
    if (contentType === ContentType.SUMMARIZATION) return 0.7;
    if (contentType === ContentType.TRANSLATION) return 0.75;
    
    // Lower accuracy acceptable for creative
    if (contentType === ContentType.CREATIVE) return 0.5;
    if (contentType === ContentType.CONVERSATION) return 0.6;
    
    return 0.7; // Default
  }

  private static calculateCreativityNeeded(contentType: ContentType, domain: string | null): number {
    // High creativity for creative content
    if (contentType === ContentType.CREATIVE) return 0.9;
    if (domain === 'creative') return 0.85;
    
    // Medium creativity for conversation
    if (contentType === ContentType.CONVERSATION) return 0.6;
    
    // Low creativity for factual content
    if (contentType === ContentType.CODE) return 0.3;
    if (contentType === ContentType.ANALYSIS) return 0.3;
    if (contentType === ContentType.RESEARCH) return 0.2;
    if (contentType === ContentType.TRANSLATION) return 0.2;
    
    return 0.5; // Default
  }

  private static calculateSpeedPriority(prompt: string): number {
    // High speed priority for simple queries
    if (prompt.includes('quick') || prompt.includes('fast') || prompt.includes('briefly')) {
      return 0.8;
    }
    
    // Low speed priority for complex analysis
    if (prompt.includes('detailed') || prompt.includes('comprehensive') || prompt.includes('thorough')) {
      return 0.3;
    }
    
    return 0.5; // Default medium priority
  }

  private static calculateBudgetSensitivity(prompt: string): number {
    // Check for budget indicators
    if (prompt.includes('cheap') || prompt.includes('budget') || prompt.includes('economical')) {
      return 0.9;
    }
    
    if (prompt.includes('best') || prompt.includes('highest quality') || prompt.includes('most accurate')) {
      return 0.2;
    }
    
    return 0.5; // Default medium sensitivity
  }

  private static calculateQualityThreshold(contentType: ContentType, domain: string | null): number {
    // High quality threshold for critical tasks
    if (contentType === ContentType.CODE) return 0.8;
    if (contentType === ContentType.ANALYSIS) return 0.75;
    if (contentType === ContentType.RESEARCH) return 0.75;
    if (domain === 'coding') return 0.8;
    
    // Medium quality threshold
    if (contentType === ContentType.TRANSLATION) return 0.7;
    if (contentType === ContentType.SUMMARIZATION) return 0.65;
    
    // Lower threshold acceptable for casual content
    if (contentType === ContentType.CONVERSATION) return 0.5;
    if (contentType === ContentType.CREATIVE) return 0.5;
    
    return 0.6; // Default
  }

  private static determineCapabilities(features: string[], contentType: ContentType): string[] {
    const capabilities: string[] = [];
    
    // Add feature-based capabilities
    if (features.includes('vision')) capabilities.push('image_understanding');
    if (features.includes('web_search')) capabilities.push('web_browsing');
    if (features.includes('code_execution')) capabilities.push('code_interpreter');
    if (features.includes('reasoning')) capabilities.push('chain_of_thought');
    if (features.includes('math')) capabilities.push('mathematical_reasoning');
    
    // Add content-based capabilities
    if (contentType === ContentType.CODE) {
      capabilities.push('code_generation', 'syntax_highlighting');
    }
    if (contentType === ContentType.CREATIVE) {
      capabilities.push('creative_writing');
    }
    if (contentType === ContentType.ANALYSIS) {
      capabilities.push('data_analysis');
    }
    
    return capabilities;
  }

  private static detectLanguage(text: string): string {
    // Simple language detection based on common patterns
    // In production, you'd use a proper language detection library
    
    const languagePatterns = {
      es: /\b(el|la|los|las|un|una|es|está|son|como|pero|para)\b/gi,
      fr: /\b(le|la|les|un|une|est|sont|comme|mais|pour|avec)\b/gi,
      de: /\b(der|die|das|ein|eine|ist|sind|wie|aber|für|mit)\b/gi,
      it: /\b(il|la|le|un|una|è|sono|come|ma|per|con)\b/gi,
      pt: /\b(o|a|os|as|um|uma|é|são|como|mas|para|com)\b/gi,
      zh: /[\u4e00-\u9fa5]/,
      ja: /[\u3040-\u309f\u30a0-\u30ff]/,
      ko: /[\uac00-\ud7af]/,
      ar: /[\u0600-\u06ff]/,
      ru: /[\u0400-\u04ff]/,
    };
    
    for (const [lang, pattern] of Object.entries(languagePatterns)) {
      const matches = text.match(pattern);
      if (matches && matches.length > 3) {
        return lang;
      }
    }
    
    return 'en'; // Default to English
  }
}