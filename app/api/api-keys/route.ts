import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { encrypt, decrypt } from '@/lib/encryption'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        apiKeys: true,
        organization: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return keys without the encrypted values
    const keys = user.apiKeys.map(key => ({
      id: key.id,
      provider: key.provider,
      isActive: key.isActive,
      lastUsed: key.lastUsed,
      createdAt: key.createdAt,
      // Show masked version of the key
      maskedKey: '••••••••' + (key.encryptedKey ? '••••' : '')
    }))

    return NextResponse.json({ keys })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { provider, apiKey } = body

    if (!provider || !apiKey) {
      return NextResponse.json({ error: 'Provider and API key are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if key already exists for this provider
    const existingKey = await prisma.apiKey.findUnique({
      where: {
        userId_provider: {
          userId: user.id,
          provider: provider
        }
      }
    })

    const encryptedKey = encrypt(apiKey)

    if (existingKey) {
      // Update existing key
      const updated = await prisma.apiKey.update({
        where: { id: existingKey.id },
        data: {
          encryptedKey,
          isActive: true,
          lastUsed: new Date()
        }
      })
      return NextResponse.json({ message: 'API key updated', key: { ...updated, encryptedKey: undefined } })
    } else {
      // Create organization if user doesn't have one
      let organizationId = user.organizationId
      
      if (!organizationId) {
        // Create a default organization for the user
        const email = user.email
        const domain = email.split('@')[1]
        
        const org = await prisma.organization.create({
          data: {
            name: domain.split('.')[0],
            domain: domain,
            users: {
              connect: { id: user.id }
            }
          }
        })
        
        organizationId = org.id
        
        // Update user with organization
        await prisma.user.update({
          where: { id: user.id },
          data: { organizationId: org.id }
        })
      }
      
      // Create new key
      const created = await prisma.apiKey.create({
        data: {
          provider,
          encryptedKey,
          userId: user.id,
          organizationId: organizationId
        }
      })
      return NextResponse.json({ message: 'API key created', key: { ...created, encryptedKey: undefined } })
    }
  } catch (error) {
    console.error('Error saving API key:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('id')

    if (!keyId) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify the key belongs to the user
    const key = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId: user.id
      }
    })

    if (!key) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 })
    }

    await prisma.apiKey.delete({
      where: { id: keyId }
    })

    return NextResponse.json({ message: 'API key deleted' })
  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}