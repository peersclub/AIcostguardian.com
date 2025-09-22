import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET - Get message history for a channel or direct message conversation
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const channelId = searchParams.get('channelId')
    const recipientId = searchParams.get('recipientId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const threadId = searchParams.get('threadId')
    const parentMessageId = searchParams.get('parentMessageId')

    // Validate input
    if (!channelId && !recipientId) {
      return NextResponse.json({ error: 'Either channelId or recipientId is required' }, { status: 400 })
    }

    if (channelId && recipientId) {
      return NextResponse.json({ error: 'Cannot specify both channelId and recipientId' }, { status: 400 })
    }

    // For channel history
    if (channelId) {
      // Verify user is a member of the channel
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

      // Build query filters
      const whereClause: any = {
        channelId,
        isDeleted: false
      }

      // Filter by thread if specified
      if (threadId) {
        whereClause.threadId = threadId
      }

      // Filter by parent message if specified (for replies)
      if (parentMessageId) {
        whereClause.parentMessageId = parentMessageId
      }

      // Get messages with pagination
      const messages = await prisma.messagingMessage.findMany({
        where: whereClause,
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
          },
          reactions_rel: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          replies: {
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            },
            take: 3 // Limit replies preview
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      })

      // Update user's last read timestamp for this channel
      await prisma.channelMember.update({
        where: {
          channelId_userId: {
            channelId,
            userId: user.id
          }
        },
        data: {
          lastReadAt: new Date(),
          unreadCount: 0 // Reset unread count
        }
      })

      return NextResponse.json({
        messages: messages.reverse(), // Return in chronological order
        channelId,
        hasMore: messages.length === limit
      })
    }

    // For direct message history
    if (recipientId) {
      // Verify recipient exists and is in the same organization
      const recipient = await prisma.user.findUnique({
        where: { id: recipientId }
      })

      if (!recipient || recipient.organizationId !== user.organizationId) {
        return NextResponse.json({ error: 'Invalid recipient' }, { status: 400 })
      }

      // Get or create direct message thread
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
        // Return empty history if no thread exists yet
        return NextResponse.json({
          messages: [],
          recipientId,
          dmThreadId: null,
          hasMore: false
        })
      }

      // Build query filters
      const whereClause: any = {
        OR: [
          { senderId: user.id, recipientId },
          { senderId: recipientId, recipientId: user.id }
        ],
        isDeleted: false
      }

      // Filter by thread if specified
      if (threadId) {
        whereClause.threadId = threadId
      }

      // Filter by parent message if specified (for replies)
      if (parentMessageId) {
        whereClause.parentMessageId = parentMessageId
      }

      // Get messages with pagination
      const messages = await prisma.messagingMessage.findMany({
        where: whereClause,
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
          },
          reactions_rel: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          replies: {
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            },
            take: 3 // Limit replies preview
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      })

      // Update unread count for the current user
      const isParticipant1 = dmThread.participant1Id === user.id
      await prisma.directMessageThread.update({
        where: { id: dmThread.id },
        data: {
          ...(isParticipant1
            ? { participant1UnreadCount: 0 }
            : { participant2UnreadCount: 0 }
          )
        }
      })

      return NextResponse.json({
        messages: messages.reverse(), // Return in chronological order
        recipientId,
        dmThreadId: dmThread.id,
        hasMore: messages.length === limit
      })
    }

  } catch (error) {
    console.error('Failed to fetch message history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch message history' },
      { status: 500 }
    )
  }
}

// PATCH - Mark messages as read
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const body = await req.json()
    const { messageIds, channelId, recipientId } = body

    if (messageIds && Array.isArray(messageIds)) {
      // Mark specific messages as read
      await prisma.messageDeliveryStatus.updateMany({
        where: {
          messageId: { in: messageIds },
          userId: user.id,
          status: { not: 'READ' }
        },
        data: {
          status: 'READ',
          readAt: new Date()
        }
      })
    } else if (channelId) {
      // Mark all unread messages in channel as read
      const unreadMessages = await prisma.messagingMessage.findMany({
        where: {
          channelId,
          senderId: { not: user.id },
          deliveryStatuses: {
            some: {
              userId: user.id,
              status: { not: 'READ' }
            }
          }
        },
        select: { id: true }
      })

      if (unreadMessages.length > 0) {
        await prisma.messageDeliveryStatus.updateMany({
          where: {
            messageId: { in: unreadMessages.map(m => m.id) },
            userId: user.id,
            status: { not: 'READ' }
          },
          data: {
            status: 'READ',
            readAt: new Date()
          }
        })
      }

      // Reset channel unread count
      await prisma.channelMember.update({
        where: {
          channelId_userId: {
            channelId,
            userId: user.id
          }
        },
        data: {
          unreadCount: 0,
          lastReadAt: new Date()
        }
      })
    } else if (recipientId) {
      // Mark all unread messages in DM conversation as read
      const unreadMessages = await prisma.messagingMessage.findMany({
        where: {
          senderId: recipientId,
          recipientId: user.id,
          deliveryStatuses: {
            some: {
              userId: user.id,
              status: { not: 'READ' }
            }
          }
        },
        select: { id: true }
      })

      if (unreadMessages.length > 0) {
        await prisma.messageDeliveryStatus.updateMany({
          where: {
            messageId: { in: unreadMessages.map(m => m.id) },
            userId: user.id,
            status: { not: 'READ' }
          },
          data: {
            status: 'READ',
            readAt: new Date()
          }
        })
      }

      // Reset DM thread unread count
      const dmThread = await prisma.directMessageThread.findFirst({
        where: {
          OR: [
            { participant1Id: user.id, participant2Id: recipientId },
            { participant1Id: recipientId, participant2Id: user.id }
          ],
          organizationId: user.organizationId!
        }
      })

      if (dmThread) {
        const isParticipant1 = dmThread.participant1Id === user.id
        await prisma.directMessageThread.update({
          where: { id: dmThread.id },
          data: {
            ...(isParticipant1
              ? { participant1UnreadCount: 0 }
              : { participant2UnreadCount: 0 }
            )
          }
        })
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Failed to mark messages as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
}