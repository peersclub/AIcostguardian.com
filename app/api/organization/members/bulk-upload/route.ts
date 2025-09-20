import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// POST - Bulk upload members from CSV
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

    // Check permissions - only admins and managers can bulk upload
    if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read and parse CSV file
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file is empty or invalid' }, { status: 400 })
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().toLowerCase())
    const emailIndex = header.indexOf('email')
    
    if (emailIndex === -1) {
      return NextResponse.json({ error: 'CSV must have an email column' }, { status: 400 })
    }

    const nameIndex = header.indexOf('name')
    const roleIndex = header.indexOf('role')
    const departmentIndex = header.indexOf('department')
    const jobTitleIndex = header.indexOf('jobtitle')

    // Check organization limits
    if (user.organization.maxUsers) {
      const currentUserCount = await prisma.user.count({
        where: { organizationId: user.organizationId }
      })
      
      if (currentUserCount + (lines.length - 1) > user.organization.maxUsers) {
        return NextResponse.json(
          { error: `Organization limit of ${user.organization.maxUsers} users would be exceeded` },
          { status: 400 }
        )
      }
    }

    const processed = []
    const errors = []

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.trim())
      const email = row[emailIndex]

      if (!email || !email.includes('@')) {
        errors.push(`Row ${i + 1}: Invalid email`)
        continue
      }

      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email }
        })

        if (existingUser) {
          if (existingUser.organizationId === user.organizationId) {
            // Update existing member
            await prisma.user.update({
              where: { email },
              data: {
                name: nameIndex !== -1 ? row[nameIndex] || existingUser.name : existingUser.name,
                role: roleIndex !== -1 ? (row[roleIndex] as any) || existingUser.role : existingUser.role,
                departmentId: departmentIndex !== -1 ? row[departmentIndex] || existingUser.departmentId : existingUser.departmentId,
                jobTitle: jobTitleIndex !== -1 ? row[jobTitleIndex] || existingUser.jobTitle : existingUser.jobTitle
              }
            })
            processed.push({ email, action: 'updated' })
          } else {
            errors.push(`${email} belongs to another organization`)
          }
          continue
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
          processed.push({ email, action: 'existing_invite' })
          continue
        }

        // Create invitation
        const token = crypto.randomBytes(32).toString('hex')
        const role = roleIndex !== -1 ? (row[roleIndex] || 'USER') : 'USER'

        await prisma.invitation.create({
          data: {
            email,
            role: role as any,
            organizationId: user.organizationId!,
            invitedBy: user.email,
            token,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
          }
        })

        // Also create user record with pending status
        await prisma.user.create({
          data: {
            email,
            name: nameIndex !== -1 ? row[nameIndex] : null,
            role: role as any,
            departmentId: departmentIndex !== -1 ? row[departmentIndex] : null,
            jobTitle: jobTitleIndex !== -1 ? row[jobTitleIndex] : null,
            organizationId: user.organizationId!,
            invitedBy: user.email,
            invitedAt: new Date()
          }
        })

        processed.push({ email, action: 'invited' })

        // TODO: Send invitation email
        // await sendInvitationEmail(email, token, user.organization.name)
      } catch (error) {
        console.error(`Failed to process ${email}:`, error)
        errors.push(`Row ${i + 1}: Failed to process ${email}`)
      }
    }

    // Send Slack notification for bulk upload
    if (user.organizationId && processed.length > 0) {
      const { sendSlackNotification, formatBulkUploadMessage } = await import('@/lib/slack-integration')
      const message = formatBulkUploadMessage(
        user.name || user.email,
        processed.length,
        errors.length,
        user.organization.name
      )
      await sendSlackNotification(user.organizationId, message)
    }

    return NextResponse.json({
      processed: processed.length,
      errors: errors.length,
      details: {
        processed,
        errors
      }
    })
  } catch (error) {
    console.error('Failed to process bulk upload:', error)
    return NextResponse.json(
      { error: 'Failed to process bulk upload' },
      { status: 500 }
    )
  }
}