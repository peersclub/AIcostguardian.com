import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { NotificationStatus, NotificationType, NotificationPriority } from '@prisma/client'

// Validation schemas
const bulkActionSchema = z.object({
  action: z.enum(['mark_read', 'mark_unread', 'delete', 'acknowledge', 'archive', 'restore']),
  notificationIds: z.array(z.string()).min(1).max(100), // Limit bulk operations
  filters: z.object({
    type: z.nativeEnum(NotificationType).optional(),
    priority: z.nativeEnum(NotificationPriority).optional(),
    status: z.nativeEnum(NotificationStatus).optional(),
    olderThan: z.string().datetime().optional(),
    newerThan: z.string().datetime().optional()
  }).optional()
})

const bulkCreateSchema = z.object({
  notifications: z.array(z.object({
    type: z.nativeEnum(NotificationType),
    priority: z.nativeEnum(NotificationPriority).default('MEDIUM'),
    title: z.string().min(1).max(255),
    message: z.string().min(1).max(2000),
    data: z.record(z.any()).optional(),
    channels: z.array(z.object({
      type: z.string(),
      destination: z.string(),
      config: z.record(z.any()).optional()
    })).optional(),
    scheduleFor: z.string().datetime().optional(),
    expiresAt: z.string().datetime().optional()
  })).min(1).max(50) // Limit bulk creation
})

const bulkQuerySchema = z.object({
  action: z.enum(['count', 'export', 'analyze']),
  filters: z.object({
    type: z.nativeEnum(NotificationType).optional(),
    priority: z.nativeEnum(NotificationPriority).optional(),
    status: z.nativeEnum(NotificationStatus).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    search: z.string().optional(),
    ruleId: z.string().optional()
  }).optional(),
  format: z.enum(['json', 'csv']).optional().default('json')
})

// Rate limiting - more restrictive for bulk operations
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_COUNT = 5 // requests per window (very restrictive)

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(userId)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (userLimit.count >= RATE_LIMIT_COUNT) {
    return false
  }

  userLimit.count++
  return true
}

/**
 * POST /api/notifications/bulk - Perform bulk operations on notifications
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Bulk operations have strict rate limits.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    const body = await request.json()
    
    // Check if this is bulk creation
    if (body.notifications) {
      return handleBulkCreate(body, session)
    }

    // Handle bulk actions
    const validatedData = bulkActionSchema.parse(body)

    // Verify all notifications belong to the user
    const notificationCheck = await prisma.notification.findMany({
      where: {
        id: { in: validatedData.notificationIds },
        userId: session.user.id,
        organizationId: session.user.organizationId
      },
      select: { id: true }
    })

    const validIds = notificationCheck.map(n => n.id)
    const invalidIds = validatedData.notificationIds.filter(id => !validIds.includes(id))

    if (invalidIds.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Some notifications not found or not accessible',
          invalidIds 
        },
        { status: 403 }
      )
    }

    // Apply additional filters if provided
    let whereClause: any = {
      id: { in: validIds },
      userId: session.user.id,
      organizationId: session.user.organizationId
    }

    if (validatedData.filters) {
      const filters = validatedData.filters
      if (filters.type) whereClause.type = filters.type
      if (filters.priority) whereClause.priority = filters.priority
      if (filters.status) whereClause.status = filters.status
      
      if (filters.olderThan || filters.newerThan) {
        whereClause.createdAt = {}
        if (filters.olderThan) whereClause.createdAt.lt = new Date(filters.olderThan)
        if (filters.newerThan) whereClause.createdAt.gt = new Date(filters.newerThan)
      }
    }

    const startTime = Date.now()
    let result

    // Execute the bulk action
    switch (validatedData.action) {
      case 'mark_read':
        result = await prisma.notification.updateMany({
          where: whereClause,
          data: { 
            readAt: new Date(),
            updatedAt: new Date()
          }
        })
        break

      case 'mark_unread':
        result = await prisma.notification.updateMany({
          where: whereClause,
          data: { 
            readAt: null,
            updatedAt: new Date()
          }
        })
        break

      case 'delete':
        result = await prisma.notification.updateMany({
          where: whereClause,
          data: { 
            status: 'CANCELLED',
            deletedAt: new Date(),
            updatedAt: new Date(),
            metadata: {
              deletedBy: session.user.id,
              deletedReason: 'BULK_DELETE',
              bulkActionId: `bulk_${Date.now()}`
            }
          }
        })
        break

      case 'acknowledge':
        result = await prisma.notification.updateMany({
          where: whereClause,
          data: { 
            acknowledgedAt: new Date(),
            updatedAt: new Date()
          }
        })
        break

      case 'archive':
        result = await prisma.notification.updateMany({
          where: whereClause,
          data: { 
            status: 'READ',
            archivedAt: new Date(),
            updatedAt: new Date()
          }
        })
        break

      case 'restore':
        result = await prisma.notification.updateMany({
          where: {
            ...whereClause,
            status: { in: ['DELETED', 'ARCHIVED'] }
          },
          data: { 
            status: 'DELIVERED',
            deletedAt: null,
            archivedAt: null,
            updatedAt: new Date()
          }
        })
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

    const executionTime = Date.now() - startTime

    // Log bulk operation
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        organizationId: session.user.organizationId!,
        action: 'NOTIFICATION_BULK_ACTION',
        resourceType: 'NOTIFICATION_BULK',
        resourceId: `bulk_${Date.now()}`,
        details: {
          action: validatedData.action,
          notificationIds: validatedData.notificationIds,
          filters: validatedData.filters,
          affectedCount: result.count,
          executionTimeMs: executionTime,
          timestamp: new Date().toISOString()
        }
      }
    }).catch(() => {
      console.warn('Failed to create audit log for bulk operation')
    })

    return NextResponse.json({
      success: true,
      data: {
        action: validatedData.action,
        requestedCount: validatedData.notificationIds.length,
        affectedCount: result.count,
        executionTime,
        invalidIds
      },
      message: `Bulk ${validatedData.action} completed: ${result.count} notifications affected`
    })

  } catch (error) {
    console.error('POST /api/notifications/bulk error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/notifications/bulk - Get bulk operation information and analytics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    const validatedQuery = bulkQuerySchema.parse(queryParams)

    switch (validatedQuery.action) {
      case 'count':
        return handleBulkCount(validatedQuery, session)
      
      case 'export':
        return handleBulkExport(validatedQuery, session)
      
      case 'analyze':
        return handleBulkAnalyze(validatedQuery, session)
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('GET /api/notifications/bulk error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Handle bulk notification creation
 */
async function handleBulkCreate(body: any, session: any) {
  const validatedData = bulkCreateSchema.parse(body)

  const results = []
  const errors = []

  // Process each notification
  for (let i = 0; i < validatedData.notifications.length; i++) {
    const notificationData = validatedData.notifications[i]
    
    try {
      // Create notification ID
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Create notification in database
      const notification = await prisma.notification.create({
        data: {
          id: notificationId,
          userId: session.user.id,
          organizationId: session.user.organizationId!,
          type: notificationData.type,
          priority: notificationData.priority,
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data || {},
          status: 'PENDING',
          expiresAt: notificationData.expiresAt ? new Date(notificationData.expiresAt) : undefined,
          createdAt: new Date(),
          channels: {}
        }
      })

      results.push({
        index: i,
        id: notification.id,
        status: 'created',
        scheduled: !!notificationData.scheduleFor
      })

      // TODO: Send or schedule notification
      // This would integrate with the notification service

    } catch (error) {
      errors.push({
        index: i,
        error: error.message,
        notification: {
          title: notificationData.title,
          type: notificationData.type
        }
      })
    }
  }

  // Log bulk creation
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      organizationId: session.user.organizationId!,
      action: 'NOTIFICATION_BULK_CREATE',
      resourceType: 'NOTIFICATION_BULK',
      resourceId: `bulk_create_${Date.now()}`,
      details: {
        requestedCount: validatedData.notifications.length,
        successfulCount: results.length,
        errorCount: errors.length,
        results,
        errors,
        timestamp: new Date().toISOString()
      }
    }
  }).catch(() => {
    console.warn('Failed to create audit log for bulk creation')
  })

  return NextResponse.json({
    success: errors.length === 0,
    data: {
      created: results,
      errors,
      summary: {
        requested: validatedData.notifications.length,
        successful: results.length,
        failed: errors.length
      }
    },
    message: `Bulk creation completed: ${results.length}/${validatedData.notifications.length} notifications created`
  })
}

/**
 * Handle bulk count operations
 */
async function handleBulkCount(query: any, session: any) {
  const whereClause = buildWhereClause(query.filters, session)

  const [
    total,
    byStatus,
    byType,
    byPriority,
    unread,
    recent
  ] = await Promise.all([
    prisma.notification.count({ where: whereClause }),
    
    prisma.notification.groupBy({
      by: ['status'],
      where: whereClause,
      _count: true
    }),
    
    prisma.notification.groupBy({
      by: ['type'],
      where: whereClause,
      _count: true
    }),
    
    prisma.notification.groupBy({
      by: ['priority'],
      where: whereClause,
      _count: true
    }),
    
    prisma.notification.count({
      where: { ...whereClause, readAt: null }
    }),
    
    prisma.notification.count({
      where: {
        ...whereClause,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    })
  ])

  return NextResponse.json({
    success: true,
    data: {
      total,
      unread,
      recent24h: recent,
      breakdown: {
        byStatus: byStatus.reduce((acc, item) => {
          acc[item.status] = item._count
          return acc
        }, {} as Record<string, number>),
        
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count
          return acc
        }, {} as Record<string, number>),
        
        byPriority: byPriority.reduce((acc, item) => {
          acc[item.priority] = item._count
          return acc
        }, {} as Record<string, number>)
      }
    }
  })
}

/**
 * Handle bulk export operations
 */
async function handleBulkExport(query: any, session: any) {
  const whereClause = buildWhereClause(query.filters, session)

  // Limit export to prevent memory issues
  const notifications = await prisma.notification.findMany({
    where: whereClause,
    take: 1000, // Maximum export limit
    orderBy: { createdAt: 'desc' },
    include: {
      rule: {
        select: { id: true, name: true }
      }
    }
  })

  if (query.format === 'csv') {
    // Convert to CSV format
    const csvHeader = 'ID,Type,Priority,Title,Message,Status,Created,Read,Delivered,Rule'
    const csvRows = notifications.map(n => [
      n.id,
      n.type,
      n.priority,
      `"${n.title.replace(/"/g, '""')}"`,
      `"${n.message.replace(/"/g, '""')}"`,
      n.status,
      n.createdAt.toISOString(),
      n.readAt?.toISOString() || '',
      n.deliveredAt?.toISOString() || '',
      n.rule?.name || ''
    ].join(','))

    const csvContent = [csvHeader, ...csvRows].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="notifications_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  }

  // JSON export
  return NextResponse.json({
    success: true,
    data: {
      notifications,
      metadata: {
        exportedAt: new Date().toISOString(),
        totalCount: notifications.length,
        filters: query.filters
      }
    }
  })
}

/**
 * Handle bulk analyze operations
 */
async function handleBulkAnalyze(query: any, session: any) {
  const whereClause = buildWhereClause(query.filters, session)

  const [
    deliveryRates,
    avgResponseTime,
    topRules,
    timeDistribution
  ] = await Promise.all([
    // Delivery success rates
    prisma.notification.groupBy({
      by: ['status'],
      where: whereClause,
      _count: true
    }),
    
    // Average time to read
    prisma.$queryRaw`
      SELECT AVG(EXTRACT(EPOCH FROM (read_at - created_at))) as avg_seconds
      FROM "Notification"
      WHERE user_id = ${session.user.id}
      AND read_at IS NOT NULL
      AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    `,
    
    // Most active rules
    prisma.notification.groupBy({
      by: ['ruleId'],
      where: { ...whereClause, ruleId: { not: null } },
      _count: true,
      orderBy: { _count: { ruleId: 'desc' } },
      take: 10
    }),
    
    // Time distribution (hourly)
    prisma.$queryRaw`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM "Notification"
      WHERE user_id = ${session.user.id}
      AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour
    `
  ])

  return NextResponse.json({
    success: true,
    data: {
      deliveryRates: deliveryRates.reduce((acc, item) => {
        acc[item.status] = item._count
        return acc
      }, {} as Record<string, number>),
      
      avgResponseTimeSeconds: avgResponseTime[0]?.avg_seconds || null,
      
      topRules: await Promise.all(
        topRules.map(async (rule) => {
          const ruleInfo = await prisma.notificationRule.findUnique({
            where: { id: rule.ruleId! },
            select: { name: true, type: true }
          })
          return {
            ruleId: rule.ruleId,
            name: ruleInfo?.name || 'Unknown',
            type: ruleInfo?.type || 'Unknown',
            count: rule._count
          }
        })
      ),
      
      hourlyDistribution: timeDistribution
    }
  })
}

/**
 * Build where clause from filters
 */
function buildWhereClause(filters: any, session: any) {
  const whereClause: any = {
    userId: session.user.id,
    organizationId: session.user.organizationId
  }

  if (filters) {
    if (filters.type) whereClause.type = filters.type
    if (filters.priority) whereClause.priority = filters.priority
    if (filters.status) whereClause.status = filters.status
    if (filters.ruleId) whereClause.ruleId = filters.ruleId
    
    if (filters.startDate || filters.endDate) {
      whereClause.createdAt = {}
      if (filters.startDate) whereClause.createdAt.gte = new Date(filters.startDate)
      if (filters.endDate) whereClause.createdAt.lte = new Date(filters.endDate)
    }
    
    if (filters.search) {
      whereClause.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { message: { contains: filters.search, mode: 'insensitive' } }
      ]
    }
  }

  return whereClause
}