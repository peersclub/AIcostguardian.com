import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/encryption'
import { ApiValidationService, type AIProvider } from '@/lib/services/api-validation.service'
import { withErrorHandler, errorResponse, successResponse } from '@/lib/api/error-handler'
import { notifyApiTestResultServer } from '@/lib/services/notification-trigger'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function handler(request: NextRequest) {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return errorResponse('Unauthorized', 401)
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
        return errorResponse('User not found', 404)
      }

      const apiKey = await prisma.apiKey.findFirst({
        where: {
          id: keyId,
          userId: user.id
        }
      })

      if (!apiKey) {
        return errorResponse('API key not found', 404)
      }

      decryptedKey = decrypt(apiKey.encryptedKey)
      provider = apiKey.provider
    } else if (rawApiKey && providedProvider) {
      // Direct validation (e.g., from onboarding or settings)
      decryptedKey = rawApiKey
      provider = providedProvider
    } else {
      return errorResponse('Either keyId or both apiKey and provider are required', 400)
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
      return errorResponse(`Unsupported provider: ${provider}`, 400)
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

    // Send notification about test result
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (user) {
      await notifyApiTestResultServer(
        user.id,
        provider,
        validationResult.valid,
        (validationResult.details as any)?.latency,
        validationResult.error
      )
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

    return successResponse(validationResult)
}

// Export wrapped handler
export const POST = withErrorHandler(handler)