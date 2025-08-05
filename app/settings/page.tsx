'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AuthWrapper from '@/components/AuthWrapper'
import { canUserAddAdminKey, getAdminKeyLimitMessage, getUserSubscriptionPlan } from '@/lib/subscription'

interface StoredApiKey {
  masked: string
  hasKey: boolean
  keyLength: number
  lastUpdated?: string
  lastTested?: string
  isAdmin?: boolean
}

interface ApiProvider {
  id: string
  name: string
  logo: string
  keyPrefix: string
  placeholder: string
  consoleUrl: string
  description: string
}

function SettingsContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [storedApiKeys, setStoredApiKeys] = useState<Record<string, StoredApiKey>>({})
  const [savingProviders, setSavingProviders] = useState<Set<string>>(new Set())
  const [deletingProviders, setDeletingProviders] = useState<Set<string>>(new Set())
  const [testingProviders, setTestingProviders] = useState<Set<string>>(new Set())
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [editingProvider, setEditingProvider] = useState<string | null>(null)
  const [providerMessages, setProviderMessages] = useState<Record<string, {type: 'success' | 'error', message: string} | null>>({})
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'online' | 'offline' | 'checking'>>({})
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null)

  // Function to detect if an API key is an admin key based on its format
  const isAdminKey = (apiKey: string, providerId: string): boolean => {
    if (!apiKey) return false
    
    switch (providerId) {
      case 'openai':
        return apiKey.startsWith('sk-org-') || apiKey.includes('-org-')
      case 'claude':
        // Check for Claude admin patterns - typically longer keys or specific formats
        return apiKey.length > 100 || apiKey.includes('admin') || apiKey.includes('org')
      case 'gemini':
        // Google Cloud service account keys are typically longer
        return apiKey.length > 60 || apiKey.includes('service-account')
      case 'perplexity':
        return apiKey.startsWith('pplx-org-') || apiKey.includes('-org-')
      case 'grok':
        return apiKey.startsWith('xai-org-') || apiKey.includes('-org-')
      default:
        return false
    }
  }

  // Function to get admin messaging for a provider
  const getAdminKeyInfo = (providerId: string, isAdmin?: boolean) => {
    if (isAdmin) {
      return {
        type: 'admin' as const,
        title: '🏢 Usage Control Settings Enabled',
        message: `You have enabled usage control settings for ${apiProviders.find(p => p.id === providerId)?.name}. You can control usage centrally and access advanced organizational features.`,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200'
      }
    } else {
      return {
        type: 'user' as const,
        title: '📊 Usage Tracking Only',
        message: `This is only usage tracking for ${apiProviders.find(p => p.id === providerId)?.name}. Consider upgrading to an admin key for centralized control and advanced features.`,
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-200'
      }
    }
  }

  // Function to get admin key upgrade info
  const getAdminUpgradeInfo = (providerId: string) => {
    const upgradeInfo: Record<string, { url: string; steps: string[] }> = {
      'claude': {
        url: 'https://console.anthropic.com/organization',
        steps: [
          'Visit the Anthropic Console',
          'Go to Organization settings',
          'Request admin access from your organization admin',
          'Generate a new admin API key'
        ]
      },
      'openai': {
        url: 'https://platform.openai.com/organization',
        steps: [
          'Visit OpenAI Platform',
          'Go to Organization settings',
          'Request admin role from organization owner',
          'Generate organization-level API key (sk-org-...)'
        ]
      },
      'gemini': {
        url: 'https://console.cloud.google.com/iam-admin',
        steps: [
          'Visit Google Cloud Console',
          'Go to IAM & Admin',
          'Request Project Admin role',
          'Generate service account key with admin permissions'
        ]
      },
      'perplexity': {
        url: 'https://www.perplexity.ai/organization',
        steps: [
          'Visit Perplexity AI',
          'Go to Organization settings',
          'Request admin role from organization admin',
          'Generate organization API key (pplx-org-...)'
        ]
      },
      'grok': {
        url: 'https://console.x.ai/organization',
        steps: [
          'Visit X.AI Console',
          'Go to Organization settings',
          'Request admin access from organization owner',
          'Generate organization API key (xai-org-...)'
        ]
      }
    }

    return upgradeInfo[providerId] || {
      url: '#',
      steps: ['Contact your organization admin', 'Request admin API key access']
    }
  }

  // Function to count current admin keys
  const getCurrentAdminKeyCount = (): number => {
    return Object.values(storedApiKeys).filter(key => key.hasKey && key.isAdmin).length
  }

  // Function to check if user can add more admin keys
  const canAddAdminKey = (providerId: string, keyIsAdmin: boolean): boolean => {
    if (!session?.user?.id) return false
    if (!keyIsAdmin) return true // Regular keys are always allowed
    
    const currentCount = getCurrentAdminKeyCount()
    return canUserAddAdminKey(session.user.id, currentCount)
  }

  // Function to handle pro feature redirect
  const handleProFeatureRequired = () => {
    router.push('/upgrade')
  }

  const apiProviders: ApiProvider[] = [
    {
      id: 'openai',
      name: 'OpenAI',
      logo: '🤖',
      keyPrefix: 'sk-',
      placeholder: 'sk-... or sk-org-... (admin)',
      consoleUrl: 'https://platform.openai.com/api-keys',
      description: 'GPT models, DALL-E, and more'
    },
    {
      id: 'claude',
      name: 'Anthropic Claude',
      logo: '🧠',
      keyPrefix: 'sk-ant-',
      placeholder: 'sk-ant-api03-...',
      consoleUrl: 'https://console.anthropic.com/',
      description: 'Claude 3 models'
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      logo: '💎',
      keyPrefix: 'AIza',
      placeholder: 'AIza...',
      consoleUrl: 'https://aistudio.google.com/app/apikey',
      description: 'Gemini Pro and Flash models'
    },
    {
      id: 'perplexity',
      name: 'Perplexity AI',
      logo: '🔍',
      keyPrefix: 'pplx-',
      placeholder: 'pplx-... or pplx-org-... (admin)',
      consoleUrl: 'https://www.perplexity.ai/settings/api',
      description: 'Perplexity models and search'
    },
    {
      id: 'grok',
      name: 'Grok (X.AI)',
      logo: '🚀',
      keyPrefix: 'xai-',
      placeholder: 'xai-... or xai-org-... (admin)',
      consoleUrl: 'https://console.x.ai/',
      description: 'X.AI Grok models'
    }
  ]

  useEffect(() => {
    setMounted(true)
    
    // Check for upgrade success message
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('upgraded') === 'true') {
      setSuccess('🎉 Successfully upgraded to Pro! You can now add unlimited admin API keys.')
      // Clean up URL
      window.history.replaceState({}, '', '/settings')
    }
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      loadStoredApiKeys()
      startConnectionStatusChecking()
    }
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval)
      }
    }
  }, [session])

  const startConnectionStatusChecking = () => {
    // Check connection status every 30 seconds
    const interval = setInterval(() => {
      checkAllConnectionStatus()
    }, 30000)
    setStatusCheckInterval(interval)
    
    // Initial check
    checkAllConnectionStatus()
  }

  const checkAllConnectionStatus = async () => {
    for (const provider of apiProviders) {
      if (storedApiKeys[provider.id]?.hasKey) {
        checkConnectionStatus(provider.id)
      }
    }
  }

  const checkConnectionStatus = async (providerId: string) => {
    setConnectionStatus(prev => ({ ...prev, [providerId]: 'checking' }))
    
    try {
      const response = await fetch(`/api/${providerId}/test`)
      const result = await response.json()
      
      setConnectionStatus(prev => ({ 
        ...prev, 
        [providerId]: result.isValid ? 'online' : 'offline' 
      }))
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [providerId]: 'offline' }))
    }
  }

  const setProviderMessage = (providerId: string, type: 'success' | 'error', message: string) => {
    setProviderMessages(prev => ({ ...prev, [providerId]: { type, message } }))
    // Clear message after 10 seconds for better visibility
    setTimeout(() => {
      setProviderMessages(prev => {
        // Only clear if the message hasn't changed
        if (prev[providerId]?.message === message) {
          return { ...prev, [providerId]: null }
        }
        return prev
      })
    }, 10000)
  }

  const loadStoredApiKeys = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings/api-keys')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStoredApiKeys(data.apiKeys || {})
        }
      } else {
        throw new Error('Failed to load API keys')
      }
    } catch (err) {
      setError('Failed to load stored API keys')
      console.error('Error loading API keys:', err)
    } finally {
      setLoading(false)
    }
  }

  const testStoredApiKey = async (providerId: string) => {
    const provider = apiProviders.find(p => p.id === providerId)
    
    setTestingProviders(prev => new Set(prev).add(providerId))
    // Show testing in progress message
    setProviderMessage(providerId, 'success', `🔄 Testing ${provider?.name} API key...`)
    
    try {
      const response = await fetch(`/api/${providerId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: "Hi, this is a test to validate my API key. Please respond with 'API key is working!'"
        })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        setProviderMessage(providerId, 'success', `✅ ${provider?.name} API key is valid and working!`)
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'online' }))
        
        // Update lastTested timestamp
        await fetch('/api/settings/api-keys', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: providerId })
        })
        
        // Reload API keys to get updated timestamps
        loadStoredApiKeys()
      } else {
        const errorMessage = result.details || result.error || 'Invalid API key'
        setProviderMessage(providerId, 'error', `❌ ${errorMessage}`)
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'offline' }))
      }
    } catch (err) {
      console.error(`Error testing stored ${provider?.name} API key:`, err)
      setProviderMessage(providerId, 'error', `❌ Failed to test ${provider?.name} API key`)
      setConnectionStatus(prev => ({ ...prev, [providerId]: 'offline' }))
    } finally {
      setTestingProviders(prev => {
        const newSet = new Set(prev)
        newSet.delete(providerId)
        return newSet
      })
    }
  }

  const testApiKey = async (providerId: string) => {
    const apiKey = apiKeys[providerId]
    const provider = apiProviders.find(p => p.id === providerId)
    
    if (!apiKey?.trim()) {
      setProviderMessage(providerId, 'error', `Please enter a ${provider?.name} API key first`)
      return
    }

    setTestingProviders(prev => new Set(prev).add(providerId))
    // Show testing in progress message
    setProviderMessage(providerId, 'success', `🔄 Testing ${provider?.name} API key...`)
    
    try {
      const response = await fetch(`/api/${providerId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: "Hi, this is a test to validate my API key. Please respond with 'API key is working!'",
          testApiKey: apiKey
        })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        setProviderMessage(providerId, 'success', `✅ ${provider?.name} API key is valid and working!`)
      } else {
        const errorMessage = result.details || result.error || 'Invalid API key'
        setProviderMessage(providerId, 'error', `❌ ${errorMessage}`)
      }
    } catch (err) {
      console.error(`Error testing ${provider?.name} API key:`, err)
      setProviderMessage(providerId, 'error', `❌ Failed to test ${provider?.name} API key`)
    } finally {
      setTestingProviders(prev => {
        const newSet = new Set(prev)
        newSet.delete(providerId)
        return newSet
      })
    }
  }

  const saveApiKey = async (providerId: string) => {
    const apiKey = apiKeys[providerId]
    const provider = apiProviders.find(p => p.id === providerId)
    const hasStoredKey = storedApiKeys[providerId]?.hasKey
    
    if (!apiKey?.trim()) {
      setProviderMessage(providerId, 'error', `Please enter a ${provider?.name} API key`)
      return
    }

    // Confirm replacement if key already exists
    if (hasStoredKey) {
      const confirmed = confirm(`Are you sure you want to replace your existing ${provider?.name} API key? This action cannot be undone.`)
      if (!confirmed) {
        return
      }
    }

    // Detect if this is an admin key
    const keyIsAdmin = isAdminKey(apiKey, providerId)

    // Check if this is an admin key and if user has reached limit
    if (keyIsAdmin && !canAddAdminKey(providerId, keyIsAdmin)) {
      const limitMessage = getAdminKeyLimitMessage(session?.user?.id || '', getCurrentAdminKeyCount())
      if (limitMessage) {
        setProviderMessage(providerId, 'error', `🚀 ${limitMessage}`)
        setTimeout(() => {
          handleProFeatureRequired()
        }, 2000)
        return
      }
    }

    setSavingProviders(prev => new Set(prev).add(providerId))
    setProviderMessages(prev => ({ ...prev, [providerId]: null }))
    
    try {
      const response = await fetch('/api/settings/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId, apiKey, isAdmin: keyIsAdmin })
      })

      const result = await response.json()
      
      if (result.success) {
        // Show appropriate success message based on key type and action
        const action = hasStoredKey ? 'updated' : 'enabled'
        const successMessage = keyIsAdmin 
          ? `🏢 Usage control settings ${action} for ${provider?.name}!`
          : `📊 Usage tracking ${action} for ${provider?.name}!`
        
        setProviderMessage(providerId, 'success', successMessage)
        setApiKeys(prev => ({ ...prev, [providerId]: '' })) // Clear input
        setEditingProvider(null)
        await loadStoredApiKeys() // Refresh stored keys
        checkConnectionStatus(providerId) // Check connection status
      } else {
        setProviderMessage(providerId, 'error', `❌ Failed to save API key: ${result.error}`)
      }
    } catch (err) {
      setProviderMessage(providerId, 'error', `❌ Error saving ${provider?.name} API key`)
    } finally {
      setSavingProviders(prev => {
        const newSet = new Set(prev)
        newSet.delete(providerId)
        return newSet
      })
    }
  }

  const deleteApiKey = async (providerId: string) => {
    const provider = apiProviders.find(p => p.id === providerId)
    
    if (!confirm(`Are you sure you want to delete your ${provider?.name} API key? This action cannot be undone.`)) {
      return
    }

    setDeletingProviders(prev => new Set(prev).add(providerId))
    setProviderMessages(prev => ({ ...prev, [providerId]: null }))
    
    try {
      const response = await fetch('/api/settings/api-keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId })
      })

      const result = await response.json()
      
      if (result.success) {
        setProviderMessage(providerId, 'success', `✅ ${provider?.name} API key deleted successfully!`)
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'offline' }))
        await loadStoredApiKeys() // Refresh stored keys
      } else {
        setProviderMessage(providerId, 'error', `❌ Failed to delete API key: ${result.error}`)
      }
    } catch (err) {
      setProviderMessage(providerId, 'error', `❌ Error deleting ${provider?.name} API key`)
    } finally {
      setDeletingProviders(prev => {
        const newSet = new Set(prev)
        newSet.delete(providerId)
        return newSet
      })
    }
  }

  const getConnectionStatusIndicator = (providerId: string) => {
    const status = connectionStatus[providerId]
    const hasKey = storedApiKeys[providerId]?.hasKey
    
    if (!hasKey) {
      return <div className="w-2 h-2 rounded-full bg-gray-300" title="Not configured"></div>
    }
    
    switch (status) {
      case 'online':
        return <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Connected"></div>
      case 'offline':
        return <div className="w-2 h-2 rounded-full bg-red-500" title="Disconnected"></div>
      case 'checking':
        return <div className="w-2 h-2 rounded-full bg-yellow-500 animate-spin" title="Checking..."></div>
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-300" title="Unknown"></div>
    }
  }

  // Loading state
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-2">Manage your API keys and account preferences</p>
              <p className="text-sm text-gray-500 mt-1">
                Signed in as: <span className="font-medium">{session.user?.email}</span>
              </p>
            </div>
            
            {/* Subscription Status */}
            <div className={`px-4 py-2 rounded-lg border ${
              getUserSubscriptionPlan(session?.user?.id || '').id === 'pro' 
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : getUserSubscriptionPlan(session?.user?.id || '').id === 'enterprise'
                  ? 'bg-purple-50 border-purple-200 text-purple-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}>
              <div className="text-sm font-medium">
                {getUserSubscriptionPlan(session?.user?.id || '').name} Plan
              </div>
              <div className="text-xs mt-1">
                Admin Keys: {getCurrentAdminKeyCount()}/{getUserSubscriptionPlan(session?.user?.id || '').features.maxAdminKeys === -1 ? '∞' : getUserSubscriptionPlan(session?.user?.id || '').features.maxAdminKeys}
              </div>
              {getUserSubscriptionPlan(session?.user?.id || '').id === 'free' && (
                <button 
                  onClick={handleProFeatureRequired}
                  className="text-xs text-blue-600 hover:text-blue-800 underline mt-1"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* API Keys Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">API Key Management</h2>
          
          {apiProviders.map((provider) => {
            const hasStoredKey = storedApiKeys[provider.id]?.hasKey
            const isEditing = editingProvider === provider.id
            const isSaving = savingProviders.has(provider.id)
            const isDeleting = deletingProviders.has(provider.id)
            const isTesting = testingProviders.has(provider.id)
            
            return (
              <div key={provider.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Provider Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{provider.logo}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">{provider.name}</h3>
                        {getConnectionStatusIndicator(provider.id)}
                      </div>
                      <p className="text-sm text-gray-500">{provider.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {hasStoredKey && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        ✅ Configured
                      </span>
                    )}
                  </div>
                </div>

                {/* Stored Key Display */}
                {hasStoredKey && !isEditing && (
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm text-gray-600">API Key:</span>
                            <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                              {storedApiKeys[provider.id].masked}
                            </code>
                            <span className="text-xs text-gray-500">
                              ({storedApiKeys[provider.id].keyLength} chars)
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            {storedApiKeys[provider.id].lastUpdated && (
                              <span>
                                Updated: {new Date(storedApiKeys[provider.id].lastUpdated!).toLocaleString()}
                              </span>
                            )}
                            {storedApiKeys[provider.id].lastTested && (
                              <span>
                                Last tested: {new Date(storedApiKeys[provider.id].lastTested!).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => testStoredApiKey(provider.id)}
                            disabled={isTesting}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                          >
                            {isTesting ? '⏳ Testing...' : '🧪 Test'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingProvider(provider.id)
                              // Pre-populate with current key for editing
                              setApiKeys(prev => ({ ...prev, [provider.id]: '' }))
                            }}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            ✏️ Replace
                          </button>
                          <button
                            onClick={() => deleteApiKey(provider.id)}
                            disabled={isDeleting}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                          >
                            {isDeleting ? '⏳ Deleting...' : '🗑️ Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Provider-specific status message for saved keys */}
                    {providerMessages[provider.id] && (
                      <div className={`mt-2 p-3 rounded-md text-sm font-medium flex items-center ${
                        providerMessages[provider.id]?.type === 'success' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {providerMessages[provider.id]?.message?.startsWith('🔄') && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        )}
                        {providerMessages[provider.id]?.message}
                      </div>
                    )}

                    {/* Admin key information */}
                    <div className={`mt-2 p-3 rounded-md text-sm border ${getAdminKeyInfo(provider.id, storedApiKeys[provider.id]?.isAdmin).bgColor} ${getAdminKeyInfo(provider.id, storedApiKeys[provider.id]?.isAdmin).textColor} ${getAdminKeyInfo(provider.id, storedApiKeys[provider.id]?.isAdmin).borderColor}`}>
                      <div className="font-medium mb-1">{getAdminKeyInfo(provider.id, storedApiKeys[provider.id]?.isAdmin).title}</div>
                      <div className="mb-2">{getAdminKeyInfo(provider.id, storedApiKeys[provider.id]?.isAdmin).message}</div>
                      
                      {!storedApiKeys[provider.id]?.isAdmin && (
                        <details className="mt-2">
                          <summary className="cursor-pointer font-medium hover:underline">
                            How to get an admin key? ↓
                          </summary>
                          <div className="mt-2 space-y-2">
                            <div className="text-xs">
                              <strong>Steps to upgrade:</strong>
                              <ol className="list-decimal list-inside mt-1 space-y-1">
                                {getAdminUpgradeInfo(provider.id).steps.map((step, index) => (
                                  <li key={index}>{step}</li>
                                ))}
                              </ol>
                            </div>
                            <a 
                              href={getAdminUpgradeInfo(provider.id).url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-xs underline hover:no-underline"
                            >
                              Learn more about admin access ↗
                            </a>
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                )}

                {/* Add/Edit Form */}
                {(!hasStoredKey || isEditing) && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      {hasStoredKey ? `Replace ${provider.name} API Key` : `${provider.name} API Key`}
                    </label>
                    <div className="flex space-x-2">
                      <div className="flex-1 relative">
                        <input
                          type={showKeys[provider.id] ? 'text' : 'password'}
                          value={apiKeys[provider.id] || ''}
                          onChange={(e) => setApiKeys(prev => ({ ...prev, [provider.id]: e.target.value }))}
                          placeholder={provider.placeholder}
                          className="w-full p-3 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKeys(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showKeys[provider.id] ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>
                      <button
                        onClick={() => testApiKey(provider.id)}
                        disabled={isTesting || !apiKeys[provider.id]?.trim()}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isTesting ? '⏳' : '🧪'} Test
                      </button>
                      <button
                        onClick={() => saveApiKey(provider.id)}
                        disabled={isSaving || !apiKeys[provider.id]?.trim()}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? '⏳ Saving...' : hasStoredKey ? '💾 Replace' : '💾 Save'}
                      </button>
                      {isEditing && (
                        <button
                          onClick={() => {
                            setEditingProvider(null)
                            setApiKeys(prev => ({ ...prev, [provider.id]: '' }))
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                          ❌ Cancel
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Get your API key from{' '}
                      <a 
                        href={provider.consoleUrl}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {provider.name} Console ↗
                      </a>
                    </p>
                    
                    {/* Provider-specific status message */}
                    {providerMessages[provider.id] && (
                      <div className={`mt-2 p-3 rounded-md text-sm font-medium flex items-center ${
                        providerMessages[provider.id]?.type === 'success' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {providerMessages[provider.id]?.message?.startsWith('🔄') && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        )}
                        {providerMessages[provider.id]?.message}
                      </div>
                    )}

                    {/* Dynamic info based on entered key */}
                    {apiKeys[provider.id] && (
                      <div className={`mt-2 p-3 rounded-md text-sm border ${
                        isAdminKey(apiKeys[provider.id], provider.id)
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        <div className="font-medium mb-1">
                          {isAdminKey(apiKeys[provider.id], provider.id) 
                            ? '🏢 Admin Key Detected' 
                            : '📊 Regular Key Detected'
                          }
                        </div>
                        <div className="mb-2">
                          {isAdminKey(apiKeys[provider.id], provider.id)
                            ? `This will enable usage control settings for ${provider.name}. You'll be able to control usage centrally and access advanced features.`
                            : `This will enable usage tracking only for ${provider.name}. Consider getting an admin key for centralized control.`
                          }
                        </div>
                        
                        {!isAdminKey(apiKeys[provider.id], provider.id) && (
                          <details className="mt-2">
                            <summary className="cursor-pointer font-medium hover:underline">
                              How to get an admin key? ↓
                            </summary>
                            <div className="mt-2 space-y-2">
                              <div className="text-xs">
                                <strong>Steps to upgrade:</strong>
                                <ol className="list-decimal list-inside mt-1 space-y-1">
                                  {getAdminUpgradeInfo(provider.id).steps.map((step, index) => (
                                    <li key={index}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                              <a 
                                href={getAdminUpgradeInfo(provider.id).url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-xs underline hover:no-underline"
                              >
                                Learn more about admin access ↗
                              </a>
                            </div>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Add Key Button - Only show for unconfigured providers */}
                {!hasStoredKey && !isEditing && (
                  <div>
                    <button
                      onClick={() => setEditingProvider(provider.id)}
                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                    >
                      ➕ Add {provider.name} API Key
                    </button>
                    
                    {/* Provider-specific status message for unconfigured providers */}
                    {providerMessages[provider.id] && (
                      <div className={`mt-2 p-3 rounded-md text-sm font-medium flex items-center ${
                        providerMessages[provider.id]?.type === 'success' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {providerMessages[provider.id]?.message?.startsWith('🔄') && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        )}
                        {providerMessages[provider.id]?.message}
                      </div>
                    )}

                    {/* Information about key types */}
                    <div className="mt-2 p-3 rounded-md text-sm border bg-gray-50 text-gray-700 border-gray-200">
                      <div className="font-medium mb-1">📋 Key Types Supported</div>
                      <div className="mb-2">
                        • <strong>Regular API Key:</strong> Usage tracking only<br/>
                        • <strong>Admin API Key:</strong> Usage control settings & centralized management
                      </div>
                      
                      <details className="mt-2">
                        <summary className="cursor-pointer font-medium hover:underline">
                          How to get an admin key? ↓
                        </summary>
                        <div className="mt-2 space-y-2">
                          <div className="text-xs">
                            <strong>Steps to upgrade:</strong>
                            <ol className="list-decimal list-inside mt-1 space-y-1">
                              {getAdminUpgradeInfo(provider.id).steps.map((step, index) => (
                                <li key={index}>{step}</li>
                              ))}
                            </ol>
                          </div>
                          <a 
                            href={getAdminUpgradeInfo(provider.id).url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs underline hover:no-underline"
                          >
                            Learn more about admin access ↗
                          </a>
                        </div>
                      </details>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">🔒 Security Notice</h3>
          <p className="text-sm text-blue-700">
            Your API keys are encrypted and stored securely. They are only used to make API calls on your behalf 
            and are never shared with third parties. You can update or remove them at any time.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Settings() {
  return (
    <AuthWrapper>
      <SettingsContent />
    </AuthWrapper>
  )
}
