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
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json({ 
        breakdown: [],
        totalCost: 0,
        totalTokens: 0
      })
    }

    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    // Get usage breakdown by provider
    const usageLogs = await prisma.usageLog.findMany({
      where: {
        organizationId: user.organization.id,
        timestamp: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    })

    // Aggregate by provider and model
    const providerMap = new Map<string, {
      provider: string
      models: Map<string, { cost: number; tokens: number; requests: number }>
      totalCost: number
      totalTokens: number
      totalRequests: number
    }>()

    for (const log of usageLogs) {
      if (!providerMap.has(log.provider)) {
        providerMap.set(log.provider, {
          provider: log.provider,
          models: new Map(),
          totalCost: 0,
          totalTokens: 0,
          totalRequests: 0
        })
      }

      const providerData = providerMap.get(log.provider)!
      
      if (!providerData.models.has(log.model)) {
        providerData.models.set(log.model, {
          cost: 0,
          tokens: 0,
          requests: 0
        })
      }

      const modelData = providerData.models.get(log.model)!
      modelData.cost += log.cost
      modelData.tokens += log.totalTokens
      modelData.requests += 1

      providerData.totalCost += log.cost
      providerData.totalTokens += log.totalTokens
      providerData.totalRequests += 1
    }

    // Calculate total cost
    const totalCost = Array.from(providerMap.values()).reduce((sum, p) => sum + p.totalCost, 0)
    const totalTokens = Array.from(providerMap.values()).reduce((sum, p) => sum + p.totalTokens, 0)

    // Convert to array format
    const breakdown = Array.from(providerMap.values()).map(provider => ({
      provider: provider.provider,
      cost: provider.totalCost,
      tokens: provider.totalTokens,
      requests: provider.totalRequests,
      percentage: totalCost > 0 ? (provider.totalCost / totalCost) * 100 : 0,
      models: Array.from(provider.models.entries()).map(([model, data]) => ({
        model,
        cost: data.cost,
        tokens: data.tokens,
        requests: data.requests
      }))
    })).sort((a, b) => b.cost - a.cost)

    return NextResponse.json({
      breakdown,
      totalCost,
      totalTokens,
      period: {
        start: monthStart.toISOString(),
        end: monthEnd.toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching usage breakdown:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage breakdown' },
      { status: 500 }
    )
  }
}