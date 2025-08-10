import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('id')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (conversationId) {
      // Fetch specific conversation with messages
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: user.id
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      })

      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }

      return NextResponse.json(conversation)
    } else {
      // Fetch list of conversations
      const conversations = await prisma.conversation.findMany({
        where: {
          userId: user.id,
          isActive: true
        },
        orderBy: {
          lastMessageAt: 'desc'
        },
        take: limit,
        skip: offset,
        include: {
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1 // Only get the last message for preview
          }
        }
      })

      // Get total count for pagination
      const totalCount = await prisma.conversation.count({
        where: {
          userId: user.id,
          isActive: true
        }
      })

      // Transform for frontend
      const transformedConversations = conversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        lastMessage: conv.messages[0]?.content || '',
        timestamp: conv.lastMessageAt,
        totalCost: conv.totalCost,
        totalTokens: conv.totalTokens,
        messageCount: conv.messageCount,
        model: conv.model,
        provider: conv.provider
      }))

      return NextResponse.json({
        conversations: transformedConversations,
        totalCount,
        hasMore: offset + limit < totalCount
      })
    }

  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch conversations' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { title, model, provider } = await request.json()

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        title: title || 'New Conversation',
        model,
        provider,
        metadata: {
          createdBy: session.user.email,
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json(conversation, { status: 201 })

  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ 
      error: 'Failed to create conversation' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('id')

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 })
    }

    // Verify ownership and soft delete
    const conversation = await prisma.conversation.updateMany({
      where: {
        id: conversationId,
        userId: user.id
      },
      data: {
        isActive: false
      }
    })

    if (conversation.count === 0) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Conversation deleted' 
    })

  } catch (error) {
    console.error('Error deleting conversation:', error)
    return NextResponse.json({ 
      error: 'Failed to delete conversation' 
    }, { status: 500 })
  }
}