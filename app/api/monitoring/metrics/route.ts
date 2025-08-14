import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '24h'

    // Return mock monitoring metrics
    // In production, these would come from your actual monitoring system
    const metrics = {
      currentLoad: Math.random() * 100,
      avgResponseTime: Math.floor(Math.random() * 200 + 50),
      errorRate: Math.random() * 5,
      uptime: 99.5 + Math.random() * 0.5,
      activeAlerts: Math.floor(Math.random() * 5),
      totalRequests: Math.floor(Math.random() * 10000),
      totalCost: Math.random() * 1000,
      costTrend: (Math.random() - 0.5) * 20,
      timeframe,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching monitoring metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monitoring metrics' },
      { status: 500 }
    )
  }
}