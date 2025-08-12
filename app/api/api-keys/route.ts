import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { encrypt, decrypt } from '@/lib/encryption'
import { 
  notifyApiKeyCreatedServer, 
  notifyApiKeyUpdatedServer,
  notifyApiKeyDeletedServer 
} from '@/lib/services/notification-trigger'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        apiKeys: true,
        organization: true
      }
    })

    if (!user) {
      // Auto-create user if doesn't exist
      const organizationName = session.user.email.split('@')[1]?.split('.')[0] || 'default'
      
      // First, create or find organization
      let organization = await prisma.organization.findFirst({
        where: { 
          OR: [
            { name: organizationName },
            { domain: session.user.email.split('@')[1] }
          ]
        }
      })
      
      if (!organization) {
        const domain = session.user.email.split('@')[1]
        // Check if organization with this domain already exists
        const existingOrg = await prisma.organization.findUnique({
          where: { domain }
        })
        
        if (existingOrg) {
          organization = existingOrg
        } else {
          organization = await prisma.organization.create({
            data: {
              name: organizationName,
              domain: domain,
              subscription: 'FREE'
            }
          })
        }
      }
      
      // Create the user
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || session.user.email.split('@')[0],
          role: 'USER',
          organizationId: organization.id
        },
        include: {
          apiKeys: true,
          organization: true
        }
      })
    }

    // Return keys without the encrypted values
    const keys = user.apiKeys.map((key: any) => ({
      id: key.id,
      provider: key.provider,
      isActive: key.isActive,
      lastUsed: key.lastUsed,
      lastTested: key.lastTested,
      createdAt: key.createdAt,
      // Show masked version of the key
      maskedKey: '********' + (key.encryptedKey ? '****' : '')
    }))

    return NextResponse.json({ keys })
  } catch (error: any) {
    console.error('Error fetching API keys:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
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
    
    // Normalize provider name to match database convention
    // Map UI provider names to database provider names
    const providerMapping: { [key: string]: string } = {
      'openai': 'openai',
      'claude': 'anthropic',
      'anthropic': 'anthropic',
      'gemini': 'google',
      'google': 'google',
      'grok': 'xai',
      'xai': 'xai',
      'mistral': 'mistral',
      'perplexity': 'perplexity'
    }
    
    const normalizedProvider = providerMapping[provider.toLowerCase()] || provider.toLowerCase()

    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user) {
      // Auto-create user if doesn't exist
      const organizationName = session.user.email.split('@')[1]?.split('.')[0] || 'default'
      
      // First, create or find organization
      let organization = await prisma.organization.findFirst({
        where: { 
          OR: [
            { name: organizationName },
            { domain: session.user.email.split('@')[1] }
          ]
        }
      })
      
      if (!organization) {
        const domain = session.user.email.split('@')[1]
        // Check if organization with this domain already exists
        const existingOrg = await prisma.organization.findUnique({
          where: { domain }
        })
        
        if (existingOrg) {
          organization = existingOrg
        } else {
          organization = await prisma.organization.create({
            data: {
              name: organizationName,
              domain: domain,
              subscription: 'FREE'
            }
          })
        }
      }
      
      // Create the user
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || session.user.email.split('@')[0],
          role: 'USER',
          organizationId: organization.id
        },
        include: {
          organization: true
        }
      })
    }

    // Check if key already exists for this provider
    const existingKey = await prisma.apiKey.findUnique({
      where: {
        userId_provider: {
          userId: user.id,
          provider: normalizedProvider
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
      
      // Send notification
      await notifyApiKeyUpdatedServer(user.id, normalizedProvider)
      
      return NextResponse.json({ message: 'API key updated', key: { ...updated, encryptedKey: undefined } })
    } else {
      // Create organization if user doesn't have one
      let organizationId = user.organizationId
      
      if (!organizationId) {
        // Create a default organization for the user
        const email = user.email
        const domain = email.split('@')[1]
        
        // Check if organization with this domain already exists
        let org = await prisma.organization.findUnique({
          where: { domain }
        })
        
        if (!org) {
          org = await prisma.organization.create({
            data: {
              name: domain.split('.')[0],
              domain: domain,
              users: {
                connect: { id: user.id }
              }
            }
          })
        } else {
          // Connect existing org to user
          await prisma.organization.update({
            where: { id: org.id },
            data: {
              users: {
                connect: { id: user.id }
              }
            }
          })
        }
        
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
          provider: normalizedProvider,
          encryptedKey,
          userId: user.id,
          organizationId: organizationId
        }
      })
      
      // Send notification
      await notifyApiKeyCreatedServer(user.id, normalizedProvider)
      
      return NextResponse.json({ message: 'API key created', key: { ...created, encryptedKey: undefined } })
    }
  } catch (error: any) {
    console.error('Error saving API key:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
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

    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      // Auto-create user if doesn't exist (even for DELETE operations)
      const organizationName = session.user.email.split('@')[1]?.split('.')[0] || 'default'
      
      // First, create or find organization
      let organization = await prisma.organization.findFirst({
        where: { 
          OR: [
            { name: organizationName },
            { domain: session.user.email.split('@')[1] }
          ]
        }
      })
      
      if (!organization) {
        const domain = session.user.email.split('@')[1]
        // Check if organization with this domain already exists
        const existingOrg = await prisma.organization.findUnique({
          where: { domain }
        })
        
        if (existingOrg) {
          organization = existingOrg
        } else {
          organization = await prisma.organization.create({
            data: {
              name: organizationName,
              domain: domain,
              subscription: 'FREE'
            }
          })
        }
      }
      
      // Create the user
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || session.user.email.split('@')[0],
          role: 'USER',
          organizationId: organization.id
        }
      })
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

    // Send notification
    await notifyApiKeyDeletedServer(user.id, key.provider)

    return NextResponse.json({ message: 'API key deleted' })
  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}