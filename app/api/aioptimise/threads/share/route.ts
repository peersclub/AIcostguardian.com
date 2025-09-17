import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { randomBytes } from 'crypto'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// POST /api/aioptimise/threads/share
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { threadId } = await request.json()

    // Generate a unique share token
    const shareToken = randomBytes(16).toString('hex')
    
    // In production, you would:
    // 1. Verify the user owns the thread
    // 2. Store the share token in database
    // 3. Set expiration if needed
    
    // For now, return a mock share URL
    const shareUrl = `${process.env.NEXTAUTH_URL || 'https://aicostguardian.com'}/aioptimise/shared/${shareToken}`

    return NextResponse.json({ 
      shareUrl,
      shareToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })
  } catch (error) {
    console.error('Share error:', error)
    return NextResponse.json(
      { error: 'Failed to share thread' },
      { status: 500 }
    )
  }
}