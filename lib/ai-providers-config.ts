/**
 * Centralized AI Providers Configuration
 * This is the single source of truth for all AI provider information across the application.
 * To add a new AI provider, simply add it here and it will be available everywhere.
 */

// Configuration file - no React components here
// Logo components are handled in components/ui/ai-logos.tsx


export interface AIModel {
  name: string
  modelId: string
  inputPrice: number  // $ per 1M tokens
  outputPrice: number // $ per 1M tokens
  context: string     // Context window size
}

export interface AIProvider {
  id: string
  name: string
  displayName: string
  description: string
  color: string
  gradient: string
  models: AIModel[]
  avgCostPer1M: number // Blended average cost
  apiEndpoint?: string
  docsUrl?: string
  enabled: boolean
}

// Main configuration - ONLY EDIT THIS TO ADD/REMOVE PROVIDERS
export const AI_PROVIDERS_CONFIG: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    displayName: 'OpenAI',
    description: 'Industry-leading models with strong reasoning',
    color: '#10a37f',
    gradient: 'from-emerald-500 to-teal-600',
    models: [
      { name: 'GPT-4 Turbo', modelId: 'gpt-4-turbo', inputPrice: 10, outputPrice: 30, context: '128K' },
      { name: 'GPT-4', modelId: 'gpt-4', inputPrice: 30, outputPrice: 60, context: '8K' },
      { name: 'GPT-3.5 Turbo', modelId: 'gpt-3.5-turbo', inputPrice: 0.5, outputPrice: 1.5, context: '16K' }
    ],
    avgCostPer1M: 20,
    apiEndpoint: '/api/openai',
    docsUrl: 'https://platform.openai.com/docs',
    enabled: true
  },
  {
    id: 'claude',
    name: 'Claude',
    displayName: 'Anthropic Claude',
    description: 'Advanced reasoning with large context window',
    color: '#cc785c',
    gradient: 'from-orange-500 to-amber-600',
    models: [
      { name: 'Claude 3 Opus', modelId: 'claude-3-opus', inputPrice: 15, outputPrice: 75, context: '200K' },
      { name: 'Claude 3 Sonnet', modelId: 'claude-3-sonnet', inputPrice: 3, outputPrice: 15, context: '200K' },
      { name: 'Claude 3 Haiku', modelId: 'claude-3-haiku', inputPrice: 0.25, outputPrice: 1.25, context: '200K' }
    ],
    avgCostPer1M: 15,
    apiEndpoint: '/api/claude',
    docsUrl: 'https://docs.anthropic.com',
    enabled: true
  },
  {
    id: 'gemini',
    name: 'Gemini',
    displayName: 'Google Gemini',
    description: 'Cost-effective with massive context windows',
    color: '#4285f4',
    gradient: 'from-blue-500 to-indigo-600',
    models: [
      { name: 'Gemini 1.5 Pro', modelId: 'gemini-1.5-pro', inputPrice: 3.5, outputPrice: 10.5, context: '1M' },
      { name: 'Gemini 1.5 Flash', modelId: 'gemini-1.5-flash', inputPrice: 0.075, outputPrice: 0.3, context: '1M' },
      { name: 'Gemini Pro', modelId: 'gemini-pro', inputPrice: 0.5, outputPrice: 1.5, context: '32K' }
    ],
    avgCostPer1M: 7,
    apiEndpoint: '/api/gemini',
    docsUrl: 'https://ai.google.dev/docs',
    enabled: true
  },
  {
    id: 'grok',
    name: 'Grok',
    displayName: 'X.AI Grok',
    description: 'Real-time data with X integration',
    color: '#000000',
    gradient: 'from-gray-700 to-gray-900',
    models: [
      { name: 'Grok-1', modelId: 'grok-1', inputPrice: 5, outputPrice: 15, context: '8K' },
      { name: 'Grok-1.5', modelId: 'grok-1.5', inputPrice: 10, outputPrice: 30, context: '16K' }
    ],
    avgCostPer1M: 10,
    apiEndpoint: '/api/grok',
    docsUrl: 'https://x.ai/docs',
    enabled: true
  }
]

// Get only enabled providers
export const getEnabledProviders = () => AI_PROVIDERS_CONFIG.filter(p => p.enabled)

// Get provider by ID
export const getProviderById = (id: string) => AI_PROVIDERS_CONFIG.find(p => p.id === id)

// Get provider logo component - returns null for now, will be handled by ai-logos.tsx
export const getProviderLogo = (providerId: string, className: string = "w-6 h-6") => {
  // This function is now handled by components/ui/ai-logos.tsx
  // which has access to React components
  return null
}

// Token usage patterns for different scenarios
export const TOKEN_USAGE_PATTERNS = {
  light: {
    tokensPerMonth: 500000,
    description: '~20 queries/day per user'
  },
  moderate: {
    tokensPerMonth: 2000000,
    description: '~100 queries/day per user'
  },
  heavy: {
    tokensPerMonth: 10000000,
    description: '~500+ queries/day per user'
  }
}

// Company type configurations
export const COMPANY_TYPES = [
  { id: 'startup', name: 'Startup', icon: '🚀', multiplier: 1, discount: 0 },
  { id: 'scaleup', name: 'Scale-up', icon: '📈', multiplier: 0.9, discount: 10 },
  { id: 'enterprise', name: 'Enterprise', icon: '🏢', multiplier: 0.7, discount: 30 }
]

// Team size ranges
export const TEAM_SIZE_RANGES = [
  { id: '1-5', name: '1-5', avg: 3 },
  { id: '6-15', name: '6-15', avg: 10 },
  { id: '16-50', name: '16-50', avg: 30 },
  { id: '51-150', name: '51-150', avg: 100 },
  { id: '150+', name: '150+', avg: 300 }
]

// Pricing last updated date
export const PRICING_LAST_UPDATED = 'August 2025'

// Export all provider IDs for iteration
export const AI_PROVIDER_IDS = getEnabledProviders().map(p => p.id)

// Helper to calculate costs
export const calculateProviderCost = (
  providerId: string,
  tokensPerMonth: number,
  companyMultiplier: number = 1
) => {
  const provider = getProviderById(providerId)
  if (!provider) return 0
  
  const tokensInMillions = tokensPerMonth / 1000000
  const baseCost = provider.avgCostPer1M * tokensInMillions
  return baseCost * companyMultiplier
}