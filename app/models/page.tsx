'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAIProviderLogo, getProviderInfo } from '@/components/ui/ai-logos'
import { 
  Brain, Zap, DollarSign, TrendingUp, Clock, Shield, ChevronRight, Sparkles, 
  CheckCircle, ArrowRight, Activity, Database, Search, Filter, Calculator,
  Info, Copy, Check, TrendingDown, AlertCircle, Layers, Star, Globe
} from 'lucide-react'
import { getEnabledProviders, PRICING_LAST_UPDATED } from '@/lib/ai-providers-config'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Build AI_MODELS from centralized config
const AI_MODELS = getEnabledProviders().map(provider => ({
  provider: provider.id,
  models: provider.models.map((model, idx) => ({
    name: model.name,
    version: model.modelId,
    context: model.context,
    pricing: `$${((model.inputPrice + model.outputPrice) / 2).toFixed(2)}/1M tokens`,
    inputPrice: model.inputPrice,
    outputPrice: model.outputPrice,
    speed: idx === 0 ? 'Fast' : idx === 1 ? 'Very Fast' : 'Ultra Fast',
    performance: idx === 0 ? 95 : idx === 1 ? 85 : 75,
    recommended: idx === 0,
    beta: provider.id === 'grok',
    capabilities: [
      'Text Generation',
      model.context.includes('128k') || model.context.includes('200k') ? 'Long Context' : 'Standard Context',
      model.inputPrice < 5 ? 'Cost Effective' : 'Premium',
      idx === 0 ? 'Complex Reasoning' : 'Quick Tasks'
    ]
  }))
}))

export default function ModelsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<string>('all')
  const [priceFilter, setPriceFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'price' | 'performance' | 'context'>('price')
  const [showComparison, setShowComparison] = useState(false)
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [copiedModel, setCopiedModel] = useState<string | null>(null)
  const [tokenAmount, setTokenAmount] = useState(1000000) // 1M tokens default

  // Filter and sort models
  const filteredModels = useMemo(() => {
    let filtered = AI_MODELS

    // Provider filter
    if (selectedProvider !== 'all') {
      filtered = filtered.filter(p => p.provider === selectedProvider)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.map(provider => ({
        ...provider,
        models: provider.models.filter(model => 
          model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          model.version.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(p => p.models.length > 0)
    }

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.map(provider => ({
        ...provider,
        models: provider.models.filter(model => {
          const avgPrice = (model.inputPrice + model.outputPrice) / 2
          if (priceFilter === 'budget') return avgPrice < 5
          if (priceFilter === 'mid') return avgPrice >= 5 && avgPrice < 20
          if (priceFilter === 'premium') return avgPrice >= 20
          return true
        })
      })).filter(p => p.models.length > 0)
    }

    // Sort models within each provider
    filtered = filtered.map(provider => ({
      ...provider,
      models: [...provider.models].sort((a, b) => {
        if (sortBy === 'price') {
          return ((a.inputPrice + a.outputPrice) / 2) - ((b.inputPrice + b.outputPrice) / 2)
        }
        if (sortBy === 'performance') {
          return b.performance - a.performance
        }
        if (sortBy === 'context') {
          const getContextSize = (context: string) => {
            const match = context.match(/(\d+)k/)
            return match ? parseInt(match[1]) : 0
          }
          return getContextSize(b.context) - getContextSize(a.context)
        }
        return 0
      })
    }))

    return filtered
  }, [searchTerm, selectedProvider, priceFilter, sortBy])

  const handleCopyModel = (modelId: string) => {
    navigator.clipboard.writeText(modelId)
    setCopiedModel(modelId)
    setTimeout(() => setCopiedModel(null), 2000)
  }

  const toggleModelSelection = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId].slice(0, 3) // Max 3 models for comparison
    )
  }

  const calculateCost = (inputPrice: number, outputPrice: number) => {
    const tokens = tokenAmount / 1000000
    return ((inputPrice + outputPrice) / 2 * tokens).toFixed(2)
  }

  // Get unique providers for filter
  const providers = getEnabledProviders()

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="mb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              25+ AI Models Available
            </Badge>
            <h1 className="text-5xl font-bold text-white mb-6">
              AI Model Explorer
            </h1>
            <p className="text-xl text-gray-300 mb-4 max-w-3xl mx-auto">
              Find the perfect AI model for your needs. Compare performance, pricing, and capabilities across providers.
            </p>
            <p className="text-sm text-gray-400">Last updated: {PRICING_LAST_UPDATED}</p>
          </motion.div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Provider Filter */}
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Providers</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>{provider.displayName}</option>
              ))}
            </select>

            {/* Price Filter */}
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Prices</option>
              <option value="budget">Budget (&lt; $5/1M)</option>
              <option value="mid">Mid ($5-20/1M)</option>
              <option value="premium">Premium (&gt; $20/1M)</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            >
              <option value="price">Sort by Price</option>
              <option value="performance">Sort by Performance</option>
              <option value="context">Sort by Context Size</option>
            </select>

            {/* Comparison Mode */}
            <Button
              onClick={() => setShowComparison(!showComparison)}
              className={`${showComparison ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-800 hover:bg-gray-700'} text-white border border-gray-700`}
            >
              <Layers className="w-4 h-4 mr-2" />
              Compare ({selectedModels.length})
            </Button>
          </div>

          {/* Cost Calculator */}
          <div className="mt-4 flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
            <Calculator className="w-5 h-5 text-purple-400" />
            <span className="text-gray-300 text-sm">Calculate cost for:</span>
            <input
              type="number"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(parseInt(e.target.value) || 0)}
              className="w-32 px-3 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
            />
            <span className="text-gray-300 text-sm">tokens</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="py-8 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { 
                icon: Brain, 
                label: 'Models Available', 
                value: filteredModels.reduce((acc, p) => acc + p.models.length, 0),
                color: 'text-purple-400' 
              },
              { 
                icon: DollarSign, 
                label: 'Cheapest Model', 
                value: `$${Math.min(...filteredModels.flatMap(p => p.models.map(m => (m.inputPrice + m.outputPrice) / 2))).toFixed(2)}/1M`,
                color: 'text-green-400' 
              },
              { 
                icon: Zap, 
                label: 'Fastest Response', 
                value: '~0.8s',
                color: 'text-yellow-400' 
              },
              { 
                icon: Database, 
                label: 'Max Context', 
                value: '200k tokens',
                color: 'text-blue-400' 
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700 hover:border-purple-500/50 transition-all">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gray-800 ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-gray-400">{stat.label}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Panel */}
      <AnimatePresence>
        {showComparison && selectedModels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-purple-900/20 border-y border-purple-500/30"
          >
            <div className="max-w-7xl mx-auto px-6 py-6">
              <h3 className="text-lg font-semibold text-white mb-4">Model Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedModels.map(modelId => {
                  const provider = AI_MODELS.find(p => p.models.some(m => m.version === modelId))
                  const model = provider?.models.find(m => m.version === modelId)
                  if (!model) return null

                  return (
                    <Card key={modelId} className="bg-gray-900/90 border-purple-500/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white text-base">{model.name}</CardTitle>
                        <CardDescription className="text-gray-400 text-sm">{model.version}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Price:</span>
                          <span className="text-white font-medium">{model.pricing}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Context:</span>
                          <span className="text-white font-medium">{model.context}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Speed:</span>
                          <span className="text-white font-medium">{model.speed}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Your Cost:</span>
                          <span className="text-green-400 font-medium">
                            ${calculateCost(model.inputPrice, model.outputPrice)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Models Grid */}
      <div className="py-8 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          {filteredModels.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No models found</h3>
              <p className="text-gray-400">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredModels.map((provider, providerIndex) => {
                const providerInfo = getProviderInfo(provider.provider)
                const logo = getAIProviderLogo(provider.provider, 'w-8 h-8', true)
                
                return (
                  <motion.div
                    key={provider.provider}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: providerIndex * 0.05 }}
                  >
                    <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700 overflow-hidden">
                      {/* Provider Header */}
                      <CardHeader className="border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {logo ? (
                              <div className="p-2 rounded-lg bg-gray-800">
                                {logo}
                              </div>
                            ) : (
                              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg text-white font-bold">
                                <span className="text-lg">{providerInfo.name.charAt(0)}</span>
                              </div>
                            )}
                            <div>
                              <CardTitle className="text-xl text-white">{providerInfo.name}</CardTitle>
                              <CardDescription className="text-gray-400">
                                {provider.models.length} models • {provider.models.filter(m => m.recommended).length} recommended
                              </CardDescription>
                            </div>
                          </div>
                          <Link href="/settings">
                            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                              Connect
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </CardHeader>

                      {/* Models List */}
                      <CardContent className="p-0">
                        <div className="divide-y divide-gray-700">
                          {provider.models.map((model, modelIndex) => (
                            <motion.div
                              key={modelIndex}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: modelIndex * 0.05 }}
                              className="p-6 hover:bg-gray-800/50 transition-all"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  {/* Model Name and Badges */}
                                  <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <h3 className="text-base sm:text-lg font-semibold text-white break-words">{model.name}</h3>
                                    {model.recommended && (
                                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                        <Star className="w-3 h-3 mr-1" />
                                        <span className="hidden sm:inline">Recommended</span>
                                        <span className="sm:hidden">Rec</span>
                                      </Badge>
                                    )}
                                    {model.beta && (
                                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                        Beta
                                      </Badge>
                                    )}
                                    <button
                                      onClick={() => handleCopyModel(model.version)}
                                      className="ml-auto text-gray-400 hover:text-white transition-colors"
                                    >
                                      {copiedModel === model.version ? (
                                        <Check className="w-4 h-4 text-green-400" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>

                                  {/* Model Details */}
                                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
                                    <div className="flex items-start gap-1">
                                      <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                                      <div className="text-xs sm:text-sm min-w-0">
                                        <span className="text-gray-400 block">Model</span>
                                        <span className="text-gray-300 font-mono break-all">{model.version}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-1">
                                      <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                      <div className="text-xs sm:text-sm">
                                        <span className="text-gray-400 block">Context</span>
                                        <span className="text-gray-300">{model.context}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-1">
                                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                      <div className="text-xs sm:text-sm">
                                        <span className="text-gray-400 block">Speed</span>
                                        <span className="text-gray-300">{model.speed}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-1">
                                      <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                      <div className="text-xs sm:text-sm">
                                        <span className="text-gray-400 block">Perf</span>
                                        <span className="text-gray-300">{model.performance}%</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Capabilities */}
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {model.capabilities.map((cap, i) => (
                                      <Badge key={i} className="bg-gray-800 text-gray-300 border-gray-700 text-xs">
                                        {cap}
                                      </Badge>
                                    ))}
                                  </div>

                                  {/* Performance Bar */}
                                  <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
                                    <div 
                                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                                      style={{ width: `${model.performance}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Pricing Card - Hidden on mobile, shown on desktop */}
                                <div className="hidden lg:block ml-6 text-right">
                                  <div className="bg-gray-800/50 rounded-lg p-4 min-w-[200px]">
                                    <div className="text-2xl font-bold text-white mb-1">{model.pricing}</div>
                                    <div className="text-sm text-gray-400 mb-3">Average cost</div>
                                    <div className="space-y-1 text-xs">
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Input:</span>
                                        <span className="text-gray-400">${model.inputPrice.toFixed(2)}/1M</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Output:</span>
                                        <span className="text-gray-400">${model.outputPrice.toFixed(2)}/1M</span>
                                      </div>
                                      <div className="pt-2 mt-2 border-t border-gray-700">
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Your cost:</span>
                                          <span className="text-green-400 font-semibold">
                                            ${calculateCost(model.inputPrice, model.outputPrice)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    {showComparison && (
                                      <button
                                        onClick={() => toggleModelSelection(model.version)}
                                        className={`mt-3 w-full py-2 px-3 rounded text-xs font-medium transition-all ${
                                          selectedModels.includes(model.version)
                                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                      >
                                        {selectedModels.includes(model.version) ? 'Remove' : 'Compare'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Mobile Pricing - Shown only on mobile */}
                              <div className="lg:hidden mt-3 p-3 bg-gray-800/50 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-lg font-bold text-white">{model.pricing}</span>
                                  <span className="text-xs text-gray-400">Average</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <span className="text-gray-500 block">Input</span>
                                    <span className="text-gray-300">${model.inputPrice.toFixed(1)}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block">Output</span>
                                    <span className="text-gray-300">${model.outputPrice.toFixed(1)}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block">Your cost</span>
                                    <span className="text-green-400 font-semibold">${calculateCost(model.inputPrice, model.outputPrice)}</span>
                                  </div>
                                </div>
                                {showComparison && (
                                  <button
                                    onClick={() => toggleModelSelection(model.version)}
                                    className={`mt-2 w-full py-1.5 px-3 rounded text-xs font-medium transition-all ${
                                      selectedModels.includes(model.version)
                                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                  >
                                    {selectedModels.includes(model.version) ? 'Remove' : 'Compare'}
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="py-12 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Model Selection Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700">
              <CardHeader>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-3">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-white text-lg">Cost Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">
                  Use cheaper models for simple tasks like classification and summaries. 
                  Reserve premium models for complex reasoning and creative work.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700">
              <CardHeader>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-3">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-white text-lg">Context Matters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">
                  Match context window to your needs. Larger contexts cost more but handle 
                  longer documents. Most tasks work well with 8-32k tokens.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700">
              <CardHeader>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-white text-lg">Speed vs Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">
                  Faster models are great for real-time applications. Use slower, 
                  more capable models for accuracy-critical tasks.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Tracking Your AI Costs?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Connect your providers and get instant insights into your AI spending
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/integrations">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-6 text-lg">
                  View Integrations
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}