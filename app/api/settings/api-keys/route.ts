import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getApiKeys, saveApiKey, deleteApiKey, getUserByEmail } from '@/lib/services/database'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET - Retrieve all API keys for the user (masked for security)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all API keys for the user
    const apiKeys = await getApiKeys(user.id)

    // Format response as array for the frontend
    const formattedKeys = apiKeys.map(key => ({
      id: key.id,
      name: `${key.provider} API Key`,
      provider: key.provider.toLowerCase(), // Send lowercase to match frontend expectations
      key: '••••••••••••••••', // Fully masked for security
      masked: `${key.provider.slice(0, 4)}...****`,
      status: key.isActive ? 'active' : 'inactive',
      createdAt: key.createdAt.toISOString(),
      lastUsed: key.lastUsed ? key.lastUsed.toISOString() : null,
      usage: 0 // Could be calculated from usage logs
    }))

    return NextResponse.json({ 
      success: true,
      keys: formattedKeys // Frontend expects 'keys' as an array
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
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { provider } = await request.json()
    
    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 })
    }

    await deleteApiKey(user.id, provider)
    
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
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email)
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'User or organization not found' }, { status: 404 })
    }

    const { provider, apiKey } = await request.json()
    
    if (!provider || !apiKey) {
      return NextResponse.json({ error: 'Provider and API key are required' }, { status: 400 })
    }

    await saveApiKey(user.id, provider, apiKey, user.organizationId)
    
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

// POST - Save a new API key
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email)
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'User or organization not found' }, { status: 404 })
    }

    const { provider, apiKey } = await request.json()
    
    if (!provider || !apiKey) {
      return NextResponse.json({ error: 'Provider and API key are required' }, { status: 400 })
    }

    await saveApiKey(user.id, provider, apiKey, user.organizationId)
    
    return NextResponse.json({ 
      success: true,
      message: `${provider} API key saved successfully`
    })
  } catch (error) {
    console.error('Error saving API key:', error)
    return NextResponse.json(
      { error: 'Failed to save API key' }, 
      { status: 500 }
    )
  }
}