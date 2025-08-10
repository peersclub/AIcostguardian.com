import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { organizationService } from '@/lib/services/organization.service'
import { z } from 'zod'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
const createOrganizationSchema = z.object({
  name: z.string().min(2).max(100),
  domain: z.string().min(3).max(100),
  adminEmail: z.string().email(),
  adminName: z.string().min(2).max(100),
  subscription: z.enum(['FREE', 'STARTER', 'GROWTH', 'SCALE', 'ENTERPRISE']).optional(),
  spendLimit: z.number().positive().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get user's organization
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('id')
    
    if (organizationId) {
      const organization = await organizationService.getOrganization(organizationId)
      
      if (!organization) {
        return NextResponse.json(
          { error: 'Organization not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(organization)
    }
    
    // List all organizations (admin only)
    // TODO: Add admin check
    const organizations = await organizationService.listOrganizations()
    return NextResponse.json(organizations)
    
  } catch (error) {
    console.error('Error in GET /api/organizations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const validatedData = createOrganizationSchema.parse(body)
    
    const organization = await organizationService.createOrganization(validatedData)
    
    return NextResponse.json(organization, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error in POST /api/organizations:', error)
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('id')
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const organization = await organizationService.updateOrganization(organizationId, body)
    
    return NextResponse.json(organization)
    
  } catch (error) {
    console.error('Error in PUT /api/organizations:', error)
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('id')
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      )
    }
    
    // TODO: Add admin check
    
    await organizationService.deleteOrganization(organizationId)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error in DELETE /api/organizations:', error)
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    )
  }
}