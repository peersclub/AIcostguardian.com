import { BaseProviderFetcher } from './base.fetcher';
import { RawProviderData, FetchOptions } from '../../models/unified.model';

export class AnthropicFetcher extends BaseProviderFetcher {
  private readonly API_BASE = 'https://api.anthropic.com/v1';
  
  constructor() {
    super('anthropic', {
      rateLimit: {
        maxRequests: 200,
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
      // Anthropic provides near real-time usage data
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      // Fetch usage data (Note: This is a hypothetical endpoint structure)
      // Actual Anthropic API endpoints may differ
      const response = await fetch(
        `${this.API_BASE}/organizations/usage`,
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Anthropic API error: ${response.status} - ${error}`);
      }
      
      const usageData = await response.json();
      
      // Also fetch rate limit information
      const rateLimitInfo = {
        tokensRemaining: response.headers.get('x-ratelimit-tokens-remaining'),
        requestsRemaining: response.headers.get('x-ratelimit-requests-remaining'),
        resetTime: response.headers.get('x-ratelimit-reset')
      };
      
      const rawData = {
        usage: usageData,
        rateLimit: rateLimitInfo,
        metadata: {
          fetchedAt: now.toISOString(),
          dataDate: fiveMinutesAgo.toISOString(),
          provider: 'anthropic',
          delay: '5_minutes'  // Indicate 5-minute delay
        }
      };
      
      return {
        provider: 'anthropic',
        raw: rawData,
        fetchedAt: now,
        dataDate: fiveMinutesAgo
      };
    } catch (error) {
      await this.handleFetchError(error, options);
      throw error;
    }
  }
  
  validateResponse(data: any): boolean {
    // Validate Anthropic response structure
    return !!(
      data?.usage &&
      data?.metadata?.provider === 'anthropic'
    );
  }
  
  getNextFetchTime(): Date {
    // Fetch every 5 minutes for near real-time data
    const next = new Date();
    next.setMinutes(next.getMinutes() + 5);
    return next;
  }
  
  // Parse Anthropic usage data
  parseUsageData(rawData: any): Array<{
    timestamp: string;
    model: string;
    usage: {
      input_tokens: number;
      output_tokens: number;
      total_tokens: number;
      requests: number;
      cache_read_tokens?: number;
      cache_write_tokens?: number;
    };
    cost: number;
    context_window_usage?: number;
  }> {
    const usageData = rawData.usage?.data || [];
    
    return usageData.map((item: any) => ({
      timestamp: item.timestamp,
      model: item.model,
      usage: {
        input_tokens: item.input_tokens || 0,
        output_tokens: item.output_tokens || 0,
        total_tokens: (item.input_tokens || 0) + (item.output_tokens || 0),
        requests: item.request_count || 0,
        cache_read_tokens: item.cache_read_tokens,
        cache_write_tokens: item.cache_write_tokens
      },
      cost: item.cost_usd || 0,
      context_window_usage: item.context_window_usage
    }));
  }
  
  // Extract Anthropic-specific metrics
  extractSpecificMetrics(rawData: any): any {
    const specificMetrics: any = {
      anthropic: {}
    };
    
    const usageData = rawData.usage?.data || [];
    
    // Aggregate specific metrics
    let totalContextWindowUsage = 0;
    let cacheHits = 0;
    let cacheMisses = 0;
    let constitutionalAIFlags = 0;
    
    usageData.forEach((item: any) => {
      // Context window usage
      if (item.context_window_usage) {
        totalContextWindowUsage += item.context_window_usage;
      }
      
      // Cache metrics
      if (item.cache_read_tokens > 0) {
        cacheHits++;
      } else if (item.cache_eligible && !item.cache_read_tokens) {
        cacheMisses++;
      }
      
      // Constitutional AI flags
      if (item.constitutional_ai_triggered) {
        constitutionalAIFlags++;
      }
    });
    
    // Calculate rate limit utilization
    const rateLimitUtilization = rawData.rateLimit ? 
      1 - (parseInt(rawData.rateLimit.tokensRemaining || '0') / 1000000) : // Assume 1M token limit
      0;
    
    specificMetrics.anthropic = {
      contextWindowUsage: totalContextWindowUsage,
      cacheHits,
      cacheMisses,
      constitutionalAIFlags,
      rateLimitUtilization
    };
    
    return specificMetrics;
  }
  
  // Get real-time status
  async getRealTimeStatus(apiKey: string): Promise<{
    isHealthy: boolean;
    latency: number;
    rateLimitStatus: any;
  }> {
    const startTime = Date.now();
    
    try {
      // Make a lightweight API call to check status
      const response = await fetch(
        `${this.API_BASE}/models`,
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          }
        }
      );
      
      const latency = Date.now() - startTime;
      
      return {
        isHealthy: response.ok,
        latency,
        rateLimitStatus: {
          tokensRemaining: response.headers.get('x-ratelimit-tokens-remaining'),
          requestsRemaining: response.headers.get('x-ratelimit-requests-remaining'),
          resetTime: response.headers.get('x-ratelimit-reset')
        }
      };
    } catch (error) {
      return {
        isHealthy: false,
        latency: Date.now() - startTime,
        rateLimitStatus: null
      };
    }
  }
}