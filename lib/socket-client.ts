import { io, Socket } from 'socket.io-client';
import { EventEmitter } from 'events';

export interface SocketUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface PresenceUser {
  userId: string;
  userName: string;
  userImage?: string;
  status: 'active' | 'idle' | 'typing';
  lastSeen: Date;
}

export interface TypingUser {
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface Message {
  id: string;
  threadId: string;
  content: string;
  role: string;
  user?: SocketUser;
  createdAt: Date;
  editedAt?: Date;
  metadata?: any;
}

class SocketClient extends EventEmitter {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private currentThreadId: string | null = null;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  constructor() {
    super();
    this.setMaxListeners(20); // Increase max listeners for multiple components
  }

  async connect(): Promise<void> {
    if (this.socket?.connected) {
      return Promise.resolve();
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '/', {
          transports: ['websocket', 'polling'],
          withCredentials: true,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
          reconnectionDelayMax: 10000,
        });

        this.setupEventHandlers();

        this.socket.on('connect', () => {
          console.log('✅ Connected to WebSocket server');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error.message);
          this.isConnected = false;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.emit('connection_failed', error);
            reject(error);
          }
          
          this.reconnectAttempts++;
        });

      } catch (error) {
        console.error('Failed to create socket:', error);
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnected', reason);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.emit('reconnected');
      
      // Rejoin current thread if any
      if (this.currentThreadId) {
        this.joinThread(this.currentThreadId);
      }
    });

    // Thread events
    this.socket.on('user:joined', (data) => {
      this.emit('user_joined', data);
    });

    this.socket.on('user:left', (data) => {
      this.emit('user_left', data);
    });

    this.socket.on('user:disconnected', (data) => {
      this.emit('user_disconnected', data);
    });

    // Presence events
    this.socket.on('presence:list', (users: PresenceUser[]) => {
      this.emit('presence_list', users);
    });

    this.socket.on('presence:update', (data) => {
      this.emit('presence_update', data);
    });

    // Typing events
    this.socket.on('typing:update', (data: TypingUser) => {
      this.emit('typing_update', data);
    });

    // Message events
    this.socket.on('message:new', (data) => {
      this.emit('message_new', data);
    });

    this.socket.on('message:edited', (data) => {
      this.emit('message_edited', data);
    });

    this.socket.on('message:deleted', (data) => {
      this.emit('message_deleted', data);
    });

    // Cursor events
    this.socket.on('cursor:move', (data) => {
      this.emit('cursor_move', data);
    });

    // Collaboration events
    this.socket.on('collaborator:invited', (data) => {
      this.emit('collaborator_invited', data);
    });

    // Error events
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('error', error);
    });
  }

  async joinThread(threadId: string): Promise<void> {
    if (!this.socket?.connected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      // Leave previous thread if any
      if (this.currentThreadId && this.currentThreadId !== threadId) {
        this.leaveThread(this.currentThreadId);
      }

      this.socket.emit('thread:join', threadId);
      this.currentThreadId = threadId;

      // Wait for presence list to confirm join
      const timeout = setTimeout(() => {
        reject(new Error('Join thread timeout'));
      }, 5000);

      const handlePresenceList = () => {
        clearTimeout(timeout);
        this.off('presence_list', handlePresenceList);
        resolve();
      };

      this.once('presence_list', handlePresenceList);
    });
  }

  leaveThread(threadId: string) {
    if (!this.socket?.connected) return;
    
    this.socket.emit('thread:leave', threadId);
    
    if (this.currentThreadId === threadId) {
      this.currentThreadId = null;
    }
  }

  startTyping(threadId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing:start', { threadId });
  }

  stopTyping(threadId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing:stop', { threadId });
  }

  sendMessage(threadId: string, message: any) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Send message timeout'));
      }, 10000);

      const handleMessageNew = (data: any) => {
        if (data.message.content === message.content) {
          clearTimeout(timeout);
          this.off('message_new', handleMessageNew);
          resolve(data.message);
        }
      };

      this.on('message_new', handleMessageNew);
      
      this.socket!.emit('message:send', {
        threadId,
        message,
      });
    });
  }

  editMessage(messageId: string, content: string) {
    if (!this.socket?.connected) return;
    
    this.socket.emit('message:edit', {
      messageId,
      content,
    });
  }

  deleteMessage(messageId: string) {
    if (!this.socket?.connected) return;
    
    this.socket.emit('message:delete', {
      messageId,
    });
  }

  updatePresence(threadId: string, status: 'active' | 'idle' | 'typing') {
    if (!this.socket?.connected) return;
    
    this.socket.emit('presence:update', {
      threadId,
      status,
    });
  }

  moveCursor(threadId: string, position: { x: number; y: number }) {
    if (!this.socket?.connected) return;
    
    this.socket.emit('cursor:move', {
      threadId,
      position,
    });
  }

  inviteCollaborator(threadId: string, email: string, role: string) {
    if (!this.socket?.connected) return;
    
    this.socket.emit('collaborator:invite', {
      threadId,
      email,
      role,
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentThreadId = null;
      this.connectionPromise = null;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getCurrentThread(): string | null {
    return this.currentThreadId;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

// Create singleton instance
const socketClient = new SocketClient();

// Auto-connect in browser environment
if (typeof window !== 'undefined') {
  socketClient.connect().catch(console.error);
}

export default socketClient;