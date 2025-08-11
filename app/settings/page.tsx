'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AuthWrapper from '@/components/AuthWrapper'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { LogoThemed } from '@/components/ui/LogoThemed'
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
  Zap,
  Sparkles,
  Loader2,
  Database,
  ShieldCheck
} from 'lucide-react'
import { getAIProviderLogo, getProviderInfo, ENABLED_AI_PROVIDERS } from '@/components/ui/ai-logos'
import { getProviderById, AI_PROVIDERS_CONFIG } from '@/lib/ai-providers-config'

interface DatabaseApiKey {
  id: string
  provider: string
  maskedKey: string
  isActive: boolean
  lastUsed: Date | null
  createdAt: Date
}

interface ApiProvider {
  id: string
  name: string
  endpoint?: string
  icon: JSX.Element
  color: string
  description: string
  features: string[]
  pricing?: string
  status: 'active' | 'coming-soon' | 'beta'
  dbKey?: DatabaseApiKey
  keyType?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 10
    }
  }
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('api-keys')
  const [providers, setProviders] = useState<ApiProvider[]>([])
  const [tempKeys, setTempKeys] = useState<{ [key: string]: string }>({})
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({})
  const [testingKeys, setTestingKeys] = useState<{ [key: string]: boolean }>({})
  const [savingKeys, setSavingKeys] = useState<{ [key: string]: boolean }>({})
  const [deletingKeys, setDeletingKeys] = useState<{ [key: string]: boolean }>({})
  const [testResults, setTestResults] = useState<{ [key: string]: { success: boolean; message: string; keyType?: string } }>({})
  const [loadingKeys, setLoadingKeys] = useState(true)
  const [editingKeys, setEditingKeys] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchStoredKeys()
    }
  }, [session])

  const fetchStoredKeys = async () => {
    try {
      const response = await fetch('/api/api-keys')
      if (response.ok) {
        const data = await response.json()
        const keys: DatabaseApiKey[] = data.keys || []
        
        // Map providers with their stored keys
        const providersWithKeys = ENABLED_AI_PROVIDERS.map(provider => {
          // Find matching key in database
          const dbKey = keys.find((k: DatabaseApiKey) => {
            // Map provider IDs correctly - UI uses 'claude', 'gemini' etc
            // but database stores 'anthropic', 'google' etc
            const providerMapping: { [key: string]: string } = {
              'openai': 'openai',
              'claude': 'anthropic',  // UI shows 'claude', DB stores 'anthropic'
              'gemini': 'google',     // UI shows 'gemini', DB stores 'google'
              'grok': 'xai',          // UI shows 'grok', DB stores 'xai'
              'mistral': 'mistral',
              'perplexity': 'perplexity'
            }
            const mappedId = providerMapping[provider.id] || provider.id
            return k.provider === mappedId
          })
          
          let keyType = 'Standard'
          if (dbKey?.maskedKey) {
            if (dbKey.maskedKey.includes('admin')) {
              keyType = 'Admin/Organization'
            } else if (dbKey.maskedKey.includes('org-')) {
              keyType = 'Organization'
            }
          }
          
          const providerInfo = getProviderInfo(provider.id)
          
          return {
            ...provider,
            dbKey,
            keyType,
            icon: getAIProviderLogo(provider.id, 'w-5 h-5'),
            color: providerInfo.gradient,
            features: [],
            status: 'active' as const
          } as ApiProvider
        })
        
        setProviders(providersWithKeys)
      }
    } catch (error) {
      console.error('Error fetching keys:', error)
    } finally {
      setLoadingKeys(false)
    }
  }

  const getProviderMapping = (providerId: string): string => {
    // Map UI provider IDs to database provider names
    const mapping: { [key: string]: string } = {
      'openai': 'openai',
      'claude': 'anthropic',    // UI shows 'claude', DB stores 'anthropic'
      'gemini': 'google',        // UI shows 'gemini', DB stores 'google'
      'grok': 'xai',            // UI shows 'grok', DB stores 'xai'
      'mistral': 'mistral',
      'perplexity': 'perplexity'
    }
    return mapping[providerId] || providerId
  }

  const getTestEndpoint = (providerId: string, apiKey: string): string => {
    // Use the original provider ID for test endpoints
    if (providerId === 'claude') {
      if (apiKey.startsWith('sk-ant-admin')) {
        return '/api/claude-admin/test'
      }
      return '/api/claude/test'
    } else if (providerId === 'gemini') {
      return '/api/gemini/test'
    } else if (providerId === 'grok') {
      return '/api/grok/test'
    } else if (providerId === 'openai') {
      return '/api/openai/test'
    } else {
      // Default fallback
      return '/api/openai/test'
    }
  }

  const handleSaveKey = async (providerId: string) => {
    const key = tempKeys[providerId]
    if (!key) return

    setSavingKeys({ ...savingKeys, [providerId]: true })
    setTestResults({})
    
    try {
      // First test the API key
      const testEndpoint = getTestEndpoint(providerId, key)
      const testResponse = await fetch(testEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: "Test API key validation",
          testApiKey: key,
          detailed: true
        })
      })

      const testData = await testResponse.json()
      
      if (!testResponse.ok || !testData.success) {
        setTestResults({
          [providerId]: { 
            success: false, 
            message: testData.error || 'Invalid API key'
          }
        })
        setSavingKeys({ ...savingKeys, [providerId]: false })
        setTimeout(() => setTestResults({}), 5000)
        return
      }
      
      // Determine key type
      let keyType = 'Standard'
      if (key.startsWith('sk-ant-admin')) {
        keyType = 'Claude Admin'
      } else if (key.startsWith('org-')) {
        keyType = 'Organization'
      } else if (testData.keyType) {
        keyType = testData.keyType
      }
      
      // Save to database
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: getProviderMapping(providerId),
          apiKey: key
        })
      })
      
      if (response.ok) {
        await fetchStoredKeys()
        setTempKeys({ ...tempKeys, [providerId]: '' })
        setEditingKeys({ ...editingKeys, [providerId]: false })
        
        setTestResults({
          [providerId]: { 
            success: true, 
            message: `✅ ${keyType} API key validated and saved successfully!`,
            keyType
          }
        })
        
        // Keep success message visible longer (10 seconds instead of 5)
        setTimeout(() => setTestResults({}), 10000)
      } else {
        const data = await response.json()
        setTestResults({
          [providerId]: { 
            success: false, 
            message: data.error || 'Failed to save API key'
          }
        })
      }
    } catch (error) {
      setTestResults({
        [providerId]: { 
          success: false, 
          message: `Error: ${error}`
        }
      })
    } finally {
      setSavingKeys({ ...savingKeys, [providerId]: false })
    }
  }

  const handleTestKey = async (provider: ApiProvider) => {
    if (!provider.dbKey) return
    
    setTestingKeys({ ...testingKeys, [provider.id]: true })
    
    try {
      // Determine test endpoint based on provider ID and key type
      let testEndpoint = ''
      if (provider.id === 'claude') {
        if (provider.keyType === 'Claude Admin' || provider.dbKey.maskedKey.includes('admin')) {
          testEndpoint = '/api/claude-admin/test'
        } else {
          testEndpoint = '/api/claude/test'
        }
      } else if (provider.id === 'gemini') {
        testEndpoint = '/api/gemini/test'
      } else if (provider.id === 'grok') {
        testEndpoint = '/api/grok/test'
      } else if (provider.id === 'openai') {
        testEndpoint = '/api/openai/test'
      } else {
        testEndpoint = '/api/openai/test'
      }
      
      const response = await fetch(testEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: "Test API key validation",
          useStoredKey: true,
          detailed: true
        })
      })
      
      const result = await response.json()
      const keyType = result.keyType || provider.keyType || 'Standard'
      
      setTestResults({
        [provider.id]: {
          success: result.success,
          message: result.success 
            ? `✓ ${keyType} key validated successfully!`
            : result.error || 'API key validation failed',
          keyType: result.success ? keyType : undefined
        }
      })
      
      setTimeout(() => setTestResults({}), 5000)
    } catch (error) {
      setTestResults({
        [provider.id]: {
          success: false,
          message: `Test failed: ${error}`
        }
      })
    } finally {
      setTestingKeys({ ...testingKeys, [provider.id]: false })
    }
  }

  const handleDeleteKey = async (provider: ApiProvider) => {
    if (!provider.dbKey?.id) return
    
    if (!confirm('Are you sure you want to delete this API key?')) return
    
    setDeletingKeys({ ...deletingKeys, [provider.id]: true })
    
    try {
      const response = await fetch(`/api/api-keys?id=${provider.dbKey.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchStoredKeys()
        setTestResults({
          [provider.id]: { 
            success: true, 
            message: 'API key deleted successfully'
          }
        })
        setTimeout(() => setTestResults({}), 3000)
      } else {
        setTestResults({
          [provider.id]: { 
            success: false, 
            message: 'Failed to delete API key'
          }
        })
      }
    } catch (error) {
      setTestResults({
        [provider.id]: { 
          success: false, 
          message: `Delete failed: ${error}`
        }
      })
    } finally {
      setDeletingKeys({ ...deletingKeys, [provider.id]: false })
    }
  }

  const renderApiKeyCard = (provider: ApiProvider) => {
    const hasKey = !!provider.dbKey
    const isEditing = editingKeys[provider.id]
    const currentKey = tempKeys[provider.id] || ''
    const testResult = testResults[provider.id]
    const isTesting = testingKeys[provider.id]
    const isSaving = savingKeys[provider.id]
    const isDeleting = deletingKeys[provider.id]
    const isVisible = showKeys[provider.id]

    return (
      <motion.div
        key={provider.id}
        variants={itemVariants}
        className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 rounded-2xl p-6 border border-gray-700/50 hover:border-violet-500/30 transition-all duration-300 backdrop-blur-sm shadow-xl hover:shadow-violet-500/10"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${provider.color} shadow-lg text-white`}>
              {provider.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {provider.name}
                {provider.status === 'beta' && (
                  <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                    BETA
                  </span>
                )}
                {provider.status === 'coming-soon' && (
                  <span className="px-2 py-0.5 text-xs bg-gray-500/20 text-gray-400 rounded-full border border-gray-500/30">
                    SOON
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-500">{provider.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {provider.dbKey?.isActive && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">Active</span>
              </div>
            )}
            {provider.keyType && provider.keyType !== 'Standard' && (
              <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 rounded-lg">
                <ShieldCheck className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-purple-400">{provider.keyType}</span>
              </div>
            )}
            {provider.dbKey?.lastUsed && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-700/50 rounded-lg">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">
                  {new Date(provider.dbKey.lastUsed).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* API Key Input/Display */}
        <div className="space-y-3">
          {isEditing || !hasKey ? (
            <div className="relative">
              <input
                type={isVisible ? 'text' : 'password'}
                value={currentKey}
                onChange={(e) => setTempKeys({ ...tempKeys, [provider.id]: e.target.value })}
                placeholder={`Enter your ${provider.name} API key`}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none transition-colors pr-12"
                disabled={provider.status === 'coming-soon'}
              />
              <button
                onClick={() => setShowKeys({ ...showKeys, [provider.id]: !isVisible })}
                className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                type="button"
              >
                {isVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400 font-mono">
                  {provider.dbKey?.maskedKey}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Encrypted in database</span>
              </div>
            </div>
          )}

          {/* Test Result Display */}
          {testResult && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`p-4 rounded-xl border-2 font-medium ${
                testResult.success
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50 text-green-400 shadow-lg shadow-green-500/20'
                  : 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/50 text-red-400 shadow-lg shadow-red-500/20'
              }`}
            >
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span className="text-sm">{testResult.message}</span>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isEditing || !hasKey ? (
              <>
                <button
                  onClick={() => handleSaveKey(provider.id)}
                  disabled={isSaving || !currentKey || provider.status === 'coming-soon'}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Validating & Saving...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Validate & Save Key</span>
                    </>
                  )}
                </button>
                {isEditing && (
                  <button
                    onClick={() => {
                      setEditingKeys({ ...editingKeys, [provider.id]: false })
                      setTempKeys({ ...tempKeys, [provider.id]: '' })
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => handleTestKey(provider)}
                  disabled={isTesting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4" />
                      <span>Test Key</span>
                    </>
                  )}
                </button>
                <Link
                  href={`/api/${
                    provider.keyType === 'Claude Admin' ? 'claude-admin' : 
                    provider.id === 'claude' ? 'claude' : 
                    provider.id === 'gemini' ? 'gemini' : 
                    provider.id === 'grok' ? 'grok' :
                    provider.id
                  }/test?id=${provider.dbKey?.id}`}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
                  title="Open detailed test page with CURL commands"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Details</span>
                </Link>
                <button
                  onClick={() => {
                    setEditingKeys({ ...editingKeys, [provider.id]: true })
                  }}
                  className="px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteKey(provider)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        {provider.features && provider.features.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="flex flex-wrap gap-2">
              {provider.features.map((feature, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs bg-gray-700/30 text-gray-400 rounded-lg"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  const renderGeneralSettings = () => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-400" />
          General Preferences
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Default Model</label>
            <select className="w-full mt-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-violet-500 focus:outline-none">
              <option>GPT-4o</option>
              <option>Claude 3.5 Sonnet</option>
              <option>Gemini Pro</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400">Temperature</label>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="70"
              className="w-full mt-1"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Precise</span>
              <span>Balanced</span>
              <span>Creative</span>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400">Max Tokens</label>
            <input
              type="number"
              defaultValue="2048"
              className="w-full mt-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-violet-500 focus:outline-none"
            />
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          Usage & Limits
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Monthly API Calls</span>
            <span className="text-white">8,432 / 10,000</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '84.32%' }}></div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Token Usage</span>
            <span className="text-white">2.4M / 5M</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: '48%' }}></div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )

  const renderTeamSettings = () => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Team Members
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                {session?.user?.name?.[0] || 'U'}
              </div>
              <div>
                <p className="text-white font-medium">{session?.user?.name || 'User'}</p>
                <p className="text-xs text-gray-400">{session?.user?.email}</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Owner</span>
          </div>
        </div>
        <button className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-400" />
          Permissions
        </h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl cursor-pointer">
            <div>
              <p className="text-white">Allow API Key Management</p>
              <p className="text-xs text-gray-400">Team members can add/edit API keys</p>
            </div>
            <input type="checkbox" className="toggle" defaultChecked />
          </label>
          <label className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl cursor-pointer">
            <div>
              <p className="text-white">View Usage Analytics</p>
              <p className="text-xs text-gray-400">Team members can view usage data</p>
            </div>
            <input type="checkbox" className="toggle" defaultChecked />
          </label>
        </div>
      </motion.div>
    </motion.div>
  )

  const renderSecuritySettings = () => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-yellow-400" />
          Security Settings
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-400 font-medium">Encrypted Storage</p>
                <p className="text-xs text-gray-400 mt-1">All API keys are encrypted using AES-256-GCM before database storage</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-gray-400 mt-1">Enhance your account security with 2FA</p>
                <button className="mt-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/30 transition-colors">
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl cursor-pointer">
              <div>
                <p className="text-white">Admin Key Detection</p>
                <p className="text-xs text-gray-400">Automatically detect and flag admin/org keys</p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </label>
            <label className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl cursor-pointer">
              <div>
                <p className="text-white">Session Timeout</p>
                <p className="text-xs text-gray-400">Auto-logout after 30 minutes of inactivity</p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </label>
            <label className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl cursor-pointer">
              <div>
                <p className="text-white">API Key Rotation Reminder</p>
                <p className="text-xs text-gray-400">Get reminded to rotate keys every 90 days</p>
              </div>
              <input type="checkbox" className="toggle" />
            </label>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Activity Log
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg text-sm">
            <span className="text-gray-400">API Key added for OpenAI</span>
            <span className="text-xs text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg text-sm">
            <span className="text-gray-400">Settings updated</span>
            <span className="text-xs text-gray-500">5 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg text-sm">
            <span className="text-gray-400">Login from new device</span>
            <span className="text-xs text-gray-500">1 day ago</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )

  if (loadingKeys) {
    return (
      <AuthWrapper>
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <span className="text-white text-lg">Loading API Keys...</span>
          </div>
        </div>
      </AuthWrapper>
    )
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
                  <SettingsIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Settings</h1>
                  <p className="text-gray-400">Manage your API keys with enterprise-grade security</p>
                </div>
              </div>
              <LogoThemed size="lg" showText={true} forceDark={true} />
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {[
              { id: 'api-keys', label: 'API Keys', icon: Key },
              { id: 'general', label: 'General', icon: SettingsIcon },
              { id: 'team', label: 'Team', icon: Users },
              { id: 'security', label: 'Security', icon: Shield }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'api-keys' && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {providers.map(renderApiKeyCard)}
            </motion.div>
          )}
          
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'team' && renderTeamSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
        </div>
      </div>
    </AuthWrapper>
  )
}