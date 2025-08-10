import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/encryption'

// Validation functions for different providers
async function validateOpenAIKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })
    return response.ok
  } catch {
    return false
  }
}

async function validateClaudeKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      })
    })
    // 401 means invalid key, 400 might mean valid key but bad request
    return response.status !== 401
  } catch {
    return false
  }
}

async function validateGeminiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
    return response.ok
  } catch {
    return false
  }
}

async function validateGrokKey(apiKey: string): Promise<boolean> {
  try {
    // Grok/X.AI validation endpoint
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      })
    })
    return response.status !== 401
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { keyId, provider } = await request.json()

    if (!keyId) {
      return NextResponse.json({ error: 'Key ID required' }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the API key
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId: user.id
      }
    })

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    // Decrypt the key
    const decryptedKey = decrypt(apiKey.encryptedKey)

    // Validate based on provider
    let isValid = false
    const providerLower = (provider || apiKey.provider).toLowerCase()

    switch (providerLower) {
      case 'openai':
        isValid = await validateOpenAIKey(decryptedKey)
        break
      case 'claude':
      case 'anthropic':
        isValid = await validateClaudeKey(decryptedKey)
        break
      case 'gemini':
      case 'google':
        isValid = await validateGeminiKey(decryptedKey)
        break
      case 'grok':
      case 'xai':
        isValid = await validateGrokKey(decryptedKey)
        break
      default:
        return NextResponse.json({ 
          error: `Validation not supported for provider: ${providerLower}` 
        }, { status: 400 })
    }

    // Update last validated timestamp
    if (isValid) {
      await prisma.apiKey.update({
        where: { id: keyId },
        data: { 
          lastUsed: new Date(),
          isActive: true
        }
      })
    }

    return NextResponse.json({ 
      valid: isValid,
      provider: apiKey.provider,
      message: isValid ? 'API key is valid' : 'API key validation failed'
    })

  } catch (error) {
    console.error('Error validating API key:', error)
    return NextResponse.json({ 
      error: 'Failed to validate API key' 
    }, { status: 500 })
  }
}