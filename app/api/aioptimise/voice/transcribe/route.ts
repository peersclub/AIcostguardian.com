import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import {
  transcribeAudio,
  saveVoiceTranscription,
  processAudioFile,
  validateAudioFile,
  checkTranscriptionQuota,
  calculateTranscriptionCost,
} from '@/lib/services/voice-transcription'
import { withRateLimit, rateLimitConfigs } from '@/lib/middleware/rate-limit'
import { withSecurityHeaders } from '@/lib/middleware/security-headers'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Configure for larger audio files
export const maxDuration = 60 // 60 seconds timeout
export const runtime = 'nodejs'

/**
 * POST - Transcribe audio using Whisper API
 */
export const POST = withSecurityHeaders(
  withRateLimit(
    async (request: NextRequest) => {
      try {
        // Authentication check
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          )
        }

        // Parse multipart form data or JSON
        const contentType = request.headers.get('content-type') || ''
        
        let audioData: string | Buffer
        let mimeType: string
        let duration: number
        let threadId: string | null = null
        let language: string | undefined
        
        if (contentType.includes('multipart/form-data')) {
          // Handle file upload
          const formData = await request.formData()
          const file = formData.get('audio') as File
          
          if (!file) {
            return NextResponse.json(
              { error: 'No audio file provided' },
              { status: 400 }
            )
          }
          
          audioData = Buffer.from(await file.arrayBuffer())
          mimeType = file.type
          duration = parseInt(formData.get('duration') as string) || 0
          threadId = formData.get('threadId') as string || null
          language = formData.get('language') as string || undefined
          
        } else {
          // Handle JSON with base64 audio
          const body = await request.json()
          
          if (!body.audio) {
            return NextResponse.json(
              { error: 'No audio data provided' },
              { status: 400 }
            )
          }
          
          audioData = body.audio
          mimeType = body.mimeType || 'audio/webm'
          duration = body.duration || 0
          threadId = body.threadId || null
          language = body.language
        }

        // Process and validate audio
        const audioBuffer = await processAudioFile(audioData, mimeType)
        const fileSize = audioBuffer.length
        
        const validation = validateAudioFile(fileSize, mimeType, duration)
        if (!validation.valid) {
          return NextResponse.json(
            { error: validation.error },
            { status: 400 }
          )
        }

        // Check user quota
        const quota = await checkTranscriptionQuota(
          session.user.id,
          duration / 1000 // Convert to seconds
        )
        
        if (!quota.allowed) {
          return NextResponse.json(
            { 
              error: 'Transcription quota exceeded',
              remainingSeconds: quota.remaining 
            },
            { status: 429 }
          )
        }

        // Start transcription session in database
        const voiceSession = await prisma.voiceSession.create({
          data: {
            userId: session.user.id,
            threadId,
            duration,
            fileSize,
            mimeType,
            status: 'PROCESSING',
          },
        })

        try {
          // Perform transcription
          const transcription = await transcribeAudio(
            audioBuffer,
            {
              language,
              responseFormat: 'verbose_json',
            },
            session.user.id
          )

          // Update voice session with transcription
          await prisma.voiceSession.update({
            where: { id: voiceSession.id },
            data: {
              transcript: transcription.text,
              language: transcription.language || language || 'en',
              confidence: 0.95,
              status: 'COMPLETED',
              completedAt: new Date(),
            },
          })

          // Calculate and track cost
          const cost = calculateTranscriptionCost(duration / 1000)
          
          // Update usage tracking
          await prisma.usageLog.create({
            data: {
              userId: session.user.id,
              organizationId: (session.user as any).organizationId || session.user.id,
              provider: 'OPENAI',
              model: 'whisper-1',
              promptTokens: 0,
              completionTokens: 0,
              totalTokens: Math.ceil(duration / 1000), // Use duration as token proxy
              cost,
              metadata: {
                type: 'voice_transcription',
                duration,
                language: transcription.language,
              },
            },
          })

          // Update user's daily usage
          await prisma.usageLimit.updateMany({
            where: { userId: session.user.id },
            data: {
              dailyCostUsed: { increment: cost },
              monthlyCostUsed: { increment: cost },
            },
          })

          // Return transcription result
          return NextResponse.json({
            success: true,
            transcription: {
              text: transcription.text,
              language: transcription.language,
              duration: transcription.duration,
              sessionId: voiceSession.id,
            },
            usage: {
              cost,
              remainingSeconds: quota.remaining,
            },
          })

        } catch (error) {
          // Update session with error
          await prisma.voiceSession.update({
            where: { id: voiceSession.id },
            data: {
              status: 'FAILED',
              errorMessage: error instanceof Error ? error.message : 'Transcription failed',
            },
          })

          throw error
        }

      } catch (error) {
        console.error('Voice transcription error:', error)
        
        // Check if it's an OpenAI API error
        if (error instanceof Error && error.message.includes('API key')) {
          return NextResponse.json(
            { error: 'OpenAI API key not configured. Please add your API key in settings.' },
            { status: 400 }
          )
        }
        
        return NextResponse.json(
          { 
            error: error instanceof Error ? error.message : 'Failed to transcribe audio'
          },
          { status: 500 }
        )
      }
    },
    { ...rateLimitConfigs.api, max: 30 } // 30 requests per minute for voice
  )
)

/**
 * GET - Get transcription history
 */
export const GET = withSecurityHeaders(
  withRateLimit(
    async (request: NextRequest) => {
      try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          )
        }

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')
        const threadId = searchParams.get('threadId')

        const where: any = {
          userId: session.user.id,
          status: 'COMPLETED',
        }

        if (threadId) {
          where.threadId = threadId
        }

        const transcriptions = await prisma.voiceSession.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          select: {
            id: true,
            transcript: true,
            language: true,
            duration: true,
            createdAt: true,
            threadId: true,
          },
        })

        return NextResponse.json({
          success: true,
          transcriptions,
        })

      } catch (error) {
        console.error('Failed to get transcription history:', error)
        return NextResponse.json(
          { error: 'Failed to retrieve transcription history' },
          { status: 500 }
        )
      }
    }
  )
)