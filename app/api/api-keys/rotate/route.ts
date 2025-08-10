import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/encryption'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { keyId, newApiKey } = await request.json()

    if (!keyId || !newApiKey) {
      return NextResponse.json({ 
        error: 'Key ID and new API key are required' 
      }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the existing API key
    const existingKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId: user.id
      }
    })

    if (!existingKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    // Encrypt the new key
    const encryptedKey = encrypt(newApiKey)

    // Update the key
    const updatedKey = await prisma.apiKey.update({
      where: { id: keyId },
      data: {
        encryptedKey,
        isActive: true,
        lastUsed: null, // Reset last used
        updatedAt: new Date()
      }
    })

    // Create an audit log entry (if you have an audit table)
    // await prisma.auditLog.create({
    //   data: {
    //     userId: user.id,
    //     action: 'API_KEY_ROTATED',
    //     resource: 'ApiKey',
    //     resourceId: keyId,
    //     metadata: {
    //       provider: existingKey.provider
    //     }
    //   }
    // })

    return NextResponse.json({ 
      success: true,
      message: 'API key rotated successfully',
      key: {
        id: updatedKey.id,
        provider: updatedKey.provider,
        isActive: updatedKey.isActive,
        createdAt: updatedKey.createdAt,
        updatedAt: updatedKey.updatedAt
      }
    })

  } catch (error) {
    console.error('Error rotating API key:', error)
    return NextResponse.json({ 
      error: 'Failed to rotate API key' 
    }, { status: 500 })
  }
}