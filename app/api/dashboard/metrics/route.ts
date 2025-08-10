import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { startOfMonth, startOfWeek, startOfDay, subDays, subMonths } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30d'
    
    // Get user and organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (timeframe) {
      case '7d':
        startDate = subDays(now, 7)
        break
      case '30d':
        startDate = subDays(now, 30)
        break
      case '90d':
        startDate = subDays(now, 90)
        break
      case 'mtd':
        startDate = startOfMonth(now)
        break
      default:
        startDate = subDays(now, 30)
    }

    // Get usage data
    const usageLogs = await prisma.usageLog.findMany({
      where: {
        organizationId: user.organizationId,
        timestamp: {
          gte: startDate
        }
      }
    })

    // Get budget data
    const budgets = await prisma.budget.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true
      }
    })

    // Get organization data
    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      include: {
        users: true,
        apiKeys: true
      }
    })

    // Calculate metrics
    const totalSpend = usageLogs.reduce((sum, log) => sum + log.cost, 0)
    const totalRequests = usageLogs.length
    const avgCostPerRequest = totalRequests > 0 ? totalSpend / totalRequests : 0

    // Calculate provider breakdown
    const providerBreakdown = usageLogs.reduce((acc, log) => {
      if (!acc[log.provider]) {
        acc[log.provider] = {
          spend: 0,
          requests: 0,
          tokens: 0
        }
      }
      acc[log.provider].spend += log.cost
      acc[log.provider].requests += 1
      acc[log.provider].tokens += log.totalTokens
      return acc
    }, {} as Record<string, any>)

    // Calculate budget utilization
    const monthlyBudget = budgets.find(b => b.period === 'MONTHLY')
    const budgetUtilization = monthlyBudget 
      ? (totalSpend / monthlyBudget.amount) * 100 
      : 0

    // Calculate team metrics
    const activeUsers = await prisma.user.count({
      where: {
        organizationId: user.organizationId,
        usage: {
          some: {
            timestamp: {
              gte: startDate
            }
          }
        }
      }
    })

    // Calculate trends (compare with previous period)
    const previousStartDate = subDays(startDate, 
      timeframe === '7d' ? 7 : 
      timeframe === '30d' ? 30 : 
      timeframe === '90d' ? 90 : 30
    )

    const previousUsageLogs = await prisma.usageLog.findMany({
      where: {
        organizationId: user.organizationId,
        timestamp: {
          gte: previousStartDate,
          lt: startDate
        }
      }
    })

    const previousSpend = previousUsageLogs.reduce((sum, log) => sum + log.cost, 0)
    const spendGrowth = previousSpend > 0 
      ? ((totalSpend - previousSpend) / previousSpend) * 100 
      : 0

    // Get recent alerts
    const alerts = await prisma.alert.findMany({
      where: {
        userId: user.id,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    // Prepare provider metrics
    const providers = Object.entries(providerBreakdown).map(([provider, data]: [string, any]) => ({
      id: provider.toLowerCase(),
      name: provider,
      spend: Math.round(data.spend * 100) / 100,
      share: Math.round((data.spend / totalSpend) * 1000) / 10,
      requests: data.requests,
      tokens: data.tokens,
      avgCost: Math.round((data.spend / data.requests) * 10000) / 10000,
      trend: spendGrowth > 0 ? 'up' : 'down',
      change: Math.round(Math.random() * 20 - 10), // TODO: Calculate real change
      status: data.spend > 1000 ? 'optimal' : 'good'
    }))

    // Prepare executive metrics
    const executiveMetrics = {
      totalSpend: Math.round(totalSpend * 100) / 100,
      monthlyBudget: monthlyBudget?.amount || 0,
      budgetUtilization: Math.round(budgetUtilization * 10) / 10,
      costPerEmployee: organization?.users.length 
        ? Math.round((totalSpend / organization.users.length) * 100) / 100 
        : 0,
      efficiency: 94.2, // TODO: Calculate real efficiency
      riskScore: alerts.length * 10,
      forecastAccuracy: 87.3, // TODO: Implement forecasting
      complianceScore: 98.5, // TODO: Implement compliance scoring
      monthlyGrowth: Math.round(spendGrowth * 10) / 10,
      quarterlyTrend: 8.3, // TODO: Calculate quarterly trend
      avgCostPerRequest: Math.round(avgCostPerRequest * 10000) / 10000,
      peakHourMultiplier: 1.34 // TODO: Calculate peak hour costs
    }

    // Prepare team metrics
    const teamMetrics = {
      totalUsers: organization?.users.length || 0,
      activeUsers,
      powerUsers: Math.floor(activeUsers * 0.12), // Top 12% as power users
      avgUsagePerUser: activeUsers > 0 
        ? Math.round((totalSpend / activeUsers) * 100) / 100 
        : 0,
      topDepartments: [] // TODO: Implement department tracking
    }

    // Prepare forecast data
    const forecastData = [
      { 
        period: 'Next Week', 
        spend: Math.round(totalSpend * 0.25 * 100) / 100,
        confidence: 94, 
        status: 'on-track' 
      },
      { 
        period: 'Next Month', 
        spend: Math.round(totalSpend * 1.1 * 100) / 100,
        confidence: 87, 
        status: budgetUtilization > 80 ? 'over-budget' : 'on-track'
      },
      { 
        period: 'Next Quarter', 
        spend: Math.round(totalSpend * 3.2 * 100) / 100,
        confidence: 73, 
        status: 'on-track' 
      }
    ]

    // Prepare business insights
    const businessInsights = []
    
    // Add budget alert if needed
    if (budgetUtilization > 80) {
      businessInsights.push({
        type: 'alert',
        priority: 'urgent',
        title: 'Budget Threshold Alert',
        description: `On track to exceed monthly budget by ${Math.round(budgetUtilization - 100)}% at current usage rate`,
        impact: `$${Math.round((totalSpend - (monthlyBudget?.amount || 0)) * 100) / 100} overrun`,
        action: 'Review and adjust',
        confidence: 94,
        timeframe: 'Immediate',
        category: 'budget'
      })
    }

    // Add provider concentration risk if applicable
    const topProvider = providers[0]
    if (topProvider && topProvider.share > 60) {
      businessInsights.push({
        type: 'risk',
        priority: 'medium',
        title: 'Vendor Concentration Risk',
        description: `${topProvider.share}% of spend concentrated in ${topProvider.name}. Consider diversification`,
        impact: 'Business continuity risk',
        action: 'Diversify providers',
        confidence: 76,
        timeframe: '1-2 months',
        category: 'risk-management'
      })
    }

    return NextResponse.json({
      executiveMetrics,
      providers,
      teamMetrics,
      forecastData,
      businessInsights,
      alerts: alerts.map(a => ({
        id: a.id,
        type: a.type,
        message: a.message,
        threshold: a.threshold,
        createdAt: a.createdAt
      }))
    })

  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard metrics' 
    }, { status: 500 })
  }
}