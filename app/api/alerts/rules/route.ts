import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
// Mock data store (in production, use a database)
const alertRules = new Map<string, any[]>()

// Initialize with sample enterprise alert rules
alertRules.set('default', [
  {
    id: '1',
    name: 'Monthly Cost Threshold',
    type: 'cost',
    severity: 'high',
    status: 'active',
    threshold: 1000,
    condition: 'exceeds',
    timeframe: 'monthly',
    description: 'Alert when monthly Claude API costs exceed $1,000',
    channels: ['email', 'slack'],
    triggerCount: 2,
    createdAt: new Date('2024-01-01'),
    createdBy: 'admin@assetworks.com'
  },
  {
    id: '2',
    name: 'Daily Usage Spike',
    type: 'anomaly',
    severity: 'medium',
    status: 'active',
    threshold: 300,
    condition: 'change_percent',
    timeframe: 'daily',
    description: 'Alert when daily API calls increase by 300% compared to 7-day average',
    channels: ['email'],
    lastTriggered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    triggerCount: 1,
    createdAt: new Date('2024-01-15'),
    createdBy: 'admin@assetworks.com'
  },
  {
    id: '3',
    name: 'API Quota Warning',
    type: 'quota',
    severity: 'critical',
    status: 'triggered',
    threshold: 90,
    condition: 'exceeds',
    timeframe: 'monthly',
    description: 'Alert when API quota utilization exceeds 90%',
    channels: ['email', 'slack', 'webhook'],
    lastTriggered: new Date(Date.now() - 4 * 60 * 60 * 1000),
    triggerCount: 1,
    createdAt: new Date('2024-02-01'),
    createdBy: 'admin@assetworks.com'
  },
  {
    id: '4',
    name: 'Unauthorized API Access',
    type: 'security',
    severity: 'critical',
    status: 'active',
    threshold: 5,
    condition: 'exceeds',
    timeframe: 'hourly',
    description: 'Alert on multiple failed authentication attempts',
    channels: ['email', 'slack', 'webhook'],
    triggerCount: 0,
    createdAt: new Date('2024-02-10'),
    createdBy: 'security@assetworks.com'
  },
  {
    id: '5',
    name: 'Cost Per Token Efficiency',
    type: 'compliance',
    severity: 'low',
    status: 'active',
    threshold: 0.05,
    condition: 'exceeds',
    timeframe: 'weekly',
    description: 'Monitor cost efficiency and model optimization',
    channels: ['email'],
    triggerCount: 3,
    createdAt: new Date('2024-02-15'),
    createdBy: 'finance@assetworks.com'
  },
  {
    id: '6',
    name: 'Team Member Excessive Usage',
    type: 'usage',
    severity: 'medium',
    status: 'active',
    threshold: 1000,
    condition: 'exceeds',
    timeframe: 'daily',
    description: 'Alert when individual team member exceeds 1000 API calls per day',
    channels: ['email', 'slack'],
    triggerCount: 0,
    createdAt: new Date('2024-02-20'),
    createdBy: 'admin@assetworks.com'
  },
  {
    id: '7',
    name: 'Model Usage Compliance',
    type: 'compliance',
    severity: 'high',
    status: 'active',
    threshold: 80,
    condition: 'exceeds',
    timeframe: 'monthly',
    description: 'Alert when expensive models (Opus) exceed 80% of total usage',
    channels: ['email', 'slack'],
    triggerCount: 0,
    createdAt: new Date('2024-02-25'),
    createdBy: 'compliance@assetworks.com'
  }
])

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userCompany = session.user.company || 'default'
    const rules = alertRules.get(userCompany) || []

    return NextResponse.json(rules)
  } catch (error) {
    console.error('Error fetching alert rules:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const alertData = await request.json()
    const { name, type, severity, threshold, condition, timeframe, description, channels } = alertData

    if (!name || !type || !severity || threshold === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const userCompany = session.user.company || 'default'
    const rules = alertRules.get(userCompany) || []

    // Check if alert name already exists
    if (rules.find(rule => rule.name === name)) {
      return NextResponse.json(
        { error: 'Alert rule with this name already exists' },
        { status: 400 }
      )
    }

    // Create new alert rule
    const newRule = {
      id: Date.now().toString(),
      name,
      type,
      severity,
      status: 'active',
      threshold,
      condition: condition || 'exceeds',
      timeframe: timeframe || 'daily',
      description: description || '',
      channels: channels || ['email'],
      triggerCount: 0,
      createdAt: new Date(),
      createdBy: session.user.email
    }

    rules.push(newRule)
    alertRules.set(userCompany, rules)

    return NextResponse.json({
      success: true,
      message: 'Alert rule created successfully',
      rule: newRule
    })
  } catch (error) {
    console.error('Error creating alert rule:', error)
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

    const { ruleId, updates } = await request.json()

    if (!ruleId) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      )
    }

    const userCompany = session.user.company || 'default'
    const rules = alertRules.get(userCompany) || []
    
    const ruleIndex = rules.findIndex(rule => rule.id === ruleId)
    if (ruleIndex === -1) {
      return NextResponse.json(
        { error: 'Alert rule not found' },
        { status: 404 }
      )
    }

    // Update rule
    rules[ruleIndex] = { 
      ...rules[ruleIndex], 
      ...updates, 
      updatedAt: new Date(),
      updatedBy: session.user.email
    }
    alertRules.set(userCompany, rules)

    return NextResponse.json({
      success: true,
      message: 'Alert rule updated successfully',
      rule: rules[ruleIndex]
    })
  } catch (error) {
    console.error('Error updating alert rule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ruleId = searchParams.get('id')

    if (!ruleId) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      )
    }

    const userCompany = session.user.company || 'default'
    const rules = alertRules.get(userCompany) || []
    
    const ruleIndex = rules.findIndex(rule => rule.id === ruleId)
    if (ruleIndex === -1) {
      return NextResponse.json(
        { error: 'Alert rule not found' },
        { status: 404 }
      )
    }

    // Remove rule
    const removedRule = rules.splice(ruleIndex, 1)[0]
    alertRules.set(userCompany, rules)

    return NextResponse.json({
      success: true,
      message: 'Alert rule deleted successfully',
      removedRule
    })
  } catch (error) {
    console.error('Error deleting alert rule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}