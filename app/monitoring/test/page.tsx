'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function MonitoringTestPage() {
  const { data: session } = useSession()
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])
    
    const tests = [
      {
        name: 'API Routes Test',
        endpoint: '/api/monitoring/usage',
        method: 'GET'
      },
      {
        name: 'Insights API Test',
        endpoint: '/api/monitoring/insights',
        method: 'GET'
      },
      {
        name: 'Alerts API Test', 
        endpoint: '/api/monitoring/alerts',
        method: 'GET'
      },
      {
        name: 'Export API Test',
        endpoint: '/api/monitoring/export?format=json',
        method: 'GET'
      },
      {
        name: 'WebSocket Connection Test',
        endpoint: '/api/monitoring/websocket',
        method: 'GET'
      },
      {
        name: 'Notifications API Test',
        endpoint: '/api/notifications',
        method: 'GET'
      }
    ]

    for (const test of tests) {
      try {
        const startTime = performance.now()
        const response = await fetch(test.endpoint, {
          method: test.method,
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        const endTime = performance.now()
        const responseTime = Math.round(endTime - startTime)
        
        let data = null
        try {
          data = await response.json()
        } catch (e) {
          // Response might not be JSON
        }

        setTestResults(prev => [...prev, {
          ...test,
          status: response.ok ? 'success' : 'error',
          statusCode: response.status,
          responseTime,
          data: data,
          error: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`
        }])
        
      } catch (error: any) {
        setTestResults(prev => [...prev, {
          ...test,
          status: 'error',
          statusCode: 0,
          responseTime: 0,
          data: null,
          error: error.message
        }])
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    setIsRunning(false)
  }

  const createTestUsage = async () => {
    try {
      const testUsageData = {
        provider: 'OPENAI',
        model: 'gpt-4o-mini',
        inputTokens: 150,
        outputTokens: 75,
        totalTokens: 225,
        cost: 0.05,
        requestId: `test_${Date.now()}`,
        timestamp: new Date().toISOString(),
        metadata: {
          testData: true,
          temperature: 0.7,
          maxTokens: 1024
        }
      }

      const response = await fetch('/api/monitoring/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUsageData)
      })

      if (response.ok) {
        alert('Test usage data created successfully!')
      } else {
        const error = await response.json()
        alert(`Error creating test data: ${error.error}`)
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  const createTestAlert = async () => {
    try {
      const testAlertData = {
        type: 'cost_alert',
        provider: 'OPENAI',
        threshold: 10.0,
        message: 'Test cost alert - OpenAI spending exceeded $10'
      }

      const response = await fetch('/api/monitoring/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testAlertData)
      })

      if (response.ok) {
        alert('Test alert created successfully!')
      } else {
        const error = await response.json()
        alert(`Error creating test alert: ${error.error}`)
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  const createTestNotification = async () => {
    try {
      const testNotificationData = {
        action: 'create',
        type: 'system_notification',
        title: 'Test Notification',
        message: 'This is a test notification to verify the notification system',
        severity: 'info',
        provider: 'system'
      }

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testNotificationData)
      })

      if (response.ok) {
        alert('Test notification created successfully!')
      } else {
        const error = await response.json()
        alert(`Error creating test notification: ${error.error}`)
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in to run monitoring tests.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Monitoring Dashboard Test Suite
        </h1>
        <p className="text-gray-600">
          Test all monitoring functionality and API endpoints
        </p>
      </div>

      {/* Test Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>API Endpoint Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? 'Running Tests...' : 'Run All API Tests'}
            </Button>
            
            <div className="text-sm text-gray-600">
              Tests all monitoring API endpoints for connectivity and basic functionality.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Data Creation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={createTestUsage}
              variant="outline" 
              className="w-full"
            >
              Create Test Usage Data
            </Button>
            
            <Button 
              onClick={createTestAlert}
              variant="outline" 
              className="w-full"
            >
              Create Test Alert
            </Button>
            
            <Button 
              onClick={createTestNotification}
              variant="outline" 
              className="w-full"
            >
              Create Test Notification
            </Button>
            
            <div className="text-sm text-gray-600">
              Create sample data to test dashboard functionality.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{result.name}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={result.status === 'success' ? 'default' : 'destructive'}
                      >
                        {result.status}
                      </Badge>
                      {result.responseTime > 0 && (
                        <span className="text-sm text-gray-600">
                          {result.responseTime}ms
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">Endpoint:</span> {result.endpoint}
                      </div>
                      <div>
                        <span className="text-gray-600">Method:</span> {result.method}
                      </div>
                      <div>
                        <span className="text-gray-600">Status Code:</span> {result.statusCode}
                      </div>
                      <div>
                        <span className="text-gray-600">Response Time:</span> {result.responseTime}ms
                      </div>
                    </div>
                    
                    {result.error && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                    
                    {result.data && result.status === 'success' && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-blue-600">
                          View Response Data
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 border rounded text-xs overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-medium text-blue-800 mb-2">Test Summary</h4>
              <div className="text-sm text-blue-700">
                <div>Total Tests: {testResults.length}</div>
                <div>Passed: {testResults.filter(r => r.status === 'success').length}</div>
                <div>Failed: {testResults.filter(r => r.status === 'error').length}</div>
                <div>
                  Average Response Time: {
                    testResults.length > 0 
                      ? Math.round(testResults.reduce((sum, r) => sum + r.responseTime, 0) / testResults.length)
                      : 0
                  }ms
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Quick Links */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/monitoring/dashboard'}
              >
                Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/analytics/usage'}
              >
                Usage Analytics  
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/settings'}
              >
                Settings
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/dashboard'}
              >
                Main Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}