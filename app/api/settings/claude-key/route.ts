import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// In-memory storage for API keys (in production, use encrypted database)
const userApiKeys = new Map<string, string>()

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { apiKey } = await request.json()

    if (!apiKey || !apiKey.startsWith('sk-ant-api03-')) {
      return NextResponse.json({ 
        error: 'Invalid Claude API key format. Must start with sk-ant-api03-' 
      }, { status: 400 })
    }

    // In production, encrypt this before storing
    userApiKeys.set(session.user.id, apiKey)

    return NextResponse.json({ 
      success: true,
      message: 'Claude API key saved successfully' 
    })
  } catch (error) {
    console.error('Error saving Claude API key:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKey = userApiKeys.get(session.user.id)
    
    return NextResponse.json({ 
      hasApiKey: !!apiKey,
      // Never return the actual key for security
      keyPreview: apiKey ? `${apiKey.slice(0, 20)}...` : null
    })
  } catch (error) {
    console.error('Error retrieving Claude API key status:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    userApiKeys.delete(session.user.id)

    return NextResponse.json({ 
      success: true,
      message: 'Claude API key deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting Claude API key:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}