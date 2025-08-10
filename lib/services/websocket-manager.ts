/**
 * WebSocket Manager
 * Manages WebSocket connections for real-time notifications
 */

// Store active WebSocket connections
export const activeConnections = new Map<string, {
  userId: string
  ws: any
  createdAt: Date
  lastPing: Date
}>()

/**
 * Broadcast message to a user's WebSocket connections
 */
export function broadcastToUser(userId: string, message: any): number {
  let sentCount = 0
  
  // Find all connections for this user
  for (const [connectionId, connection] of Array.from(activeConnections.entries())) {
    if (connection.userId !== userId) continue
    
    try {
      if (connection.ws.readyState === 1) { // OPEN state
        connection.ws.send(JSON.stringify({
          type: 'notification',
          payload: message,
          timestamp: new Date().toISOString()
        }))
        sentCount++
      }
    } catch (error) {
      console.error(`Failed to send message to WebSocket ${connectionId}:`, error)
    }
  }
  
  return sentCount
}

/**
 * Cleanup inactive WebSocket connections
 */
export function cleanupInactiveConnections(): number {
  const now = Date.now()
  const inactiveThreshold = 5 * 60 * 1000 // 5 minutes
  let cleanedCount = 0

  for (const [connectionId, connection] of Array.from(activeConnections.entries())) {
    if (now - connection.lastPing.getTime() > inactiveThreshold) {
      try {
        connection.ws.close(1000, 'Connection timeout')
        activeConnections.delete(connectionId)
        cleanedCount++
      } catch (error) {
        console.error(`Failed to cleanup WebSocket ${connectionId}:`, error)
      }
    }
  }

  return cleanedCount
}