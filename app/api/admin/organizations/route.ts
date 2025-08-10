import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  // Skip during build
  if (!process.env.DATABASE_URL || process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 })
  }
  
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

    // Fetch all organizations with stats
    const organizations = await prisma.organization.findMany({
      include: {
        users: true,
        usageLogs: {
          where: {
            timestamp: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data for frontend
    const transformedOrgs = organizations.map((org: any) => {
      const monthlySpend = org.usageLogs.reduce((sum: number, log: any) => sum + log.cost, 0)
      
      // Determine status based on subscription and activity
      let status: 'active' | 'suspended' | 'trial' = 'active'
      if (org.subscription === 'FREE') status = 'trial'
      // You could add more logic here to determine suspended status
      
      return {
        id: org.id,
        name: org.name,
        domain: org.domain,
        subscription: org.subscription,
        users: org.users.length,
        monthlySpend: Math.round(monthlySpend * 100) / 100,
        spendLimit: org.spendLimit,
        createdAt: org.createdAt.toISOString(),
        status
      }
    })

    return NextResponse.json(transformedOrgs)

  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}