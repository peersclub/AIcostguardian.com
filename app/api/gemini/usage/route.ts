import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getUserUsage } from '@/lib/usage-tracker'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get usage statistics for this user, filtered by Gemini provider
    const usageData = getUserUsage(session.user.id, 'gemini')

    // Calculate totals
    const totalCost = usageData.reduce((sum, stat) => sum + (stat.cost || stat.totalCost || 0), 0)
    const totalTokens = usageData.reduce((sum, stat) => sum + stat.totalTokens, 0)
    const totalCalls = usageData.length

    // Group by model
    const modelStats = usageData.reduce((acc, stat) => {
      if (!acc[stat.model]) {
        acc[stat.model] = {
          model: stat.model,
          calls: 0,
          totalTokens: 0,
          totalCost: 0
        }
      }
      acc[stat.model].calls++
      acc[stat.model].totalTokens += stat.totalTokens
      acc[stat.model].totalCost += (stat.cost || stat.totalCost || 0)
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      summary: {
        totalCost,
        totalTokens,
        totalCalls,
        provider: 'gemini'
      },
      modelBreakdown: Object.values(modelStats),
      recentUsage: usageData
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10) // Last 10 calls
    })
  } catch (error) {
    console.error('Gemini usage stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get usage statistics' }, 
      { status: 500 }
    )
  }
}