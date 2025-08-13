import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// POST - Send invitations
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user and their organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Check permissions - only admins and managers can invite
    if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await req.json()
    const { emails, role } = body

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'Invalid email list' }, { status: 400 })
    }

    // Check organization limits
    if (user.organization.maxUsers) {
      const currentUserCount = await prisma.user.count({
        where: { organizationId: user.organizationId }
      })
      
      if (currentUserCount + emails.length > user.organization.maxUsers) {
        return NextResponse.json(
          { error: `Organization limit of ${user.organization.maxUsers} users would be exceeded` },
          { status: 400 }
        )
      }
    }

    const invitations = []
    const errors = []

    for (const email of emails) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email }
        })

        if (existingUser) {
          if (existingUser.organizationId === user.organizationId) {
            errors.push(`${email} is already a member`)
            continue
          } else {
            errors.push(`${email} belongs to another organization`)
            continue
          }
        }

        // Check if invitation already exists
        const existingInvite = await prisma.invitation.findFirst({
          where: {
            email,
            organizationId: user.organizationId!,
            acceptedAt: null
          }
        })

        if (existingInvite) {
          errors.push(`${email} already has a pending invitation`)
          continue
        }

        // Create invitation
        const token = crypto.randomBytes(32).toString('hex')
        const invitation = await prisma.invitation.create({
          data: {
            email,
            role: role || 'USER',
            organizationId: user.organizationId!,
            invitedBy: user.email,
            token,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
          }
        })

        invitations.push(invitation)

        // Send Slack notification
        if (user.organizationId) {
          const { sendSlackNotification, formatInvitationMessage } = await import('@/lib/slack-integration')
          const message = formatInvitationMessage(
            user.name || user.email,
            email,
            role || 'USER',
            user.organization.name
          )
          await sendSlackNotification(user.organizationId, message)
        }

        // TODO: Send invitation email
        // await sendInvitationEmail(email, token, user.organization.name)
      } catch (error) {
        console.error(`Failed to invite ${email}:`, error)
        errors.push(`Failed to invite ${email}`)
      }
    }

    return NextResponse.json({
      invitations,
      errors,
      success: invitations.length,
      failed: errors.length
    })
  } catch (error) {
    console.error('Failed to send invitations:', error)
    return NextResponse.json(
      { error: 'Failed to send invitations' },
      { status: 500 }
    )
  }
}