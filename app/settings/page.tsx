'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AuthWrapper from '@/components/AuthWrapper'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Settings as SettingsIcon,
  Key,
  Eye,
  EyeOff,
  TestTube,
  Check,
  X,
  AlertTriangle,
  Info,
  ExternalLink,
  RefreshCw,
  Shield,
  Users,
  Activity,
  Globe,
  Lock,
  Unlock,
  Plus,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Zap
} from 'lucide-react'
import { getAIProviderLogo, getProviderInfo, ENABLED_AI_PROVIDERS } from '@/components/ui/ai-logos'
import { getProviderById, AI_PROVIDERS_CONFIG } from '@/lib/ai-providers-config'

interface StoredApiKey {
  masked: string
  hasKey: boolean
  keyLength: number
  lastUpdated?: string
  lastTested?: string
  isAdmin?: boolean
  status?: 'active' | 'inactive' | 'error'
  lastError?: string
}

interface ApiProvider {
  id: string
  name: string
  displayName: string
  keyPrefix: string
  adminKeyPatterns: string[]
  placeholder: string
  consoleUrl: string
  description: string
  docsUrl: string
  testUrl: string
  setupInstructions: string[]
  adminInstructions: string[]
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
  const [providerMessages, setProviderMessages] = useState<Record<string, {type: 'success' | 'error' | 'info', message: string} | null>>({})
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'online' | 'offline' | 'checking'>>({})
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [selectedView, setSelectedView] = useState<'overview' | 'analytics' | 'testing'>('overview')

  // Build provider configuration from global config
  const apiProviders: ApiProvider[] = ENABLED_AI_PROVIDERS.map(provider => ({
    id: provider.id,
    name: provider.name,
    displayName: provider.displayName,
    keyPrefix: getKeyPrefix(provider.id),
    adminKeyPatterns: getAdminKeyPatterns(provider.id),
    placeholder: getKeyPlaceholder(provider.id),
    consoleUrl: getConsoleUrl(provider.id),
    description: provider.description,
    docsUrl: provider.docsUrl || '#',
    testUrl: `/integration/${provider.id}`,
    setupInstructions: getSetupInstructions(provider.id),
    adminInstructions: getAdminInstructions(provider.id)
  }))

  function getKeyPrefix(providerId: string): string {
    switch (providerId) {
      case 'openai': return 'sk-'
      case 'claude': return 'sk-ant-'
      case 'gemini': return 'AIza'
      case 'grok': return 'xai-'
      default: return ''
    }
  }

  function getAdminKeyPatterns(providerId: string): string[] {
    switch (providerId) {
      case 'openai': return ['sk-org-', 'sk-proj-']
      case 'claude': return ['sk-ant-admin-', 'sk-ant-org-', 'workspace', 'admin']
      case 'gemini': return ['service-account', 'gcp-']
      case 'grok': return ['xai-org-']
      default: return []
    }
  }

  function getKeyPlaceholder(providerId: string): string {
    switch (providerId) {
      case 'openai': return 'sk-... or sk-org-... (admin) or sk-proj-... (project)'
      case 'claude': return 'sk-ant-api03-... or sk-ant-admin-... (admin) or workspace key (admin)'
      case 'gemini': return 'AIza... or service account JSON (admin)'
      case 'grok': return 'xai-... or xai-org-... (admin)'
      default: return 'Enter API key...'
    }
  }

  function getConsoleUrl(providerId: string): string {
    switch (providerId) {
      case 'openai': return 'https://platform.openai.com/api-keys'
      case 'claude': return 'https://console.anthropic.com/'
      case 'gemini': return 'https://aistudio.google.com/app/apikey'
      case 'grok': return 'https://console.x.ai/'
      default: return '#'
    }
  }

  function getSetupInstructions(providerId: string): string[] {
    switch (providerId) {
      case 'openai':
        return [
          'Visit OpenAI Platform and sign in',
          'Navigate to API Keys section',
          'Click "Create new secret key"',
          'Copy the key and paste it here',
          'Test the connection'
        ]
      case 'claude':
        return [
          'Sign in to Anthropic Console',
          'Go to API Keys section',
          'Generate a new API key',
          'Copy the key starting with sk-ant-',
          'Test the integration'
        ]
      case 'gemini':
        return [
          'Visit Google AI Studio',
          'Sign in with Google account',
          'Create new API key',
          'Copy the key starting with AIza',
          'Verify connection works'
        ]
      case 'grok':
        return [
          'Access X.AI Console',
          'Navigate to API section',
          'Generate new API key',
          'Copy the xai- prefixed key',
          'Test the connection'
        ]
      default:
        return ['Contact support for setup instructions']
    }
  }

  function getAdminInstructions(providerId: string): string[] {
    switch (providerId) {
      case 'openai':
        return [
          'Request organization admin role from your OpenAI org owner',
          'Generate organization-level API key (starts with sk-org-)',
          'Or create project-level key (starts with sk-proj-) with admin permissions',
          'This enables usage control, billing management, and team oversight'
        ]
      case 'claude':
        return [
          'Request admin access from your Anthropic organization admin',
          'Access workspace settings in Console',
          'Generate admin API key (contains "admin", "org", or "workspace" in the key)',
          'Admin keys typically start with sk-ant-admin- or sk-ant-org-',
          'Enables organization usage tracking, billing, and team management'
        ]
      case 'gemini':
        return [
          'Request Project Admin role in Google Cloud Console',
          'Create service account with AI Platform permissions',
          'Download service account JSON key',
          'Enables project-wide usage monitoring and limits'
        ]
      case 'grok':
        return [
          'Contact X.AI organization admin for permissions',
          'Generate organization API key (starts with xai-org-)',
          'Provides centralized usage control and analytics'
        ]
      default:
        return ['Contact provider support for admin setup']
    }
  }

  // Function to detect if an API key is an admin key
  const isAdminKey = (apiKey: string, providerId: string): boolean => {
    if (!apiKey) return false
    
    const provider = apiProviders.find(p => p.id === providerId)
    if (!provider) return false

    const isAdmin = provider.adminKeyPatterns.some(pattern => 
      apiKey.toLowerCase().includes(pattern.toLowerCase())
    )
    
    // Debug logging
    console.log('Admin Key Detection:', {
      providerId,
      keyLength: apiKey.length,
      keyPrefix: apiKey.substring(0, 15) + '...',
      patterns: provider.adminKeyPatterns,
      isAdmin
    })
    
    return isAdmin
  }

  // Enhanced testing with detailed results
  const performDetailedTest = async (providerId: string, apiKey?: string) => {
    const provider = apiProviders.find(p => p.id === providerId)
    const keyToTest = apiKey || storedApiKeys[providerId]?.masked
    
    if (!keyToTest && !apiKey) {
      setProviderMessages(prev => ({ 
        ...prev, 
        [providerId]: { 
          type: 'error', 
          message: 'No API key available for testing' 
        }
      }))
      return
    }

    setTestingProviders(prev => new Set(prev).add(providerId))
    setProviderMessages(prev => ({ 
      ...prev, 
      [providerId]: { 
        type: 'info', 
        message: `🔄 Running comprehensive test for ${provider?.displayName}...` 
      }
    }))
    
    try {
      const startTime = Date.now()
      
      // Determine if we should test against admin endpoint for Claude
      const keyIsAdmin = isAdminKey(apiKey || keyToTest, providerId)
      const testEndpoint = (providerId === 'claude' && keyIsAdmin) 
        ? '/api/claude-admin/test' 
        : `/api/${providerId}/test`
      
      console.log('Testing API Key:', {
        providerId,
        isAdmin: keyIsAdmin,
        endpoint: testEndpoint,
        hasApiKey: !!apiKey,
        hasStoredKey: !!keyToTest
      })
      
      const response = await fetch(testEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: "This is a comprehensive API test. Please respond with: 'Test successful! API integration working properly.'",
          testApiKey: apiKey,
          detailed: true
        })
      })

      const result = await response.json()
      const endTime = Date.now()
      const responseTime = endTime - startTime

      const testData = {
        status: response.ok && result.success ? 'success' : 'error',
        responseTime,
        timestamp: new Date().toISOString(),
        provider: provider?.displayName,
        keyType: isAdminKey(apiKey || '', providerId) ? 'Admin' : 'Standard',
        details: result.details || {},
        error: result.error,
        model: result.model,
        tokenUsage: result.usage || {}
      }

      setTestResults(prev => ({ ...prev, [providerId]: testData }))
      
      if (response.ok && result.success) {
        setProviderMessages(prev => ({ 
          ...prev, 
          [providerId]: { 
            type: 'success', 
            message: `✅ ${provider?.displayName} test successful! (${responseTime}ms)` 
          }
        }))
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'online' }))
      } else {
        setProviderMessages(prev => ({ 
          ...prev, 
          [providerId]: { 
            type: 'error', 
            message: `❌ Test failed: ${result.error || 'Unknown error'}` 
          }
        }))
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'offline' }))
      }
    } catch (err) {
      console.error(`Error testing ${provider?.displayName}:`, err)
      setProviderMessages(prev => ({ 
        ...prev, 
        [providerId]: { 
          type: 'error', 
          message: `❌ Test failed: Network error` 
        }
      }))
      setConnectionStatus(prev => ({ ...prev, [providerId]: 'offline' }))
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
      setProviderMessages(prev => ({ 
        ...prev, 
        [providerId]: { 
          type: 'error', 
          message: `Please enter a ${provider?.displayName} API key` 
        }
      }))
      return
    }

    if (hasStoredKey) {
      const confirmed = confirm(`Replace existing ${provider?.displayName} API key?`)
      if (!confirmed) return
    }

    const keyIsAdmin = isAdminKey(apiKey, providerId)
    
    console.log('Saving API Key:', {
      providerId,
      isAdmin: keyIsAdmin,
      keyPrefix: apiKey.substring(0, 15) + '...'
    })

    setSavingProviders(prev => new Set(prev).add(providerId))
    setProviderMessages(prev => ({ ...prev, [providerId]: null }))
    
    try {
      // Save the main provider key
      const response = await fetch('/api/settings/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId, apiKey, isAdmin: keyIsAdmin })
      })
      
      // If it's a Claude admin key, also save it as claude-admin
      if (providerId === 'claude' && keyIsAdmin) {
        console.log('Also saving as claude-admin key')
        await fetch('/api/settings/api-keys', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: 'claude-admin', apiKey, isAdmin: true })
        })
      }

      const result = await response.json()
      
      if (result.success) {
        const action = hasStoredKey ? 'updated' : 'added'
        const keyType = keyIsAdmin ? 'Admin key' : 'API key'
        
        setProviderMessages(prev => ({ 
          ...prev, 
          [providerId]: { 
            type: 'success', 
            message: `✅ ${keyType} ${action} successfully!` 
          }
        }))
        
        setApiKeys(prev => ({ ...prev, [providerId]: '' }))
        setEditingProvider(null)
        await loadStoredApiKeys()
        
        // Auto-test the newly saved key
        setTimeout(() => {
          performDetailedTest(providerId)
        }, 1000)
      } else {
        setProviderMessages(prev => ({ 
          ...prev, 
          [providerId]: { 
            type: 'error', 
            message: `❌ Failed to save API key: ${result.error}` 
          }
        }))
      }
    } catch (err) {
      setProviderMessages(prev => ({ 
        ...prev, 
        [providerId]: { 
          type: 'error', 
          message: `❌ Error saving ${provider?.displayName} API key` 
        }
      }))
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
    
    if (!confirm(`Delete ${provider?.displayName} API key? This cannot be undone.`)) {
      return
    }

    setDeletingProviders(prev => new Set(prev).add(providerId))
    
    try {
      const response = await fetch('/api/settings/api-keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId })
      })
      
      // If it's a Claude key and it was admin, also delete claude-admin
      if (providerId === 'claude' && storedApiKeys[providerId]?.isAdmin) {
        await fetch('/api/settings/api-keys', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: 'claude-admin' })
        })
      }

      const result = await response.json()
      
      if (result.success) {
        setProviderMessages(prev => ({ 
          ...prev, 
          [providerId]: { 
            type: 'success', 
            message: `✅ ${provider?.displayName} API key deleted successfully!` 
          }
        }))
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'offline' }))
        setTestResults(prev => {
          const newResults = { ...prev }
          delete newResults[providerId]
          return newResults
        })
        await loadStoredApiKeys()
      } else {
        setProviderMessages(prev => ({ 
          ...prev, 
          [providerId]: { 
            type: 'error', 
            message: `❌ Failed to delete API key: ${result.error}` 
          }
        }))
      }
    } catch (err) {
      setProviderMessages(prev => ({ 
        ...prev, 
        [providerId]: { 
          type: 'error', 
          message: `❌ Error deleting ${provider?.displayName} API key` 
        }
      }))
    } finally {
      setDeletingProviders(prev => {
        const newSet = new Set(prev)
        newSet.delete(providerId)
        return newSet
      })
    }
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

  const getConnectionStatusIndicator = (providerId: string) => {
    const status = connectionStatus[providerId]
    const hasKey = storedApiKeys[providerId]?.hasKey
    
    if (!hasKey) {
      return <div className="w-3 h-3 rounded-full bg-gray-400" title="Not configured"></div>
    }
    
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-400" title="Connected" />
      case 'offline':
        return <XCircle className="w-4 h-4 text-red-400" title="Disconnected" />
      case 'checking':
        return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" title="Checking..." />
      default:
        return <Clock className="w-4 h-4 text-gray-400" title="Unknown" />
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copied to clipboard!')
    setTimeout(() => setSuccess(null), 3000)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      loadStoredApiKeys()
    }
  }, [session])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-black to-gray-800/20" />
        </div>
        <div className="relative z-10 flex items-center justify-center h-screen">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-indigo-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-black to-gray-800/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 min-h-screen py-6">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <SettingsIcon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">API Configuration Center</h1>
                </div>
                <p className="text-gray-400">Manage AI provider integrations and monitor connections</p>
                <p className="text-sm text-gray-500 mt-1">
                  Signed in as: <span className="font-medium text-gray-300">{session?.user?.email}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-lg border border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-300">Live Status</span>
                </div>
                <button 
                  onClick={loadStoredApiKeys}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex space-x-1 bg-gray-800/30 rounded-lg p-1">
              {[
                { id: 'overview', label: 'Overview', icon: Globe },
                { id: 'analytics', label: 'Analytics', icon: Activity },
                { id: 'testing', label: 'Testing', icon: TestTube }
              ].map((view) => {
                const IconComponent = view.icon
                return (
                  <button
                    key={view.id}
                    onClick={() => setSelectedView(view.id as any)}
                    className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                      selectedView === view.id
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {view.label}
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Alert Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg"
            >
              {error}
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-900/50 border border-green-500/50 text-green-300 rounded-lg"
            >
              {success}
            </motion.div>
          )}

          {selectedView === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Provider Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {apiProviders.map((provider, index) => {
                  const hasStoredKey = storedApiKeys[provider.id]?.hasKey
                  const isEditing = editingProvider === provider.id
                  const isSaving = savingProviders.has(provider.id)
                  const isDeleting = deletingProviders.has(provider.id)
                  const isTesting = testingProviders.has(provider.id)
                  const storedKeyInfo = storedApiKeys[provider.id]
                  const currentTestResult = testResults[provider.id]
                  
                  return (
                    <motion.div
                      key={provider.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6"
                    >
                      {/* Provider Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          {getAIProviderLogo(provider.id, 'w-8 h-8')}
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-white">{provider.displayName}</h3>
                              {getConnectionStatusIndicator(provider.id)}
                            </div>
                            <p className="text-sm text-gray-400">{provider.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {hasStoredKey && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              storedKeyInfo?.isAdmin 
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-green-500/20 text-green-300 border border-green-500/30'
                            }`}>
                              {storedKeyInfo?.isAdmin ? '🏢 Admin' : '📊 Standard'}
                            </span>
                          )}
                          
                          <Link 
                            href={provider.testUrl}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                            title="Detailed Integration Test"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>

                      {/* Stored Key Display */}
                      {hasStoredKey && !isEditing && (
                        <div className="space-y-4 mb-6">
                          <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Key className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-400">API Key:</span>
                                  <code className="text-sm font-mono text-white bg-gray-700 px-2 py-1 rounded">
                                    {storedKeyInfo.masked}
                                  </code>
                                  <button
                                    onClick={() => copyToClipboard(storedKeyInfo.masked)}
                                    className="p-1 text-gray-400 hover:text-white"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>Length: {storedKeyInfo.keyLength} chars</span>
                                  {storedKeyInfo.lastUpdated && (
                                    <span>Updated: {new Date(storedKeyInfo.lastUpdated).toLocaleString()}</span>
                                  )}
                                  {storedKeyInfo.lastTested && (
                                    <span>Tested: {new Date(storedKeyInfo.lastTested).toLocaleString()}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Test Results */}
                            {currentTestResult && (
                              <div className="mt-3 p-3 bg-gray-700/30 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-gray-300">Last Test Result</span>
                                  <span className={`text-xs ${
                                    currentTestResult.status === 'success' ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                    {currentTestResult.responseTime}ms
                                  </span>
                                </div>
                                <div className="text-xs text-gray-400">
                                  {currentTestResult.model && `Model: ${currentTestResult.model} • `}
                                  {currentTestResult.keyType} Key • 
                                  {new Date(currentTestResult.timestamp).toLocaleString()}
                                </div>
                                
                                {/* Show detailed admin data for Claude admin keys */}
                                {currentTestResult.keyType === 'Admin' && currentTestResult.details && (
                                  <div className="mt-3 p-2 bg-purple-500/10 border border-purple-500/30 rounded text-xs">
                                    <div className="font-medium text-purple-300 mb-2">Admin Capabilities:</div>
                                    {currentTestResult.details.organization && (
                                      <div className="text-purple-200 mb-1">
                                        • Organization: {currentTestResult.details.organization.name || 'N/A'}
                                      </div>
                                    )}
                                    {currentTestResult.details.users && (
                                      <div className="text-purple-200 mb-1">
                                        • Users: {currentTestResult.details.users.total} total, {currentTestResult.details.users.admins} admins
                                      </div>
                                    )}
                                    {currentTestResult.details.billing && (
                                      <div className="text-purple-200 mb-1">
                                        • Current Month: ${currentTestResult.details.billing.currentMonthCost?.toFixed(2) || '0.00'}
                                      </div>
                                    )}
                                    {currentTestResult.details.usage && (
                                      <div className="text-purple-200 mb-1">
                                        • Tokens Used: {currentTestResult.details.usage.totalTokens?.toLocaleString() || '0'}
                                      </div>
                                    )}
                                    {currentTestResult.details.models && (
                                      <div className="text-purple-200">
                                        • Models: {currentTestResult.details.models?.filter((m: any) => m.enabled).length || 0} enabled
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-4">
                              <button
                                onClick={() => performDetailedTest(provider.id)}
                                disabled={isTesting}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm flex items-center gap-2"
                              >
                                {isTesting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <TestTube className="w-3 h-3" />}
                                Test Connection
                              </button>
                              <button
                                onClick={() => setEditingProvider(provider.id)}
                                className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-2"
                              >
                                <Edit className="w-3 h-3" />
                                Replace
                              </button>
                              <button
                                onClick={() => deleteApiKey(provider.id)}
                                disabled={isDeleting}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm flex items-center gap-2"
                              >
                                {isDeleting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Add/Edit Form */}
                      {(!hasStoredKey || isEditing) && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              {hasStoredKey ? `Replace ${provider.displayName} API Key` : `Add ${provider.displayName} API Key`}
                            </label>
                            <div className="relative">
                              <input
                                type={showKeys[provider.id] ? 'text' : 'password'}
                                value={apiKeys[provider.id] || ''}
                                onChange={(e) => setApiKeys(prev => ({ ...prev, [provider.id]: e.target.value }))}
                                placeholder={provider.placeholder}
                                className="w-full p-3 pr-12 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              <button
                                type="button"
                                onClick={() => setShowKeys(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                              >
                                {showKeys[provider.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            
                            {/* Dynamic key type detection */}
                            {apiKeys[provider.id] && (
                              <div className={`mt-2 p-3 rounded-lg text-sm ${
                                isAdminKey(apiKeys[provider.id], provider.id)
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}>
                                <div className="font-medium mb-1">
                                  {isAdminKey(apiKeys[provider.id], provider.id) 
                                    ? '🏢 Admin Key Detected' 
                                    : '📊 Standard Key Detected'
                                  }
                                </div>
                                <div className="text-xs">
                                  {isAdminKey(apiKeys[provider.id], provider.id)
                                    ? `This admin key will enable organization-level controls and advanced features for ${provider.displayName}.`
                                    : `This standard key will enable basic API access and usage tracking for ${provider.displayName}.`
                                  }
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => performDetailedTest(provider.id, apiKeys[provider.id])}
                              disabled={isTesting || !apiKeys[provider.id]?.trim()}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                              {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                              Test
                            </button>
                            <button
                              onClick={() => saveApiKey(provider.id)}
                              disabled={isSaving || !apiKeys[provider.id]?.trim()}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              {hasStoredKey ? 'Replace' : 'Save'}
                            </button>
                            {isEditing && (
                              <button
                                onClick={() => {
                                  setEditingProvider(null)
                                  setApiKeys(prev => ({ ...prev, [provider.id]: '' }))
                                }}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                            )}
                          </div>

                          <div className="text-xs text-gray-400">
                            Get your API key from{' '}
                            <a 
                              href={provider.consoleUrl}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-indigo-400 hover:text-indigo-300 underline inline-flex items-center gap-1"
                            >
                              {provider.displayName} Console
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            {' • '}
                            <Link 
                              href={provider.testUrl}
                              className="text-indigo-400 hover:text-indigo-300 underline"
                            >
                              Integration Guide
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Add Key Button for unconfigured providers */}
                      {!hasStoredKey && !isEditing && (
                        <button
                          onClick={() => setEditingProvider(provider.id)}
                          className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Add {provider.displayName} API Key
                        </button>
                      )}

                      {/* Status Messages */}
                      {providerMessages[provider.id] && (
                        <div className={`mt-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                          providerMessages[provider.id]?.type === 'success' 
                            ? 'bg-green-900/50 text-green-300 border border-green-500/50' 
                            : providerMessages[provider.id]?.type === 'info'
                              ? 'bg-blue-900/50 text-blue-300 border border-blue-500/50'
                              : 'bg-red-900/50 text-red-300 border border-red-500/50'
                        }`}>
                          {providerMessages[provider.id]?.message?.startsWith('🔄') && (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          )}
                          {providerMessages[provider.id]?.message}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {selectedView === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Analytics Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Key className="w-6 h-6 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-white">Total Keys</h3>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {Object.values(storedApiKeys).filter(k => k.hasKey).length}
                  </div>
                  <div className="text-sm text-gray-400">
                    {Object.values(storedApiKeys).filter(k => k.hasKey && k.isAdmin).length} admin keys
                  </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-6 h-6 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Active Connections</h3>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {Object.values(connectionStatus).filter(status => status === 'online').length}
                  </div>
                  <div className="text-sm text-gray-400">
                    of {apiProviders.length} providers
                  </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TestTube className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Tests Run</h3>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {Object.keys(testResults).length}
                  </div>
                  <div className="text-sm text-gray-400">
                    {Object.values(testResults).filter(r => r.status === 'success').length} successful
                  </div>
                </div>
              </div>

              {/* Provider Status Grid */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  Provider Status Overview
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {apiProviders.map((provider) => {
                    const hasKey = storedApiKeys[provider.id]?.hasKey
                    const status = connectionStatus[provider.id]
                    const testResult = testResults[provider.id]
                    
                    return (
                      <div key={provider.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-3 mb-3">
                          {getAIProviderLogo(provider.id, 'w-6 h-6')}
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{provider.displayName}</h4>
                            <div className="flex items-center gap-2">
                              {getConnectionStatusIndicator(provider.id)}
                              <span className="text-xs text-gray-400 capitalize">
                                {hasKey ? status || 'unknown' : 'not configured'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {testResult && (
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Response Time:</span>
                              <span className="text-white">{testResult.responseTime}ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Key Type:</span>
                              <span className="text-white">{testResult.keyType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Last Test:</span>
                              <span className="text-white">
                                {new Date(testResult.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {selectedView === 'testing' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Bulk Testing */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <TestTube className="w-5 h-5 text-blue-400" />
                    Connection Testing
                  </h3>
                  <button
                    onClick={() => {
                      apiProviders
                        .filter(p => storedApiKeys[p.id]?.hasKey)
                        .forEach(p => performDetailedTest(p.id))
                    }}
                    disabled={testingProviders.size > 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {testingProviders.size > 0 ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Test All Connections
                  </button>
                </div>

                {/* Individual Provider Testing */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {apiProviders
                    .filter(p => storedApiKeys[p.id]?.hasKey)
                    .map((provider) => {
                    const testResult = testResults[provider.id]
                    const isTesting = testingProviders.has(provider.id)
                    
                    return (
                      <div key={provider.id} className="p-6 bg-gray-800/30 rounded-xl border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getAIProviderLogo(provider.id, 'w-6 h-6')}
                            <div>
                              <h4 className="text-white font-semibold">{provider.displayName}</h4>
                              <div className="flex items-center gap-2">
                                {getConnectionStatusIndicator(provider.id)}
                                <span className="text-xs text-gray-400">
                                  {storedApiKeys[provider.id]?.isAdmin ? 'Admin Key' : 'Standard Key'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => performDetailedTest(provider.id)}
                              disabled={isTesting}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm flex items-center gap-2"
                            >
                              {isTesting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <TestTube className="w-3 h-3" />}
                              Test
                            </button>
                            <Link
                              href={provider.testUrl}
                              className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-2"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Details
                            </Link>
                          </div>
                        </div>

                        {testResult && (
                          <div className="space-y-3">
                            <div className={`p-3 rounded-lg ${
                              testResult.status === 'success'
                                ? 'bg-green-900/30 border border-green-500/30'
                                : 'bg-red-900/30 border border-red-500/30'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-sm font-medium ${
                                  testResult.status === 'success' ? 'text-green-300' : 'text-red-300'
                                }`}>
                                  {testResult.status === 'success' ? '✅ Test Successful' : '❌ Test Failed'}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {testResult.responseTime}ms
                                </span>
                              </div>
                              <div className="text-xs text-gray-400">
                                {testResult.model && `Model: ${testResult.model} • `}
                                Tested: {new Date(testResult.timestamp).toLocaleString()}
                              </div>
                              
                              {/* Show comprehensive admin data for admin keys */}
                              {testResult.keyType === 'Admin' && testResult.details && (
                                <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                                  <div className="font-medium text-purple-300 mb-3">🏢 Admin Capabilities Verified:</div>
                                  
                                  {testResult.details.organization && (
                                    <div className="mb-3">
                                      <div className="text-sm font-medium text-purple-200 mb-1">Organization Settings:</div>
                                      <div className="text-xs text-purple-100 space-y-1 pl-3">
                                        <div>• ID: {testResult.details.organization.id}</div>
                                        <div>• Name: {testResult.details.organization.name}</div>
                                        {testResult.details.organization.settings && (
                                          <>
                                            <div>• MFA Required: {testResult.details.organization.settings.mfaRequired ? 'Yes' : 'No'}</div>
                                            <div>• SSO Enabled: {testResult.details.organization.settings.ssoEnabled ? 'Yes' : 'No'}</div>
                                            <div>• Rate Limits: {testResult.details.organization.settings.rateLimits?.requestsPerMinute || 'N/A'} req/min</div>
                                            <div>• Allowed Models: {testResult.details.organization.settings.allowedModels || 'N/A'}</div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {testResult.details.users && (
                                    <div className="mb-3">
                                      <div className="text-sm font-medium text-purple-200 mb-1">User Management:</div>
                                      <div className="text-xs text-purple-100 space-y-1 pl-3">
                                        <div>• Total Users: {testResult.details.users.total}</div>
                                        <div>• Admin Users: {testResult.details.users.admins}</div>
                                        <div>• Active Users: {testResult.details.users.active}</div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {testResult.details.apiKeys && (
                                    <div className="mb-3">
                                      <div className="text-sm font-medium text-purple-200 mb-1">API Key Management:</div>
                                      <div className="text-xs text-purple-100 space-y-1 pl-3">
                                        <div>• Total Keys: {testResult.details.apiKeys.total}</div>
                                        <div>• Active Keys: {testResult.details.apiKeys.active}</div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {testResult.details.billing && (
                                    <div className="mb-3">
                                      <div className="text-sm font-medium text-purple-200 mb-1">Billing Information:</div>
                                      <div className="text-xs text-purple-100 space-y-1 pl-3">
                                        <div>• Current Month Cost: ${testResult.details.billing.currentMonthCost?.toFixed(2) || '0.00'}</div>
                                        <div>• Current Month Tokens: {testResult.details.billing.currentMonthTokens?.toLocaleString() || '0'}</div>
                                        <div>• Payment Method: {testResult.details.billing.paymentMethod || 'N/A'}</div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {testResult.details.usage && (
                                    <div className="mb-3">
                                      <div className="text-sm font-medium text-purple-200 mb-1">Usage Analytics:</div>
                                      <div className="text-xs text-purple-100 space-y-1 pl-3">
                                        <div>• Total Requests: {testResult.details.usage.totalRequests?.toLocaleString() || '0'}</div>
                                        <div>• Total Tokens: {testResult.details.usage.totalTokens?.toLocaleString() || '0'}</div>
                                        <div>• Total Cost: ${testResult.details.usage.totalCost?.toFixed(2) || '0.00'}</div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {testResult.details.models && (
                                    <div>
                                      <div className="text-sm font-medium text-purple-200 mb-1">Available Models:</div>
                                      <div className="text-xs text-purple-100 space-y-1 pl-3">
                                        {testResult.details.models?.map((model: any, idx: number) => (
                                          <div key={idx}>• {model.name} ({model.enabled ? '✓ Enabled' : '✗ Disabled'})</div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              {testResult.error && (
                                <div className="mt-2 text-xs text-red-300">
                                  Error: {testResult.error}
                                </div>
                              )}
                            </div>

                            {testResult.tokenUsage && Object.keys(testResult.tokenUsage).length > 0 && (
                              <div className="p-3 bg-gray-700/30 rounded-lg">
                                <div className="text-xs text-gray-300 font-medium mb-1">Token Usage</div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {Object.entries(testResult.tokenUsage).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="text-gray-400 capitalize">{key}:</span>
                                      <span className="text-white">{value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {Object.values(storedApiKeys).filter(k => k.hasKey).length === 0 && (
                  <div className="text-center py-12">
                    <TestTube className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No API keys configured</p>
                    <p className="text-gray-500 text-sm">Add API keys in the Overview tab to start testing</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Security & Privacy</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="text-white font-medium mb-2">🔐 Encryption</h4>
                <p className="text-gray-400">
                  All API keys are encrypted using AES-256 encryption before storage. 
                  Keys are decrypted only when making API calls on your behalf.
                </p>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">🔒 Privacy</h4>
                <p className="text-gray-400">
                  API keys are never shared with third parties or used for any purpose 
                  other than the services you request. You maintain full control.
                </p>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">📊 Monitoring</h4>
                <p className="text-gray-400">
                  Connection status and test results are monitored to ensure optimal 
                  performance and to alert you of any issues.
                </p>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">⚡ Performance</h4>
                <p className="text-gray-400">
                  Real-time testing and analytics help optimize your AI provider 
                  usage for cost efficiency and performance.
                </p>
              </div>
            </div>
          </motion.div>
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