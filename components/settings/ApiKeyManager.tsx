'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Key, Plus, Trash2, Eye, EyeOff, Check, X, 
  AlertCircle, Loader2, Shield, Sparkles, ExternalLink 
} from 'lucide-react'
import { apiPost, apiGet } from '@/lib/utils/api-client'

interface ApiKey {
  id: string
  provider: string
  maskedKey: string
  isActive: boolean
  lastUsed: Date | null
  createdAt: Date
}

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', icon: '🤖', color: 'from-green-500 to-emerald-600' },
  { id: 'anthropic', name: 'Claude', icon: '🧠', color: 'from-orange-500 to-red-600' },
  { id: 'google', name: 'Gemini', icon: '✨', color: 'from-blue-500 to-indigo-600' },
  { id: 'mistral', name: 'Mistral', icon: '🌊', color: 'from-purple-500 to-pink-600' },
  { id: 'perplexity', name: 'Perplexity', icon: '🔍', color: 'from-teal-500 to-cyan-600' },
]

export default function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('')
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch existing keys
  useEffect(() => {
    fetchKeys()
  }, [])

  const fetchKeys = async () => {
    try {
      const response = await apiGet('/api/api-keys')
      if (response.ok && response.data) {
        setKeys(response.data.keys || [])
      } else {
        console.error('Error fetching keys:', response.error)
      }
    } catch (error) {
      console.error('Error fetching keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddKey = async () => {
    if (!selectedProvider || !apiKeyInput) {
      setError('Please select a provider and enter an API key')
      return
    }

    setSaving(true)
    setError('')
    
    try {
      // Use centralized validation endpoint with safe API client
      const validationResponse = await apiPost('/api/api-keys/validate', {
        apiKey: apiKeyInput,
        provider: selectedProvider,
        test: true // Request test validation as well
      })
      
      if (!validationResponse.ok || !validationResponse.data?.valid) {
        setError(`API key validation failed: ${validationResponse.error || validationResponse.data?.error || 'Invalid API key'}`)
        setSaving(false)
        return
      }
      
      const validationData = validationResponse.data

      // Show detailed validation results
      const providerName = PROVIDERS.find(p => p.id === selectedProvider)?.name || selectedProvider
      if (validationData.keyType) {
        const keyTypeLabel = validationData.keyType === 'admin' ? 'Admin' : 
                            validationData.keyType === 'organization' ? 'Organization' : 
                            'Standard'
        setSuccess(`✓ ${keyTypeLabel} key validated for ${providerName}. ${validationData.message || ''}`)
      } else {
        setSuccess(`✓ ${providerName} API key validated successfully!`)
      }

      // If validation passed, save the key
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          apiKey: apiKeyInput
        })
      })

      if (response.ok) {
        // Don't override the validation success message if it's already set
        if (!success) {
          setSuccess('✓ API key saved successfully!')
        }
        setApiKeyInput('')
        setSelectedProvider('')
        setShowAddForm(false)
        fetchKeys() // Refresh the list
        
        // Clear success message after 7 seconds to give user time to read
        setTimeout(() => setSuccess(''), 7000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save API key')
      }
    } catch (error) {
      setError('Failed to save API key')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return

    try {
      const response = await fetch(`/api/api-keys?id=${keyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess('API key deleted successfully')
        fetchKeys()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      setError('Failed to delete API key')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">API Keys</h2>
          <p className="text-gray-400 mt-1">Manage your AI provider API keys securely</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add API Key
        </button>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400"
          >
            <Check className="w-5 h-5" />
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Key Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Add New API Key</h3>
            
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Select Provider
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider.id)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedProvider === provider.id
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{provider.icon}</div>
                    <div className="text-sm text-gray-300">{provider.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* API Key Input */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Test API Key Button */}
              {selectedProvider && apiKeyInput && (
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      setSaving(true)
                      setError('')
                      setSuccess('')
                      
                      // Determine test endpoint
                      let testEndpoint = ''
                      if (selectedProvider === 'anthropic' && apiKeyInput.startsWith('sk-ant-admin')) {
                        testEndpoint = '/api/claude-admin/test'
                      } else if (selectedProvider === 'anthropic') {
                        testEndpoint = '/api/claude/test'
                      } else if (selectedProvider === 'openai') {
                        testEndpoint = '/api/openai/test'
                      } else if (selectedProvider === 'google') {
                        testEndpoint = '/api/gemini/test'
                      } else {
                        testEndpoint = '/api/openai/test' // Mistral and Perplexity use OpenAI-compatible
                      }
                      
                      try {
                        const response = await fetch(testEndpoint, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            prompt: "Hi, this is a test to validate my API key. Please respond with 'API key is working!'",
                            testApiKey: apiKeyInput,
                            detailed: true
                          })
                        })
                        
                        const data = await response.json()
                        if (response.ok && data.success) {
                          setSuccess('✓ API key is valid and working!')
                        } else {
                          setError(data.error || 'API key validation failed')
                        }
                      } catch (error) {
                        setError('Failed to test API key')
                      } finally {
                        setSaving(false)
                      }
                    }}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Test API Key
                  </button>
                  
                  <a
                    href={`/api/${selectedProvider === 'anthropic' && apiKeyInput.startsWith('sk-ant-admin') ? 'claude-admin' : selectedProvider === 'anthropic' ? 'claude' : selectedProvider === 'google' ? 'gemini' : selectedProvider}/test`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 hover:text-violet-300 text-sm underline flex items-center gap-1"
                  >
                    Open detailed test page
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setApiKeyInput('')
                  setSelectedProvider('')
                  setError('')
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddKey}
                disabled={saving || !selectedProvider || !apiKeyInput}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Validating & Saving...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Validate & Save
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing Keys List */}
      <div className="space-y-3">
        {keys.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
            <Key className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No API Keys Added</h3>
            <p className="text-gray-500 mb-4">Add your first API key to start tracking AI usage</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Your First Key
            </button>
          </div>
        ) : (
          keys.map((key) => {
            const provider = PROVIDERS.find(p => p.id === key.provider)
            return (
              <motion.div
                key={key.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center justify-between hover:border-gray-700 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${provider?.color || 'from-gray-600 to-gray-700'} flex items-center justify-center text-2xl`}>
                    {provider?.icon || '🔑'}
                  </div>
                  <div>
                    <div className="font-medium text-white">{provider?.name || key.provider}</div>
                    <div className="text-sm text-gray-400">{key.maskedKey}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Added {new Date(key.createdAt).toLocaleDateString()}
                      {key.lastUsed && ` • Last used ${new Date(key.lastUsed).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-1 rounded text-xs ${
                    key.isActive 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                  }`}>
                    {key.isActive ? 'Active' : 'Inactive'}
                  </div>
                  <Link
                    href={`/api/${key.provider === 'anthropic' && key.maskedKey.includes('admin') ? 'claude-admin' : key.provider === 'anthropic' ? 'claude' : key.provider === 'google' ? 'gemini' : key.provider}/test?id=${key.id}`}
                    className="p-2 text-violet-400 hover:text-violet-300 transition-colors"
                    title="Test API endpoint"
                  >
                    <Sparkles className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteKey(key.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete API key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Security Note */}
      <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-violet-400 mb-1">Security Note</h4>
            <p className="text-xs text-gray-400">
              Your API keys are encrypted before storage and never exposed in plain text. 
              We use industry-standard encryption to keep your credentials secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}