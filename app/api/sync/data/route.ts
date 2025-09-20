import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { subDays } from 'date-fns'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { timeframe } = await request.json()

    // Get user and organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'User or organization not found' }, { status: 404 })
    }

    // Calculate date range based on timeframe
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

    let syncedItems = 0
    let warnings = []

    // 1. Sync usage logs with departments (assign department to logs based on user's current department)
    const logsWithoutDepartment = await prisma.usageLog.findMany({
      where: {
        organizationId: user.organizationId,
        departmentId: null,
        timestamp: { gte: startDate },
        user: {
          departmentId: { not: null }
        }
      },
      include: {
        user: {
          select: { departmentId: true }
        }
      }
    })

    for (const log of logsWithoutDepartment) {
      if (log.user.departmentId) {
        await prisma.usageLog.update({
          where: { id: log.id },
          data: { departmentId: log.user.departmentId }
        })
        syncedItems++
      }
    }

    // 2. Update budget spending amounts based on actual usage
    const departments = await prisma.department.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true
      },
      include: {
        budgets: {
          where: { isActive: true, period: 'MONTHLY' }
        },
        usageLogs: {
          where: {
            timestamp: { gte: startDate }
          }
        }
      }
    })

    for (const dept of departments) {
      const actualSpend = dept.usageLogs.reduce((sum, log) => sum + log.cost, 0)

      if (dept.budgets.length > 0) {
        const budget = dept.budgets[0]
        await prisma.budget.update({
          where: { id: budget.id },
          data: { spent: actualSpend }
        })
        syncedItems++
      }
    }

    // 3. Update user last active timestamps based on recent usage
    const recentUserActivity = await prisma.usageLog.groupBy({
      by: ['userId'],
      where: {
        organizationId: user.organizationId,
        timestamp: { gte: subDays(now, 1) } // Last 24 hours
      },
      _max: {
        timestamp: true
      }
    })

    for (const activity of recentUserActivity) {
      if (activity._max.timestamp) {
        await prisma.user.update({
          where: { id: activity.userId },
          data: { lastActiveAt: activity._max.timestamp }
        })
        syncedItems++
      }
    }

    // 4. Check for any data inconsistencies
    const inconsistentLogs = await prisma.usageLog.count({
      where: {
        organizationId: user.organizationId,
        OR: [
          { cost: { lt: 0 } },
          { totalTokens: { lt: 0 } },
          { promptTokens: { lt: 0 } },
          { completionTokens: { lt: 0 } }
        ]
      }
    })

    if (inconsistentLogs > 0) {
      warnings.push(`Found ${inconsistentLogs} usage logs with negative values`)
    }

    // 5. Check for users without departments
    const usersWithoutDepartment = await prisma.user.count({
      where: {
        organizationId: user.organizationId,
        departmentId: null
      }
    })

    if (usersWithoutDepartment > 0) {
      warnings.push(`${usersWithoutDepartment} users are not assigned to any department`)
    }

    // 6. Check for budgets that are over their limits
    const overBudgetDepts = departments.filter(dept => {
      if (dept.budgets.length === 0) return false
      const actualSpend = dept.usageLogs.reduce((sum, log) => sum + log.cost, 0)
      return actualSpend > dept.budgets[0].amount
    })

    if (overBudgetDepts.length > 0) {
      warnings.push(`${overBudgetDepts.length} departments are over budget`)
    }

    // Prepare response message
    let message = `Synchronized ${syncedItems} data points.`
    if (warnings.length > 0) {
      message += ` Warnings: ${warnings.join(', ')}`
    }

    return NextResponse.json({
      success: true,
      message,
      syncedItems,
      warnings,
      timestamp: new Date().toISOString(),
      stats: {
        usageLogsLinked: logsWithoutDepartment.length,
        budgetsUpdated: departments.length,
        userActivityUpdated: recentUserActivity.length,
        inconsistentLogs,
        usersWithoutDepartment,
        overBudgetDepartments: overBudgetDepts.length
      }
    })

  } catch (error) {
    console.error('Data sync failed:', error)
    return NextResponse.json({
      error: 'Data synchronization failed',
      details: (error as Error).message
    }, { status: 500 })
  }
}