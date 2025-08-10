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

    return NextResponse.json({ 
      isAdmin: true,
      userId: user.id,
      email: user.email
    })

  } catch (error) {
    console.error('Error verifying admin access:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}