// Generic usage interface for all AI providers
export interface AIUsage {
  id?: string
  userId: string
  provider: 'claude' | 'openai' | 'gemini' | 'perplexity' | 'grok'
  model: string
  inputTokens?: number
  outputTokens?: number
  totalTokens: number
  inputCost?: number
  outputCost?: number
  totalCost?: number
  cost: number
  timestamp: Date
  requestId?: string
  prompt?: string
  response?: string
  promptTokens?: number // For OpenAI compatibility
  completionTokens?: number // For OpenAI compatibility
}

// In-memory storage for demo (in production, use a database)
let usageData: AIUsage[] = []

// Model pricing for different providers
const PROVIDER_MODEL_PRICING = {
  claude: {
    'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
    'claude-3-5-haiku-20241022': { input: 0.0008, output: 0.004 },
    'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
  },
  openai: {
    'gpt-4o': { input: 0.005, output: 0.015 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  },
  gemini: {
    'gemini-1.5-pro-latest': { input: 0.00125, output: 0.005 },
    'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
    'gemini-1.5-flash-latest': { input: 0.000075, output: 0.0003 },
    'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
    'gemini-1.5-flash-8b-latest': { input: 0.0000375, output: 0.00015 },
    'gemini-1.5-flash-8b': { input: 0.0000375, output: 0.00015 },
  },
  perplexity: {
    'llama-3.1-sonar-large': { input: 0.001, output: 0.001 },
    'llama-3.1-sonar-small': { input: 0.0002, output: 0.0002 },
  },
  grok: {
    'grok-beta': { input: 0.005, output: 0.015 },
    'grok-vision-beta': { input: 0.01, output: 0.03 },
  }
}

// Generate sample usage data for demonstration
function generateSampleUsage(userId: string, provider?: string): AIUsage[] {
  const providers = provider ? [provider] : ['claude', 'openai', 'gemini', 'perplexity', 'grok']
  const sampleData: AIUsage[] = []
  
  // Generate usage for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    // Generate 1-5 API calls per day
    const callsPerDay = Math.floor(Math.random() * 5) + 1
    
    for (let j = 0; j < callsPerDay; j++) {
      const currentProvider = providers[Math.floor(Math.random() * providers.length)] as AIUsage['provider']
      let model = ''
      let inputTokens = Math.floor(Math.random() * 2000) + 100
      let outputTokens = Math.floor(Math.random() * 1000) + 50
      let cost = 0
      
      // Select model based on provider
      switch (currentProvider) {
        case 'claude':
          const claudeModels = Object.keys(PROVIDER_MODEL_PRICING.claude)
          model = claudeModels[Math.floor(Math.random() * claudeModels.length)]
          const claudePricing = PROVIDER_MODEL_PRICING.claude[model as keyof typeof PROVIDER_MODEL_PRICING.claude]
          cost = (inputTokens * claudePricing.input / 1000) + (outputTokens * claudePricing.output / 1000)
          break
        case 'openai':
          const openaiModels = Object.keys(PROVIDER_MODEL_PRICING.openai)
          model = openaiModels[Math.floor(Math.random() * openaiModels.length)]
          const openaiPricing = PROVIDER_MODEL_PRICING.openai[model as keyof typeof PROVIDER_MODEL_PRICING.openai]
          cost = (inputTokens * openaiPricing.input / 1000) + (outputTokens * openaiPricing.output / 1000)
          break
        case 'gemini':
          const geminiModels = Object.keys(PROVIDER_MODEL_PRICING.gemini)
          model = geminiModels[Math.floor(Math.random() * geminiModels.length)]
          const geminiPricing = PROVIDER_MODEL_PRICING.gemini[model as keyof typeof PROVIDER_MODEL_PRICING.gemini]
          cost = (inputTokens * geminiPricing.input / 1000) + (outputTokens * geminiPricing.output / 1000)
          break
        case 'perplexity':
          const perplexityModels = Object.keys(PROVIDER_MODEL_PRICING.perplexity)
          model = perplexityModels[Math.floor(Math.random() * perplexityModels.length)]
          const perplexityPricing = PROVIDER_MODEL_PRICING.perplexity[model as keyof typeof PROVIDER_MODEL_PRICING.perplexity]
          cost = (inputTokens * perplexityPricing.input / 1000) + (outputTokens * perplexityPricing.output / 1000)
          break
        case 'grok':
          const grokModels = Object.keys(PROVIDER_MODEL_PRICING.grok)
          model = grokModels[Math.floor(Math.random() * grokModels.length)]
          const grokPricing = PROVIDER_MODEL_PRICING.grok[model as keyof typeof PROVIDER_MODEL_PRICING.grok]
          cost = (inputTokens * grokPricing.input / 1000) + (outputTokens * grokPricing.output / 1000)
          break
      }
      
      sampleData.push({
        id: crypto.randomUUID(),
        userId,
        provider: currentProvider,
        model,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        promptTokens: inputTokens, // For OpenAI compatibility
        completionTokens: outputTokens, // For OpenAI compatibility
        cost: Number(cost.toFixed(6)),
        totalCost: Number(cost.toFixed(6)),
        timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
        requestId: `req_${Math.random().toString(36).substr(2, 9)}`,
        prompt: `Sample prompt ${j + 1} for ${date.toDateString()}`,
        response: `Sample response ${j + 1} for ${date.toDateString()}`
      })
    }
  }
  
  return sampleData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

// Store usage data
export function storeUsage(usage: AIUsage): void {
  // Normalize the usage object
  const normalizedUsage: AIUsage = {
    ...usage,
    id: usage.id || crypto.randomUUID(),
    inputTokens: usage.inputTokens || usage.promptTokens || 0,
    outputTokens: usage.outputTokens || usage.completionTokens || 0,
    totalTokens: usage.totalTokens || ((usage.inputTokens || usage.promptTokens || 0) + (usage.outputTokens || usage.completionTokens || 0)),
    cost: usage.cost || usage.totalCost || 0,
    totalCost: usage.totalCost || usage.cost || 0,
  }
  
  usageData.push(normalizedUsage)
  // In production, save to database here
}

// Get usage data for a user
export function getUserUsage(userId: string, provider?: string): AIUsage[] {
  let userUsage = usageData.filter(usage => 
    usage.userId === userId && (!provider || usage.provider === provider)
  )
  
  // If no usage found, generate sample data for demo
  if (userUsage.length === 0) {
    const sampleUsage = generateSampleUsage(userId, provider)
    usageData.push(...sampleUsage)
    userUsage = sampleUsage
  }
  
  return userUsage.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

// Get usage statistics for a user
export function getUsageStats(userId: string, provider?: string) {
  const usage = getUserUsage(userId, provider)
  
  if (usage.length === 0) {
    return {
      totalCalls: 0,
      totalTokens: 0,
      totalCost: 0,
      thisMonth: { calls: 0, tokens: 0, cost: 0 },
      thisWeek: { calls: 0, tokens: 0, cost: 0 },
      today: { calls: 0, tokens: 0, cost: 0 },
      byModel: {},
      byProvider: {},
      dailyUsage: []
    }
  }
  
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  // Reset now to current time
  const currentTime = new Date()
  
  const stats = {
    totalCalls: usage.length,
    totalTokens: usage.reduce((sum, u) => sum + u.totalTokens, 0),
    totalCost: Number(usage.reduce((sum, u) => sum + (u.cost || u.totalCost || 0), 0).toFixed(2)),
    thisMonth: {
      calls: usage.filter(u => u.timestamp >= startOfMonth).length,
      tokens: usage.filter(u => u.timestamp >= startOfMonth).reduce((sum, u) => sum + u.totalTokens, 0),
      cost: Number(usage.filter(u => u.timestamp >= startOfMonth).reduce((sum, u) => sum + (u.cost || u.totalCost || 0), 0).toFixed(2))
    },
    thisWeek: {
      calls: usage.filter(u => u.timestamp >= startOfWeek).length,
      tokens: usage.filter(u => u.timestamp >= startOfWeek).reduce((sum, u) => sum + u.totalTokens, 0),
      cost: Number(usage.filter(u => u.timestamp >= startOfWeek).reduce((sum, u) => sum + (u.cost || u.totalCost || 0), 0).toFixed(2))
    },
    today: {
      calls: usage.filter(u => u.timestamp >= startOfDay).length,
      tokens: usage.filter(u => u.timestamp >= startOfDay).reduce((sum, u) => sum + u.totalTokens, 0),
      cost: Number(usage.filter(u => u.timestamp >= startOfDay).reduce((sum, u) => sum + (u.cost || u.totalCost || 0), 0).toFixed(2))
    },
    byModel: {} as Record<string, { calls: number; tokens: number; cost: number }>,
    byProvider: {} as Record<string, { calls: number; tokens: number; cost: number }>,
    dailyUsage: [] as Array<{ date: string; calls: number; tokens: number; cost: number }>
  }
  
  // Group by model and provider
  usage.forEach(u => {
    // By model
    if (!stats.byModel[u.model]) {
      stats.byModel[u.model] = { calls: 0, tokens: 0, cost: 0 }
    }
    stats.byModel[u.model].calls++
    stats.byModel[u.model].tokens += u.totalTokens
    stats.byModel[u.model].cost = Number((stats.byModel[u.model].cost + (u.cost || u.totalCost || 0)).toFixed(6))
    
    // By provider
    if (!stats.byProvider[u.provider]) {
      stats.byProvider[u.provider] = { calls: 0, tokens: 0, cost: 0 }
    }
    stats.byProvider[u.provider].calls++
    stats.byProvider[u.provider].tokens += u.totalTokens
    stats.byProvider[u.provider].cost = Number((stats.byProvider[u.provider].cost + (u.cost || u.totalCost || 0)).toFixed(6))
  })
  
  // Generate daily usage for last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const dayUsage = usage.filter(u => 
      u.timestamp.toISOString().split('T')[0] === dateStr
    )
    
    stats.dailyUsage.push({
      date: dateStr,
      calls: dayUsage.length,
      tokens: dayUsage.reduce((sum, u) => sum + u.totalTokens, 0),
      cost: Number(dayUsage.reduce((sum, u) => sum + (u.cost || u.totalCost || 0), 0).toFixed(6))
    })
  }
  
  return stats
}

// Get recent usage for a user (last N records)
export function getRecentUsage(userId: string, limit: number = 10, provider?: string): AIUsage[] {
  const usage = getUserUsage(userId, provider)
  return usage.slice(0, limit)
}

// Legacy function names for backward compatibility
export function getUserUsageStats(userId: string) {
  return getUsageStats(userId, 'claude')
}

// Clear all usage data (for testing)
export function clearUsageData(): void {
  usageData = []
}