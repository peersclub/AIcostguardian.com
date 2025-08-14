import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { sesEmailService } from '@/lib/email/ses-email.service'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as any
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type = 'test', recipientEmail } = body

    // Use the user's email if no recipient specified
    const toEmail = recipientEmail || session.user.email

    if (!toEmail) {
      return NextResponse.json(
        { error: 'No email address available' },
        { status: 400 }
      )
    }

    let result = false
    let emailType = ''

    switch (type) {
      case 'welcome':
        emailType = 'Welcome Email'
        result = await sesEmailService.sendTemplatedEmail(
          toEmail,
          'welcome',
          {
            name: session.user.name || 'User',
            dashboardUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
          }
        )
        break

      case 'usage-alert':
        emailType = 'Usage Alert'
        result = await sesEmailService.sendTemplatedEmail(
          toEmail,
          'usageAlert',
          {
            alertType: 'Cost Threshold Warning',
            provider: 'OpenAI',
            usage: '$85.50',
            threshold: '$100.00',
            period: 'This Month',
            dashboardUrl: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/usage` : 'http://localhost:3000/usage'
          }
        )
        break

      case 'monthly-report':
        emailType = 'Monthly Report'
        result = await sesEmailService.sendTemplatedEmail(
          toEmail,
          'monthlyReport',
          {
            month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            totalCost: '$1,234.56',
            totalRequests: '45,678',
            activeUsers: '12',
            providers: [
              { name: 'OpenAI', cost: '$567.89', requests: '23,456' },
              { name: 'Claude', cost: '$456.78', requests: '15,432' },
              { name: 'Gemini', cost: '$209.89', requests: '6,790' }
            ],
            reportUrl: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/analytics` : 'http://localhost:3000/analytics'
          }
        )
        break

      case 'team-invite':
        emailType = 'Team Invitation'
        result = await sesEmailService.sendTemplatedEmail(
          toEmail,
          'teamInvite',
          {
            inviterName: session.user.name || 'Admin',
            organizationName: 'AI Cost Guardian Demo',
            role: 'Member',
            inviteLink: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/invite/accept` : 'http://localhost:3000/invite/accept'
          }
        )
        break

      case 'test':
      default:
        emailType = 'Test Email'
        result = await sesEmailService.sendEmail({
          to: toEmail,
          subject: 'Test Email from AI Cost Guardian',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #3b82f6;">Test Email Successful! 🎉</h1>
              <p>Hello ${session.user.name || 'User'},</p>
              <p>This test email confirms that Amazon SES is properly configured for AI Cost Guardian.</p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1f2937;">Configuration Details:</h3>
                <ul style="color: #4b5563;">
                  <li>Provider: Amazon SES</li>
                  <li>SMTP Host: ${process.env.SES_SMTP_HOST || 'Not configured'}</li>
                  <li>From: ${process.env.SES_FROM_EMAIL || 'Not configured'}</li>
                  <li>Region: ${process.env.SES_REGION || 'us-east-1'}</li>
                </ul>
              </div>
              <p>You can now receive notifications for:</p>
              <ul>
                <li>✅ Usage alerts and threshold warnings</li>
                <li>✅ Monthly usage reports</li>
                <li>✅ Team invitations</li>
                <li>✅ Password reset requests</li>
                <li>✅ System notifications</li>
              </ul>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Sent from AI Cost Guardian at ${new Date().toLocaleString()}
              </p>
            </div>
          `,
          text: `Test Email Successful!\n\nThis confirms that Amazon SES is properly configured for AI Cost Guardian.\n\nSent at ${new Date().toLocaleString()}`
        })
        break
    }

    if (result) {
      return NextResponse.json({
        success: true,
        message: `${emailType} sent successfully to ${toEmail}`,
        details: {
          type: emailType,
          recipient: toEmail,
          timestamp: new Date().toISOString()
        }
      })
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to send email',
          details: 'Check server logs for more information'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as any
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify SES connection
    const isConnected = await sesEmailService.verifyConnection()

    return NextResponse.json({
      connected: isConnected,
      configured: !!(process.env.SES_SMTP_USERNAME && process.env.SES_SMTP_PASSWORD),
      settings: {
        host: process.env.SES_SMTP_HOST || 'Not configured',
        port: process.env.SES_SMTP_PORT || '587',
        fromEmail: process.env.SES_FROM_EMAIL || 'Not configured',
        fromName: process.env.SES_FROM_NAME || 'Not configured',
        region: process.env.SES_REGION || 'us-east-1'
      }
    })
  } catch (error) {
    console.error('SES verification error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to verify SES configuration',
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}