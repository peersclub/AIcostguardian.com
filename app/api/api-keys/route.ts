import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { apiKeyService, type Provider } from '@/lib/core/api-key.service'
import { userService } from '@/lib/core/user.service'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/api-keys - Get all API keys for the current user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user exists with organization
    const user = await userService.ensureUser({
      email: session.user.email,
      name: session.user.name,
      image: session.user.image
    })

    // Get all API keys for the user
    const keys = await apiKeyService.getApiKeys(user.id, user.organizationId || undefined)

    // Return keys without the encrypted values
    const maskedKeys = keys.map(key => ({
      id: key.id,
      provider: key.provider,
      isActive: key.isActive,
      lastUsed: key.lastUsed,
      lastTested: key.lastTested,
      createdAt: key.createdAt,
      maskedKey: '••••••••••••' + (key.encryptedKey ? '••••' : '')
    }))

    return NextResponse.json({ keys: maskedKeys })
  } catch (error: any) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/api-keys - Save or update an API key
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { provider, key } = body

    if (!provider || !key) {
      return NextResponse.json(
        { error: 'Provider and key are required' },
        { status: 400 }
      )
    }

    // Validate provider
    const validProviders: Provider[] = ['openai', 'claude', 'gemini', 'grok', 'perplexity', 'cohere', 'mistral']
    if (!validProviders.includes(provider as Provider)) {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      )
    }

    // Ensure user exists with organization
    const user = await userService.ensureUser({
      email: session.user.email,
      name: session.user.name,
      image: session.user.image
    })

    // Validate the API key with the provider
    const validation = await apiKeyService.validateApiKey(provider as Provider, key)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid API key' },
        { status: 400 }
      )
    }

    // Save the API key
    const savedKey = await apiKeyService.saveApiKey({
      provider: provider as Provider,
      key,
      userId: user.id,
      organizationId: user.organizationId!
    })

    return NextResponse.json({
      success: true,
      message: 'API key saved successfully',
      model: validation.model
    })
  } catch (error: any) {
    console.error('Error saving API key:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save API key' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/api-keys - Delete an API key
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      )
    }

    // Ensure user exists
    const user = await userService.getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete the API key
    const deleted = await apiKeyService.deleteApiKey(
      user.id,
      provider as Provider,
      user.organizationId || undefined
    )

    if (!deleted) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting API key:', error)
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/api-keys - Test an API key
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { provider } = body

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      )
    }

    // Ensure user exists
    const user = await userService.getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the API key
    const apiKey = await apiKeyService.getApiKey(
      user.id,
      provider as Provider,
      user.organizationId || undefined
    )

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    // Test the API key
    const validation = await apiKeyService.validateApiKey(provider as Provider, apiKey)

    return NextResponse.json({
      isValid: validation.isValid,
      error: validation.error,
      model: validation.model
    })
  } catch (error: any) {
    console.error('Error testing API key:', error)
    return NextResponse.json(
      { error: 'Failed to test API key' },
      { status: 500 }
    )
  }
}