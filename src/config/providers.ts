import { ProviderConfig } from '@/types/providers'

export const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  openai: {
    id: 'openai',
    name: 'openai',
    displayName: 'OpenAI',
    description: 'GPT-4, DALL-E, and more',
    icon: '🤖',
    color: '#10A37F',
    baseUrl: 'https://api.openai.com',
    docsUrl: 'https://platform.openai.com/docs',
    pricingUrl: 'https://openai.com/pricing',
    features: ['Text Generation', 'Image Generation', 'Embeddings', 'Audio', 'Fine-tuning'],
    adminKeyPattern: /^sk-org-/,
    regularKeyPattern: /^sk-/,
    keyValidation: (key: string) => key.startsWith('sk-'),
    models: [
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        type: 'text',
        contextWindow: 128000,
        maxTokens: 4096,
        pricing: {
          inputCost: 0.01,
          outputCost: 0.03
        },
        capabilities: ['Chat', 'Completion', 'Function Calling', 'Vision']
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        type: 'text',
        contextWindow: 8192,
        maxTokens: 4096,
        pricing: {
          inputCost: 0.03,
          outputCost: 0.06
        },
        capabilities: ['Chat', 'Completion', 'Function Calling']
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        type: 'text',
        contextWindow: 16385,
        maxTokens: 4096,
        pricing: {
          inputCost: 0.0005,
          outputCost: 0.0015
        },
        capabilities: ['Chat', 'Completion', 'Function Calling']
      },
      {
        id: 'dall-e-3',
        name: 'DALL-E 3',
        type: 'image',
        contextWindow: 0,
        maxTokens: 0,
        pricing: {
          inputCost: 0,
          outputCost: 0,
          imageCost: 0.04
        },
        capabilities: ['Image Generation']
      }
    ],
    pricing: {
      avgCostPerUser: 50,
      enterprise: {
        customPricing: true,
        contactSales: true,
        minimumSeats: 100
      }
    },
    limits: {
      rateLimit: {
        requests: 10000,
        window: 'minute'
      },
      dailyTokenLimit: 10000000,
      maxConcurrentRequests: 100
    }
  },
  claude: {
    id: 'claude',
    name: 'claude',
    displayName: 'Anthropic Claude',
    description: 'Claude 3 Opus, Sonnet, and Haiku',
    icon: '🧠',
    color: '#D97706',
    baseUrl: 'https://api.anthropic.com',
    docsUrl: 'https://docs.anthropic.com',
    pricingUrl: 'https://anthropic.com/pricing',
    features: ['Text Generation', 'Vision', 'Long Context', 'Constitutional AI'],
    adminKeyPattern: /^sk-ant-api03-[\w-]{95}$/,
    regularKeyPattern: /^sk-ant-/,
    keyValidation: (key: string) => key.startsWith('sk-ant-'),
    models: [
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        type: 'text',
        contextWindow: 200000,
        maxTokens: 4096,
        pricing: {
          inputCost: 0.015,
          outputCost: 0.075
        },
        capabilities: ['Chat', 'Analysis', 'Vision', 'Coding']
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        type: 'text',
        contextWindow: 200000,
        maxTokens: 4096,
        pricing: {
          inputCost: 0.003,
          outputCost: 0.015
        },
        capabilities: ['Chat', 'Analysis', 'Vision', 'Coding']
      },
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        type: 'text',
        contextWindow: 200000,
        maxTokens: 4096,
        pricing: {
          inputCost: 0.00025,
          outputCost: 0.00125
        },
        capabilities: ['Chat', 'Analysis', 'Vision']
      }
    ],
    pricing: {
      avgCostPerUser: 45,
      enterprise: {
        customPricing: true,
        contactSales: true,
        minimumSeats: 50
      }
    },
    limits: {
      rateLimit: {
        requests: 1000,
        window: 'minute'
      },
      dailyTokenLimit: 5000000,
      maxConcurrentRequests: 50
    }
  },
  gemini: {
    id: 'gemini',
    name: 'gemini',
    displayName: 'Google Gemini',
    description: 'Gemini Pro and Flash models',
    icon: '✨',
    color: '#4285F4',
    baseUrl: 'https://generativelanguage.googleapis.com',
    docsUrl: 'https://ai.google.dev/docs',
    pricingUrl: 'https://ai.google.dev/pricing',
    features: ['Text Generation', 'Vision', 'Multi-modal', 'Function Calling'],
    regularKeyPattern: /^AIza/,
    keyValidation: (key: string) => key.startsWith('AIza'),
    models: [
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        type: 'text',
        contextWindow: 32768,
        maxTokens: 8192,
        pricing: {
          inputCost: 0.0005,
          outputCost: 0.0015
        },
        capabilities: ['Chat', 'Vision', 'Function Calling']
      },
      {
        id: 'gemini-pro-vision',
        name: 'Gemini Pro Vision',
        type: 'text',
        contextWindow: 16384,
        maxTokens: 2048,
        pricing: {
          inputCost: 0.0005,
          outputCost: 0.0015
        },
        capabilities: ['Vision', 'Image Understanding']
      },
      {
        id: 'gemini-flash',
        name: 'Gemini Flash',
        type: 'text',
        contextWindow: 1000000,
        maxTokens: 8192,
        pricing: {
          inputCost: 0.00015,
          outputCost: 0.0006
        },
        capabilities: ['Chat', 'Fast Response']
      }
    ],
    pricing: {
      avgCostPerUser: 35,
      baseMonthlyFee: 0,
      enterprise: {
        customPricing: true,
        contactSales: true
      }
    },
    limits: {
      rateLimit: {
        requests: 60,
        window: 'minute'
      },
      dailyTokenLimit: 1000000
    }
  },
  grok: {
    id: 'grok',
    name: 'grok',
    displayName: 'X.AI Grok',
    description: 'Real-time knowledge and reasoning',
    icon: '🎯',
    color: '#000000',
    baseUrl: 'https://api.x.ai',
    docsUrl: 'https://docs.x.ai',
    pricingUrl: 'https://x.ai/pricing',
    features: ['Text Generation', 'Real-time Data', 'Web Access', 'Reasoning'],
    adminKeyPattern: /^xai-org-/,
    regularKeyPattern: /^xai-/,
    keyValidation: (key: string) => key.startsWith('xai-'),
    models: [
      {
        id: 'grok-1',
        name: 'Grok-1',
        type: 'text',
        contextWindow: 8192,
        maxTokens: 4096,
        pricing: {
          inputCost: 0.005,
          outputCost: 0.015
        },
        capabilities: ['Chat', 'Real-time Data', 'Analysis']
      }
    ],
    pricing: {
      avgCostPerUser: 40,
      enterprise: {
        customPricing: true,
        contactSales: true
      }
    },
    limits: {
      rateLimit: {
        requests: 600,
        window: 'minute'
      },
      dailyTokenLimit: 2000000
    }
  },
  perplexity: {
    id: 'perplexity',
    name: 'perplexity',
    displayName: 'Perplexity AI',
    description: 'Search-augmented AI models',
    icon: '🔍',
    color: '#20B2AA',
    baseUrl: 'https://api.perplexity.ai',
    docsUrl: 'https://docs.perplexity.ai',
    pricingUrl: 'https://perplexity.ai/pricing',
    features: ['Search Integration', 'Citations', 'Real-time Data', 'Multi-source'],
    adminKeyPattern: /^pplx-org-/,
    regularKeyPattern: /^pplx-/,
    keyValidation: (key: string) => key.startsWith('pplx-'),
    models: [
      {
        id: 'pplx-70b-online',
        name: 'Perplexity 70B Online',
        type: 'text',
        contextWindow: 4096,
        maxTokens: 4096,
        pricing: {
          inputCost: 0.001,
          outputCost: 0.001
        },
        capabilities: ['Search', 'Citations', 'Real-time']
      },
      {
        id: 'pplx-7b-online',
        name: 'Perplexity 7B Online',
        type: 'text',
        contextWindow: 4096,
        maxTokens: 4096,
        pricing: {
          inputCost: 0.0002,
          outputCost: 0.0002
        },
        capabilities: ['Search', 'Citations', 'Fast']
      }
    ],
    pricing: {
      avgCostPerUser: 30,
      baseMonthlyFee: 20,
      enterprise: {
        customPricing: true,
        contactSales: false
      }
    },
    limits: {
      rateLimit: {
        requests: 3000,
        window: 'minute'
      },
      dailyTokenLimit: 1000000
    }
  }
}

export const getProviderConfig = (providerId: string): ProviderConfig | undefined => {
  return PROVIDER_CONFIGS[providerId]
}

export const getAllProviders = (): ProviderConfig[] => {
  return Object.values(PROVIDER_CONFIGS)
}

export const getProviderByKey = (apiKey: string): ProviderConfig | undefined => {
  return getAllProviders().find(provider => {
    if (provider.keyValidation) {
      return provider.keyValidation(apiKey)
    }
    return false
  })
}

export const isAdminKey = (providerId: string, apiKey: string): boolean => {
  const provider = getProviderConfig(providerId)
  if (!provider) return false
  
  if (provider.adminKeyPattern) {
    return provider.adminKeyPattern.test(apiKey)
  }
  
  // Fallback logic for providers without admin pattern
  switch (providerId) {
    case 'claude':
      return apiKey.length === 108 && apiKey.includes('api03')
    case 'gemini':
      return apiKey.includes('service-account') || apiKey.length > 50
    default:
      return false
  }
}