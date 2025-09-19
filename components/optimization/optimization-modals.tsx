'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  CheckCircle,
  Settings,
  Brain,
  DollarSign,
  TrendingUp,
  Target,
  Zap,
  Clock,
  Shield,
  Star,
  ChevronRight,
  ExternalLink,
  Lock,
  Unlock,
  MessageSquare,
  Send,
  Info,
  AlertTriangle,
  Lightbulb,
  Building2,
  Users,
  Database,
  Cpu,
  Globe,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { getAIProviderLogo } from '@/components/ui/ai-logos'

interface ProviderOptimizationModalProps {
  isOpen: boolean
  onClose: () => void
  provider: string
  model: {
    id: string
    name: string
    provider: string
    type: string
    costPer1kTokens: number
    performance: number
    quality: number
    speed: number
    currentUsage: number
    recommendation: string
    savings: number
  }
}

interface ModelDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  model: {
    id: string
    name: string
    provider: string
    type: string
    capabilities: string[]
    maxTokens: number
    costPer1kTokens: number
    performance: number
    quality: number
    speed: number
    reliability: number
  }
}

interface StrategyModalProps {
  isOpen: boolean
  onClose: () => void
  strategy: {
    id: string
    name: string
    description: string
    impact: string
    difficulty: string
    category: string
    savingsPotential: number
    performanceImpact: number
    confidence: number
  }
}

interface ComingSoonModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  type: 'strategies' | 'plan'
}

// Provider-level Optimization Modal
export function ProviderOptimizationModal({
  isOpen,
  onClose,
  provider,
  model
}: ProviderOptimizationModalProps) {
  const [step, setStep] = useState(1)
  const [isLocked, setIsLocked] = useState(false)
  const [lockReason, setLockReason] = useState('')
  const [showChangeRequest, setShowChangeRequest] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)

  // Project settings state
  const [settings, setSettings] = useState({
    model: model.id,
    provider: provider,
    maxTokens: 4000,
    temperature: 0.7,
    topP: 0.9,
    presencePenalty: 0,
    frequencyPenalty: 0,
    systemPrompt: '',
    rateLimiting: true,
    caching: true,
    fallbackModel: '',
    costLimit: 100
  })

  useEffect(() => {
    if (isOpen) {
      checkAdminOverrides()
    }
  }, [isOpen])

  const checkAdminOverrides = async () => {
    try {
      const response = await fetch('/api/admin/project-settings')
      if (response.ok) {
        const data = await response.json()
        if (data.organizationSettings?.adminOverrides) {
          setIsLocked(true)
          setLockReason(data.organizationSettings.overrideReason || 'Admin configuration override')
          setSettings(prev => ({
            ...prev,
            ...data.organizationSettings.adminOverrides
          }))
        }
      }
    } catch (error) {
      console.error('Failed to check admin overrides:', error)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // Simulate optimization application
      await new Promise(resolve => setTimeout(resolve, 2000))

      // In real implementation, this would save the provider-level optimization settings
      console.log('Applied provider optimization:', { provider, settings })

      onClose()
    } catch (error) {
      console.error('Failed to save optimization settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmitChangeRequest = async () => {
    if (!requestMessage.trim()) return

    setIsSubmittingRequest(true)
    try {
      const response = await fetch('/api/admin/change-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestMessage,
          currentSettings: settings,
          requestedChanges: {
            provider: settings.provider,
            context: `Provider optimization for ${provider} - ${model.name}`
          }
        })
      })

      if (response.ok) {
        setShowChangeRequest(false)
        setRequestMessage('')
        alert('Change request submitted successfully!')
      }
    } catch (error) {
      console.error('Failed to submit change request:', error)
    } finally {
      setIsSubmittingRequest(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl h-[85vh] flex flex-col bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl"
      >
        {/* Header */}
        <div className="border-b border-gray-700 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getAIProviderLogo(provider, 'w-8 h-8')}
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Optimize {provider.charAt(0).toUpperCase() + provider.slice(1)} Configuration
                </h2>
                <p className="text-gray-400 text-sm">Configure provider-level optimization settings</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Admin Override Banner */}
          {isLocked && (
            <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-orange-400 mt-0.5" />
                <div className="flex-1">
                  <div className="text-orange-300 font-medium">Configuration Locked</div>
                  <div className="text-orange-200 text-sm mt-1">{lockReason}</div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowChangeRequest(true)}
                    className="mt-2 border-orange-500/50 text-orange-300 hover:bg-orange-500/10"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Request Change
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-6">
            <div className="flex items-center space-x-8">
              {[
                { number: 1, label: 'Configure', icon: Settings },
                { number: 2, label: 'Review', icon: Target },
                { number: 3, label: 'Apply', icon: Zap }
              ].map(({ number, label, icon: Icon }) => (
                <div key={number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step >= number
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'border-gray-600 text-gray-400'
                  }`}>
                    {step > number ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    step >= number ? 'text-white' : 'text-gray-400'
                  }`}>
                    {label}
                  </span>
                  {number < 3 && (
                    <ChevronRight className="w-4 h-4 text-gray-600 ml-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Model Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    Model Configuration
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Primary Model</Label>
                      <Select
                        value={settings.model}
                        onValueChange={(value) => setSettings(prev => ({ ...prev, model: value }))}
                        disabled={isLocked}
                      >
                        <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                          <SelectItem value="claude-3-opus">Claude-3 Opus</SelectItem>
                          <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-gray-300">Fallback Model</Label>
                      <Select
                        value={settings.fallbackModel}
                        onValueChange={(value) => setSettings(prev => ({ ...prev, fallbackModel: value }))}
                        disabled={isLocked}
                      >
                        <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                          <SelectValue placeholder="Select fallback model" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                          <SelectItem value="claude-3-haiku">Claude-3 Haiku</SelectItem>
                          <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-gray-300">Max Tokens</Label>
                      <Input
                        type="number"
                        value={settings.maxTokens}
                        onChange={(e) => setSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                        className="bg-gray-800/50 border-gray-600 text-white"
                        disabled={isLocked}
                      />
                    </div>
                  </div>
                </div>

                {/* Cost & Performance */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    Cost & Performance
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Daily Cost Limit ($)</Label>
                      <Input
                        type="number"
                        value={settings.costLimit}
                        onChange={(e) => setSettings(prev => ({ ...prev, costLimit: parseFloat(e.target.value) }))}
                        className="bg-gray-800/50 border-gray-600 text-white"
                        disabled={isLocked}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Enable Caching</Label>
                      <Switch
                        checked={settings.caching}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, caching: checked }))}
                        disabled={isLocked}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Rate Limiting</Label>
                      <Switch
                        checked={settings.rateLimiting}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, rateLimiting: checked }))}
                        disabled={isLocked}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Expected Impact */}
              <div className="p-6 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Expected Impact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{model.savings}%</div>
                    <div className="text-gray-400 text-sm">Cost Reduction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">+15%</div>
                    <div className="text-gray-400 text-sm">Performance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">92%</div>
                    <div className="text-gray-400 text-sm">Confidence</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Review Configuration</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <h4 className="text-white font-medium mb-3">Current Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Model:</span>
                      <span className="text-white">{settings.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Tokens:</span>
                      <span className="text-white">{settings.maxTokens}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cost Limit:</span>
                      <span className="text-white">${settings.costLimit}/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Caching:</span>
                      <span className="text-white">{settings.caching ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <h4 className="text-green-300 font-medium mb-3">Optimization Benefits</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-200">Reduced operational costs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-200">Improved response times</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-200">Enhanced reliability</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-200">Smart resource allocation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Optimization Complete!</h3>
                <p className="text-gray-400">
                  Provider-level optimization settings have been applied successfully.
                </p>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg">
                <div className="text-sm text-gray-300">
                  Changes will take effect for all future requests to {provider}.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800/50"
                  disabled={isSaving}
                >
                  Back
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-700 text-gray-300 hover:bg-gray-800/50"
                disabled={isSaving}
              >
                Cancel
              </Button>

              {step < 3 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={isLocked}
                >
                  {step === 2 ? 'Apply Optimization' : 'Continue'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSaveSettings}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Complete'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Change Request Modal */}
      {showChangeRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-gray-900/90 backdrop-blur-xl rounded-xl border border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Request Configuration Change</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChangeRequest(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Request Message</Label>
                <Textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Describe the changes you need and why..."
                  className="bg-gray-800/50 border-gray-600 text-white"
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowChangeRequest(false)}
                  className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800/50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitChangeRequest}
                  disabled={!requestMessage.trim() || isSubmittingRequest}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmittingRequest ? 'Submitting...' : 'Submit Request'}
                  <Send className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// Model Details Modal
export function ModelDetailsModal({
  isOpen,
  onClose,
  model
}: ModelDetailsModalProps) {
  if (!isOpen) return null

  const useCases = {
    'gpt-4': [
      { query: 'Complex reasoning tasks', description: 'Multi-step problem solving and analysis' },
      { query: 'Code generation', description: 'Advanced programming and debugging' },
      { query: 'Creative writing', description: 'High-quality content creation' },
      { query: 'Research assistance', description: 'In-depth information synthesis' }
    ],
    'gpt-3.5-turbo': [
      { query: 'Simple conversations', description: 'General chat and Q&A' },
      { query: 'Basic coding help', description: 'Simple programming assistance' },
      { query: 'Content summarization', description: 'Text summarization and editing' },
      { query: 'Translation tasks', description: 'Language translation services' }
    ],
    'claude-3-opus': [
      { query: 'Long document analysis', description: 'Processing large context windows' },
      { query: 'Research and analysis', description: 'Deep analytical tasks' },
      { query: 'Technical writing', description: 'Complex technical documentation' },
      { query: 'Code review', description: 'Comprehensive code analysis' }
    ],
    'gemini-pro': [
      { query: 'Multimodal tasks', description: 'Image and text processing' },
      { query: 'Data analysis', description: 'Structured data interpretation' },
      { query: 'Mathematical problems', description: 'Complex calculations and proofs' },
      { query: 'Visual content creation', description: 'Image-based task assistance' }
    ]
  }

  const currentUseCases = useCases[model.id as keyof typeof useCases] || []

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl max-h-[85vh] flex flex-col bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl"
      >
        {/* Header */}
        <div className="border-b border-gray-700 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getAIProviderLogo(model.provider, 'w-8 h-8')}
              <div>
                <h2 className="text-xl font-semibold text-white">{model.name}</h2>
                <p className="text-gray-400 text-sm">Model specifications and use cases</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Model Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-400" />
                Technical Specifications
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Tokens:</span>
                  <span className="text-white">{model.maxTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white capitalize">{model.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cost per 1K tokens:</span>
                  <span className="text-white">${model.costPer1kTokens}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reliability:</span>
                  <span className="text-white">{model.reliability}%</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-800/30 rounded-lg">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" />
                Performance Metrics
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Performance</span>
                    <span className="text-white">{model.performance}%</span>
                  </div>
                  <Progress value={model.performance} className="h-2 bg-gray-700" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Quality</span>
                    <span className="text-white">{model.quality}%</span>
                  </div>
                  <Progress value={model.quality} className="h-2 bg-gray-700" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Speed</span>
                    <span className="text-white">{model.speed}%</span>
                  </div>
                  <Progress value={model.speed} className="h-2 bg-gray-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="p-4 bg-gray-800/30 rounded-lg">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Capabilities
            </h3>
            <div className="flex flex-wrap gap-2">
              {model.capabilities.map((capability) => (
                <Badge
                  key={capability}
                  className="px-3 py-1 bg-purple-500/20 text-purple-300 border-purple-500/30"
                >
                  {capability.replace('-', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div className="p-4 bg-gray-800/30 rounded-lg">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Recommended Use Cases
            </h3>
            <div className="space-y-3">
              {currentUseCases.map((useCase, index) => (
                <div key={index} className="p-3 bg-gray-700/30 rounded-lg">
                  <div className="font-medium text-white text-sm">{useCase.query}</div>
                  <div className="text-gray-400 text-xs mt-1">{useCase.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Provider Information */}
          <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <span className="text-indigo-300 font-medium">Provider: {model.provider.charAt(0).toUpperCase() + model.provider.slice(1)}</span>
            </div>
            <p className="text-indigo-200 text-sm">
              This model is optimized for {model.type} tasks and provides {model.reliability}% reliability with enterprise-grade performance.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-6 flex-shrink-0">
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Got it
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Strategy Implementation Modal
export function StrategyModal({
  isOpen,
  onClose,
  strategy
}: StrategyModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Lightbulb className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{strategy.name}</h2>
              <p className="text-gray-400 text-sm">Strategy implementation details</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-gray-800/30 rounded-lg">
            <h3 className="text-white font-medium mb-2">Current Status</h3>
            <p className="text-gray-300 text-sm mb-4">{strategy.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{strategy.savingsPotential}%</div>
                <div className="text-gray-400 text-sm">Potential Savings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">+{strategy.performanceImpact}%</div>
                <div className="text-gray-400 text-sm">Performance Boost</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 font-medium">Coming Soon</span>
            </div>
            <p className="text-blue-200 text-sm">
              Custom strategy implementation logic is currently being developed.
              This feature will allow you to configure and deploy advanced optimization strategies
              tailored to your specific use cases.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-700 text-gray-300 hover:bg-gray-800/50"
            >
              Close
            </Button>
            <Button
              disabled
              className="bg-gray-600 text-gray-400 cursor-not-allowed"
            >
              <Clock className="w-4 h-4 mr-2" />
              Coming Soon
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Coming Soon Modal
export function ComingSoonModal({
  isOpen,
  onClose,
  title,
  description,
  type
}: ComingSoonModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl p-6"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-blue-400" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
            <p className="text-gray-400 text-sm">{description}</p>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-200 text-sm">
              {type === 'strategies'
                ? 'Advanced strategy customization and implementation tools are being developed to give you complete control over your optimization workflows.'
                : 'Comprehensive planning and simulation tools are coming soon to help you preview and schedule optimization changes before implementation.'
              }
            </p>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Got it
          </Button>
        </div>
      </motion.div>
    </div>
  )
}