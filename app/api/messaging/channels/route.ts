import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface CreateChannelRequest {
  name: string
  description?: string
  type?: 'PUBLIC' | 'PRIVATE' | 'DIRECT' | 'ANNOUNCEMENT'
  isPrivate?: boolean
  memberIds?: string[] // Initial members to add to the channel
}

// GET - Get all channels for the organization
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
    const includeArchived = searchParams.get('includeArchived') === 'true'
    const type = searchParams.get('type') as 'PUBLIC' | 'PRIVATE' | 'DIRECT' | 'ANNOUNCEMENT' | null

    // Get channels the user is a member of
    const channels = await prisma.messagingChannel.findMany({
      where: {
        organizationId: user.organizationId!,
        members: {
          some: {
            userId: user.id
          }
        },
        ...(type && { type }),
        ...(includeArchived ? {} : { isArchived: false })
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                lastActiveAt: true
              }
            }
          },
          orderBy: {
            joinedAt: 'asc'
          }
        },
        _count: {
          select: {
            messages: true,
            members: true
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { lastMessageAt: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Add unread count for each channel for the current user
    const channelsWithUnread = await Promise.all(
      channels.map(async (channel) => {
        const userMembership = channel.members.find(m => m.userId === user.id)

        return {
          ...channel,
          unreadCount: userMembership?.unreadCount || 0,
          lastReadAt: userMembership?.lastReadAt,
          userRole: userMembership?.role,
          isMuted: userMembership?.isMuted || false,
          isOnline: channel.members.some(m =>
            m.user.lastActiveAt &&
            new Date().getTime() - new Date(m.user.lastActiveAt).getTime() < 5 * 60 * 1000 // 5 minutes
          )
        }
      })
    )

    return NextResponse.json({ channels: channelsWithUnread })

  } catch (error) {
    console.error('Failed to fetch channels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    )
  }
}

// POST - Create a new channel
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

    // Check permissions - only admins and managers can create channels
    if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions to create channels' }, { status: 403 })
    }

    const body: CreateChannelRequest = await req.json()
    const { name, description, type = 'PUBLIC', isPrivate = false, memberIds = [] } = body

    // Validate input
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Channel name is required' }, { status: 400 })
    }

    if (name.length > 50) {
      return NextResponse.json({ error: 'Channel name must be 50 characters or less' }, { status: 400 })
    }

    // Check if channel name already exists in the organization
    const existingChannel = await prisma.messagingChannel.findFirst({
      where: {
        organizationId: user.organizationId!,
        name: name.trim().toLowerCase()
      }
    })

    if (existingChannel) {
      return NextResponse.json({ error: 'Channel name already exists' }, { status: 400 })
    }

    // Validate member IDs if provided
    if (memberIds.length > 0) {
      const validMembers = await prisma.user.findMany({
        where: {
          id: { in: memberIds },
          organizationId: user.organizationId!
        },
        select: { id: true }
      })

      if (validMembers.length !== memberIds.length) {
        return NextResponse.json({ error: 'Some member IDs are invalid' }, { status: 400 })
      }
    }

    // Create the channel
    const channel = await prisma.messagingChannel.create({
      data: {
        name: name.trim().toLowerCase(),
        description: description?.trim(),
        type,
        isPrivate,
        organizationId: user.organizationId!,
        createdById: user.id,
        memberCount: memberIds.length + 1 // Include creator
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    // Add creator as channel admin
    await prisma.channelMember.create({
      data: {
        channelId: channel.id,
        userId: user.id,
        role: 'OWNER',
        isAdmin: true
      }
    })

    // Add initial members if specified
    if (memberIds.length > 0) {
      await prisma.channelMember.createMany({
        data: memberIds.map(memberId => ({
          channelId: channel.id,
          userId: memberId,
          role: 'MEMBER' as const
        }))
      })
    }

    // Create system message about channel creation
    await prisma.messagingMessage.create({
      data: {
        channelId: channel.id,
        senderId: user.id,
        content: `${user.name || user.email} created this channel`,
        type: 'SYSTEM'
      }
    })

    // Get the complete channel data with members
    const completeChannel = await prisma.messagingChannel.findUnique({
      where: { id: channel.id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: true,
            members: true
          }
        }
      }
    })

    return NextResponse.json({ channel: completeChannel })

  } catch (error) {
    console.error('Failed to create channel:', error)
    return NextResponse.json(
      { error: 'Failed to create channel' },
      { status: 500 }
    )
  }
}

// PATCH - Update channel settings
export async function PATCH(req: NextRequest) {
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

    const body = await req.json()
    const { channelId, action, data } = body

    if (!channelId || !action) {
      return NextResponse.json({ error: 'channelId and action are required' }, { status: 400 })
    }

    // Verify user is a member of the channel
    const channelMember = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId: user.id
        }
      },
      include: {
        channel: true
      }
    })

    if (!channelMember) {
      return NextResponse.json({ error: 'Channel not found or access denied' }, { status: 403 })
    }

    switch (action) {
      case 'join':
        // User is already a member since we found channelMember
        return NextResponse.json({ success: true })

      case 'leave':
        // Remove user from channel (unless they're the owner)
        if (channelMember.role === 'OWNER') {
          return NextResponse.json({ error: 'Channel owner cannot leave. Transfer ownership first.' }, { status: 400 })
        }

        await prisma.channelMember.delete({
          where: {
            channelId_userId: {
              channelId,
              userId: user.id
            }
          }
        })

        // Update channel member count
        await prisma.messagingChannel.update({
          where: { id: channelId },
          data: { memberCount: { decrement: 1 } }
        })

        return NextResponse.json({ success: true })

      case 'mute':
        await prisma.channelMember.update({
          where: {
            channelId_userId: {
              channelId,
              userId: user.id
            }
          },
          data: { isMuted: data.muted === true }
        })

        return NextResponse.json({ success: true })

      case 'pin':
        // Only admins can pin channels
        if (!channelMember.isAdmin && !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }

        await prisma.messagingChannel.update({
          where: { id: channelId },
          data: { isPinned: data.pinned === true }
        })

        return NextResponse.json({ success: true })

      case 'archive':
        // Only admins can archive channels
        if (!channelMember.isAdmin && !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }

        await prisma.messagingChannel.update({
          where: { id: channelId },
          data: { isArchived: data.archived === true }
        })

        return NextResponse.json({ success: true })

      case 'update':
        // Only admins can update channel settings
        if (!channelMember.isAdmin && !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }

        const updateData: any = {}
        if (data.name && data.name !== channelMember.channel.name) {
          updateData.name = data.name.trim().toLowerCase()
        }
        if (data.description !== undefined) {
          updateData.description = data.description?.trim()
        }
        if (data.topic !== undefined) {
          updateData.topic = data.topic?.trim()
        }

        await prisma.messagingChannel.update({
          where: { id: channelId },
          data: updateData
        })

        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Failed to update channel:', error)
    return NextResponse.json(
      { error: 'Failed to update channel' },
      { status: 500 }
    )
  }
}