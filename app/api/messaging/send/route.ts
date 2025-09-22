import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface SendMessageRequest {
  recipientId?: string // For direct messages
  channelId?: string   // For channel messages
  content: string
  type?: 'TEXT' | 'FILE' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'SYSTEM' | 'NOTIFICATION'
  threadId?: string    // For threaded messages
  parentMessageId?: string // For replies
  attachments?: any[]  // File attachments
  mentions?: string[]  // User IDs mentioned
}

// POST - Send a message
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user and their organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const body: SendMessageRequest = await req.json()
    const { recipientId, channelId, content, type = 'TEXT', threadId, parentMessageId, attachments, mentions } = body

    // Validate input
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    if (!recipientId && !channelId) {
      return NextResponse.json({ error: 'Either recipientId or channelId is required' }, { status: 400 })
    }

    if (recipientId && channelId) {
      return NextResponse.json({ error: 'Cannot specify both recipientId and channelId' }, { status: 400 })
    }

    // For direct messages
    if (recipientId) {
      // Verify recipient exists and is in the same organization
      const recipient = await prisma.user.findUnique({
        where: { id: recipientId }
      })

      if (!recipient || recipient.organizationId !== user.organizationId) {
        return NextResponse.json({ error: 'Invalid recipient' }, { status: 400 })
      }

      // Create or get direct message thread
      let dmThread = await prisma.directMessageThread.findFirst({
        where: {
          OR: [
            { participant1Id: user.id, participant2Id: recipientId },
            { participant1Id: recipientId, participant2Id: user.id }
          ],
          organizationId: user.organizationId!
        }
      })

      if (!dmThread) {
        dmThread = await prisma.directMessageThread.create({
          data: {
            participant1Id: user.id,
            participant2Id: recipientId,
            organizationId: user.organizationId!
          }
        })
      }

      // Create the message
      const message = await prisma.messagingMessage.create({
        data: {
          senderId: user.id,
          recipientId,
          content: content.trim(),
          type,
          threadId,
          parentMessageId,
          attachments: attachments ? JSON.stringify(attachments) : undefined,
          mentions: mentions || []
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          recipient: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      })

      // Update DM thread metadata
      await prisma.directMessageThread.update({
        where: { id: dmThread.id },
        data: {
          lastMessageAt: new Date(),
          messageCount: { increment: 1 },
          // Update unread count for recipient
          ...(dmThread.participant1Id === recipientId
            ? { participant1UnreadCount: { increment: 1 } }
            : { participant2UnreadCount: { increment: 1 } }
          )
        }
      })

      // Create delivery status record
      await prisma.messageDeliveryStatus.create({
        data: {
          messageId: message.id,
          userId: recipientId,
          status: 'SENT'
        }
      })

      return NextResponse.json({
        message: {
          ...message,
          dmThreadId: dmThread.id
        }
      })
    }

    // For channel messages
    if (channelId) {
      // Verify channel exists and user is a member
      const channelMember = await prisma.channelMember.findUnique({
        where: {
          channelId_userId: {
            channelId,
            userId: user.id
          }
        },
        include: {
          channel: {
            include: {
              organization: true
            }
          }
        }
      })

      if (!channelMember || channelMember.channel.organizationId !== user.organizationId) {
        return NextResponse.json({ error: 'Channel not found or access denied' }, { status: 403 })
      }

      // Create the message
      const message = await prisma.messagingMessage.create({
        data: {
          senderId: user.id,
          channelId,
          content: content.trim(),
          type,
          threadId,
          parentMessageId,
          attachments: attachments ? JSON.stringify(attachments) : undefined,
          mentions: mentions || []
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          channel: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      })

      // Update channel metadata
      await prisma.messagingChannel.update({
        where: { id: channelId },
        data: {
          lastMessageAt: new Date(),
          messageCount: { increment: 1 }
        }
      })

      // Update unread counts for all channel members except sender
      await prisma.channelMember.updateMany({
        where: {
          channelId,
          userId: { not: user.id }
        },
        data: {
          unreadCount: { increment: 1 }
        }
      })

      // Create delivery status records for all channel members
      const channelMembers = await prisma.channelMember.findMany({
        where: { channelId },
        select: { userId: true }
      })

      await prisma.messageDeliveryStatus.createMany({
        data: channelMembers
          .filter(member => member.userId !== user.id)
          .map(member => ({
            messageId: message.id,
            userId: member.userId,
            status: 'SENT' as const
          }))
      })

      return NextResponse.json({ message })
    }

  } catch (error) {
    console.error('Failed to send message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}