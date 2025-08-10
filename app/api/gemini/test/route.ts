import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { safeDecrypt } from '@/lib/crypto-helper'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Gemini API model pricing (per 1M tokens)
const MODEL_PRICING = {
  'gemini-1.5-flash': { input: 0.075, output: 0.30 },
  'gemini-1.5-flash-8b': { input: 0.0375, output: 0.15 },
  'gemini-1.5-pro': { input: 1.25, output: 5.00 },
  'gemini-1.0-pro': { input: 0.50, output: 1.50 },
}

async function validateGeminiKey(apiKey: string): Promise<{ isValid: boolean; error?: string }> {
  try {
    // Test API key by making a simple call to Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)

    if (response.ok) {
      return { isValid: true }
    } else if (response.status === 400 || response.status === 403) {
      return { isValid: false, error: 'Invalid API key' }
    } else {
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

    const apiKeyRecord = user.apiKeys.find(k => k.provider === 'google')
    
    if (!apiKeyRecord || !apiKeyRecord.encryptedKey) {
      return NextResponse.json({
        isConfigured: false,
        isValid: false,
        error: 'Gemini API key not configured'
      })
    }

    // Decrypt and validate the key
    try {
      const decryptedKey = safeDecrypt(apiKeyRecord.encryptedKey)
      const validation = await validateGeminiKey(decryptedKey)
      
      return NextResponse.json({
        isConfigured: true,
        isValid: validation.isValid,
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
    console.error('Gemini status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check Gemini status' }, 
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
    const { prompt, model = 'gemini-1.5-flash', testApiKey } = body

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

      const apiKeyRecord = user.apiKeys.find(k => k.provider === 'google')
      if (!apiKeyRecord || !apiKeyRecord.encryptedKey) {
        return NextResponse.json({ 
          error: 'Gemini API key not configured. Please add your API key in Settings.' 
        }, { status: 400 })
      }

      try {
        apiKey = safeDecrypt(apiKeyRecord.encryptedKey)
      } catch (error) {
        return NextResponse.json({ 
          error: 'Failed to decrypt stored API key' 
        }, { status: 500 })
      }
    }

    // Validate the API key
    const validation = await validateGeminiKey(apiKey)
    
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
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            cost: 0
          }
        }
      })
    }

    // Make actual Gemini API call
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            }
          }),
        }
      )

      if (!response.ok) {
        const error = await response.text()
        return NextResponse.json({
          success: false,
          error: `Gemini API error: ${response.status}`,
          details: error
        }, { status: response.status })
      }

      const data = await response.json()
      
      // Extract token counts from response
      const promptTokens = data.usageMetadata?.promptTokenCount || 0
      const completionTokens = data.usageMetadata?.candidatesTokenCount || 0
      const totalTokens = data.usageMetadata?.totalTokenCount || 0
      
      // Calculate cost
      const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING] || { input: 0.5, output: 1.5 }
      const cost = (promptTokens * pricing.input / 1000000) + (completionTokens * pricing.output / 1000000)

      // Extract the text response
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated'

      return NextResponse.json({
        success: true,
        response: {
          content: responseText,
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
      console.error('Gemini API call error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to call Gemini API',
        details: error.message
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Gemini test API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error?.message || 'Failed to call Gemini API'
      }, 
      { status: 500 }
    )
  }
}