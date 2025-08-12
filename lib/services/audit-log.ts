import { prisma } from '../prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth-config'
import { NextRequest } from 'next/server'

export enum AuditAction {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  
  // API Keys
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_UPDATED = 'API_KEY_UPDATED',
  API_KEY_DELETED = 'API_KEY_DELETED',
  API_KEY_ACCESSED = 'API_KEY_ACCESSED',
  
  // User Management
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_SUSPENDED = 'USER_SUSPENDED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  
  // Thread Operations
  THREAD_CREATED = 'THREAD_CREATED',
  THREAD_SHARED = 'THREAD_SHARED',
  THREAD_UNSHARED = 'THREAD_UNSHARED',
  THREAD_DELETED = 'THREAD_DELETED',
  THREAD_EXPORTED = 'THREAD_EXPORTED',
  
  // Sensitive Data Access
  SENSITIVE_DATA_ACCESSED = 'SENSITIVE_DATA_ACCESSED',
  SENSITIVE_DATA_EXPORTED = 'SENSITIVE_DATA_EXPORTED',
  
  // Admin Actions
  ADMIN_ACTION = 'ADMIN_ACTION',
  SETTINGS_CHANGED = 'SETTINGS_CHANGED',
  
  // Security Events
  SECURITY_ALERT = 'SECURITY_ALERT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_ACCESS_ATTEMPT = 'INVALID_ACCESS_ATTEMPT',
  CSRF_VIOLATION = 'CSRF_VIOLATION',
}

export enum AuditSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

interface AuditLogEntry {
  action: AuditAction
  severity: AuditSeverity
  userId?: string
  targetId?: string
  targetType?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  success: boolean
  errorMessage?: string
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    // Store in database using Prisma
    await prisma.auditLog.create({
      data: {
        action: entry.action,
        severity: entry.severity,
        userId: entry.userId || null,
        targetId: entry.targetId || null,
        targetType: entry.targetType || null,
        metadata: entry.metadata || {},
        ipAddress: entry.ipAddress || null,
        userAgent: entry.userAgent || null,
        success: entry.success,
        errorMessage: entry.errorMessage || null,
      },
    })
    
    // For critical events, also send to monitoring service
    if (entry.severity === AuditSeverity.CRITICAL) {
      await notifyCriticalEvent(entry)
    }
  } catch (error) {
    // Log to console as fallback
    console.error('Failed to create audit log:', error)
    console.log('Audit log entry:', JSON.stringify(entry))
  }
}

/**
 * Log API key access
 */
export async function logApiKeyAccess(
  apiKeyId: string,
  success: boolean,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    action: AuditAction.API_KEY_ACCESSED,
    severity: success ? AuditSeverity.LOW : AuditSeverity.MEDIUM,
    targetId: apiKeyId,
    targetType: 'ApiKey',
    metadata,
    success,
  })
}

/**
 * Log authentication event
 */
export async function logAuthEvent(
  action: AuditAction,
  userId?: string,
  success: boolean,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    action,
    severity: success ? AuditSeverity.LOW : AuditSeverity.HIGH,
    userId,
    metadata,
    success,
  })
}

/**
 * Log admin action
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  targetId?: string,
  targetType?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    action: AuditAction.ADMIN_ACTION,
    severity: AuditSeverity.HIGH,
    userId: adminId,
    targetId,
    targetType,
    metadata: { ...metadata, adminAction: action },
    success: true,
  })
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  action: AuditAction,
  severity: AuditSeverity,
  metadata?: Record<string, any>,
  req?: NextRequest
): Promise<void> {
  const ipAddress = req?.headers.get('x-forwarded-for') || 
                   req?.headers.get('x-real-ip') || 
                   'unknown'
  const userAgent = req?.headers.get('user-agent') || 'unknown'
  
  // Try to get user from session
  let userId: string | undefined
  try {
    const session = await getServerSession(authOptions)
    userId = session?.user?.id
  } catch {
    // Session not available
  }
  
  await createAuditLog({
    action,
    severity,
    userId,
    metadata,
    ipAddress,
    userAgent,
    success: false,
  })
}

/**
 * Notify about critical events
 */
async function notifyCriticalEvent(entry: AuditLogEntry): Promise<void> {
  // Send to monitoring service (e.g., Sentry, DataDog, etc.)
  console.error('CRITICAL SECURITY EVENT:', entry)
  
  // Send email notification to admins
  // await sendAdminNotification(entry)
  
  // Could also send to Slack, PagerDuty, etc.
}

/**
 * Query audit logs
 */
export async function queryAuditLogs(
  filters: {
    userId?: string
    action?: AuditAction
    severity?: AuditSeverity
    startDate?: Date
    endDate?: Date
    limit?: number
  }
): Promise<any[]> {
  const where: any = {}
  
  if (filters.userId) {
    where.userId = filters.userId
  }
  
  if (filters.action) {
    where.action = filters.action
  }
  
  if (filters.severity) {
    where.severity = filters.severity
  }
  
  if (filters.startDate || filters.endDate) {
    where.createdAt = {}
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate
    }
  }
  
  return prisma.auditLog.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    take: filters.limit || 100,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  })
}

/**
 * Clean up old audit logs (for compliance)
 */
export async function cleanupOldAuditLogs(retentionDays: number = 90): Promise<void> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
  
  await prisma.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
      NOT: {
        severity: AuditSeverity.CRITICAL,
      },
    },
  })
}