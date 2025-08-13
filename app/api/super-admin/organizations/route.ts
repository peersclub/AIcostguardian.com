import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET - Fetch all organizations
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is super admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        isSuperAdmin: true,
        name: true,
        email: true
      }
    })

    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all organizations
    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
            apiKeys: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ organizations })
  } catch (error) {
    console.error('Failed to fetch organizations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    )
  }
}

// POST - Create new organization
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is super admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        isSuperAdmin: true,
        name: true,
        email: true
      }
    })

    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, domain, contactEmail, industry, size, subscription } = body

    // Check if domain already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { domain }
    })

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Organization with this domain already exists' },
        { status: 400 }
      )
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name,
        domain,
        contactEmail,
        industry,
        size,
        subscription: subscription || 'FREE',
        allowedProviders: ['openai', 'anthropic', 'google', 'grok'], // Default providers
        maxUsers: subscription === 'ENTERPRISE' ? null : subscription === 'GROWTH' ? 50 : 10,
        maxApiKeys: 10
      }
    })

    // Send Slack notification for new organization
    const { sendSlackNotification, formatOrgCreatedMessage } = await import('@/lib/slack-integration')
    
    // Try to send to the new organization's Slack if configured
    const message = formatOrgCreatedMessage(
      name,
      domain,
      subscription || 'FREE',
      user.name || user.email
    )
    
    // Send to AiCostGuardian's Slack (super admin notifications)
    const adminOrg = await prisma.organization.findFirst({
      where: { domain: 'aicostguardian.com' }
    })
    
    if (adminOrg) {
      await sendSlackNotification(adminOrg.id, message)
    }

    return NextResponse.json({ organization })
  } catch (error) {
    console.error('Failed to create organization:', error)
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    )
  }
}