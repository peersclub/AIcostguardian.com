/**
 * AI Proxy Client
 * Client-side SDK for making tracked AI API calls
 * Automatically routes through proxy for real-time usage tracking
 */

export interface AIProxyConfig {
  provider: 'openai' | 'claude' | 'gemini' | 'grok';
  model: string;
  trackUsage?: boolean; // Default: true
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ProxyResponse<T = any> {
  success: boolean;
  data?: T;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
  };
  tracked?: boolean;
  error?: string;
}

class AIProxyClient {
  private readonly baseUrl = '/api/proxy/ai';
  
  /**
   * Create a chat completion (works with all providers)
   */
  async createChatCompletion(
    config: AIProxyConfig,
    messages: ChatMessage[],
    options: Record<string, any> = {}
  ): Promise<ProxyResponse> {
    const endpoint = this.getChatEndpoint(config.provider);
    const body = this.formatChatRequest(config.provider, config.model, messages, options);
    
    return this.makeRequest({
      provider: config.provider,
      model: config.model,
      endpoint,
      data: body
    });
  }

  /**
   * Create a text completion (legacy format)
   */
  async createCompletion(
    config: AIProxyConfig,
    prompt: string,
    options: Record<string, any> = {}
  ): Promise<ProxyResponse> {
    const endpoint = this.getCompletionEndpoint(config.provider);
    const body = this.formatCompletionRequest(config.provider, config.model, prompt, options);
    
    return this.makeRequest({
      provider: config.provider,
      model: config.model,
      endpoint,
      data: body
    });
  }

  /**
   * Create embeddings
   */
  async createEmbedding(
    config: AIProxyConfig,
    input: string | string[],
    options: Record<string, any> = {}
  ): Promise<ProxyResponse> {
    const endpoint = '/embeddings';
    const body = {
      model: config.model || 'text-embedding-ada-002',
      input,
      ...options
    };
    
    return this.makeRequest({
      provider: config.provider,
      model: config.model,
      endpoint,
      data: body
    });
  }

  /**
   * Stream chat completion with usage tracking
   */
  async *streamChatCompletion(
    config: AIProxyConfig,
    messages: ChatMessage[],
    options: Record<string, any> = {}
  ): AsyncGenerator<string, void, unknown> {
    // For streaming, we need to track usage after completion
    const endpoint = this.getChatEndpoint(config.provider);
    const body = this.formatChatRequest(config.provider, config.model, messages, {
      ...options,
      stream: true
    });
    
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: config.provider,
        model: config.model,
        endpoint,
        data: body
      })
    });
    
    if (!response.ok) {
      throw new Error(`Proxy request failed: ${response.statusText}`);
    }
    
    // Handle streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('No response body');
    }
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      yield chunk;
    }
  }

  /**
   * Get chat endpoint for provider
   */
  private getChatEndpoint(provider: string): string {
    switch (provider) {
      case 'openai':
      case 'grok':
        return '/chat/completions';
      case 'claude':
        return '/messages';
      case 'gemini':
        return '/models/gemini-pro:generateContent';
      default:
        return '/chat/completions';
    }
  }

  /**
   * Get completion endpoint for provider
   */
  private getCompletionEndpoint(provider: string): string {
    switch (provider) {
      case 'openai':
        return '/completions';
      case 'claude':
        return '/complete';
      case 'gemini':
        return '/models/gemini-pro:generateContent';
      default:
        return '/completions';
    }
  }

  /**
   * Format chat request for provider
   */
  private formatChatRequest(
    provider: string,
    model: string,
    messages: ChatMessage[],
    options: Record<string, any>
  ): any {
    switch (provider) {
      case 'openai':
      case 'grok':
        return {
          model,
          messages,
          ...options
        };
        
      case 'claude':
        return {
          model,
          messages: messages.filter(m => m.role !== 'system'),
          system: messages.find(m => m.role === 'system')?.content,
          ...options
        };
        
      case 'gemini':
        return {
          contents: messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          })),
          ...options
        };
        
      default:
        return { model, messages, ...options };
    }
  }

  /**
   * Format completion request for provider
   */
  private formatCompletionRequest(
    provider: string,
    model: string,
    prompt: string,
    options: Record<string, any>
  ): any {
    switch (provider) {
      case 'openai':
        return {
          model,
          prompt,
          ...options
        };
        
      case 'claude':
        return {
          model,
          prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
          ...options
        };
        
      case 'gemini':
        return {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          ...options
        };
        
      default:
        return { model, prompt, ...options };
    }
  }

  /**
   * Make request through proxy
   */
  private async makeRequest(params: {
    provider: string;
    model: string;
    endpoint: string;
    data: any;
  }): Promise<ProxyResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: params.provider,
          model: params.model,
          endpoint: params.endpoint,
          method: 'POST',
          data: params.data
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || `Request failed: ${response.statusText}`,
          tracked: result.tracked || false
        };
      }
      
      return result;
      
    } catch (error) {
      console.error('Proxy request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Proxy request failed',
        tracked: false
      };
    }
  }

  /**
   * Check if proxy is available and working
   */
  async checkStatus(): Promise<{
    enabled: boolean;
    supportedProviders: string[];
    tracking: Record<string, boolean>;
  }> {
    try {
      const response = await fetch(this.baseUrl);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Proxy status check failed:', error);
    }
    
    return {
      enabled: false,
      supportedProviders: [],
      tracking: {}
    };
  }
}

// Export singleton instance
export const aiProxy = new AIProxyClient();

// Export convenience methods
export const createChatCompletion = aiProxy.createChatCompletion.bind(aiProxy);
export const createCompletion = aiProxy.createCompletion.bind(aiProxy);
export const createEmbedding = aiProxy.createEmbedding.bind(aiProxy);
export const streamChatCompletion = aiProxy.streamChatCompletion.bind(aiProxy);