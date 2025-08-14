import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user?.organizationId) {
      // If no organization, return empty array
      return NextResponse.json([])
    }

    // Get all alert rules for the organization
    const rules = await prisma.alertRule.findMany({
      where: { organizationId: user.organizationId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            activeAlerts: {
              where: {
                resolved: false
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(rules)
  } catch (error) {
    console.error('Error fetching alert rules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alert rules' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, severity, threshold, condition, timeframe, description, channels } = body

    if (!name || !type || !severity || threshold === undefined || !condition || !timeframe) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user and organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If user doesn't have an organization, create one
    let organizationId = user.organizationId
    if (!organizationId) {
      const domain = session.user.email.split('@')[1] || 'default.com'
      const organization = await prisma.organization.create({
        data: {
          name: `${user.name || 'User'}'s Organization`,
          domain: domain
        }
      })
      
      // Update user with organization
      await prisma.user.update({
        where: { id: user.id },
        data: { organizationId: organization.id }
      })
      
      organizationId = organization.id
    }

    // Create the alert rule
    const rule = await prisma.alertRule.create({
      data: {
        name,
        type,
        severity,
        threshold,
        condition,
        timeframe,
        description: description || '',
        channels: channels || ['email'],
        organizationId,
        createdById: user.id
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(rule, { status: 201 })
  } catch (error) {
    console.error('Error creating alert rule:', error)
    return NextResponse.json(
      { error: 'Failed to create alert rule' },
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
    const { ruleId, updates } = body

    if (!ruleId) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 })
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Check if rule exists and belongs to organization
    const existingRule = await prisma.alertRule.findFirst({
      where: {
        id: ruleId,
        organizationId: user.organizationId
      }
    })

    if (!existingRule) {
      return NextResponse.json({ error: 'Alert rule not found' }, { status: 404 })
    }

    // Update the rule
    const rule = await prisma.alertRule.update({
      where: { id: ruleId },
      data: updates,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(rule)
  } catch (error) {
    console.error('Error updating alert rule:', error)
    return NextResponse.json(
      { error: 'Failed to update alert rule' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ruleId = searchParams.get('id')

    if (!ruleId) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 })
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Check if rule exists and belongs to organization
    const rule = await prisma.alertRule.findFirst({
      where: {
        id: ruleId,
        organizationId: user.organizationId
      }
    })

    if (!rule) {
      return NextResponse.json({ error: 'Alert rule not found' }, { status: 404 })
    }

    // Delete the rule (this will cascade delete active alerts)
    await prisma.alertRule.delete({
      where: { id: ruleId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting alert rule:', error)
    return NextResponse.json(
      { error: 'Failed to delete alert rule' },
      { status: 500 }
    )
  }
}