import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const drafts = await prisma.messageDraft.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        thread: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    return NextResponse.json({ drafts })
  } catch (error) {
    console.error('Error fetching drafts:', error)
    return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content, threadId, selectedModel, selectedProvider, reminderAt } = body

    // Check if draft already exists for this thread
    let existingDraft = null
    if (threadId) {
      existingDraft = await prisma.messageDraft.findFirst({
        where: {
          userId: session.user.id,
          threadId: threadId
        }
      })
    }

    let draft
    if (existingDraft) {
      // Update existing draft
      draft = await prisma.messageDraft.update({
        where: {
          id: existingDraft.id
        },
        data: {
          content,
          selectedModel,
          selectedProvider,
          reminderAt: reminderAt ? new Date(reminderAt) : null,
          isReminded: false
        }
      })
    } else {
      // Create new draft
      draft = await prisma.messageDraft.create({
        data: {
          userId: session.user.id,
          threadId,
          content,
          selectedModel,
          selectedProvider,
          reminderAt: reminderAt ? new Date(reminderAt) : null
        }
      })
    }

    return NextResponse.json({ draft })
  } catch (error) {
    console.error('Error saving draft:', error)
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const draftId = searchParams.get('id')

    if (!draftId) {
      return NextResponse.json({ error: 'Draft ID required' }, { status: 400 })
    }

    await prisma.messageDraft.delete({
      where: {
        id: draftId,
        userId: session.user.id // Ensure user can only delete their own drafts
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting draft:', error)
    return NextResponse.json({ error: 'Failed to delete draft' }, { status: 500 })
  }
}