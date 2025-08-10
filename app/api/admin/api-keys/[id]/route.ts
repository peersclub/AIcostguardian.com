import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { isActive } = await request.json()
    const keyId = params.id

    // Toggle API key active status
    const updatedKey = await prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive }
    })

    // Create an alert for the key owner
    const keyOwner = await prisma.user.findUnique({
      where: { id: updatedKey.userId }
    })

    if (keyOwner) {
      await prisma.alert.create({
        data: {
          userId: keyOwner.id,
          type: isActive ? 'API_KEY_ACTIVATED' : 'API_KEY_DEACTIVATED',
          provider: updatedKey.provider,
          threshold: 0,
          message: `Your ${updatedKey.provider} API key has been ${isActive ? 'activated' : 'deactivated'} by an administrator`
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      keyId,
      isActive,
      message: `API key ${isActive ? 'activated' : 'deactivated'} successfully`
    })

  } catch (error) {
    console.error('Error updating API key:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const keyId = params.id

    // Get key info before deletion
    const key = await prisma.apiKey.findUnique({
      where: { id: keyId },
      include: {
        user: true
      }
    })

    if (!key) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    // Delete the API key
    await prisma.apiKey.delete({
      where: { id: keyId }
    })

    // Notify the user
    await prisma.alert.create({
      data: {
        userId: key.userId,
        type: 'API_KEY_DELETED',
        provider: key.provider,
        threshold: 0,
        message: `Your ${key.provider} API key has been removed by an administrator`
      }
    })

    return NextResponse.json({ 
      success: true, 
      deletedKeyId: keyId,
      message: 'API key deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}