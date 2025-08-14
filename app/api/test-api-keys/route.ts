import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { apiKeyService } from '@/lib/core/api-key.service'
import { userService } from '@/lib/core/user.service'
import prisma from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user exists
    const user = await userService.ensureUser({
      email: session.user.email,
      name: session.user.name,
      image: session.user.image
    })

    // Get all API keys from database directly
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        provider: true,
        createdAt: true,
        isActive: true,
        encryptedKey: true
      }
    })

    // Try to get decrypted keys
    const decryptedKeys: any[] = []
    for (const provider of ['openai', 'claude', 'gemini', 'grok']) {
      try {
        const key = await apiKeyService.getApiKey(user.id, provider as any, user.organizationId || undefined)
        if (key) {
          decryptedKeys.push({
            provider,
            keyStart: key.substring(0, 10) + '...',
            hasKey: true
          })
        } else {
          decryptedKeys.push({
            provider,
            hasKey: false
          })
        }
      } catch (error) {
        decryptedKeys.push({
          provider,
          hasKey: false,
          error: (error as Error).message
        })
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId
      },
      rawKeys: apiKeys.map(k => ({
        ...k,
        encryptedKeyFormat: k.encryptedKey ? 
          (k.encryptedKey.includes(':') ? 'encrypted' : 'plain') : 
          'empty'
      })),
      decryptedKeys,
      encryptionKey: process.env.ENCRYPTION_KEY ? 'Set' : 'Using default'
    })
  } catch (error) {
    console.error('Test API keys error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}