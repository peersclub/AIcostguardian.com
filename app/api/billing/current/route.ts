import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { startOfMonth, endOfMonth } from 'date-fns'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        organization: {
          include: {
            users: true,
            budgets: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    if (!user?.organization) {
      return NextResponse.json({ 
        plan: 'free',
        status: 'active',
        currentUsage: 0,
        limit: 1000,
        nextBillingDate: null,
        cancelAtPeriodEnd: false
      })
    }

    const org = user.organization
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    // Get current month's usage
    const currentUsage = await prisma.usageLog.aggregate({
      where: {
        organizationId: org.id,
        timestamp: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      _sum: {
        cost: true,
        totalTokens: true
      },
      _count: true
    })

    // Calculate plan limits
    const planLimits = {
      FREE: { apiCalls: 1000, cost: 10 },
      STARTER: { apiCalls: 10000, cost: 100 },
      GROWTH: { apiCalls: 25000, cost: 250 },
      SCALE: { apiCalls: 50000, cost: 500 },
      ENTERPRISE: { apiCalls: -1, cost: -1 }
    }

    const plan = org.subscription || 'FREE'
    const limits = planLimits[plan as keyof typeof planLimits] || planLimits.FREE

    // Calculate next billing date (first of next month)
    const nextBillingDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    // Get monthly budget if set
    const monthlyBudget = org.budgets.find(b => b.period === 'MONTHLY')

    return NextResponse.json({
      plan: plan.toLowerCase(),
      status: 'active',
      currentUsage: currentUsage._sum.cost || 0,
      currentApiCalls: currentUsage._count || 0,
      limit: monthlyBudget ? monthlyBudget.amount : limits.cost,
      apiCallLimit: limits.apiCalls,
      usagePercentage: limits.cost > 0 ? ((currentUsage._sum.cost || 0) / limits.cost) * 100 : 0,
      nextBillingDate: nextBillingDate.toISOString(),
      cancelAtPeriodEnd: false,
      teamMembers: org.users.length,
      organization: {
        id: org.id,
        name: org.name,
        createdAt: org.createdAt
      },
      billing: {
        amount: plan === 'FREE' ? 0 : 
                plan === 'STARTER' ? 29 :
                plan === 'GROWTH' ? 59 :
                plan === 'SCALE' ? 99 :
                plan === 'ENTERPRISE' ? 299 : 0,
        currency: 'USD',
        interval: 'monthly'
      }
    })
  } catch (error) {
    console.error('Error fetching current billing:', error)
    return NextResponse.json(
      { error: 'Failed to fetch current billing' },
      { status: 500 }
    )
  }
}