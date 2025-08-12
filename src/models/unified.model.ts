// Unified data structure that ALL providers will be normalized to
export interface UnifiedUsageMetrics {
  // Core Identifiers
  id: string;
  timestamp: Date;
  provider: 'openai' | 'anthropic' | 'google' | 'xai';
  organizationId: string;
  userId?: string;
  
  // Unified Metrics (available from ALL providers)
  usage: {
    tokens: {
      input: number;      // Normalized from prompt/input/request tokens
      output: number;     // Normalized from completion/output/response tokens
      total: number;      // Sum of input + output
    };
    requests: {
      successful: number;
      failed: number;
      total: number;
    };
    cost: {
      amount: number;     // USD normalized
      currency: 'USD';    // Always converted to USD
      breakdown?: {
        compute: number;
        storage?: number;
        transfer?: number;
      };
    };
  };
  
  // Time-based Aggregations
  aggregation: {
    level: 'minute' | 'hour' | 'day' | 'month' | 'raw';
    periodStart: Date;
    periodEnd: Date;
  };
  
  // Model Information (normalized)
  model: {
    name: string;        // Normalized model name
    family: string;      // gpt-4, claude-3, gemini-pro, grok
    version?: string;
    category: 'text' | 'vision' | 'embedding' | 'audio' | 'image';
  };
}

// Provider-specific data that doesn't map to unified structure
export interface ProviderSpecificMetrics {
  unifiedMetricId?: string;
  
  openai?: {
    fineTuningTokens?: number;
    embeddingDimensions?: number;
    imageGenerations?: number;
    audioMinutes?: number;
    moderationFlags?: number;
    batchApiUsage?: {
      jobsCreated: number;
      jobsCompleted: number;
    };
  };
  
  anthropic?: {
    contextWindowUsage: number;
    cacheHits?: number;
    cacheMisses?: number;
    constitutionalAIFlags?: number;
    rateLimitUtilization: number;
  };
  
  google?: {
    characterCount: number;    // Gemini uses characters, not tokens
    quotaConsumptionPercent: number;
    vertexAIFeatures?: {
      autoMLUsage?: boolean;
      pipelineRuns?: number;
    };
    multimodalInputs?: {
      images: number;
      videos: number;
      audio: number;
    };
  };
  
  xai?: {
    priorityQueueUsage: boolean;
    latencyMetrics: {
      p50: number;
      p95: number;
      p99: number;
    };
    betaFeatures?: string[];
  };
}

// Raw provider data interfaces
export interface RawProviderData {
  provider: string;
  raw: any;
  fetchedAt: Date;
  dataDate: Date;
}

// Aggregated metrics
export interface AggregatedMetrics extends UnifiedUsageMetrics {
  count: number;  // Number of data points aggregated
  providers: string[];  // Providers included in aggregation
}

// Dashboard data structures
export interface UnifiedDashboardData {
  // Real-time possible (all providers have some form of recent data)
  currentDayUsage: {
    totalTokens: number;
    totalRequests: number;
    totalCost: number;
    byProvider: {
      [provider: string]: {
        tokens: number;
        requests: number;
        cost: number;
        lastUpdated: Date;  // Show freshness indicator
      };
    };
  };
  
  // Historical (aligned to daily for consistency)
  historicalTrends: {
    period: 'day' | 'week' | 'month';
    dataPoints: Array<{
      date: Date;
      tokens: number;
      requests: number;
      cost: number;
      breakdown: {
        [provider: string]: number;
      };
    }>;
  };
  
  // Cost optimization (unified view)
  costAnalysis: {
    totalSpend: number;
    projectedMonthly: number;
    savingsOpportunities: Array<{
      provider: string;
      currentModel: string;
      suggestedModel: string;
      potentialSavings: number;
    }>;
  };
}

// Data freshness indicators
export interface FreshnessIndicator {
  provider: string;
  lastSync: Date;
  nextSync: Date;
  status: 'LIVE' | 'RECENT' | 'DELAYED' | 'STALE';
  confidence: number;  // 0-1 score of data reliability
}

export interface FetchOptions {
  organizationId: string;
  startDate?: Date;
  endDate?: Date;
  includeSpecific?: boolean;
}

export interface NormalizeOptions {
  organizationId: string;
  preserveRaw?: boolean;
  calculateCost?: boolean;
}