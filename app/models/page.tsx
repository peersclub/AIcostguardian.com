'use client'

import { motion } from 'framer-motion'
import { getAIProviderLogo, getProviderInfo } from '@/components/ui/ai-logos'
import { Brain, Zap, DollarSign, TrendingUp, Clock, Shield, ChevronRight, Sparkles } from 'lucide-react'
import { getEnabledProviders, PRICING_LAST_UPDATED } from '@/lib/ai-providers-config'

// Build AI_MODELS from centralized config
const AI_MODELS = getEnabledProviders().map(provider => ({
  provider: provider.id,
  models: provider.models.map((model, idx) => ({
    name: model.name,
    version: model.modelId,
    context: model.context,
    pricing: `$${((model.inputPrice + model.outputPrice) / 2).toFixed(2)}/1M tokens`,
    speed: idx === 0 ? 'Fast' : idx === 1 ? 'Very Fast' : 'Ultra Fast',
    recommended: idx === 0,
    beta: provider.id === 'grok'
  }))
}))

export default function ModelsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>25+ AI Models Available</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Model Catalog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compare models across providers to find the perfect balance of performance, cost, and capabilities
          </p>
          <p className="text-sm text-gray-500 mt-2">Pricing updated: {PRICING_LAST_UPDATED}</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Brain, label: 'Total Models', value: '25+', color: 'text-purple-600' },
            { icon: DollarSign, label: 'Avg Cost/1M', value: '$5.20', color: 'text-green-600' },
            { icon: Clock, label: 'Avg Response', value: '1.2s', color: 'text-blue-600' },
            { icon: TrendingUp, label: 'Context Window', value: 'Up to 1M', color: 'text-orange-600' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-4"
            >
              <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-gray-600">{stat.label}</div>
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Models Grid */}
        <div className="space-y-8">
          {AI_MODELS.map((provider, providerIndex) => {
            const providerInfo = getProviderInfo(provider.provider)
            return (
              <motion.div
                key={provider.provider}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: providerIndex * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Provider Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getAIProviderLogo(provider.provider, 'w-8 h-8')}
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">{providerInfo.name}</h2>
                        <p className="text-sm text-gray-600">{provider.models.length} models available</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                      Connect Provider
                    </button>
                  </div>
                </div>

                {/* Models List */}
                <div className="divide-y divide-gray-200">
                  {provider.models.map((model, modelIndex) => (
                    <div
                      key={modelIndex}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{model.name}</h3>
                            {model.recommended && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                Recommended
                              </span>
                            )}
                            {model.beta && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                                Beta
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Shield className="w-4 h-4" />
                              {model.version}
                            </span>
                            <span className="flex items-center gap-1">
                              <Brain className="w-4 h-4" />
                              {model.context} context
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="w-4 h-4" />
                              {model.speed}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">{model.pricing}</div>
                          <div className="text-sm text-gray-600">Input + Output</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to optimize your AI costs?</h2>
            <p className="mb-6 opacity-90">Connect your providers and start tracking usage across all models</p>
            <button className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
              Get Started Free
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}