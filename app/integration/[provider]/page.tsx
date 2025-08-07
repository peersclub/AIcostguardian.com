'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowLeft,
  CheckCircle,
  RefreshCw,
  Settings,
  Play,
  AlertCircle,
  KeyRound,
  XCircle,
  ShieldAlert,
  Loader2
} from 'lucide-react'
import { getAIProviderLogo } from '@/components/ui/ai-logos'
import { getProviderById } from '@/lib/ai-providers-config'

interface TestResult {
  success: boolean
  message: string
  responseTime?: number
  details?: any
}

export default function UnifiedIntegrationPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const providerId = params.provider as string
  
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error' | 'no-key'>('testing')
  const [isRunningTest, setIsRunningTest] = useState(false)
  const [isAdminKey, setIsAdminKey] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [testResults, setTestResults] = useState<TestResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiResponse, setApiResponse] = useState<any>(null)

  const provider = getProviderById(providerId)
  
  // Redirect if invalid provider
  useEffect(() => {
    if (!provider) {
      router.push('/settings')
    }
  }, [provider, router])

  // Check if API key exists
  useEffect(() => {
    const checkApiKey = async () => {
      if (!session?.user?.id) return
      
      try {
        const response = await fetch('/api/settings/api-keys')
        const data = await response.json()
        
        // The API returns an object with provider IDs as keys
        const providerKey = data.apiKeys?.[providerId]
        
        if (providerKey?.hasKey) {
          setHasApiKey(true)
          setConnectionStatus('connected')
          
          // Check if it's an admin key
          if (providerKey.isAdmin) {
            setIsAdminKey(true)
          }
        } else {
          setHasApiKey(false)
          setConnectionStatus('no-key')
        }
      } catch (error) {
        console.error('Error checking API key:', error)
        setConnectionStatus('no-key')
      }
    }

    checkApiKey()
  }, [session, providerId])

  const runTest = async () => {
    if (!hasApiKey) {
      setError('No API key configured. Please add your API key in Settings.')
      return
    }

    setIsRunningTest(true)
    setError(null)
    setTestResults(null)
    setApiResponse(null)
    
    try {
      const startTime = Date.now()
      const response = await fetch(`/api/${providerId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'This is a test message. Please respond with "Test successful!"',
          model: provider?.models?.[0]?.modelId || `${providerId}-default`
        })
      })
      
      const responseTime = Date.now() - startTime
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Test failed')
      }
      
      setApiResponse(data)
      
      // Check if this is an admin key
      if (data.adminKeyNotice || data.keyType === 'admin') {
        setIsAdminKey(true)
        setConnectionStatus('connected')
        
        setTestResults({
          success: true,
          message: `${provider?.name} Admin Key Validated`,
          responseTime,
          details: {
            keyType: 'Admin/Organization Key',
            capabilities: 'Full administrative access',
            warning: 'This key has elevated privileges. Consider using a regular API key for standard operations.'
          }
        })
      } else {
        setConnectionStatus('connected')
        setIsAdminKey(false)
        
        setTestResults({
          success: true,
          message: 'API Connection Successful',
          responseTime,
          details: {
            keyType: 'Standard API Key',
            model: data.response?.model || provider?.models?.[0]?.modelId,
            response: data.response?.content || 'Test successful!',
            usage: data.usage || data.response?.usage
          }
        })
      }
      
    } catch (error: any) {
      console.error('Test error:', error)
      setConnectionStatus('error')
      setError(error.message || 'Connection test failed')
      
      setTestResults({
        success: false,
        message: 'Connection Test Failed',
        details: {
          error: error.message,
          suggestion: 'Please verify your API key is valid and has the necessary permissions.'
        }
      })
    } finally {
      setIsRunningTest(false)
    }
  }

  if (!provider) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/settings" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getAIProviderLogo(providerId, 'w-12 h-12')}
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{provider.name} Integration Test</h1>
                <p className="text-gray-400">Validate your API key and test the connection</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'testing' ? 'bg-yellow-500 animate-pulse' : 
                  connectionStatus === 'no-key' ? 'bg-gray-500' :
                  'bg-red-500'
                }`} />
                <span className="text-gray-300 capitalize">
                  {connectionStatus === 'no-key' ? 'No API Key' :
                   connectionStatus === 'connected' ? (isAdminKey ? 'Admin Key Configured' : 'Ready') :
                   connectionStatus === 'testing' ? 'Testing' : 'Error'}
                </span>
              </div>
              
              <Link
                href="/settings"
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configure
              </Link>
            </div>
          </div>
        </div>

        {/* No API Key Warning */}
        {connectionStatus === 'no-key' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-yellow-900/20 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-6">
              <div className="flex items-start gap-4">
                <KeyRound className="w-6 h-6 text-yellow-400 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">API Key Required</h3>
                  <p className="text-yellow-200/80 mb-4">
                    You need to configure an API key for {provider.name} to run tests.
                  </p>
                  <Link
                    href="/settings"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                  >
                    <Settings className="w-4 h-4" />
                    Add API Key in Settings
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Admin Key Notice */}
        {isAdminKey && !isRunningTest && testResults?.success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-blue-900/20 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6">
              <div className="flex items-start gap-4">
                <ShieldAlert className="w-6 h-6 text-blue-400 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">Admin/Organization Key Detected</h3>
                  <p className="text-blue-200/80 mb-3">
                    You're using an administrative key with elevated privileges.
                  </p>
                  <div className="text-sm text-blue-200/60 space-y-1">
                    <p>Admin keys typically provide:</p>
                    <ul className="list-disc list-inside ml-2">
                      <li>Organization management access</li>
                      <li>User and team administration</li>
                      <li>Billing and usage analytics</li>
                      <li>API key management for the organization</li>
                    </ul>
                    <p className="mt-2">For regular API usage, consider using a standard API key instead.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {error && !isRunningTest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-red-900/20 backdrop-blur-xl rounded-2xl border border-red-500/30 p-6">
              <div className="flex items-start gap-4">
                <XCircle className="w-6 h-6 text-red-400 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-400 mb-2">Test Failed</h3>
                  <p className="text-red-200/80">{error}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Test Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white mb-4">Connection Test</h2>
              <p className="text-gray-400 mb-8">
                Click the button below to test your {provider.name} API connection
              </p>
              
              <button
                onClick={runTest}
                disabled={isRunningTest || !hasApiKey}
                className={`px-8 py-4 rounded-lg font-medium text-lg flex items-center gap-3 mx-auto transition-all ${
                  hasApiKey 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105' 
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                } disabled:opacity-50`}
              >
                {isRunningTest ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Run Connection Test
                  </>
                )}
              </button>
              
              {!hasApiKey && (
                <p className="mt-4 text-yellow-400 text-sm flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  API key required to run tests
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Test Results */}
        {testResults && !isRunningTest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Result Summary */}
            <div className={`bg-gray-900/50 backdrop-blur-xl rounded-2xl border ${
              testResults.success ? 'border-green-500/30' : 'border-red-500/30'
            } p-6`}>
              <div className="flex items-start gap-4">
                {testResults.success ? (
                  <CheckCircle className="w-6 h-6 text-green-400 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    testResults.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {testResults.message}
                  </h3>
                  {testResults.responseTime && (
                    <p className="text-gray-400 text-sm mb-3">
                      Response time: {testResults.responseTime}ms
                    </p>
                  )}
                  
                  {/* Test Details */}
                  {testResults.details && (
                    <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-300 mb-3">Test Details</h4>
                      <div className="space-y-2 text-sm">
                        {Object.entries(testResults.details).map(([key, value]) => (
                          <div key={key} className="flex items-start gap-2">
                            <span className="text-gray-500 capitalize min-w-[120px]">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className="text-gray-300 flex-1">
                              {typeof value === 'object' ? (
                                <pre className="text-xs bg-gray-900/50 p-2 rounded">
                                  {JSON.stringify(value, null, 2)}
                                </pre>
                              ) : (
                                value?.toString()
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* API Response (for successful regular key tests) */}
            {apiResponse && testResults.success && !isAdminKey && (
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">API Response</h3>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <pre className="text-xs text-gray-300 overflow-auto max-h-96">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}