/**
 * Proxy Middleware Service
 * Intercepts all AI API calls for real-time usage tracking
 * Core feature for AI Cost Guardian - Priority 1
 */

import { PrismaClient } from '@prisma/client';
import { apiKeyService } from '@/lib/core/api-key.service';

const prisma = new PrismaClient();

export interface ProxyRequest {
  provider: string;
  model: string;
  endpoint: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  userId: string;
  organizationId: string;
}

export interface ProxyResponse {
  success: boolean;
  data?: any;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
  };
  error?: string;
}

class ProxyMiddlewareService {
  private readonly tokenCalculators: Record<string, (text: string) => number>;
  
  constructor() {
    // Initialize token calculators for different providers
    this.tokenCalculators = {
      openai: this.calculateOpenAITokens,
      claude: this.calculateClaudeTokens,
      gemini: this.calculateGeminiTokens,
      grok: this.calculateGrokTokens
    };
  }

  /**
   * Main proxy method - intercepts and tracks API calls
   */
  async proxyRequest(request: ProxyRequest): Promise<ProxyResponse> {
    const startTime = Date.now();
    
    try {
      // 1. Get the API key for the provider
      const apiKey = await apiKeyService.getApiKey(
        request.userId,
        request.provider as any,
        request.organizationId
      );
      
      if (!apiKey) {
        throw new Error(`No API key configured for ${request.provider}`);
      }
      
      // 2. Build the actual API request
      const apiRequest = this.buildProviderRequest(request, apiKey);
      
      // 3. Make the API call
      const response = await fetch(apiRequest.url, {
        method: apiRequest.method,
        headers: apiRequest.headers,
        body: apiRequest.body ? JSON.stringify(apiRequest.body) : undefined
      });
      
      // 4. Parse the response
      const responseData = await response.json();
      
      // 5. Calculate usage metrics
      const usage = this.calculateUsage(request.provider, request.model, request.body, responseData);
      
      // 6. Store usage in database
      await this.storeUsage({
        provider: request.provider,
        model: request.model,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        cost: usage.cost,
        userId: request.userId,
        organizationId: request.organizationId,
        metadata: {
          endpoint: request.endpoint,
          responseTime: Date.now() - startTime,
          statusCode: response.status,
          requestId: responseData.id || responseData.request_id || null
        }
      });
      
      // 7. Check budgets and send alerts if needed
      await this.checkBudgetsAndAlerts(request.organizationId, usage.cost);
      
      return {
        success: true,
        data: responseData,
        usage
      };
      
    } catch (error) {
      console.error('Proxy request failed:', error);
      
      // Store failed request for debugging
      await this.storeFailedRequest(request, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Proxy request failed'
      };
    }
  }

  /**
   * Build provider-specific API request
   */
  private buildProviderRequest(request: ProxyRequest, apiKey: string): {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: any;
  } {
    switch (request.provider) {
      case 'openai':
        return {
          url: `https://api.openai.com/v1${request.endpoint}`,
          method: request.method,
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            ...request.headers
          },
          body: request.body
        };
        
      case 'claude':
        return {
          url: `https://api.anthropic.com/v1${request.endpoint}`,
          method: request.method,
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
            ...request.headers
          },
          body: request.body
        };
        
      case 'gemini':
        return {
          url: `https://generativelanguage.googleapis.com/v1${request.endpoint}?key=${apiKey}`,
          method: request.method,
          headers: {
            'Content-Type': 'application/json',
            ...request.headers
          },
          body: request.body
        };
        
      case 'grok':
        return {
          url: `https://api.x.ai/v1${request.endpoint}`,
          method: request.method,
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            ...request.headers
          },
          body: request.body
        };
        
      default:
        throw new Error(`Unsupported provider: ${request.provider}`);
    }
  }

  /**
   * Calculate usage metrics from request/response
   */
  private calculateUsage(
    provider: string,
    model: string,
    request: any,
    response: any
  ): {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
  } {
    let promptTokens = 0;
    let completionTokens = 0;
    
    // Extract token counts based on provider response format
    switch (provider) {
      case 'openai':
        promptTokens = response.usage?.prompt_tokens || 0;
        completionTokens = response.usage?.completion_tokens || 0;
        break;
        
      case 'claude':
        promptTokens = response.usage?.input_tokens || 0;
        completionTokens = response.usage?.output_tokens || 0;
        break;
        
      case 'gemini':
        // Gemini doesn't always return token counts, estimate from text
        promptTokens = this.estimateTokens(request.contents?.[0]?.parts?.[0]?.text || '');
        completionTokens = this.estimateTokens(response.candidates?.[0]?.content?.parts?.[0]?.text || '');
        break;
        
      case 'grok':
        promptTokens = response.usage?.prompt_tokens || 0;
        completionTokens = response.usage?.completion_tokens || 0;
        break;
    }
    
    const totalTokens = promptTokens + completionTokens;
    const cost = this.calculateCost(provider, model, promptTokens, completionTokens);
    
    return {
      promptTokens,
      completionTokens,
      totalTokens,
      cost
    };
  }

  /**
   * Calculate cost based on provider pricing
   */
  private calculateCost(
    provider: string,
    model: string,
    promptTokens: number,
    completionTokens: number
  ): number {
    const pricing: Record<string, Record<string, { prompt: number; completion: number }>> = {
      openai: {
        'gpt-4o': { prompt: 0.005, completion: 0.015 },
        'gpt-4o-mini': { prompt: 0.00015, completion: 0.0006 },
        'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
        'gpt-4': { prompt: 0.03, completion: 0.06 },
        'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 }
      },
      claude: {
        'claude-3-opus': { prompt: 0.015, completion: 0.075 },
        'claude-3-sonnet': { prompt: 0.003, completion: 0.015 },
        'claude-3-haiku': { prompt: 0.00025, completion: 0.00125 },
        'claude-2.1': { prompt: 0.008, completion: 0.024 },
        'claude-2.0': { prompt: 0.008, completion: 0.024 }
      },
      gemini: {
        'gemini-pro': { prompt: 0.00025, completion: 0.0005 },
        'gemini-pro-vision': { prompt: 0.00025, completion: 0.0005 },
        'gemini-1.5-pro': { prompt: 0.0035, completion: 0.0105 },
        'gemini-1.5-flash': { prompt: 0.00035, completion: 0.00105 }
      },
      grok: {
        'grok-beta': { prompt: 0.002, completion: 0.002 }
      }
    };
    
    const modelPricing = pricing[provider]?.[model] || { prompt: 0.001, completion: 0.001 };
    const promptCost = (promptTokens / 1000) * modelPricing.prompt;
    const completionCost = (completionTokens / 1000) * modelPricing.completion;
    
    return promptCost + completionCost;
  }

  /**
   * Estimate token count for text (when not provided by API)
   */
  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Token calculation methods for different providers
   */
  private calculateOpenAITokens(text: string): number {
    // OpenAI uses tiktoken, but for simplicity we estimate
    return Math.ceil(text.length / 4);
  }

  private calculateClaudeTokens(text: string): number {
    // Claude uses a similar tokenizer to GPT
    return Math.ceil(text.length / 4);
  }

  private calculateGeminiTokens(text: string): number {
    // Gemini token calculation
    return Math.ceil(text.length / 4);
  }

  private calculateGrokTokens(text: string): number {
    // Grok token calculation
    return Math.ceil(text.length / 4);
  }

  /**
   * Store usage data in database
   */
  private async storeUsage(data: {
    provider: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
    userId: string;
    organizationId: string;
    metadata?: any;
  }) {
    try {
      await prisma.usageLog.create({
        data: {
          provider: data.provider,
          model: data.model,
          promptTokens: data.promptTokens,
          completionTokens: data.completionTokens,
          totalTokens: data.totalTokens,
          cost: data.cost,
          userId: data.userId,
          organizationId: data.organizationId,
          metadata: data.metadata || {},
          timestamp: new Date()
        }
      });
      
      console.log(`Usage tracked: ${data.provider}/${data.model} - ${data.totalTokens} tokens, $${data.cost.toFixed(4)}`);
    } catch (error) {
      console.error('Failed to store usage:', error);
    }
  }

  /**
   * Check budgets and send alerts
   */
  private async checkBudgetsAndAlerts(organizationId: string, cost: number) {
    try {
      // Get active budgets
      const budgets = await prisma.budget.findMany({
        where: {
          organizationId,
          isActive: true
        }
      });
      
      for (const budget of budgets) {
        // Calculate current spending
        const period = this.getBudgetPeriod(budget.period);
        const spending = await prisma.usageLog.aggregate({
          where: {
            organizationId,
            timestamp: {
              gte: period.start,
              lte: period.end
            }
          },
          _sum: {
            cost: true
          }
        });
        
        const totalSpent = (spending._sum.cost || 0) + cost;
        const utilization = (totalSpent / budget.amount) * 100;
        
        // Check thresholds
        if (utilization >= 100 && !budget.alertSent100) {
          await this.sendBudgetAlert(budget, utilization, 'exceeded');
          await prisma.budget.update({
            where: { id: budget.id },
            data: { alertSent100: true }
          });
        } else if (utilization >= 80 && !budget.alertSent80) {
          await this.sendBudgetAlert(budget, utilization, 'warning');
          await prisma.budget.update({
            where: { id: budget.id },
            data: { alertSent80: true }
          });
        } else if (utilization >= 50 && !budget.alertSent50) {
          await this.sendBudgetAlert(budget, utilization, 'info');
          await prisma.budget.update({
            where: { id: budget.id },
            data: { alertSent50: true }
          });
        }
      }
    } catch (error) {
      console.error('Failed to check budgets:', error);
    }
  }

  /**
   * Get budget period dates
   */
  private getBudgetPeriod(period: string): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end: Date;
    
    switch (period) {
      case 'DAILY':
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'WEEKLY':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        start = weekStart;
        end = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
        break;
      case 'MONTHLY':
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
    }
    
    return { start, end };
  }

  /**
   * Send budget alert notification
   */
  private async sendBudgetAlert(budget: any, utilization: number, severity: string) {
    // TODO: Implement email/Slack notification
    console.log(`Budget Alert: ${budget.name} at ${utilization.toFixed(1)}% (${severity})`);
    
    // Store notification in database
    await prisma.notification.create({
      data: {
        type: 'BUDGET_ALERT',
        title: `Budget ${severity === 'exceeded' ? 'Exceeded' : 'Alert'}: ${budget.name}`,
        message: `Your ${budget.name} budget is at ${utilization.toFixed(1)}% utilization`,
        severity,
        organizationId: budget.organizationId,
        metadata: {
          budgetId: budget.id,
          utilization,
          amount: budget.amount
        }
      }
    });
  }

  /**
   * Store failed requests for debugging
   */
  private async storeFailedRequest(request: ProxyRequest, error: any) {
    try {
      await prisma.failedRequest.create({
        data: {
          provider: request.provider,
          endpoint: request.endpoint,
          error: error.message || 'Unknown error',
          metadata: {
            request: {
              model: request.model,
              method: request.method
            },
            error: error.stack || error.toString()
          },
          userId: request.userId,
          organizationId: request.organizationId
        }
      });
    } catch (dbError) {
      console.error('Failed to store failed request:', dbError);
    }
  }
}

export const proxyMiddleware = new ProxyMiddlewareService();