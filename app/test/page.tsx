'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Copy, Check, Terminal, Send, Loader2, AlertCircle } from 'lucide-react'

export default function OpenAITestPage() {
  const { data: session } = useSession()
  const [apiKey, setApiKey] = useState('')
  const [prompt, setPrompt] = useState('Tell me a joke about programming')
  const [model, setModel] = useState('gpt-4o-mini')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [statusCheck, setStatusCheck] = useState<any>(null)

  // Check API status on load
  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/openai/test')
      const data = await res.json()
      setStatusCheck(data)
    } catch (err) {
      console.error('Status check failed:', err)
    }
  }

  const getCurlCommand = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    
    if (!apiKey) {
      return `# First, add your OpenAI API key above, then the curl command will appear here`
    }

    return `curl -X POST ${baseUrl}/api/openai/test \\
  -H "Content-Type: application/json" \\
  -H "Cookie: ${document.cookie}" \\
  -d '{
    "prompt": "${prompt.replace(/"/g, '\\"')}",
    "model": "${model}",
    "testApiKey": "${apiKey}"
  }'`
  }

  const getDirectOpenAICurl = () => {
    if (!apiKey) return ''
    
    return `# Direct OpenAI API call:
curl https://api.openai.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "model": "${model}",
    "messages": [{"role": "user", "content": "${prompt.replace(/"/g, '\\"')}"}],
    "max_tokens": 1024,
    "temperature": 0.7
  }'`
  }

  const handleTest = async () => {
    if (!apiKey) {
      setError('Please enter your OpenAI API key')
      return
    }

    setLoading(true)
    setError('')
    setResponse('')

    try {
      const res = await fetch('/api/openai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model,
          testApiKey: apiKey
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

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="w-8 h-8 text-green-400" />
            <h1 className="text-2xl font-bold text-white">OpenAI API Test Endpoint</h1>
          </div>
          <p className="text-gray-400">Test your OpenAI API keys and see the full curl commands and responses</p>
          
          {/* Status Badge */}
          {statusCheck && (
            <div className="mt-4 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${statusCheck.isConfigured ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
              <span className="text-sm text-gray-300">
                {statusCheck.isConfigured 
                  ? statusCheck.isValid 
                    ? 'API key configured and valid' 
                    : 'API key configured but invalid'
                  : 'No API key configured in database'}
              </span>
            </div>
          )}
        </div>

        {/* Configuration */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">Configuration</h2>
          
          {/* API Key Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              OpenAI API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">Your key is only used for testing and is not stored</p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              <option value="gpt-4o">GPT-4o (Latest)</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </div>

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
            disabled={loading || !apiKey}
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

        {/* Direct OpenAI CURL */}
        {apiKey && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Direct OpenAI API CURL</h2>
              <button
                onClick={() => copyToClipboard(getDirectOpenAICurl())}
                className="px-3 py-1 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2 text-sm"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
            <pre className="bg-gray-950 p-4 rounded-lg overflow-x-auto">
              <code className="text-blue-400 text-sm font-mono">{getDirectOpenAICurl()}</code>
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

        {/* Documentation */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">API Documentation</h2>
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <h3 className="text-white font-medium mb-2">Endpoint</h3>
              <code className="bg-gray-800 px-2 py-1 rounded">GET /api/openai/test</code> - Check API key status
              <br />
              <code className="bg-gray-800 px-2 py-1 rounded">POST /api/openai/test</code> - Test API key with a prompt
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-2">Request Body</h3>
              <pre className="bg-gray-800 p-3 rounded-lg text-xs">
{`{
  "prompt": "Your prompt text",
  "model": "gpt-4o-mini",
  "testApiKey": "sk-..." // Optional, uses stored key if not provided
}`}
              </pre>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-2">Response</h3>
              <pre className="bg-gray-800 p-3 rounded-lg text-xs">
{`{
  "success": true,
  "response": {
    "content": "Generated response",
    "model": "gpt-4o-mini",
    "usage": {
      "promptTokens": 10,
      "completionTokens": 20,
      "totalTokens": 30,
      "cost": 0.00003
    }
  }
}`}
              </pre>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-2">Admin/Org Keys</h3>
              <p>Keys starting with <code className="bg-gray-800 px-2 py-1 rounded">org-</code> or containing <code className="bg-gray-800 px-2 py-1 rounded">admin</code> are detected as organization keys and return a special response.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}