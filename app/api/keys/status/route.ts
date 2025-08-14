import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { apiKeys: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has any active API keys
    const activeKeys = user.apiKeys.filter(key => key.isActive)
    const hasAnyKeys = activeKeys.length > 0

    // Group keys by provider
    const keysByProvider = activeKeys.reduce((acc: Record<string, number>, key) => {
      acc[key.provider] = (acc[key.provider] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      hasAnyKeys,
      totalKeys: activeKeys.length,
      keysByProvider,
      providers: Object.keys(keysByProvider)
    })
  } catch (error) {
    console.error('Error checking API key status:', error)
    return NextResponse.json(
      { error: 'Failed to check API key status' },
      { status: 500 }
    )
  }
}