import { useState, useEffect, useCallback, useRef } from 'react';
import socketClient, { PresenceUser, TypingUser, Message } from '@/lib/socket-client';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface UseSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: any) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const connectionAttempted = useRef(false);

  useEffect(() => {
    if (!session?.user || connectionAttempted.current) return;
    if (options.autoConnect === false) return;

    connectionAttempted.current = true;
    setIsConnecting(true);

    socketClient.connect()
      .then(() => {
        setIsConnected(true);
        setIsConnecting(false);
        options.onConnect?.();
      })
      .catch((error) => {
        console.error('Socket connection failed:', error);
        setIsConnecting(false);
        options.onError?.(error);
      });

    // Set up event listeners
    const handleConnected = () => {
      setIsConnected(true);
      options.onConnect?.();
    };

    const handleDisconnected = (reason: string) => {
      setIsConnected(false);
      options.onDisconnect?.(reason);
    };

    const handleError = (error: any) => {
      options.onError?.(error);
    };

    socketClient.on('connected', handleConnected);
    socketClient.on('disconnected', handleDisconnected);
    socketClient.on('error', handleError);

    return () => {
      socketClient.off('connected', handleConnected);
      socketClient.off('disconnected', handleDisconnected);
      socketClient.off('error', handleError);
    };
  }, [session, options.autoConnect]);

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      await socketClient.connect();
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    socketClient.disconnect();
    setIsConnected(false);
    connectionAttempted.current = false;
  }, []);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    socket: socketClient,
  };
}

interface UseThreadSocketOptions {
  threadId: string | null;
  onUserJoined?: (user: any) => void;
  onUserLeft?: (user: any) => void;
  onMessageReceived?: (message: Message) => void;
  onMessageEdited?: (data: any) => void;
  onMessageDeleted?: (data: any) => void;
  onTypingUpdate?: (user: TypingUser) => void;
  onPresenceUpdate?: (presence: PresenceUser[]) => void;
}

export function useThreadSocket({
  threadId,
  onUserJoined,
  onUserLeft,
  onMessageReceived,
  onMessageEdited,
  onMessageDeleted,
  onTypingUpdate,
  onPresenceUpdate,
}: UseThreadSocketOptions) {
  const [presence, setPresence] = useState<PresenceUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());
  const [isJoining, setIsJoining] = useState(false);
  const currentThreadRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Join thread when threadId changes
  useEffect(() => {
    if (!threadId || threadId === currentThreadRef.current) return;

    setIsJoining(true);
    currentThreadRef.current = threadId;

    socketClient.joinThread(threadId)
      .then(() => {
        setIsJoining(false);
        console.log(`Joined thread: ${threadId}`);
      })
      .catch((error) => {
        setIsJoining(false);
        console.error('Failed to join thread:', error);
        toast.error('Failed to join thread');
      });

    return () => {
      if (currentThreadRef.current) {
        socketClient.leaveThread(currentThreadRef.current);
      }
    };
  }, [threadId]);

  // Set up event listeners
  useEffect(() => {
    const handleUserJoined = (user: any) => {
      onUserJoined?.(user);
      toast.info(`${user.userName} joined the thread`);
    };

    const handleUserLeft = (user: any) => {
      onUserLeft?.(user);
      // Remove from typing users
      setTypingUsers(prev => {
        const next = new Map(prev);
        next.delete(user.userId);
        return next;
      });
    };

    const handlePresenceList = (users: PresenceUser[]) => {
      setPresence(users);
      onPresenceUpdate?.(users);
    };

    const handlePresenceUpdate = (data: any) => {
      setPresence(prev => {
        const index = prev.findIndex(p => p.userId === data.userId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...data };
          return updated;
        }
        return prev;
      });
    };

    const handleTypingUpdate = (user: TypingUser) => {
      setTypingUsers(prev => {
        const next = new Map(prev);
        if (user.isTyping) {
          next.set(user.userId, user);
        } else {
          next.delete(user.userId);
        }
        return next;
      });
      onTypingUpdate?.(user);
    };

    const handleMessageNew = (data: any) => {
      onMessageReceived?.(data.message);
      // Clear typing indicator for this user
      setTypingUsers(prev => {
        const next = new Map(prev);
        next.delete(data.message.user?.id);
        return next;
      });
    };

    const handleMessageEdited = (data: any) => {
      onMessageEdited?.(data);
    };

    const handleMessageDeleted = (data: any) => {
      onMessageDeleted?.(data);
    };

    // Register event listeners
    socketClient.on('user_joined', handleUserJoined);
    socketClient.on('user_left', handleUserLeft);
    socketClient.on('presence_list', handlePresenceList);
    socketClient.on('presence_update', handlePresenceUpdate);
    socketClient.on('typing_update', handleTypingUpdate);
    socketClient.on('message_new', handleMessageNew);
    socketClient.on('message_edited', handleMessageEdited);
    socketClient.on('message_deleted', handleMessageDeleted);

    return () => {
      socketClient.off('user_joined', handleUserJoined);
      socketClient.off('user_left', handleUserLeft);
      socketClient.off('presence_list', handlePresenceList);
      socketClient.off('presence_update', handlePresenceUpdate);
      socketClient.off('typing_update', handleTypingUpdate);
      socketClient.off('message_new', handleMessageNew);
      socketClient.off('message_edited', handleMessageEdited);
      socketClient.off('message_deleted', handleMessageDeleted);
    };
  }, [onUserJoined, onUserLeft, onMessageReceived, onMessageEdited, onMessageDeleted, onTypingUpdate, onPresenceUpdate]);

  // Typing indicator management
  const startTyping = useCallback(() => {
    if (!threadId) return;

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socketClient.startTyping(threadId);

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [threadId]);

  const stopTyping = useCallback(() => {
    if (!threadId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    socketClient.stopTyping(threadId);
  }, [threadId]);

  // Message operations
  const sendMessage = useCallback(async (message: any) => {
    if (!threadId) throw new Error('No thread selected');
    
    stopTyping(); // Stop typing when sending
    return await socketClient.sendMessage(threadId, message);
  }, [threadId, stopTyping]);

  const editMessage = useCallback((messageId: string, content: string) => {
    socketClient.editMessage(messageId, content);
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    socketClient.deleteMessage(messageId);
  }, []);

  // Presence operations
  const updatePresence = useCallback((status: 'active' | 'idle' | 'typing') => {
    if (!threadId) return;
    socketClient.updatePresence(threadId, status);
  }, [threadId]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    presence,
    typingUsers: Array.from(typingUsers.values()),
    isJoining,
    startTyping,
    stopTyping,
    sendMessage,
    editMessage,
    deleteMessage,
    updatePresence,
  };
}

// Hook for cursor tracking in collaborative editing
export function useCursorTracking(threadId: string | null) {
  const [cursors, setCursors] = useState<Map<string, { position: { x: number; y: number }; color: string }>>(new Map());
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const throttleRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleCursorMove = (data: any) => {
      setCursors(prev => {
        const next = new Map(prev);
        next.set(data.userId, {
          position: data.position,
          color: data.color,
        });
        return next;
      });
    };

    const handleUserLeft = (data: any) => {
      setCursors(prev => {
        const next = new Map(prev);
        next.delete(data.userId);
        return next;
      });
    };

    socketClient.on('cursor_move', handleCursorMove);
    socketClient.on('user_left', handleUserLeft);
    socketClient.on('user_disconnected', handleUserLeft);

    return () => {
      socketClient.off('cursor_move', handleCursorMove);
      socketClient.off('user_left', handleUserLeft);
      socketClient.off('user_disconnected', handleUserLeft);
    };
  }, []);

  const moveCursor = useCallback((position: { x: number; y: number }) => {
    if (!threadId) return;

    // Throttle cursor updates to reduce network traffic
    if (throttleRef.current) return;

    // Only send if position changed significantly
    if (lastPositionRef.current) {
      const dx = Math.abs(position.x - lastPositionRef.current.x);
      const dy = Math.abs(position.y - lastPositionRef.current.y);
      if (dx < 5 && dy < 5) return;
    }

    lastPositionRef.current = position;
    socketClient.moveCursor(threadId, position);

    throttleRef.current = setTimeout(() => {
      throttleRef.current = null;
    }, 50); // Throttle to max 20 updates per second
  }, [threadId]);

  return {
    cursors: Array.from(cursors.entries()).map(([userId, data]) => ({
      userId,
      ...data,
    })),
    moveCursor,
  };
}