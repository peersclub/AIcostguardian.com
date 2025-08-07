import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { makeClaudeCall, getClaudeStatus } from '@/lib/claude-client'
import { storeUsage } from '@/lib/usage-tracker'
import { getApiKey } from '@/lib/api-key-store'

export async function GET(request: NextRequest) {
  try {
    // Check Claude API status
    const status = await getClaudeStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error('Claude status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check Claude status' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, model = 'claude-3-5-haiku-20241022', testApiKey } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // If testApiKey is provided, test it first
    if (testApiKey) {
      // Check if this is an admin key being tested on wrong endpoint
      if (testApiKey.startsWith('sk-ant-admin')) {
        return NextResponse.json({
          success: false,
          error: 'This is a Claude Admin API key. Please use the Claude Admin test endpoint instead.',
          details: 'Admin keys (sk-ant-admin-*) should be tested through the Admin API'
        }, { status: 400 })
      }
      
      const status = await getClaudeStatus(testApiKey)
      if (!status.isValid) {
        return NextResponse.json({
          success: false,
          error: 'Invalid API key',
          details: status.error
        }, { status: 400 })
      }
      // If we're just testing the key, return success
      if (prompt === "Hi, this is a test to validate my API key. Please respond with 'API key is working!'") {
        return NextResponse.json({
          success: true,
          response: { content: 'API key is working!' }
        })
      }
    } else {
      // No testApiKey provided, check if stored key is admin key
      const storedKey = getApiKey(session.user.id, 'claude')
      if (storedKey && storedKey.startsWith('sk-ant-admin')) {
        // Admin key detected - return appropriate response
        return NextResponse.json({
          success: true,
          response: {
            content: 'Your Claude Admin key is valid! Note: Admin keys are for organization management, not chat completions. For chat functionality, use a regular API key (sk-ant-api03-*).',
            model: 'claude-admin-notice',
            usage: {
              inputTokens: 0,
              outputTokens: 0,
              totalCost: 0
            }
          },
          keyType: 'admin',
          adminKeyNotice: true,
          usage: {
            id: crypto.randomUUID(),
            userId: session.user.id,
            model: 'claude-admin',
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            inputCost: 0,
            outputCost: 0,
            totalCost: 0,
            timestamp: new Date(),
            prompt: prompt,
            response: 'Admin key validation'
          }
        })
      }
    }

    // Make Claude API call
    const { response, usage } = await makeClaudeCall(
      session.user.id,
      model,
      [{ role: 'user', content: prompt }],
      { maxTokens: 1024, apiKey: testApiKey }
    )

    // Store usage data with provider info
    storeUsage({
      ...usage,
      provider: 'claude',
      cost: usage.totalCost || 0
    })

    return NextResponse.json({
      success: true,
      response: {
        content: response.content[0].type === 'text' ? response.content[0].text : 'Non-text response',
        model: response.model,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalCost: usage.totalCost
        }
      },
      usage
    })
  } catch (error: any) {
    console.error('Claude test API error:', error)
    return NextResponse.json(
      { 
        error: 'Claude API call failed',
        details: error.message || 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}