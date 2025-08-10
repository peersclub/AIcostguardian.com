import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30d'
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch(timeframe) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Get usage logs
    const usageLogs = await prisma.usageLog.findMany({
      where: {
        userId: user.id,
        timestamp: {
          gte: startDate,
          lte: now
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    })

    // Calculate stats
    const stats = {
      totalCost: usageLogs.reduce((sum, log) => sum + log.cost, 0),
      totalTokens: usageLogs.reduce((sum, log) => sum + log.totalTokens, 0),
      totalRequests: usageLogs.length,
      byProvider: {} as Record<string, any>,
      byModel: {} as Record<string, any>,
      dailyUsage: [] as any[]
    }

    // Group by provider
    usageLogs.forEach(log => {
      if (!stats.byProvider[log.provider]) {
        stats.byProvider[log.provider] = {
          cost: 0,
          tokens: 0,
          requests: 0
        }
      }
      stats.byProvider[log.provider].cost += log.cost
      stats.byProvider[log.provider].tokens += log.totalTokens
      stats.byProvider[log.provider].requests += 1

      // Group by model
      const modelKey = `${log.provider}:${log.model}`
      if (!stats.byModel[modelKey]) {
        stats.byModel[modelKey] = {
          provider: log.provider,
          model: log.model,
          cost: 0,
          tokens: 0,
          requests: 0
        }
      }
      stats.byModel[modelKey].cost += log.cost
      stats.byModel[modelKey].tokens += log.totalTokens
      stats.byModel[modelKey].requests += 1
    })

    // Group by day for chart data
    const dailyData = new Map<string, any>()
    usageLogs.forEach(log => {
      const day = log.timestamp.toISOString().split('T')[0]
      if (!dailyData.has(day)) {
        dailyData.set(day, {
          date: day,
          cost: 0,
          tokens: 0,
          requests: 0
        })
      }
      const dayStats = dailyData.get(day)
      dayStats.cost += log.cost
      dayStats.tokens += log.totalTokens
      dayStats.requests += 1
    })

    stats.dailyUsage = Array.from(dailyData.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching usage stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}