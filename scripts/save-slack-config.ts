/**
 * Save Slack Configuration to Database
 * This script saves your Slack integration settings for victor@aicostguardian.com
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function saveSlackConfig() {
  console.log('🔧 Saving Slack Configuration to Database...\n')

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: 'victor@aicostguardian.com' },
      include: { organization: true }
    })

    if (!user) {
      console.error('❌ User victor@aicostguardian.com not found')
      return
    }

    if (!user.organization) {
      console.error('❌ User does not have an organization')
      return
    }

    console.log(`✅ Found user: ${user.email}`)
    console.log(`✅ Organization: ${user.organization.name}`)

    // Slack configuration based on your previous setup
    const slackConfig = {
      // Bot configuration
      botToken: process.env.SLACK_BOT_TOKEN || '',
      appId: 'A09GJMNMHFT',
      workspace: 'AI Cost Guardian Team',
      teamId: 'T099CPC5SPR',
      scope: 'chat:write,chat:write.public,channels:read',
      tokenType: 'bot',

      // Webhook configuration
      webhookUrl: process.env.SLACK_WEBHOOK_URL || 'https://hooks.slack.com/services/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',

      // OAuth details
      clientId: process.env.SLACK_CLIENT_ID || '',
      clientSecret: process.env.SLACK_CLIENT_SECRET || '',
      signingSecret: process.env.SLACK_SIGNING_SECRET || '',

      // Channel configuration
      defaultChannel: '#ai-cost-guardian',

      // Integration settings
      enabled: true,

      // Notification preferences
      notifications: {
        costAlerts: true,
        memberActivations: true,
        highUsage: true,
        weeklyReports: true,
        systemUpdates: true,
        customEvents: true
      },

      // Channel routing
      channels: {
        costAlerts: '#cost-alerts',
        systemAlerts: '#system-alerts',
        usageAlerts: '#usage-alerts',
        billingAlerts: '#billing-alerts',
        teamUpdates: '#team-updates',
        securityAlerts: '#security-alerts',
        aiActivity: '#ai-activity',
        collaboration: '#collaboration',
        reports: '#reports',
        optimization: '#optimization'
      },

      // Setup metadata
      setupDate: new Date().toISOString(),
      setupMethod: 'manual_configuration',
      integrationType: 'dual', // Both webhook and bot

      // Authentication info
      authedUser: {
        id: 'U099D5P5SPR', // Your Slack user ID
        scope: 'identify,commands,chat:write',
        access_token: process.env.SLACK_USER_TOKEN || ''
      }
    }

    // Save to database
    const result = await prisma.integrationConfig.upsert({
      where: {
        organizationId_provider: {
          organizationId: user.organization.id,
          provider: 'SLACK'
        }
      },
      update: {
        config: JSON.stringify(slackConfig),
        isActive: true,
        lastSyncAt: new Date()
      },
      create: {
        organizationId: user.organization.id,
        provider: 'SLACK',
        config: JSON.stringify(slackConfig),
        isActive: true,
        lastSyncAt: new Date()
      }
    })

    console.log('\n🎉 Slack Configuration Saved Successfully!')
    console.log(`📝 Integration ID: ${result.id}`)
    console.log(`🏢 Organization: ${user.organization.name}`)
    console.log(`👤 User: ${user.email}`)
    console.log(`🔗 Webhook URL: ${slackConfig.webhookUrl ? 'Configured' : 'Not configured'}`)
    console.log(`🤖 Bot Token: ${slackConfig.botToken ? 'Configured' : 'Not configured'}`)
    console.log(`📢 Default Channel: ${slackConfig.defaultChannel}`)
    console.log(`✅ Status: Active`)

    console.log('\n📋 Enabled Notifications:')
    Object.entries(slackConfig.notifications).forEach(([key, enabled]) => {
      console.log(`  ${enabled ? '✅' : '❌'} ${key}`)
    })

    console.log('\n📍 Channel Routing:')
    Object.entries(slackConfig.channels).forEach(([type, channel]) => {
      console.log(`  ${type}: ${channel}`)
    })

  } catch (error) {
    console.error('❌ Error saving Slack configuration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
saveSlackConfig()
  .then(() => {
    console.log('\n🚀 Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })