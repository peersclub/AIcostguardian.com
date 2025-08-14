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

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user?.organizationId) {
      // Return default stats if no organization
      return NextResponse.json({
        totalMembers: 1,
        activeMembers: 1,
        totalSpend: 0,
        monthlyBudget: 10000,
        apiKeys: 0,
        providers: 0
      })
    }

    // Get organization stats
    const [
      totalMembers,
      activeMembers,
      apiKeys,
      usageData,
      organization
    ] = await Promise.all([
      // Total members
      prisma.user.count({
        where: { organizationId: user.organizationId }
      }),
      
      // Active members (for now, all members are considered active)
      // TODO: Add lastLogin field to User model or track activity differently
      prisma.user.count({
        where: {
          organizationId: user.organizationId
        }
      }),
      
      // API keys count
      prisma.apiKey.count({
        where: {
          user: {
            organizationId: user.organizationId
          }
        }
      }),
      
      // Usage data for spend calculation
      prisma.usage.aggregate({
        where: {
          user: {
            organizationId: user.organizationId
          },
          timestamp: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) // Start of current month
          }
        },
        _sum: {
          cost: true
        }
      }),
      
      // Organization details
      prisma.organization.findUnique({
        where: { id: user.organizationId }
      })
    ])

    // Count unique providers from API keys
    const providerKeys = await prisma.apiKey.findMany({
      where: {
        user: {
          organizationId: user.organizationId
        }
      },
      select: {
        provider: true
      },
      distinct: ['provider']
    })

    return NextResponse.json({
      totalMembers,
      activeMembers,
      totalSpend: usageData._sum.cost || 0,
      monthlyBudget: 10000, // Default budget - TODO: Add to Organization model
      apiKeys,
      providers: providerKeys.length
    })
  } catch (error) {
    console.error('Error fetching organization stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organization stats' },
      { status: 500 }
    )
  }
}