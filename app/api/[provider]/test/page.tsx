'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useSearchParams } from 'next/navigation'
import { Copy, Check, Terminal, Send, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Provider configurations
const PROVIDER_CONFIG = {
  openai: {
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o (Latest)' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    ],
    defaultModel: 'gpt-4o-mini',
    keyPrefix: 'sk-',
    curlUrl: 'https://api.openai.com/v1/chat/completions',
    headers: (key: string) => ({
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    })
  },
  claude: {
    name: 'Claude (Anthropic)',
    models: [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
    ],
    defaultModel: 'claude-3-5-haiku-20241022',
    keyPrefix: 'sk-ant-',
    curlUrl: 'https://api.anthropic.com/v1/messages',
    headers: (key: string) => ({
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    })
  },
  'claude-admin': {
    name: 'Claude Admin',
    models: [],
    defaultModel: '',
    keyPrefix: 'sk-ant-admin',
    curlUrl: '',
    headers: (key: string) => ({})
  },
  gemini: {
    name: 'Google Gemini',
    models: [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
      { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B' },
      { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro' },
    ],
    defaultModel: 'gemini-1.5-flash',
    keyPrefix: 'AIza',
    curlUrl: (model: string, key: string) => 
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    headers: () => ({
      'Content-Type': 'application/json'
    })
  },
  grok: {
    name: 'Grok (X.AI)',
    models: [
      { id: 'grok-1', name: 'Grok 1' },
      { id: 'grok-2', name: 'Grok 2' },
    ],
    defaultModel: 'grok-1',
    keyPrefix: 'xai-',
    curlUrl: 'https://api.x.ai/v1/chat/completions',
    headers: (key: string) => ({
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    })
  }
}

export default function ProviderTestPage() {
  const { data: session } = useSession()
  const params = useParams()
  const searchParams = useSearchParams()
  const provider = params.provider as string
  
  // Get prefilled key from URL params (passed from settings page)
  const prefilledKey = searchParams.get('key') || ''
  const keyId = searchParams.get('id') || ''
  
  const [apiKey, setApiKey] = useState(prefilledKey)
  const [prompt, setPrompt] = useState('Tell me a joke about programming')
  const [model, setModel] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [statusCheck, setStatusCheck] = useState<any>(null)

  const config = PROVIDER_CONFIG[provider as keyof typeof PROVIDER_CONFIG]

  useEffect(() => {
    if (config) {
      setModel(config.defaultModel)
    }
    checkStatus()
  }, [provider])

  useEffect(() => {
    // If a key was prefilled from settings, fetch and decrypt it
    if (keyId && session) {
      fetchStoredKey()
    }
  }, [keyId, session])

  const fetchStoredKey = async () => {
    try {
      const res = await fetch('/api/api-keys')
      const data = await res.json()
      const keyData = data.keys?.find((k: any) => k.id === keyId)
      
      if (keyData) {
        // Key is already masked, show a note
        setError('Note: Using stored API key from settings (masked for security)')
      }
    } catch (err) {
      console.error('Failed to fetch stored key:', err)
    }
  }

  const checkStatus = async () => {
    try {
      const endpoint = provider === 'claude-admin' 
        ? '/api/claude-admin/test'
        : provider === 'claude' 
        ? '/api/claude/test'
        : provider === 'gemini'
        ? '/api/gemini/test'
        : provider === 'grok'
        ? '/api/grok/test'
        : '/api/openai/test'
        
      const res = await fetch(endpoint)
      const data = await res.json()
      setStatusCheck(data)
    } catch (err) {
      console.error('Status check failed:', err)
    }
  }

  const getCurlCommand = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    
    if (!apiKey && !keyId) {
      return `# First, add your ${config?.name || provider} API key above, then the curl command will appear here`
    }

    const endpoint = provider === 'claude-admin' 
      ? '/api/claude-admin/test'
      : provider === 'claude' 
      ? '/api/claude/test'
      : provider === 'gemini'
      ? '/api/gemini/test'
      : provider === 'grok'
      ? '/api/grok/test'
      : '/api/openai/test'

    return `curl -X POST ${baseUrl}${endpoint} \\
  -H "Content-Type: application/json" \\
  -H "Cookie: ${document.cookie}" \\
  -d '{
    "prompt": "${prompt.replace(/"/g, '\\"')}",
    "model": "${model}",
    ${keyId ? `"useStoredKey": true` : `"testApiKey": "${apiKey}"`}
  }'`
  }

  const getDirectAPICurl = () => {
    if (!apiKey || !config) return ''
    
    // Special handling for Claude Admin
    if (provider === 'claude-admin') {
      return `# Claude Admin keys are for organization management, not for chat completions.
# Use the Claude Admin API for managing:
# - Organization settings
# - User management
# - API key management
# - Billing and usage data`
    }
    
    // Different curl formats for different providers
    if (provider === 'openai' || provider === 'grok') {
      return `# Direct ${config.name} API call:
curl ${config.curlUrl} \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${model}",
    "messages": [{"role": "user", "content": "${prompt.replace(/"/g, '\\"')}"}],
    "max_tokens": 1024,
    "temperature": 0.7
  }'`
    } else if (provider === 'claude') {
      return `# Direct Claude API call:
curl ${config.curlUrl} \\
  -H "x-api-key: ${apiKey}" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "content-type: application/json" \\
  -d '{
    "model": "${model}",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "${prompt.replace(/"/g, '\\"')}"}]
  }'`
    } else if (provider === 'gemini') {
      const url = typeof config.curlUrl === 'function' 
        ? config.curlUrl(model, apiKey)
        : config.curlUrl
      return `# Direct Gemini API call:
curl "${url}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "contents": [{
      "parts": [{
        "text": "${prompt.replace(/"/g, '\\"')}"
      }]
    }],
    "generationConfig": {
      "temperature": 0.7,
      "maxOutputTokens": 1024
    }
  }'`
    }
    
    return ''
  }

  const handleTest = async () => {
    if (!apiKey && !keyId) {
      setError(`Please enter your ${config?.name || provider} API key`)
      return
    }

    setLoading(true)
    setError('')
    setResponse('')

    try {
      const endpoint = provider === 'claude-admin' 
        ? '/api/claude-admin/test'
        : provider === 'claude' 
        ? '/api/claude/test'
        : provider === 'gemini'
        ? '/api/gemini/test'
        : provider === 'grok'
        ? '/api/grok/test'
        : '/api/openai/test'

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model: model || undefined,
          testApiKey: keyId ? undefined : apiKey,
          useStoredKey: !!keyId,
          detailed: true
        })
      })

      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
      
      if (!res.ok) {
        setError(data.error || 'Request failed')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to test API')
      setResponse(JSON.stringify({ error: err.message }, null, 2))
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-900/20 rounded-xl p-6 border border-red-500/50">
            <h1 className="text-xl font-bold text-red-400">Provider not found: {provider}</h1>
            <Link href="/settings" className="text-blue-400 hover:underline mt-2 inline-block">
              Return to Settings
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <Link href="/settings" className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="w-8 h-8 text-green-400" />
            <h1 className="text-2xl font-bold text-white">{config.name} API Test Endpoint</h1>
          </div>
          <p className="text-gray-400">Test your {config.name} API keys and see the full curl commands and responses</p>
          
          {/* Status Badge */}
          {statusCheck && (
            <div className="mt-4 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${statusCheck.isConfigured ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
              <span className="text-sm text-gray-300">
                {statusCheck.isConfigured 
                  ? statusCheck.isValid 
                    ? 'API key configured and valid' 
                    : statusCheck.error || 'API key configured but invalid'
                  : 'No API key configured in database'}
              </span>
            </div>
          )}
          
          {keyId && (
            <div className="mt-2 p-2 bg-blue-900/20 border border-blue-500/30 rounded text-blue-300 text-sm">
              Using stored API key from settings (ID: {keyId})
            </div>
          )}
        </div>

        {/* Configuration */}
        {provider !== 'claude-admin' && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Configuration</h2>
            
            {/* API Key Input */}
            {!keyId && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {config.name} API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`${config.keyPrefix}...`}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">Your key is only used for testing and is not stored</p>
              </div>
            )}

            {/* Model Selection */}
            {config.models.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                >
                  {config.models.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Prompt Input */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                placeholder="Enter your prompt..."
              />
            </div>

            {/* Test Button */}
            <button
              onClick={handleTest}
              disabled={loading || (!apiKey && !keyId)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Test API
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}
          </div>
        )}

        {/* CURL Command */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">CURL Command</h2>
            <button
              onClick={() => copyToClipboard(getCurlCommand())}
              className="px-3 py-1 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2 text-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className="bg-gray-950 p-4 rounded-lg overflow-x-auto">
            <code className="text-green-400 text-sm font-mono">{getCurlCommand()}</code>
          </pre>
        </div>

        {/* Direct API CURL */}
        {apiKey && getDirectAPICurl() && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Direct {config.name} API CURL</h2>
              <button
                onClick={() => copyToClipboard(getDirectAPICurl())}
                className="px-3 py-1 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2 text-sm"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
            <pre className="bg-gray-950 p-4 rounded-lg overflow-x-auto">
              <code className="text-blue-400 text-sm font-mono">{getDirectAPICurl()}</code>
            </pre>
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Response</h2>
              <button
                onClick={() => copyToClipboard(response)}
                className="px-3 py-1 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2 text-sm"
              >
                <Copy className="w-4 h-4" />
                Copy Response
              </button>
            </div>
            <pre className="bg-gray-950 p-4 rounded-lg overflow-x-auto">
              <code className="text-yellow-400 text-sm font-mono">{response}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}