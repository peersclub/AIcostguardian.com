import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user and their organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Get organization statistics
    const [
      totalMembers,
      activeMembers,
      pendingInvites,
      usageLogs
    ] = await Promise.all([
      // Total members
      prisma.user.count({
        where: { organizationId: user.organizationId! }
      }),
      // Active members (logged in within last 30 days)
      prisma.user.count({
        where: {
          organizationId: user.organizationId!,
          lastActiveAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      // Pending invitations
      prisma.invitation.count({
        where: {
          organizationId: user.organizationId!,
          acceptedAt: null,
          expiresAt: {
            gt: new Date()
          }
        }
      }),
      // Usage logs for spend calculation
      prisma.usageLog.findMany({
        where: {
          organizationId: user.organizationId!,
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          cost: true
        }
      })
    ])

    // Calculate total spend
    const totalSpend = usageLogs.reduce((sum, log) => sum + log.cost, 0)
    const avgSpendPerUser = totalMembers > 0 ? totalSpend / totalMembers : 0

    return NextResponse.json({
      totalMembers,
      activeMembers,
      pendingInvites,
      totalSpend,
      avgSpendPerUser,
      memberLimit: user.organization.maxUsers
    })
  } catch (error) {
    console.error('Failed to fetch organization stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organization stats' },
      { status: 500 }
    )
  }
}