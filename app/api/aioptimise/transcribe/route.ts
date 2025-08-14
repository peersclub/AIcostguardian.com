import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import OpenAI from 'openai'
import { safeDecrypt } from '@/lib/crypto-helper'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60 seconds timeout for transcription

// POST /api/aioptimise/transcribe - Transcribe audio to text
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's OpenAI API key (Whisper is only available via OpenAI)
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        userId: user.id,
        provider: 'openai',
        isActive: true
      }
    })

    if (!apiKey) {
      return NextResponse.json({ 
        error: 'OpenAI API key required for voice transcription. Please add your OpenAI API key in settings.' 
      }, { status: 400 })
    }

    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const language = formData.get('language') as string || 'en'
    const prompt = formData.get('prompt') as string || ''

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Validate file size (max 25MB for Whisper API)
    const maxSize = 25 * 1024 * 1024 // 25MB
    if (audioFile.size > maxSize) {
      return NextResponse.json({ 
        error: 'Audio file too large. Maximum size is 25MB' 
      }, { status: 400 })
    }

    // Validate audio file type
    const allowedAudioTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/webm',
      'audio/ogg',
      'audio/flac',
      'audio/x-flac',
      'audio/mp4',
      'audio/x-m4a',
      'video/webm', // WebM can contain audio
      'video/mp4'   // MP4 can be audio-only
    ]

    const fileType = audioFile.type || 'audio/mpeg'
    const isAudioFile = allowedAudioTypes.includes(fileType) || 
                       audioFile.name.match(/\.(mp3|wav|webm|ogg|flac|m4a|mp4)$/i)
    
    if (!isAudioFile) {
      return NextResponse.json({ 
        error: 'Invalid audio file format. Supported formats: MP3, WAV, WebM, OGG, FLAC, M4A' 
      }, { status: 400 })
    }

    // Initialize OpenAI client
    const decryptedKey = safeDecrypt(apiKey.encryptedKey)
    const openai = new OpenAI({ apiKey: decryptedKey })

    // Transcribe audio using Whisper directly with the uploaded file
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language, // ISO-639-1 language code
      prompt, // Optional prompt to guide the model
      response_format: 'verbose_json' // Get timestamps and more details
    })

    // Calculate cost (Whisper costs $0.006 per minute)
    const durationInMinutes = (transcription as any).duration ? 
      (transcription as any).duration / 60 : 
      audioFile.size / (128 * 1024 / 8) / 60 // Estimate based on 128kbps
    const cost = durationInMinutes * 0.006

    // Track usage
    await prisma.usage.create({
      data: {
        userId: user.id,
        provider: 'openai',
        model: 'whisper-1',
        inputTokens: 0,
        outputTokens: Math.ceil(transcription.text.length / 4), // Estimate tokens
        totalTokens: Math.ceil(transcription.text.length / 4),
        cost,
        metadata: {
          type: 'transcription',
          duration: durationInMinutes * 60,
          language,
          audioSize: audioFile.size,
          organizationId: user.organizationId
        }
      }
    })

    return NextResponse.json({
      success: true,
      transcription: {
        text: transcription.text,
        language: (transcription as any).language || language,
        duration: (transcription as any).duration,
        words: (transcription as any).words || [],
        segments: (transcription as any).segments || []
      },
      usage: {
        duration: durationInMinutes * 60,
        cost
      }
    })

  } catch (error) {
    console.error('Transcription error:', error)
    
    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json({ 
          error: 'Invalid OpenAI API key. Please check your settings.' 
        }, { status: 401 })
      } else if (error.status === 429) {
        return NextResponse.json({ 
          error: 'Rate limit exceeded. Please try again later.' 
        }, { status: 429 })
      } else if (error.status === 413) {
        return NextResponse.json({ 
          error: 'Audio file too large for transcription.' 
        }, { status: 413 })
      }
    }

    return NextResponse.json({ 
      error: 'Failed to transcribe audio',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/aioptimise/transcribe/stream - Real-time transcription (for future WebSocket implementation)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // This endpoint would be used for real-time streaming transcription
    // Currently returning a placeholder response
    return NextResponse.json({ 
      message: 'Real-time transcription requires WebSocket connection. Use the WebSocket endpoint instead.' 
    }, { status: 501 })

  } catch (error) {
    console.error('Stream transcription error:', error)
    return NextResponse.json({ 
      error: 'Failed to initialize stream transcription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}