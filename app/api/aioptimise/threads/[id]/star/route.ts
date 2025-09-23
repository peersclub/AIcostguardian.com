import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const threadId = params.id

    // Verify thread exists and user has access
    const thread = await prisma.aIThread.findFirst({
      where: {
        id: threadId,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      }
    })

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    // Check if already starred
    const existingStar = await prisma.userStarredThread.findUnique({
      where: {
        userId_threadId: {
          userId: session.user.id,
          threadId: threadId
        }
      }
    })

    if (existingStar) {
      return NextResponse.json({ error: 'Thread already starred' }, { status: 400 })
    }

    // Create star
    await prisma.userStarredThread.create({
      data: {
        userId: session.user.id,
        threadId: threadId
      }
    })

    // Update thread isStarred field for this user's perspective
    await prisma.aIThread.update({
      where: { id: threadId },
      data: { isStarred: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error starring thread:', error)
    return NextResponse.json({ error: 'Failed to star thread' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const threadId = params.id

    // Remove star
    await prisma.userStarredThread.delete({
      where: {
        userId_threadId: {
          userId: session.user.id,
          threadId: threadId
        }
      }
    })

    // Check if any other users have starred this thread
    const otherStars = await prisma.userStarredThread.findFirst({
      where: {
        threadId: threadId,
        userId: { not: session.user.id }
      }
    })

    // Update thread isStarred field only if no other users have starred it
    if (!otherStars) {
      await prisma.aIThread.update({
        where: { id: threadId },
        data: { isStarred: false }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unstarring thread:', error)
    return NextResponse.json({ error: 'Failed to unstar thread' }, { status: 500 })
  }
}