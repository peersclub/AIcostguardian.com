/**
 * AI Provider Logos Component
 * This component now uses the centralized configuration from lib/ai-providers-config.ts
 * To add new providers or modify existing ones, edit the configuration file.
 */

import React from 'react'
import { 
  OpenAI, 
  Claude, 
  Gemini, 
  Cohere,
  Perplexity,
  Mistral,
  Meta,
  Stability,
  Midjourney,
  Dalle,
  Grok,
  HuggingFace
} from '@lobehub/icons'
import { getProviderById, getEnabledProviders } from '@/lib/ai-providers-config'

// Main function to get AI provider logos
export const getAIProviderLogo = (providerId: string, className: string = "w-6 h-6", darkMode: boolean = true) => {
  const sizeMap: { [key: string]: number } = {
    'w-4 h-4': 16,
    'w-5 h-5': 20,
    'w-6 h-6': 24,
    'w-8 h-8': 32,
    'w-10 h-10': 40,
    'w-12 h-12': 48
  }
  
  const size = sizeMap[className] || 24
  
  // Apply white color for dark backgrounds
  const logoStyle = darkMode ? { color: 'white' } : {}

  switch (providerId.toLowerCase()) {
    case 'openai':
    case 'gpt':
    case 'gpt-4':
    case 'gpt-3.5':
      return <OpenAI size={size} style={logoStyle} />
    
    case 'claude':
    case 'anthropic':
      return <Claude size={size} style={logoStyle} />
    
    case 'gemini':
    case 'google':
    case 'bard':
      return <Gemini size={size} style={logoStyle} />
    
    case 'cohere':
      return <Cohere size={size} style={logoStyle} />
    
    case 'perplexity':
      return <Perplexity size={size} style={logoStyle} />
    
    case 'mistral':
    case 'mixtral':
      return <Mistral size={size} style={logoStyle} />
    
    case 'meta':
    case 'llama':
    case 'llama2':
    case 'llama3':
      return <Meta size={size} style={logoStyle} />
    
    case 'stability':
    case 'stable-diffusion':
    case 'sdxl':
      return <Stability size={size} style={logoStyle} />
    
    case 'midjourney':
      return <Midjourney size={size} style={logoStyle} />
    
    case 'dalle':
    case 'dall-e':
    case 'dalle2':
    case 'dalle3':
      return <Dalle size={size} style={logoStyle} />
    
    case 'grok':
    case 'xai':
    case 'x.ai':
      return <Grok size={size} style={logoStyle} />
    
    case 'huggingface':
    case 'hf':
      return <HuggingFace size={size} style={logoStyle} />
    
    default:
      // Return null if no logo found - let the calling component handle fallback
      return null
  }
}

// Get provider info from centralized config
export const getProviderInfo = (providerId: string) => {
  const provider = getProviderById(providerId)
  if (!provider) {
    return {
      name: providerId,
      color: '#7c3aed',
      gradient: 'from-purple-500 to-pink-500'
    }
  }
  
  return {
    name: provider.displayName,
    color: provider.color,
    gradient: provider.gradient
  }
}

// Helper function to get logo with fallback
export const getAIProviderLogoWithFallback = (
  providerId: string, 
  className: string = "w-6 h-6",
  darkMode: boolean = true
) => {
  const logo = getAIProviderLogo(providerId, className, darkMode)
  
  if (logo) {
    return logo
  }
  
  // Fallback to text-based logo
  const providerInfo = getProviderInfo(providerId)
  const initial = providerInfo.name.charAt(0).toUpperCase()
  
  return (
    <div 
      className={`${className} flex items-center justify-center bg-gradient-to-br ${providerInfo.gradient} rounded-lg text-white font-bold`}
    >
      <span className="text-xs">{initial}</span>
    </div>
  )
}

// Export list of enabled providers for UI components
export const ENABLED_AI_PROVIDERS = getEnabledProviders()