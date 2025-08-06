'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Lock, Shield, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { getAIProviderLogo } from '@/components/ui/ai-logos'
import { AI_PROVIDER_IDS } from '@/lib/ai-providers-config'

export default function Onboarding() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const [onboardingData, setOnboardingData] = useState({
    // Step 1: Company Info
    companyName: '',
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
    setIsLoading(true)
    
    // Simulate API call to save onboarding data
    setTimeout(() => {
      setIsLoading(false)
      router.push('/dashboard')
    }, 2000)
  }

  const steps = [
    { number: 1, title: 'Company Info', description: 'Tell us about your business' },
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
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Company Name</label>
              <input
                type="text"
                value={onboardingData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Enter your company name"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Industry</label>
              <select
                value={onboardingData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="" className="bg-gray-800">Select your industry</option>
                {industries.map(industry => (
                  <option key={industry} value={industry} className="bg-gray-800">{industry}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Company Size</label>
              <select
                value={onboardingData.companySize}
                onChange={(e) => handleInputChange('companySize', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="" className="bg-gray-800">Select company size</option>
                {companySizes.map(size => (
                  <option key={size} value={size} className="bg-gray-800">{size}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Your Role</label>
              <select
                value={onboardingData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="" className="bg-gray-800">Select your role</option>
                {roles.map(role => (
                  <option key={role} value={role} className="bg-gray-800">{role}</option>
                ))}
              </select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">Which AI providers do you currently use?</label>
              <div className="grid grid-cols-2 gap-3">
                {aiProviders.map(provider => (
                  <motion.button
                    key={provider.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleArrayToggle('currentAIProviders', provider.name)}
                    className={`p-4 border rounded-xl text-sm text-left transition-all ${
                      onboardingData.currentAIProviders.includes(provider.name)
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                        : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-purple-500/50 hover:bg-purple-500/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {provider.id !== 'other' && getAIProviderLogo(provider.id, 'w-5 h-5')}
                      <span className="font-medium">{provider.name}</span>
                      {onboardingData.currentAIProviders.includes(provider.name) && (
                        <Check className="w-4 h-4 ml-auto text-purple-400" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Monthly AI Spending</label>
              <select
                value={onboardingData.monthlyAISpend}
                onChange={(e) => handleInputChange('monthlyAISpend', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
              <label className="block text-sm font-medium text-gray-300 mb-4">Primary use cases (select all that apply)</label>
              <div className="grid grid-cols-2 gap-3">
                {useCases.map(useCase => (
                  <motion.button
                    key={useCase}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleArrayToggle('primaryUseCases', useCase)}
                    className={`p-4 border rounded-xl text-sm text-left transition-all ${
                      onboardingData.primaryUseCases.includes(useCase)
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                        : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-blue-500/50 hover:bg-blue-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{useCase}</span>
                      {onboardingData.primaryUseCases.includes(useCase) && (
                        <Check className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">What are your main goals?</label>
              <div className="grid grid-cols-2 gap-3">
                {businessGoals.map(goal => (
                  <motion.button
                    key={goal}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleArrayToggle('goals', goal)}
                    className={`p-4 border rounded-xl text-sm text-left transition-all ${
                      onboardingData.goals.includes(goal)
                        ? 'border-green-500 bg-green-500/20 text-green-300'
                        : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-green-500/50 hover:bg-green-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{goal}</span>
                      {onboardingData.goals.includes(goal) && (
                        <Check className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Monthly Budget Limit ($)</label>
              <input
                type="number"
                value={onboardingData.budgetLimit}
                onChange={(e) => handleInputChange('budgetLimit', e.target.value)}
                placeholder="e.g., 1000"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <p className="text-sm text-gray-400 mt-2">Set a monthly spending limit for alerts</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Alert Threshold (%)</label>
              <select
                value={onboardingData.alertThreshold}
                onChange={(e) => handleInputChange('alertThreshold', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="50" className="bg-gray-800">50% of budget</option>
                <option value="75" className="bg-gray-800">75% of budget</option>
                <option value="80" className="bg-gray-800">80% of budget</option>
                <option value="90" className="bg-gray-800">90% of budget</option>
                <option value="95" className="bg-gray-800">95% of budget</option>
              </select>
              <p className="text-sm text-gray-400 mt-2">Get notified when you reach this percentage of your budget</p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium mb-4 border border-purple-500/30">
                <Lock className="w-4 h-4" />
                <span>Optional Setup</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Connect Your AI Providers</h3>
              <p className="text-gray-400">
                Add your API keys to start tracking usage automatically. This step is optional - you can add them later in settings.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  {getAIProviderLogo('openai', 'w-5 h-5')}
                  <label className="block text-sm font-medium text-gray-300">OpenAI API Key</label>
                </div>
                <input
                  type="password"
                  value={onboardingData.apiKeys.openai}
                  onChange={(e) => handleAPIKeyChange('openai', e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  {getAIProviderLogo('claude', 'w-5 h-5')}
                  <label className="block text-sm font-medium text-gray-300">Claude API Key</label>
                </div>
                <input
                  type="password"
                  value={onboardingData.apiKeys.claude}
                  onChange={(e) => handleAPIKeyChange('claude', e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  {getAIProviderLogo('gemini', 'w-5 h-5')}
                  <label className="block text-sm font-medium text-gray-300">Gemini API Key</label>
                </div>
                <input
                  type="password"
                  value={onboardingData.apiKeys.gemini}
                  onChange={(e) => handleAPIKeyChange('gemini', e.target.value)}
                  placeholder="AI..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  {getAIProviderLogo('grok', 'w-5 h-5')}
                  <label className="block text-sm font-medium text-gray-300">Grok API Key</label>
                </div>
                <input
                  type="password"
                  value={onboardingData.apiKeys.grok}
                  onChange={(e) => handleAPIKeyChange('grok', e.target.value)}
                  placeholder="xai-..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-300 mb-2">Enterprise-Grade Security</h3>
                  <p className="text-sm text-gray-400">
                    Your API keys are encrypted using AES-256 and stored securely. You can update or remove them at any time in your settings.
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Back button */}
      <Link
        href="/"
        className="absolute top-8 left-8 z-20 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to home</span>
      </Link>

      <div className="relative z-10 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Link href="/" className="inline-flex items-center justify-center gap-3 mb-8">
              <Logo size="lg" className="h-12" />
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">Let's set up your account</h1>
            <p className="text-gray-400">This will only take a few minutes</p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {steps.map((step) => (
                <div key={step.number} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    currentStep >= step.number
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400'
                  }`}>
                    {currentStep > step.number ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-sm font-medium text-white">{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-gray-800 rounded-full h-2 max-w-2xl mx-auto">
              <motion.div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
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
            className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8 mb-8"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">{steps[currentStep - 1].title}</h2>
              <p className="text-gray-400">{steps[currentStep - 1].description}</p>
            </div>

            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-10">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  currentStep === 1
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </div>
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium"
                >
                  <div className="flex items-center gap-2">
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ) : (
                <button
                  onClick={completeOnboarding}
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Setting up...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Complete Setup</span>
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
              className="text-center"
            >
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
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