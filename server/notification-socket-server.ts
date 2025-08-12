import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import { prisma } from '../lib/prisma'
import { NotificationEvent } from '../lib/services/notification-socket.service'

interface NotificationPayload {
  id: string
  type: NotificationEvent
  title: string
  message: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  icon?: string
  iconColor?: string
  actionUrl?: string
  actionLabel?: string
  metadata?: Record<string, any>
  userId?: string
  organizationId?: string
  createdAt: Date
}

interface SiteWideNotificationPayload extends NotificationPayload {
  showUntil?: Date
  dismissible?: boolean
  style?: 'info' | 'warning' | 'error' | 'success'
}

export class NotificationSocketServer {
  private io: SocketIOServer
  private userSockets: Map<string, Set<string>> = new Map() // userId -> Set of socketIds
  private orgSockets: Map<string, Set<string>> = new Map() // orgId -> Set of socketIds
  
  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        credentials: true,
      },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    })

    this.setupHandlers()
  }

  private setupHandlers() {
    this.io.on('connection', async (socket) => {
      console.log('Client connected for notifications:', socket.id)

      // Handle subscriptions
      socket.on('subscribe', async (data: { channel: string }) => {
        if (data.channel === 'user') {
          const userId = await this.getUserIdFromSocket(socket)
          if (userId) {
            socket.join(`user:${userId}`)
            this.trackUserSocket(userId, socket.id)
            
            // Send unread count
            const unreadCount = await this.getUnreadCount(userId)
            socket.emit('notification:unread-count', unreadCount)
          }
        } else if (data.channel === 'organization') {
          const orgId = await this.getOrgIdFromSocket(socket)
          if (orgId) {
            socket.join(`org:${orgId}`)
            this.trackOrgSocket(orgId, socket.id)
          }
        } else if (data.channel === 'system') {
          socket.join('system')
        }
      })

      // Handle notification actions
      socket.on('notification:mark-read', async (notificationId: string) => {
        await this.markNotificationAsRead(notificationId, socket)
      })

      socket.on('notification:mark-all-read', async () => {
        await this.markAllNotificationsAsRead(socket)
      })

      socket.on('notification:dismiss-site-wide', async (notificationId: string) => {
        await this.dismissSiteWideNotification(notificationId, socket)
      })

      // Handle notification triggers (from app)
      socket.on('notification:trigger', async (data: Partial<NotificationPayload>) => {
        await this.triggerNotification(data, socket)
      })

      socket.on('notification:trigger-site-wide', async (data: Partial<SiteWideNotificationPayload>) => {
        await this.triggerSiteWideNotification(data)
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket)
      })
    })
  }

  private async getUserIdFromSocket(socket: Socket): Promise<string | null> {
    try {
      // Get user from socket session or auth token
      const userId = (socket as any).userId || (socket.handshake.auth as any)?.userId
      return userId || null
    } catch {
      return null
    }
  }

  private async getOrgIdFromSocket(socket: Socket): Promise<string | null> {
    try {
      const userId = await this.getUserIdFromSocket(socket)
      if (!userId) return null
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { organizationId: true }
      })
      
      return user?.organizationId || null
    } catch {
      return null
    }
  }

  private trackUserSocket(userId: string, socketId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set())
    }
    this.userSockets.get(userId)!.add(socketId)
  }

  private trackOrgSocket(orgId: string, socketId: string) {
    if (!this.orgSockets.has(orgId)) {
      this.orgSockets.set(orgId, new Set())
    }
    this.orgSockets.get(orgId)!.add(socketId)
  }

  private async getUnreadCount(userId: string): Promise<number> {
    return await prisma.notification.count({
      where: {
        userId,
        status: { in: ['PENDING', 'SENT', 'DELIVERED'] }
      }
    })
  }

  private async markNotificationAsRead(notificationId: string, socket: Socket) {
    try {
      const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: { 
          status: 'READ',
          readAt: new Date()
        }
      })

      // Notify the user's other devices
      const userId = await this.getUserIdFromSocket(socket)
      if (userId) {
        this.io.to(`user:${userId}`).emit('notification:read', notificationId)
        
        // Update unread count
        const unreadCount = await this.getUnreadCount(userId)
        this.io.to(`user:${userId}`).emit('notification:unread-count', unreadCount)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  private async markAllNotificationsAsRead(socket: Socket) {
    try {
      const userId = await this.getUserIdFromSocket(socket)
      if (!userId) return

      await prisma.notification.updateMany({
        where: {
          userId,
          status: { in: ['PENDING', 'SENT', 'DELIVERED'] }
        },
        data: {
          status: 'READ',
          readAt: new Date()
        }
      })

      // Notify all user's devices
      this.io.to(`user:${userId}`).emit('notification:all-read')
      this.io.to(`user:${userId}`).emit('notification:unread-count', 0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  private async dismissSiteWideNotification(notificationId: string, socket: Socket) {
    // Track dismissal in database if needed
    const userId = await this.getUserIdFromSocket(socket)
    if (userId) {
      // Could store dismissals in a separate table or in user preferences
      console.log(`User ${userId} dismissed site-wide notification ${notificationId}`)
    }
  }

  private async triggerNotification(data: Partial<NotificationPayload>, socket: Socket) {
    try {
      const userId = data.userId || await this.getUserIdFromSocket(socket)
      if (!userId) return

      // Create notification in database
      const notification = await prisma.notification.create({
        data: {
          userId,
          organizationId: data.organizationId,
          type: data.type || 'SERVICE_UPDATE',
          priority: data.priority || 'MEDIUM',
          title: data.title || 'Notification',
          message: data.message || '',
          status: 'SENT',
          channels: { inApp: true },
          metadata: data.metadata || {},
          deliveredAt: new Date()
        }
      })

      // Prepare payload
      const payload: NotificationPayload = {
        id: notification.id,
        type: data.type as NotificationEvent,
        title: notification.title,
        message: notification.message,
        priority: notification.priority as any,
        icon: data.icon,
        iconColor: data.iconColor,
        actionUrl: data.actionUrl,
        actionLabel: data.actionLabel,
        metadata: notification.metadata as any,
        createdAt: notification.createdAt
      }

      // Send to user
      this.io.to(`user:${userId}`).emit('notification', payload)

      // Update unread count
      const unreadCount = await this.getUnreadCount(userId)
      this.io.to(`user:${userId}`).emit('notification:unread-count', unreadCount)
    } catch (error) {
      console.error('Error triggering notification:', error)
    }
  }

  private async triggerSiteWideNotification(data: Partial<SiteWideNotificationPayload>) {
    try {
      // Create site-wide notification
      const payload: SiteWideNotificationPayload = {
        id: `site-${Date.now()}`,
        type: data.type as NotificationEvent,
        title: data.title || 'System Notification',
        message: data.message || '',
        priority: data.priority || 'MEDIUM',
        icon: data.icon,
        iconColor: data.iconColor,
        actionUrl: data.actionUrl,
        actionLabel: data.actionLabel,
        showUntil: data.showUntil,
        dismissible: data.dismissible !== false,
        style: data.style,
        createdAt: new Date()
      }

      // Broadcast to all connected clients
      this.io.emit('site-wide-notification', payload)
    } catch (error) {
      console.error('Error triggering site-wide notification:', error)
    }
  }

  private handleDisconnect(socket: Socket) {
    console.log('Client disconnected:', socket.id)
    
    // Clean up tracking
    for (const [userId, sockets] of this.userSockets.entries()) {
      sockets.delete(socket.id)
      if (sockets.size === 0) {
        this.userSockets.delete(userId)
      }
    }
    
    for (const [orgId, sockets] of this.orgSockets.entries()) {
      sockets.delete(socket.id)
      if (sockets.size === 0) {
        this.orgSockets.delete(orgId)
      }
    }
  }

  // Public methods for triggering notifications from other parts of the app
  public async sendNotificationToUser(userId: string, notification: Partial<NotificationPayload>) {
    const payload: NotificationPayload = {
      id: `notif-${Date.now()}`,
      type: notification.type as NotificationEvent,
      title: notification.title || 'Notification',
      message: notification.message || '',
      priority: notification.priority || 'MEDIUM',
      ...notification,
      createdAt: new Date()
    }

    this.io.to(`user:${userId}`).emit('notification', payload)
  }

  public async sendNotificationToOrg(orgId: string, notification: Partial<NotificationPayload>) {
    const payload: NotificationPayload = {
      id: `notif-${Date.now()}`,
      type: notification.type as NotificationEvent,
      title: notification.title || 'Notification',
      message: notification.message || '',
      priority: notification.priority || 'MEDIUM',
      ...notification,
      createdAt: new Date()
    }

    this.io.to(`org:${orgId}`).emit('notification', payload)
  }

  public async broadcastSystemNotification(notification: Partial<SiteWideNotificationPayload>) {
    await this.triggerSiteWideNotification(notification)
  }

  public getIO(): SocketIOServer {
    return this.io
  }
}

export default NotificationSocketServer