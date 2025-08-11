'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  TrendingUp, Shield, AlertTriangle, CheckCircle, ArrowRight, 
  DollarSign, Mail, FileText, Users, Sparkles, Calculator,
  Building2, Activity, BarChart3, TrendingDown, Zap, Brain,
  ChevronRight, Star, Award, Globe, Info, X, ChevronDown,
  Layers, Target, Clock, Lock, Settings, Database
} from 'lucide-react'
import { getAIProviderLogo } from '@/components/ui/ai-logos'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
    name: 'Light', 
    description: '~500k tokens',
    tokensPerMonth: TOKEN_USAGE_PATTERNS.light.tokensPerMonth,
    icon: Zap
  },
  { 
    id: 'moderate', 
    name: 'Regular', 
    description: '~2M tokens',
    tokensPerMonth: TOKEN_USAGE_PATTERNS.moderate.tokensPerMonth,
    icon: Activity
  },
  { 
    id: 'heavy', 
    name: 'Heavy', 
    description: '~10M tokens',
    tokensPerMonth: TOKEN_USAGE_PATTERNS.heavy.tokensPerMonth,
    icon: TrendingUp
  }
]

export default function AICostCalculator() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['openai', 'claude'])
  const [companyType, setCompanyType] = useState('scaleup')
  const [peopleRange, setPeopleRange] = useState('16-50')
  const [usageScenario, setUsageScenario] = useState('moderate')
  const [email, setEmail] = useState('')
  const [totalCost, setTotalCost] = useState({ monthly: 0, annual: 0, perPerson: 0 })
  
  // Get tab from URL or default to calculator
  const activeTab = searchParams.get('tab') || 'calculator'

  const setActiveTab = (tab: string) => {
    router.push(`/ai-cost-calculator?tab=${tab}`, { scroll: false })
  }

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
    
    let totalCostPerUser = 0
    
    selectedProviders.forEach(providerId => {
      const provider = AI_PROVIDERS.find(p => p.id === providerId)
      if (provider) {
        const tokensInMillions = usage.tokensPerMonth / 1000000
        const providerCostPerUser = provider.avgCostPer1M * tokensInMillions
        totalCostPerUser += providerCostPerUser
      }
    })
    
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

  const tabs = [
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'insights', label: 'Insights', icon: BarChart3 }
  ]

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">AI Cost Calculator</h1>
              <p className="text-xs text-gray-400">Estimate and optimize your AI spending</p>
            </div>
            {/* Tab Navigation - Inline */}
            <div className="hidden lg:flex items-center gap-1 bg-gray-900/50 rounded-lg p-1 ml-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-medium ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="w-3 h-3" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Calculator Tab - Left-Right Split Layout */}
        {activeTab === 'calculator' && (
          <div className="h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto px-6 py-4">
              {/* Main content area with left-right split */}
              <div className="flex gap-4 mb-6">
              {/* Left Panel - All Selections */}
              <div className="w-1/2 flex flex-col gap-2">
                {/* AI Providers - Dark theme Card */}
                <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                  <CardHeader className="py-2 px-4">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-400" />
                      Select AI Providers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="grid grid-cols-4 gap-2">
                      {AI_PROVIDERS.slice(0, 8).map((provider) => (
                        <button
                          key={provider.id}
                          onClick={() => toggleProvider(provider.id)}
                          className={`p-2 rounded border transition-all ${
                            selectedProviders.includes(provider.id)
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-gray-700 hover:border-purple-500/50 bg-gray-800/50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            {getAIProviderLogo(provider.id, 'w-5 h-5', true)}
                            <div className="text-[10px] text-white truncate w-full">{provider.name.split(' ')[0]}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                    {AI_PROVIDERS.length > 8 && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {AI_PROVIDERS.slice(8).map((provider) => (
                          <button
                            key={provider.id}
                            onClick={() => toggleProvider(provider.id)}
                            className={`p-2 rounded border transition-all ${
                              selectedProviders.includes(provider.id)
                                ? 'border-purple-500 bg-purple-500/20'
                                : 'border-gray-700 hover:border-purple-500/50 bg-gray-800/50'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              {getAIProviderLogo(provider.id, 'w-5 h-5', true)}
                              <div className="text-[10px] text-white truncate w-full">{provider.name.split(' ')[0]}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Company Type - Single Line */}
                <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                  <CardHeader className="py-2 px-4">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      Company Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <div className="flex gap-2">
                      {COMPANY_TYPES.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setCompanyType(type.id)}
                          className={`flex-1 px-3 py-2 rounded text-xs transition-all ${
                            companyType === type.id
                              ? 'bg-purple-500/20 border border-purple-500 text-white'
                              : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:border-gray-600'
                          }`}
                        >
                          <div>{type.name}</div>
                          {type.discount > 0 && (
                            <div className="text-green-400 text-[10px]">-{type.discount}%</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Team Size - Dropdown */}
                <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                  <CardHeader className="py-2 px-4">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-400" />
                      Team Size
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <select
                      value={peopleRange}
                      onChange={(e) => setPeopleRange(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:border-purple-500 focus:outline-none"
                    >
                      {PEOPLE_RANGES.map((range) => (
                        <option key={range.id} value={range.id} className="bg-gray-800">
                          {range.name} ({range.avg} people avg)
                        </option>
                      ))}
                    </select>
                  </CardContent>
                </Card>

                {/* Usage Level - Slider */}
                <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                  <CardHeader className="py-2 px-4">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-yellow-400" />
                      Usage Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Light</span>
                        <span className="text-white font-medium">
                          {USAGE_SCENARIOS.find(u => u.id === usageScenario)?.name}
                        </span>
                        <span className="text-gray-400">Heavy</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="1"
                        value={USAGE_SCENARIOS.findIndex(u => u.id === usageScenario)}
                        onChange={(e) => {
                          const index = parseInt(e.target.value)
                          setUsageScenario(USAGE_SCENARIOS[index].id)
                        }}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(USAGE_SCENARIOS.findIndex(u => u.id === usageScenario) / 2) * 100}%, #374151 ${(USAGE_SCENARIOS.findIndex(u => u.id === usageScenario) / 2) * 100}%, #374151 100%)`
                        }}
                      />
                      <div className="text-center text-xs text-gray-500">
                        {USAGE_SCENARIOS.find(u => u.id === usageScenario)?.description}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel - Pricing Details */}
              <div className="w-1/2">
                {/* Main Cost Display */}
                <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800 h-full flex flex-col">
                  <CardHeader className="px-6 py-4">
                    <CardTitle className="text-2xl text-white">Your AI Cost Estimate</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 flex-1 flex flex-col justify-between">
                    {/* Primary Metrics */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm text-gray-400 mb-2">Monthly Cost</div>
                        <div className="text-5xl font-bold text-white">
                          ${totalCost.monthly.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">per month</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-2">Potential Savings</div>
                        <div className="text-5xl font-bold text-green-400">
                          ${(potentialSavings/12).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">per month</div>
                      </div>
                    </div>

                    {/* Secondary Metrics */}
                    <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-700">
                      <div>
                        <div className="text-sm text-gray-400">Annual Total</div>
                        <div className="text-2xl font-bold text-white mt-1">
                          ${totalCost.annual.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Per User</div>
                        <div className="text-2xl font-bold text-white mt-1">
                          ${totalCost.perPerson.toFixed(0)}/mo
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Annual Savings</div>
                        <div className="text-2xl font-bold text-green-400 mt-1">
                          ${potentialSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                    </div>

                    {/* Savings Message - More prominent */}
                    {potentialSavings > 0 && (
                      <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-center gap-4">
                          <TrendingDown className="w-8 h-8 text-green-400" />
                          <div>
                            <div className="text-2xl font-medium text-green-400">
                              Save up to ${potentialSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}/year
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              With AI Cost Guardian's optimization tools
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              </div>

              {/* Get Report Section - As a regular section below main content */}
              <div className="bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-purple-900/40 backdrop-blur-xl rounded-xl border border-purple-500/40 p-6">
                <div className="flex items-center gap-4">
                  {/* Email Input Group */}
                  <div className="flex-1 flex items-center gap-3 bg-gray-900/50 rounded-lg p-2 border border-purple-500/30">
                    <Mail className="w-5 h-5 text-purple-400 flex-shrink-0 ml-2" />
                    <input
                      type="email"
                      placeholder="Enter your work email to receive personalized AI cost analysis report"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-2 py-2 bg-transparent border-none text-white placeholder-gray-400 focus:outline-none text-sm"
                    />
                    <Button
                      disabled={!hasSelections || !email}
                      className={`px-6 py-2 text-sm font-semibold rounded-md transition-all ${
                        hasSelections && email
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg'
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Get Free Report
                    </Button>
                  </div>
                  
                  {/* Divider */}
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-px bg-gray-700" />
                    <span className="text-xs text-gray-400">OR</span>
                    <div className="h-8 w-px bg-gray-700" />
                  </div>
                  
                  {/* Free Trial Button */}
                  <Link href="/auth/signup">
                    <Button className="px-6 py-2.5 text-sm bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg rounded-md">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start 14-Day Free Trial
                    </Button>
                  </Link>
                </div>
                
                {/* Trust Indicators */}
                <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-green-400" />
                    No credit card
                  </span>
                  <span className="text-gray-600">•</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-blue-400" />
                    Instant setup
                  </span>
                  <span className="text-gray-600">•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-purple-400" />
                    50K+ users
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">AI Model Pricing Reference</CardTitle>
                <CardDescription className="text-gray-400">
                  Compare pricing across all supported AI providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {AI_PROVIDERS.map((provider) => (
                    <Card key={provider.id} className="bg-gray-800/50 border-gray-700">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          {getAIProviderLogo(provider.id, 'w-5 h-5', true)}
                          <div>
                            <CardTitle className="text-xs text-white">{provider.name}</CardTitle>
                            <CardDescription className="text-xs text-gray-400">
                              Avg: ${provider.avgCostPer1M}/1M
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {provider.models.slice(0, 3).map((model, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span className="text-gray-400 truncate pr-1">{model.name}</span>
                              <span className="text-white font-mono">
                                ${((model.inputPrice + model.outputPrice) / 2).toFixed(1)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <p className="text-xs text-gray-400">
                    <Info className="w-3 h-3 text-blue-400 inline mr-1" />
                    Prices are averages. Enterprise discounts 15-40%. Updated: {PRICING_LAST_UPDATED}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Features and Testimonials */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm">Why AI Cost Guardian?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { icon: TrendingUp, title: 'Cost Optimization', desc: 'Reduce by 30-50%' },
                      { icon: Shield, title: 'Enterprise Security', desc: 'SOC2, GDPR, HIPAA' },
                      { icon: Activity, title: 'Real-time', desc: 'Live tracking' },
                      { icon: Users, title: 'Team Management', desc: 'Role-based access' },
                      { icon: BarChart3, title: 'Analytics', desc: 'Detailed insights' },
                      { icon: Globe, title: 'Multi-Provider', desc: '25+ integrated' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="p-1.5 bg-purple-500/20 rounded">
                          <item.icon className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-xs font-medium text-white">{item.title}</h3>
                          <p className="text-xs text-gray-400">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm">Success Stories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { company: 'TechCorp', savings: '$45k/yr', quote: 'Cut costs by 40%' },
                      { company: 'DataFlow', savings: '$28k/yr', quote: 'Better visibility' },
                      { company: 'AIFirst', savings: '$62k/yr', quote: 'Game-changing' }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                        <div className="text-lg font-bold text-green-400">{item.savings}</div>
                        <div className="text-xs font-medium text-white">{item.company}</div>
                        <div className="text-xs text-gray-400 italic">"{item.quote}"</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ROI Calculator */}
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">ROI Calculator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400">Monthly Spend</label>
                  <div className="text-xl font-bold text-white">
                    ${totalCost.monthly.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Annual Savings</label>
                  <div className="text-xl font-bold text-green-400">
                    ${potentialSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400">ROI Timeline</label>
                  <div className="text-lg text-white">1-2 months</div>
                </div>
                <div className="pt-3 border-t border-gray-700 space-y-2">
                  <Link href="/dashboard" className="block">
                    <Button className="w-full text-xs bg-gray-800 text-white hover:bg-gray-700 border border-gray-700">
                      View Demo
                    </Button>
                  </Link>
                  <Link href="/models" className="block">
                    <Button className="w-full text-xs bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30">
                      Explore Models
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}