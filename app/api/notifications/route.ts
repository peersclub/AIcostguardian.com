import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { notificationService } from '@/lib/notifications/notification.service'
import { z } from 'zod'
import { NotificationType, NotificationPriority, NotificationStatus } from '@prisma/client'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Validation schemas
const createNotificationSchema = z.object({
  type: z.nativeEnum(NotificationType),
  priority: z.nativeEnum(NotificationPriority),
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
})

const querySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
  status: z.nativeEnum(NotificationStatus).optional(),
  type: z.nativeEnum(NotificationType).optional(),
  priority: z.nativeEnum(NotificationPriority).optional(),
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'priority', 'title']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  unreadOnly: z.string().transform(val => val === 'true').optional()
})

// Rate limiting tracker
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_COUNT = 100 // requests per window

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
 * GET /api/notifications - List notifications with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
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

    // Parse and validate query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    
    const validatedQuery = querySchema.parse(queryParams)
    const {
      page,
      limit,
      status,
      type,
      priority,
      search,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      unreadOnly
    } = validatedQuery

    // Validate pagination limits
    if (limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Limit cannot exceed 100' },
        { status: 400 }
      )
    }

    // Build where conditions
    const where: any = {
      userId: session.user.id,
      organizationId: session.user.organizationId
    }

    if (status) where.status = status
    if (type) where.type = type
    if (priority) where.priority = priority
    if (unreadOnly) where.readAt = null
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get total count for pagination
    const total = await prisma.notification.count({ where })

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        rule: {
          select: { id: true, name: true, type: true }
        }
      }
    })

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        organizationId: session.user.organizationId,
        readAt: null
      }
    })

    const hasMore = page * limit < total
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore
      },
      unreadCount
    }, {
      headers: {
        'X-Total-Count': total.toString(),
        'X-Unread-Count': unreadCount.toString()
      }
    })

  } catch (error) {
    console.error('GET /api/notifications error:', error)
    
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
 * POST /api/notifications - Create manual notification
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
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

    const body = await request.json()
    const validatedData = createNotificationSchema.parse(body)

    // Create notification data
    const notificationData = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session.user.id,
      organizationId: session.user.organizationId!,
      type: validatedData.type,
      priority: validatedData.priority,
      title: validatedData.title,
      message: validatedData.message,
      data: validatedData.data,
      expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined
    }

    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        id: notificationData.id,
        userId: notificationData.userId,
        organizationId: notificationData.organizationId,
        type: notificationData.type,
        priority: notificationData.priority,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data || {},
        status: 'PENDING',
        expiresAt: notificationData.expiresAt,
        createdAt: new Date(),
        channels: {}
      }
    })

    // Schedule or send immediately
    if (validatedData.scheduleFor) {
      await notificationService.scheduleNotification(
        notificationData,
        new Date(validatedData.scheduleFor)
      )
      
      return NextResponse.json({
        success: true,
        data: {
          id: notification.id,
          status: 'SCHEDULED',
          scheduledFor: validatedData.scheduleFor
        }
      }, { status: 201 })
    } else {
      // Send immediately
      let results = []
      
      if (validatedData.channels?.length) {
        // Send to specific channels
        results = await notificationService.sendDirect(notificationData, validatedData.channels)
      } else {
        // Use notification rules
        results = await notificationService.processNotification(notificationData)
      }

      const allSuccessful = results.every(r => r.success)
      const status = allSuccessful ? 'DELIVERED' : (results.some(r => r.success) ? 'SENT' : 'FAILED')

      // Update status
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status,
          deliveredAt: allSuccessful ? new Date() : undefined,
          attempts: Math.max(...results.map(r => r.attempts || 1), 1),
          error: allSuccessful ? undefined : results.find(r => !r.success)?.error
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          id: notification.id,
          status,
          deliveryResults: results
        }
      }, { status: 201 })
    }

  } catch (error) {
    console.error('POST /api/notifications error:', error)
    
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