'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAIProviderLogo, getProviderInfo } from '@/components/ui/ai-logos'
import { Check, X, Loader2, ArrowRight, Shield, Zap, Link2, Settings, Key, AlertCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { getEnabledProviders, AI_PROVIDER_IDS } from '@/lib/ai-providers-config'

interface Integration {
  id: string
  name: string
  description: string
  status: 'connected' | 'disconnected' | 'checking'
  features: string[]
  apiKeyRequired: boolean
  lastSync?: string
}

export default function IntegrationsPage() {
  const { data: session } = useSession()
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkIntegrations()
  }, [session])

  const checkIntegrations = async () => {
    const enabledProviders = getEnabledProviders()
    
    if (!session?.user?.id) {
      // Demo data for non-authenticated users
      const demoIntegrations = enabledProviders.map(provider => ({
        id: provider.id,
        name: provider.displayName,
        description: provider.description,
        status: 'disconnected' as const,
        features: provider.models.map(m => m.name),
        apiKeyRequired: true
      }))
      setIntegrations(demoIntegrations)
      setLoading(false)
      return
    }

    // Check actual integration status for authenticated users
    setLoading(true)
    const providers = AI_PROVIDER_IDS
    const statusPromises = providers.map(async (provider) => {
      try {
        const response = await fetch(`/api/${provider}/test`)
        const data = await response.json()
        return {
          id: provider,
          status: data.isValid ? 'connected' : 'disconnected',
          lastSync: data.isValid ? new Date().toISOString() : undefined
        }
      } catch (error) {
        return { id: provider, status: 'disconnected' as const }
      }
    })

    const statuses = await Promise.all(statusPromises)
    
    const integrationsData: Integration[] = enabledProviders.map(provider => ({
      id: provider.id,
      name: provider.displayName,
      description: provider.description,
      status: (statuses.find(s => s.id === provider.id)?.status || 'disconnected') as 'connected' | 'disconnected' | 'checking',
      features: provider.models.map(m => m.name),
      apiKeyRequired: true,
      lastSync: statuses.find(s => s.id === provider.id)?.lastSync
    }))

    setIntegrations(integrationsData)
    setLoading(false)
  }

  const connectedCount = integrations.filter(i => i.status === 'connected').length
  const availableCount = integrations.filter(i => i.status === 'disconnected').length

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
            <Link2 className="w-4 h-4" />
            <span>AI Provider Integrations</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Connect Your AI Providers
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Integrate with your favorite AI providers to track usage and costs in real-time
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Connected</span>
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{connectedCount}</div>
            <div className="text-sm text-gray-500 mt-1">Active integrations</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Available</span>
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{availableCount}</div>
            <div className="text-sm text-gray-500 mt-1">Ready to connect</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total</span>
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{integrations.length}</div>
            <div className="text-sm text-gray-500 mt-1">Supported providers</div>
          </motion.div>
        </div>

        {/* Integrations Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-lg ${
                  integration.status === 'connected'
                    ? 'border-green-200'
                    : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getAIProviderLogo(integration.id, 'w-10 h-10')}
                      <div>
                        <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                        <p className="text-sm text-gray-600">{integration.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mb-4">
                    {integration.status === 'connected' ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Connected</span>
                        {integration.lastSync && (
                          <span className="text-xs text-gray-500">
                            • Synced {new Date(integration.lastSync).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    ) : integration.status === 'checking' ? (
                      <div className="flex items-center gap-2 text-yellow-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">Checking...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500">
                        <X className="w-4 h-4" />
                        <span className="text-sm font-medium">Not connected</span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {integration.features.map((feature, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      integration.status === 'connected'
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {integration.status === 'connected' ? (
                      <>
                        <Settings className="w-4 h-4" />
                        <span>Manage</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        <span>Connect</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-blue-50 rounded-xl p-6 border border-blue-200"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Secure Integration</h3>
              <p className="text-sm text-blue-800">
                Your API keys are encrypted and stored securely. We never access your AI models directly - 
                we only track usage through official APIs for cost monitoring.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}