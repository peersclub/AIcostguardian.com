import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Get all roles for the organization
    const roles = await prisma.role.findMany({
      where: { organizationId: user.organizationId },
      include: {
        permissions: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(roles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, permissions } = body

    if (!name) {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 })
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Check if user has permission to create roles
    const userRole = await prisma.role.findFirst({
      where: {
        organizationId: user.organizationId,
        users: { some: { id: user.id } }
      },
      include: { permissions: true }
    })

    const canManageRoles = userRole?.permissions.some(p => 
      p.resource === 'roles' && p.action === 'write'
    ) || user.role === 'ADMIN'

    if (!canManageRoles) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Create the role
    const role = await prisma.role.create({
      data: {
        name,
        description: description || '',
        organizationId: user.organizationId,
        permissions: {
          create: permissions?.map((perm: any) => ({
            resource: perm.resource,
            action: perm.action,
            organizationId: user.organizationId
          })) || []
        }
      },
      include: {
        permissions: true,
        users: true
      }
    })

    return NextResponse.json(role, { status: 201 })
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { roleId, name, description, permissions } = body

    if (!roleId) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 })
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Check if user has permission to update roles
    const userRole = await prisma.role.findFirst({
      where: {
        organizationId: user.organizationId,
        users: { some: { id: user.id } }
      },
      include: { permissions: true }
    })

    const canManageRoles = userRole?.permissions.some(p => 
      p.resource === 'roles' && p.action === 'write'
    ) || user.role === 'ADMIN'

    if (!canManageRoles) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Update the role
    const role = await prisma.role.update({
      where: { id: roleId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(permissions && {
          permissions: {
            deleteMany: {},
            create: permissions.map((perm: any) => ({
              resource: perm.resource,
              action: perm.action,
              organizationId: user.organizationId
            }))
          }
        })
      },
      include: {
        permissions: true,
        users: true
      }
    })

    return NextResponse.json(role)
  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const roleId = searchParams.get('id')

    if (!roleId) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 })
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Check if user has permission to delete roles
    const userRole = await prisma.role.findFirst({
      where: {
        organizationId: user.organizationId,
        users: { some: { id: user.id } }
      },
      include: { permissions: true }
    })

    const canManageRoles = userRole?.permissions.some(p => 
      p.resource === 'roles' && p.action === 'delete'
    ) || user.role === 'ADMIN'

    if (!canManageRoles) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Check if role exists and belongs to organization
    const role = await prisma.role.findFirst({
      where: {
        id: roleId,
        organizationId: user.organizationId
      }
    })

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    // Delete the role
    await prisma.role.delete({
      where: { id: roleId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    )
  }
}