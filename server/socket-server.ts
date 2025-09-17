import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { parse } from 'cookie';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth-config';
import { prisma } from '../lib/prisma';
import Redis from 'ioredis';

// Types
interface SessionUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  organizationId?: string;
}

interface PresenceData {
  userId: string;
  threadId: string;
  status: 'active' | 'idle' | 'typing';
  lastSeen: Date;
  cursorPosition?: { x: number; y: number };
  metadata?: any;
}

interface TypingData {
  threadId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

interface MessageData {
  threadId: string;
  message: any;
  userId: string;
}

// Redis client for pub/sub and caching
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

const pubClient = redis;
const subClient = redis.duplicate();

// Store active connections
const activeConnections = new Map<string, Set<string>>(); // userId -> Set of socketIds
const socketUserMap = new Map<string, SessionUser>(); // socketId -> user
const threadPresence = new Map<string, Set<string>>(); // threadId -> Set of userIds
const typingUsers = new Map<string, Set<string>>(); // threadId -> Set of userIds

export class SocketServer {
  private io: SocketIOServer;
  
  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupRedisSubscriptions();
    this.setupSocketHandlers();
  }

  private setupRedisSubscriptions() {
    // Subscribe to Redis channels for cross-server communication
    subClient.subscribe('thread:message', 'thread:typing', 'thread:presence');
    
    subClient.on('message', (channel, message) => {
      const data = JSON.parse(message);
      
      switch (channel) {
        case 'thread:message':
          this.broadcastToThread(data.threadId, 'message:new', data);
          break;
        case 'thread:typing':
          this.broadcastToThread(data.threadId, 'typing:update', data);
          break;
        case 'thread:presence':
          this.broadcastToThread(data.threadId, 'presence:update', data);
          break;
      }
    });
  }

  private async authenticateSocket(socket: Socket): Promise<SessionUser | null> {
    try {
      // Get session from socket handshake
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) return null;

      const parsedCookies = parse(cookies);
      const sessionToken = parsedCookies['next-auth.session-token'] || 
                          parsedCookies['__Secure-next-auth.session-token'];
      
      if (!sessionToken) return null;

      // Validate session
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });

      if (!session || session.expires < new Date()) return null;

      return {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.name || session.user.email!,
        image: session.user.image || undefined,
        organizationId: (session.user as any).organizationId,
      };
    } catch (error) {
      console.error('Socket authentication error:', error);
      return null;
    }
  }

  private setupSocketHandlers() {
    // Middleware for authentication
    this.io.use(async (socket, next) => {
      const user = await this.authenticateSocket(socket);

      if (!user) {
        // For development: allow connection with demo user
        console.log('Authentication failed, using demo user for development');
        (socket as any).user = {
          id: 'demo-user',
          email: 'demo@example.com',
          name: 'Demo User',
          organizationId: 'demo-org'
        };
        return next();
      }

      // Attach user to socket
      (socket as any).user = user;
      next();
    });

    this.io.on('connection', (socket) => {
      const user = (socket as any).user as SessionUser;
      console.log(`User ${user.name} connected (${socket.id})`);

      // Track connection
      this.trackConnection(socket.id, user);

      // Handle thread operations
      socket.on('thread:join', async (threadId: string) => {
        await this.handleThreadJoin(socket, threadId, user);
      });

      socket.on('thread:leave', async (threadId: string) => {
        await this.handleThreadLeave(socket, threadId, user);
      });

      // Handle typing indicators
      socket.on('typing:start', async (data: { threadId: string }) => {
        await this.handleTypingStart(socket, data.threadId, user);
      });

      socket.on('typing:stop', async (data: { threadId: string }) => {
        await this.handleTypingStop(socket, data.threadId, user);
      });

      // Handle messages
      socket.on('message:send', async (data: MessageData) => {
        await this.handleMessageSend(socket, data, user);
      });

      socket.on('message:edit', async (data: any) => {
        await this.handleMessageEdit(socket, data, user);
      });

      socket.on('message:delete', async (data: any) => {
        await this.handleMessageDelete(socket, data, user);
      });

      // Handle presence
      socket.on('presence:update', async (data: Partial<PresenceData>) => {
        await this.handlePresenceUpdate(socket, data, user);
      });

      socket.on('cursor:move', async (data: any) => {
        await this.handleCursorMove(socket, data, user);
      });

      // Handle collaboration
      socket.on('collaborator:invite', async (data: any) => {
        await this.handleCollaboratorInvite(socket, data, user);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket, user);
      });

      // Send initial connection success
      socket.emit('connected', {
        userId: user.id,
        socketId: socket.id,
      });
    });
  }

  private trackConnection(socketId: string, user: SessionUser) {
    // Add to active connections
    if (!activeConnections.has(user.id)) {
      activeConnections.set(user.id, new Set());
    }
    activeConnections.get(user.id)!.add(socketId);
    socketUserMap.set(socketId, user);
  }

  private async handleThreadJoin(socket: Socket, threadId: string, user: SessionUser) {
    try {
      // Verify user has access to thread
      const hasAccess = await this.verifyThreadAccess(threadId, user.id);
      if (!hasAccess) {
        socket.emit('error', { message: 'Access denied to thread' });
        return;
      }

      // Join socket room
      socket.join(`thread:${threadId}`);

      // Track presence
      if (!threadPresence.has(threadId)) {
        threadPresence.set(threadId, new Set());
      }
      threadPresence.get(threadId)!.add(user.id);

      // Update presence in database
      await prisma.threadPresence.upsert({
        where: {
          threadId_userId: {
            threadId: threadId,
            userId: user.id,
          },
        },
        update: {
          status: 'active',
          lastSeen: new Date(),
          socketId: socket.id,
        },
        create: {
          threadId: threadId,
          userId: user.id,
          status: 'active',
          socketId: socket.id,
        },
      });

      // Get current presence list
      const presence = await this.getThreadPresence(threadId);

      // Notify others in thread
      socket.to(`thread:${threadId}`).emit('user:joined', {
        userId: user.id,
        userName: user.name,
        userImage: user.image,
      });

      // Send current presence to joining user
      socket.emit('presence:list', presence);

      // Publish to Redis for other servers
      await pubClient.publish('thread:presence', JSON.stringify({
        threadId,
        userId: user.id,
        action: 'join',
        presence,
      }));

    } catch (error) {
      console.error('Error joining thread:', error);
      socket.emit('error', { message: 'Failed to join thread' });
    }
  }

  private async handleThreadLeave(socket: Socket, threadId: string, user: SessionUser) {
    try {
      // Leave socket room
      socket.leave(`thread:${threadId}`);

      // Remove from presence tracking
      threadPresence.get(threadId)?.delete(user.id);
      typingUsers.get(threadId)?.delete(user.id);

      // Update database
      await prisma.threadPresence.deleteMany({
        where: {
          threadId: threadId,
          userId: user.id,
        },
      });

      // Notify others
      socket.to(`thread:${threadId}`).emit('user:left', {
        userId: user.id,
      });

      // Publish to Redis
      await pubClient.publish('thread:presence', JSON.stringify({
        threadId,
        userId: user.id,
        action: 'leave',
      }));

    } catch (error) {
      console.error('Error leaving thread:', error);
    }
  }

  private async handleTypingStart(socket: Socket, threadId: string, user: SessionUser) {
    // Track typing user
    if (!typingUsers.has(threadId)) {
      typingUsers.set(threadId, new Set());
    }
    typingUsers.get(threadId)!.add(user.id);

    // Broadcast to thread
    const typingData: TypingData = {
      threadId,
      userId: user.id,
      userName: user.name,
      isTyping: true,
    };

    socket.to(`thread:${threadId}`).emit('typing:update', typingData);

    // Publish to Redis
    await pubClient.publish('thread:typing', JSON.stringify(typingData));

    // Auto-stop typing after 5 seconds
    setTimeout(() => {
      this.handleTypingStop(socket, threadId, user);
    }, 5000);
  }

  private async handleTypingStop(socket: Socket, threadId: string, user: SessionUser) {
    // Remove from typing users
    typingUsers.get(threadId)?.delete(user.id);

    // Broadcast to thread
    const typingData: TypingData = {
      threadId,
      userId: user.id,
      userName: user.name,
      isTyping: false,
    };

    socket.to(`thread:${threadId}`).emit('typing:update', typingData);

    // Publish to Redis
    await pubClient.publish('thread:typing', JSON.stringify(typingData));
  }

  private async handleMessageSend(socket: Socket, data: MessageData, user: SessionUser) {
    try {
      // Verify access
      const hasAccess = await this.verifyThreadAccess(data.threadId, user.id);
      if (!hasAccess) {
        socket.emit('error', { message: 'Cannot send message to this thread' });
        return;
      }

      // Save message to database
      const message = await prisma.aIMessage.create({
        data: {
          threadId: data.threadId,
          role: 'USER' as const,
          content: data.message.content,
          metadata: data.message.metadata || {},
        },
      });

      // Update thread
      await prisma.aIThread.update({
        where: { id: data.threadId },
        data: {
          lastMessageAt: new Date(),
          messageCount: { increment: 1 },
        },
      });

      // Broadcast to all users in thread
      this.io.to(`thread:${data.threadId}`).emit('message:new', {
        threadId: data.threadId,
        message: {
          ...message,
          user: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
        },
      });

      // Stop typing indicator
      await this.handleTypingStop(socket, data.threadId, user);

      // Publish to Redis
      await pubClient.publish('thread:message', JSON.stringify({
        threadId: data.threadId,
        message,
        userId: user.id,
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private async handleMessageEdit(socket: Socket, data: any, user: SessionUser) {
    try {
      // Verify ownership or edit permission
      const message = await prisma.aIMessage.findUnique({
        where: { id: data.messageId },
      });

      if (!message) {
        socket.emit('error', { message: 'Cannot edit this message' });
        return;
      }

      // Update message
      const updated = await prisma.aIMessage.update({
        where: { id: data.messageId },
        data: {
          content: data.content,
          editedAt: new Date(),
        },
      });

      // Broadcast update
      this.io.to(`thread:${message.threadId}`).emit('message:edited', {
        threadId: message.threadId,
        messageId: data.messageId,
        content: data.content,
        editedBy: user.id,
        editedAt: new Date(),
      });

    } catch (error) {
      console.error('Error editing message:', error);
      socket.emit('error', { message: 'Failed to edit message' });
    }
  }

  private async handleMessageDelete(socket: Socket, data: any, user: SessionUser) {
    try {
      // Verify ownership or delete permission
      const message = await prisma.aIMessage.findUnique({
        where: { id: data.messageId },
      });

      if (!message) {
        socket.emit('error', { message: 'Cannot delete this message' });
        return;
      }

      // Soft delete message
      await prisma.aIMessage.update({
        where: { id: data.messageId },
        data: {
          metadata: {
            ...(message.metadata as any),
            deleted: true,
            deletedBy: user.id,
            deletedAt: new Date(),
          },
        },
      });

      // Broadcast deletion
      this.io.to(`thread:${message.threadId}`).emit('message:deleted', {
        threadId: message.threadId,
        messageId: data.messageId,
        deletedBy: user.id,
      });

    } catch (error) {
      console.error('Error deleting message:', error);
      socket.emit('error', { message: 'Failed to delete message' });
    }
  }

  private async handlePresenceUpdate(socket: Socket, data: Partial<PresenceData>, user: SessionUser) {
    if (!data.threadId) return;

    try {
      // Update presence in database
      await prisma.threadPresence.upsert({
        where: {
          threadId_userId: {
            threadId: data.threadId,
            userId: user.id,
          },
        },
        update: {
          status: data.status || 'active',
          lastSeen: new Date(),
          cursorPosition: data.cursorPosition,
        },
        create: {
          threadId: data.threadId,
          userId: user.id,
          status: data.status || 'active',
          lastSeen: new Date(),
          cursorPosition: data.cursorPosition,
        },
      });

      // Broadcast to thread
      socket.to(`thread:${data.threadId}`).emit('presence:update', {
        userId: user.id,
        ...data,
      });

    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }

  private async handleCursorMove(socket: Socket, data: any, user: SessionUser) {
    if (!data.threadId || !data.position) return;

    // Throttle cursor updates
    socket.to(`thread:${data.threadId}`).emit('cursor:move', {
      userId: user.id,
      position: data.position,
      color: data.color || this.getUserColor(user.id),
    });
  }

  private async handleCollaboratorInvite(socket: Socket, data: any, user: SessionUser) {
    try {
      // Verify user can invite
      const canInvite = await this.canInviteCollaborators(data.threadId, user.id);
      if (!canInvite) {
        socket.emit('error', { message: 'Cannot invite collaborators to this thread' });
        return;
      }

      // Create invitation (handled by existing API)
      // Just notify real-time
      this.io.to(`thread:${data.threadId}`).emit('collaborator:invited', {
        threadId: data.threadId,
        invitedBy: user.name,
        invitedEmail: data.email,
      });

    } catch (error) {
      console.error('Error inviting collaborator:', error);
      socket.emit('error', { message: 'Failed to invite collaborator' });
    }
  }

  private handleDisconnect(socket: Socket, user: SessionUser) {
    console.log(`User ${user.name} disconnected (${socket.id})`);

    // Remove from active connections
    activeConnections.get(user.id)?.delete(socket.id);
    if (activeConnections.get(user.id)?.size === 0) {
      activeConnections.delete(user.id);
    }
    socketUserMap.delete(socket.id);

    // Update presence for all threads
    const rooms = Array.from(socket.rooms).filter(room => room.startsWith('thread:'));
    rooms.forEach(room => {
      const threadId = room.replace('thread:', '');
      
      // Remove from presence if no other connections
      if (!activeConnections.has(user.id)) {
        threadPresence.get(threadId)?.delete(user.id);
        typingUsers.get(threadId)?.delete(user.id);

        // Notify others
        socket.to(room).emit('user:disconnected', {
          userId: user.id,
        });

        // Update database
        prisma.threadPresence.deleteMany({
          where: {
            threadId: threadId,
            userId: user.id,
          },
        }).catch(console.error);
      }
    });
  }

  // Helper methods
  private async verifyThreadAccess(threadId: string, userId: string): Promise<boolean> {
    const thread = await prisma.aIThread.findFirst({
      where: {
        id: threadId,
        OR: [
          { userId },
          {
            collaborators: {
              some: { userId },
            },
          },
          { shareId: { not: null } }, // Public threads
        ],
      },
    });

    return !!thread;
  }

  private async hasEditPermission(threadId: string, userId: string): Promise<boolean> {
    const collaborator = await prisma.threadCollaborator.findFirst({
      where: {
        threadId,
        userId,
        role: { in: ['EDITOR', 'ADMIN'] },
      },
    });

    return !!collaborator;
  }

  private async hasDeletePermission(threadId: string, userId: string): Promise<boolean> {
    const thread = await prisma.aIThread.findFirst({
      where: {
        id: threadId,
        userId, // Only owner can delete
      },
    });

    return !!thread;
  }

  private async canInviteCollaborators(threadId: string, userId: string): Promise<boolean> {
    const thread = await prisma.aIThread.findFirst({
      where: {
        id: threadId,
        OR: [
          { userId }, // Owner
          {
            collaborators: {
              some: {
                userId,
                role: 'ADMIN',
              },
            },
          },
        ],
      },
    });

    return !!thread;
  }

  private async getThreadPresence(threadId: string) {
    const presence = await prisma.threadPresence.findMany({
      where: {
        threadId: threadId,
        lastSeen: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // Active in last 5 minutes
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return presence.map((p: any) => ({
      userId: p.userId,
      userName: p.user.name || p.user.email,
      userImage: p.user.image,
      status: p.status,
      lastSeen: p.lastSeen,
    }));
  }

  private getUserColor(userId: string): string {
    // Generate consistent color for user
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
      '#98D8C8', '#6C5CE7', '#A8E6CF', '#FFD3B6',
    ];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  private broadcastToThread(threadId: string, event: string, data: any) {
    this.io.to(`thread:${threadId}`).emit(event, data);
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

export default SocketServer;