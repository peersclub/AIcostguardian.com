import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || '7d'
    const limit = parseInt(searchParams.get('limit') || '10')

    // Mock usage data for Grok
    const mockUsage = {
      totalCalls: 45,
      totalTokens: 12500,
      totalCost: 0.0625,
      thisMonth: { calls: 45, tokens: 12500, cost: 0.0625 },
      thisWeek: { calls: 32, tokens: 8960, cost: 0.0448 },
      today: { calls: 8, tokens: 2240, cost: 0.0112 },
      recentCalls: Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
        id: `grok-${Date.now()}-${i}`,
        userId: session.user.id,
        provider: 'grok',
        model: i % 2 === 0 ? 'grok-beta' : 'grok-vision-beta',
        inputTokens: 50 + Math.floor(Math.random() * 100),
        outputTokens: 30 + Math.floor(Math.random() * 50),
        totalTokens: 80 + Math.floor(Math.random() * 150),
        inputCost: 0.0025 + Math.random() * 0.005,
        outputCost: 0.0045 + Math.random() * 0.0075,
        totalCost: 0.007 + Math.random() * 0.0125,
        timestamp: new Date(Date.now() - i * 3600000 - Math.random() * 3600000).toISOString(),
        requestId: `req_grok_${Date.now()}_${i}`,
        prompt: 'Test prompt for Grok API validation',
        response: 'API key is working!'
      }))
    }

    return NextResponse.json(mockUsage)
  } catch (error) {
    console.error('Error fetching Grok usage:', error)
    return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 })
  }
}