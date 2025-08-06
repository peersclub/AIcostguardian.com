/**
 * AI Provider Logos Component
 * This component now uses the centralized configuration from lib/ai-providers-config.ts
 * To add new providers or modify existing ones, edit the configuration file.
 */

import React from 'react'
import { OpenAI, Claude, Gemini } from '@lobehub/icons'
import { getProviderById, getEnabledProviders } from '@/lib/ai-providers-config'

// X/Grok Logo Component
const GrokLogo = ({ className = "w-6 h-6", ...props }: { className?: string; size?: number }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

// Main function to get AI provider logos
export const getAIProviderLogo = (providerId: string, className: string = "w-6 h-6") => {
  const sizeMap: { [key: string]: number } = {
    'w-4 h-4': 16,
    'w-5 h-5': 20,
    'w-6 h-6': 24,
    'w-8 h-8': 32,
    'w-10 h-10': 40,
    'w-12 h-12': 48
  }
  
  const size = sizeMap[className] || 24

  switch (providerId.toLowerCase()) {
    case 'openai':
      return <OpenAI size={size} />
    case 'claude':
    case 'anthropic':
      return <Claude size={size} />
    case 'gemini':
    case 'google':
      return <Gemini size={size} />
    case 'grok':
    case 'xai':
    case 'x.ai':
      return <GrokLogo className={className} />
    default:
      // Fallback to a generic AI icon
      return (
        <div className={`${className} flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg text-white font-bold`}>
          <span className="text-xs">AI</span>
        </div>
      )
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

// Export list of enabled providers for UI components
export const ENABLED_AI_PROVIDERS = getEnabledProviders()