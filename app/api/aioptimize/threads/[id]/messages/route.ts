import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const threadId = params.id
    
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

    // Verify thread ownership
    const thread = await prisma.thread.findUnique({
      where: {
        id: threadId,
        userId: user.id,
      },
    })

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    // Get messages for the thread
    const messages = await prisma.message.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Failed to fetch thread messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}