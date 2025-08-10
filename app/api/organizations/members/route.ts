import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { organizationService } from '@/lib/services/organization.service'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER', 'VIEWER'])
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      )
    }
    
    // Check if user belongs to organization
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!currentUser || currentUser.organizationId !== organizationId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }
    
    const members = await organizationService.getOrganizationUsers(organizationId)
    
    return NextResponse.json(members)
    
  } catch (error) {
    console.error('Error in GET /api/organizations/members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organization members' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const validatedData = updateRoleSchema.parse(body)
    
    // Check if current user is admin
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!currentUser || currentUser.organizationId !== organizationId || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can update user roles' },
        { status: 403 }
      )
    }
    
    const updatedUser = await organizationService.updateUserRole(
      validatedData.userId,
      organizationId,
      validatedData.role
    )
    
    return NextResponse.json(updatedUser)
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    console.error('Error in PUT /api/organizations/members:', error)
    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const userId = searchParams.get('userId')
    
    if (!organizationId || !userId) {
      return NextResponse.json(
        { error: 'Organization ID and User ID required' },
        { status: 400 }
      )
    }
    
    // Check if current user is admin
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!currentUser || currentUser.organizationId !== organizationId || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can remove members' },
        { status: 403 }
      )
    }
    
    await organizationService.removeUserFromOrganization(userId, organizationId)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    console.error('Error in DELETE /api/organizations/members:', error)
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    )
  }
}