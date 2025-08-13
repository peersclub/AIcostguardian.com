import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET - Fetch organization members
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

    // Check permissions
    if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Fetch organization members with usage data
    const members = await prisma.user.findMany({
      where: { organizationId: user.organizationId! },
      include: {
        usageLogs: {
          select: {
            cost: true,
            totalTokens: true,
            timestamp: true
          }
        }
      }
    })

    // Calculate usage stats for each member
    const membersWithStats = members.map(member => {
      const totalCost = member.usageLogs.reduce((sum, log) => sum + log.cost, 0)
      const totalTokens = member.usageLogs.reduce((sum, log) => sum + log.totalTokens, 0)
      const lastUsed = member.usageLogs.length > 0 
        ? member.usageLogs[0].timestamp 
        : null

      return {
        id: member.id,
        email: member.email,
        name: member.name,
        role: member.role,
        department: member.department,
        jobTitle: member.jobTitle,
        lastActiveAt: member.lastActiveAt,
        createdAt: member.createdAt,
        invitedBy: member.invitedBy,
        acceptedAt: member.acceptedAt,
        usage: {
          totalCost,
          totalTokens,
          lastUsed
        }
      }
    })

    return NextResponse.json({ members: membersWithStats })
  } catch (error) {
    console.error('Failed to fetch members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}