'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Lock, Shield, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { getAIProviderLogo } from '@/components/ui/ai-logos'
import { AI_PROVIDER_IDS } from '@/lib/ai-providers-config'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

export default function Onboarding() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const [onboardingData, setOnboardingData] = useState({
    // Step 1: Organization Info
    organizationName: '',
    organizationDomain: '',
    industry: '',
    companySize: '',
    role: '',
    
    // Step 2: AI Usage
    currentAIProviders: [] as string[],
    monthlyAISpend: '',
    primaryUseCases: [] as string[],
    
    // Step 3: Goals & Setup
    goals: [] as string[],
    budgetLimit: '',
    alertThreshold: '80',
    subscription: 'FREE' as 'FREE' | 'STARTER' | 'GROWTH' | 'SCALE' | 'ENTERPRISE',
    
    // Step 4: API Keys (optional)
    apiKeys: {
      openai: '',
      claude: '',
      gemini: '',
      grok: ''
    }
  })

  useEffect(() => {
    const step = searchParams.get('step')
    if (step) {
      setCurrentStep(parseInt(step))
    }
  }, [searchParams])

  const handleInputChange = (field: string, value: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayToggle = (field: string, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value]
    }))
  }

  const handleAPIKeyChange = (provider: string, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [provider]: value
      }
    }))
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
      router.push(`/onboarding?step=${currentStep + 1}`)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      router.push(`/onboarding?step=${currentStep - 1}`)
    }
  }

  const completeOnboarding = async () => {
    if (!session?.user?.email || !session?.user?.name) {
      toast.error('Please sign in to continue')
      router.push('/auth/signin')
      return
    }

    setIsLoading(true)
    
    try {
      // Step 1: Create organization
      const orgResponse = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: onboardingData.organizationName,
          domain: onboardingData.organizationDomain,
          adminEmail: session.user.email,
          adminName: session.user.name,
          subscription: determineSubscriptionPlan(),
          spendLimit: parseFloat(onboardingData.budgetLimit) || undefined
        })
      })

      if (!orgResponse.ok) {
        const error = await orgResponse.json()
        throw new Error(error.error || 'Failed to create organization')
      }

      const organization = await orgResponse.json()

      // Step 2: Save API keys if provided
      const apiKeyPromises = []
      
      if (onboardingData.apiKeys.openai) {
        apiKeyPromises.push(
          fetch('/api/api-keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: 'OPENAI',
              key: onboardingData.apiKeys.openai,
              organizationId: organization.id
            })
          })
        )
      }

      if (onboardingData.apiKeys.claude) {
        apiKeyPromises.push(
          fetch('/api/api-keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: 'ANTHROPIC',
              key: onboardingData.apiKeys.claude,
              organizationId: organization.id
            })
          })
        )
      }

      if (onboardingData.apiKeys.gemini) {
        apiKeyPromises.push(
          fetch('/api/api-keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: 'GOOGLE',
              key: onboardingData.apiKeys.gemini,
              organizationId: organization.id
            })
          })
        )
      }

      if (onboardingData.apiKeys.grok) {
        apiKeyPromises.push(
          fetch('/api/api-keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: 'XAI',
              key: onboardingData.apiKeys.grok,
              organizationId: organization.id
            })
          })
        )
      }

      await Promise.all(apiKeyPromises)

      // Step 3: Create initial budget if provided
      if (onboardingData.budgetLimit) {
        await fetch('/api/budgets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organizationId: organization.id,
            name: 'Monthly AI Budget',
            amount: parseFloat(onboardingData.budgetLimit),
            period: 'MONTHLY',
            alertThreshold: parseFloat(onboardingData.alertThreshold) / 100
          })
        })
      }

      toast.success('Organization setup complete!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to complete setup')
    } finally {
      setIsLoading(false)
    }
  }

  const determineSubscriptionPlan = () => {
    const spend = onboardingData.monthlyAISpend
    if (spend === '5000+') return 'ENTERPRISE'
    if (spend === '1000-5000') return 'SCALE'
    if (spend === '500-1000') return 'GROWTH'
    if (spend === '100-500') return 'STARTER'
    return 'FREE'
  }

  const steps = [
    { number: 1, title: 'Organization Setup', description: 'Create your organization' },
    { number: 2, title: 'AI Usage', description: 'Current AI tools and spending' },
    { number: 3, title: 'Goals & Budget', description: 'Set your tracking preferences' },
    { number: 4, title: 'API Setup', description: 'Connect your AI providers' }
  ]

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education', 
    'Marketing', 'Legal', 'Real Estate', 'Manufacturing', 'Other'
  ]

  const companySizes = [
    '1-10 employees', '11-50 employees', '51-200 employees', 
    '201-1000 employees', '1000+ employees'
  ]

  const roles = [
    'CEO/Founder', 'CTO', 'Developer', 'Data Scientist', 
    'Product Manager', 'Marketing Manager', 'Other'
  ]

  const aiProviders = [
    { id: 'openai', name: 'OpenAI (GPT-3.5, GPT-4)' },
    { id: 'claude', name: 'Anthropic (Claude)' },
    { id: 'gemini', name: 'Google (Gemini)' },
    { id: 'grok', name: 'X.AI (Grok)' },
    { id: 'other', name: 'Other AI Tools' }
  ]

  const useCases = [
    'Content Creation', 'Code Generation', 'Data Analysis', 'Customer Support', 
    'Translation', 'Summarization', 'Research', 'Image Generation'
  ]

  const businessGoals = [
    'Reduce AI Costs', 'Monitor Usage', 'Prevent Overruns', 
    'Track ROI', 'Compliance', 'Team Management'
  ]

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-2">Organization Name</label>
              <input
                type="text"
                value={onboardingData.organizationName}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                placeholder="Enter your organization name"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-2">Organization Domain</label>
              <input
                type="text"
                value={onboardingData.organizationDomain}
                onChange={(e) => handleInputChange('organizationDomain', e.target.value)}
                placeholder="e.g., assetworks.com"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
              <p className="text-xs text-gray-400 mt-1">This will be used to identify your organization</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-2">Industry</label>
                <select
                  value={onboardingData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                <option value="" className="bg-gray-800">Select your industry</option>
                {industries.map(industry => (
                  <option key={industry} value={industry} className="bg-gray-800">{industry}</option>
                ))}
                </select>
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-2">Company Size</label>
                <select
                  value={onboardingData.companySize}
                  onChange={(e) => handleInputChange('companySize', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="" className="bg-gray-800">Select size</option>
                  {companySizes.map(size => (
                    <option key={size} value={size} className="bg-gray-800">{size.replace(' employees', '')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-2">Your Role</label>
                <select
                  value={onboardingData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="" className="bg-gray-800">Select role</option>
                  {roles.map(role => (
                    <option key={role} value={role} className="bg-gray-800">{role}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-3">Which AI providers do you currently use?</label>
              <div className="grid grid-cols-2 gap-2">
                {aiProviders.map(provider => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => handleArrayToggle('currentAIProviders', provider.name)}
                    className={`p-2 lg:p-3 border rounded-lg text-xs lg:text-sm text-left transition-all ${
                      onboardingData.currentAIProviders.includes(provider.name)
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                        : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {provider.id !== 'other' && getAIProviderLogo(provider.id, 'w-4 h-4', true)}
                      <span className="font-medium truncate">{provider.name.replace(' (GPT-3.5, GPT-4)', '').replace(' (Claude)', '').replace(' (Gemini)', '').replace(' (Grok)', '')}</span>
                      {onboardingData.currentAIProviders.includes(provider.name) && (
                        <Check className="w-3 h-3 ml-auto text-purple-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-2">Monthly AI Spending</label>
              <select
                value={onboardingData.monthlyAISpend}
                onChange={(e) => handleInputChange('monthlyAISpend', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="" className="bg-gray-800">Select spending range</option>
                <option value="0-100" className="bg-gray-800">$0 - $100</option>
                <option value="100-500" className="bg-gray-800">$100 - $500</option>
                <option value="500-1000" className="bg-gray-800">$500 - $1,000</option>
                <option value="1000-5000" className="bg-gray-800">$1,000 - $5,000</option>
                <option value="5000+" className="bg-gray-800">$5,000+</option>
              </select>
            </div>

            <div>
              <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-3">Primary use cases</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {useCases.map(useCase => (
                  <button
                    key={useCase}
                    type="button"
                    onClick={() => handleArrayToggle('primaryUseCases', useCase)}
                    className={`p-2 border rounded-lg text-xs lg:text-sm text-left transition-all ${
                      onboardingData.primaryUseCases.includes(useCase)
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                        : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-blue-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-medium truncate">{useCase}</span>
                      {onboardingData.primaryUseCases.includes(useCase) && (
                        <Check className="w-3 h-3 text-blue-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-3">What are your main goals?</label>
              <div className="grid grid-cols-2 gap-2">
                {businessGoals.map(goal => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleArrayToggle('goals', goal)}
                    className={`p-2 lg:p-3 border rounded-lg text-xs lg:text-sm text-left transition-all ${
                      onboardingData.goals.includes(goal)
                        ? 'border-green-500 bg-green-500/20 text-green-300'
                        : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-green-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-medium">{goal}</span>
                      {onboardingData.goals.includes(goal) && (
                        <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-2">Monthly Budget ($)</label>
                <input
                  type="number"
                  value={onboardingData.budgetLimit}
                  onChange={(e) => handleInputChange('budgetLimit', e.target.value)}
                  placeholder="e.g., 1000"
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">Set monthly spending limit</p>
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-2">Alert Threshold</label>
                <select
                  value={onboardingData.alertThreshold}
                  onChange={(e) => handleInputChange('alertThreshold', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                <option value="50" className="bg-gray-800">50% of budget</option>
                <option value="75" className="bg-gray-800">75% of budget</option>
                <option value="80" className="bg-gray-800">80% of budget</option>
                <option value="90" className="bg-gray-800">90% of budget</option>
                <option value="95" className="bg-gray-800">95% of budget</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Get notified at this %</p>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium mb-2 border border-purple-500/30">
                <Lock className="w-3 h-3" />
                <span>Optional</span>
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-white mb-1">Connect AI Providers</h3>
              <p className="text-xs lg:text-sm text-gray-400">
                Add API keys now or later in settings
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getAIProviderLogo('openai', 'w-4 h-4', true)}
                  <label className="block text-xs lg:text-sm font-medium text-gray-300">OpenAI</label>
                </div>
                <input
                  type="password"
                  value={onboardingData.apiKeys.openai}
                  onChange={(e) => handleAPIKeyChange('openai', e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getAIProviderLogo('claude', 'w-4 h-4', true)}
                  <label className="block text-xs lg:text-sm font-medium text-gray-300">Claude</label>
                </div>
                <input
                  type="password"
                  value={onboardingData.apiKeys.claude}
                  onChange={(e) => handleAPIKeyChange('claude', e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getAIProviderLogo('gemini', 'w-4 h-4', true)}
                  <label className="block text-xs lg:text-sm font-medium text-gray-300">Gemini</label>
                </div>
                <input
                  type="password"
                  value={onboardingData.apiKeys.gemini}
                  onChange={(e) => handleAPIKeyChange('gemini', e.target.value)}
                  placeholder="AI..."
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getAIProviderLogo('grok', 'w-4 h-4', true)}
                  <label className="block text-xs lg:text-sm font-medium text-gray-300">Grok</label>
                </div>
                <input
                  type="password"
                  value={onboardingData.apiKeys.grok}
                  onChange={(e) => handleAPIKeyChange('grok', e.target.value)}
                  placeholder="xai-..."
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-xs font-medium text-blue-300 mb-1">Bank-Grade Security</h3>
                  <p className="text-xs text-gray-400">
                    AES-256 encrypted. Update anytime in settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col">
      {/* Animated background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Back button */}
      <Link
        href="/"
        className="absolute top-4 left-4 lg:top-8 lg:left-8 z-20 text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Back to home</span>
      </Link>

      <div className="relative z-10 flex-1 flex flex-col py-8 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 flex-1 flex flex-col">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 lg:mb-8"
          >
            <Link href="/" className="inline-flex items-center justify-center gap-3 mb-4">
              <Logo size="lg" className="h-8 lg:h-12" />
            </Link>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">Let's set up your account</h1>
            <p className="text-sm text-gray-400">This will only take a few minutes</p>
          </motion.div>

          {/* Progress Steps - Simplified for mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 lg:mb-6"
          >
            <div className="flex items-center justify-between max-w-2xl mx-auto px-4">
              {steps.map((step) => (
                <div key={step.number} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border-2 transition-all text-sm lg:text-base ${
                    currentStep >= step.number
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400'
                  }`}>
                    {currentStep > step.number ? (
                      <Check className="w-4 h-4 lg:w-5 lg:h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="mt-1 lg:mt-2 text-center hidden sm:block">
                    <p className="text-xs font-medium text-white">{step.title}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-gray-800 rounded-full h-1 max-w-2xl mx-auto">
              <motion.div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / 4) * 100}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </motion.div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-4 lg:p-6 mb-4 flex-1 flex flex-col overflow-hidden"
          >
            <div className="mb-4">
              <h2 className="text-lg lg:text-xl font-bold text-white mb-1">{steps[currentStep - 1].title}</h2>
              <p className="text-xs lg:text-sm text-gray-400">{steps[currentStep - 1].description}</p>
            </div>

            <div className="flex-1 overflow-y-auto">

              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4 pt-4 border-t border-gray-800">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentStep === 1
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                }`}
              >
                <div className="flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" />
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Back</span>
                </div>
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  disabled={currentStep === 1 && (!onboardingData.organizationName || !onboardingData.organizationDomain)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-1">
                    <span>Next</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              ) : (
                <button
                  onClick={completeOnboarding}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-1">
                    {isLoading ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Setting up...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>Complete</span>
                      </>
                    )}
                  </div>
                </button>
              )}
            </div>
          </motion.div>

          {/* Skip Option for API step */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-2"
            >
              <button
                onClick={() => router.push('/dashboard')}
                className="text-xs lg:text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Skip for now - I'll add API keys later
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}