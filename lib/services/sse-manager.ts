/**
 * SSE (Server-Sent Events) Manager
 * Manages SSE connections and broadcasting for real-time notifications
 */

// Store active SSE connections
export const sseConnections = new Map<string, {
  userId: string
  response: any
  createdAt: Date
  lastPing: Date
}>()

/**
 * Broadcast notification to a user's SSE connections
 */
export function broadcastNotificationToSSE(userId: string, notification: any): number {
  let sentCount = 0
  
  // Find all connections for this user
  for (const [connectionId, connection] of sseConnections.entries()) {
    if (connection.userId !== userId) continue
    
    try {
      // Create SSE message
      const message = createSSEMessage('notification', {
        id: notification.id,
        type: notification.type,
        priority: notification.priority,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        createdAt: notification.createdAt,
        timestamp: new Date().toISOString(),
        isRealtime: true
      })
      
      connection.response.enqueue(message)
      sentCount++
    } catch (error) {
      console.error(`Failed to broadcast notification to SSE connection ${connectionId}:`, error)
    }
  }

  return sentCount
}

/**
 * Cleanup inactive SSE connections
 */
export function cleanupInactiveSSEConnections(): number {
  const now = Date.now()
  const inactiveThreshold = 5 * 60 * 1000 // 5 minutes
  let cleanedCount = 0

  for (const [connectionId, connection] of sseConnections.entries()) {
    if (now - connection.lastPing.getTime() > inactiveThreshold) {
      try {
        const timeoutEvent = createSSEMessage('timeout', {
          reason: 'INACTIVE_CONNECTION',
          timestamp: new Date().toISOString()
        })
        connection.response.enqueue(timeoutEvent)
        connection.response.close()
        sseConnections.delete(connectionId)
        cleanedCount++
      } catch (error) {
        console.error(`Failed to cleanup SSE connection ${connectionId}:`, error)
      }
    }
  }

  return cleanedCount
}

/**
 * Create SSE formatted message
 */
function createSSEMessage(event: string, data: any): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}