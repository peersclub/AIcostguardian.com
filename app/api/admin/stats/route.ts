import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Fetch system statistics
    const [
      totalUsers,
      totalOrganizations,
      totalApiKeys,
      activeUsersCount,
      monthlyUsageLogs,
      todayUsageLogs,
      totalAlerts
    ] = await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.apiKey.count(),
      prisma.user.count({
        where: {
          usage: {
            some: {
              timestamp: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Active in last 7 days
              }
            }
          }
        }
      }),
      prisma.usageLog.findMany({
        where: {
          timestamp: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.usageLog.findMany({
        where: {
          timestamp: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.alert.count({
        where: {
          isActive: true
        }
      })
    ])

    // Calculate revenue (sum of all usage costs this month)
    const totalRevenue = monthlyUsageLogs.reduce((sum, log) => sum + log.cost, 0)
    const monthlyUsage = monthlyUsageLogs.reduce((sum, log) => sum + log.totalTokens, 0)
    const apiCallsToday = todayUsageLogs.length
    
    // Calculate error rate
    const errorLogs = todayUsageLogs.filter(log => 
      log.metadata && typeof log.metadata === 'object' && 'error' in log.metadata
    )
    const errorRate = apiCallsToday > 0 
      ? Math.round((errorLogs.length / apiCallsToday) * 100 * 10) / 10 
      : 0

    // Determine system health
    let systemHealth: 'healthy' | 'degraded' | 'critical' = 'healthy'
    if (errorRate > 5) systemHealth = 'critical'
    else if (errorRate > 2 || totalAlerts > 10) systemHealth = 'degraded'

    // Get database size (mock for now, would need admin access to get real size)
    const databaseSize = '2.3 GB'

    return NextResponse.json({
      totalUsers,
      totalOrganizations,
      totalApiKeys,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      activeUsers: activeUsersCount,
      monthlyUsage,
      systemHealth,
      databaseSize,
      apiCallsToday,
      errorRate
    })

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}