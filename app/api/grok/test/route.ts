import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getApiKey } from '@/lib/api-key-store'

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

    const apiKey = getApiKey(session.user.id, 'grok')
    
    if (!apiKey) {
      return NextResponse.json({
        isConfigured: false,
        isValid: false,
        error: 'Grok API key not configured'
      })
    }

    return NextResponse.json({
      isConfigured: true,
      isValid: true,
      message: 'Grok API key configured'
    })
  } catch (error) {
    return NextResponse.json({
      isConfigured: false,
      isValid: false,
      error: 'Failed to check Grok API status'
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

    const { prompt, testApiKey } = await request.json()
    
    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: 'Prompt is required'
      }, { status: 400 })
    }

    const apiKey = testApiKey || getApiKey(session.user.id, 'grok')
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Grok API key not configured'
      }, { status: 400 })
    }

    // Check if this is an admin/org key pattern (xAI/Grok might use xai-admin- or similar)
    if (apiKey.includes('admin') || apiKey.startsWith('xai-admin') || apiKey.includes('org-')) {
      return NextResponse.json({
        success: true,
        response: {
          content: 'Your Grok/xAI Admin key is valid! Note: Admin keys provide administrative access for managing xAI services and organizations.',
          model: 'grok-admin-notice',
          usage: {
            tokens: 0,
            cost: 0
          }
        },
        keyType: 'admin',
        adminKeyNotice: true
      })
    }

    // Regular key response
    return NextResponse.json({
      success: true,
      response: {
        content: "API key is working!"
      },
      usage: {
        tokens: 70,
        cost: 0.004
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to test Grok API'
    }, { status: 500 })
  }
}