import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getUsageStats } from '@/lib/usage-tracker'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || '30d'

    // Get combined usage stats for all providers
    const allStats = getUsageStats(session.user.id)
    
    return NextResponse.json(allStats)
  } catch (error) {
    console.error('All usage fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage data' }, 
      { status: 500 }
    )
  }
}