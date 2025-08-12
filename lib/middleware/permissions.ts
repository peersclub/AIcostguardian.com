import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth-config'
import { prisma } from '../prisma'
import { 
  createAuditLog, 
  AuditAction, 
  AuditSeverity 
} from '../services/audit-log'

export enum Permission {
  // Thread permissions
  THREAD_VIEW = 'thread:view',
  THREAD_CREATE = 'thread:create',
  THREAD_EDIT = 'thread:edit',
  THREAD_DELETE = 'thread:delete',
  THREAD_SHARE = 'thread:share',
  THREAD_EXPORT = 'thread:export',
  
  // Message permissions
  MESSAGE_CREATE = 'message:create',
  MESSAGE_EDIT = 'message:edit',
  MESSAGE_DELETE = 'message:delete',
  MESSAGE_REACT = 'message:react',
  
  // Collaboration permissions
  COLLAB_INVITE = 'collab:invite',
  COLLAB_REMOVE = 'collab:remove',
  COLLAB_MANAGE = 'collab:manage',
  
  // Admin permissions
  ADMIN_USERS = 'admin:users',
  ADMIN_SETTINGS = 'admin:settings',
  ADMIN_BILLING = 'admin:billing',
  ADMIN_ANALYTICS = 'admin:analytics',
  
  // API permissions
  API_KEY_CREATE = 'api:key:create',
  API_KEY_DELETE = 'api:key:delete',
  API_KEY_VIEW = 'api:key:view',
  
  // Voice permissions
  VOICE_TRANSCRIBE = 'voice:transcribe',
  VOICE_UNLIMITED = 'voice:unlimited',
}

export enum CollaboratorRole {
  VIEWER = 'VIEWER',
  EDITOR = 'EDITOR',
  MODERATOR = 'MODERATOR',
  OWNER = 'OWNER',
}

// Role-based permission mappings
const rolePermissions: Record<CollaboratorRole, Permission[]> = {
  [CollaboratorRole.VIEWER]: [
    Permission.THREAD_VIEW,
    Permission.MESSAGE_REACT,
  ],
  [CollaboratorRole.EDITOR]: [
    Permission.THREAD_VIEW,
    Permission.THREAD_EDIT,
    Permission.MESSAGE_CREATE,
    Permission.MESSAGE_EDIT,
    Permission.MESSAGE_REACT,
  ],
  [CollaboratorRole.MODERATOR]: [
    Permission.THREAD_VIEW,
    Permission.THREAD_EDIT,
    Permission.THREAD_SHARE,
    Permission.MESSAGE_CREATE,
    Permission.MESSAGE_EDIT,
    Permission.MESSAGE_DELETE,
    Permission.MESSAGE_REACT,
    Permission.COLLAB_INVITE,
    Permission.COLLAB_REMOVE,
  ],
  [CollaboratorRole.OWNER]: [
    // Owners have all permissions
    ...Object.values(Permission),
  ],
}

/**
 * Check if a user has a specific permission for a thread
 */
export async function checkThreadPermission(
  userId: string,
  threadId: string,
  permission: Permission
): Promise<boolean> {
  try {
    // Get thread with collaborators
    const thread = await prisma.aIThread.findUnique({
      where: { id: threadId },
      include: {
        collaborators: {
          where: { userId },
        },
      },
    })
    
    if (!thread) {
      return false
    }
    
    // Check if user is the owner
    if (thread.userId === userId) {
      return true // Owners have all permissions
    }
    
    // Check if thread is shared publicly
    if (thread.shareId && permission === Permission.THREAD_VIEW) {
      return true // Public threads can be viewed by anyone with the link
    }
    
    // Check collaborator permissions
    const collaborator = thread.collaborators[0]
    if (!collaborator) {
      return false // Not a collaborator
    }
    
    const role = collaborator.role as CollaboratorRole
    const permissions = rolePermissions[role] || []
    
    return permissions.includes(permission)
  } catch (error) {
    console.error('Permission check error:', error)
    return false
  }
}

/**
 * Check if a user has admin permissions
 */
export async function checkAdminPermission(
  userId: string,
  permission: Permission
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })
    
    if (!user || user.role !== 'ADMIN') {
      return false
    }
    
    // Admins have all admin permissions
    return permission.startsWith('admin:')
  } catch (error) {
    console.error('Admin permission check error:', error)
    return false
  }
}

/**
 * Check if a user has organization-level permissions
 */
export async function checkOrganizationPermission(
  userId: string,
  organizationId: string,
  permission: Permission
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        organizationId: true,
        role: true,
      },
    })
    
    if (!user || user.organizationId !== organizationId) {
      return false
    }
    
    // Organization admins have elevated permissions
    if (user.role === 'ADMIN') {
      return true
    }
    
    // Check specific organization permissions
    // This could be extended with organization-specific roles
    return false
  } catch (error) {
    console.error('Organization permission check error:', error)
    return false
  }
}

/**
 * Middleware to enforce permissions on API routes
 */
export function requirePermission(permission: Permission) {
  return async (
    handler: (req: NextRequest) => Promise<NextResponse>
  ) => {
    return async (req: NextRequest): Promise<NextResponse> => {
      try {
        // Get user session
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
          await createAuditLog({
            action: AuditAction.INVALID_ACCESS_ATTEMPT,
            severity: AuditSeverity.MEDIUM,
            metadata: {
              permission,
              endpoint: req.nextUrl.pathname,
            },
            success: false,
            errorMessage: 'No session',
          })
          
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          )
        }
        
        // Extract resource ID from URL if applicable
        const { pathname } = req.nextUrl
        const threadMatch = pathname.match(/\/threads\/([^\/]+)/)
        const threadId = threadMatch?.[1]
        
        let hasPermission = false
        
        // Check permission based on resource type
        if (threadId && permission.startsWith('thread:')) {
          hasPermission = await checkThreadPermission(
            session.user.id,
            threadId,
            permission
          )
        } else if (permission.startsWith('admin:')) {
          hasPermission = await checkAdminPermission(
            session.user.id,
            permission
          )
        } else {
          // Default permission check (e.g., for user's own resources)
          hasPermission = true
        }
        
        if (!hasPermission) {
          await createAuditLog({
            action: AuditAction.INVALID_ACCESS_ATTEMPT,
            severity: AuditSeverity.HIGH,
            userId: session.user.id,
            metadata: {
              permission,
              endpoint: pathname,
              threadId,
            },
            success: false,
            errorMessage: 'Permission denied',
          })
          
          return NextResponse.json(
            { error: 'Permission denied' },
            { status: 403 }
          )
        }
        
        // Permission granted, continue with handler
        return handler(req)
      } catch (error) {
        console.error('Permission middleware error:', error)
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }
    }
  }
}

/**
 * Get effective permissions for a user on a thread
 */
export async function getThreadPermissions(
  userId: string,
  threadId: string
): Promise<Permission[]> {
  try {
    const thread = await prisma.aIThread.findUnique({
      where: { id: threadId },
      include: {
        collaborators: {
          where: { userId },
        },
      },
    })
    
    if (!thread) {
      return []
    }
    
    // Owner has all permissions
    if (thread.userId === userId) {
      return Object.values(Permission).filter(p => p.startsWith('thread:') || p.startsWith('message:'))
    }
    
    // Get collaborator role
    const collaborator = thread.collaborators[0]
    if (!collaborator) {
      // Check if thread is public
      if (thread.shareId) {
        return [Permission.THREAD_VIEW]
      }
      return []
    }
    
    const role = collaborator.role as CollaboratorRole
    return rolePermissions[role] || []
  } catch (error) {
    console.error('Get permissions error:', error)
    return []
  }
}

/**
 * Update collaborator role with permission check
 */
export async function updateCollaboratorRole(
  requesterId: string,
  threadId: string,
  collaboratorId: string,
  newRole: CollaboratorRole
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if requester has permission to manage collaborators
    const hasPermission = await checkThreadPermission(
      requesterId,
      threadId,
      Permission.COLLAB_MANAGE
    )
    
    if (!hasPermission) {
      return { success: false, error: 'Permission denied' }
    }
    
    // Prevent changing owner's role
    const thread = await prisma.aIThread.findUnique({
      where: { id: threadId },
    })
    
    if (thread?.userId === collaboratorId) {
      return { success: false, error: 'Cannot change owner role' }
    }
    
    // Update collaborator role
    await prisma.threadCollaborator.update({
      where: {
        threadId_userId: {
          threadId,
          userId: collaboratorId,
        },
      },
      data: {
        role: newRole,
      },
    })
    
    // Audit log
    await createAuditLog({
      action: AuditAction.ADMIN_ACTION,
      severity: AuditSeverity.MEDIUM,
      userId: requesterId,
      targetId: collaboratorId,
      targetType: 'ThreadCollaborator',
      metadata: {
        threadId,
        oldRole: 'unknown',
        newRole,
      },
      success: true,
    })
    
    return { success: true }
  } catch (error) {
    console.error('Update role error:', error)
    return { success: false, error: 'Failed to update role' }
  }
}

/**
 * Check if user can perform an action on a message
 */
export async function checkMessagePermission(
  userId: string,
  messageId: string,
  permission: Permission
): Promise<boolean> {
  try {
    const message = await prisma.aIMessage.findUnique({
      where: { id: messageId },
      include: {
        thread: {
          include: {
            collaborators: {
              where: { userId },
            },
          },
        },
      },
    })
    
    if (!message) {
      return false
    }
    
    // Check thread-level permission
    return checkThreadPermission(userId, message.threadId, permission)
  } catch (error) {
    console.error('Message permission check error:', error)
    return false
  }
}