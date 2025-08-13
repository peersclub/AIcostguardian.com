import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// PATCH - Update member role/details
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user and their organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Check permissions - only admins and managers can update members
    if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await req.json()
    
    // Get the member to update
    const member = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!member || member.organizationId !== user.organizationId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Prevent demoting yourself if you're the only admin
    if (member.id === user.id && body.role && body.role !== 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: {
          organizationId: user.organizationId,
          role: 'ADMIN'
        }
      })

      if (adminCount === 1) {
        return NextResponse.json(
          { error: 'Cannot demote the only admin' },
          { status: 400 }
        )
      }
    }

    // Update member
    const updatedMember = await prisma.user.update({
      where: { id: params.id },
      data: body
    })

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    console.error('Failed to update member:', error)
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    )
  }
}

// DELETE - Remove member from organization
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user and their organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Check permissions - only admins can remove members
    if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get the member to remove
    const member = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!member || member.organizationId !== user.organizationId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Prevent removing yourself
    if (member.id === user.id) {
      return NextResponse.json(
        { error: 'Cannot remove yourself from the organization' },
        { status: 400 }
      )
    }

    // Remove member from organization (keep user but remove org association)
    await prisma.user.update({
      where: { id: params.id },
      data: {
        organizationId: null,
        role: 'USER'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove member:', error)
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    )
  }
}