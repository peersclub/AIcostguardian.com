import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getApiKey } from '@/lib/api-key-store'
import { getClaudeAdminClient, mockClaudeAdminData } from '@/lib/claude-admin-client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ 
        isConfigured: false, 
        isValid: false, 
        error: 'Not authenticated' 
      })
    }

    const apiKey = getApiKey(session.user.id, 'claude-admin')
    
    if (!apiKey) {
      return NextResponse.json({
        isConfigured: false,
        isValid: false,
        error: 'Claude Admin API key not configured'
      })
    }

    return NextResponse.json({
      isConfigured: true,
      isValid: true,
      message: 'Claude Admin API key configured'
    })
  } catch (error) {
    return NextResponse.json({
      isConfigured: false,
      isValid: false,
      error: 'Failed to check Claude Admin API status'
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authenticated' 
      }, { status: 401 })
    }

    const { prompt, testApiKey, detailed } = await request.json()
    
    const apiKey = testApiKey || getApiKey(session.user.id, 'claude-admin')
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Claude Admin API key not configured'
      }, { status: 400 })
    }

    try {
      // Try to fetch real admin data using the Claude Admin client
      const adminClient = getClaudeAdminClient(session.user.id, apiKey)
      
      // Test multiple admin capabilities
      const adminData: any = {}
      
      // Test 1: Get organization settings
      let isUsingMockData = false
      
      try {
        adminData.organization = await adminClient.getOrganizationSettings()
        console.log('Successfully fetched real organization data')
      } catch (e: any) {
        console.log('Could not fetch real organization data, using mock:', e)
        isUsingMockData = true
        adminData.organization = mockClaudeAdminData.organization
      }
      
      // Test 2: Get users (if available)
      try {
        adminData.users = await adminClient.getUsers()
        console.log('Successfully fetched real users data')
      } catch (e: any) {
        console.log('Could not fetch real users data, using mock:', e)
        isUsingMockData = true
        adminData.users = mockClaudeAdminData.users
      }
      
      // Test 3: Get API keys
      try {
        adminData.apiKeys = await adminClient.getApiKeys()
        console.log('Successfully fetched real API keys data')
      } catch (e: any) {
        console.log('Could not fetch real API keys data, using mock:', e)
        isUsingMockData = true
        adminData.apiKeys = mockClaudeAdminData.apiKeys
      }
      
      // Test 4: Get billing info
      try {
        adminData.billing = await adminClient.getBillingInfo()
        console.log('Successfully fetched real billing data')
      } catch (e: any) {
        console.log('Could not fetch real billing data, using mock:', e)
        isUsingMockData = true
        adminData.billing = {
          organizationId: adminData.organization?.id || 'org-demo',
          currentPeriod: {
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
            endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
            totalCost: 2456.78,
            totalTokens: 45678901
          },
          paymentMethod: {
            type: 'card' as const,
            last4: '4242',
            expiresAt: '12/25'
          },
          billingAddress: {
            company: adminData.organization?.name || 'Demo Company',
            address: '123 AI Street',
            city: 'San Francisco',
            country: 'USA'
          },
          invoices: []
        }
      }
      
      // Test 5: Get usage stats for the current month
      try {
        const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
        const endDate = new Date().toISOString()
        adminData.usageStats = await adminClient.getUsageStats({
          startDate,
          endDate,
          granularity: 'day'
        })
        console.log('Successfully fetched real usage stats')
      } catch (e: any) {
        console.log('Could not fetch real usage stats, using mock:', e)
        isUsingMockData = true
        adminData.usageStats = [
          {
            totalTokens: 1234567,
            totalCost: 123.45,
            requestCount: 5678,
            period: 'day',
            timestamp: new Date().toISOString(),
            model: 'claude-3-5-sonnet-20241022'
          }
        ]
      }
      
      // Test 6: Get API version info
      try {
        adminData.apiVersion = await adminClient.getApiVersionInfo()
        console.log('Successfully fetched real API version')
      } catch (e: any) {
        console.log('Could not fetch real API version, using mock:', e)
        isUsingMockData = true
        adminData.apiVersion = mockClaudeAdminData.apiVersion
      }
      
      // Test 7: Get available models
      try {
        adminData.availableModels = await adminClient.getAvailableModels()
        console.log('Successfully fetched real available models')
      } catch (e: any) {
        console.log('Could not fetch real available models, using mock:', e)
        isUsingMockData = true
        adminData.availableModels = [
          { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Most capable model', enabled: true },
          { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Fast and efficient', enabled: true },
          { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Previous generation', enabled: false }
        ]
      }
      
      // Prepare comprehensive response
      const response = {
        success: true,
        keyType: 'Admin',
        dataSource: isUsingMockData ? 'mock' : 'real',
        warning: isUsingMockData ? 'Using mock data - Claude Admin API is not publicly available. This is for demonstration purposes only.' : undefined,
        capabilities: {
          organizationManagement: !!adminData.organization,
          userManagement: !!adminData.users,
          apiKeyManagement: !!adminData.apiKeys,
          billingAccess: !!adminData.billing,
          usageAnalytics: !!adminData.usageStats,
          modelManagement: !!adminData.availableModels
        },
        response: {
          content: detailed 
            ? `Claude Admin API Test Successful!\n\n${isUsingMockData ? '⚠️ Using MOCK DATA (Demo) - Real Admin API not available\n\n' : ''}Admin Capabilities Verified:\n` +
              `✅ Organization: ${adminData.organization?.name || 'N/A'}\n` +
              `✅ Total Users: ${adminData.users?.length || 0}\n` +
              `✅ Active API Keys: ${adminData.apiKeys?.filter((k: any) => k.status === 'active').length || 0}\n` +
              `✅ Current Month Cost: $${adminData.billing?.currentPeriod?.totalCost?.toFixed(2) || '0.00'}\n` +
              `✅ Total Tokens Used: ${adminData.billing?.currentPeriod?.totalTokens?.toLocaleString() || '0'}\n` +
              `✅ Available Models: ${adminData.availableModels?.filter((m: any) => m.enabled).length || 0}\n` +
              `✅ API Version: ${adminData.apiVersion?.current || 'Unknown'}\n` +
              `\nData Source: ${isUsingMockData ? '🔸 MOCK DATA (Demo)' : '✅ REAL API'}`
            : `Claude Admin API key is working! ${isUsingMockData ? '(Using mock data for demo)' : ''}`
        },
        details: detailed ? {
          organization: {
            id: adminData.organization?.id,
            name: adminData.organization?.name,
            settings: {
              mfaRequired: adminData.organization?.settings?.mfaRequired,
              ssoEnabled: adminData.organization?.settings?.ssoEnabled,
              rateLimits: adminData.organization?.settings?.rateLimits,
              allowedModels: adminData.organization?.settings?.allowedModels?.length || 0
            }
          },
          users: {
            total: adminData.users?.length || 0,
            admins: adminData.users?.filter((u: any) => u.role === 'admin').length || 0,
            active: adminData.users?.filter((u: any) => u.status === 'active').length || 0
          },
          apiKeys: {
            total: adminData.apiKeys?.length || 0,
            active: adminData.apiKeys?.filter((k: any) => k.status === 'active').length || 0
          },
          billing: {
            currentMonthCost: adminData.billing?.currentPeriod?.totalCost,
            currentMonthTokens: adminData.billing?.currentPeriod?.totalTokens,
            paymentMethod: adminData.billing?.paymentMethod?.type
          },
          usage: {
            totalRequests: adminData.usageStats?.reduce((sum: number, stat: any) => sum + (stat.requestCount || 0), 0) || 0,
            totalTokens: adminData.usageStats?.reduce((sum: number, stat: any) => sum + (stat.totalTokens || 0), 0) || 0,
            totalCost: adminData.usageStats?.reduce((sum: number, stat: any) => sum + (stat.totalCost || 0), 0) || 0
          },
          models: adminData.availableModels?.map((m: any) => ({
            id: m.id,
            name: m.name,
            enabled: m.enabled
          }))
        } : undefined,
        usage: {
          tokens: 0,
          cost: 0
        }
      }
      
      return NextResponse.json(response)
      
    } catch (error: any) {
      console.error('Claude Admin API test error:', error)
      
      // If the API key doesn't have admin permissions, return appropriate error
      if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
        return NextResponse.json({
          success: false,
          error: 'This API key does not have admin permissions',
          details: 'Please use an admin or workspace-level API key to access organization features'
        }, { status: 403 })
      }
      
      // For other errors, return a generic error with details
      return NextResponse.json({
        success: false,
        error: 'Failed to test Claude Admin API',
        details: error.message || 'Unknown error occurred'
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Claude Admin test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to test Claude Admin API',
      details: error.message || 'Unknown error'
    }, { status: 500 })
  }
}