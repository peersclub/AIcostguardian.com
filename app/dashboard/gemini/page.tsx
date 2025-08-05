'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Brain, Settings, Send, Key, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { GEMINI_MODELS } from '@/lib/gemini-client'

interface ApiStatus {
  isConfigured: boolean
  isValid: boolean
  error?: string
}

interface UsageStats {
  summary: {
    totalCost: number
    totalTokens: number
    totalCalls: number
    provider: string
  }
  modelBreakdown: Array<{
    model: string
    calls: number
    totalTokens: number
    totalCost: number
  }>
  recentUsage: Array<{
    model: string
    totalTokens: number
    cost: number
    timestamp: string
  }>
}

interface TestResponse {
  success: boolean
  response?: {
    content: string
    model: string
    usage: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
      cost: number
    }
  }
  error?: string
  details?: string
}

export default function GeminiDashboard() {
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiStatus, setApiStatus] = useState<ApiStatus>({ isConfigured: false, isValid: false })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [message, setMessage] = useState('')
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  
  // Test interface
  const [testPrompt, setTestPrompt] = useState("Hi, this is a test to validate my API key. Please respond with 'API key is working!'")
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash')
  const [testResponse, setTestResponse] = useState<TestResponse | null>(null)

  // Check API status on component mount
  useEffect(() => {
    checkApiStatus()
    loadUsageStats()
  }, [])

  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/gemini/test')
      const status = await response.json()
      setApiStatus(status)
    } catch (error) {
      console.error('Failed to check API status:', error)
    }
  }

  const loadUsageStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/gemini/usage')
      if (response.ok) {
        const stats = await response.json()
        setUsageStats(stats)
      }
    } catch (error) {
      console.error('Failed to load usage stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      setMessage('Please enter an API key')
      return
    }

    setIsSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/settings/gemini-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage('API key saved successfully!')
        setApiKey('')
        // Recheck status after saving
        setTimeout(() => {
          checkApiStatus()
          setMessage('')
        }, 1000)
      } else {
        setMessage(result.error || 'Failed to save API key')
      }
    } catch (error) {
      setMessage('Failed to save API key')
      console.error('Save API key error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const testApiKey = async () => {
    if (!testPrompt.trim()) {
      setMessage('Please enter a test prompt')
      return
    }

    setIsTesting(true)
    setTestResponse(null)
    setMessage('')

    try {
      const response = await fetch('/api/gemini/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: testPrompt,
          model: selectedModel,
          testApiKey: apiKey || undefined
        }),
      })

      const result = await response.json()
      setTestResponse(result)

      if (result.success) {
        // Reload usage stats after successful test
        loadUsageStats()
        // Recheck API status
        checkApiStatus()
      }
    } catch (error) {
      setTestResponse({
        success: false,
        error: 'Network error occurred'
      })
      console.error('Test API error:', error)
    } finally {
      setIsTesting(false)
    }
  }

  const getStatusBadge = () => {
    if (!apiStatus.isConfigured) {
      return <Badge variant="secondary">Not Configured</Badge>
    }
    if (apiStatus.isValid) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>
    }
    return <Badge variant="destructive">Disconnected</Badge>
  }

  const getStatusIcon = () => {
    if (!apiStatus.isConfigured) {
      return <Settings className="h-4 w-4 text-gray-500" />
    }
    if (apiStatus.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Google Gemini Dashboard</h1>
                <p className="text-gray-600">Track your Gemini API usage and costs</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">← Back to Overview</Button>
            </Link>
          </div>
        </div>

        {/* API Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                {getStatusIcon()}
                <span>Gemini API Status</span>
              </CardTitle>
              {getStatusBadge()}
            </div>
            <CardDescription>
              {apiStatus.isValid 
                ? 'Your Gemini API key is configured and working properly'
                : 'Configure your Gemini API key to start tracking usage'
              }
            </CardDescription>
          </CardHeader>
          {apiStatus.error && (
            <CardContent>
              <Alert>
                <AlertDescription className="text-red-600">
                  {apiStatus.error}
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>API Configuration</span>
                </CardTitle>
                <CardDescription>
                  Manage your Gemini API key
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Gemini API Key</Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIza..."
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>
                      Get your API key from{' '}
                      <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Google AI Studio
                      </a>
                    </p>
                    <p className="text-xs">
                      • API key should start with "AIza"<br />
                      • Make sure the Generative Language API is enabled<br />
                      • Verify your API key has necessary permissions
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={saveApiKey} 
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save API Key'
                  )}
                </Button>

                {message && (
                  <Alert>
                    <AlertDescription className={message.includes('success') ? 'text-green-600' : 'text-red-600'}>
                      {message}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Usage Summary */}
            {usageStats && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Usage Summary</CardTitle>
                  <CardDescription>Your Gemini API usage overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Cost</span>
                      <span className="text-lg font-bold">${usageStats.summary.totalCost.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Tokens</span>
                      <span className="font-semibold">{usageStats.summary.totalTokens.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Calls</span>
                      <span className="font-semibold">{usageStats.summary.totalCalls}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Test Interface & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Test Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-4 w-4" />
                  <span>Test Gemini API</span>
                </CardTitle>
                <CardDescription>
                  Test your API key and see the responses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GEMINI_MODELS.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div>
                              <div className="font-medium">{model.name}</div>
                              <div className="text-sm text-gray-500">{model.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt">Test Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    placeholder="Enter your test prompt..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={testApiKey} 
                  disabled={isTesting}
                  className="w-full md:w-auto"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Test API
                    </>
                  )}
                </Button>

                {testResponse && (
                  <div className="mt-4">
                    {testResponse.success ? (
                      <div className="space-y-3">
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription className="text-green-600">
                            API test successful!
                          </AlertDescription>
                        </Alert>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Response:</h4>
                          <p className="text-sm mb-3">{testResponse.response?.content}</p>
                          
                          {testResponse.response?.usage && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                              <div>
                                <span className="font-medium">Input Tokens:</span>
                                <br />
                                {testResponse.response.usage.promptTokens}
                              </div>
                              <div>
                                <span className="font-medium">Output Tokens:</span>
                                <br />
                                {testResponse.response.usage.completionTokens}
                              </div>
                              <div>
                                <span className="font-medium">Total Tokens:</span>
                                <br />
                                {testResponse.response.usage.totalTokens}
                              </div>
                              <div>
                                <span className="font-medium">Cost:</span>
                                <br />
                                ${testResponse.response.usage.cost.toFixed(6)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <Alert>
                        <XCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-600">
                          <strong>Error:</strong> {testResponse.error}
                          {testResponse.details && (
                            <><br /><strong>Details:</strong> {testResponse.details}</>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Model Breakdown */}
            {usageStats && usageStats.modelBreakdown.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Model Usage Breakdown</CardTitle>
                  <CardDescription>Usage statistics by Gemini model</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {usageStats.modelBreakdown.map((model, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{model.model}</div>
                          <div className="text-sm text-gray-500">
                            {model.calls} calls • {model.totalTokens.toLocaleString()} tokens
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${model.totalCost.toFixed(4)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Usage */}
            {usageStats && usageStats.recentUsage.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent API Calls</CardTitle>
                  <CardDescription>Your latest Gemini API usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {usageStats.recentUsage.slice(0, 5).map((usage, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <div>
                          <div className="font-medium text-sm">{usage.model}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(usage.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm">${usage.cost.toFixed(6)}</div>
                          <div className="text-xs text-gray-500">{usage.totalTokens} tokens</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}