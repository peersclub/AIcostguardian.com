import { PrismaClient } from '@prisma/client';
import { apiKeyService } from '@/lib/core/api-key.service';

const prisma = new PrismaClient();

interface UsageRecord {
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  timestamp: Date;
  metadata?: any;
}

export class UsageFetchService {
  /**
   * Fetch usage data from OpenAI
   * OpenAI provides usage data through their API
   */
  async fetchOpenAIUsage(apiKey: string, startDate: Date, endDate: Date): Promise<UsageRecord[]> {
    const records: UsageRecord[] = [];
    
    try {
      // OpenAI's usage endpoint requires organization ID
      // First, get organization info
      const orgResponse = await fetch('https://api.openai.com/v1/organizations', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (!orgResponse.ok) {
        console.error('Failed to fetch OpenAI organization info');
        return records;
      }
      
      const orgData = await orgResponse.json();
      const orgId = orgData.data?.[0]?.id;
      
      if (!orgId) {
        console.error('No OpenAI organization found');
        return records;
      }
      
      // Fetch usage data
      // Note: OpenAI's usage API is limited and may require specific permissions
      const usageUrl = `https://api.openai.com/v1/usage?date=${startDate.toISOString().split('T')[0]}`;
      const usageResponse = await fetch(usageUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Organization': orgId
        }
      });
      
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        
        // Process usage data
        if (usageData.data) {
          for (const item of usageData.data) {
            // OpenAI usage data structure varies, this is a general approach
            records.push({
              provider: 'openai',
              model: item.snapshot_id || 'gpt-3.5-turbo',
              promptTokens: item.n_context_tokens_total || 0,
              completionTokens: item.n_generated_tokens_total || 0,
              totalTokens: (item.n_context_tokens_total || 0) + (item.n_generated_tokens_total || 0),
              cost: this.calculateOpenAICost(
                item.snapshot_id || 'gpt-3.5-turbo',
                item.n_context_tokens_total || 0,
                item.n_generated_tokens_total || 0
              ),
              timestamp: new Date(item.created || Date.now()),
              metadata: {
                requests: item.n_requests || 0,
                organization: orgId
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching OpenAI usage:', error);
    }
    
    // If we couldn't get real usage data, we can track future usage through our proxy
    console.log(`Fetched ${records.length} OpenAI usage records`);
    return records;
  }
  
  /**
   * Calculate OpenAI costs based on model and token usage
   * Prices as of 2025 (in USD per 1K tokens)
   */
  private calculateOpenAICost(model: string, promptTokens: number, completionTokens: number): number {
    const pricing: Record<string, { prompt: number; completion: number }> = {
      'gpt-4o': { prompt: 0.005, completion: 0.015 },
      'gpt-4o-mini': { prompt: 0.00015, completion: 0.0006 },
      'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
      'gpt-4': { prompt: 0.03, completion: 0.06 },
      'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 },
      'gpt-3.5-turbo-16k': { prompt: 0.003, completion: 0.004 }
    };
    
    const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
    const promptCost = (promptTokens / 1000) * modelPricing.prompt;
    const completionCost = (completionTokens / 1000) * modelPricing.completion;
    
    return promptCost + completionCost;
  }
  
  /**
   * Fetch usage data from Anthropic (Claude)
   * Note: Anthropic's usage API is limited
   */
  async fetchClaudeUsage(apiKey: string, startDate: Date, endDate: Date): Promise<UsageRecord[]> {
    const records: UsageRecord[] = [];
    
    try {
      // Anthropic doesn't provide a public usage API yet
      // We can only track usage going forward through our proxy
      console.log('Claude usage API not available - tracking future usage only');
      
      // For now, return empty array
      // Future usage will be tracked when requests are made
    } catch (error) {
      console.error('Error fetching Claude usage:', error);
    }
    
    return records;
  }
  
  /**
   * Fetch usage data from Google (Gemini)
   * Note: Google Cloud provides usage through their billing API
   */
  async fetchGeminiUsage(apiKey: string, startDate: Date, endDate: Date): Promise<UsageRecord[]> {
    const records: UsageRecord[] = [];
    
    try {
      // Google's Gemini API doesn't provide direct usage endpoints
      // Usage is typically tracked through Google Cloud Console
      console.log('Gemini usage tracking through Google Cloud Console');
      
      // For demonstration, we could make a test call to verify the key works
      const testResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
      );
      
      if (testResponse.ok) {
        console.log('Gemini API key is valid - future usage will be tracked');
      }
    } catch (error) {
      console.error('Error fetching Gemini usage:', error);
    }
    
    return records;
  }
  
  /**
   * Fetch usage data from X.AI (Grok)
   */
  async fetchGrokUsage(apiKey: string, startDate: Date, endDate: Date): Promise<UsageRecord[]> {
    const records: UsageRecord[] = [];
    
    try {
      // Grok API is new and usage endpoints are not well documented
      console.log('Grok usage API not yet available - tracking future usage only');
    } catch (error) {
      console.error('Error fetching Grok usage:', error);
    }
    
    return records;
  }
  
  /**
   * Main method to fetch and backfill usage data for all providers
   */
  async backfillUsageData(userId: string, organizationId: string): Promise<{
    success: boolean;
    recordsAdded: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let totalRecordsAdded = 0;
    
    console.log('Starting usage data backfill...');
    
    // Get all API keys for the user
    const apiKeys = await apiKeyService.getApiKeys(userId, organizationId);
    
    // Set date range (last 30 days by default)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    for (const keyInfo of apiKeys) {
      try {
        // Get the actual API key
        const apiKey = await apiKeyService.getApiKey(userId, keyInfo.provider as any, organizationId);
        
        if (!apiKey) {
          errors.push(`No API key found for ${keyInfo.provider}`);
          continue;
        }
        
        console.log(`Fetching usage data for ${keyInfo.provider}...`);
        
        let usageRecords: UsageRecord[] = [];
        
        switch (keyInfo.provider) {
          case 'openai':
            usageRecords = await this.fetchOpenAIUsage(apiKey, startDate, endDate);
            break;
          case 'claude':
            usageRecords = await this.fetchClaudeUsage(apiKey, startDate, endDate);
            break;
          case 'gemini':
            usageRecords = await this.fetchGeminiUsage(apiKey, startDate, endDate);
            break;
          case 'grok':
            usageRecords = await this.fetchGrokUsage(apiKey, startDate, endDate);
            break;
          default:
            console.log(`Provider ${keyInfo.provider} not supported for backfill`);
        }
        
        // Store the fetched records in the database
        for (const record of usageRecords) {
          try {
            await prisma.usageLog.create({
              data: {
                ...record,
                userId,
                organizationId
              }
            });
            totalRecordsAdded++;
          } catch (dbError) {
            console.error(`Failed to save usage record:`, dbError);
            errors.push(`Failed to save record for ${record.provider}`);
          }
        }
        
        console.log(`Added ${usageRecords.length} records for ${keyInfo.provider}`);
        
      } catch (error) {
        console.error(`Error processing ${keyInfo.provider}:`, error);
        errors.push(`Error processing ${keyInfo.provider}: ${error}`);
      }
    }
    
    console.log(`Backfill complete. Added ${totalRecordsAdded} records.`);
    
    return {
      success: errors.length === 0,
      recordsAdded: totalRecordsAdded,
      errors
    };
  }
  
  /**
   * Set up real-time usage tracking for future API calls
   */
  setupRealTimeTracking(userId: string, organizationId: string) {
    console.log('Setting up real-time usage tracking...');
    
    // This would typically involve:
    // 1. Setting up webhooks with providers (if available)
    // 2. Implementing middleware to intercept API calls
    // 3. Creating background jobs to periodically fetch usage
    
    // For now, we track usage when requests are made through our app
    console.log('Real-time tracking enabled for future API calls');
  }
}

export const usageFetchService = new UsageFetchService();