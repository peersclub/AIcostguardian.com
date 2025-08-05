import OpenAI from 'openai'
import { getApiKey } from './api-key-store'

interface OpenAIUsage {
  userId: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
  timestamp: Date
}

// Model pricing (as of 2024)
const MODEL_PRICING = {
  // GPT-4 models
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-32k': { input: 0.06, output: 0.12 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
  'gpt-4-1106-preview': { input: 0.01, output: 0.03 },
  'gpt-4-vision-preview': { input: 0.01, output: 0.03 },
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  
  // GPT-3.5 models
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'gpt-3.5-turbo-16k': { input: 0.003, output: 0.004 },
  'gpt-3.5-turbo-1106': { input: 0.001, output: 0.002 },
  'gpt-3.5-turbo-0125': { input: 0.0005, output: 0.0015 },
  
  // Default pricing for unknown models
  'default': { input: 0.002, output: 0.002 }
}

// Initialize OpenAI client
let openaiClient: OpenAI | null = null

export function getOpenAIClient(userId?: string, apiKey?: string): OpenAI {
  let key = apiKey
  
  // If no API key provided, try to get from storage
  if (!key && userId) {
    console.log(`Getting OpenAI client for userId: ${userId}`)
    key = getApiKey(userId, 'openai')
    console.log(`Retrieved key from storage: ${key ? 'Found' : 'Not found'}`)
  }
  
  // Fallback to environment variable
  if (!key) {
    key = process.env.OPENAI_API_KEY
    console.log(`Using environment variable key: ${key ? key.substring(0, 10) + '...' : 'Not found'}`)
  }
  
  if (!key) {
    throw new Error('OpenAI API key is not configured')
  }
  
  // Always create a new client when API key is provided
  // This ensures we use the correct key for each user
  if (apiKey || userId) {
    return new OpenAI({
      apiKey: key,
    })
  }
  
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: key,
    })
  }
  
  return openaiClient
}

export async function getOpenAIStatus(userId?: string, apiKey?: string): Promise<{
  isConfigured: boolean
  isValid: boolean
  error?: string
}> {
  try {
    let key = apiKey
    
    // If no API key provided, try to get from storage
    if (!key && userId) {
      key = getApiKey(userId, 'openai')
    }
    
    // Fallback to environment variable
    if (!key) {
      key = process.env.OPENAI_API_KEY
    }
    
    if (!key) {
      return {
        isConfigured: false,
        isValid: false,
        error: 'OpenAI API key is not configured'
      }
    }
    
    // Test the API key by making a simple call
    const client = getOpenAIClient(userId, apiKey)
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

export async function makeOpenAICall(
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
  usage: OpenAIUsage
}> {
  try {
    const client = getOpenAIClient(userId, options.apiKey)
    
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
    
    const usage: OpenAIUsage = {
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
    console.error('OpenAI API call error:', error)
    throw new Error(error?.message || 'Failed to call OpenAI API')
  }
}

// Export model list for UI
export const OPENAI_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Latest and most capable model' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Small, fast, and cost-efficient' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'GPT-4 with vision, JSON mode' },
  { id: 'gpt-4', name: 'GPT-4', description: 'Advanced reasoning and generation' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
]