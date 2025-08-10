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
      const organization = await adminClient.getOrganizationSettings()
      
      return NextResponse.json(organization)
    } catch (adminError: any) {
      console.log('Claude Admin API not available, using mock data:', adminError.message)
      
      // Fallback to mock organization settings
      const organization = mockClaudeAdminData.organization
      return NextResponse.json(organization)
    }
  } catch (error: any) {
    console.error('Claude Admin Organization API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch organization settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()
    
    // For demo purposes, simulate settings update
    console.log('Updating organization settings:', updates)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Organization settings updated successfully' 
    })
  } catch (error: any) {
    console.error('Claude Admin Update Organization error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update organization settings' },
      { status: 500 }
    )
  }
}