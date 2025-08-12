import { BaseNormalizer } from './base.normalizer';
import { 
  UnifiedUsageMetrics, 
  RawProviderData, 
  NormalizeOptions,
  ProviderSpecificMetrics 
} from '../../models/unified.model';

// Provider-specific normalizers
class OpenAINormalizer extends BaseNormalizer {
  async normalize(
    rawData: RawProviderData,
    options: NormalizeOptions
  ): Promise<UnifiedUsageMetrics[]> {
    const metrics: UnifiedUsageMetrics[] = [];
    const dailyCosts = rawData.raw?.usage?.daily_costs || [];
    
    for (const day of dailyCosts) {
      const date = new Date(day.timestamp);
      
      // Process each model's usage
      for (const [modelName, modelData] of Object.entries(day.line_items || {})) {
        const data = modelData as any;
        
        const metric = this.createUnifiedMetric(
          'openai',
          options.organizationId,
          date,
          {
            model: modelName,
            prompt_tokens: data.n_context_tokens_total || data.prompt_tokens || 0,
            completion_tokens: data.n_generated_tokens_total || data.completion_tokens || 0,
            requests: data.n_requests || 0,
            cost: data.cost || 0,
            userId: data.user_id
          }
        );
        
        metrics.push(metric);
      }
    }
    
    return metrics;
  }
  
  extractProviderSpecific(rawData: RawProviderData): ProviderSpecificMetrics[] {
    const specificMetrics: ProviderSpecificMetrics[] = [];
    const dailyCosts = rawData.raw?.usage?.daily_costs || [];
    
    for (const day of dailyCosts) {
      const specific: ProviderSpecificMetrics = {
        openai: {}
      };
      
      // Extract fine-tuning tokens
      if (day.ft_tokens) {
        specific.openai!.fineTuningTokens = day.ft_tokens;
      }
      
      // Extract embedding dimensions
      if (day.embedding_models) {
        specific.openai!.embeddingDimensions = day.embedding_models.dimensions || 0;
      }
      
      // Extract DALL-E image generations
      if (day.dalle_api_data) {
        specific.openai!.imageGenerations = day.dalle_api_data.num_images || 0;
      }
      
      // Extract Whisper audio minutes
      if (day.whisper_api_data?.num_seconds) {
        specific.openai!.audioMinutes = day.whisper_api_data.num_seconds / 60;
      }
      
      // Extract moderation flags
      if (day.moderation_data) {
        specific.openai!.moderationFlags = day.moderation_data.flagged_count || 0;
      }
      
      // Extract batch API usage
      if (day.batch_api_data) {
        specific.openai!.batchApiUsage = {
          jobsCreated: day.batch_api_data.jobs_created || 0,
          jobsCompleted: day.batch_api_data.jobs_completed || 0
        };
      }
      
      if (Object.keys(specific.openai!).length > 0) {
        specificMetrics.push(specific);
      }
    }
    
    return specificMetrics;
  }
}

class AnthropicNormalizer extends BaseNormalizer {
  async normalize(
    rawData: RawProviderData,
    options: NormalizeOptions
  ): Promise<UnifiedUsageMetrics[]> {
    const metrics: UnifiedUsageMetrics[] = [];
    const usageData = rawData.raw?.usage?.data || [];
    
    for (const item of usageData) {
      const metric = this.createUnifiedMetric(
        'anthropic',
        options.organizationId,
        new Date(item.timestamp),
        {
          model: item.model,
          input_tokens: item.input_tokens || 0,
          output_tokens: item.output_tokens || 0,
          requests: item.request_count || 1,
          cost: item.cost_usd || 0,
          userId: item.user_id
        }
      );
      
      metrics.push(metric);
    }
    
    return metrics;
  }
  
  extractProviderSpecific(rawData: RawProviderData): ProviderSpecificMetrics[] {
    const specificMetrics: ProviderSpecificMetrics[] = [];
    const usageData = rawData.raw?.usage?.data || [];
    
    // Aggregate metrics across all usage data
    let totalContextWindowUsage = 0;
    let cacheHits = 0;
    let cacheMisses = 0;
    let constitutionalAIFlags = 0;
    
    for (const item of usageData) {
      if (item.context_window_usage) {
        totalContextWindowUsage += item.context_window_usage;
      }
      if (item.cache_read_tokens > 0) {
        cacheHits++;
      } else if (item.cache_eligible && !item.cache_read_tokens) {
        cacheMisses++;
      }
      if (item.constitutional_ai_triggered) {
        constitutionalAIFlags++;
      }
    }
    
    // Calculate rate limit utilization
    const rateLimitUtilization = rawData.raw?.rateLimit?.tokensRemaining
      ? 1 - (parseInt(rawData.raw.rateLimit.tokensRemaining) / 1000000)
      : 0;
    
    if (usageData.length > 0) {
      specificMetrics.push({
        anthropic: {
          contextWindowUsage: totalContextWindowUsage,
          cacheHits,
          cacheMisses,
          constitutionalAIFlags,
          rateLimitUtilization
        }
      });
    }
    
    return specificMetrics;
  }
}

class GoogleNormalizer extends BaseNormalizer {
  async normalize(
    rawData: RawProviderData,
    options: NormalizeOptions
  ): Promise<UnifiedUsageMetrics[]> {
    const metrics: UnifiedUsageMetrics[] = [];
    const usageData = rawData.raw?.usage || [];
    
    for (const item of usageData) {
      const metric = this.createUnifiedMetric(
        'google',
        options.organizationId,
        new Date(item.timestamp),
        {
          model: item.model || 'gemini-pro',
          characters: item.total_characters || item.characters || 0,
          requests: item.request_count || 1,
          cost: item.cost_usd || 0,
          userId: item.user_id
        }
      );
      
      metrics.push(metric);
    }
    
    return metrics;
  }
  
  extractProviderSpecific(rawData: RawProviderData): ProviderSpecificMetrics[] {
    const specificMetrics: ProviderSpecificMetrics[] = [];
    const usageData = rawData.raw?.usage || [];
    
    let totalCharacters = 0;
    let quotaConsumption = 0;
    const multimodalInputs = { images: 0, videos: 0, audio: 0 };
    
    for (const item of usageData) {
      totalCharacters += item.total_characters || item.characters || 0;
      
      if (item.quota_consumption_percent) {
        quotaConsumption = Math.max(quotaConsumption, item.quota_consumption_percent);
      }
      
      if (item.multimodal_inputs) {
        multimodalInputs.images += item.multimodal_inputs.images || 0;
        multimodalInputs.videos += item.multimodal_inputs.videos || 0;
        multimodalInputs.audio += item.multimodal_inputs.audio || 0;
      }
    }
    
    if (usageData.length > 0) {
      specificMetrics.push({
        google: {
          characterCount: totalCharacters,
          quotaConsumptionPercent: quotaConsumption,
          multimodalInputs: multimodalInputs.images > 0 || multimodalInputs.videos > 0 || multimodalInputs.audio > 0
            ? multimodalInputs
            : undefined
        }
      });
    }
    
    return specificMetrics;
  }
}

class XAINormalizer extends BaseNormalizer {
  async normalize(
    rawData: RawProviderData,
    options: NormalizeOptions
  ): Promise<UnifiedUsageMetrics[]> {
    const metrics: UnifiedUsageMetrics[] = [];
    const usageData = rawData.raw?.usage || [];
    
    for (const item of usageData) {
      const metric = this.createUnifiedMetric(
        'xai',
        options.organizationId,
        new Date(item.timestamp),
        {
          model: item.model || 'grok-1',
          prompt_tokens: item.prompt_tokens || 0,
          completion_tokens: item.completion_tokens || 0,
          total_tokens: item.total_tokens || 0,
          requests: item.request_count || 1,
          cost: item.cost_usd || 0,
          userId: item.user_id
        }
      );
      
      metrics.push(metric);
    }
    
    return metrics;
  }
  
  extractProviderSpecific(rawData: RawProviderData): ProviderSpecificMetrics[] {
    const specificMetrics: ProviderSpecificMetrics[] = [];
    const usageData = rawData.raw?.usage || [];
    
    const latencyMetrics = { p50: 0, p95: 0, p99: 0 };
    let priorityQueueUsage = false;
    const betaFeatures: Set<string> = new Set();
    
    for (const item of usageData) {
      if (item.latency_ms) {
        // Simplified latency tracking - in production, use proper percentile calculation
        latencyMetrics.p50 = Math.max(latencyMetrics.p50, item.latency_ms);
        latencyMetrics.p95 = Math.max(latencyMetrics.p95, item.latency_ms * 1.5);
        latencyMetrics.p99 = Math.max(latencyMetrics.p99, item.latency_ms * 2);
      }
      
      if (item.priority_queue) {
        priorityQueueUsage = true;
      }
      
      if (item.beta_features) {
        item.beta_features.forEach((feature: string) => betaFeatures.add(feature));
      }
    }
    
    if (usageData.length > 0) {
      specificMetrics.push({
        xai: {
          priorityQueueUsage,
          latencyMetrics,
          betaFeatures: betaFeatures.size > 0 ? Array.from(betaFeatures) : undefined
        }
      });
    }
    
    return specificMetrics;
  }
}

// Main unified normalizer
export class UnifiedNormalizer {
  private normalizers: Map<string, BaseNormalizer>;
  
  constructor() {
    this.normalizers = new Map([
      ['openai', new OpenAINormalizer()],
      ['anthropic', new AnthropicNormalizer()],
      ['google', new GoogleNormalizer()],
      ['xai', new XAINormalizer()]
    ]);
  }
  
  async normalizeProviderData(
    provider: string,
    rawData: RawProviderData,
    options: NormalizeOptions
  ): Promise<{
    unified: UnifiedUsageMetrics[];
    specific: ProviderSpecificMetrics[];
  }> {
    const normalizer = this.normalizers.get(provider);
    if (!normalizer) {
      throw new Error(`No normalizer found for provider: ${provider}`);
    }
    
    // Get unified metrics
    const unified = await normalizer.normalize(rawData, options);
    
    // Extract provider-specific metrics
    const specific = normalizer.extractProviderSpecific(rawData);
    
    // Link specific metrics to unified metrics
    if (unified.length > 0 && specific.length > 0) {
      for (let i = 0; i < Math.min(unified.length, specific.length); i++) {
        specific[i].unifiedMetricId = unified[i].id;
      }
    }
    
    return { unified, specific };
  }
  
  async normalizeMultipleProviders(
    data: Array<{ provider: string; rawData: RawProviderData }>,
    options: NormalizeOptions
  ): Promise<{
    unified: UnifiedUsageMetrics[];
    specific: ProviderSpecificMetrics[];
  }> {
    const allUnified: UnifiedUsageMetrics[] = [];
    const allSpecific: ProviderSpecificMetrics[] = [];
    
    for (const { provider, rawData } of data) {
      const { unified, specific } = await this.normalizeProviderData(
        provider,
        rawData,
        options
      );
      
      allUnified.push(...unified);
      allSpecific.push(...specific);
    }
    
    // Sort by timestamp
    allUnified.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return {
      unified: allUnified,
      specific: allSpecific
    };
  }
}