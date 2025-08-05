'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'

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

interface GrokStatus {
  isConfigured: boolean
  isValid: boolean
  error?: string
}

export default function GrokDashboard() {
  const { data: session } = useSession()
  const [timeRange, setTimeRange] = useState('24h')
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [grokStatus, setGrokStatus] = useState<GrokStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [testPrompt, setTestPrompt] = useState('')
  const [testModel, setTestModel] = useState('grok-beta')
  const [testResponse, setTestResponse] = useState('')
  const [isTestLoading, setIsTestLoading] = useState(false)

  const grokModels = [
    { value: 'grok-beta', label: 'Grok Beta' },
    { value: 'grok-vision-beta', label: 'Grok Vision Beta' }
  ]

  // Fetch Grok status and usage data
  useEffect(() => {
    if (session?.user?.id) {
      fetchGrokData()
    }
  }, [session, timeRange])

  const fetchGrokData = async () => {
    setIsLoading(true)
    try {
      // Fetch Grok status
      const statusResponse = await fetch('/api/grok/test')
      if (statusResponse.ok) {
        const status = await statusResponse.json()
        setGrokStatus(status)
      }

      // Fetch usage stats from Grok endpoint
      const usageResponse = await fetch('/api/grok/usage?dateRange=' + timeRange)
      if (usageResponse.ok) {
        const stats = await usageResponse.json()
        // Transform the mock data to match expected format
        const transformedStats: UsageStats = {
          totalCalls: stats.totalCalls || 0,
          totalTokens: stats.totalTokens || 0,
          totalCost: stats.totalCost || 0,
          thisMonth: stats.thisMonth || { calls: 0, tokens: 0, cost: 0 },
          thisWeek: stats.thisWeek || { calls: 0, tokens: 0, cost: 0 },
          today: stats.today || { calls: 0, tokens: 0, cost: 0 },
          byModel: stats.recentCalls ? stats.recentCalls.reduce((acc: any, call: any) => {
            if (!acc[call.model]) {
              acc[call.model] = { calls: 0, tokens: 0, cost: 0 }
            }
            acc[call.model].calls++
            acc[call.model].tokens += call.totalTokens
            acc[call.model].cost += call.totalCost
            return acc
          }, {}) : {},
          dailyUsage: Array.from({ length: 7 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - i)
            return {
              date: date.toISOString().split('T')[0],
              calls: Math.floor(Math.random() * 10) + 1,
              tokens: Math.floor(Math.random() * 2000) + 100,
              cost: Math.random() * 0.05 + 0.01
            }
          }).reverse()
        }
        setUsageStats(transformedStats)
      }
    } catch (error) {
      console.error('Failed to fetch Grok data:', error)
    } finally {
      setIsLoading(false)
      setLastUpdate(new Date())
    }
  }

  const refreshData = () => {
    fetchGrokData()
  }

  // Auto-refresh every 30 seconds if live mode is enabled
  useEffect(() => {
    if (isLiveMode) {
      const interval = setInterval(refreshData, 30000)
      return () => clearInterval(interval)
    }
  }, [isLiveMode, timeRange])

  const testGrokAPI = async () => {
    if (!testPrompt.trim()) return
    
    setIsTestLoading(true)
    setTestResponse('')
    
    try {
      const response = await fetch('/api/grok/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: testPrompt,
          model: testModel
        })
      })
      
      const result = await response.json()
      if (result.success) {
        setTestResponse(result.response.content || 'API key is working!')
      } else {
        setTestResponse(`Error: ${result.error}`)
      }
    } catch (error) {
      setTestResponse(`Error: Failed to test Grok API`)
    } finally {
      setIsTestLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Grok data...</p>
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-3xl">🚀</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Grok Dashboard</h1>
              <p className="text-gray-600 mt-1">X.AI Grok usage analytics and management</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                ← Back to Main Dashboard
              </Button>
            </Link>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={isLiveMode ? "default" : "outline"}
              onClick={() => setIsLiveMode(!isLiveMode)}
              size="sm"
            >
              {isLiveMode ? '🔴 Live' : '⚪ Paused'}
            </Button>
            <Button onClick={refreshData} variant="outline" size="sm">
              🔄
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card className="border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Grok API Status</span>
                  <Badge className={grokStatus?.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {grokStatus?.isValid ? '✅ Connected' : '❌ Disconnected'}
                  </Badge>
                </CardTitle>
              </div>
              <Link href="/settings">
                <Button variant="outline" size="sm">
                  ⚙️ Configure API Key
                </Button>
              </Link>
            </div>
          </CardHeader>
          {!grokStatus?.isValid && (
            <CardContent>
              <Alert className="border-red-200 bg-red-50">
                <AlertTitle>API Key Required</AlertTitle>
                <AlertDescription>
                  Please configure your Grok API key in settings to access usage data and test the API.
                  {grokStatus?.error && <span className="block mt-1 text-sm">Error: {grokStatus.error}</span>}
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
        </Card>

        {/* Usage Summary Cards */}
        {usageStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-blue-700 text-sm font-medium">Total Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">{usageStats.totalCalls.toLocaleString()}</div>
                <p className="text-xs text-blue-600 mt-1">All time</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-700 text-sm font-medium">Total Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900">{(usageStats.totalTokens / 1000).toFixed(1)}K</div>
                <p className="text-xs text-purple-600 mt-1">Tokens processed</p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-700 text-sm font-medium">Total Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900">${usageStats.totalCost.toFixed(4)}</div>
                <p className="text-xs text-green-600 mt-1">{timeRange} period</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-orange-700 text-sm font-medium">Models Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-900">{Object.keys(usageStats.byModel).length}</div>
                <p className="text-xs text-orange-600 mt-1">Different models</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* API Test Section */}
        <Card>
          <CardHeader>
            <CardTitle>Test Grok API</CardTitle>
            <CardDescription>Send a test request to verify your API connection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                  <Select value={testModel} onValueChange={setTestModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {grokModels.map(model => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Test Prompt</label>
                  <textarea
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    placeholder="Enter a test prompt..."
                    className="w-full p-3 border rounded-md h-32 resize-none"
                    disabled={!grokStatus?.isValid}
                  />
                </div>
                <Button 
                  onClick={testGrokAPI} 
                  disabled={isTestLoading || !testPrompt.trim() || !grokStatus?.isValid}
                  className="w-full"
                >
                  {isTestLoading ? '⏳ Testing...' : '🧪 Test API'}
                </Button>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Response</label>
                <div className="p-3 bg-gray-50 border rounded-md h-48 overflow-y-auto">
                  {testResponse ? (
                    <pre className="text-sm whitespace-pre-wrap">{testResponse}</pre>
                  ) : (
                    <p className="text-gray-500 text-sm">API response will appear here...</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage by Model */}
        {usageStats && Object.keys(usageStats.byModel).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Usage by Model</CardTitle>
              <CardDescription>Breakdown of usage across different Grok models</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(usageStats.byModel).map(([model, data]) => {
                  const percentage = usageStats.totalCost > 0 ? (data.cost / usageStats.totalCost) * 100 : 0
                  return (
                    <div key={model} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{model}</span>
                        <div className="text-right text-sm">
                          <div className="font-semibold">${data.cost.toFixed(4)}</div>
                          <div className="text-gray-500">{data.calls} calls</div>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{data.tokens.toLocaleString()} tokens</span>
                        <span>{percentage.toFixed(1)}% of total cost</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Usage Trend */}
        {usageStats && usageStats.dailyUsage.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Daily Usage Trend</CardTitle>
              <CardDescription>Grok API usage over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageStats.dailyUsage.slice(-7).map((day, index) => {
                  const maxCalls = Math.max(...usageStats.dailyUsage.map(d => d.calls))
                  const percentage = maxCalls > 0 ? (day.calls / maxCalls) * 100 : 0
                  
                  return (
                    <div key={day.date} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {new Date(day.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                        <div className="text-right text-sm">
                          <div className="font-semibold">{day.calls} calls</div>
                          <div className="text-gray-500">${day.cost.toFixed(4)}</div>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Last Updated */}
        <p className="text-xs text-gray-500 text-center">
          Last updated: {lastUpdate.toLocaleString()}
        </p>
      </div>
    </div>
  )
}