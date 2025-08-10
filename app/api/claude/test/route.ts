import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { safeDecrypt } from '@/lib/crypto-helper'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Claude API model pricing (per 1M tokens)
const MODEL_PRICING = {
  'claude-3-opus-20240229': { input: 15, output: 75 },
  'claude-3-sonnet-20240229': { input: 3, output: 15 },
  'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  'claude-3-5-haiku-20241022': { input: 1, output: 5 },
}

async function validateClaudeKey(apiKey: string): Promise<{ isValid: boolean; error?: string; isAdmin?: boolean }> {
  try {
    // Check if this is an admin key
    if (apiKey.startsWith('sk-ant-admin')) {
      // Admin keys are valid but should be used with admin endpoints
      return { 
        isValid: false, 
        error: 'This is a Claude Admin API key. Please use the Claude Admin test endpoint instead.',
        isAdmin: true 
      }
    }

    // Test regular API key by making a simple call to Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    })

    if (response.ok) {
      return { isValid: true, isAdmin: false }
    } else if (response.status === 401) {
      return { isValid: false, error: 'Invalid API key' }
    } else {
      const error = await response.text()
      return { isValid: false, error: `API error: ${response.status}` }
    }
  } catch (error: any) {
    return { isValid: false, error: error.message || 'Failed to validate API key' }
  }
}

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

    // Get user's stored API key from database
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

    const apiKeyRecord = user.apiKeys.find(k => k.provider === 'anthropic')
    
    if (!apiKeyRecord || !apiKeyRecord.encryptedKey) {
      return NextResponse.json({
        isConfigured: false,
        isValid: false,
        error: 'Claude API key not configured'
      })
    }

    // Decrypt and validate the key
    try {
      const decryptedKey = safeDecrypt(apiKeyRecord.encryptedKey)
      const validation = await validateClaudeKey(decryptedKey)
      
      return NextResponse.json({
        isConfigured: true,
        isValid: validation.isValid,
        isAdmin: validation.isAdmin,
        error: validation.error
      })
    } catch (error) {
      return NextResponse.json({
        isConfigured: true,
        isValid: false,
        error: 'Failed to validate stored API key'
      })
    }
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
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, model = 'claude-3-5-haiku-20241022', testApiKey } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    let apiKey = testApiKey

    // If no test key provided, get from database
    if (!apiKey) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { apiKeys: true }
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const apiKeyRecord = user.apiKeys.find(k => k.provider === 'anthropic')
      if (!apiKeyRecord || !apiKeyRecord.encryptedKey) {
        return NextResponse.json({ 
          error: 'Claude API key not configured. Please add your API key in Settings.' 
        }, { status: 400 })
      }

      try {
        apiKey = safeDecrypt(apiKeyRecord.encryptedKey)
      } catch (error) {
        console.error('Decryption error for Claude key:', error)
        return NextResponse.json({ 
          success: false,
          error: 'Failed to decrypt stored API key. Please re-add your API key in Settings.' 
        }, { status: 500 })
      }
    }

    // Validate the API key
    const validation = await validateClaudeKey(apiKey)
    
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: validation.error || 'Invalid API key'
      }, { status: 400 })
    }

    // If just testing the key
    if (prompt === "Hi, this is a test to validate my API key. Please respond with 'API key is working!'") {
      return NextResponse.json({
        success: true,
        response: { 
          content: 'API key is working!',
          model: model,
          usage: {
            inputTokens: 0,
            outputTokens: 0,
            totalCost: 0
          }
        }
      })
    }

    // Make actual Claude API call
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        return NextResponse.json({
          success: false,
          error: `Claude API error: ${response.status}`,
          details: error
        }, { status: response.status })
      }

      const data = await response.json()
      
      // Calculate cost
      const inputTokens = data.usage?.input_tokens || 0
      const outputTokens = data.usage?.output_tokens || 0
      
      const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING] || { input: 3, output: 15 }
      const totalCost = (inputTokens * pricing.input / 1000000) + (outputTokens * pricing.output / 1000000)

      return NextResponse.json({
        success: true,
        response: {
          content: data.content[0].type === 'text' ? data.content[0].text : 'Non-text response',
          model: data.model,
          usage: {
            inputTokens,
            outputTokens,
            totalCost
          }
        }
      })
    } catch (error: any) {
      console.error('Claude API call error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to call Claude API',
        details: error.message
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Claude test API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error?.message || 'Failed to call Claude API'
      }, 
      { status: 500 }
    )
  }
}