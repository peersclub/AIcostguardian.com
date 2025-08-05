import Anthropic from '@anthropic-ai/sdk'

// Initialize Claude client
const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Claude model pricing (tokens per dollar)
export const CLAUDE_PRICING = {
  'claude-3-5-sonnet-20241022': {
    input: 0.000003,  // $3 per million input tokens
    output: 0.000015, // $15 per million output tokens
    name: 'Claude 3.5 Sonnet'
  },
  'claude-3-5-haiku-20241022': {
    input: 0.0000008, // $0.80 per million input tokens  
    output: 0.000004, // $4 per million output tokens
    name: 'Claude 3.5 Haiku'
  },
  'claude-3-opus-20240229': {
    input: 0.000015,  // $15 per million input tokens
    output: 0.000075, // $75 per million output tokens
    name: 'Claude 3 Opus'
  }
} as const

export type ClaudeModel = keyof typeof CLAUDE_PRICING

// Usage tracking interface
export interface ClaudeUsage {
  id: string
  userId: string
  model: ClaudeModel
  inputTokens: number
  outputTokens: number
  totalTokens: number
  inputCost: number
  outputCost: number
  totalCost: number
  timestamp: Date
  requestId?: string
  prompt?: string
  response?: string
}

// Calculate costs for a Claude API call
export function calculateClaudeCost(
  model: ClaudeModel,
  inputTokens: number,
  outputTokens: number
): { inputCost: number; outputCost: number; totalCost: number } {
  const pricing = CLAUDE_PRICING[model]
  
  const inputCost = inputTokens * pricing.input
  const outputCost = outputTokens * pricing.output
  const totalCost = inputCost + outputCost
  
  return {
    inputCost: Number(inputCost.toFixed(6)),
    outputCost: Number(outputCost.toFixed(6)),
    totalCost: Number(totalCost.toFixed(6))
  }
}

// Make a Claude API call and track usage
export async function makeClaudeCall(
  userId: string,
  model: ClaudeModel,
  messages: Anthropic.Messages.MessageParam[],
  options: {
    maxTokens?: number
    temperature?: number
    systemPrompt?: string
    apiKey?: string
  } = {}
): Promise<{
  response: Anthropic.Messages.Message
  usage: ClaudeUsage
}> {
  try {
    const { maxTokens = 1024, temperature = 0.7, systemPrompt, apiKey } = options

    // Use provided API key or fall back to environment variable
    const claudeClient = apiKey 
      ? new Anthropic({ apiKey }) 
      : claude

    // Make the API call
    const response = await claudeClient.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages,
    })

    // Extract usage data
    const inputTokens = response.usage.input_tokens
    const outputTokens = response.usage.output_tokens
    const totalTokens = inputTokens + outputTokens

    // Calculate costs
    const costs = calculateClaudeCost(model, inputTokens, outputTokens)

    // Create usage record
    const usage: ClaudeUsage = {
      id: crypto.randomUUID(),
      userId,
      model,
      inputTokens,
      outputTokens,
      totalTokens,
      inputCost: costs.inputCost,
      outputCost: costs.outputCost,
      totalCost: costs.totalCost,
      timestamp: new Date(),
      requestId: response.id,
      prompt: JSON.stringify(messages),
      response: JSON.stringify(response.content)
    }

    return {
      response,
      usage
    }
  } catch (error) {
    console.error('Claude API call failed:', error)
    throw error
  }
}

// Get Claude API key status
export async function getClaudeStatus(testApiKey?: string): Promise<{
  isConfigured: boolean
  isValid: boolean
  error?: string
}> {
  // If testing a specific API key, use it
  if (testApiKey) {
    try {
      const testClient = new Anthropic({ apiKey: testApiKey })
      
      await testClient.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      })

      return {
        isConfigured: true,
        isValid: true
      }
    } catch (error: any) {
      return {
        isConfigured: true,
        isValid: false,
        error: error.message || 'Invalid API key'
      }
    }
  }

  // Check environment variable API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      isConfigured: false,
      isValid: false,
      error: 'ANTHROPIC_API_KEY not configured'
    }
  }

  try {
    // Test the API key with a minimal request
    await claude.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }]
    })

    return {
      isConfigured: true,
      isValid: true
    }
  } catch (error: any) {
    return {
      isConfigured: true,
      isValid: false,
      error: error.message || 'Invalid API key'
    }
  }
}

export default claude