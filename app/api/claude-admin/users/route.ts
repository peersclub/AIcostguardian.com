import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getClaudeAdminClient, mockClaudeAdminData } from '@/lib/claude-admin-client'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      // Try to fetch from real Claude Admin API
      const adminClient = getClaudeAdminClient(session.user.id)
      const users = await adminClient.getUsers()
      
      return NextResponse.json({ users })
    } catch (adminError: any) {
      console.log('Claude Admin API not available, using mock data:', adminError.message)
      
      // Fallback to mock data if Claude Admin API is not available
      const users = mockClaudeAdminData.users
      return NextResponse.json({ users })
    }
  } catch (error: any) {
    console.error('Claude Admin Users API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
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

    const userData = await request.json()
    
    // For demo purposes, simulate user creation
    const newUser = {
      id: Date.now().toString(),
      email: userData.email,
      name: userData.name,
      role: userData.role || 'member',
      status: 'pending',
      usageLimit: userData.usageLimit || 100000,
      permissions: userData.permissions || ['read'],
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    }
    
    return NextResponse.json({ user: newUser })
  } catch (error: any) {
    console.error('Claude Admin Create User error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    )
  }
}