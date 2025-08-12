import { BaseProviderFetcher, FetcherConfig } from './base.fetcher';
import { RawProviderData, FetchOptions } from '../../models/unified.model';

export class OpenAIFetcher extends BaseProviderFetcher {
  private readonly API_BASE = 'https://api.openai.com/v1';
  
  constructor() {
    super('openai', {
      rateLimit: {
        maxRequests: 100,
        windowMs: 60000  // 1 minute
      },
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2
      }
    });
  }
  
  async fetchUsageData(apiKey: string, options: FetchOptions): Promise<RawProviderData> {
    try {
      // OpenAI only provides previous day's data via /dashboard/billing/usage endpoint
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const startDate = yesterday.toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      // Fetch usage data
      const usageResponse = await fetch(
        `${this.API_BASE}/dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!usageResponse.ok) {
        const error = await usageResponse.text();
        throw new Error(`OpenAI API error: ${usageResponse.status} - ${error}`);
      }
      
      const usageData = await usageResponse.json();
      
      // Also fetch subscription info for quota limits
      const subscriptionResponse = await fetch(
        `${this.API_BASE}/dashboard/billing/subscription`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      let subscriptionData = null;
      if (subscriptionResponse.ok) {
        subscriptionData = await subscriptionResponse.json();
      }
      
      // Combine data
      const rawData = {
        usage: usageData,
        subscription: subscriptionData,
        metadata: {
          fetchedAt: new Date().toISOString(),
          dataDate: yesterday.toISOString(),
          provider: 'openai'
        }
      };
      
      return {
        provider: 'openai',
        raw: rawData,
        fetchedAt: new Date(),
        dataDate: yesterday
      };
    } catch (error) {
      await this.handleFetchError(error, options);
      throw error;
    }
  }
  
  validateResponse(data: any): boolean {
    // Validate OpenAI response structure
    return !!(
      data?.usage &&
      (data.usage?.daily_costs || data.usage?.total_usage !== undefined) &&
      data?.metadata?.provider === 'openai'
    );
  }
  
  getNextFetchTime(): Date {
    // Fetch at 2 AM UTC daily (after OpenAI updates their data)
    const next = new Date();
    next.setUTCHours(2, 0, 0, 0);
    if (next <= new Date()) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }
  
  // OpenAI-specific method to parse daily costs
  parseDailyCosts(rawData: any): Array<{
    date: string;
    models: Array<{
      name: string;
      usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
        requests: number;
      };
      cost: number;
    }>;
  }> {
    const dailyCosts = rawData.usage?.daily_costs || [];
    
    return dailyCosts.map((day: any) => {
      const models: any[] = [];
      
      // Parse each model's usage
      Object.entries(day.line_items || {}).forEach(([modelName, data]: [string, any]) => {
        models.push({
          name: modelName,
          usage: {
            prompt_tokens: data.prompt_tokens || 0,
            completion_tokens: data.completion_tokens || 0,
            total_tokens: (data.prompt_tokens || 0) + (data.completion_tokens || 0),
            requests: data.n_requests || 0
          },
          cost: data.cost || 0
        });
      });
      
      return {
        date: day.timestamp,
        models
      };
    });
  }
  
  // Extract OpenAI-specific metrics
  extractSpecificMetrics(rawData: any): any {
    const specificMetrics: any = {};
    
    if (rawData.usage?.daily_costs) {
      rawData.usage.daily_costs.forEach((day: any) => {
        // Extract fine-tuning usage
        if (day.ft_tokens) {
          specificMetrics.fineTuningTokens = day.ft_tokens;
        }
        
        // Extract embedding dimensions
        if (day.embedding_models) {
          specificMetrics.embeddingDimensions = day.embedding_models.dimensions || 0;
        }
        
        // Extract image generation count
        if (day.dalle_api_data) {
          specificMetrics.imageGenerations = day.dalle_api_data.num_images || 0;
        }
        
        // Extract audio minutes (Whisper)
        if (day.whisper_api_data) {
          specificMetrics.audioMinutes = day.whisper_api_data.num_seconds 
            ? day.whisper_api_data.num_seconds / 60 
            : 0;
        }
        
        // Extract moderation flags
        if (day.moderation_data) {
          specificMetrics.moderationFlags = day.moderation_data.flagged_count || 0;
        }
        
        // Extract batch API usage
        if (day.batch_api_data) {
          specificMetrics.batchApiUsage = {
            jobsCreated: day.batch_api_data.jobs_created || 0,
            jobsCompleted: day.batch_api_data.jobs_completed || 0
          };
        }
      });
    }
    
    return specificMetrics;
  }
}