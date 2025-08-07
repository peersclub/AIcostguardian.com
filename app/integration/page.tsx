'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, Shield, Zap, Database, Globe } from 'lucide-react'
import { getAIProviderLogo } from '@/components/ui/ai-logos'
import { AI_PROVIDERS_CONFIG } from '@/lib/ai-providers-config'

export default function IntegrationHub() {
  const router = useRouter()

  const providers = AI_PROVIDERS_CONFIG.filter(p => p.enabled)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/settings" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Link>
          
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Integration Testing Hub</h1>
            <p className="text-gray-400">Select a provider to test your API integration</p>
          </div>
        </div>

        {/* Provider Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {providers.map((provider) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => router.push(`/integration/${provider.id}`)}
              className="cursor-pointer"
            >
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 hover:border-gray-600 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {getAIProviderLogo(provider.id, 'w-12 h-12')}
                    <div>
                      <h3 className="text-xl font-semibold text-white">{provider.name}</h3>
                      <p className="text-sm text-gray-400">{provider.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                    <Database className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-400">Models</div>
                    <div className="text-sm text-white font-semibold">{provider.models.length}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                    <Zap className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-400">Avg Cost</div>
                    <div className="text-sm text-white font-semibold">${provider.avgCostPer1M}/1M</div>
                  </div>
                  <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                    <Globe className="w-4 h-4 text-green-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-400">Status</div>
                    <div className="text-sm text-white font-semibold">Ready</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="bg-blue-900/20 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-blue-400 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Integration Testing</h3>
                <p className="text-blue-200/80 mb-3">
                  Test your API connections and validate your keys for each provider. The testing interface will:
                </p>
                <ul className="text-sm text-blue-200/70 space-y-1 list-disc list-inside">
                  <li>Verify API key validity and permissions</li>
                  <li>Detect admin/organization keys automatically</li>
                  <li>Test connection stability and response times</li>
                  <li>Validate model availability and capabilities</li>
                  <li>Show detailed error messages for troubleshooting</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}