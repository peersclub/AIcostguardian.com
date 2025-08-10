import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { organizationService } from '@/lib/services/organization.service'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const inviteUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum(['ADMIN', 'MANAGER', 'USER', 'VIEWER']),
  organizationId: z.string()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const validatedData = inviteUserSchema.parse(body)
    
    // Check if current user has permission to invite
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!currentUser || currentUser.organizationId !== validatedData.organizationId) {
      return NextResponse.json(
        { error: 'You do not have permission to invite users to this organization' },
        { status: 403 }
      )
    }
    
    // Only ADMINs and MANAGERs can invite users
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Only administrators and managers can invite users' },
        { status: 403 }
      )
    }
    
    const inviteInput = {
      ...validatedData,
      invitedBy: currentUser.id
    }
    
    const user = await organizationService.inviteUserToOrganization(inviteInput)
    
    return NextResponse.json(user, { status: 201 })
    
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
    
    console.error('Error in POST /api/organizations/invite:', error)
    return NextResponse.json(
      { error: 'Failed to invite user' },
      { status: 500 }
    )
  }
}