'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAIProviderLogo, getProviderInfo } from '@/components/ui/ai-logos'
import { Check, X, Loader2, ArrowRight, Shield, Zap, Link2, Settings, Key, AlertCircle, Activity, CheckCircle, Globe } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { getEnabledProviders, AI_PROVIDER_IDS } from '@/lib/ai-providers-config'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
        features: provider.models.slice(0, 3).map(m => m.name),
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
      features: provider.models.slice(0, 3).map(m => m.name),
      apiKeyRequired: true,
      lastSync: statuses.find(s => s.id === provider.id)?.lastSync
    }))

    setIntegrations(integrationsData)
    setLoading(false)
  }

  const connectedCount = integrations.filter(i => i.status === 'connected').length
  const availableCount = integrations.filter(i => i.status === 'disconnected').length

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="mb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 px-4 py-2">
              <Link2 className="w-4 h-4 mr-2 inline" />
              AI Provider Integrations
            </Badge>
            <h1 className="text-5xl font-bold text-white mb-6">
              Connect Your AI Providers
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Integrate with your favorite AI providers to track usage and costs in real-time
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="py-12 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700 hover:border-green-500/50 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Connected</span>
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">{connectedCount}</div>
                  <div className="text-sm text-gray-500 mt-1">Active integrations</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700 hover:border-yellow-500/50 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Available</span>
                    <Zap className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">{availableCount}</div>
                  <div className="text-sm text-gray-500 mt-1">Ready to connect</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700 hover:border-purple-500/50 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Total</span>
                    <Shield className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">{integrations.length}</div>
                  <div className="text-sm text-gray-500 mt-1">Supported providers</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((integration, index) => {
                const logo = getAIProviderLogo(integration.id, 'w-10 h-10', true)
                const providerInfo = getProviderInfo(integration.id)
                
                return (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`bg-gradient-to-br from-gray-900/90 to-gray-800/90 transition-all hover:shadow-lg ${
                      integration.status === 'connected'
                        ? 'border-green-500/50'
                        : 'border-gray-700 hover:border-purple-500/50'
                    }`}>
                      <CardHeader>
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {logo ? (
                              <div className="p-2 rounded-lg bg-gray-800">
                                {logo}
                              </div>
                            ) : (
                              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg text-white font-bold">
                                <span className="text-lg">{integration.name.charAt(0)}</span>
                              </div>
                            )}
                            <div>
                              <CardTitle className="text-white">{integration.name}</CardTitle>
                              <CardDescription className="text-gray-400">
                                {integration.description}
                              </CardDescription>
                            </div>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="mt-4">
                          {integration.status === 'connected' ? (
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-400" />
                              <span className="text-sm font-medium text-green-400">Connected</span>
                              {integration.lastSync && (
                                <span className="text-xs text-gray-500">
                                  • Synced {new Date(integration.lastSync).toLocaleTimeString()}
                                </span>
                              )}
                            </div>
                          ) : integration.status === 'checking' ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                              <span className="text-sm font-medium text-yellow-400">Checking...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <X className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-500">Not connected</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent>
                        {/* Features */}
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {integration.features.map((feature, i) => (
                              <Badge
                                key={i}
                                className="bg-gray-800 text-gray-300 border-gray-700"
                              >
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Action Button */}
                        <Link href={session ? "/settings" : "/auth/signup"}>
                          <Button
                            className={`w-full ${
                              integration.status === 'connected'
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                            }`}
                          >
                            {integration.status === 'connected' ? (
                              <>
                                <Settings className="w-4 h-4 mr-2" />
                                Manage
                              </>
                            ) : (
                              <>
                                <Key className="w-4 h-4 mr-2" />
                                Connect
                              </>
                            )}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Integrate Your AI Providers?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700 hover:border-purple-500/50 transition-all h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white">Real-time Tracking</CardTitle>
                  <CardDescription className="text-gray-400">
                    Monitor API usage and costs as they happen across all your AI providers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      Live usage monitoring
                    </li>
                    <li className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      Instant cost calculations
                    </li>
                    <li className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      Usage trend analysis
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700 hover:border-purple-500/50 transition-all h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white">Secure & Private</CardTitle>
                  <CardDescription className="text-gray-400">
                    Your API keys are encrypted and we never access your AI models directly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      End-to-end encryption
                    </li>
                    <li className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      SOC 2 compliance
                    </li>
                    <li className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      Read-only access
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700 hover:border-purple-500/50 transition-all h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white">Unified Dashboard</CardTitle>
                  <CardDescription className="text-gray-400">
                    See all your AI provider costs and usage in one comprehensive view
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      Cross-provider analytics
                    </li>
                    <li className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      Consolidated reporting
                    </li>
                    <li className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      Cost optimization insights
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="py-12 bg-black">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">Bank-Grade Security</h3>
                    <p className="text-gray-300">
                      Your API keys are encrypted using AES-256 encryption and stored in secure vaults. 
                      We only use read-only access to track usage metrics - we never execute models or access your data. 
                      Our platform is SOC 2 certified and undergoes regular security audits.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Start Tracking Your AI Costs Today
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Connect your providers in minutes and get instant visibility into your AI spending
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/models">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-6 text-lg">
                  View AI Models
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}