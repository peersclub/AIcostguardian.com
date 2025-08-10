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

    const { action } = await request.json()
    const userId = params.id

    // Prevent admin from suspending themselves
    if (userId === adminUser.id && action === 'suspend') {
      return NextResponse.json({ error: 'Cannot suspend your own account' }, { status: 400 })
    }

    // Handle different actions
    switch (action) {
      case 'suspend':
        // Deactivate user's API keys
        await prisma.apiKey.updateMany({
          where: { userId },
          data: { isActive: false }
        })
        
        // You could add a status field to User model in production
        // For now, we'll change their role to VIEWER as a suspension
        await prisma.user.update({
          where: { id: userId },
          data: { role: 'VIEWER' }
        })
        
        // Create an alert for the suspension
        await prisma.alert.create({
          data: {
            userId,
            type: 'ACCOUNT_SUSPENDED',
            provider: 'system',
            threshold: 0,
            message: 'Your account has been suspended by an administrator'
          }
        })
        break

      case 'activate':
        // Reactivate user's API keys
        await prisma.apiKey.updateMany({
          where: { userId },
          data: { isActive: true }
        })
        
        // Restore role to USER if it was VIEWER (suspended)
        const user = await prisma.user.findUnique({
          where: { id: userId }
        })
        if (user?.role === 'VIEWER') {
          await prisma.user.update({
            where: { id: userId },
            data: { role: 'USER' }
          })
        }
        
        // Clear suspension alert
        await prisma.alert.updateMany({
          where: {
            userId,
            type: 'ACCOUNT_SUSPENDED',
            isActive: true
          },
          data: { isActive: false }
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, action, userId })

  } catch (error) {
    console.error('Error updating user:', error)
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

    const userId = params.id

    // Prevent admin from deleting themselves
    if (userId === adminUser.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Delete user and all related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete related data first
      await tx.notification.deleteMany({ where: { userId } })
      await tx.notificationRule.deleteMany({ where: { userId } })
      await tx.notificationPreferences.deleteMany({ where: { userId } })
      await tx.alert.deleteMany({ where: { userId } })
      await tx.usage.deleteMany({ where: { userId } })
      await tx.usageLog.deleteMany({ where: { userId } })
      await tx.apiKey.deleteMany({ where: { userId } })
      await tx.session.deleteMany({ where: { userId } })
      await tx.account.deleteMany({ where: { userId } })
      
      // Finally delete user
      await tx.user.delete({ where: { id: userId } })
    })

    return NextResponse.json({ success: true, deletedUserId: userId })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}