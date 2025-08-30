import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { apiKeyService, type Provider } from '@/lib/core/api-key.service'
import { userService } from '@/lib/core/user.service'
import { usageService } from '@/lib/core/usage.service'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ 
        isConfigured: false, 
        isValid: false, 
        error: 'Not authenticated' 
      })
    }

    // Ensure user exists with organization
    const user = await userService.ensureUser({
      email: session.user.email,
      name: session.user.name,
      image: session.user.image
    })

    // Check if API key exists using central service
    const apiKey = await apiKeyService.getApiKey(
      user.id,
      'openai' as Provider,
      user.organizationId || undefined
    )
    
    if (!apiKey) {
      return NextResponse.json({
        isConfigured: false,
        isValid: false,
        error: 'OpenAI API key not configured'
      })
    }

    // Validate the key
    try {

      // Validate using central service
      const validation = await apiKeyService.validateApiKey('openai' as Provider, apiKey)
      
      return NextResponse.json({
        isConfigured: true,
        isValid: validation.isValid,
        isAdmin: apiKey.includes('admin') || apiKey.startsWith('org-'),
        error: validation.error,
        model: validation.model
      })
    } catch (error) {
      return NextResponse.json({
        isConfigured: true,
        isValid: false,
        error: 'Failed to validate stored API key'
      })
    }
  } catch (error) {
    console.error('OpenAI status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check OpenAI status' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, model = 'gpt-4o-mini', testApiKey, useStoredKey } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Ensure user exists with organization
    const user = await userService.ensureUser({
      email: session.user.email,
      name: session.user.name,
      image: session.user.image
    })

    let apiKey = testApiKey
    let usingStoredKey = false

    // If no test key provided or explicitly using stored key, get from central service
    if (!apiKey || useStoredKey) {
      apiKey = await apiKeyService.getApiKey(
        user.id,
        'openai' as Provider,
        user.organizationId || undefined
      )
      
      if (!apiKey) {
        return NextResponse.json({ 
          error: 'OpenAI API key not configured. Please add your API key in Settings.' 
        }, { status: 400 })
      }
      
      usingStoredKey = true
    }

    // Validate the API key using central service
    const validation = await apiKeyService.validateApiKey('openai' as Provider, apiKey)
    
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: validation.error || 'Invalid API key'
      }, { status: 400 })
    }

    // Note: updateLastTested requires keyId which we don't have from getApiKey
    // This could be improved in the future by returning the key object from getApiKey

    // Check if it's an admin/organization key
    const isAdminKey = apiKey.startsWith('org-') || apiKey.includes('admin')
    if (isAdminKey) {
      return NextResponse.json({
        success: true,
        response: {
          content: 'Your OpenAI Organization/Admin key is valid! Note: Organization keys provide administrative access to manage your OpenAI organization.',
          model: 'openai-admin-notice',
          usage: {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            cost: 0
          }
        },
        keyType: 'admin',
        adminKeyNotice: true
      })
    }

    // If just testing the key
    if (prompt === "Hi, this is a test to validate my API key. Please respond with 'API key is working!'") {
      return NextResponse.json({
        success: true,
        response: { 
          content: 'API key is working!',
          model: model,
          usage: {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            cost: 0
          }
        }
      })
    }

    // Make actual OpenAI API call
    try {
      const startTime = Date.now()
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        return NextResponse.json({
          success: false,
          error: `OpenAI API error: ${response.status}`,
          details: error
        }, { status: response.status })
      }

      const data = await response.json()
      const latency = Date.now() - startTime
      
      // Calculate cost using central service
      const promptTokens = data.usage?.prompt_tokens || 0
      const completionTokens = data.usage?.completion_tokens || 0
      const totalTokens = data.usage?.total_tokens || 0
      
      const cost = usageService.calculateCost(
        'openai' as Provider,
        model,
        promptTokens,
        completionTokens
      )

      // Track usage if using stored key
      if (usingStoredKey) {
        await usageService.logUsage({
          userId: user.id,
          organizationId: user.organizationId || '',
          provider: 'openai' as Provider,
          model,
          promptTokens,
          completionTokens,
          totalTokens,
          cost: cost.totalCost,
          metadata: {
            endpoint: '/api/openai/test',
            latency,
            success: true
          }
        })
      }

      return NextResponse.json({
        success: true,
        response: {
          content: data.choices[0].message.content,
          model: model,
          usage: {
            promptTokens,
            completionTokens,
            totalTokens,
            cost: cost.totalCost
          }
        }
      })
    } catch (error: any) {
      console.error('OpenAI API call error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to call OpenAI API',
        details: error.message
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error?.message || 'Failed to call OpenAI API'
      }, 
      { status: 500 }
    )
  }
}