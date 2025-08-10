import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { notificationService } from '@/lib/notifications/notification.service'
import { z } from 'zod'
import { NotificationStatus } from '@prisma/client'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Validation schema for updates
const updateNotificationSchema = z.object({
  readAt: z.string().datetime().optional(),
  status: z.nativeEnum(NotificationStatus).optional(),
  metadata: z.record(z.any()).optional()
})

// Rate limiting tracker
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_COUNT = 50 // requests per window

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
 * GET /api/notifications/[id] - Get specific notification
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid notification ID' },
        { status: 400 }
      )
    }

    // Find notification
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: session.user.id,
        organizationId: session.user.organizationId
      },
      include: {
        rule: {
          select: { id: true, name: true, type: true, description: true }
        }
      }
    })

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: notification
    })

  } catch (error) {
    console.error('GET /api/notifications/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications/[id] - Update notification (mark read/unread, acknowledge)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid notification ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateNotificationSchema.parse(body)

    // Check if notification exists and belongs to user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id,
        userId: session.user.id,
        organizationId: session.user.organizationId
      }
    })

    if (!existingNotification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (validatedData.readAt !== undefined) {
      updateData.readAt = validatedData.readAt ? new Date(validatedData.readAt) : new Date()
    }
    
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status
    }
    
    if (validatedData.metadata !== undefined) {
      updateData.data = {
        ...(existingNotification.data as any || {}),
        metadata: validatedData.metadata
      }
    }

    // Update notification
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: updateData,
      include: {
        rule: {
          select: { id: true, name: true, type: true, description: true }
        }
      }
    })

    // Log the action for future audit implementation
    // TODO: Implement audit logging when AuditLog model is added

    return NextResponse.json({
      success: true,
      data: updatedNotification
    })

  } catch (error) {
    console.error('PATCH /api/notifications/[id] error:', error)
    
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
 * DELETE /api/notifications/[id] - Soft delete notification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid notification ID' },
        { status: 400 }
      )
    }

    // Check if notification exists and belongs to user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id,
        userId: session.user.id,
        organizationId: session.user.organizationId
      }
    })

    if (!existingNotification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      )
    }

    // Soft delete by updating status and adding deleted timestamp
    await prisma.notification.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        data: {
          ...(existingNotification.data as any || {}),
          ...{
            deletedAt: new Date().toISOString(),
            deletedBy: session.user.id,
            deletedReason: 'USER_REQUEST'
          }
        }
      }
    })

    // Log the action for future audit implementation
    // TODO: Implement audit logging when AuditLog model is added

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    })

  } catch (error) {
    console.error('DELETE /api/notifications/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications/[id] - Resend notification
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid notification ID' },
        { status: 400 }
      )
    }

    // Find notification
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: session.user.id,
        organizationId: session.user.organizationId
      },
      include: {
        rule: true
      }
    })

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      )
    }

    // Check if notification can be resent
    if (notification.status === 'DELIVERED') {
      return NextResponse.json(
        { success: false, error: 'Cannot resend already delivered notification' },
        { status: 400 }
      )
    }

    if (notification.expiresAt && notification.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Cannot resend expired notification' },
        { status: 400 }
      )
    }

    // Create notification data for resending
    const notificationData = {
      id: notification.id,
      userId: notification.userId,
      organizationId: notification.organizationId,
      type: notification.type,
      priority: notification.priority,
      title: notification.title,
      message: notification.message,
      data: notification.data as Record<string, any> || {},
      expiresAt: notification.expiresAt || undefined
    }

    // Resend notification
    const results = await notificationService.processNotification(notificationData as any, notification.rule ? [notification.rule] as any : undefined)

    const allSuccessful = results.every(r => r.success)
    const status = allSuccessful ? 'DELIVERED' : (results.some(r => r.success) ? 'SENT' : 'FAILED')

    // Update notification with new attempt
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        status,
        deliveredAt: allSuccessful ? new Date() : undefined,
        attempts: (notification.attempts || 0) + 1,
        error: allSuccessful ? null : results.find(r => !r.success)?.error,
        channels: JSON.parse(JSON.stringify({
          ...(notification.channels as Record<string, any> || {}),
          lastResent: new Date().toISOString(),
          resendResults: results
        }))
      }
    })

    // Log the action for future audit implementation
    // TODO: Implement audit logging when AuditLog model is added

    return NextResponse.json({
      success: true,
      data: {
        notification: updatedNotification,
        deliveryResults: results,
        status
      }
    })

  } catch (error) {
    console.error('POST /api/notifications/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}