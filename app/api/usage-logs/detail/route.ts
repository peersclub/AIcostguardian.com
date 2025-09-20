import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { subDays } from 'date-fns'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const provider = searchParams.get('provider')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get user and organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'User or organization not found' }, { status: 404 })
    }

    // Build where clause
    const whereClause: any = {
      organizationId: user.organizationId
    }

    // Add date filter
    if (startDate && endDate) {
      whereClause.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } else {
      // Default to last 30 days
      whereClause.timestamp = {
        gte: subDays(new Date(), 30)
      }
    }

    // Add provider filter
    if (provider && provider !== 'all') {
      whereClause.provider = provider
    }

    // Get usage logs with pagination
    const [usageLogs, totalCount] = await Promise.all([
      prisma.usageLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.usageLog.count({
        where: whereClause
      })
    ])

    // Format the data for display
    const formattedLogs = usageLogs.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      provider: log.provider,
      model: log.model,
      operation: log.metadata ? (log.metadata as any).operation || 'completion' : 'completion',
      cost: log.cost,
      promptTokens: log.promptTokens,
      completionTokens: log.completionTokens,
      totalTokens: log.totalTokens,
      user: {
        name: log.user?.name || 'Unknown',
        email: log.user?.email || 'unknown@example.com'
      },
      success: log.metadata ? !(log.metadata as any).error : true,
      responseTime: log.metadata ? (log.metadata as any).responseTime || null : null,
      endpoint: log.metadata ? (log.metadata as any).endpoint || null : null
    }))

    // Calculate summary stats
    const totalCost = usageLogs.reduce((sum, log) => sum + log.cost, 0)
    const totalRequests = usageLogs.length
    const avgCostPerRequest = totalRequests > 0 ? totalCost / totalRequests : 0
    const totalTokens = usageLogs.reduce((sum, log) => sum + log.totalTokens, 0)

    // Provider breakdown
    const providerBreakdown = usageLogs.reduce((acc: any, log) => {
      if (!acc[log.provider]) {
        acc[log.provider] = {
          count: 0,
          cost: 0,
          tokens: 0
        }
      }
      acc[log.provider].count++
      acc[log.provider].cost += log.cost
      acc[log.provider].tokens += log.totalTokens
      return acc
    }, {})

    return NextResponse.json({
      logs: formattedLogs,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      },
      summary: {
        totalCost: Math.round(totalCost * 10000) / 10000,
        totalRequests,
        avgCostPerRequest: Math.round(avgCostPerRequest * 10000) / 10000,
        totalTokens,
        providerBreakdown
      },
      filters: {
        startDate: startDate || subDays(new Date(), 30).toISOString(),
        endDate: endDate || new Date().toISOString(),
        provider: provider || 'all'
      }
    })

  } catch (error) {
    console.error('Error fetching usage logs detail:', error)
    return NextResponse.json({
      error: 'Failed to fetch usage logs detail'
    }, { status: 500 })
  }
}