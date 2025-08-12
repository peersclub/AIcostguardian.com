'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Key, 
  TestTube,
  AlertCircle,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react'
import { apiKeyManager, KeyType, ValidationResult } from '@/lib/api-key-manager'
import { toast } from 'sonner'
import { debounce } from 'lodash'

interface ProviderConfig {
  name: string
  logo: string
  placeholder: string
  docsUrl: string
  models: string[]
}

const PROVIDERS: Record<string, ProviderConfig> = {
  openai: {
    name: 'OpenAI',
    logo: '/logos/openai.svg',
    placeholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
    models: ['GPT-4', 'GPT-3.5', 'DALL-E', 'Whisper']
  },
  anthropic: {
    name: 'Anthropic',
    logo: '/logos/anthropic.svg',
    placeholder: 'sk-ant-...',
    docsUrl: 'https://console.anthropic.com/account/keys',
    models: ['Claude 3 Opus', 'Claude 3 Sonnet', 'Claude 3 Haiku']
  },
  google: {
    name: 'Google',
    logo: '/logos/google.svg',
    placeholder: 'AIza...',
    docsUrl: 'https://makersuite.google.com/app/apikey',
    models: ['Gemini Pro', 'Gemini 1.5 Pro', 'Gemini 1.5 Flash']
  },
  perplexity: {
    name: 'Perplexity',
    logo: '/logos/perplexity.svg',
    placeholder: 'pplx-...',
    docsUrl: 'https://www.perplexity.ai/settings/api',
    models: ['Sonar Pro', 'Sonar', 'Codellama']
  },
  xai: {
    name: 'xAI',
    logo: '/logos/xai.svg',
    placeholder: 'xai-...',
    docsUrl: 'https://x.ai/api',
    models: ['Grok Beta']
  }
}

interface KeyValidationState {
  [provider: string]: {
    key: string
    validating: boolean
    validated: boolean
    result?: ValidationResult
    showKey: boolean
  }
}

export default function OnboardingApiSetup() {
  const router = useRouter()
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['openai', 'anthropic'])
  const [keyStates, setKeyStates] = useState<KeyValidationState>({})
  const [bulkImport, setBulkImport] = useState('')
  const [saving, setSaving] = useState(false)
  const [testingProvider, setTestingProvider] = useState<string | null>(null)

  // Debounced validation
  const validateKey = useCallback(
    debounce(async (provider: string, key: string) => {
      if (!key || key.length < 10) return

      setKeyStates(prev => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          validating: true
        }
      }))

      try {
        const result = await apiKeyManager.validateKey(provider, key)
        
        setKeyStates(prev => ({
          ...prev,
          [provider]: {
            ...prev[provider],
            validating: false,
            validated: true,
            result
          }
        }))

        if (result.valid) {
          toast.success(`${PROVIDERS[provider].name} key validated successfully`)
        } else {
          toast.error(`Invalid ${PROVIDERS[provider].name} key: ${result.error}`)
        }
      } catch (error) {
        setKeyStates(prev => ({
          ...prev,
          [provider]: {
            ...prev[provider],
            validating: false,
            validated: false,
            result: { valid: false, keyType: KeyType.STANDARD, error: 'Validation failed' }
          }
        }))
      }
    }, 500),
    []
  )

  const handleKeyChange = (provider: string, key: string) => {
    setKeyStates(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        key,
        validated: false
      }
    }))
    validateKey(provider, key)
  }

  const handleTestKey = async (provider: string) => {
    const state = keyStates[provider]
    if (!state?.key || !state.result?.valid) return

    setTestingProvider(provider)
    
    try {
      const result = await apiKeyManager.testKey(provider, state.key)
      
      if (result.success) {
        toast.success(
          <div>
            <p className="font-semibold">Test successful!</p>
            <p className="text-sm">Response: {result.response}</p>
            <p className="text-sm">Latency: {result.latency}ms</p>
          </div>
        )
      } else {
        toast.error(`Test failed: ${result.error}`)
      }
    } catch (error) {
      toast.error('Test failed')
    } finally {
      setTestingProvider(null)
    }
  }

  const handleBulkImport = async () => {
    const lines = bulkImport.split('\n').filter(line => line.trim())
    const detected: Array<{ provider: string; key: string }> = []

    for (const line of lines) {
      const trimmed = line.trim()
      
      // Try to detect provider from key pattern
      if (trimmed.startsWith('sk-') && !trimmed.startsWith('sk-ant-')) {
        detected.push({ provider: 'openai', key: trimmed })
      } else if (trimmed.startsWith('sk-ant-')) {
        detected.push({ provider: 'anthropic', key: trimmed })
      } else if (trimmed.startsWith('AIza')) {
        detected.push({ provider: 'google', key: trimmed })
      } else if (trimmed.startsWith('pplx-')) {
        detected.push({ provider: 'perplexity', key: trimmed })
      } else if (trimmed.startsWith('xai-')) {
        detected.push({ provider: 'xai', key: trimmed })
      }
    }

    if (detected.length > 0) {
      toast.info(`Detected ${detected.length} API keys. Validating...`)
      
      const result = await apiKeyManager.validateBatch(detected)
      
      // Update states with validated keys
      const newStates: KeyValidationState = {}
      for (const { provider, key } of detected) {
        const validation = result.results.get(`${provider}:${key}`)
        if (validation?.valid) {
          newStates[provider] = {
            key,
            validating: false,
            validated: true,
            result: validation,
            showKey: false
          }
        }
      }
      
      setKeyStates(prev => ({ ...prev, ...newStates }))
      setBulkImport('')
      
      toast.success(`Successfully imported ${result.summary.valid} keys`)
      if (result.summary.invalid > 0) {
        toast.warning(`${result.summary.invalid} keys were invalid`)
      }
    } else {
      toast.error('No valid API keys detected in the input')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    
    try {
      const validKeys = Object.entries(keyStates).filter(
        ([_, state]) => state.result?.valid
      )

      if (validKeys.length === 0) {
        toast.error('Please add at least one valid API key')
        setSaving(false)
        return
      }

      // Save all valid keys
      const savePromises = validKeys.map(([provider, state]) =>
        fetch('/api/api-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider,
            key: state.key,
            type: state.result?.keyType
          })
        })
      )

      await Promise.all(savePromises)
      
      toast.success('API keys saved successfully!')
      router.push('/onboarding/complete')
    } catch (error) {
      toast.error('Failed to save API keys')
    } finally {
      setSaving(false)
    }
  }

  const toggleKeyVisibility = (provider: string) => {
    setKeyStates(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        showKey: !prev[provider]?.showKey
      }
    }))
  }

  const validKeysCount = Object.values(keyStates).filter(state => state.result?.valid).length
  const progress = (validKeysCount / selectedProviders.length) * 100

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Set Up Your API Keys</h1>
          <p className="text-muted-foreground">
            Add API keys for the providers you want to use. You can always add more later.
          </p>
          
          {validKeysCount > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Setup Progress</span>
                <span className="text-sm font-medium text-foreground">{validKeysCount} / {selectedProviders.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>

        <Tabs defaultValue="manual" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            {selectedProviders.map(provider => {
              const config = PROVIDERS[provider]
              const state = keyStates[provider] || { key: '', showKey: false }
              
              return (
                <Card key={provider} className="bg-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Key className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-foreground">{config.name}</CardTitle>
                          <CardDescription>
                            {state.result?.valid ? (
                              <div className="flex items-center gap-2 mt-1">
                                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <span className="text-green-600 dark:text-green-400">Valid {state.result.keyType} key</span>
                              </div>
                            ) : (
                              <a 
                                href={config.docsUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm"
                              >
                                Get your API key →
                              </a>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      
                      {state.validating && (
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      )}
                      {state.validated && state.result && (
                        state.result.valid ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          type={state.showKey ? 'text' : 'password'}
                          placeholder={config.placeholder}
                          value={state.key}
                          onChange={(e) => handleKeyChange(provider, e.target.value)}
                          className={state.result && !state.result.valid ? 'border-red-500' : ''}
                        />
                        <button
                          type="button"
                          onClick={() => toggleKeyVisibility(provider)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {state.showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestKey(provider)}
                        disabled={!state.result?.valid || testingProvider === provider}
                      >
                        {testingProvider === provider ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <TestTube className="w-4 h-4" />
                        )}
                        Test
                      </Button>
                    </div>
                    
                    {state.result?.valid && state.result.capabilities && (
                      <div className="bg-muted rounded-lg p-3 space-y-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Key Type:</span>
                          <Badge variant="outline" className="ml-2">
                            {state.result.keyType}
                          </Badge>
                        </div>
                        {state.result.capabilities.models && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Available Models:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {state.result.capabilities.models.slice(0, 5).map(model => (
                                <Badge key={model} variant="secondary" className="text-xs">
                                  {model}
                                </Badge>
                              ))}
                              {state.result.capabilities.models.length > 5 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{state.result.capabilities.models.length - 5} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {state.result && !state.result.valid && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{state.result.error}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Bulk Import API Keys</CardTitle>
                <CardDescription>
                  Paste multiple API keys (one per line). We'll automatically detect the provider.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  className="w-full h-40 p-3 border rounded-lg font-mono text-sm bg-background text-foreground border-border"
                  placeholder="sk-...&#10;sk-ant-...&#10;AIza...&#10;pplx-..."
                  value={bulkImport}
                  onChange={(e) => setBulkImport(e.target.value)}
                />
                
                <Button 
                  onClick={handleBulkImport}
                  disabled={!bulkImport.trim()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Keys
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/onboarding')}
          >
            Back
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/onboarding/complete')}
            >
              Skip for now
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={validKeysCount === 0 || saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save & Continue
                  {validKeysCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {validKeysCount}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}