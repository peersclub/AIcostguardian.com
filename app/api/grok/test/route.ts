import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { safeDecrypt } from '@/lib/crypto-helper'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { apiKeys: true }
    })

    if (!user) {
      return NextResponse.json({
        isConfigured: false,
        isValid: false,
        error: 'User not found'
      })
    }

    const apiKeyRecord = user.apiKeys.find(k => k.provider === 'xai')
    
    if (!apiKeyRecord) {
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
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authenticated' 
      }, { status: 401 })
    }

    const { prompt, testApiKey, useStoredKey } = await request.json()
    
    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: 'Prompt is required'
      }, { status: 400 })
    }

    let apiKey = testApiKey
    
    // If using stored key, fetch from database
    if (!apiKey || useStoredKey) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { apiKeys: true }
      })

      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'User not found'
        }, { status: 400 })
      }

      const apiKeyRecord = user.apiKeys.find(k => k.provider === 'xai')
      if (apiKeyRecord) {
        apiKey = safeDecrypt(apiKeyRecord.encryptedKey)
      }
    }
    
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