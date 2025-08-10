import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Fetch all users with stats
    const users = await prisma.user.findMany({
      include: {
        organization: true,
        usage: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 1
        },
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
    const transformedUsers = users.map(user => {
      const totalSpend = user.usageLogs.reduce((sum, log) => sum + log.cost, 0)
      const apiCalls = user.usageLogs.length
      
      // Determine status based on activity
      const lastActive = user.usage[0]?.timestamp || user.updatedAt
      const daysSinceActive = Math.floor((Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24))
      
      let status: 'active' | 'inactive' | 'suspended' = 'active'
      if (daysSinceActive > 30) status = 'inactive'
      // You could add logic to check for suspended status
      
      return {
        id: user.id,
        email: user.email,
        name: user.name || 'No name',
        role: user.role,
        organizationId: user.organizationId || '',
        organizationName: user.organization?.name || 'No organization',
        lastActive: lastActive.toISOString(),
        apiCalls,
        totalSpend: Math.round(totalSpend * 100) / 100,
        status
      }
    })

    return NextResponse.json(transformedUsers)

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}