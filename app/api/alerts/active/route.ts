import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') // 'active', 'acknowledged', 'critical'

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user?.organizationId) {
      // If no organization, return empty array
      return NextResponse.json([])
    }

    // Build filter conditions
    const where: any = {
      organizationId: user.organizationId,
      resolved: false // Only show unresolved alerts by default
    }

    if (filter === 'active') {
      where.acknowledged = false
    } else if (filter === 'acknowledged') {
      where.acknowledged = true
    } else if (filter === 'critical') {
      where.severity = 'critical'
    }

    // Get active alerts for the organization
    const alerts = await prisma.activeAlert.findMany({
      where,
      include: {
        rule: {
          select: {
            id: true,
            name: true,
            type: true,
            channels: true
          }
        }
      },
      orderBy: { triggeredAt: 'desc' }
    })

    // Format response to match expected structure
    const formattedAlerts = alerts.map(alert => ({
      ...alert,
      ruleId: alert.rule.id,
      ruleName: alert.rule.name,
      channels: alert.rule.channels
    }))

    return NextResponse.json(formattedAlerts)
  } catch (error) {
    console.error('Error fetching active alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch active alerts' },
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
    const { alertId, action, notes } = body

    if (!alertId || !action) {
      return NextResponse.json(
        { error: 'Alert ID and action are required' },
        { status: 400 }
      )
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Check if alert exists and belongs to organization
    const existingAlert = await prisma.activeAlert.findFirst({
      where: {
        id: alertId,
        organizationId: user.organizationId
      }
    })

    if (!existingAlert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    // Handle different actions
    let updateData: any = {}
    
    switch (action) {
      case 'acknowledge':
        updateData = {
          acknowledged: true,
          acknowledgedBy: session.user.email,
          acknowledgedAt: new Date()
        }
        break

      case 'escalate':
        updateData = {
          escalated: true,
          escalatedAt: new Date()
        }
        break

      case 'resolve':
        updateData = {
          resolved: true,
          resolvedAt: new Date()
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Update the alert
    const updatedAlert = await prisma.activeAlert.update({
      where: { id: alertId },
      data: updateData,
      include: {
        rule: true
      }
    })

    return NextResponse.json({
      success: true,
      message: `Alert ${action}d successfully`,
      alert: updatedAlert
    })
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}

// Create new alert (triggered by system or webhook)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ruleId, type, severity, message, currentValue, threshold } = body

    if (!ruleId || !type || !severity || !message) {
      return NextResponse.json(
        { error: 'Missing required alert fields' },
        { status: 400 }
      )
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Verify rule exists and belongs to organization
    const rule = await prisma.alertRule.findFirst({
      where: {
        id: ruleId,
        organizationId: user.organizationId
      }
    })

    if (!rule) {
      return NextResponse.json({ error: 'Alert rule not found' }, { status: 404 })
    }

    // Create new alert
    const newAlert = await prisma.activeAlert.create({
      data: {
        ruleId,
        type,
        severity,
        message,
        currentValue: currentValue || 0,
        threshold: threshold || 0,
        organizationId: user.organizationId,
        escalated: severity === 'critical' // Auto-escalate critical alerts
      },
      include: {
        rule: true
      }
    })

    // Update rule's trigger count and last triggered
    await prisma.alertRule.update({
      where: { id: ruleId },
      data: {
        triggerCount: { increment: 1 },
        lastTriggered: new Date(),
        status: 'triggered'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Alert created successfully',
      alert: newAlert
    })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}