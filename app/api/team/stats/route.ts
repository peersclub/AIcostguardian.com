import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
// Mock data store (in production, use a database)
const teamStats = new Map<string, any>()

// Initialize with sample data
teamStats.set('default', {
  totalMembers: 4,
  activeMembers: 3,
  pendingMembers: 1,
  totalApiCalls: 2598,
  totalCost: 96.73,
  monthlyGrowth: 15.2,
  topUsers: [
    { name: 'John Smith', calls: 1250, cost: 45.67 },
    { name: 'Sarah Johnson', calls: 892, cost: 32.14 },
    { name: 'Mike Chen', calls: 456, cost: 18.92 }
  ],
  usageByRole: {
    admin: { calls: 1250, cost: 45.67 },
    manager: { calls: 892, cost: 32.14 },
    member: { calls: 456, cost: 18.92 }
  },
  activityTrend: [
    { date: '2025-08-01', calls: 45, cost: 2.34 },
    { date: '2025-08-02', calls: 67, cost: 3.12 },
    { date: '2025-08-03', calls: 89, cost: 4.56 },
    { date: '2025-08-04', calls: 123, cost: 6.78 },
    { date: '2025-08-05', calls: 156, cost: 8.90 },
    { date: '2025-08-06', calls: 134, cost: 7.23 },
    { date: '2025-08-07', calls: 178, cost: 9.45 }
  ]
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userCompany = session.user.company || 'default'
    const stats = teamStats.get(userCompany) || {
      totalMembers: 0,
      activeMembers: 0,
      pendingMembers: 0,
      totalApiCalls: 0,
      totalCost: 0,
      monthlyGrowth: 0,
      topUsers: [],
      usageByRole: {},
      activityTrend: []
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching team stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}