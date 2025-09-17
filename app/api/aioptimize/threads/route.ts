import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const createThreadSchema = z.object({
  title: z.string().min(1),
  model: z.string().optional(),
  provider: z.string().optional(),
})

export async function GET(request: NextRequest) {
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

    const threads = await prisma.thread.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    const transformedThreads = threads.map(thread => ({
      id: thread.id,
      title: thread.title,
      createdAt: thread.createdAt.toISOString(),
      updatedAt: thread.updatedAt.toISOString(),
      messageCount: thread.messages?.length || 0,
      lastMessage: thread.messages[0]?.content?.substring(0, 100) || '',
      isPinned: false,
      isArchived: false,
      sharedWith: [],
      tags: [],
      model: null,
      provider: null
    }))

    return NextResponse.json({ threads: transformedThreads })
  } catch (error) {
    console.error('Failed to fetch threads:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const validatedData = createThreadSchema.parse(body)

    const thread = await prisma.thread.create({
      data: {
        title: validatedData.title,
        userId: user.id
      }
    })

    const transformedThread = {
      id: thread.id,
      title: thread.title,
      createdAt: thread.createdAt.toISOString(),
      updatedAt: thread.updatedAt.toISOString(),
      messageCount: 0,
      lastMessage: '',
      isPinned: false,
      isArchived: false,
      sharedWith: [],
      tags: [],
      model: null,
      provider: null
    }

    return NextResponse.json(transformedThread)
  } catch (error) {
    console.error('Failed to create thread:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}