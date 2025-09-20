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
  THREAD_MESSAGE_DELETED = 'THREAD_MESSAGE_DELETED',

  // Data Deletion Operations (Comprehensive Tracking)
  DATA_DELETED = 'DATA_DELETED',
  BULK_DATA_DELETED = 'BULK_DATA_DELETED',
  DATA_PURGED = 'DATA_PURGED',
  USAGE_LOG_DELETED = 'USAGE_LOG_DELETED',
  NOTIFICATION_DELETED = 'NOTIFICATION_DELETED',
  ALERT_DELETED = 'ALERT_DELETED',
  ORGANIZATION_DELETED = 'ORGANIZATION_DELETED',
  PROJECT_DELETED = 'PROJECT_DELETED',
  INVITATION_DELETED = 'INVITATION_DELETED',

  // Soft Delete Operations
  DATA_SOFT_DELETED = 'DATA_SOFT_DELETED',
  DATA_RESTORED = 'DATA_RESTORED',

  // Permanent Deletion (GDPR/Compliance)
  DATA_PERMANENTLY_DELETED = 'DATA_PERMANENTLY_DELETED',
  PERSONAL_DATA_ANONYMIZED = 'PERSONAL_DATA_ANONYMIZED',
  RETENTION_POLICY_APPLIED = 'RETENTION_POLICY_APPLIED',

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
  success: boolean,
  userId?: string,
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
 * Log deletion operations with comprehensive metadata capture
 */
export async function logDeletion(
  action: AuditAction,
  userId: string,
  targetId: string,
  targetType: string,
  originalData?: Record<string, any>,
  deletionReason?: string,
  cascadeInfo?: {
    relatedRecords: Array<{ type: string; count: number }>
    totalAffected: number
  }
): Promise<void> {
  await createAuditLog({
    action,
    severity: AuditSeverity.HIGH,
    userId,
    targetId,
    targetType,
    metadata: {
      deletionType: action.includes('SOFT') ? 'soft' : action.includes('PERMANENTLY') ? 'permanent' : 'hard',
      deletionReason,
      originalData: originalData ? {
        // Store key fields but sanitize sensitive data
        ...Object.fromEntries(
          Object.entries(originalData).filter(([key]) =>
            !['password', 'token', 'secret', 'key'].some(sensitive =>
              key.toLowerCase().includes(sensitive)
            )
          )
        )
      } : undefined,
      cascadeInfo,
      timestamp: new Date().toISOString(),
      canRestore: action.includes('SOFT'),
      requiresApproval: action.includes('PERMANENTLY'),
    },
    success: true,
  })
}

/**
 * Log thread deletion with full thread context
 */
export async function logThreadDeletion(
  userId: string,
  threadId: string,
  threadData: {
    title: string
    messageCount: number
    collaboratorCount: number
    isShared: boolean
    organizationId: string
  },
  deletionReason?: string
): Promise<void> {
  await logDeletion(
    AuditAction.THREAD_DELETED,
    userId,
    threadId,
    'AIThread',
    {
      title: threadData.title,
      messageCount: threadData.messageCount,
      collaboratorCount: threadData.collaboratorCount,
      isShared: threadData.isShared,
      organizationId: threadData.organizationId
    },
    deletionReason,
    {
      relatedRecords: [
        { type: 'Message', count: threadData.messageCount },
        { type: 'Collaborator', count: threadData.collaboratorCount }
      ],
      totalAffected: threadData.messageCount + threadData.collaboratorCount + 1
    }
  )
}

/**
 * Log message deletion within a thread
 */
export async function logMessageDeletion(
  userId: string,
  messageId: string,
  messageData: {
    threadId: string
    content: string
    provider: string
    tokenCount: number
    cost: number
  },
  deletionReason?: string
): Promise<void> {
  await logDeletion(
    AuditAction.THREAD_MESSAGE_DELETED,
    userId,
    messageId,
    'AIMessage',
    {
      threadId: messageData.threadId,
      contentLength: messageData.content.length,
      provider: messageData.provider,
      tokenCount: messageData.tokenCount,
      cost: messageData.cost
    },
    deletionReason
  )
}

/**
 * Log bulk data deletion operations
 */
export async function logBulkDeletion(
  userId: string,
  operation: {
    type: string
    criteria: Record<string, any>
    affectedCount: number
    relatedRecords?: Array<{ type: string; count: number }>
  },
  deletionReason?: string
): Promise<void> {
  await createAuditLog({
    action: AuditAction.BULK_DATA_DELETED,
    severity: AuditSeverity.CRITICAL,
    userId,
    metadata: {
      bulkOperation: {
        targetType: operation.type,
        deletionCriteria: operation.criteria,
        recordsAffected: operation.affectedCount,
        relatedRecords: operation.relatedRecords,
        totalAffected: operation.relatedRecords?.reduce((sum, r) => sum + r.count, operation.affectedCount) || operation.affectedCount
      },
      deletionReason,
      timestamp: new Date().toISOString(),
      requiresManagerApproval: operation.affectedCount > 100,
      requiresAdminApproval: operation.affectedCount > 1000,
    },
    success: true,
  })
}

/**
 * Log usage data deletion (for compliance/retention policies)
 */
export async function logUsageDataDeletion(
  userId: string,
  operation: {
    dateRange: { start: Date; end: Date }
    providers: string[]
    recordCount: number
    totalCost: number
  },
  deletionReason: string = 'retention_policy'
): Promise<void> {
  await logDeletion(
    AuditAction.USAGE_LOG_DELETED,
    userId,
    `usage-${operation.dateRange.start.toISOString()}-${operation.dateRange.end.toISOString()}`,
    'UsageLog',
    {
      dateRange: {
        start: operation.dateRange.start.toISOString(),
        end: operation.dateRange.end.toISOString(),
        daySpan: Math.ceil((operation.dateRange.end.getTime() - operation.dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
      },
      providers: operation.providers,
      recordCount: operation.recordCount,
      totalCost: operation.totalCost
    },
    deletionReason
  )
}

/**
 * Log organization deletion (critical operation)
 */
export async function logOrganizationDeletion(
  userId: string,
  organizationId: string,
  organizationData: {
    name: string
    userCount: number
    subscriptionType: string
    totalSpending: number
  },
  deletionReason?: string
): Promise<void> {
  await createAuditLog({
    action: AuditAction.ORGANIZATION_DELETED,
    severity: AuditSeverity.CRITICAL,
    userId,
    targetId: organizationId,
    targetType: 'Organization',
    metadata: {
      organizationDetails: {
        name: organizationData.name,
        userCount: organizationData.userCount,
        subscriptionType: organizationData.subscriptionType,
        totalSpending: organizationData.totalSpending
      },
      deletionReason,
      timestamp: new Date().toISOString(),
      requiredApprovals: {
        ceo: false,
        legal: false,
        dataProtection: false
      },
      complianceNotes: 'All user data must be exported and retained per GDPR requirements',
      immediateNotification: true
    },
    success: true,
  })

  // Trigger immediate notification to all admins
  await notifyCriticalEvent({
    action: AuditAction.ORGANIZATION_DELETED,
    severity: AuditSeverity.CRITICAL,
    userId,
    targetId: organizationId,
    targetType: 'Organization',
    metadata: organizationData,
    success: true,
  })
}

/**
 * Log personal data anonymization (GDPR compliance)
 */
export async function logDataAnonymization(
  userId: string,
  targetUserId: string,
  operation: {
    tablesAffected: string[]
    fieldsAnonymized: string[]
    recordCount: number
    retainedForAnalytics: boolean
  },
  legalBasis: string
): Promise<void> {
  await createAuditLog({
    action: AuditAction.PERSONAL_DATA_ANONYMIZED,
    severity: AuditSeverity.HIGH,
    userId,
    targetId: targetUserId,
    targetType: 'User',
    metadata: {
      anonymizationDetails: {
        tablesAffected: operation.tablesAffected,
        fieldsAnonymized: operation.fieldsAnonymized,
        recordCount: operation.recordCount,
        retainedForAnalytics: operation.retainedForAnalytics,
        anonymizationMethod: 'deterministic_hash',
        reversible: false
      },
      legalBasis,
      complianceRequirement: 'GDPR Article 17 - Right to be forgotten',
      timestamp: new Date().toISOString(),
      verificationRequired: true
    },
    success: true,
  })
}

/**
 * Create audit trail for data restoration
 */
export async function logDataRestoration(
  userId: string,
  targetId: string,
  targetType: string,
  restorationData: {
    originalDeletionDate: Date
    restorationReason: string
    approvedBy?: string
    dataIntegrityChecked: boolean
  }
): Promise<void> {
  await createAuditLog({
    action: AuditAction.DATA_RESTORED,
    severity: AuditSeverity.MEDIUM,
    userId,
    targetId,
    targetType,
    metadata: {
      restoration: {
        originalDeletionDate: restorationData.originalDeletionDate.toISOString(),
        daysSinceDeleted: Math.ceil((Date.now() - restorationData.originalDeletionDate.getTime()) / (1000 * 60 * 60 * 24)),
        restorationReason: restorationData.restorationReason,
        approvedBy: restorationData.approvedBy,
        dataIntegrityChecked: restorationData.dataIntegrityChecked,
        automaticRestore: !restorationData.approvedBy
      },
      timestamp: new Date().toISOString()
    },
    success: true,
  })
}

/**
 * Get deletion audit trail for a specific record
 */
export async function getDeletionAuditTrail(
  targetId: string,
  targetType: string
): Promise<any[]> {
  const deletionActions = [
    AuditAction.DATA_DELETED,
    AuditAction.DATA_SOFT_DELETED,
    AuditAction.DATA_PERMANENTLY_DELETED,
    AuditAction.DATA_RESTORED,
    AuditAction.THREAD_DELETED,
    AuditAction.THREAD_MESSAGE_DELETED,
    AuditAction.USER_DELETED,
    AuditAction.ORGANIZATION_DELETED,
    AuditAction.API_KEY_DELETED,
    AuditAction.USAGE_LOG_DELETED,
    AuditAction.NOTIFICATION_DELETED,
    AuditAction.ALERT_DELETED
  ]

  return queryAuditLogs({
    action: deletionActions[0], // We'll need to modify queryAuditLogs to accept arrays
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
    limit: 1000
  }).then(logs => logs.filter(log =>
    log.targetId === targetId &&
    log.targetType === targetType &&
    deletionActions.includes(log.action)
  ))
}

/**
 * Generate deletion compliance report
 */
export async function generateDeletionComplianceReport(
  organizationId?: string,
  dateRange?: { start: Date; end: Date }
): Promise<{
  summary: {
    totalDeletions: number
    softDeletions: number
    permanentDeletions: number
    restorations: number
  }
  byType: Record<string, number>
  complianceMetrics: {
    gdprCompliant: boolean
    retentionPolicyViolations: number
    unapprovedDeletions: number
  }
  riskFactors: string[]
}> {
  const where: any = {}

  // Note: AuditLog doesn't have organizationId directly, we'll filter by user's organization
  if (organizationId) {
    where.user = {
      organizationId: organizationId
    }
  }

  if (dateRange) {
    where.createdAt = {
      gte: dateRange.start,
      lte: dateRange.end
    }
  }

  const deletionLogs = await prisma.auditLog.findMany({
    where: {
      ...where,
      action: {
        in: [
          AuditAction.DATA_DELETED,
          AuditAction.DATA_SOFT_DELETED,
          AuditAction.DATA_PERMANENTLY_DELETED,
          AuditAction.DATA_RESTORED,
          AuditAction.THREAD_DELETED,
          AuditAction.USER_DELETED,
          AuditAction.ORGANIZATION_DELETED
        ]
      }
    },
    include: {
      user: {
        select: { id: true, name: true, role: true }
      }
    }
  })

  // Analyze the logs
  const summary = {
    totalDeletions: deletionLogs.filter(log => !log.action.includes('RESTORED')).length,
    softDeletions: deletionLogs.filter(log => log.action.includes('SOFT')).length,
    permanentDeletions: deletionLogs.filter(log => log.action.includes('PERMANENTLY')).length,
    restorations: deletionLogs.filter(log => log.action.includes('RESTORED')).length
  }

  const byType = deletionLogs.reduce((acc, log) => {
    const type = log.targetType || 'Unknown'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const complianceMetrics = {
    gdprCompliant: true, // Would implement actual compliance checks
    retentionPolicyViolations: 0,
    unapprovedDeletions: deletionLogs.filter(log =>
      log.severity === AuditSeverity.CRITICAL &&
      !log.metadata?.approvedBy
    ).length
  }

  const riskFactors: string[] = []
  if (complianceMetrics.unapprovedDeletions > 0) {
    riskFactors.push(`${complianceMetrics.unapprovedDeletions} critical deletions without approval`)
  }
  if (summary.permanentDeletions > summary.softDeletions * 0.1) {
    riskFactors.push('High ratio of permanent deletions may indicate compliance risk')
  }

  return {
    summary,
    byType,
    complianceMetrics,
    riskFactors
  }
}

/**
 * Clean up old audit logs (for compliance)
 */
export async function cleanupOldAuditLogs(retentionDays: number = 90): Promise<void> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  // Log the cleanup operation itself
  await createAuditLog({
    action: AuditAction.RETENTION_POLICY_APPLIED,
    severity: AuditSeverity.MEDIUM,
    metadata: {
      retentionPolicy: {
        retentionDays,
        cutoffDate: cutoffDate.toISOString(),
        preserveCritical: true
      }
    },
    success: true,
  })

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