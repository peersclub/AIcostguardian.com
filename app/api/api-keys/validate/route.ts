import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/encryption'
import { ApiValidationService, type AIProvider } from '@/lib/services/api-validation.service'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { keyId, provider: providedProvider, apiKey: rawApiKey, test } = body

    // Handle both stored keys and direct validation
    let decryptedKey: string
    let provider: string

    if (keyId) {
      // Validating a stored key
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const apiKey = await prisma.apiKey.findFirst({
        where: {
          id: keyId,
          userId: user.id
        }
      })

      if (!apiKey) {
        return NextResponse.json({ error: 'API key not found' }, { status: 404 })
      }

      decryptedKey = decrypt(apiKey.encryptedKey)
      provider = apiKey.provider
    } else if (rawApiKey && providedProvider) {
      // Direct validation (e.g., from onboarding or settings)
      decryptedKey = rawApiKey
      provider = providedProvider
    } else {
      return NextResponse.json({ 
        error: 'Either keyId or both apiKey and provider are required' 
      }, { status: 400 })
    }

    // Map provider names to AIProvider type
    const providerMap: Record<string, AIProvider> = {
      'openai': 'openai',
      'anthropic': 'anthropic',
      'claude': 'anthropic',
      'google': 'google',
      'gemini': 'google',
      'mistral': 'mistral',
      'perplexity': 'perplexity',
      'grok': 'grok',
      'xai': 'grok'
    }

    const normalizedProvider = providerMap[provider.toLowerCase()]
    
    if (!normalizedProvider) {
      return NextResponse.json({ 
        error: `Unsupported provider: ${provider}` 
      }, { status: 400 })
    }

    // Use centralized validation service
    const validationResult = await ApiValidationService.validateApiKey(
      decryptedKey,
      normalizedProvider
    )

    // If validation passed and it's a stored key, update the database
    if (validationResult.valid && keyId) {
      await prisma.apiKey.update({
        where: { id: keyId },
        data: { 
          lastUsed: new Date(),
          isActive: true
        }
      })
    }

    // If test flag is set, also perform a test API call
    if (test && validationResult.valid) {
      const testResult = await ApiValidationService.testApiKey(
        decryptedKey,
        normalizedProvider
      )
      
      return NextResponse.json({
        ...validationResult,
        test: testResult
      })
    }

    return NextResponse.json(validationResult)

  } catch (error) {
    console.error('Error validating API key:', error)
    
    // Return a properly formatted JSON error response
    return NextResponse.json({ 
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to validate API key',
      provider: 'unknown'
    }, { status: 500 })
  }
}