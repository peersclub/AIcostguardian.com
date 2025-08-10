import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { ApiKey } from '@prisma/client'

// Type for selected API key fields
type SelectedApiKey = Pick<ApiKey, 'id' | 'provider' | 'isActive' | 'lastUsed' | 'createdAt'>

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organization: true,
        apiKeys: {
          select: {
            id: true,
            provider: true,
            isActive: true,
            lastUsed: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            usageLogs: true,
            alerts: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        ...user,
        apiKeys: user.apiKeys.map((key: SelectedApiKey) => ({
          ...key,
          encryptedKey: undefined // Don't send encrypted keys to client
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, company } = body

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        company
      }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}