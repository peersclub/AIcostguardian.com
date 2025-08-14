import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import crypto from 'crypto'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const maxDuration = 30 // 30 seconds timeout for file uploads

// POST /api/aioptimise/upload - Handle file uploads
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

    const formData = await req.formData()
    const file = formData.get('file') as File
    const threadId = formData.get('threadId') as string
    const messageId = formData.get('messageId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB' 
      }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/markdown',
      'text/csv',
      'application/json',
      'application/javascript',
      'text/javascript',
      'text/html',
      'text/css',
      'application/x-python-code',
      'text/x-python',
      'application/x-typescript',
      'text/x-typescript',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]

    const fileType = file.type || 'application/octet-stream'
    const isCodeFile = file.name.match(/\.(js|ts|jsx|tsx|py|java|c|cpp|cs|go|rs|rb|php|swift|kt|scala|r|m|h|sh|bash|zsh|fish|ps1|bat|cmd)$/i)
    
    if (!allowedTypes.includes(fileType) && !isCodeFile) {
      return NextResponse.json({ 
        error: 'File type not supported' 
      }, { status: 400 })
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'bin'
    const uniqueId = crypto.randomBytes(16).toString('hex')
    const fileName = `${uniqueId}.${fileExtension}`
    
    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', user.id)
    await mkdir(uploadDir, { recursive: true })
    
    // Save file to disk
    const filePath = join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    
    // Generate public URL
    const publicUrl = `/uploads/${user.id}/${fileName}`
    
    // Extract file content for text-based files
    let fileContent = null
    if (fileType.startsWith('text/') || isCodeFile || fileType === 'application/json') {
      fileContent = buffer.toString('utf-8')
    }

    // Create attachment record if messageId is provided
    let attachment = null
    if (messageId) {
      // Verify message belongs to user
      const message = await prisma.aIMessage.findFirst({
        where: {
          id: messageId,
          thread: {
            userId: user.id
          }
        }
      })

      if (!message) {
        return NextResponse.json({ 
          error: 'Message not found or unauthorized' 
        }, { status: 404 })
      }

      // Create attachment record (note: Attachment model doesn't exist in current schema)
      // For now, we'll store it in the message metadata
      const updatedMessage = await prisma.aIMessage.update({
        where: { id: messageId },
        data: {
          metadata: {
            ...(message.metadata as any || {}),
            attachments: [
              ...((message.metadata as any)?.attachments || []),
              {
                id: uniqueId,
                fileName: file.name,
                fileType,
                fileSize: file.size,
                fileUrl: publicUrl,
                uploadedAt: new Date().toISOString()
              }
            ]
          }
        }
      })

      attachment = {
        id: uniqueId,
        fileName: file.name,
        fileType,
        fileSize: file.size,
        fileUrl: publicUrl
      }
    }

    // Process file based on type
    let processedData: any = {
      type: fileType,
      size: file.size,
      name: file.name
    }

    if (fileType.startsWith('image/')) {
      // For images, we could extract dimensions, colors, etc.
      processedData.category = 'image'
    } else if (fileType === 'application/pdf') {
      // For PDFs, we could extract text, page count, etc.
      processedData.category = 'document'
    } else if (isCodeFile || fileContent) {
      // For code/text files, we have the content
      processedData.category = 'code'
      processedData.content = fileContent
      processedData.lineCount = fileContent?.split('\n').length
    }

    return NextResponse.json({
      success: true,
      file: {
        id: uniqueId,
        name: file.name,
        size: file.size,
        type: fileType,
        url: publicUrl,
        uploadedAt: new Date().toISOString(),
        ...processedData
      },
      attachment
    })

  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/aioptimise/upload - List uploaded files
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const threadId = searchParams.get('threadId')
    const messageId = searchParams.get('messageId')

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (messageId) {
      // Get attachments for specific message
      const message = await prisma.aIMessage.findFirst({
        where: {
          id: messageId,
          thread: {
            userId: user.id
          }
        },
        select: {
          metadata: true
        }
      })

      if (!message) {
        return NextResponse.json({ error: 'Message not found' }, { status: 404 })
      }

      const attachments = (message.metadata as any)?.attachments || []
      return NextResponse.json({ attachments })
    }

    if (threadId) {
      // Get all attachments in thread
      const messages = await prisma.aIMessage.findMany({
        where: {
          threadId,
          thread: {
            userId: user.id
          }
        },
        select: {
          id: true,
          metadata: true,
          createdAt: true
        }
      })

      const attachments = messages.flatMap(msg => 
        ((msg.metadata as any)?.attachments || []).map((att: any) => ({
          ...att,
          messageId: msg.id,
          messageCreatedAt: msg.createdAt
        }))
      )

      return NextResponse.json({ attachments })
    }

    // Return empty array if no specific query
    return NextResponse.json({ attachments: [] })

  } catch (error) {
    console.error('Get attachments error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch attachments',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}