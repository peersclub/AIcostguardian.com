import { 
  UnifiedUsageMetrics, 
  RawProviderData, 
  NormalizeOptions,
  ProviderSpecificMetrics 
} from '../../models/unified.model';
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseNormalizer {
  abstract normalize(
    rawData: RawProviderData,
    options: NormalizeOptions
  ): Promise<UnifiedUsageMetrics[]>;
  
  abstract extractProviderSpecific(
    rawData: RawProviderData
  ): ProviderSpecificMetrics[];
  
  protected convertToUnifiedTokens(
    provider: string,
    input: any
  ): { input: number; output: number; total: number } {
    switch (provider) {
      case 'openai':
        return {
          input: input.prompt_tokens || input.promptTokens || 0,
          output: input.completion_tokens || input.completionTokens || 0,
          total: (input.prompt_tokens || input.promptTokens || 0) + 
                 (input.completion_tokens || input.completionTokens || 0)
        };
      
      case 'anthropic':
        return {
          input: input.input_tokens || 0,
          output: input.output_tokens || 0,
          total: (input.input_tokens || 0) + (input.output_tokens || 0)
        };
      
      case 'google':
        // Gemini uses characters - convert to approximate tokens (1 token ≈ 4 characters)
        const totalCharacters = input.characters || input.totalCharacters || 0;
        const tokens = Math.ceil(totalCharacters / 4);
        return {
          input: Math.ceil(tokens * 0.6),  // Approximate 60% input
          output: Math.ceil(tokens * 0.4), // Approximate 40% output
          total: tokens
        };
      
      case 'xai':
        return {
          input: input.prompt_tokens || 0,
          output: input.completion_tokens || 0,
          total: input.total_tokens || 
                 (input.prompt_tokens || 0) + (input.completion_tokens || 0)
        };
      
      default:
        return { input: 0, output: 0, total: 0 };
    }
  }
  
  protected normalizeModelName(provider: string, model: string): {
    name: string;
    family: string;
    category: 'text' | 'vision' | 'embedding' | 'audio' | 'image';
    version?: string;
  } {
    const modelMappings: Record<string, Record<string, any>> = {
      openai: {
        'gpt-4-turbo-preview': { family: 'gpt-4', category: 'text', version: 'turbo' },
        'gpt-4-turbo': { family: 'gpt-4', category: 'text', version: 'turbo' },
        'gpt-4-1106-preview': { family: 'gpt-4', category: 'text', version: '1106' },
        'gpt-4-vision-preview': { family: 'gpt-4', category: 'vision', version: 'vision' },
        'gpt-4': { family: 'gpt-4', category: 'text' },
        'gpt-4-32k': { family: 'gpt-4', category: 'text', version: '32k' },
        'gpt-3.5-turbo': { family: 'gpt-3.5', category: 'text' },
        'gpt-3.5-turbo-16k': { family: 'gpt-3.5', category: 'text', version: '16k' },
        'dall-e-3': { family: 'dall-e', category: 'image', version: '3' },
        'dall-e-2': { family: 'dall-e', category: 'image', version: '2' },
        'whisper-1': { family: 'whisper', category: 'audio' },
        'text-embedding-ada-002': { family: 'embedding', category: 'embedding' },
        'text-embedding-3-small': { family: 'embedding', category: 'embedding', version: '3-small' },
        'text-embedding-3-large': { family: 'embedding', category: 'embedding', version: '3-large' }
      },
      anthropic: {
        'claude-3-opus-20240229': { family: 'claude-3', category: 'text', version: 'opus' },
        'claude-3-sonnet-20240229': { family: 'claude-3', category: 'text', version: 'sonnet' },
        'claude-3-haiku-20240307': { family: 'claude-3', category: 'text', version: 'haiku' },
        'claude-2.1': { family: 'claude-2', category: 'text', version: '2.1' },
        'claude-2.0': { family: 'claude-2', category: 'text', version: '2.0' },
        'claude-instant-1.2': { family: 'claude-instant', category: 'text', version: '1.2' }
      },
      google: {
        'gemini-pro': { family: 'gemini', category: 'text', version: 'pro' },
        'gemini-pro-vision': { family: 'gemini', category: 'vision', version: 'pro' },
        'gemini-ultra': { family: 'gemini', category: 'text', version: 'ultra' },
        'gemini-1.5-pro': { family: 'gemini', category: 'text', version: '1.5-pro' },
        'gemini-1.5-flash': { family: 'gemini', category: 'text', version: '1.5-flash' },
        'palm-2': { family: 'palm', category: 'text', version: '2' }
      },
      xai: {
        'grok-1': { family: 'grok', category: 'text', version: '1' },
        'grok-2': { family: 'grok', category: 'text', version: '2' },
        'grok-2-mini': { family: 'grok', category: 'text', version: '2-mini' }
      }
    };
    
    // Try exact match first
    const exactMatch = modelMappings[provider]?.[model];
    if (exactMatch) {
      return {
        name: model,
        ...exactMatch
      };
    }
    
    // Try to find partial match
    const providerMappings = modelMappings[provider] || {};
    for (const [key, value] of Object.entries(providerMappings)) {
      if (model.includes(key) || key.includes(model)) {
        return {
          name: model,
          ...value
        };
      }
    }
    
    // Default fallback
    return {
      name: model,
      family: 'unknown',
      category: 'text'
    };
  }
  
  protected async convertCurrency(
    amount: number,
    from: string,
    to: string = 'USD'
  ): Promise<number> {
    if (from === to) return amount;
    
    // TODO: Implement real currency conversion using exchange rate API
    // For now, we'll use static rates as an example
    const rates: Record<string, number> = {
      'EUR': 1.08,
      'GBP': 1.27,
      'JPY': 0.0067,
      'CNY': 0.14
    };
    
    if (from === 'USD') {
      return amount / (rates[to] || 1);
    } else if (to === 'USD') {
      return amount * (rates[from] || 1);
    } else {
      // Convert through USD
      const usd = amount * (rates[from] || 1);
      return usd / (rates[to] || 1);
    }
  }
  
  protected calculateCost(
    provider: string,
    model: string,
    tokens: { input: number; output: number }
  ): number {
    // Pricing per 1K tokens (in USD)
    const pricing: Record<string, Record<string, { input: number; output: number }>> = {
      openai: {
        'gpt-4-turbo': { input: 0.01, output: 0.03 },
        'gpt-4': { input: 0.03, output: 0.06 },
        'gpt-4-32k': { input: 0.06, output: 0.12 },
        'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
        'gpt-3.5-turbo-16k': { input: 0.003, output: 0.004 }
      },
      anthropic: {
        'claude-3-opus': { input: 0.015, output: 0.075 },
        'claude-3-sonnet': { input: 0.003, output: 0.015 },
        'claude-3-haiku': { input: 0.00025, output: 0.00125 },
        'claude-2.1': { input: 0.008, output: 0.024 },
        'claude-instant': { input: 0.0008, output: 0.0024 }
      },
      google: {
        'gemini-pro': { input: 0.00025, output: 0.0005 },
        'gemini-1.5-pro': { input: 0.0035, output: 0.0105 },
        'gemini-1.5-flash': { input: 0.00035, output: 0.00105 },
        'gemini-ultra': { input: 0.007, output: 0.021 }
      },
      xai: {
        'grok-1': { input: 0.005, output: 0.015 },
        'grok-2': { input: 0.01, output: 0.03 },
        'grok-2-mini': { input: 0.002, output: 0.006 }
      }
    };
    
    // Find pricing for model
    let modelPricing = { input: 0, output: 0 };
    const providerPricing = pricing[provider] || {};
    
    // Try exact match
    if (providerPricing[model]) {
      modelPricing = providerPricing[model];
    } else {
      // Try to find partial match
      for (const [key, value] of Object.entries(providerPricing)) {
        if (model.includes(key) || key.includes(model)) {
          modelPricing = value;
          break;
        }
      }
    }
    
    // Calculate cost
    const inputCost = (tokens.input / 1000) * modelPricing.input;
    const outputCost = (tokens.output / 1000) * modelPricing.output;
    
    return inputCost + outputCost;
  }
  
  protected generateMetricId(): string {
    return uuidv4();
  }
  
  protected determineAggregationLevel(
    startTime: Date,
    endTime: Date
  ): 'raw' | 'minute' | 'hour' | 'day' | 'month' {
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    const diffHours = diffMinutes / 60;
    const diffDays = diffHours / 24;
    
    if (diffMinutes < 1) return 'raw';
    if (diffMinutes < 60) return 'minute';
    if (diffHours < 24) return 'hour';
    if (diffDays < 31) return 'day';
    return 'month';
  }
  
  protected createUnifiedMetric(
    provider: string,
    organizationId: string,
    timestamp: Date,
    data: any
  ): UnifiedUsageMetrics {
    const tokens = this.convertToUnifiedTokens(provider, data);
    const modelInfo = this.normalizeModelName(provider, data.model || 'unknown');
    const cost = data.cost || this.calculateCost(provider, modelInfo.name, tokens);
    
    return {
      id: this.generateMetricId(),
      timestamp,
      provider: provider as any,
      organizationId,
      userId: data.userId,
      usage: {
        tokens,
        requests: {
          successful: data.successful_requests || data.requests || 1,
          failed: data.failed_requests || 0,
          total: (data.successful_requests || data.requests || 1) + (data.failed_requests || 0)
        },
        cost: {
          amount: cost,
          currency: 'USD',
          breakdown: data.cost_breakdown
        }
      },
      aggregation: {
        level: 'raw',
        periodStart: timestamp,
        periodEnd: timestamp
      },
      model: modelInfo
    };
  }
}