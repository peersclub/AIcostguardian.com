/**
 * Multi-Provider AI Configuration
 * Manages credentials and endpoints for all AI providers
 */

export interface ProviderCredentials {
  ANTHROPIC: {
    apiKey: string;
    organizationId?: string;
    baseUrl: string;
    models: string[];
  };
  OPENAI: {
    apiKey: string;
    organizationId: string;
    baseUrl: string;
    models: string[];
  };
  GOOGLE_GEMINI: {
    apiKey: string;
    projectId: string;
    serviceAccountKey?: object;
    baseUrl: string;
    models: string[];
  };
  GROK: {
    apiKey: string;
    organizationId?: string;
    baseUrl: string;
    models: string[];
  };
}

export const PROVIDER_CONFIG: ProviderCredentials = {
  ANTHROPIC: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    organizationId: process.env.ANTHROPIC_ORG_ID,
    baseUrl: 'https://api.anthropic.com/v1',
    models: [
      'claude-3-opus-20240229',
      'claude-3-5-sonnet-20241022',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-3-5-haiku-20241022'
    ]
  },
  OPENAI: {
    apiKey: process.env.OPENAI_API_KEY || '',
    organizationId: process.env.OPENAI_ORG_ID || '',
    baseUrl: 'https://api.openai.com/v1',
    models: [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo'
    ]
  },
  GOOGLE_GEMINI: {
    apiKey: process.env.GOOGLE_API_KEY || '',
    projectId: process.env.GOOGLE_PROJECT_ID || '',
    serviceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT ? 
      JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT) : undefined,
    baseUrl: 'https://generativelanguage.googleapis.com/v1',
    models: [
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-1.0-pro'
    ]
  },
  GROK: {
    apiKey: process.env.GROK_API_KEY || '',
    organizationId: process.env.GROK_ORG_ID,
    baseUrl: 'https://api.x.ai/v1',
    models: [
      'grok-1',
      'grok-1.5',
      'grok-2'
    ]
  }
}

// Pricing configuration (per 1M tokens)
export const PRICING_CONFIG = {
  ANTHROPIC: {
    'claude-3-opus-20240229': { input: 15, output: 75 },
    'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
    'claude-3-sonnet-20240229': { input: 3, output: 15 },
    'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
    'claude-3-5-haiku-20241022': { input: 1, output: 5 }
  },
  OPENAI: {
    'gpt-4o': { input: 2.5, output: 10 },
    'gpt-4o-mini': { input: 0.15, output: 0.6 },
    'gpt-4-turbo': { input: 10, output: 30 },
    'gpt-4': { input: 30, output: 60 },
    'gpt-3.5-turbo': { input: 0.5, output: 1.5 }
  },
  GOOGLE_GEMINI: {
    'gemini-1.5-pro': { input: 3.5, output: 10.5 },
    'gemini-1.5-flash': { input: 0.075, output: 0.3 },
    'gemini-1.5-flash-8b': { input: 0.0375, output: 0.15 },
    'gemini-1.0-pro': { input: 0.5, output: 1.5 }
  },
  GROK: {
    'grok-1': { input: 5, output: 15 },
    'grok-1.5': { input: 10, output: 30 },
    'grok-2': { input: 20, output: 60 }
  }
}

export type ProviderName = keyof ProviderCredentials
export type ModelName<T extends ProviderName> = T extends 'ANTHROPIC' 
  ? keyof typeof PRICING_CONFIG.ANTHROPIC
  : T extends 'OPENAI'
  ? keyof typeof PRICING_CONFIG.OPENAI
  : T extends 'GOOGLE_GEMINI'
  ? keyof typeof PRICING_CONFIG.GOOGLE_GEMINI
  : T extends 'GROK'
  ? keyof typeof PRICING_CONFIG.GROK
  : never