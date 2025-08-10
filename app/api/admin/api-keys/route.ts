import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

    // Fetch all API keys with user and organization info
    const apiKeys = await prisma.apiKey.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        },
        organization: {
          select: {
            name: true,
            domain: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data for frontend (never send encrypted keys)
    const transformedKeys = apiKeys.map(key => ({
      id: key.id,
      provider: key.provider,
      userId: key.userId,
      userEmail: key.user.email,
      userName: key.user.name,
      organizationId: key.organizationId,
      organizationName: key.organization?.name || 'No organization',
      isActive: key.isActive,
      lastUsed: key.lastUsed?.toISOString() || null,
      createdAt: key.createdAt.toISOString()
    }))

    return NextResponse.json(transformedKeys)

  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}