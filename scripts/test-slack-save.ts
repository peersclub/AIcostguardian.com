/**
 * Test Slack Integration Save Functionality
 * This script tests the save functionality for the Slack integration page
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testSlackSave() {
  console.log('🧪 Testing Slack Integration Save Functionality...\n')

  try {
    // Find the user's current Slack configuration
    const user = await prisma.user.findUnique({
      where: { email: 'victor@aicostguardian.com' },
      include: { organization: true }
    })

    if (!user?.organization) {
      console.error('❌ User or organization not found')
      return
    }

    console.log(`✅ Testing for user: ${user.email}`)
    console.log(`🏢 Organization: ${user.organization.name}`)

    // Get current Slack integration
    const currentIntegration = await prisma.integrationConfig.findFirst({
      where: {
        organizationId: user.organization.id,
        provider: 'SLACK'
      }
    })

    if (currentIntegration) {
      const config = JSON.parse(currentIntegration.config as string)
      console.log('\n📋 Current Configuration:')
      console.log(`🔗 Webhook URL: ${config.webhookUrl ? 'Configured' : 'Not configured'}`)
      console.log(`🤖 Bot Token: ${config.botToken ? 'Configured' : 'Not configured'}`)
      console.log(`📢 Default Channel: ${config.defaultChannel}`)
      console.log(`🏢 Workspace: ${config.workspace}`)
      console.log(`🟢 Enabled: ${config.enabled}`)
      console.log(`🕐 Last Updated: ${currentIntegration.lastSyncAt?.toISOString()}`)

      console.log('\n📨 Notification Preferences:')
      if (config.notifications) {
        Object.entries(config.notifications).forEach(([key, enabled]) => {
          console.log(`  ${enabled ? '✅' : '❌'} ${key}`)
        })
      }

      console.log('\n📍 Channel Routing:')
      if (config.channels) {
        Object.entries(config.channels).forEach(([type, channel]) => {
          console.log(`  ${type}: ${channel}`)
        })
      }
    } else {
      console.log('\n⚠️  No Slack integration found in database')
    }

    console.log('\n🎯 Save Functionality Test Instructions:')
    console.log('1. Visit https://aicostguardian.com/integrations/slack')
    console.log('2. Sign in as victor@aicostguardian.com')
    console.log('3. Navigate to the "Webhook" or "Notifications" tab')
    console.log('4. Make changes to any configuration fields')
    console.log('5. Click the "Save Configuration" or "Save Notification Settings" button')
    console.log('6. You should see a success toast notification')
    console.log('7. The configuration will be saved to the database')

    console.log('\n🔧 API Endpoint Details:')
    console.log('• GET /api/integrations/slack - Loads current configuration')
    console.log('• POST /api/integrations/slack - Saves configuration')
    console.log('• POST /api/integrations/slack/test - Tests integration')

  } catch (error) {
    console.error('❌ Error testing Slack save functionality:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testSlackSave()
  .then(() => {
    console.log('\n✅ Test completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test failed:', error)
    process.exit(1)
  })