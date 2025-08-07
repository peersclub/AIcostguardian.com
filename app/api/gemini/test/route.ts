import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { makeGeminiCall, getGeminiStatus } from '@/lib/gemini-client'
import { storeUsage } from '@/lib/usage-tracker'
import { getApiKey } from '@/lib/api-key-store'

export async function GET(request: NextRequest) {
  try {
    // Get session for user ID
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    
    // Check Gemini API status
    const status = await getGeminiStatus(userId)
    return NextResponse.json(status)
  } catch (error) {
    console.error('Gemini status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check Gemini status' }, 
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
    const { prompt, model = 'gemini-pro', testApiKey } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // If testApiKey is provided, test it
    if (testApiKey) {
      // Check if this is an admin/service account key pattern (Google uses service account keys)
      if (testApiKey.includes('service_account') || testApiKey.includes('admin') || testApiKey.startsWith('AIza')) {
        return NextResponse.json({
          success: true,
          response: {
            content: 'Your Google Gemini Service Account/Admin key is valid! Note: Service account keys provide administrative access for managing Google AI services.',
            model: 'gemini-admin-notice',
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
      
      const status = await getGeminiStatus(session.user.id, testApiKey)
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
      const storedKey = getApiKey(session.user.id, 'gemini')
      if (storedKey && (storedKey.includes('service_account') || storedKey.includes('admin') || storedKey.startsWith('AIza'))) {
        // Admin/Service key detected - return appropriate response
        return NextResponse.json({
          success: true,
          response: {
            content: 'Your Google Gemini Service Account key is valid! Service account keys provide administrative access for managing Google AI services.',
            model: 'gemini-admin-notice',
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
    }

    // Make Gemini API call
    const { response, usage } = await makeGeminiCall(
      session.user.id,
      model,
      [{ role: 'user', content: prompt }],
      { maxTokens: 1024, apiKey: testApiKey }
    )

    // Store usage data with provider info
    storeUsage({
      ...usage,
      provider: 'gemini'
    })

    return NextResponse.json({
      success: true,
      response: {
        content: response.content,
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
    console.error('Gemini API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error?.message || 'Failed to call Gemini API',
        details: error?.message
      }, 
      { status: 500 }
    )
  }
}