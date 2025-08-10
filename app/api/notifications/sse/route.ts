import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'

// SSE connection tracking
const sseConnections = new Map<string, {
  userId: string
  response: ReadableStreamDefaultController
  lastPing: Date
  metadata: Record<string, any>
}>()

// Rate limiting for SSE connections
const connectionRateLimit = new Map<string, { count: number; resetTime: number }>()
const CONNECTION_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_SSE_CONNECTIONS_PER_USER = 3

function checkSSEConnectionRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = connectionRateLimit.get(userId)

  if (!userLimit || now > userLimit.resetTime) {
    connectionRateLimit.set(userId, { count: 1, resetTime: now + CONNECTION_LIMIT_WINDOW })
    return true
  }

  if (userLimit.count >= MAX_SSE_CONNECTIONS_PER_USER) {
    return false
  }

  userLimit.count++
  return true
}

/**
 * GET /api/notifications/sse - Server-Sent Events endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check rate limiting
    if (!checkSSEConnectionRateLimit(session.user.id)) {
      return new NextResponse('Too many SSE connections', { 
        status: 429,
        headers: { 'Retry-After': '60' }
      })
    }

    // Check existing connections for this user
    const userConnections = Array.from(sseConnections.values())
      .filter(conn => conn.userId === session.user.id)

    if (userConnections.length >= MAX_SSE_CONNECTIONS_PER_USER) {
      return new NextResponse('Maximum SSE connections exceeded', { status: 429 })
    }

    const url = new URL(request.url)
    const connectionId = url.searchParams.get('connectionId') || `sse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const includeHistory = url.searchParams.get('includeHistory') === 'true'
    const heartbeatInterval = parseInt(url.searchParams.get('heartbeat') || '30000') // 30 seconds default

    // Create SSE response stream
    const stream = new ReadableStream({
      start(controller) {
        // Store connection
        sseConnections.set(connectionId, {
          userId: session.user.id,
          response: controller,
          lastPing: new Date(),
          metadata: {
            connectedAt: new Date().toISOString(),
            heartbeatInterval,
            includeHistory
          }
        })

        // Send connection established event
        const connectEvent = createSSEMessage('connected', {
          connectionId,
          serverTime: new Date().toISOString(),
          heartbeatInterval,
          features: ['notifications', 'heartbeat', 'reconnect']
        })
        controller.enqueue(connectEvent)

        // Send recent unread notifications if requested
        if (includeHistory) {
          sendRecentNotifications(controller, session.user.id)
        }

        // Set up heartbeat
        const heartbeatTimer = setInterval(() => {
          try {
            const connection = sseConnections.get(connectionId)
            if (connection) {
              connection.lastPing = new Date()
              const heartbeat = createSSEMessage('heartbeat', {
                timestamp: new Date().toISOString(),
                connectionId
              })
              controller.enqueue(heartbeat)
            } else {
              clearInterval(heartbeatTimer)
            }
          } catch (error) {
            console.error('SSE heartbeat error:', error)
            clearInterval(heartbeatTimer)
            cleanup()
          }
        }, heartbeatInterval)

        // Cleanup function
        const cleanup = () => {
          clearInterval(heartbeatTimer)
          sseConnections.delete(connectionId)
          
          // Log disconnection
          prisma.auditLog.create({
            data: {
              userId: session.user.id,
              organizationId: session.user.organizationId || 'unknown',
              action: 'SSE_CONNECTION_CLOSED',
              resourceType: 'SSE_CONNECTION',
              resourceId: connectionId,
              details: {
                connectionId,
                duration: Date.now() - new Date(sseConnections.get(connectionId)?.metadata?.connectedAt || Date.now()).getTime(),
                timestamp: new Date().toISOString()
              }
            }
          }).catch(() => {
            console.warn('Failed to create audit log for SSE disconnection')
          })
        }

        // Handle connection close
        request.signal.addEventListener('abort', cleanup)
      },

      cancel() {
        sseConnections.delete(connectionId)
      }
    })

    // Log connection attempt
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        organizationId: session.user.organizationId || 'unknown',
        action: 'SSE_CONNECTION_ESTABLISHED',
        resourceType: 'SSE_CONNECTION',
        resourceId: connectionId,
        details: {
          connectionId,
          includeHistory,
          heartbeatInterval,
          userAgent: request.headers.get('user-agent'),
          timestamp: new Date().toISOString()
        }
      }
    }).catch(() => {
      console.warn('Failed to create audit log for SSE connection')
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    })

  } catch (error) {
    console.error('GET /api/notifications/sse error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}

/**
 * POST /api/notifications/sse - SSE management operations
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, connectionId, data } = body

    switch (action) {
      case 'send_message':
        return handleSendSSEMessage(connectionId, session.user.id, data)
      
      case 'get_connections':
        return handleGetSSEConnections(session.user.id)
      
      case 'close_connection':
        return handleCloseSSEConnection(connectionId, session.user.id)
      
      case 'broadcast':
        return handleSSEBroadcast(session.user.id, data)
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('POST /api/notifications/sse error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications/sse - Close SSE connections
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const connectionId = url.searchParams.get('connectionId')

    if (!connectionId) {
      // Close all connections for user
      const userConnections = Array.from(sseConnections.entries())
        .filter(([_, conn]) => conn.userId === session.user.id)

      for (const [id, conn] of userConnections) {
        try {
          const closeEvent = createSSEMessage('close', {
            reason: 'USER_REQUEST',
            timestamp: new Date().toISOString()
          })
          conn.response.enqueue(closeEvent)
          conn.response.close()
          sseConnections.delete(id)
        } catch (error) {
          console.error(`Failed to close SSE connection ${id}:`, error)
        }
      }

      return NextResponse.json({
        success: true,
        message: `Closed ${userConnections.length} SSE connections`,
        closedConnections: userConnections.length
      })
    }

    // Close specific connection
    const connection = sseConnections.get(connectionId)
    if (!connection || connection.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Connection not found' },
        { status: 404 }
      )
    }

    try {
      const closeEvent = createSSEMessage('close', {
        reason: 'USER_REQUEST',
        timestamp: new Date().toISOString()
      })
      connection.response.enqueue(closeEvent)
      connection.response.close()
      sseConnections.delete(connectionId)

      return NextResponse.json({
        success: true,
        message: 'SSE connection closed',
        connectionId
      })

    } catch (error) {
      console.error('Failed to close SSE connection:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to close connection' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('DELETE /api/notifications/sse error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Create SSE message format
 */
function createSSEMessage(event: string, data: any): Uint8Array {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  return new TextEncoder().encode(message)
}

/**
 * Send recent notifications to a new connection
 */
async function sendRecentNotifications(controller: ReadableStreamDefaultController, userId: string) {
  try {
    const recentNotifications = await prisma.notification.findMany({
      where: {
        userId,
        readAt: null,
        status: { not: 'DELETED' }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        rule: {
          select: { id: true, name: true }
        }
      }
    })

    for (const notification of recentNotifications) {
      const message = createSSEMessage('notification', {
        id: notification.id,
        type: notification.type,
        priority: notification.priority,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        createdAt: notification.createdAt,
        rule: notification.rule,
        isHistorical: true
      })
      controller.enqueue(message)
    }

    // Send end of history marker
    const endMessage = createSSEMessage('history_complete', {
      count: recentNotifications.length,
      timestamp: new Date().toISOString()
    })
    controller.enqueue(endMessage)

  } catch (error) {
    console.error('Failed to send recent notifications:', error)
    const errorMessage = createSSEMessage('error', {
      message: 'Failed to load recent notifications',
      timestamp: new Date().toISOString()
    })
    controller.enqueue(errorMessage)
  }
}

/**
 * Handle send SSE message
 */
async function handleSendSSEMessage(connectionId: string, userId: string, messageData: any) {
  const connection = sseConnections.get(connectionId)
  
  if (!connection || connection.userId !== userId) {
    return NextResponse.json(
      { success: false, error: 'Connection not found' },
      { status: 404 }
    )
  }

  try {
    const message = createSSEMessage(messageData.event || 'message', {
      ...messageData.data,
      timestamp: new Date().toISOString(),
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    })
    
    connection.response.enqueue(message)

    return NextResponse.json({
      success: true,
      data: {
        connectionId,
        sent: true,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Failed to send SSE message:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

/**
 * Handle get SSE connections
 */
async function handleGetSSEConnections(userId: string) {
  const userConnections = Array.from(sseConnections.entries())
    .filter(([_, conn]) => conn.userId === userId)
    .map(([id, conn]) => ({
      connectionId: id,
      lastPing: conn.lastPing,
      metadata: conn.metadata,
      isAlive: Date.now() - conn.lastPing.getTime() < 60000 // 1 minute
    }))

  return NextResponse.json({
    success: true,
    data: {
      activeConnections: userConnections.length,
      connections: userConnections,
      limits: {
        maxConnections: MAX_SSE_CONNECTIONS_PER_USER,
        remaining: MAX_SSE_CONNECTIONS_PER_USER - userConnections.length
      }
    }
  })
}

/**
 * Handle close SSE connection
 */
async function handleCloseSSEConnection(connectionId: string, userId: string) {
  const connection = sseConnections.get(connectionId)
  
  if (!connection || connection.userId !== userId) {
    return NextResponse.json(
      { success: false, error: 'Connection not found' },
      { status: 404 }
    )
  }

  try {
    const closeEvent = createSSEMessage('close', {
      reason: 'CLIENT_REQUEST',
      timestamp: new Date().toISOString()
    })
    connection.response.enqueue(closeEvent)
    connection.response.close()
    sseConnections.delete(connectionId)

    return NextResponse.json({
      success: true,
      message: 'Connection closed',
      connectionId
    })

  } catch (error) {
    console.error('Failed to close SSE connection:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to close connection' },
      { status: 500 }
    )
  }
}

/**
 * Handle SSE broadcast
 */
async function handleSSEBroadcast(userId: string, messageData: any) {
  const userConnections = Array.from(sseConnections.entries())
    .filter(([_, conn]) => conn.userId === userId)

  let sentCount = 0
  const errors = []

  for (const [connectionId, connection] of userConnections) {
    try {
      const message = createSSEMessage(messageData.event || 'broadcast', {
        ...messageData.data,
        timestamp: new Date().toISOString(),
        broadcastId: `broadcast_${Date.now()}`
      })
      
      connection.response.enqueue(message)
      sentCount++
    } catch (error) {
      console.error(`Failed to broadcast to SSE connection ${connectionId}:`, error)
      errors.push({ connectionId, error: error.message })
    }
  }

  return NextResponse.json({
    success: errors.length === 0,
    data: {
      totalConnections: userConnections.length,
      sentCount,
      errorCount: errors.length,
      errors
    },
    message: `Broadcast sent to ${sentCount}/${userConnections.length} connections`
  })
}

// Broadcast and cleanup utilities have been moved to @/lib/services/sse-manager
// to comply with Next.js route export requirements