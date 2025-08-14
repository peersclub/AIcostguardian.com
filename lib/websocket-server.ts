import { Server } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { safeDecrypt } from '@/lib/crypto-helper'

let io: Server | null = null

export function initWebSocketServer(httpServer: HTTPServer) {
  if (io) return io

  io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      credentials: true
    },
    path: '/api/socketio'
  })

  io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id)

    // Authenticate user
    socket.on('authenticate', async (data) => {
      try {
        const { sessionToken } = data
        // Validate session token
        // This is simplified - in production, validate against NextAuth session
        const userId = data.userId
        
        if (!userId) {
          socket.emit('auth_error', { error: 'Invalid session' })
          socket.disconnect()
          return
        }

        // Join user room
        socket.join(`user:${userId}`)
        socket.emit('authenticated', { success: true })

        // Set user data on socket
        socket.data.userId = userId
      } catch (error) {
        console.error('Auth error:', error)
        socket.emit('auth_error', { error: 'Authentication failed' })
        socket.disconnect()
      }
    })

    // Handle joining thread room
    socket.on('join_thread', async (data) => {
      try {
        const { threadId } = data
        const userId = socket.data.userId

        if (!userId) {
          socket.emit('error', { error: 'Not authenticated' })
          return
        }

        // Verify user has access to thread
        const thread = await prisma.aIThread.findFirst({
          where: {
            id: threadId,
            userId
          }
        })

        if (!thread) {
          socket.emit('error', { error: 'Thread not found or unauthorized' })
          return
        }

        // Join thread room
        socket.join(`thread:${threadId}`)
        socket.emit('joined_thread', { threadId })

        // Notify other users in thread
        socket.to(`thread:${threadId}`).emit('user_joined', {
          userId,
          socketId: socket.id
        })
      } catch (error) {
        console.error('Join thread error:', error)
        socket.emit('error', { error: 'Failed to join thread' })
      }
    })

    // Handle leaving thread room
    socket.on('leave_thread', (data) => {
      const { threadId } = data
      const userId = socket.data.userId

      socket.leave(`thread:${threadId}`)
      
      // Notify other users
      socket.to(`thread:${threadId}`).emit('user_left', {
        userId,
        socketId: socket.id
      })
    })

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { threadId } = data
      const userId = socket.data.userId

      socket.to(`thread:${threadId}`).emit('user_typing', {
        userId,
        isTyping: true
      })
    })

    socket.on('typing_stop', (data) => {
      const { threadId } = data
      const userId = socket.data.userId

      socket.to(`thread:${threadId}`).emit('user_typing', {
        userId,
        isTyping: false
      })
    })

    // Handle streaming AI responses
    socket.on('stream_message', async (data) => {
      try {
        const { threadId, message, model, provider } = data
        const userId = socket.data.userId

        if (!userId) {
          socket.emit('error', { error: 'Not authenticated' })
          return
        }

        // Get user and API keys
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            apiKeys: {
              where: {
                provider: provider.toLowerCase(),
                isActive: true
              }
            }
          }
        })

        if (!user || !user.apiKeys.length) {
          socket.emit('error', { error: `No API key for ${provider}` })
          return
        }

        const apiKey = safeDecrypt(user.apiKeys[0].encryptedKey)

        // Create user message
        const userMessage = await prisma.aIMessage.create({
          data: {
            threadId,
            role: 'USER',
            content: message,
            selectedModel: model,
            selectedProvider: provider,
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            cost: 0
          }
        })

        // Emit message created event
        io?.to(`thread:${threadId}`).emit('message_created', {
          message: userMessage
        })

        // Stream AI response
        let assistantContent = ''
        let promptTokens = 0
        let completionTokens = 0

        if (provider.toLowerCase() === 'openai') {
          const openai = new OpenAI({ apiKey })
          
          const stream = await openai.chat.completions.create({
            model,
            messages: [{ role: 'user', content: message }],
            stream: true
          })

          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content || ''
            if (delta) {
              assistantContent += delta
              
              // Emit streaming chunk to thread room
              io?.to(`thread:${threadId}`).emit('stream_chunk', {
                messageId: userMessage.id,
                chunk: delta
              })
            }
          }
        } else if (provider.toLowerCase() === 'anthropic') {
          const anthropic = new Anthropic({ apiKey })
          
          const stream = await anthropic.messages.create({
            model,
            messages: [{ role: 'user', content: message }],
            max_tokens: 4096,
            stream: true
          })

          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta') {
              const delta = (chunk.delta as any).text || ''
              assistantContent += delta
              
              // Emit streaming chunk
              io?.to(`thread:${threadId}`).emit('stream_chunk', {
                messageId: userMessage.id,
                chunk: delta
              })
            }
          }
        }

        // Estimate tokens
        promptTokens = Math.ceil(message.length / 4)
        completionTokens = Math.ceil(assistantContent.length / 4)
        const totalTokens = promptTokens + completionTokens

        // Calculate cost (simplified)
        let cost = 0
        if (model.includes('gpt-4')) {
          cost = (promptTokens * 0.03 + completionTokens * 0.06) / 1000
        } else if (model.includes('gpt-3.5')) {
          cost = (promptTokens * 0.0005 + completionTokens * 0.0015) / 1000
        }

        // Create assistant message
        const assistantMessage = await prisma.aIMessage.create({
          data: {
            threadId,
            role: 'ASSISTANT',
            content: assistantContent,
            selectedModel: model,
            selectedProvider: provider,
            promptTokens,
            completionTokens,
            totalTokens,
            cost
          }
        })

        // Emit completion event
        io?.to(`thread:${threadId}`).emit('stream_complete', {
          messageId: userMessage.id,
          assistantMessage,
          usage: {
            promptTokens,
            completionTokens,
            totalTokens,
            cost
          }
        })

        // Update thread
        await prisma.aIThread.update({
          where: { id: threadId },
          data: {
            lastMessageAt: new Date(),
            messageCount: { increment: 2 },
            totalCost: { increment: cost },
            totalTokens: { increment: totalTokens }
          }
        })

      } catch (error) {
        console.error('Stream message error:', error)
        socket.emit('stream_error', { 
          error: error instanceof Error ? error.message : 'Stream failed' 
        })
      }
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
      
      // Notify threads the user was in
      const userId = socket.data.userId
      if (userId) {
        // In production, track which threads user was in
        // and notify those specific threads
      }
    })
  })

  return io
}

export function getIO(): Server | null {
  return io
}

// Helper function to emit events from API routes
export function emitToUser(userId: string, event: string, data: any) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data)
  }
}

export function emitToThread(threadId: string, event: string, data: any) {
  if (io) {
    io.to(`thread:${threadId}`).emit(event, data)
  }
}