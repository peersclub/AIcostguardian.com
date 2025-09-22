/**
 * Verify Slack Configuration in Database
 * Show the exact configuration that was saved
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifySlackDB() {
  console.log('🔍 Verifying Slack Configuration in Database...\n')

  try {
    // Find all Slack integrations
    const slackIntegrations = await prisma.integrationConfig.findMany({
      where: { provider: 'SLACK' },
      include: {
        organization: {
          include: {
            users: {
              where: { email: 'victor@aicostguardian.com' }
            }
          }
        }
      }
    })

    if (slackIntegrations.length === 0) {
      console.log('❌ No Slack integrations found in database')
      return
    }

    slackIntegrations.forEach((integration, index) => {
      console.log(`📋 Slack Integration #${index + 1}`)
      console.log(`🆔 ID: ${integration.id}`)
      console.log(`🏢 Organization: ${integration.organization.name}`)
      console.log(`🟢 Active: ${integration.isActive}`)
      console.log(`🕐 Created: ${integration.createdAt.toISOString()}`)
      console.log(`🕐 Last Sync: ${integration.lastSyncAt?.toISOString()}`)

      try {
        const config = JSON.parse(integration.config as string)
        console.log('\n⚙️ Configuration Details:')
        console.log(`🔗 Webhook URL: ${config.webhookUrl ? 'Configured ✅' : 'Not configured ❌'}`)
        console.log(`🤖 Bot Token: ${config.botToken ? 'Configured ✅' : 'Not configured ❌'}`)
        console.log(`📢 Default Channel: ${config.defaultChannel}`)
        console.log(`🏢 Workspace: ${config.workspace}`)
        console.log(`🆔 Team ID: ${config.teamId}`)
        console.log(`🔑 App ID: ${config.appId}`)
        console.log(`📦 Integration Type: ${config.integrationType}`)

        console.log('\n📨 Notification Settings:')
        Object.entries(config.notifications || {}).forEach(([key, enabled]) => {
          console.log(`  ${enabled ? '✅' : '❌'} ${key}`)
        })

        console.log('\n📍 Channel Routing:')
        Object.entries(config.channels || {}).forEach(([type, channel]) => {
          console.log(`  ${type}: ${channel}`)
        })

        if (integration.organization.users.length > 0) {
          console.log(`\n👤 Associated User: ${integration.organization.users[0].email}`)
        }

      } catch (parseError) {
        console.error('❌ Error parsing configuration JSON:', parseError)
      }

      console.log('\n' + '='.repeat(60) + '\n')
    })

    console.log(`✅ Found ${slackIntegrations.length} Slack integration(s) in database`)

  } catch (error) {
    console.error('❌ Error verifying database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifySlackDB()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Verification failed:', error)
    process.exit(1)
  })