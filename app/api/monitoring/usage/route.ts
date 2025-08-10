import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { usageMonitor } from '@/lib/services/usage-monitor'
import prisma from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const provider = searchParams.get('provider')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const realTime = searchParams.get('realTime') === 'true'

    // Default to last 24 hours if no dates provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    if (realTime) {
      // Get real-time usage data from all providers
      const aggregatedUsage = await usageMonitor.getAggregatedUsage(start, end)
      return NextResponse.json(aggregatedUsage)
    }

    if (provider) {
      // Get usage for specific provider
      let usageData = []
      switch (provider.toUpperCase()) {
        case 'OPENAI':
          usageData = await usageMonitor.fetchOpenAIUsage(start, end)
          break
        case 'ANTHROPIC':
          usageData = await usageMonitor.fetchAnthropicUsage(start, end)
          break
        case 'GOOGLE_GEMINI':
          usageData = await usageMonitor.fetchGeminiUsage(start, end)
          break
        case 'GROK':
          usageData = await usageMonitor.fetchGrokUsage(start, end)
          break
        default:
          return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
      }
      return NextResponse.json(usageData)
    }

    // Get aggregated usage from all providers
    const aggregatedUsage = await usageMonitor.getAggregatedUsage(start, end)
    return NextResponse.json(aggregatedUsage)

  } catch (error: any) {
    console.error('Error fetching usage data:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch usage data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const usageData = await request.json()

    // Validate usage data
    if (!usageData.provider || !usageData.timestamp) {
      return NextResponse.json(
        { error: 'Invalid usage data: provider and timestamp are required' },
        { status: 400 }
      )
    }

    // Store usage data in database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create usage record in database
    const usageRecord = await prisma.usage.create({
      data: {
        userId: user.id,
        provider: usageData.provider,
        model: usageData.model || 'unknown',
        inputTokens: usageData.inputTokens || 0,
        outputTokens: usageData.outputTokens || 0,
        totalTokens: usageData.totalTokens || 0,
        cost: usageData.cost || 0,
        requestId: usageData.requestId,
        timestamp: new Date(usageData.timestamp),
        metadata: usageData.metadata || {}
      }
    })

    // Track in usage monitor
    await usageMonitor.trackUsage({
      ...usageData,
      userId: user.id,
      timestamp: new Date(usageData.timestamp)
    })

    return NextResponse.json({ 
      success: true, 
      id: usageRecord.id 
    })

  } catch (error: any) {
    console.error('Error storing usage data:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to store usage data' },
      { status: 500 }
    )
  }
}