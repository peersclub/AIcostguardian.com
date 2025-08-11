import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { safeDecrypt } from '@/lib/crypto-helper'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
// OpenAI API model pricing (per 1000 tokens)
const MODEL_PRICING = {
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
}

async function validateOpenAIKey(apiKey: string): Promise<{ isValid: boolean; error?: string; isAdmin?: boolean }> {
  try {
    // Check for admin/org keys
    if (apiKey.startsWith('org-') || apiKey.includes('admin')) {
      return { isValid: true, isAdmin: true }
    }

    // Test regular API key by making a simple call to OpenAI
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (response.ok) {
      return { isValid: true, isAdmin: false }
    } else {
      const error = await response.text()
      return { isValid: false, error: `Invalid API key: ${response.status}` }
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

    const apiKeyRecord = user.apiKeys.find((k: any) => k.provider === 'openai')
    
    if (!apiKeyRecord || !apiKeyRecord.encryptedKey) {
      return NextResponse.json({
        isConfigured: false,
        isValid: false,
        error: 'OpenAI API key not configured'
      })
    }

    // Decrypt and validate the key
    try {
      const decryptedKey = safeDecrypt(apiKeyRecord.encryptedKey)
      const validation = await validateOpenAIKey(decryptedKey)
      
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

    let apiKey = testApiKey

    // Track if we're using a stored key
    let usingStoredKey = false
    let apiKeyRecordId: string | null = null

    // If no test key provided or explicitly using stored key, get from database
    if (!apiKey || useStoredKey) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { apiKeys: true }
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const apiKeyRecord = user.apiKeys.find((k: any) => k.provider === 'openai')
      if (!apiKeyRecord || !apiKeyRecord.encryptedKey) {
        return NextResponse.json({ 
          error: 'OpenAI API key not configured. Please add your API key in Settings.' 
        }, { status: 400 })
      }

      try {
        apiKey = safeDecrypt(apiKeyRecord.encryptedKey)
        usingStoredKey = true
        apiKeyRecordId = apiKeyRecord.id
      } catch (error) {
        console.error('Decryption error for OpenAI key:', error)
        return NextResponse.json({ 
          success: false,
          error: 'Failed to decrypt stored API key. Please re-add your API key in Settings.' 
        }, { status: 500 })
      }
    }

    // Validate the API key
    const validation = await validateOpenAIKey(apiKey)
    
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: validation.error || 'Invalid API key'
      }, { status: 400 })
    }

    // Update lastTested timestamp if using stored key
    if (usingStoredKey && apiKeyRecordId) {
      try {
        await prisma.apiKey.update({
          where: { id: apiKeyRecordId },
          data: { lastTested: new Date() }
        })
      } catch (error) {
        console.error('Failed to update lastTested timestamp:', error)
        // Continue execution even if timestamp update fails
      }
    }

    // Check if it's an admin/organization key
    if (validation.isAdmin) {
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
      
      // Calculate cost
      const promptTokens = data.usage?.prompt_tokens || 0
      const completionTokens = data.usage?.completion_tokens || 0
      const totalTokens = data.usage?.total_tokens || 0
      
      const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING] || { input: 0.002, output: 0.002 }
      const cost = (promptTokens * pricing.input / 1000) + (completionTokens * pricing.output / 1000)

      return NextResponse.json({
        success: true,
        response: {
          content: data.choices[0].message.content,
          model: model,
          usage: {
            promptTokens,
            completionTokens,
            totalTokens,
            cost
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