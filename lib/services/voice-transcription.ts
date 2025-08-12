import OpenAI from 'openai'
import { prisma } from '../prisma'

interface TranscriptionOptions {
  language?: string
  prompt?: string
  temperature?: number
  responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt'
}

interface TranscriptionResult {
  text: string
  language?: string
  duration?: number
  words?: Array<{
    word: string
    start: number
    end: number
    confidence: number
  }>
}

/**
 * Initialize OpenAI client for Whisper API
 */
function getOpenAIClient(apiKey?: string): OpenAI | null {
  const key = apiKey || process.env.OPENAI_API_KEY
  
  if (!key) {
    console.error('OpenAI API key not found')
    return null
  }
  
  return new OpenAI({
    apiKey: key,
  })
}

/**
 * Transcribe audio using OpenAI Whisper API
 */
export async function transcribeAudio(
  audioFile: File | Blob | Buffer,
  options: TranscriptionOptions = {},
  userId?: string
): Promise<TranscriptionResult> {
  try {
    // Get user's OpenAI API key if userId provided
    let userApiKey: string | undefined
    if (userId) {
      const apiKey = await prisma.apiKey.findFirst({
        where: {
          userId,
          provider: 'OPENAI',
          isActive: true,
        },
      })
      if (apiKey?.encryptedKey) {
        // Decrypt the API key
        const { decryptApiKey } = await import('../encryption')
        userApiKey = decryptApiKey(apiKey.encryptedKey)
      }
    }
    
    const openai = getOpenAIClient(userApiKey)
    if (!openai) {
      throw new Error('OpenAI client initialization failed. Please check your API key.')
    }
    
    // Convert Buffer to File if needed
    let file: File
    if (Buffer.isBuffer(audioFile)) {
      file = new File([audioFile], 'audio.webm', { type: 'audio/webm' })
    } else if (audioFile instanceof Blob) {
      file = new File([audioFile], 'audio.webm', { type: audioFile.type || 'audio/webm' })
    } else {
      file = audioFile
    }
    
    // Call Whisper API
    const response = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: options.language,
      prompt: options.prompt,
      temperature: options.temperature || 0,
      response_format: options.responseFormat || 'verbose_json',
    })
    
    // Handle different response formats
    if (options.responseFormat === 'text') {
      return {
        text: response as unknown as string,
      }
    }
    
    const verboseResponse = response as any
    
    return {
      text: verboseResponse.text,
      language: verboseResponse.language,
      duration: verboseResponse.duration,
      words: verboseResponse.words,
    }
  } catch (error) {
    console.error('Whisper transcription error:', error)
    throw new Error(
      error instanceof Error 
        ? `Transcription failed: ${error.message}`
        : 'Failed to transcribe audio'
    )
  }
}

/**
 * Save voice transcription to database
 */
export async function saveVoiceTranscription(
  userId: string,
  threadId: string | null,
  transcription: TranscriptionResult,
  audioMetadata: {
    duration: number
    fileSize: number
    mimeType: string
    audioUrl?: string
  }
): Promise<string> {
  try {
    const voiceSession = await prisma.voiceSession.create({
      data: {
        userId,
        threadId,
        transcript: transcription.text,
        language: transcription.language || 'en',
        confidence: 0.95, // Whisper doesn't provide overall confidence
        provider: 'whisper',
        duration: audioMetadata.duration,
        fileSize: audioMetadata.fileSize,
        mimeType: audioMetadata.mimeType,
        audioUrl: audioMetadata.audioUrl,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    })
    
    return voiceSession.id
  } catch (error) {
    console.error('Failed to save voice transcription:', error)
    throw new Error('Failed to save transcription')
  }
}

/**
 * Get transcription history for a user
 */
export async function getTranscriptionHistory(
  userId: string,
  limit: number = 10
): Promise<any[]> {
  return prisma.voiceSession.findMany({
    where: {
      userId,
      status: 'COMPLETED',
    },
    orderBy: {
      createdAt: 'desc',
    },
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
}

/**
 * Calculate transcription cost (for usage tracking)
 */
export function calculateTranscriptionCost(durationInSeconds: number): number {
  // Whisper API pricing: $0.006 per minute
  const costPerMinute = 0.006
  const durationInMinutes = durationInSeconds / 60
  return durationInMinutes * costPerMinute
}

/**
 * Check if user has transcription quota
 */
export async function checkTranscriptionQuota(
  userId: string,
  durationInSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  // Get user's usage limit
  const usageLimit = await prisma.usageLimit.findFirst({
    where: {
      userId,
    },
  })
  
  if (!usageLimit || !usageLimit.dailyCostLimit) {
    return { allowed: true, remaining: Infinity }
  }
  
  const estimatedCost = calculateTranscriptionCost(durationInSeconds)
  const remainingBudget = usageLimit.dailyCostLimit - usageLimit.dailyCostUsed
  
  return {
    allowed: estimatedCost <= remainingBudget,
    remaining: Math.floor((remainingBudget / 0.006) * 60), // Remaining seconds
  }
}

/**
 * Process audio file for transcription
 */
export async function processAudioFile(
  audioData: string | Buffer,
  mimeType: string
): Promise<Buffer> {
  // If it's a base64 data URL, extract the data
  if (typeof audioData === 'string' && audioData.startsWith('data:')) {
    const base64Data = audioData.split(',')[1]
    return Buffer.from(base64Data, 'base64')
  }
  
  // If it's already a Buffer, return it
  if (Buffer.isBuffer(audioData)) {
    return audioData
  }
  
  // If it's a base64 string, convert to Buffer
  return Buffer.from(audioData, 'base64')
}

/**
 * Validate audio file
 */
export function validateAudioFile(
  fileSize: number,
  mimeType: string,
  duration: number
): { valid: boolean; error?: string } {
  // Max file size: 25MB (Whisper API limit)
  const maxFileSize = 25 * 1024 * 1024
  if (fileSize > maxFileSize) {
    return { valid: false, error: 'File size exceeds 25MB limit' }
  }
  
  // Supported formats
  const supportedFormats = [
    'audio/webm',
    'audio/mp3',
    'audio/mpeg',
    'audio/mpga',
    'audio/m4a',
    'audio/wav',
    'audio/ogg',
  ]
  
  if (!supportedFormats.includes(mimeType)) {
    return { valid: false, error: 'Unsupported audio format' }
  }
  
  // Max duration: 30 minutes
  const maxDuration = 30 * 60 * 1000 // milliseconds
  if (duration > maxDuration) {
    return { valid: false, error: 'Audio duration exceeds 30 minutes' }
  }
  
  return { valid: true }
}