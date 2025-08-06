'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, Shield, AlertTriangle, CheckCircle, ArrowRight, 
  DollarSign, Mail, FileText, Users, Sparkles, Calculator,
  Building2, Activity, BarChart3, TrendingDown, Zap, Brain,
  ChevronRight, Star, Award, Globe, Info, X
} from 'lucide-react'
import { getAIProviderLogo } from '@/components/ui/ai-logos'
import {
  getEnabledProviders,
  getProviderById,
  COMPANY_TYPES,
  TEAM_SIZE_RANGES,
  TOKEN_USAGE_PATTERNS,
  PRICING_LAST_UPDATED,
  calculateProviderCost,
  getProviderLogo
} from '@/lib/ai-providers-config'

// Use centralized configuration
const AI_PROVIDERS = getEnabledProviders()
const PEOPLE_RANGES = TEAM_SIZE_RANGES

// Map token usage patterns to the expected format
const USAGE_SCENARIOS = [
  { 
    id: 'light', 
    name: 'Light Usage', 
    description: TOKEN_USAGE_PATTERNS.light.description,
    tokensPerMonth: TOKEN_USAGE_PATTERNS.light.tokensPerMonth
  },
  { 
    id: 'moderate', 
    name: 'Regular Usage', 
    description: TOKEN_USAGE_PATTERNS.moderate.description,
    tokensPerMonth: TOKEN_USAGE_PATTERNS.moderate.tokensPerMonth
  },
  { 
    id: 'heavy', 
    name: 'Heavy Usage', 
    description: TOKEN_USAGE_PATTERNS.heavy.description,
    tokensPerMonth: TOKEN_USAGE_PATTERNS.heavy.tokensPerMonth
  }
]


export default function AICostCalculator() {
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [companyType, setCompanyType] = useState('scaleup')
  const [peopleRange, setPeopleRange] = useState('16-50')
  const [usageScenario, setUsageScenario] = useState('moderate')
  const [email, setEmail] = useState('')
  const [totalCost, setTotalCost] = useState({ monthly: 0, annual: 0, perPerson: 0 })

  const toggleProvider = (providerId: string) => {
    setSelectedProviders(prev => {
      if (prev.includes(providerId)) {
        return prev.filter(id => id !== providerId)
      } else {
        return [...prev, providerId]
      }
    })
  }

  const calculateCosts = () => {
    const company = COMPANY_TYPES.find(c => c.id === companyType) || COMPANY_TYPES[1]
    const people = PEOPLE_RANGES.find(p => p.id === peopleRange) || PEOPLE_RANGES[2]
    const usage = USAGE_SCENARIOS.find(u => u.id === usageScenario) || USAGE_SCENARIOS[1]
    
    // Calculate based on real token usage and pricing
    let totalCostPerUser = 0
    
    selectedProviders.forEach(providerId => {
      const provider = AI_PROVIDERS.find(p => p.id === providerId)
      if (provider) {
        // Cost per million tokens * millions of tokens per month
        const tokensInMillions = usage.tokensPerMonth / 1000000
        const providerCostPerUser = provider.avgCostPer1M * tokensInMillions
        totalCostPerUser += providerCostPerUser
      }
    })
    
    // Apply enterprise discounts based on company type
    const perPersonCost = totalCostPerUser * company.multiplier
    const monthlyCost = perPersonCost * people.avg
    const annualCost = monthlyCost * 12
    
    setTotalCost({ 
      monthly: monthlyCost, 
      annual: annualCost,
      perPerson: perPersonCost
    })
  }

  useEffect(() => {
    calculateCosts()
  }, [selectedProviders, companyType, peopleRange, usageScenario])

  const potentialSavings = Math.max(totalCost.annual * 0.35, 0)
  const hasSelections = selectedProviders.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Compact Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Cost Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Estimate your monthly AI spending and discover savings opportunities
          </p>
        </div>

        {/* Single Fold Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Providers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Select AI Providers
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AI_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => toggleProvider(provider.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedProviders.includes(provider.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getAIProviderLogo(provider.id)}
                      <div className="text-left">
                        <div className="text-sm font-medium">{provider.name.split(' ')[0]}</div>
                        <div className="text-xs text-gray-500">${provider.avgCostPer1M}/1M</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Company Configuration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Company Details
              </h3>
              
              <div className="grid sm:grid-cols-3 gap-4">
                {/* Company Type */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                  <div className="space-y-2">
                    {COMPANY_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setCompanyType(type.id)}
                        className={`w-full p-2 rounded-lg border text-sm transition-all ${
                          companyType === type.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="mr-2">{type.icon}</span>
                        <div className="text-left">
                          <div>{type.name}</div>
                          {type.discount > 0 && (
                            <div className="text-xs text-gray-500">{type.discount}% discount</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Team Size */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Team Size</label>
                  <div className="space-y-2">
                    {PEOPLE_RANGES.map((range) => (
                      <button
                        key={range.id}
                        onClick={() => setPeopleRange(range.id)}
                        className={`w-full p-2 rounded-lg border text-sm transition-all ${
                          peopleRange === range.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {range.name} people
                      </button>
                    ))}
                  </div>
                </div>

                {/* Usage Level */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Usage Level</label>
                  <div className="space-y-2">
                    {USAGE_SCENARIOS.map((scenario) => (
                      <button
                        key={scenario.id}
                        onClick={() => setUsageScenario(scenario.id)}
                        className={`w-full p-2 rounded-lg border text-sm transition-all ${
                          usageScenario === scenario.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{scenario.name}</div>
                          <div className="text-xs text-gray-500">{scenario.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Results */}
          <div className="space-y-6">
            {/* Cost Breakdown */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Estimated Costs</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm opacity-90">Per Person</div>
                  <div className="text-2xl font-bold">
                    ${totalCost.perPerson.toFixed(0)}/month
                  </div>
                </div>
                
                <div className="border-t border-white/20 pt-4">
                  <div className="text-sm opacity-90">Monthly Total</div>
                  <div className="text-3xl font-bold">
                    ${totalCost.monthly.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm opacity-90">Annual Total</div>
                  <div className="text-xl font-semibold">
                    ${totalCost.annual.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                </div>

                {hasSelections && (
                  <div className="border-t border-white/20 pt-4">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5" />
                      <div>
                        <div className="text-sm opacity-90">Potential Savings</div>
                        <div className="text-2xl font-bold text-yellow-300">
                          ${potentialSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}/year
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Details */}
            {selectedProviders.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Selected Provider Details</h3>
                <div className="space-y-3">
                  {selectedProviders.map(providerId => {
                    const provider = AI_PROVIDERS.find(p => p.id === providerId)
                    if (!provider) return null
                    const usage = USAGE_SCENARIOS.find(u => u.id === usageScenario)
                    const tokensInM = (usage?.tokensPerMonth || 0) / 1000000
                    const costPerUser = provider.avgCostPer1M * tokensInM
                    const company = COMPANY_TYPES.find(c => c.id === companyType)
                    const discountedCost = costPerUser * (company?.multiplier || 1)
                    
                    return (
                      <div key={providerId} className="border-l-4 border-purple-500 pl-3 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {getAIProviderLogo(providerId, 'w-5 h-5')}
                            <span className="text-sm font-medium">{provider.name}</span>
                          </div>
                          <span className="text-sm font-semibold">
                            ${discountedCost.toFixed(2)}/user/mo
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {tokensInM.toFixed(1)}M tokens × ${provider.avgCostPer1M}/M
                          {company?.discount ? ` (${company.discount}% enterprise discount)` : ''}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Get Report */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-3">Get Detailed Report</h3>
              <p className="text-sm text-gray-600 mb-4">
                Receive a personalized cost optimization strategy
              </p>
              
              <input
                type="email"
                placeholder="work@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 text-sm"
              />
              
              <button
                disabled={!hasSelections || !email}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                  hasSelections && email
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Get Free Report
              </button>

              {hasSelections && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <div className="text-xs text-green-700">
                      Based on your selections, AICostGuardian can help you save up to <strong>${potentialSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong> annually
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <a
                href="/dashboard"
                className="flex-1 text-center py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                View Demo
              </a>
              <a
                href="/auth/signup"
                className="flex-1 text-center py-2 px-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
              >
                Start Free Trial
              </a>
            </div>
          </div>
        </div>

        {/* Model Pricing Reference */}
        <div className="mt-8">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Enterprise AI Model Pricing Reference
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AI_PROVIDERS.slice(0, 6).map((provider) => (
                <div key={provider.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    {getAIProviderLogo(provider.id, 'w-6 h-6')}
                    <div>
                      <div className="font-medium text-sm">{provider.name}</div>
                      <div className="text-xs text-gray-500">{provider.description}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {provider.models.slice(0, 3).map((model, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-gray-600">{model.name}</span>
                        <span className="font-mono text-gray-900">
                          ${((model.inputPrice + model.outputPrice) / 2).toFixed(2)}/1M
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-gray-600 text-center">
              * Prices shown are blended averages of input/output costs per million tokens. 
              Actual costs vary based on specific model usage and may include volume discounts.
              <br />
              <strong>Last updated: {PRICING_LAST_UPDATED}</strong> - Prices subject to change.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}