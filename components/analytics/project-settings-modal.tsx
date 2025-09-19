'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Save,
  Lock,
  Settings,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Shield,
  ArrowRight,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

interface Recommendation {
  id: string
  title: string
  description: string
  category: string
  impact: string
  difficulty: string
  savingsPotential: number
  timeframe: string
  confidence: number
  settings: ProjectSettings
}

interface ProjectSettings {
  provider: string
  model: string
  maxTokens: number
  temperature: number
  costLimit: number
  enableAutoOptimization: boolean
  optimizationLevel: string
  fallbackModels: string[]
  customPromptTemplate: string
  reason: string
}

interface ProjectSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  recommendation: Recommendation | null
  onImplement: (settings: ProjectSettings) => Promise<void>
}

export default function ProjectSettingsModal({
  isOpen,
  onClose,
  recommendation,
  onImplement
}: ProjectSettingsModalProps) {
  const [settings, setSettings] = useState<ProjectSettings>({
    provider: 'anthropic',
    model: 'claude-3.5-sonnet',
    maxTokens: 4096,
    temperature: 0.7,
    costLimit: 100,
    enableAutoOptimization: true,
    optimizationLevel: 'balanced',
    fallbackModels: [],
    customPromptTemplate: '',
    reason: ''
  })

  const [isSaving, setIsSaving] = useState(false)
  const [step, setStep] = useState<'settings' | 'confirmation' | 'success'>('settings')

  useEffect(() => {
    if (recommendation?.settings) {
      setSettings({
        ...recommendation.settings,
        reason: `Auto-implementing recommendation: ${recommendation.title}`
      })
    }
  }, [recommendation])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onImplement(settings)
      setStep('success')
    } catch (error) {
      console.error('Failed to implement settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirm = () => {
    setStep('confirmation')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getProviderIcon = (provider: string) => {
    const iconProps = "w-5 h-5"
    switch (provider) {
      case 'openai': return <div className={`${iconProps} bg-green-500 rounded`} />
      case 'anthropic': return <div className={`${iconProps} bg-orange-500 rounded`} />
      case 'google': return <div className={`${iconProps} bg-blue-500 rounded`} />
      default: return <div className={`${iconProps} bg-gray-500 rounded`} />
    }
  }

  if (!isOpen || !recommendation) return null

  return (
    <AnimatePresence>
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
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Settings className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Implement Recommendation
                  </h2>
                  <p className="text-gray-400 text-sm">{recommendation.title}</p>
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

            {/* Progress Steps */}
            <div className="flex items-center gap-4 mt-6">
              <div className={`flex items-center gap-2 ${step === 'settings' ? 'text-indigo-400' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step === 'settings' ? 'border-indigo-400 bg-indigo-400/20' : 'border-gray-600'
                }`}>
                  1
                </div>
                <span className="text-sm font-medium">Configure Settings</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600" />
              <div className={`flex items-center gap-2 ${step === 'confirmation' ? 'text-indigo-400' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step === 'confirmation' ? 'border-indigo-400 bg-indigo-400/20' : 'border-gray-600'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium">Review & Confirm</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600" />
              <div className={`flex items-center gap-2 ${step === 'success' ? 'text-green-400' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step === 'success' ? 'border-green-400 bg-green-400/20' : 'border-gray-600'
                }`}>
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Complete</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {step === 'settings' && (
              <div className="space-y-6">
                {/* Recommendation Summary */}
                <Card className="bg-indigo-500/10 border-indigo-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-indigo-400" />
                      Recommendation Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {formatCurrency(recommendation.savingsPotential)}
                        </div>
                        <div className="text-green-300 text-sm">Potential Savings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {recommendation.confidence}%
                        </div>
                        <div className="text-blue-300 text-sm">Confidence</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {recommendation.timeframe}
                        </div>
                        <div className="text-purple-300 text-sm">Timeframe</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Project Settings Configuration */}
                <Card className="bg-gray-800/30 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-400" />
                      Project Settings Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Provider & Model */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="provider" className="text-white text-sm font-medium">
                          AI Provider
                        </Label>
                        <Select value={settings.provider} onValueChange={(value) =>
                          setSettings(prev => ({ ...prev, provider: value }))
                        }>
                          <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white mt-2">
                            <div className="flex items-center gap-2">
                              {getProviderIcon(settings.provider)}
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="openai">OpenAI</SelectItem>
                            <SelectItem value="anthropic">Anthropic</SelectItem>
                            <SelectItem value="google">Google</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="model" className="text-white text-sm font-medium">
                          Model
                        </Label>
                        <Select value={settings.model} onValueChange={(value) =>
                          setSettings(prev => ({ ...prev, model: value }))
                        }>
                          <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {settings.provider === 'openai' && (
                              <>
                                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                              </>
                            )}
                            {settings.provider === 'anthropic' && (
                              <>
                                <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                                <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                                <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                              </>
                            )}
                            {settings.provider === 'google' && (
                              <>
                                <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                                <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Performance Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="maxTokens" className="text-white text-sm font-medium">
                          Max Tokens
                        </Label>
                        <Input
                          id="maxTokens"
                          type="number"
                          value={settings.maxTokens}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            maxTokens: parseInt(e.target.value) || 0
                          }))}
                          className="bg-gray-800/50 border-gray-600 text-white mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="temperature" className="text-white text-sm font-medium">
                          Temperature
                        </Label>
                        <Input
                          id="temperature"
                          type="number"
                          step="0.1"
                          min="0"
                          max="2"
                          value={settings.temperature}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            temperature: parseFloat(e.target.value) || 0
                          }))}
                          className="bg-gray-800/50 border-gray-600 text-white mt-2"
                        />
                      </div>
                    </div>

                    {/* Cost Controls */}
                    <div>
                      <Label htmlFor="costLimit" className="text-white text-sm font-medium">
                        Daily Cost Limit ({formatCurrency(settings.costLimit)})
                      </Label>
                      <Input
                        id="costLimit"
                        type="number"
                        value={settings.costLimit}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          costLimit: parseFloat(e.target.value) || 0
                        }))}
                        className="bg-gray-800/50 border-gray-600 text-white mt-2"
                      />
                    </div>

                    {/* Optimization Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white text-sm font-medium">
                            Auto-Optimization
                          </Label>
                          <p className="text-gray-400 text-xs">
                            Automatically optimize model selection and parameters
                          </p>
                        </div>
                        <Switch
                          checked={settings.enableAutoOptimization}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            enableAutoOptimization: checked
                          }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="optimizationLevel" className="text-white text-sm font-medium">
                          Optimization Level
                        </Label>
                        <Select
                          value={settings.optimizationLevel}
                          onValueChange={(value) => setSettings(prev => ({
                            ...prev,
                            optimizationLevel: value
                          }))}
                        >
                          <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conservative">Conservative</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="aggressive">Aggressive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Implementation Reason */}
                    <div>
                      <Label htmlFor="reason" className="text-white text-sm font-medium">
                        Implementation Reason
                      </Label>
                      <Textarea
                        id="reason"
                        value={settings.reason}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          reason: e.target.value
                        }))}
                        placeholder="Explain why these settings are being implemented..."
                        className="bg-gray-800/50 border-gray-600 text-white mt-2"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 'confirmation' && (
              <div className="space-y-6">
                <Card className="bg-yellow-500/10 border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                      Confirm Implementation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-yellow-200">
                        You are about to implement these project settings as an admin override.
                        This will affect all users in the AI Optimize interface.
                      </p>

                      <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Provider:</span>
                          <span className="text-white font-medium">{settings.provider}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Model:</span>
                          <span className="text-white font-medium">{settings.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Cost Limit:</span>
                          <span className="text-white font-medium">{formatCurrency(settings.costLimit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Auto-Optimization:</span>
                          <span className="text-white font-medium">
                            {settings.enableAutoOptimization ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-blue-300 font-medium text-sm">Impact on Users</h4>
                          <p className="text-blue-200 text-sm mt-1">
                            Users will see these settings as locked with an admin override notice.
                            They can request changes but cannot modify them directly.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 'success' && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="p-4 bg-green-500/20 rounded-full mb-6">
                  <CheckCircle className="w-12 h-12 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Settings Implemented Successfully
                </h3>
                <p className="text-gray-400 text-center max-w-md mb-6">
                  The project settings have been saved and will now override user settings
                  in the AI Optimize interface.
                </p>
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Shield className="w-4 h-4" />
                  Admin Override Active
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-700 p-6 flex-shrink-0">
            <div className="flex justify-between">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                {step === 'success' ? 'Close' : 'Cancel'}
              </Button>

              <div className="flex gap-3">
                {step === 'settings' && (
                  <Button
                    onClick={handleConfirm}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Review Settings
                  </Button>
                )}

                {step === 'confirmation' && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => setStep('settings')}
                      className="text-gray-400 hover:text-white"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Implementing...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Implement Settings
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}