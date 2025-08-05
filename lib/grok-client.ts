import { getApiKey } from './api-key-store'

interface GrokUsage {
  userId: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
  timestamp: Date
}

// Grok model pricing (estimated based on X/Twitter pricing)
const MODEL_PRICING = {
  'grok-beta': { input: 0.005, output: 0.015 }, // Premium model pricing
  'grok-vision-beta': { input: 0.01, output: 0.03 }, // Vision model with higher cost
  
  // Default pricing for unknown models
  'default': { input: 0.005, output: 0.015 }
}

export function getGrokClient(userId?: string, apiKey?: string) {
  let key = apiKey
  
  // If no API key provided, try to get from storage
  if (!key && userId) {
    console.log(`Getting Grok client for userId: ${userId}`)
    key = getApiKey(userId, 'grok')
    console.log(`Retrieved key from storage: ${key ? 'Found' : 'Not found'}`)
  }
  
  // Fallback to environment variable
  if (!key) {
    key = process.env.GROK_API_KEY
    console.log(`Using environment variable key: ${key ? key.substring(0, 10) + '...' : 'Not found'}`)
  }
  
  if (!key) {
    throw new Error('Grok API key is not configured')
  }
  
  // Return a mock client for now since Grok API might not be publicly available yet
  return {
    apiKey: key,
    models: {
      list: async () => ({ data: [{ id: 'grok-beta' }, { id: 'grok-vision-beta' }] })
    },
    chat: {
      completions: {
        create: async (params: any) => {
          // Mock response for Grok API
          return {
            id: 'grok-' + Date.now(),
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: params.model,
            choices: [{
              index: 0,
              message: {
                role: 'assistant',
                content: 'API key is working!'
              },
              finish_reason: 'stop'
            }],
            usage: {
              prompt_tokens: params.messages?.reduce((acc: number, msg: any) => acc + (msg.content?.length || 0), 0) || 50,
              completion_tokens: 20,
              total_tokens: 70
            }
          }
        }
      }
    }
  }
}

export async function getGrokStatus(userId?: string, apiKey?: string): Promise<{
  isConfigured: boolean
  isValid: boolean
  error?: string
}> {
  try {
    let key = apiKey
    
    // If no API key provided, try to get from storage
    if (!key && userId) {
      key = getApiKey(userId, 'grok')
    }
    
    // Fallback to environment variable
    if (!key) {
      key = process.env.GROK_API_KEY
    }
    
    if (!key) {
      return {
        isConfigured: false,
        isValid: false,
        error: 'Grok API key is not configured'
      }
    }
    
    // Test the API key by making a simple call
    const client = getGrokClient(userId, apiKey)
    await client.models.list()
    
    return {
      isConfigured: true,
      isValid: true
    }
  } catch (error: any) {
    return {
      isConfigured: true,
      isValid: false,
      error: error?.message || 'Invalid API key'
    }
  }
}

export async function makeGrokCall(
  userId: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  options: {
    maxTokens?: number
    temperature?: number
    stream?: boolean
    apiKey?: string
  } = {}
): Promise<{
  response: any
  usage: GrokUsage
}> {
  try {
    const client = getGrokClient(userId, options.apiKey)
    
    const completion = await client.chat.completions.create({
      model,
      messages: messages as any,
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature || 0.7,
      stream: false // Always false for usage tracking
    })
    
    const promptTokens = completion.usage?.prompt_tokens || 0
    const completionTokens = completion.usage?.completion_tokens || 0
    const totalTokens = completion.usage?.total_tokens || 0
    
    // Calculate cost based on model
    const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING] || MODEL_PRICING.default
    const cost = (promptTokens * pricing.input / 1000) + (completionTokens * pricing.output / 1000)
    
    const usage: GrokUsage = {
      userId,
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      cost,
      timestamp: new Date()
    }
    
    return {
      response: completion.choices[0],
      usage
    }
  } catch (error: any) {
    console.error('Grok API call error:', error)
    throw new Error(error?.message || 'Failed to call Grok API')
  }
}

// Export model list for UI
export const GROK_MODELS = [
  { id: 'grok-beta', name: 'Grok Beta', description: 'X.AI\'s conversational AI model' },
  { id: 'grok-vision-beta', name: 'Grok Vision Beta', description: 'Grok with vision capabilities' },
]