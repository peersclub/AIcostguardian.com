// services/providers/openai.service.ts
// COMPLETE OPENAI IMPLEMENTATION

import OpenAI from 'openai';
import { Provider } from '@prisma/client';
import { 
  BaseProviderService, 
  TestResult, 
  UsageData, 
  CostBreakdown,
  ModelConfig 
} from './base-provider.service';

// OpenAI model configurations with pricing
const OPENAI_MODELS: ModelConfig[] = [
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    pricing: { input: 0.01, output: 0.03 }, // per 1K tokens
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    pricing: { input: 0.03, output: 0.06 },
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    pricing: { input: 0.0005, output: 0.0015 },
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    pricing: { input: 0.005, output: 0.015 },
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    pricing: { input: 0.00015, output: 0.0006 },
  },
];

export interface ChatCompletionRequest {
  model: string;
  messages: any[];
  temperature?: number;
  max_tokens?: number;
  userId: string;
  stream?: boolean;
}

export class OpenAIService extends BaseProviderService {
  protected provider = Provider.OPENAI;
  protected baseUrl = 'https://api.openai.com/v1';
  protected models = OPENAI_MODELS;
  
  async testConnection(apiKey: string): Promise<TestResult> {
    try {
      const client = new OpenAI({ apiKey });
      const models = await client.models.list();
      
      return {
        success: true,
        message: 'Connection successful',
        metadata: {
          modelsAvailable: models.data.length,
          models: models.data.map(m => m.id),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Connection failed',
        error: error,
      };
    }
  }
  
  async getUsage(apiKey: string, startDate: Date, endDate: Date): Promise<UsageData> {
    // Note: OpenAI doesn't provide a direct usage API endpoint
    // In production, you would track this through your own usage logs
    // or use the OpenAI dashboard API if available
    
    try {
      // For now, we'll aggregate from our own usage logs
      const usageLogs = await prisma.usageLog.findMany({
        where: {
          provider: Provider.OPENAI,
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
      });
      
      const totalTokens = usageLogs.reduce((sum, log) => sum + log.totalTokens, 0);
      const totalCost = usageLogs.reduce((sum, log) => sum + Number(log.cost), 0);
      
      const breakdown = usageLogs.reduce((acc, log) => {
        if (!acc[log.model]) {
          acc[log.model] = {
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            cost: 0,
            count: 0,
          };
        }
        
        acc[log.model].inputTokens += log.inputTokens;
        acc[log.model].outputTokens += log.outputTokens;
        acc[log.model].totalTokens += log.totalTokens;
        acc[log.model].cost += Number(log.cost);
        acc[log.model].count += 1;
        
        return acc;
      }, {} as any);
      
      return {
        totalTokens,
        totalCost,
        breakdown,
      };
    } catch (error) {
      console.error('Error fetching usage:', error);
      return {
        totalTokens: 0,
        totalCost: 0,
        breakdown: {},
      };
    }
  }
  
  async calculateCost(usage: any): Promise<CostBreakdown> {
    const model = usage.model || 'gpt-3.5-turbo';
    const pricing = this.models.find(m => m.id === model)?.pricing || 
                    this.models.find(m => m.id === 'gpt-3.5-turbo')!.pricing;
    
    const inputCost = (usage.inputTokens / 1000) * pricing.input;
    const outputCost = (usage.outputTokens / 1000) * pricing.output;
    
    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
      currency: 'USD',
    };
  }
  
  async makeRequest(apiKey: string, payload: ChatCompletionRequest): Promise<any> {
    const startTime = Date.now();
    const client = new OpenAI({ apiKey });
    
    try {
      const { userId, ...openaiPayload } = payload;
      
      const completion = await client.chat.completions.create(openaiPayload as any);
      
      // Track usage
      if (completion.usage) {
        const cost = await this.calculateCost({
          model: payload.model,
          inputTokens: completion.usage.prompt_tokens,
          outputTokens: completion.usage.completion_tokens,
        });
        
        await this.trackUsage(
          userId,
          {
            model: payload.model,
            inputTokens: completion.usage.prompt_tokens || 0,
            outputTokens: completion.usage.completion_tokens || 0,
            totalTokens: completion.usage.total_tokens || 0,
          },
          cost.totalCost
        );
      }
      
      return completion;
      
    } catch (error: any) {
      // Log error
      await this.logError(payload.userId, error);
      throw error;
    }
  }
  
  private async logError(userId: string, error: any) {
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'API_ERROR',
        resource: 'openai',
        metadata: {
          error: error.message,
          code: error.code,
          type: error.type,
        },
      },
    });
  }
  
  // Additional helper methods
  async createEmbedding(apiKey: string, input: string | string[], model = 'text-embedding-ada-002') {
    const client = new OpenAI({ apiKey });
    
    try {
      const response = await client.embeddings.create({
        model,
        input,
      });
      
      return response;
    } catch (error) {
      console.error('Error creating embedding:', error);
      throw error;
    }
  }
  
  async createImage(apiKey: string, prompt: string, options?: any) {
    const client = new OpenAI({ apiKey });
    
    try {
      const response = await client.images.generate({
        prompt,
        ...options,
      });
      
      return response;
    } catch (error) {
      console.error('Error creating image:', error);
      throw error;
    }
  }
  
  async moderateContent(apiKey: string, input: string) {
    const client = new OpenAI({ apiKey });
    
    try {
      const response = await client.moderations.create({
        input,
      });
      
      return response;
    } catch (error) {
      console.error('Error moderating content:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();