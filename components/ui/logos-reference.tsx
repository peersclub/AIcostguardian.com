'use client'

import React from 'react'
import { getAIProviderLogo, getProviderInfo } from './ai-logos'

// List of all available AI providers
const AI_PROVIDERS = [
  'openai',
  'claude',
  'gemini',
  'grok',
  'perplexity',
  'meta',
  'mistral',
  'cohere',
  'huggingface',
  'replicate',
  'together'
]

export function LogosReference() {
  return (
    <div className="p-8 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-6">AI Provider Logos Reference</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {AI_PROVIDERS.map((provider) => {
          const info = getProviderInfo(provider)
          return (
            <div
              key={provider}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="mb-3">
                {getAIProviderLogo(provider, 'w-12 h-12')}
              </div>
              <div className="text-sm font-medium text-gray-900">{info.name}</div>
              <div className="text-xs text-gray-500 mt-1">ID: {provider}</div>
              <div 
                className="mt-2 w-full h-1 rounded-full"
                style={{ backgroundColor: info.color }}
              />
            </div>
          )
        })}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Available Sizes</h3>
        <div className="flex items-center gap-4">
          {['w-4 h-4', 'w-6 h-6', 'w-8 h-8', 'w-10 h-10', 'w-12 h-12'].map((size) => (
            <div key={size} className="flex flex-col items-center">
              {getAIProviderLogo('openai', size)}
              <span className="text-xs text-gray-600 mt-1">{size}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-1">Usage Example</h3>
        <pre className="text-xs text-blue-800">
          <code>{`import { getAIProviderLogo } from '@/components/ui/ai-logos'

// In your component
{getAIProviderLogo('openai', 'w-8 h-8')}`}</code>
        </pre>
      </div>
    </div>
  )
}