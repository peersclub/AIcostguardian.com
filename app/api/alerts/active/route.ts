import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
// Mock data store for active alerts (in production, use a database)
const activeAlerts = new Map<string, any[]>()

// Initialize with sample active alerts
activeAlerts.set('default', [
  {
    id: 'alert-1',
    ruleId: '3',
    ruleName: 'API Quota Warning',
    type: 'quota',
    severity: 'critical',
    message: 'API quota utilization has reached 92% (23,000/25,000 requests)',
    currentValue: 92,
    threshold: 90,
    triggeredAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    acknowledged: false,
    escalated: true,
    escalatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    escalatedTo: ['admin@assetworks.com', 'cto@assetworks.com'],
    channels: ['email', 'slack', 'webhook'],
    metadata: {
      currentQuota: 23000,
      totalQuota: 25000,
      quotaPeriod: 'monthly',
      projectedExhaustion: '2025-03-28'
    }
  },
  {
    id: 'alert-2',
    ruleId: '1',
    ruleName: 'Monthly Cost Threshold',
    type: 'cost',
    severity: 'high',
    message: 'Monthly Claude API costs have exceeded threshold: $1,245.67',
    currentValue: 1245.67,
    threshold: 1000,
    triggeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    acknowledged: true,
    acknowledgedBy: 'john.smith@assetworks.com',
    acknowledgedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    escalated: false,
    channels: ['email', 'slack'],
    metadata: {
      monthToDate: 1245.67,
      previousMonth: 867.23,
      percentIncrease: 43.6,
      topSpendingModel: 'claude-3-5-sonnet'
    }
  },
  {
    id: 'alert-3',
    ruleId: '2',
    ruleName: 'Daily Usage Spike',
    type: 'anomaly',
    severity: 'medium',
    message: 'Daily API calls increased by 425% compared to 7-day average (2,100 vs 400)',
    currentValue: 2100,
    threshold: 400,
    triggeredAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    acknowledged: false,
    escalated: false,
    channels: ['email'],
    metadata: {
      currentDayUsage: 2100,
      averageUsage: 400,
      percentIncrease: 425,
      peakHour: '14:00-15:00',
      topUser: 'sarah.johnson@assetworks.com'
    }
  },
  {
    id: 'alert-4',
    ruleId: '4',
    ruleName: 'Unauthorized API Access',
    type: 'security',
    severity: 'critical',
    message: 'Multiple failed authentication attempts detected from IP 192.168.1.100',
    currentValue: 8,
    threshold: 5,
    triggeredAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    acknowledged: false,
    escalated: true,
    escalatedAt: new Date(Date.now() - 30 * 60 * 1000),
    escalatedTo: ['security@assetworks.com', 'admin@assetworks.com'],
    channels: ['email', 'slack', 'webhook'],
    metadata: {
      sourceIP: '192.168.1.100',
      attemptedUser: 'unknown@external.com',
      failureCount: 8,
      timeWindow: '1 hour',
      blocked: true
    }
  }
])

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') // 'active', 'acknowledged', 'critical'

    const userCompany = session.user.company || 'default'
    let alerts = activeAlerts.get(userCompany) || []

    // Apply filters
    if (filter === 'active') {
      alerts = alerts.filter(alert => !alert.acknowledged)
    } else if (filter === 'acknowledged') {
      alerts = alerts.filter(alert => alert.acknowledged)
    } else if (filter === 'critical') {
      alerts = alerts.filter(alert => alert.severity === 'critical')
    }

    // Sort by triggered time (most recent first)
    alerts = alerts.sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching active alerts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { alertId, action, notes } = await request.json()

    if (!alertId || !action) {
      return NextResponse.json(
        { error: 'Alert ID and action are required' },
        { status: 400 }
      )
    }

    const userCompany = session.user.company || 'default'
    const alerts = activeAlerts.get(userCompany) || []
    
    const alertIndex = alerts.findIndex(alert => alert.id === alertId)
    if (alertIndex === -1) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    // Handle different actions
    switch (action) {
      case 'acknowledge':
        alerts[alertIndex] = {
          ...alerts[alertIndex],
          acknowledged: true,
          acknowledgedBy: session.user.email,
          acknowledgedAt: new Date(),
          notes: notes || ''
        }
        break

      case 'escalate':
        alerts[alertIndex] = {
          ...alerts[alertIndex],
          escalated: true,
          escalatedAt: new Date(),
          escalatedBy: session.user.email,
          escalatedTo: ['admin@assetworks.com', 'cto@assetworks.com']
        }
        break

      case 'resolve':
        alerts[alertIndex] = {
          ...alerts[alertIndex],
          resolved: true,
          resolvedBy: session.user.email,
          resolvedAt: new Date(),
          notes: notes || ''
        }
        break

      case 'snooze':
        const snoozeMinutes = parseInt(notes) || 60 // Default 1 hour
        alerts[alertIndex] = {
          ...alerts[alertIndex],
          snoozed: true,
          snoozedBy: session.user.email,
          snoozedAt: new Date(),
          snoozeUntil: new Date(Date.now() + snoozeMinutes * 60 * 1000)
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    activeAlerts.set(userCompany, alerts)

    return NextResponse.json({
      success: true,
      message: `Alert ${action}d successfully`,
      alert: alerts[alertIndex]
    })
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create new alert (triggered by system)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const alertData = await request.json()
    const { ruleId, ruleName, type, severity, message, currentValue, threshold, metadata } = alertData

    if (!ruleId || !ruleName || !type || !severity || !message) {
      return NextResponse.json(
        { error: 'Missing required alert fields' },
        { status: 400 }
      )
    }

    const userCompany = session.user.company || 'default'
    const alerts = activeAlerts.get(userCompany) || []

    // Create new alert
    const newAlert = {
      id: `alert-${Date.now()}`,
      ruleId,
      ruleName,
      type,
      severity,
      message,
      currentValue: currentValue || 0,
      threshold: threshold || 0,
      triggeredAt: new Date(),
      acknowledged: false,
      escalated: severity === 'critical', // Auto-escalate critical alerts
      escalatedAt: severity === 'critical' ? new Date() : undefined,
      escalatedTo: severity === 'critical' ? ['admin@assetworks.com'] : undefined,
      channels: ['email', 'slack'],
      metadata: metadata || {},
      triggeredBy: 'system'
    }

    alerts.push(newAlert)
    activeAlerts.set(userCompany, alerts)

    // In production, trigger notifications here
    console.log(`New ${severity} alert triggered: ${ruleName}`)

    return NextResponse.json({
      success: true,
      message: 'Alert created successfully',
      alert: newAlert
    })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}