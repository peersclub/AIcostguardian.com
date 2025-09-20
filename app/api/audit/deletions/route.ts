import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import {
  getDeletionAuditTrail,
  generateDeletionComplianceReport,
  queryAuditLogs,
  AuditAction,
  AuditSeverity
} from '@/lib/services/audit-log'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * GET /api/audit/deletions
 * Retrieve deletion audit logs and compliance reports
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'logs'
    const targetId = searchParams.get('targetId')
    const targetType = searchParams.get('targetType')
    const organizationId = searchParams.get('organizationId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Check user permissions
    const userRole = session.user.role
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(userRole)

    if (!isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    switch (type) {
      case 'trail':
        // Get audit trail for specific record
        if (!targetId || !targetType) {
          return NextResponse.json({ error: 'targetId and targetType required for trail' }, { status: 400 })
        }

        const trail = await getDeletionAuditTrail(targetId, targetType)
        return NextResponse.json({
          success: true,
          data: {
            targetId,
            targetType,
            trail: trail.map(log => ({
              id: log.id,
              action: log.action,
              severity: log.severity,
              timestamp: log.createdAt,
              userId: log.userId,
              userName: log.user?.name || 'Unknown',
              metadata: log.metadata,
              success: log.success,
              canRestore: log.metadata?.canRestore || false
            }))
          }
        })

      case 'compliance':
        // Generate compliance report
        const dateRange = startDate && endDate ? {
          start: new Date(startDate),
          end: new Date(endDate)
        } : undefined

        const report = await generateDeletionComplianceReport(
          organizationId || undefined,
          dateRange
        )

        return NextResponse.json({
          success: true,
          data: {
            report,
            generatedAt: new Date().toISOString(),
            organizationId,
            dateRange
          }
        })

      case 'logs':
      default:
        // Get deletion logs
        const filters: any = {
          limit
        }

        if (startDate) filters.startDate = new Date(startDate)
        if (endDate) filters.endDate = new Date(endDate)
        if (organizationId && userRole === 'SUPER_ADMIN') {
          // Only super admin can query across organizations
          filters.organizationId = organizationId
        } else {
          // Restrict to user's organization
          filters.organizationId = session.user.organizationId
        }

        // Get deletion-related logs
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
          AuditAction.ALERT_DELETED,
          AuditAction.BULK_DATA_DELETED,
          AuditAction.DATA_PURGED,
          AuditAction.PERSONAL_DATA_ANONYMIZED
        ]

        const allLogs = await Promise.all(
          deletionActions.map(action =>
            queryAuditLogs({ ...filters, action })
          )
        )

        const logs = allLogs.flat().sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, limit)

        return NextResponse.json({
          success: true,
          data: {
            logs: logs.map(log => ({
              id: log.id,
              action: log.action,
              severity: log.severity,
              timestamp: log.createdAt,
              userId: log.userId,
              userName: log.user?.name || 'Unknown',
              userRole: log.user?.role || 'Unknown',
              targetId: log.targetId,
              targetType: log.targetType,
              metadata: log.metadata,
              success: log.success,
              ipAddress: log.ipAddress,
              userAgent: log.userAgent?.substring(0, 100) + '...' // Truncate for display
            })),
            total: logs.length,
            filters: filters
          }
        })
    }
  } catch (error) {
    console.error('Failed to retrieve deletion audit data:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve audit data' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/audit/deletions
 * Create deletion audit logs (for manual logging)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      action,
      targetId,
      targetType,
      originalData,
      deletionReason,
      cascadeInfo
    } = body

    // Validate required fields
    if (!action || !targetId || !targetType) {
      return NextResponse.json({
        error: 'action, targetId, and targetType are required'
      }, { status: 400 })
    }

    // Validate action is a deletion type
    const validActions = [
      AuditAction.DATA_DELETED,
      AuditAction.DATA_SOFT_DELETED,
      AuditAction.DATA_PERMANENTLY_DELETED,
      AuditAction.THREAD_DELETED,
      AuditAction.THREAD_MESSAGE_DELETED,
      AuditAction.USER_DELETED,
      AuditAction.API_KEY_DELETED,
      AuditAction.USAGE_LOG_DELETED,
      AuditAction.NOTIFICATION_DELETED,
      AuditAction.ALERT_DELETED
    ]

    if (!validActions.includes(action)) {
      return NextResponse.json({
        error: 'Invalid deletion action'
      }, { status: 400 })
    }

    // Import logDeletion function
    const { logDeletion } = await import('@/lib/services/audit-log')

    await logDeletion(
      action,
      session.user.id,
      targetId,
      targetType,
      originalData,
      deletionReason,
      cascadeInfo
    )

    return NextResponse.json({
      success: true,
      message: 'Deletion audit log created',
      data: {
        action,
        targetId,
        targetType,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Failed to create deletion audit log:', error)
    return NextResponse.json(
      { error: 'Failed to create audit log' },
      { status: 500 }
    )
  }
}