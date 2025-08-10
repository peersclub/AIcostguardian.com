import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getRecentUsage } from '@/lib/usage-tracker'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const provider = searchParams.get('provider') || undefined

    // Get recent usage from the usage tracker
    const recentUsage = getRecentUsage(
      session.user.id, 
      limit, 
      provider === 'all' ? undefined : provider
    )
    
    return NextResponse.json(recentUsage)
  } catch (error) {
    console.error('Recent usage fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent usage data' }, 
      { status: 500 }
    )
  }
}