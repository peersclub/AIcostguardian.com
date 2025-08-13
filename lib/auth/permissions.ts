import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { UserRole } from '@prisma/client'

// Permission definitions
export const PERMISSIONS = {
  // Super Admin permissions
  MANAGE_PLATFORM: 'manage_platform',
  VIEW_ALL_ORGANIZATIONS: 'view_all_organizations',
  CREATE_ORGANIZATION: 'create_organization',
  DELETE_ORGANIZATION: 'delete_organization',
  
  // Organization Admin permissions
  MANAGE_ORGANIZATION: 'manage_organization',
  MANAGE_MEMBERS: 'manage_members',
  MANAGE_API_KEYS: 'manage_api_keys',
  VIEW_ALL_USAGE: 'view_all_usage',
  MANAGE_BILLING: 'manage_billing',
  
  // Manager permissions
  VIEW_TEAM_USAGE: 'view_team_usage',
  MANAGE_TEAM_MEMBERS: 'manage_team_members',
  APPROVE_REQUESTS: 'approve_requests',
  
  // User permissions
  VIEW_OWN_USAGE: 'view_own_usage',
  MANAGE_OWN_API_KEYS: 'manage_own_api_keys',
  CREATE_REQUESTS: 'create_requests',
  
  // Viewer permissions
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_REPORTS: 'view_reports',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: Object.values(PERMISSIONS), // All permissions
  
  ADMIN: [
    PERMISSIONS.MANAGE_ORGANIZATION,
    PERMISSIONS.MANAGE_MEMBERS,
    PERMISSIONS.MANAGE_API_KEYS,
    PERMISSIONS.VIEW_ALL_USAGE,
    PERMISSIONS.MANAGE_BILLING,
    PERMISSIONS.VIEW_TEAM_USAGE,
    PERMISSIONS.MANAGE_TEAM_MEMBERS,
    PERMISSIONS.APPROVE_REQUESTS,
    PERMISSIONS.VIEW_OWN_USAGE,
    PERMISSIONS.MANAGE_OWN_API_KEYS,
    PERMISSIONS.CREATE_REQUESTS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS,
  ],
  
  MANAGER: [
    PERMISSIONS.VIEW_TEAM_USAGE,
    PERMISSIONS.MANAGE_TEAM_MEMBERS,
    PERMISSIONS.APPROVE_REQUESTS,
    PERMISSIONS.VIEW_OWN_USAGE,
    PERMISSIONS.MANAGE_OWN_API_KEYS,
    PERMISSIONS.CREATE_REQUESTS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS,
  ],
  
  USER: [
    PERMISSIONS.VIEW_OWN_USAGE,
    PERMISSIONS.MANAGE_OWN_API_KEYS,
    PERMISSIONS.CREATE_REQUESTS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS,
  ],
  
  VIEWER: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS,
  ],
}

// Check if a role has a specific permission
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

// Get user with permissions
export async function getUserWithPermissions(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      organization: true,
    },
  })
  
  if (!user) {
    return null
  }
  
  const permissions = ROLE_PERMISSIONS[user.role] || []
  
  return {
    ...user,
    permissions,
  }
}

// Check if user has specific permission
export async function userHasPermission(
  email: string,
  permission: Permission
): Promise<boolean> {
  const user = await getUserWithPermissions(email)
  
  if (!user) {
    return false
  }
  
  return user.permissions.includes(permission)
}

// Middleware to check permissions
export async function requirePermission(
  permission: Permission,
  customErrorMessage?: string
) {
  return async function checkPermission(req: NextRequest) {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const hasPermission = await userHasPermission(session.user.email, permission)
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: customErrorMessage || 'Insufficient permissions' },
        { status: 403 }
      )
    }
    
    return null // Continue processing
  }
}

// Check organization membership
export async function requireOrganizationMembership(
  req: NextRequest,
  organizationId?: string
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { 
      organizationId: true,
      role: true,
      isSuperAdmin: true,
    },
  })
  
  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }
  
  // Super admins can access any organization
  if (user.isSuperAdmin) {
    return null
  }
  
  // Check if user belongs to the organization
  const targetOrgId = organizationId || user.organizationId
  
  if (!targetOrgId || user.organizationId !== targetOrgId) {
    return NextResponse.json(
      { error: 'Access denied to this organization' },
      { status: 403 }
    )
  }
  
  return null // Continue processing
}

// Check resource ownership
export async function requireResourceOwnership(
  req: NextRequest,
  resourceType: 'apiKey' | 'usage' | 'thread' | 'notification',
  resourceId: string
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { 
      id: true,
      role: true,
      organizationId: true,
      isSuperAdmin: true,
    },
  })
  
  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }
  
  // Super admins can access any resource
  if (user.isSuperAdmin) {
    return null
  }
  
  // Check resource ownership based on type
  let hasAccess = false
  
  switch (resourceType) {
    case 'apiKey':
      const apiKey = await prisma.apiKey.findUnique({
        where: { id: resourceId },
        select: { 
          userId: true,
          organizationId: true,
        },
      })
      
      if (apiKey) {
        // User owns the key or is an admin of the organization
        hasAccess = apiKey.userId === user.id ||
          (user.role === 'ADMIN' && apiKey.organizationId === user.organizationId)
      }
      break
      
    case 'usage':
      const usage = await prisma.usage.findUnique({
        where: { id: resourceId },
        select: { 
          userId: true,
          user: {
            select: {
              organizationId: true,
            }
          }
        },
      })
      
      if (usage) {
        // User owns the usage record or has permission to view team usage
        hasAccess = usage.userId === user.id ||
          (roleHasPermission(user.role, PERMISSIONS.VIEW_TEAM_USAGE) && 
           usage.user.organizationId === user.organizationId)
      }
      break
      
    case 'thread':
      const thread = await prisma.aIThread.findUnique({
        where: { id: resourceId },
        select: { 
          userId: true,
          organizationId: true,
        },
      })
      
      if (thread) {
        // User owns the thread or is an admin of the organization
        hasAccess = thread.userId === user.id ||
          (user.role === 'ADMIN' && thread.organizationId === user.organizationId)
      }
      break
      
    case 'notification':
      const notification = await prisma.notification.findUnique({
        where: { id: resourceId },
        select: { 
          userId: true,
          organizationId: true,
        },
      })
      
      if (notification) {
        // User owns the notification or it's an org-wide notification they can see
        hasAccess = notification.userId === user.id ||
          (!notification.userId && notification.organizationId === user.organizationId)
      }
      break
  }
  
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Access denied to this resource' },
      { status: 403 }
    )
  }
  
  return null // Continue processing
}

// Combine multiple permission checks
export async function requireAnyPermission(
  ...permissions: Permission[]
) {
  return async function checkAnyPermission(req: NextRequest) {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    for (const permission of permissions) {
      const hasPermission = await userHasPermission(session.user.email, permission)
      if (hasPermission) {
        return null // User has at least one required permission
      }
    }
    
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }
}

// Check if user can perform action on another user
export async function canManageUser(
  actorEmail: string,
  targetUserId: string
): Promise<boolean> {
  const actor = await getUserWithPermissions(actorEmail)
  
  if (!actor) {
    return false
  }
  
  // Super admins can manage anyone
  if (actor.isSuperAdmin) {
    return true
  }
  
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { 
      organizationId: true,
      role: true,
    },
  })
  
  if (!targetUser) {
    return false
  }
  
  // Must be in same organization
  if (actor.organizationId !== targetUser.organizationId) {
    return false
  }
  
  // Check role hierarchy
  const roleHierarchy: Record<UserRole, number> = {
    SUPER_ADMIN: 5,
    ADMIN: 4,
    MANAGER: 3,
    USER: 2,
    VIEWER: 1,
  }
  
  // Can only manage users with lower or equal role
  return roleHierarchy[actor.role] >= roleHierarchy[targetUser.role] &&
    actor.permissions.includes(PERMISSIONS.MANAGE_MEMBERS)
}