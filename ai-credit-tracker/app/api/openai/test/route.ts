import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { makeOpenAICall, getOpenAIStatus } from '@/lib/openai-client'
import { storeUsage } from '@/lib/usage-tracker'

export async function GET(request: NextRequest) {
  try {
    // Get session for user ID
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    
    // Check OpenAI API status
    const status = await getOpenAIStatus(userId)
    return NextResponse.json(status)
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
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, model = 'gpt-4o-mini', testApiKey } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // If testApiKey is provided, test it
    if (testApiKey) {
      const status = await getOpenAIStatus(session.user.id, testApiKey)
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
    }

    // Make OpenAI API call
    const { response, usage } = await makeOpenAICall(
      session.user.id,
      model,
      [{ role: 'user', content: prompt }],
      { maxTokens: 1024, apiKey: testApiKey }
    )

    // Store usage data with provider info
    storeUsage({
      ...usage,
      provider: 'openai'
    })

    return NextResponse.json({
      success: true,
      response: {
        content: response.message.content,
        model: model,
        usage: {
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
          cost: usage.cost
        }
      }
    })
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error?.message || 'Failed to call OpenAI API',
        details: error?.response?.data?.error?.message || error?.message
      }, 
      { status: 500 }
    )
  }
}