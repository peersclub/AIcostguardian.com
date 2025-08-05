'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface UsageStats {
  totalCalls: number
  totalTokens: number
  totalCost: number
  thisMonth: { calls: number; tokens: number; cost: number }
  thisWeek: { calls: number; tokens: number; cost: number }
  today: { calls: number; tokens: number; cost: number }
  byModel: Record<string, { calls: number; tokens: number; cost: number }>
  dailyUsage: Array<{ date: string; calls: number; tokens: number; cost: number }>
}

interface OpenAIStatus {
  isConfigured: boolean
  isValid: boolean
  error?: string
}

export default function OpenAIDashboard() {
  const { data: session } = useSession()
  const [timeRange, setTimeRange] = useState('24h')
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [openaiStatus, setOpenAIStatus] = useState<OpenAIStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [testPrompt, setTestPrompt] = useState('')
  const [testModel, setTestModel] = useState('gpt-4o-mini')
  const [testResponse, setTestResponse] = useState('')
  const [isTestLoading, setIsTestLoading] = useState(false)

  const openaiModels = [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ]

  // Fetch OpenAI status and usage data
  useEffect(() => {
    if (session?.user?.id) {
      fetchOpenAIStatus()
      fetchUsageStats()
    }
  }, [session])

  const fetchOpenAIStatus = async () => {
    try {
      const response = await fetch('/api/openai/test')
      const status = await response.json()
      setOpenAIStatus(status)
    } catch (error) {
      console.error('Failed to fetch OpenAI status:', error)
      setOpenAIStatus({
        isConfigured: false,
        isValid: false,
        error: 'Failed to check status'
      })
    }
  }

  const fetchUsageStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/openai/usage?type=stats')
      if (response.ok) {
        const stats = await response.json()
        setUsageStats(stats)
      }
    } catch (error) {
      console.error('Failed to fetch usage stats:', error)
    } finally {
      setIsLoading(false)
      setLastUpdate(new Date())
    }
  }

  const handleTestOpenAIAPI = async () => {
    if (!testPrompt.trim()) return

    try {
      setIsTestLoading(true)
      const response = await fetch('/api/openai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: testPrompt,
          model: testModel
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setTestResponse(result.response.content)
        // Refresh usage stats after successful test
        await fetchUsageStats()
      } else {
        setTestResponse(`Error: ${result.error}`)
      }
    } catch (error) {
      setTestResponse('Failed to call OpenAI API')
    } finally {
      setIsTestLoading(false)
    }
  }

  const refreshData = () => {
    fetchUsageStats()
    fetchOpenAIStatus()
  }

  // Auto-refresh every 30 seconds if live mode is enabled
  useEffect(() => {
    if (isLiveMode) {
      const interval = setInterval(refreshData, 30000)
      return () => clearInterval(interval)
    }
  }, [isLiveMode])

  const getUsageProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading OpenAI usage data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">OpenAI Usage Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Track your OpenAI API usage and costs in real-time
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant={isLiveMode ? "default" : "outline"}
              onClick={() => setIsLiveMode(!isLiveMode)}
              className="text-sm"
            >
              {isLiveMode ? '🔴 Live' : '⚪ Paused'}
            </Button>
            <Button onClick={refreshData} variant="outline" size="sm">
              🔄 Refresh
            </Button>
            <p className="text-xs text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* OpenAI API Status */}
        {openaiStatus && (
          <Alert className={openaiStatus.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${openaiStatus.isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <AlertTitle>
                OpenAI API Status: {openaiStatus.isValid ? 'Connected' : 'Disconnected'}
              </AlertTitle>
            </div>
            <AlertDescription>
              {openaiStatus.isValid 
                ? 'OpenAI API is properly configured and accessible'
                : openaiStatus.error || 'OpenAI API is not accessible'
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Usage Overview Cards */}
        {usageStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-700 text-sm font-medium">Total API Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{usageStats.totalCalls.toLocaleString()}</div>
                <p className="text-xs text-green-600 mt-1">All time</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-emerald-700 text-sm font-medium">Total Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-900">{usageStats.totalTokens.toLocaleString()}</div>
                <p className="text-xs text-emerald-600 mt-1">Input + Output</p>
              </CardContent>
            </Card>

            <Card className="border-teal-200 bg-teal-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-teal-700 text-sm font-medium">Total Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-900">${usageStats.totalCost.toFixed(2)}</div>
                <p className="text-xs text-teal-600 mt-1">All time spend</p>
              </CardContent>
            </Card>

            <Card className="border-cyan-200 bg-cyan-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-cyan-700 text-sm font-medium">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-900">${usageStats.thisMonth.cost.toFixed(2)}</div>
                <p className="text-xs text-cyan-600 mt-1">{usageStats.thisMonth.calls} calls</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Usage by Time Period */}
        {usageStats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today</CardTitle>
                <CardDescription>Current day usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">API Calls</span>
                  <span className="font-semibold">{usageStats.today.calls}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tokens</span>
                  <span className="font-semibold">{usageStats.today.tokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cost</span>
                  <span className="font-semibold text-green-600">${usageStats.today.cost.toFixed(4)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Week</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">API Calls</span>
                  <span className="font-semibold">{usageStats.thisWeek.calls}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tokens</span>
                  <span className="font-semibold">{usageStats.thisWeek.tokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cost</span>
                  <span className="font-semibold text-green-600">${usageStats.thisWeek.cost.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Month</CardTitle>
                <CardDescription>Current month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">API Calls</span>
                  <span className="font-semibold">{usageStats.thisMonth.calls}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tokens</span>
                  <span className="font-semibold">{usageStats.thisMonth.tokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cost</span>
                  <span className="font-semibold text-green-600">${usageStats.thisMonth.cost.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Usage by Model */}
        {usageStats && Object.keys(usageStats.byModel).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Usage by OpenAI Model</CardTitle>
              <CardDescription>Breakdown by different OpenAI models</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(usageStats.byModel).map(([model, data]) => (
                  <div key={model} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {model}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {data.calls} calls • {data.tokens.toLocaleString()} tokens
                        </span>
                      </div>
                      <span className="font-semibold text-green-600">
                        ${data.cost.toFixed(4)}
                      </span>
                    </div>
                    <Progress 
                      value={(data.cost / usageStats.totalCost) * 100} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* OpenAI API Test Interface */}
        {openaiStatus?.isValid && (
          <Card>
            <CardHeader>
              <CardTitle>Test OpenAI API</CardTitle>
              <CardDescription>
                Send a test prompt to OpenAI and see real usage data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Model</label>
                <Select value={testModel} onValueChange={setTestModel}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {openaiModels.map(model => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Test Prompt</label>
                <textarea
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="Enter a prompt to test OpenAI API..."
                  className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleTestOpenAIAPI}
                disabled={!testPrompt.trim() || isTestLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isTestLoading ? 'Calling OpenAI API...' : 'Test OpenAI API'}
              </Button>
              {testResponse && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700">Response</label>
                  <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">{testResponse}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}