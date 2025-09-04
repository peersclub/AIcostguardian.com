/**
 * API Key Validator Component
 * Unified component for API key validation across the application
 * Used in: Onboarding, Settings, AIOptimise
 */

'use client'

import { useState, useEffect } from 'react'
import { Provider } from '@/lib/core/api-key.service'
import { useApiKeys } from '@/hooks/use-api-keys'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CheckCircle2, XCircle, AlertCircle, Loader2, Key, 
  Shield, Activity, RefreshCw, Eye, EyeOff, Sparkles,
  Clock, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAIProviderLogo } from '@/components/ui/ai-logos'

interface ApiKeyValidatorProps {
  providers?: Provider[]
  onComplete?: (validKeys: Provider[]) => void
  showHealth?: boolean
  showTestAll?: boolean
  compact?: boolean
  autoTest?: boolean
}

const ALL_PROVIDERS: Provider[] = ['openai', 'claude', 'gemini', 'grok', 'perplexity', 'cohere', 'mistral']

export function ApiKeyValidator({
  providers = ALL_PROVIDERS,
  onComplete,
  showHealth = true,
  showTestAll = true,
  compact = false,
  autoTest = false
}: ApiKeyValidatorProps) {
  const {
    keys,
    isLoading,
    saveKey,
    deleteKey,
    testKey,
    testAllKeys,
    hasValidKey,
    getHealthyProviders
  } = useApiKeys()

  const [inputValues, setInputValues] = useState<Map<Provider, string>>(new Map())
  const [showKeys, setShowKeys] = useState<Map<Provider, boolean>>(new Map())
  const [savingProvider, setSavingProvider] = useState<Provider | null>(null)
  const [testingProvider, setTestingProvider] = useState<Provider | null>(null)

  // Auto-test on mount if requested
  useEffect(() => {
    if (autoTest && !isLoading) {
      providers.forEach(provider => {
        if (hasValidKey(provider)) {
          testKey(provider)
        }
      })
    }
  }, [autoTest, isLoading])

  // Notify parent when valid keys change
  useEffect(() => {
    if (onComplete) {
      const validProviders = getHealthyProviders().filter(p => providers.includes(p))
      onComplete(validProviders)
    }
  }, [keys])

  const handleSaveKey = async (provider: Provider) => {
    const key = inputValues.get(provider)
    if (!key) return

    setSavingProvider(provider)
    const success = await saveKey(provider, key)
    
    if (success) {
      // Clear input on success
      setInputValues(prev => {
        const updated = new Map(prev)
        updated.delete(provider)
        return updated
      })
    }
    
    setSavingProvider(null)
  }

  const handleTestKey = async (provider: Provider) => {
    setTestingProvider(provider)
    await testKey(provider)
    setTestingProvider(null)
  }

  const handleDeleteKey = async (provider: Provider) => {
    if (confirm(`Are you sure you want to delete the ${provider} API key?`)) {
      await deleteKey(provider)
    }
  }

  const toggleShowKey = (provider: Provider) => {
    setShowKeys(prev => {
      const updated = new Map(prev)
      updated.set(provider, !updated.get(provider))
      return updated
    })
  }

  const getProviderStatus = (provider: Provider) => {
    const status = keys.get(provider)
    if (!status) return 'not-configured'
    if (status.isLoading) return 'loading'
    if (status.isValid) return 'valid'
    if (status.error) return 'error'
    return 'invalid'
  }

  const getStatusIcon = (provider: Provider) => {
    const status = getProviderStatus(provider)
    const isTestLoading = testingProvider === provider

    if (isTestLoading) {
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />
    }

    switch (status) {
      case 'valid':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error':
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (provider: Provider) => {
    const status = keys.get(provider)
    if (!status) return null

    if (status.health === 'degraded') {
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
          <AlertCircle className="h-3 w-3 mr-1" />
          Degraded
        </Badge>
      )
    }

    if (status.rateLimit) {
      return (
        <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
          <Clock className="h-3 w-3 mr-1" />
          Rate Limited ({status.rateLimit.resetIn})
        </Badge>
      )
    }

    if (status.model) {
      return (
        <Badge variant="outline" className="bg-primary/10">
          <Zap className="h-3 w-3 mr-1" />
          {status.model}
        </Badge>
      )
    }

    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {providers.map(provider => {
          const status = keys.get(provider)
          const hasKey = hasValidKey(provider)
          const inputValue = inputValues.get(provider) || ''
          const showKey = showKeys.get(provider) || false

          return (
            <div key={provider} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-2 flex-1">
                {getAIProviderLogo(provider)}
                <span className="font-medium capitalize">{provider}</span>
                {getStatusIcon(provider)}
                {getStatusBadge(provider)}
              </div>
              
              {hasKey ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTestKey(provider)}
                    disabled={testingProvider === provider}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteKey(provider)}
                  >
                    <XCircle className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type={showKey ? 'text' : 'password'}
                    placeholder="API Key"
                    value={inputValue}
                    onChange={(e) => setInputValues(prev => {
                      const updated = new Map(prev)
                      updated.set(provider, e.target.value)
                      return updated
                    })}
                    className="w-40 h-8 text-xs"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSaveKey(provider)}
                    disabled={!inputValue || savingProvider === provider}
                  >
                    {savingProvider === provider ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      'Save'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>API Key Management</CardTitle>
            <CardDescription>
              Configure and validate your AI provider API keys
            </CardDescription>
          </div>
          {showTestAll && (
            <Button
              variant="outline"
              onClick={testAllKeys}
              disabled={providers.every(p => !hasValidKey(p))}
            >
              <Activity className="h-4 w-4 mr-2" />
              Test All Keys
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={providers[0]} className="w-full">
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full">
            {providers.map(provider => (
              <TabsTrigger
                key={provider}
                value={provider}
                className="relative"
              >
                <span className="capitalize">{provider}</span>
                {hasValidKey(provider) && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {providers.map(provider => {
            const status = keys.get(provider)
            const hasKey = hasValidKey(provider)
            const inputValue = inputValues.get(provider) || ''
            const showKey = showKeys.get(provider) || false

            return (
              <TabsContent key={provider} value={provider} className="space-y-4">
                <div className="flex items-center gap-4">
                  {getAIProviderLogo(provider)}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold capitalize">{provider}</h3>
                    <p className="text-sm text-muted-foreground">
                      {hasKey ? 'API key configured' : 'No API key configured'}
                    </p>
                  </div>
                  {getStatusIcon(provider)}
                </div>

                {status?.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{status.error}</AlertDescription>
                  </Alert>
                )}

                {showHealth && status && (
                  <div className="flex gap-2 flex-wrap">
                    {getStatusBadge(provider)}
                    {status.lastChecked && (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Last checked: {new Date(status.lastChecked).toLocaleTimeString()}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showKey ? 'text' : 'password'}
                        placeholder={hasKey ? '••••••••••••••••' : 'Enter API key'}
                        value={inputValue}
                        onChange={(e) => setInputValues(prev => {
                          const updated = new Map(prev)
                          updated.set(provider, e.target.value)
                          return updated
                        })}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleShowKey(provider)}
                      >
                        {showKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleSaveKey(provider)}
                      disabled={!inputValue || savingProvider === provider}
                    >
                      {savingProvider === provider ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Key className="h-4 w-4 mr-2" />
                      )}
                      Save Key
                    </Button>
                  </div>

                  {hasKey && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleTestKey(provider)}
                        disabled={testingProvider === provider}
                      >
                        {testingProvider === provider ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Shield className="h-4 w-4 mr-2" />
                        )}
                        Validate Key
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteKey(provider)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Delete Key
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </CardContent>
    </Card>
  )
}