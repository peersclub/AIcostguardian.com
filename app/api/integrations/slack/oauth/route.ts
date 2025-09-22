import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

// Handle OAuth callback from Slack
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const state = searchParams.get('state')

    if (error) {
      const errorUrl = new URL('/integrations/slack', request.url)
      errorUrl.searchParams.set('error', error)
      return NextResponse.redirect(errorUrl)
    }

    if (!code) {
      const errorUrl = new URL('/integrations/slack', request.url)
      errorUrl.searchParams.set('error', 'no_code')
      return NextResponse.redirect(errorUrl)
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true }
    })

    if (!user?.organization) {
      const errorUrl = new URL('/integrations/slack', request.url)
      errorUrl.searchParams.set('error', 'no_organization')
      return NextResponse.redirect(errorUrl)
    }

    // Exchange code for tokens
    const clientId = process.env.SLACK_CLIENT_ID
    const clientSecret = process.env.SLACK_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      const errorUrl = new URL('/integrations/slack', request.url)
      errorUrl.searchParams.set('error', 'missing_credentials')
      return NextResponse.redirect(errorUrl)
    }

    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/integrations/slack/oauth`
      })
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.ok) {
      const errorUrl = new URL('/integrations/slack', request.url)
      errorUrl.searchParams.set('error', tokenData.error || 'oauth_failed')
      return NextResponse.redirect(errorUrl)
    }

    // Store the integration configuration
    const config = {
      botToken: tokenData.access_token,
      appId: tokenData.app_id,
      workspace: tokenData.team?.name,
      teamId: tokenData.team?.id,
      scope: tokenData.scope,
      tokenType: tokenData.token_type,
      authedUser: tokenData.authed_user,
      enabled: true,
      notifications: {
        costAlerts: true,
        memberActivations: true,
        highUsage: true,
        weeklyReports: true,
        systemUpdates: true,
        customEvents: true
      }
    }

    // Save to database
    await prisma.integrationConfig.upsert({
      where: {
        organizationId_provider: {
          organizationId: user.organization.id,
          provider: 'SLACK'
        }
      },
      update: {
        config: JSON.stringify(config),
        isActive: true,
        lastSyncAt: new Date()
      },
      create: {
        organizationId: user.organization.id,
        provider: 'SLACK',
        config: JSON.stringify(config),
        isActive: true,
        lastSyncAt: new Date()
      }
    })

    // Redirect to success page
    const successUrl = new URL('/integrations/slack', request.url)
    successUrl.searchParams.set('success', 'oauth_complete')
    return NextResponse.redirect(successUrl)

  } catch (error) {
    console.error('OAuth callback error:', error)
    const errorUrl = new URL('/integrations/slack', request.url)
    errorUrl.searchParams.set('error', 'internal_error')
    return NextResponse.redirect(errorUrl)
  }
}

// Initiate OAuth flow
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clientId = process.env.SLACK_CLIENT_ID
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/slack/oauth`

    if (!clientId) {
      return NextResponse.json({ error: 'Slack client ID not configured' }, { status: 500 })
    }

    // Generate state parameter for security
    const state = Buffer.from(JSON.stringify({
      userId: session.user.id,
      timestamp: Date.now()
    })).toString('base64')

    const scopes = [
      'chat:write',
      'chat:write.public',
      'channels:read'
    ].join(',')

    const authUrl = new URL('https://slack.com/oauth/v2/authorize')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('scope', scopes)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('state', state)

    return NextResponse.json({ authUrl: authUrl.toString() })

  } catch (error) {
    console.error('OAuth initiation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}