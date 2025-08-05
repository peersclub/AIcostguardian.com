'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

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
      perplexity: ''
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
    'OpenAI (GPT-3.5, GPT-4)', 'Anthropic (Claude)', 'Google (Gemini)', 
    'Perplexity AI', 'Cohere', 'Hugging Face', 'Other'
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <Input
                value={onboardingData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Enter your company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              <Select
                value={onboardingData.industry}
                onValueChange={(value) => handleInputChange('industry', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
              <Select
                value={onboardingData.companySize}
                onValueChange={(value) => handleInputChange('companySize', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {companySizes.map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Role</label>
              <Select
                value={onboardingData.role}
                onValueChange={(value) => handleInputChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Which AI providers do you currently use?</label>
              <div className="grid grid-cols-2 gap-3">
                {aiProviders.map(provider => (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => handleArrayToggle('currentAIProviders', provider)}
                    className={`p-3 border rounded-lg text-sm text-left transition-colors ${
                      onboardingData.currentAIProviders.includes(provider)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {provider}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monthly AI Spending</label>
              <Select
                value={onboardingData.monthlyAISpend}
                onValueChange={(value) => handleInputChange('monthlyAISpend', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select spending range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-100">$0 - $100</SelectItem>
                  <SelectItem value="100-500">$100 - $500</SelectItem>
                  <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                  <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                  <SelectItem value="5000+">$5,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Primary use cases (select all that apply)</label>
              <div className="grid grid-cols-2 gap-3">
                {useCases.map(useCase => (
                  <button
                    key={useCase}
                    type="button"
                    onClick={() => handleArrayToggle('primaryUseCases', useCase)}
                    className={`p-3 border rounded-lg text-sm text-left transition-colors ${
                      onboardingData.primaryUseCases.includes(useCase)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {useCase}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">What are your main goals?</label>
              <div className="grid grid-cols-2 gap-3">
                {businessGoals.map(goal => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleArrayToggle('goals', goal)}
                    className={`p-3 border rounded-lg text-sm text-left transition-colors ${
                      onboardingData.goals.includes(goal)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Budget Limit ($)</label>
              <Input
                type="number"
                value={onboardingData.budgetLimit}
                onChange={(e) => handleInputChange('budgetLimit', e.target.value)}
                placeholder="e.g., 1000"
              />
              <p className="text-sm text-gray-500 mt-1">Set a monthly spending limit for alerts</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alert Threshold (%)</label>
              <Select
                value={onboardingData.alertThreshold}
                onValueChange={(value) => handleInputChange('alertThreshold', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50% of budget</SelectItem>
                  <SelectItem value="75">75% of budget</SelectItem>
                  <SelectItem value="80">80% of budget</SelectItem>
                  <SelectItem value="90">90% of budget</SelectItem>
                  <SelectItem value="95">95% of budget</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">Get notified when you reach this percentage of your budget</p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your AI Providers</h3>
              <p className="text-sm text-gray-600">
                Add your API keys to start tracking usage automatically. This step is optional - you can add them later in settings.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">OpenAI API Key</label>
                <Input
                  type="password"
                  value={onboardingData.apiKeys.openai}
                  onChange={(e) => handleAPIKeyChange('openai', e.target.value)}
                  placeholder="sk-..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Claude API Key</label>
                <Input
                  type="password"
                  value={onboardingData.apiKeys.claude}
                  onChange={(e) => handleAPIKeyChange('claude', e.target.value)}
                  placeholder="sk-ant-..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gemini API Key</label>
                <Input
                  type="password"
                  value={onboardingData.apiKeys.gemini}
                  onChange={(e) => handleAPIKeyChange('gemini', e.target.value)}
                  placeholder="AI..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Perplexity API Key</label>
                <Input
                  type="password"
                  value={onboardingData.apiKeys.perplexity}
                  onChange={(e) => handleAPIKeyChange('perplexity', e.target.value)}
                  placeholder="pplx-..."
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Secure Storage</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Your API keys are encrypted and stored securely. You can update or remove them at any time in your settings.</p>
                  </div>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= step.number
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.number ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button onClick={nextStep}>
                  Next Step
                </Button>
              ) : (
                <Button onClick={completeOnboarding} disabled={isLoading}>
                  {isLoading ? 'Setting up...' : 'Complete Setup'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skip Option */}
        {currentStep === 4 && (
          <div className="text-center mt-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip for now - I'll add API keys later
            </button>
          </div>
        )}
      </div>
    </div>
  )
}