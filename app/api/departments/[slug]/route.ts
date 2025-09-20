import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { subDays, startOfDay, endOfDay } from 'date-fns'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
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

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'User or organization not found' }, { status: 404 })
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
      default:
        startDate = subDays(now, 30)
    }

    // Get department with all related data
    const department = await prisma.department.findFirst({
      where: {
        slug: params.slug,
        organizationId: user.organizationId,
        isActive: true
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            jobTitle: true
          }
        },
        users: {
          where: {
            departmentId: { not: null }
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            jobTitle: true,
            role: true,
            createdAt: true,
            lastActiveAt: true
          }
        },
        usageLogs: {
          where: {
            timestamp: {
              gte: startDate
            }
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            timestamp: 'desc'
          }
        },
        budgets: {
          where: {
            isActive: true,
            period: 'MONTHLY'
          }
        }
      }
    })

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    // Calculate department metrics
    const totalSpend = department.usageLogs.reduce((sum, log) => sum + log.cost, 0)
    const totalRequests = department.usageLogs.length
    const totalTokens = department.usageLogs.reduce((sum, log) => sum + log.totalTokens, 0)
    const avgCostPerRequest = totalRequests > 0 ? totalSpend / totalRequests : 0

    // Budget information
    const monthlyBudget = department.budgets[0]?.amount || department.monthlyBudget || 0
    const budgetUtilization = monthlyBudget > 0 ? (totalSpend / monthlyBudget) * 100 : 0

    // User insights - spending by user
    const userSpending = department.users.map(user => {
      const userLogs = department.usageLogs.filter(log => log.userId === user.id)
      const userSpend = userLogs.reduce((sum, log) => sum + log.cost, 0)
      const userRequests = userLogs.length
      const userTokens = userLogs.reduce((sum, log) => sum + log.totalTokens, 0)

      // Get most used model and provider for this user
      const modelUsage = userLogs.reduce((acc, log) => {
        const key = `${log.provider}:${log.model}`
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const topModel = Object.entries(modelUsage)
        .sort(([,a], [,b]) => b - a)[0]

      // Get operation types from metadata
      const operations = userLogs.map(log => {
        const metadata = log.metadata as any
        return metadata?.operation || 'completion'
      }).filter(Boolean)

      const operationCounts = operations.reduce((acc, op) => {
        acc[op] = (acc[op] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const topOperation = Object.entries(operationCounts)
        .sort(([,a], [,b]) => b - a)[0]

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          jobTitle: user.jobTitle,
          role: user.role,
          lastActiveAt: user.lastActiveAt
        },
        metrics: {
          totalSpend: Math.round(userSpend * 10000) / 10000,
          totalRequests: userRequests,
          totalTokens: userTokens,
          avgCostPerRequest: userRequests > 0 ? Math.round((userSpend / userRequests) * 10000) / 10000 : 0,
          spendPercentage: totalSpend > 0 ? Math.round((userSpend / totalSpend) * 1000) / 10 : 0
        },
        insights: {
          topModel: topModel ? {
            provider: topModel[0].split(':')[0],
            model: topModel[0].split(':')[1],
            usage: topModel[1]
          } : null,
          topOperation: topOperation ? {
            type: topOperation[0],
            count: topOperation[1]
          } : null,
          recentActivity: userLogs.slice(0, 5).map(log => ({
            timestamp: log.timestamp,
            provider: log.provider,
            model: log.model,
            cost: log.cost,
            operation: (log.metadata as any)?.operation || 'completion'
          }))
        }
      }
    }).sort((a, b) => b.metrics.totalSpend - a.metrics.totalSpend)

    // Provider and model breakdown
    const providerBreakdown = department.usageLogs.reduce((acc, log) => {
      if (!acc[log.provider]) {
        acc[log.provider] = {
          requests: 0,
          spend: 0,
          tokens: 0
        }
      }
      acc[log.provider].requests += 1
      acc[log.provider].spend += log.cost
      acc[log.provider].tokens += log.totalTokens
      return acc
    }, {} as Record<string, any>)

    const modelBreakdown = department.usageLogs.reduce((acc, log) => {
      const key = `${log.provider}:${log.model}`
      if (!acc[key]) {
        acc[key] = {
          provider: log.provider,
          model: log.model,
          requests: 0,
          spend: 0,
          tokens: 0
        }
      }
      acc[key].requests += 1
      acc[key].spend += log.cost
      acc[key].tokens += log.totalTokens
      return acc
    }, {} as Record<string, any>)

    // Daily usage pattern
    const dailyUsage = []
    for (let i = 29; i >= 0; i--) {
      const date = subDays(now, i)
      const dayStart = startOfDay(date)
      const dayEnd = endOfDay(date)

      const dayLogs = department.usageLogs.filter(log =>
        log.timestamp >= dayStart && log.timestamp <= dayEnd
      )

      const daySpend = dayLogs.reduce((sum, log) => sum + log.cost, 0)
      const dayRequests = dayLogs.length

      dailyUsage.push({
        date: date.toISOString().split('T')[0],
        spend: Math.round(daySpend * 10000) / 10000,
        requests: dayRequests,
        tokens: dayLogs.reduce((sum, log) => sum + log.totalTokens, 0)
      })
    }

    // Recent activity for the department
    const recentActivity = department.usageLogs.slice(0, 50).map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      user: log.user,
      provider: log.provider,
      model: log.model,
      cost: log.cost,
      tokens: log.totalTokens,
      operation: (log.metadata as any)?.operation || 'completion',
      success: !(log.metadata as any)?.error
    }))

    return NextResponse.json({
      department: {
        id: department.id,
        name: department.name,
        slug: department.slug,
        description: department.description,
        color: department.color,
        icon: department.icon,
        manager: department.manager,
        monthlyBudget: department.monthlyBudget,
        spendingLimit: department.spendingLimit,
        userCount: department.users.length
      },
      metrics: {
        totalSpend: Math.round(totalSpend * 10000) / 10000,
        totalRequests,
        totalTokens,
        avgCostPerRequest: Math.round(avgCostPerRequest * 10000) / 10000,
        budgetUtilization: Math.round(budgetUtilization * 10) / 10,
        monthlyBudget
      },
      userInsights: userSpending,
      analytics: {
        providerBreakdown: Object.entries(providerBreakdown).map(([provider, data]) => ({
          provider,
          ...data,
          spend: Math.round(data.spend * 10000) / 10000
        })).sort((a, b) => b.spend - a.spend),
        modelBreakdown: Object.values(modelBreakdown).map((data: any) => ({
          ...data,
          spend: Math.round(data.spend * 10000) / 10000
        })).sort((a, b) => b.spend - a.spend),
        dailyUsage
      },
      recentActivity,
      timeframe
    })

  } catch (error) {
    console.error('Error fetching department details:', error)
    return NextResponse.json({
      error: 'Failed to fetch department details'
    }, { status: 500 })
  }
}