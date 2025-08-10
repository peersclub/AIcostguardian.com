import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getUsageStats, getRecentUsage } from '@/lib/usage-tracker'

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
    const type = searchParams.get('type') || 'stats'
    const limit = parseInt(searchParams.get('limit') || '10')

    if (type === 'stats') {
      const stats = getUsageStats(session.user.id, 'openai')
      return NextResponse.json(stats)
    } else if (type === 'recent') {
      const recentUsage = getRecentUsage(session.user.id, limit, 'openai')
      return NextResponse.json(recentUsage)
    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('OpenAI usage fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage data' }, 
      { status: 500 }
    )
  }
}