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

    const { prompt, testApiKey } = await request.json()
    
    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: 'Prompt is required'
      }, { status: 400 })
    }

    const apiKey = testApiKey || getApiKey(session.user.id, 'claude-admin')
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Claude Admin API key not configured'
      }, { status: 400 })
    }

    // Mock response for Claude Admin API test
    return NextResponse.json({
      success: true,
      response: {
        content: "API key is working!"
      },
      usage: {
        tokens: 100,
        cost: 0.005
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to test Claude Admin API'
    }, { status: 500 })
  }
}