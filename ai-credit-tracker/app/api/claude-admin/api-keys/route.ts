import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getClaudeAdminClient, mockClaudeAdminData } from '@/lib/claude-admin-client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      // Try to fetch from real Claude Admin API
      const adminClient = getClaudeAdminClient(session.user.id)
      const apiKeys = await adminClient.getApiKeys()
      
      return NextResponse.json({ apiKeys })
    } catch (adminError: any) {
      console.log('Claude Admin API not available, using mock data:', adminError.message)
      
      // Fallback to mock data
      const apiKeys = mockClaudeAdminData.apiKeys
      return NextResponse.json({ apiKeys })
    }
  } catch (error: any) {
    console.error('Claude Admin API Keys error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch API keys' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const keyData = await request.json()
    
    // For demo purposes, simulate API key creation
    const newApiKey = {
      id: Date.now().toString(),
      name: keyData.name,
      keyPrefix: 'sk-ant-api03-' + Math.random().toString(36).substring(2, 15),
      permissions: keyData.permissions || ['read'],
      scopes: keyData.scopes || ['chat'],
      expiresAt: keyData.expiresAt,
      createdAt: new Date().toISOString(),
      status: 'active'
    }
    
    return NextResponse.json({ apiKey: newApiKey })
  } catch (error: any) {
    console.error('Claude Admin Create API Key error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create API key' },
      { status: 500 }
    )
  }
}