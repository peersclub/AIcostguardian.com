import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getUserUsageStats, getRecentUsage } from '@/lib/usage-tracker'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'stats'
    const limit = parseInt(searchParams.get('limit') || '10')

    switch (type) {
      case 'stats':
        const stats = getUserUsageStats(userId)
        return NextResponse.json(stats)
      
      case 'recent':
        const recent = getRecentUsage(userId, limit)
        return NextResponse.json(recent)
      
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Claude usage API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}