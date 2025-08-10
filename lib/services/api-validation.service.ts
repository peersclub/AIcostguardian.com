import { OpenAI } from 'openai'
import Anthropic from '@anthropic-ai/sdk'

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'mistral' | 'perplexity' | 'grok' | 'xai'

export interface ValidationResult {
  valid: boolean
  provider: AIProvider
  keyType?: string // 'standard' | 'admin' | 'organization'
  message?: string
  error?: string
  details?: {
    organization?: string
    permissions?: string[]
    rateLimit?: number
    models?: string[]
  }
}

/**
 * Centralized API key validation service
 * Handles validation for all AI providers with consistent error handling
 */
export class ApiValidationService {
  /**
   * Validate an API key for any supported AI provider
   */
  static async validateApiKey(
    apiKey: string,
    provider: AIProvider
  ): Promise<ValidationResult> {
    try {
      // Trim whitespace
      apiKey = apiKey.trim()
      
      // Basic format validation
      if (!apiKey || apiKey.length < 10) {
        return {
          valid: false,
          provider,
          error: 'API key is too short or empty'
        }
      }

      // Provider-specific validation
      switch (provider) {
        case 'openai':
          return await this.validateOpenAI(apiKey)
        
        case 'anthropic':
          return await this.validateAnthropic(apiKey)
        
        case 'google':
          return await this.validateGoogle(apiKey)
        
        case 'mistral':
          return await this.validateMistral(apiKey)
        
        case 'perplexity':
          return await this.validatePerplexity(apiKey)
        
        case 'grok':
        case 'xai':
          return await this.validateGrok(apiKey)
        
        default:
          return {
            valid: false,
            provider,
            error: `Unsupported provider: ${provider}`
          }
      }
    } catch (error) {
      console.error(`API validation error for ${provider}:`, error)
      return {
        valid: false,
        provider,
        error: error instanceof Error ? error.message : 'Validation failed'
      }
    }
  }

  /**
   * Validate OpenAI API key
   */
  private static async validateOpenAI(apiKey: string): Promise<ValidationResult> {
    try {
      // Check key format
      if (!apiKey.startsWith('sk-') && !apiKey.startsWith('org-')) {
        return {
          valid: false,
          provider: 'openai',
          error: 'Invalid OpenAI API key format'
        }
      }

      // Test API call
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const keyType = apiKey.startsWith('org-') ? 'organization' : 'standard'
        
        return {
          valid: true,
          provider: 'openai',
          keyType,
          message: 'OpenAI API key is valid',
          details: {
            models: data.data?.map((m: any) => m.id) || []
          }
        }
      }

      if (response.status === 401) {
        return {
          valid: false,
          provider: 'openai',
          error: 'Invalid or expired OpenAI API key'
        }
      }

      if (response.status === 429) {
        return {
          valid: true, // Key is valid but rate limited
          provider: 'openai',
          keyType: 'standard',
          message: 'API key is valid but currently rate limited'
        }
      }

      return {
        valid: false,
        provider: 'openai',
        error: `OpenAI API error: ${response.statusText}`
      }
    } catch (error) {
      return {
        valid: false,
        provider: 'openai',
        error: 'Failed to connect to OpenAI API'
      }
    }
  }

  /**
   * Validate Anthropic/Claude API key
   */
  private static async validateAnthropic(apiKey: string): Promise<ValidationResult> {
    try {
      // Check key format
      const isAdminKey = apiKey.startsWith('sk-ant-admin')
      if (!apiKey.startsWith('sk-ant-')) {
        return {
          valid: false,
          provider: 'anthropic',
          error: 'Invalid Anthropic API key format'
        }
      }

      // Test API call with minimal request
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1
        })
      })

      // Check various response codes
      if (response.status === 401) {
        return {
          valid: false,
          provider: 'anthropic',
          error: 'Invalid or expired Anthropic API key'
        }
      }

      if (response.status === 403) {
        return {
          valid: false,
          provider: 'anthropic',
          error: 'API key lacks required permissions'
        }
      }

      if (response.status === 429) {
        return {
          valid: true, // Key is valid but rate limited
          provider: 'anthropic',
          keyType: isAdminKey ? 'admin' : 'standard',
          message: 'API key is valid but currently rate limited'
        }
      }

      // 200 or 400 (bad request but key is valid)
      if (response.ok || response.status === 400) {
        return {
          valid: true,
          provider: 'anthropic',
          keyType: isAdminKey ? 'admin' : 'standard',
          message: isAdminKey 
            ? 'Anthropic Admin API key is valid' 
            : 'Anthropic API key is valid'
        }
      }

      return {
        valid: false,
        provider: 'anthropic',
        error: `Anthropic API error: ${response.statusText}`
      }
    } catch (error) {
      return {
        valid: false,
        provider: 'anthropic',
        error: 'Failed to connect to Anthropic API'
      }
    }
  }

  /**
   * Validate Google/Gemini API key
   */
  private static async validateGoogle(apiKey: string): Promise<ValidationResult> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      )

      if (response.ok) {
        const data = await response.json()
        return {
          valid: true,
          provider: 'google',
          keyType: 'standard',
          message: 'Google Gemini API key is valid',
          details: {
            models: data.models?.map((m: any) => m.name) || []
          }
        }
      }

      if (response.status === 400 || response.status === 403) {
        return {
          valid: false,
          provider: 'google',
          error: 'Invalid Google API key'
        }
      }

      return {
        valid: false,
        provider: 'google',
        error: `Google API error: ${response.statusText}`
      }
    } catch (error) {
      return {
        valid: false,
        provider: 'google',
        error: 'Failed to connect to Google API'
      }
    }
  }

  /**
   * Validate Mistral API key (OpenAI-compatible)
   */
  private static async validateMistral(apiKey: string): Promise<ValidationResult> {
    try {
      const response = await fetch('https://api.mistral.ai/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      })

      if (response.ok) {
        return {
          valid: true,
          provider: 'mistral',
          keyType: 'standard',
          message: 'Mistral API key is valid'
        }
      }

      if (response.status === 401) {
        return {
          valid: false,
          provider: 'mistral',
          error: 'Invalid Mistral API key'
        }
      }

      return {
        valid: false,
        provider: 'mistral',
        error: `Mistral API error: ${response.statusText}`
      }
    } catch (error) {
      return {
        valid: false,
        provider: 'mistral',
        error: 'Failed to connect to Mistral API'
      }
    }
  }

  /**
   * Validate Perplexity API key (OpenAI-compatible)
   */
  private static async validatePerplexity(apiKey: string): Promise<ValidationResult> {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1
        })
      })

      if (response.status === 401) {
        return {
          valid: false,
          provider: 'perplexity',
          error: 'Invalid Perplexity API key'
        }
      }

      if (response.ok || response.status === 400) {
        return {
          valid: true,
          provider: 'perplexity',
          keyType: 'standard',
          message: 'Perplexity API key is valid'
        }
      }

      return {
        valid: false,
        provider: 'perplexity',
        error: `Perplexity API error: ${response.statusText}`
      }
    } catch (error) {
      return {
        valid: false,
        provider: 'perplexity',
        error: 'Failed to connect to Perplexity API'
      }
    }
  }

  /**
   * Validate Grok/X.AI API key
   */
  private static async validateGrok(apiKey: string): Promise<ValidationResult> {
    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1
        })
      })

      if (response.status === 401) {
        return {
          valid: false,
          provider: 'grok',
          error: 'Invalid Grok API key'
        }
      }

      if (response.ok || response.status === 400) {
        return {
          valid: true,
          provider: 'grok',
          keyType: 'standard',
          message: 'Grok API key is valid'
        }
      }

      return {
        valid: false,
        provider: 'grok',
        error: `Grok API error: ${response.statusText}`
      }
    } catch (error) {
      return {
        valid: false,
        provider: 'grok',
        error: 'Failed to connect to Grok API'
      }
    }
  }

  /**
   * Test API key with actual API call to verify functionality
   */
  static async testApiKey(
    apiKey: string,
    provider: AIProvider,
    testPrompt: string = 'Hello, please respond with "API key is working"'
  ): Promise<{
    success: boolean
    response?: string
    error?: string
    usage?: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
  }> {
    try {
      switch (provider) {
        case 'openai':
          return await this.testOpenAI(apiKey, testPrompt)
        
        case 'anthropic':
          return await this.testAnthropic(apiKey, testPrompt)
        
        case 'google':
          return await this.testGoogle(apiKey, testPrompt)
        
        default:
          return {
            success: false,
            error: `Test not implemented for provider: ${provider}`
          }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Test failed'
      }
    }
  }

  private static async testOpenAI(apiKey: string, prompt: string) {
    try {
      const openai = new OpenAI({ apiKey })
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50
      })

      return {
        success: true,
        response: completion.choices[0]?.message?.content || '',
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OpenAI test failed'
      }
    }
  }

  private static async testAnthropic(apiKey: string, prompt: string) {
    try {
      const anthropic = new Anthropic({ apiKey })
      const completion = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50
      })

      return {
        success: true,
        response: completion.content[0]?.type === 'text' 
          ? completion.content[0].text 
          : '',
        usage: {
          promptTokens: completion.usage?.input_tokens || 0,
          completionTokens: completion.usage?.output_tokens || 0,
          totalTokens: (completion.usage?.input_tokens || 0) + (completion.usage?.output_tokens || 0)
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Anthropic test failed'
      }
    }
  }

  private static async testGoogle(apiKey: string, prompt: string) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          response: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
          usage: {
            promptTokens: 0, // Google doesn't provide token counts in response
            completionTokens: 0,
            totalTokens: 0
          }
        }
      }

      return {
        success: false,
        error: `Google API error: ${response.statusText}`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google test failed'
      }
    }
  }
}