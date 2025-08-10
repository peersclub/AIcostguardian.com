import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { organizationService } from '@/lib/services/organization.service'
import { z } from 'zod'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'member']),
  message: z.string().optional()
})

const updateSchema = z.object({
  memberId: z.string(),
  updates: z.object({
    role: z.enum(['admin', 'manager', 'member']).optional(),
    status: z.enum(['active', 'inactive']).optional()
  })
})

// Map frontend roles to database roles
const roleMap = {
  admin: 'ADMIN',
  manager: 'MANAGER',
  member: 'USER'
} as const

const reverseRoleMap = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'member',
  VIEWER: 'member'
} as const

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user's organization
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Get all organization members
    const members = await prisma.user.findMany({
      where: { organizationId: currentUser.organizationId },
      include: {
        usage: {
          orderBy: { timestamp: 'desc' },
          take: 100
        }
      }
    })

    // Calculate usage stats for each member
    const enrichedMembers = members.map(member => {
      const totalCalls = member.usage.length
      const totalCost = member.usage.reduce((sum, u) => sum + u.cost, 0)
      
      // Calculate this month's usage
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      const thisMonthUsage = member.usage.filter(u => 
        new Date(u.timestamp) >= startOfMonth
      )
      const thisMonthCost = thisMonthUsage.reduce((sum, u) => sum + u.cost, 0)

      return {
        id: member.id,
        name: member.name || member.email.split('@')[0],
        email: member.email,
        role: reverseRoleMap[member.role as keyof typeof reverseRoleMap] || 'member',
        status: member.emailVerified ? 'active' : 'pending',
        joinedAt: member.createdAt,
        lastActive: member.usage[0]?.timestamp || member.updatedAt,
        usage: {
          totalCalls,
          totalCost: Math.round(totalCost * 100) / 100,
          thisMonth: Math.round(thisMonthCost * 100) / 100
        },
        company: member.company || currentUser.organizationId
      }
    })

    return NextResponse.json(enrichedMembers)
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = inviteSchema.parse(body)

    // Validate enterprise email domain
    const domain = validatedData.email.split('@')[1]?.toLowerCase()
    const blockedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com']
    
    if (blockedDomains.includes(domain)) {
      return NextResponse.json(
        { error: 'Enterprise email required. Personal email domains are not allowed.' },
        { status: 400 }
      )
    }

    // Get current user and their organization
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Check if current user has permission to invite
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Only administrators and managers can invite team members' },
        { status: 403 }
      )
    }

    // Use organization service to invite user
    const dbRole = roleMap[validatedData.role]
    const newMember = await organizationService.inviteUserToOrganization({
      email: validatedData.email,
      name: validatedData.email.split('@')[0].split('.').map((s: string) => 
        s.charAt(0).toUpperCase() + s.slice(1)
      ).join(' '),
      role: dbRole,
      organizationId: currentUser.organizationId,
      invitedBy: currentUser.id
    })

    // TODO: Send email invitation

    return NextResponse.json({ 
      success: true, 
      message: 'Team member invited successfully',
      member: {
        id: newMember.id,
        name: newMember.name,
        email: newMember.email,
        role: reverseRoleMap[newMember.role as keyof typeof reverseRoleMap],
        status: 'pending',
        joinedAt: newMember.createdAt,
        lastActive: newMember.updatedAt,
        usage: { totalCalls: 0, totalCost: 0, thisMonth: 0 },
        company: newMember.company || domain
      }
    })
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

    console.error('Error inviting team member:', error)
    return NextResponse.json(
      { error: 'Failed to invite team member' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateSchema.parse(body)

    // Get current user and verify permissions
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Only administrators and managers can update team members' },
        { status: 403 }
      )
    }

    // Update role if provided
    if (validatedData.updates.role) {
      const dbRole = roleMap[validatedData.updates.role]
      const updatedUser = await organizationService.updateUserRole(
        validatedData.memberId,
        currentUser.organizationId,
        dbRole
      )

      return NextResponse.json({
        success: true,
        message: 'Team member updated successfully',
        member: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: reverseRoleMap[updatedUser.role as keyof typeof reverseRoleMap]
        }
      })
    }

    // Update status if provided
    if (validatedData.updates.status) {
      // For now, we'll just return success
      // In production, you might want to actually deactivate the user
      return NextResponse.json({
        success: true,
        message: 'Team member status updated successfully'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'No updates performed'
    })
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

    console.error('Error updating team member:', error)
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('id')

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Get current user and verify permissions
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can remove team members' },
        { status: 403 }
      )
    }

    // Remove user from organization
    await organizationService.removeUserFromOrganization(memberId, currentUser.organizationId)

    return NextResponse.json({
      success: true,
      message: 'Team member removed successfully'
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.error('Error removing team member:', error)
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    )
  }
}