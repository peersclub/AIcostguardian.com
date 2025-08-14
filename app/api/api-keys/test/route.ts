import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { apiKeyService, type Provider } from '@/lib/core/api-key.service'
import { userService } from '@/lib/core/user.service'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/api-keys/test - Test an API key
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { provider, id } = body

    if (!provider && !id) {
      return NextResponse.json(
        { error: 'Either provider or id is required' },
        { status: 400 }
      )
    }

    // Ensure user exists with organization
    const user = await userService.ensureUser({
      email: session.user.email,
      name: session.user.name,
      image: session.user.image
    })

    let apiKey: string | null = null
    let actualProvider: string = provider

    if (id) {
      // Get API key by ID and retrieve the provider
      const keyData = await apiKeyService.getApiKeyById(id, user.id)
      if (!keyData) {
        return NextResponse.json(
          { error: 'API key not found' },
          { status: 404 }
        )
      }
      apiKey = keyData.key
      actualProvider = keyData.provider
    } else {
      // Get API key by provider (backward compatibility)
      apiKey = await apiKeyService.getApiKey(
        user.id,
        provider as Provider,
        user.organizationId || undefined
      )
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    // Test the API key
    const validation = await apiKeyService.validateApiKey(actualProvider as Provider, apiKey)
    
    // Update last tested timestamp
    if (id) {
      await apiKeyService.updateLastTested(id)
    }

    return NextResponse.json({
      success: validation.isValid,
      isValid: validation.isValid,
      error: validation.error,
      model: validation.model,
      provider: actualProvider,
      message: validation.isValid ? 'API key is working correctly' : 'API key validation failed'
    })
  } catch (error: any) {
    console.error('Error testing API key:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to test API key',
        details: error.message 
      },
      { status: 500 }
    )
  }
}