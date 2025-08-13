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

    // Check if user is super admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isSuperAdmin: true }
    })

    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get organization stats
    const [
      totalOrgs,
      activeOrgs,
      totalUsers,
      organizations,
      lastMonthOrgs
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.organization.findMany({
        select: {
          monthlySpend: true,
          _count: {
            select: { users: true }
          }
        }
      }),
      prisma.organization.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    // Calculate stats
    const totalRevenue = organizations.reduce((sum, org) => sum + org.monthlySpend, 0)
    const avgOrgSize = totalUsers / (totalOrgs || 1)
    const monthlyGrowth = lastMonthOrgs > 0 ? Math.round((lastMonthOrgs / (totalOrgs || 1)) * 100) : 0

    return NextResponse.json({
      totalOrgs,
      activeOrgs,
      totalUsers,
      totalRevenue,
      avgOrgSize: Math.round(avgOrgSize),
      monthlyGrowth
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}