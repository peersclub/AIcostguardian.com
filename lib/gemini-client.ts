import { GoogleGenerativeAI } from '@google/generative-ai'
import { getApiKey } from './api-key-store'

interface GeminiUsage {
  userId: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
  timestamp: Date
}

// Model pricing (as of 2024) - per 1K tokens
const MODEL_PRICING = {
  // Current Gemini models (correct naming)
  'gemini-1.5-pro-latest': { input: 0.00125, output: 0.005 },
  'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
  'gemini-1.5-flash-latest': { input: 0.000075, output: 0.0003 },
  'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
  'gemini-1.5-flash-8b-latest': { input: 0.0000375, output: 0.00015 },
  'gemini-1.5-flash-8b': { input: 0.0000375, output: 0.00015 },
  
  // Legacy models (if still available)
  'gemini-pro': { input: 0.0005, output: 0.0015 },
  'gemini-pro-vision': { input: 0.00025, output: 0.0005 },
  
  // Default pricing for unknown models
  'default': { input: 0.002, output: 0.002 }
}

// Initialize Gemini client
let geminiClient: GoogleGenerativeAI | null = null

export function getGeminiClient(userId?: string, apiKey?: string): GoogleGenerativeAI {
  let key = apiKey
  
  // If no API key provided, try to get from storage
  if (!key && userId) {
    console.log(`Getting Gemini client for userId: ${userId}`)
    key = getApiKey(userId, 'gemini')
    console.log(`Retrieved key from storage: ${key ? 'Found' : 'Not found'}`)
  }
  
  // Fallback to environment variable
  if (!key) {
    key = process.env.GEMINI_API_KEY
    console.log(`Using environment variable key: ${key ? key.substring(0, 10) + '...' : 'Not found'}`)
  }
  
  if (!key) {
    throw new Error('Gemini API key is not configured')
  }
  
  // Always create a new client when API key is provided
  // This ensures we use the correct key for each user
  if (apiKey || userId) {
    return new GoogleGenerativeAI(key)
  }
  
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(key)
  }
  
  return geminiClient
}

export async function getGeminiStatus(userId?: string, apiKey?: string): Promise<{
  isConfigured: boolean
  isValid: boolean
  error?: string
}> {
  try {
    let key = apiKey
    
    // If no API key provided, try to get from storage
    if (!key && userId) {
      console.log(`Getting Gemini API key for userId: ${userId}`)
      key = getApiKey(userId, 'gemini')
      console.log(`Retrieved Gemini key from storage: ${key ? 'Found' : 'Not found'}`)
    }
    
    // Fallback to environment variable
    if (!key) {
      key = process.env.GEMINI_API_KEY
      console.log(`Using environment variable key: ${key ? 'Found' : 'Not found'}`)
    }
    
    if (!key) {
      return {
        isConfigured: false,
        isValid: false,
        error: 'Gemini API key is not configured'
      }
    }
    
    // Validate API key format
    if (!key.startsWith('AIza')) {
      return {
        isConfigured: true,
        isValid: false,
        error: 'Invalid API key format. Gemini API keys should start with "AIza"'
      }
    }
    
    console.log(`Testing Gemini API key: ${key.substring(0, 10)}...`)
    
    // Test the API key by making a simple call
    const client = new GoogleGenerativeAI(key)
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    // Simple test generation
    const result = await model.generateContent('Test')
    const response = await result.response
    
    if (!response.text()) {
      throw new Error('Invalid response from Gemini API')
    }
    
    console.log('Gemini API key test successful')
    return {
      isConfigured: true,
      isValid: true
    }
  } catch (error: any) {
    console.error('Gemini API key test failed:', error)
    
    // Parse specific error types
    let errorMessage = error?.message || 'Invalid API key'
    
    if (errorMessage.includes('API_KEY_INVALID')) {
      errorMessage = 'Invalid API key. Please check your Gemini API key from Google AI Studio.'
    } else if (errorMessage.includes('PERMISSION_DENIED')) {
      errorMessage = 'Permission denied. Please ensure your API key has the necessary permissions.'
    } else if (errorMessage.includes('QUOTA_EXCEEDED')) {
      errorMessage = 'API quota exceeded. Please check your usage limits.'
    }
    
    return {
      isConfigured: true,
      isValid: false,
      error: errorMessage
    }
  }
}

export async function makeGeminiCall(
  userId: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  options: {
    maxTokens?: number
    temperature?: number
    apiKey?: string
  } = {}
): Promise<{
  response: any
  usage: GeminiUsage
}> {
  try {
    const client = getGeminiClient(userId, options.apiKey)
    const geminiModel = client.getGenerativeModel({ 
      model,
      generationConfig: {
        maxOutputTokens: options.maxTokens || 1024,
        temperature: options.temperature || 0.7,
      }
    })
    
    // Convert messages to Gemini format (combine into single prompt for now)
    const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')
    
    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    
    // Gemini doesn't provide detailed token usage in free tier
    // Estimate tokens based on text length (rough approximation)
    const promptText = prompt
    const responseText = response.text()
    
    const promptTokens = Math.ceil(promptText.length / 4) // Rough estimate: 4 chars per token
    const completionTokens = Math.ceil(responseText.length / 4)
    const totalTokens = promptTokens + completionTokens
    
    // Calculate cost based on model
    const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING] || MODEL_PRICING.default
    const cost = (promptTokens * pricing.input / 1000) + (completionTokens * pricing.output / 1000)
    
    const usage: GeminiUsage = {
      userId,
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      cost,
      timestamp: new Date()
    }
    
    return {
      response: {
        content: responseText,
        model: model
      },
      usage
    }
  } catch (error: any) {
    console.error('Gemini API call error:', error)
    throw new Error(error?.message || 'Failed to call Gemini API')
  }
}

// Export model list for UI
export const GEMINI_MODELS = [
  { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro (Latest)', description: 'Most capable model with long context window' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'High-quality model with balanced performance' },
  { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash (Latest)', description: 'Fast and efficient model, great for most tasks' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast and cost-effective model' },
  { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B', description: 'Smallest and fastest model' },
]