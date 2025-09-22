/**
 * Test Saved Slack Configuration
 * Verify that the saved configuration works by sending test notifications
 */

import { PrismaClient } from '@prisma/client'
import { SlackWebhookService } from '../lib/services/slack-webhook-service'

const prisma = new PrismaClient()

async function testSavedConfig() {
  console.log('🧪 Testing Saved Slack Configuration...\n')

  try {
    // Find the user and their Slack config
    const user = await prisma.user.findUnique({
      where: { email: 'victor@aicostguardian.com' },
      include: { organization: true }
    })

    if (!user?.organization) {
      console.error('❌ User or organization not found')
      return
    }

    // Get the Slack integration config
    const slackIntegration = await prisma.integrationConfig.findFirst({
      where: {
        organizationId: user.organization.id,
        provider: 'SLACK'
      }
    })

    if (!slackIntegration) {
      console.error('❌ Slack integration not found')
      return
    }

    const config = JSON.parse(slackIntegration.config as string)
    console.log(`✅ Found Slack integration for ${user.organization.name}`)
    console.log(`🔗 Webhook URL: ${config.webhookUrl ? 'Configured' : 'Not configured'}`)
    console.log(`📢 Default Channel: ${config.defaultChannel}`)
    console.log(`🟢 Status: ${slackIntegration.isActive ? 'Active' : 'Inactive'}\n`)

    if (config.webhookUrl) {
      console.log('📨 Sending test notification via webhook...')

      const webhookService = new SlackWebhookService(config.webhookUrl)

      const success = await webhookService.sendEventNotification('DATABASE_CONFIG_TEST', {
        userId: user.id,
        organizationId: user.organization.id,
        title: '🎉 Database Configuration Test Success',
        message: `*Excellent!* Your Slack configuration has been successfully saved to the database and is working perfectly.\\n\\n✅ **Configuration Details:**\\n• Organization: ${user.organization.name}\\n• User: ${user.email}\\n• Integration ID: ${slackIntegration.id}\\n• Webhook Status: Active\\n• Default Channel: ${config.defaultChannel}\\n\\n🚀 Your AI Cost Guardian platform is now ready to send real-time notifications to your Slack workspace!`,
        context: {
          testType: 'database_config_verification',
          configId: slackIntegration.id,
          organizationName: user.organization.name,
          userEmail: user.email,
          timestamp: new Date().toISOString(),
          notificationChannels: Object.keys(config.notifications).filter(key => config.notifications[key]),
          channelRouting: config.channels
        }
      })

      if (success) {
        console.log('✅ Test notification sent successfully!')
        console.log('📱 Check your Slack workspace for the test message')

        // Update last sync time
        await prisma.integrationConfig.update({
          where: { id: slackIntegration.id },
          data: { lastSyncAt: new Date() }
        })

      } else {
        console.log('❌ Test notification failed')
      }
    } else {
      console.log('⚠️  No webhook URL configured - skipping test notification')
    }

    console.log('\n📊 Configuration Summary:')
    console.log(`🏢 Organization: ${user.organization.name}`)
    console.log(`👤 User: ${user.email}`)
    console.log(`🆔 Integration ID: ${slackIntegration.id}`)
    console.log(`🔗 Webhook: ${config.webhookUrl ? 'Configured' : 'Not configured'}`)
    console.log(`🤖 Bot Token: ${config.botToken ? 'Configured' : 'Not configured'}`)
    console.log(`📢 Default Channel: ${config.defaultChannel}`)
    console.log(`🟢 Status: ${slackIntegration.isActive ? 'Active' : 'Inactive'}`)
    console.log(`🕐 Last Updated: ${slackIntegration.lastSyncAt?.toISOString()}`)

  } catch (error) {
    console.error('❌ Error testing configuration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testSavedConfig()
  .then(() => {
    console.log('\n🎯 Test completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test failed:', error)
    process.exit(1)
  })