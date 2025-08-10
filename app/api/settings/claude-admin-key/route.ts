import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { storeApiKey } from '@/lib/api-key-store'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { apiKey, organizationId } = await request.json()
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 })
    }

    // Store the Claude Admin API key for this user
    storeApiKey(session.user.id, 'claude-admin', apiKey)
    
    // Also store organization ID if provided
    if (organizationId) {
      // In a real implementation, you'd store this separately
      console.log(`Organization ID for user ${session.user.id}: ${organizationId}`)
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Claude Admin API key saved successfully'
    })
  } catch (error) {
    console.error('Error saving Claude Admin API key:', error)
    return NextResponse.json(
      { error: 'Failed to save API key' }, 
      { status: 500 }
    )
  }
}