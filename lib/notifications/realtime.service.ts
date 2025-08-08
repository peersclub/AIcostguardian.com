import {
  RealtimeService,
  RealtimeConnection,
  RealtimeMessage
} from './types'

/**
 * Real-time notification service using WebSockets and Server-Sent Events
 * Provides fallback from WebSocket to SSE for maximum compatibility
 */
export class NotificationRealtimeService implements RealtimeService {
  private connections = new Map<string, RealtimeConnection>()
  private userConnections = new Map<string, Set<string>>()
  private pingInterval: NodeJS.Timeout | null = null
  private cleanupInterval: NodeJS.Timeout | null = null

  private config = {
    pingIntervalMs: 30000, // 30 seconds
    connectionTimeoutMs: 60000, // 60 seconds
    maxConnectionsPerUser: 5,
    cleanupIntervalMs: 300000, // 5 minutes
    messageQueueSize: 100
  }

  private messageQueues = new Map<string, RealtimeMessage[]>()

  constructor(config?: Partial<typeof this.config>) {
    this.config = { ...this.config, ...config }
    this.startPingInterval()
    this.startCleanupInterval()
  }

  /**
   * Connect a user with WebSocket or SSE
   */
  async connect(
    userId: string,
    connectionId: string,
    type: 'websocket' | 'sse'
  ): Promise<void> {
    try {
      // Limit connections per user
      const userConns = this.userConnections.get(userId) || new Set()
      if (userConns.size >= this.config.maxConnectionsPerUser) {
        // Remove oldest connection
        const oldestConnId = Array.from(userConns)[0]
        await this.disconnect(oldestConnId)
      }

      // Create connection
      const connection: RealtimeConnection = {
        userId,
        connectionId,
        type,
        lastPing: new Date(),
        metadata: {
          connectedAt: new Date().toISOString(),
          userAgent: 'browser', // Would be extracted from request
          ip: '127.0.0.1' // Would be extracted from request
        }
      }

      // Store connection
      this.connections.set(connectionId, connection)
      
      // Add to user connections
      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, new Set())
      }
      this.userConnections.get(userId)!.add(connectionId)

      console.log(`User ${userId} connected via ${type} (${connectionId})`)

      // Send queued messages
      await this.sendQueuedMessages(userId)

      // Send connection established message
      await this.sendToConnection(connectionId, {
        type: 'ping',
        data: { status: 'connected', timestamp: new Date().toISOString() },
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Failed to establish connection:', error)
      throw error
    }
  }

  /**
   * Disconnect a connection
   */
  async disconnect(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId)
    if (!connection) return

    try {
      // Remove from user connections
      const userConns = this.userConnections.get(connection.userId)
      if (userConns) {
        userConns.delete(connectionId)
        if (userConns.size === 0) {
          this.userConnections.delete(connection.userId)
        }
      }

      // Remove connection
      this.connections.delete(connectionId)

      console.log(`Connection ${connectionId} disconnected (user: ${connection.userId})`)
    } catch (error) {
      console.error('Failed to disconnect:', error)
    }
  }

  /**
   * Send message to a specific user
   */
  async send(userId: string, message: RealtimeMessage): Promise<boolean> {
    const userConnections = this.userConnections.get(userId)
    
    if (!userConnections || userConnections.size === 0) {
      // User not connected, queue message
      await this.queueMessage(userId, message)
      return false
    }

    let delivered = false
    const failedConnections: string[] = []

    // Send to all user connections
    for (const connectionId of userConnections) {
      try {
        const success = await this.sendToConnection(connectionId, message)
        if (success) {
          delivered = true
        } else {
          failedConnections.push(connectionId)
        }
      } catch (error) {
        console.error(`Failed to send to connection ${connectionId}:`, error)
        failedConnections.push(connectionId)
      }
    }

    // Clean up failed connections
    for (const connectionId of failedConnections) {
      await this.disconnect(connectionId)
    }

    // Queue message if no successful delivery
    if (!delivered) {
      await this.queueMessage(userId, message)
    }

    return delivered
  }

  /**
   * Broadcast message to multiple users
   */
  async broadcast(userIds: string[], message: RealtimeMessage): Promise<number> {
    let deliveredCount = 0

    const deliveryPromises = userIds.map(async (userId) => {
      try {
        const delivered = await this.send(userId, message)
        if (delivered) {
          deliveredCount++
        }
      } catch (error) {
        console.error(`Failed to send to user ${userId}:`, error)
      }
    })

    await Promise.allSettled(deliveryPromises)
    return deliveredCount
  }

  /**
   * Check if user is connected
   */
  isConnected(userId: string): boolean {
    const userConnections = this.userConnections.get(userId)
    return !!(userConnections && userConnections.size > 0)
  }

  /**
   * Get total connection count
   */
  getConnectionCount(): number {
    return this.connections.size
  }

  /**
   * Get connection stats
   */
  getStats() {
    return {
      totalConnections: this.connections.size,
      uniqueUsers: this.userConnections.size,
      websocketConnections: Array.from(this.connections.values())
        .filter(conn => conn.type === 'websocket').length,
      sseConnections: Array.from(this.connections.values())
        .filter(conn => conn.type === 'sse').length,
      queuedMessages: Array.from(this.messageQueues.values())
        .reduce((total, queue) => total + queue.length, 0)
    }
  }

  /**
   * Handle ping/pong for connection health
   */
  async handlePing(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId)
    if (!connection) return

    connection.lastPing = new Date()
    
    // Send pong
    await this.sendToConnection(connectionId, {
      type: 'ping',
      data: { pong: true, timestamp: new Date().toISOString() },
      timestamp: new Date()
    })
  }

  /**
   * Shutdown the realtime service
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down realtime service...')

    // Stop intervals
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    // Disconnect all connections
    const disconnectPromises = Array.from(this.connections.keys())
      .map(connectionId => this.disconnect(connectionId))

    await Promise.allSettled(disconnectPromises)

    // Clear all data
    this.connections.clear()
    this.userConnections.clear()
    this.messageQueues.clear()

    console.log('Realtime service shut down')
  }

  // Private methods

  private async sendToConnection(
    connectionId: string,
    message: RealtimeMessage
  ): Promise<boolean> {
    const connection = this.connections.get(connectionId)
    if (!connection) {
      return false
    }

    try {
      // In a real implementation, this would send via WebSocket or SSE
      // For now, simulate the send operation
      const success = await this.simulateSend(connection, message)
      
      if (success) {
        // Update last ping time for successful sends
        connection.lastPing = new Date()
      }

      return success
    } catch (error) {
      console.error(`Failed to send to connection ${connectionId}:`, error)
      return false
    }
  }

  private async simulateSend(
    connection: RealtimeConnection,
    message: RealtimeMessage
  ): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 10))

    // Simulate occasional delivery failures (5% failure rate)
    if (Math.random() < 0.05) {
      throw new Error('Simulated delivery failure')
    }

    // Log the message send
    console.log(`[${connection.type.toUpperCase()}] Sent to ${connection.userId}: ${message.type}`, {
      connectionId: connection.connectionId,
      messageType: message.type,
      messageId: message.id,
      timestamp: message.timestamp
    })

    return true
  }

  private async queueMessage(userId: string, message: RealtimeMessage): Promise<void> {
    if (!this.messageQueues.has(userId)) {
      this.messageQueues.set(userId, [])
    }

    const queue = this.messageQueues.get(userId)!
    
    // Add message to queue
    queue.push(message)

    // Limit queue size
    if (queue.length > this.config.messageQueueSize) {
      queue.shift() // Remove oldest message
    }

    console.log(`Queued message for offline user ${userId} (queue size: ${queue.length})`)
  }

  private async sendQueuedMessages(userId: string): Promise<void> {
    const queue = this.messageQueues.get(userId)
    if (!queue || queue.length === 0) {
      return
    }

    console.log(`Sending ${queue.length} queued messages to user ${userId}`)

    // Send all queued messages
    const sendPromises = queue.map(message => this.send(userId, message))
    await Promise.allSettled(sendPromises)

    // Clear the queue
    this.messageQueues.delete(userId)
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      this.pingAllConnections()
    }, this.config.pingIntervalMs)
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleConnections()
    }, this.config.cleanupIntervalMs)
  }

  private async pingAllConnections(): Promise<void> {
    const pingPromises = Array.from(this.connections.keys()).map(async (connectionId) => {
      try {
        await this.sendToConnection(connectionId, {
          type: 'ping',
          data: { ping: true, timestamp: new Date().toISOString() },
          timestamp: new Date()
        })
      } catch (error) {
        console.error(`Ping failed for connection ${connectionId}:`, error)
        await this.disconnect(connectionId)
      }
    })

    await Promise.allSettled(pingPromises)
  }

  private async cleanupStaleConnections(): Promise<void> {
    const now = new Date()
    const staleConnections: string[] = []

    // Find stale connections
    for (const [connectionId, connection] of this.connections) {
      const timeSinceLastPing = now.getTime() - connection.lastPing.getTime()
      if (timeSinceLastPing > this.config.connectionTimeoutMs) {
        staleConnections.push(connectionId)
      }
    }

    // Disconnect stale connections
    const disconnectPromises = staleConnections.map(connectionId => 
      this.disconnect(connectionId)
    )

    await Promise.allSettled(disconnectPromises)

    if (staleConnections.length > 0) {
      console.log(`Cleaned up ${staleConnections.length} stale connections`)
    }

    // Clean up old message queues
    this.cleanupMessageQueues()
  }

  private cleanupMessageQueues(): void {
    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - 24) // Remove queues older than 24 hours

    let cleanedQueues = 0

    for (const [userId, queue] of this.messageQueues) {
      // Check if user has any recent activity or messages
      const hasRecentMessages = queue.some(msg => 
        msg.timestamp > cutoff
      )

      if (!hasRecentMessages && !this.isConnected(userId)) {
        this.messageQueues.delete(userId)
        cleanedQueues++
      }
    }

    if (cleanedQueues > 0) {
      console.log(`Cleaned up ${cleanedQueues} old message queues`)
    }
  }
}

/**
 * WebSocket connection manager
 */
export class WebSocketManager {
  private server: any // Would be WebSocket server instance
  private realtimeService: NotificationRealtimeService

  constructor(realtimeService: NotificationRealtimeService) {
    this.realtimeService = realtimeService
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server: any): void {
    // In a real implementation, this would set up WebSocket server
    // For Next.js, this would be in an API route or custom server
    console.log('WebSocket server initialized')
  }

  /**
   * Handle new WebSocket connection
   */
  async handleConnection(ws: any, request: any): Promise<void> {
    const userId = this.extractUserIdFromRequest(request)
    const connectionId = this.generateConnectionId()

    if (!userId) {
      ws.close(4001, 'Unauthorized')
      return
    }

    try {
      await this.realtimeService.connect(userId, connectionId, 'websocket')

      // Handle WebSocket events
      ws.on('message', (data: string) => {
        this.handleMessage(connectionId, data)
      })

      ws.on('ping', () => {
        this.realtimeService.handlePing(connectionId)
      })

      ws.on('close', () => {
        this.realtimeService.disconnect(connectionId)
      })

      ws.on('error', (error: Error) => {
        console.error(`WebSocket error for ${connectionId}:`, error)
        this.realtimeService.disconnect(connectionId)
      })

    } catch (error) {
      console.error('Failed to handle WebSocket connection:', error)
      ws.close(4000, 'Connection failed')
    }
  }

  private extractUserIdFromRequest(request: any): string | null {
    // Extract user ID from JWT token, session, or query params
    // This is a simplified example
    const token = request.headers.authorization?.replace('Bearer ', '')
    if (!token) return null

    try {
      // In real implementation, verify JWT token
      // const decoded = jwt.verify(token, process.env.JWT_SECRET)
      // return decoded.userId
      
      // For simulation
      return `user_${Math.random().toString(36).substr(2, 9)}`
    } catch {
      return null
    }
  }

  private generateConnectionId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async handleMessage(connectionId: string, data: string): Promise<void> {
    try {
      const message = JSON.parse(data)
      
      switch (message.type) {
        case 'ping':
          await this.realtimeService.handlePing(connectionId)
          break
        case 'ack':
          // Handle message acknowledgment
          console.log(`Message ${message.id} acknowledged by ${connectionId}`)
          break
        default:
          console.warn(`Unknown message type: ${message.type}`)
      }
    } catch (error) {
      console.error('Failed to handle WebSocket message:', error)
    }
  }
}

/**
 * Server-Sent Events manager
 */
export class SSEManager {
  private realtimeService: NotificationRealtimeService

  constructor(realtimeService: NotificationRealtimeService) {
    this.realtimeService = realtimeService
  }

  /**
   * Handle SSE connection
   */
  async handleConnection(request: any, response: any): Promise<void> {
    const userId = this.extractUserIdFromRequest(request)
    const connectionId = this.generateConnectionId()

    if (!userId) {
      response.status(401).json({ error: 'Unauthorized' })
      return
    }

    try {
      // Set SSE headers
      response.setHeader('Content-Type', 'text/event-stream')
      response.setHeader('Cache-Control', 'no-cache')
      response.setHeader('Connection', 'keep-alive')
      response.setHeader('Access-Control-Allow-Origin', '*')

      await this.realtimeService.connect(userId, connectionId, 'sse')

      // Handle client disconnect
      request.on('close', () => {
        this.realtimeService.disconnect(connectionId)
      })

      request.on('error', (error: Error) => {
        console.error(`SSE error for ${connectionId}:`, error)
        this.realtimeService.disconnect(connectionId)
      })

      // Keep connection alive
      const keepAlive = setInterval(() => {
        response.write(': keep-alive\n\n')
      }, 30000)

      request.on('close', () => {
        clearInterval(keepAlive)
      })

    } catch (error) {
      console.error('Failed to handle SSE connection:', error)
      response.status(500).json({ error: 'Connection failed' })
    }
  }

  private extractUserIdFromRequest(request: any): string | null {
    // Similar to WebSocket implementation
    return `user_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateConnectionId(): string {
    return `sse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Singleton instance
export const realtimeService = new NotificationRealtimeService()

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down realtime service...')
  realtimeService.shutdown().then(() => {
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down realtime service...')
  realtimeService.shutdown().then(() => {
    process.exit(0)
  })
})