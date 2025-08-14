'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { toast } from 'sonner'

interface WebSocketMessage {
  type: 'participant_joined' | 'participant_left' | 'typing_start' | 'typing_stop' | 
        'message' | 'presence_update' | 'model_changed' | 'cost_update' | 
        'thread_update' | 'error' | 'ping' | 'pong'
  data: any
  timestamp: string
  userId?: string
  threadId?: string
}

interface WebSocketState {
  isConnected: boolean
  isReconnecting: boolean
  participants: Map<string, any>
  typingUsers: Set<string>
  lastActivity: Date | null
  reconnectAttempts: number
}

class WebSocketService {
  private ws: WebSocket | null = null
  private url: string
  private reconnectTimeout: NodeJS.Timeout | null = null
  private pingInterval: NodeJS.Timeout | null = null
  private listeners: Map<string, Set<Function>> = new Map()
  private messageQueue: WebSocketMessage[] = []
  private state: WebSocketState = {
    isConnected: false,
    isReconnecting: false,
    participants: new Map(),
    typingUsers: new Set(),
    lastActivity: null,
    reconnectAttempts: 0
  }

  constructor(url?: string) {
    // Use environment variable or default to local development
    this.url = url || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
  }

  connect(userId: string, threadId?: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      const wsUrl = `${this.url}?userId=${userId}${threadId ? `&threadId=${threadId}` : ''}`
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.state.isConnected = true
        this.state.isReconnecting = false
        this.state.reconnectAttempts = 0
        
        // Send any queued messages
        this.flushMessageQueue()
        
        // Start ping interval
        this.startPingInterval()
        
        // Notify listeners
        this.emit('connected', { userId, threadId })
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.emit('error', error)
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.state.isConnected = false
        this.stopPingInterval()
        
        // Attempt to reconnect
        this.reconnect(userId, threadId)
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      this.reconnect(userId, threadId)
    }
  }

  private reconnect(userId: string, threadId?: string) {
    if (this.state.isReconnecting) return
    
    this.state.isReconnecting = true
    this.state.reconnectAttempts++
    
    const delay = Math.min(1000 * Math.pow(2, this.state.reconnectAttempts), 30000)
    
    this.reconnectTimeout = setTimeout(() => {
      console.log(`Attempting to reconnect... (attempt ${this.state.reconnectAttempts})`)
      this.connect(userId, threadId)
    }, delay)
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    
    this.stopPingInterval()
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this.state.isConnected = false
    this.state.isReconnecting = false
    this.state.participants.clear()
    this.state.typingUsers.clear()
  }

  send(message: Omit<WebSocketMessage, 'timestamp'>) {
    const fullMessage: WebSocketMessage = {
      ...message,
      timestamp: new Date().toISOString()
    }
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(fullMessage))
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(fullMessage)
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift()
      if (message) {
        this.ws.send(JSON.stringify(message))
      }
    }
  }

  private handleMessage(message: WebSocketMessage) {
    this.state.lastActivity = new Date()
    
    switch (message.type) {
      case 'participant_joined':
        this.state.participants.set(message.data.userId, message.data)
        this.emit('participant_joined', message.data)
        break
        
      case 'participant_left':
        this.state.participants.delete(message.data.userId)
        this.state.typingUsers.delete(message.data.userId)
        this.emit('participant_left', message.data)
        break
        
      case 'typing_start':
        this.state.typingUsers.add(message.data.userId)
        this.emit('typing_start', message.data)
        break
        
      case 'typing_stop':
        this.state.typingUsers.delete(message.data.userId)
        this.emit('typing_stop', message.data)
        break
        
      case 'presence_update':
        if (this.state.participants.has(message.data.userId)) {
          const participant = this.state.participants.get(message.data.userId)
          this.state.participants.set(message.data.userId, {
            ...participant,
            ...message.data
          })
        }
        this.emit('presence_update', message.data)
        break
        
      case 'message':
        this.emit('message', message.data)
        break
        
      case 'model_changed':
        this.emit('model_changed', message.data)
        break
        
      case 'cost_update':
        this.emit('cost_update', message.data)
        break
        
      case 'thread_update':
        this.emit('thread_update', message.data)
        break
        
      case 'pong':
        // Server responded to ping
        break
        
      default:
        console.warn('Unknown WebSocket message type:', message.type)
    }
  }

  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', data: {} })
      }
    }, 30000) // Ping every 30 seconds
  }

  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)?.add(callback)
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback)
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in WebSocket event listener for ${event}:`, error)
      }
    })
  }

  getState(): WebSocketState {
    return { ...this.state }
  }

  // Helper methods for common actions
  startTyping(threadId: string, userId: string) {
    this.send({
      type: 'typing_start',
      data: { userId },
      threadId
    })
  }

  stopTyping(threadId: string, userId: string) {
    this.send({
      type: 'typing_stop',
      data: { userId },
      threadId
    })
  }

  updatePresence(status: 'online' | 'away' | 'offline', userId: string) {
    this.send({
      type: 'presence_update',
      data: { status, userId }
    })
  }

  broadcastModelChange(model: string, threadId: string, userId: string) {
    this.send({
      type: 'model_changed',
      data: { model, userId },
      threadId
    })
  }

  broadcastCostUpdate(cost: number, threadId: string, userId: string) {
    this.send({
      type: 'cost_update',
      data: { cost, userId },
      threadId
    })
  }
}

// Singleton instance
let wsService: WebSocketService | null = null

export function getWebSocketService(): WebSocketService {
  if (!wsService) {
    wsService = new WebSocketService()
  }
  return wsService
}

// React Hook for WebSocket
export function useWebSocket(userId?: string, threadId?: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [participants, setParticipants] = useState<Map<string, any>>(new Map())
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const wsRef = useRef<WebSocketService | null>(null)

  useEffect(() => {
    if (!userId) return

    const ws = getWebSocketService()
    wsRef.current = ws

    // Connect
    ws.connect(userId, threadId)

    // Set up event listeners
    const handleConnected = () => setIsConnected(true)
    const handleDisconnected = () => setIsConnected(false)
    const handleParticipantJoined = (data: any) => {
      setParticipants(prev => new Map(prev).set(data.userId, data))
    }
    const handleParticipantLeft = (data: any) => {
      setParticipants(prev => {
        const newMap = new Map(prev)
        newMap.delete(data.userId)
        return newMap
      })
    }
    const handleTypingStart = (data: any) => {
      setTypingUsers(prev => new Set(prev).add(data.userId))
    }
    const handleTypingStop = (data: any) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(data.userId)
        return newSet
      })
    }

    ws.on('connected', handleConnected)
    ws.on('disconnected', handleDisconnected)
    ws.on('participant_joined', handleParticipantJoined)
    ws.on('participant_left', handleParticipantLeft)
    ws.on('typing_start', handleTypingStart)
    ws.on('typing_stop', handleTypingStop)

    // Update state from WebSocket service
    const state = ws.getState()
    setIsConnected(state.isConnected)
    setParticipants(state.participants)
    setTypingUsers(state.typingUsers)

    return () => {
      ws.off('connected', handleConnected)
      ws.off('disconnected', handleDisconnected)
      ws.off('participant_joined', handleParticipantJoined)
      ws.off('participant_left', handleParticipantLeft)
      ws.off('typing_start', handleTypingStart)
      ws.off('typing_stop', handleTypingStop)
    }
  }, [userId, threadId])

  const startTyping = useCallback(() => {
    if (wsRef.current && threadId && userId) {
      wsRef.current.startTyping(threadId, userId)
    }
  }, [threadId, userId])

  const stopTyping = useCallback(() => {
    if (wsRef.current && threadId && userId) {
      wsRef.current.stopTyping(threadId, userId)
    }
  }, [threadId, userId])

  const updatePresence = useCallback((status: 'online' | 'away' | 'offline') => {
    if (wsRef.current && userId) {
      wsRef.current.updatePresence(status, userId)
    }
  }, [userId])

  const broadcastModelChange = useCallback((model: string) => {
    if (wsRef.current && threadId && userId) {
      wsRef.current.broadcastModelChange(model, threadId, userId)
    }
  }, [threadId, userId])

  const broadcastCostUpdate = useCallback((cost: number) => {
    if (wsRef.current && threadId && userId) {
      wsRef.current.broadcastCostUpdate(cost, threadId, userId)
    }
  }, [threadId, userId])

  return {
    isConnected,
    participants: Array.from(participants.values()),
    typingUsers: Array.from(typingUsers),
    startTyping,
    stopTyping,
    updatePresence,
    broadcastModelChange,
    broadcastCostUpdate,
    service: wsRef.current
  }
}

// Server-side WebSocket handler (for reference)
export const wsServerExample = `
// app/api/websocket/route.ts
import { Server } from 'socket.io'
import { NextResponse } from 'next/server'

// This would typically be in a separate WebSocket server
// For production, consider using Pusher, Ably, or Socket.io on a separate service

export async function GET(req: Request) {
  return NextResponse.json({ 
    message: 'WebSocket endpoint - use ws:// protocol',
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
  })
}
`