import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getAllApiKeys, getAllApiKeysWithMetadata, removeApiKey, storeApiKey, updateApiKeyLastTested } from '@/lib/api-key-store'

// GET - Retrieve all API keys for the user (masked for security)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKeysWithMetadata = getAllApiKeysWithMetadata(session.user.id)
    
    // Mask API keys for security (show only first 8 and last 4 characters)
    const maskedKeys = Object.entries(apiKeysWithMetadata).reduce((acc, [provider, apiKeyInfo]) => {
      const key = apiKeyInfo.key
      if (key && key.length > 12) {
        acc[provider] = {
          masked: `${key.substring(0, 8)}...${key.substring(key.length - 4)}`,
          hasKey: true,
          keyLength: key.length,
          lastUpdated: apiKeyInfo.lastUpdated,
          lastTested: apiKeyInfo.lastTested,
          isAdmin: apiKeyInfo.isAdmin || false
        }
      } else if (key) {
        acc[provider] = {
          masked: `${key.substring(0, 4)}...`,
          hasKey: true,
          keyLength: key.length,
          lastUpdated: apiKeyInfo.lastUpdated,
          lastTested: apiKeyInfo.lastTested,
          isAdmin: apiKeyInfo.isAdmin || false
        }
      }
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({ 
      success: true,
      apiKeys: maskedKeys 
    })
  } catch (error) {
    console.error('Error retrieving API keys:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve API keys' }, 
      { status: 500 }
    )
  }
}

// DELETE - Remove an API key for a specific provider
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { provider } = await request.json()
    
    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 })
    }

    removeApiKey(session.user.id, provider)
    
    return NextResponse.json({ 
      success: true,
      message: `${provider} API key deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json(
      { error: 'Failed to delete API key' }, 
      { status: 500 }
    )
  }
}

// PUT - Update an existing API key
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { provider, apiKey, isAdmin } = await request.json()
    
    if (!provider || !apiKey) {
      return NextResponse.json({ error: 'Provider and API key are required' }, { status: 400 })
    }

    storeApiKey(session.user.id, provider, apiKey, isAdmin || false)
    
    return NextResponse.json({ 
      success: true,
      message: `${provider} API key updated successfully`
    })
  } catch (error) {
    console.error('Error updating API key:', error)
    return NextResponse.json(
      { error: 'Failed to update API key' }, 
      { status: 500 }
    )
  }
}

// PATCH - Update lastTested timestamp
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { provider } = await request.json()
    
    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 })
    }

    updateApiKeyLastTested(session.user.id, provider)
    
    return NextResponse.json({ 
      success: true,
      message: `Updated lastTested for ${provider}`
    })
  } catch (error) {
    console.error('Error updating lastTested:', error)
    return NextResponse.json(
      { error: 'Failed to update lastTested' }, 
      { status: 500 }
    )
  }
}