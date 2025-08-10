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
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { action } = await request.json()
    const orgId = params.id

    // Handle different actions
    switch (action) {
      case 'suspend':
        // Update organization to suspended state
        // In a real app, you'd have a status field in the Organization model
        await prisma.organization.update({
          where: { id: orgId },
          data: {
            subscription: 'FREE' // Downgrade to free as suspension
          }
        })
        
        // Deactivate all API keys
        await prisma.apiKey.updateMany({
          where: { organizationId: orgId },
          data: { isActive: false }
        })
        break

      case 'activate':
        // Reactivate organization
        await prisma.organization.update({
          where: { id: orgId },
          data: {
            subscription: 'STARTER' // Upgrade from FREE
          }
        })
        
        // Reactivate API keys
        await prisma.apiKey.updateMany({
          where: { organizationId: orgId },
          data: { isActive: true }
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, action, organizationId: orgId })

  } catch (error) {
    console.error('Error updating organization:', error)
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
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const orgId = params.id

    // Delete organization and all related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete related data first
      await tx.notification.deleteMany({ where: { organizationId: orgId } })
      await tx.notificationRule.deleteMany({ where: { organizationId: orgId } })
      await tx.usageLog.deleteMany({ where: { organizationId: orgId } })
      await tx.apiKey.deleteMany({ where: { organizationId: orgId } })
      await tx.budget.deleteMany({ where: { organizationId: orgId } })
      
      // Update users to remove organization
      await tx.user.updateMany({
        where: { organizationId: orgId },
        data: { organizationId: null }
      })
      
      // Finally delete organization
      await tx.organization.delete({ where: { id: orgId } })
    })

    return NextResponse.json({ success: true, deletedOrganizationId: orgId })

  } catch (error) {
    console.error('Error deleting organization:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}