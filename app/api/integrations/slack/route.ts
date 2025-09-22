import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

interface SlackConfig {
  botToken?: string
  webhookUrl?: string
  appId?: string
  clientId?: string
  clientSecret?: string
  signingSecret?: string
  appToken?: string
  defaultChannel?: string
  workspace?: string
  enabled: boolean
}

interface NotificationSettings {
  costAlerts: boolean
  memberActivations: boolean
  highUsage: boolean
  weeklyReports: boolean
  systemUpdates: boolean
  customEvents: boolean
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get existing Slack configuration
    const slackConfig = await prisma.integrationConfig.findFirst({
      where: {
        organizationId: user.organization.id,
        provider: 'SLACK'
      }
    })

    let config: SlackConfig = { enabled: false }
    let notifications: NotificationSettings = {
      costAlerts: true,
      memberActivations: true,
      highUsage: true,
      weeklyReports: true,
      systemUpdates: true,
      customEvents: true
    }

    if (slackConfig?.config) {
      try {
        const parsed = JSON.parse(slackConfig.config as string)
        config = { enabled: false, ...parsed }
        notifications = { ...notifications, ...parsed.notifications }
      } catch (error) {
        console.error('Failed to parse Slack config:', error)
      }
    }

    return NextResponse.json({ config, notifications })
  } catch (error) {
    console.error('Error loading Slack config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { config, notifications } = await request.json()

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Combine config and notifications
    const combinedConfig = {
      ...config,
      notifications
    }

    // Upsert Slack configuration
    await prisma.integrationConfig.upsert({
      where: {
        organizationId_provider: {
          organizationId: user.organization.id,
          provider: 'SLACK'
        }
      },
      update: {
        config: JSON.stringify(combinedConfig),
        isActive: config.enabled,
        lastSyncAt: new Date()
      },
      create: {
        organizationId: user.organization.id,
        provider: 'SLACK',
        config: JSON.stringify(combinedConfig),
        isActive: config.enabled,
        lastSyncAt: new Date()
      }
    })

    // Also update environment variables if possible (for webhook service)
    if (config.webhookUrl) {
      // Note: In production, you'd want to store this securely
      process.env.SLACK_WEBHOOK_URL = config.webhookUrl
    }
    if (config.botToken) {
      process.env.SLACK_BOT_TOKEN = config.botToken
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving Slack config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}