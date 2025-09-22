import { PrismaClient } from '@prisma/client'
import { slackNotificationService } from '@/lib/services/slack-notifications.service'
import EventNotifier from '@/lib/services/event-notifier'

const prisma = new PrismaClient()

async function testSlackNotifications() {
  try {
    console.log('🧪 Testing Slack Notification System...\n')

    // Get a test user and organization
    const testUser = await prisma.user.findFirst({
      include: { organization: true }
    })

    if (!testUser) {
      console.log('❌ No test user found. Creating one...')
      return
    }

    console.log(`Using test user: ${testUser.email} from ${testUser.organization?.name || 'No org'}`)

    // Test 1: Basic notification
    console.log('\n1️⃣ Testing basic notification...')
    await slackNotificationService.sendEventNotification('COST_THRESHOLD_WARNING', {
      userId: testUser.id,
      organizationId: testUser.organizationId || 'test-org',
      title: 'Test Cost Alert',
      message: 'This is a test cost threshold warning notification.',
      context: {
        currentCost: 150.75,
        threshold: 200.00,
        provider: 'OpenAI',
        timeframe: 'daily'
      }
    })
    console.log('✅ Basic notification sent')

    // Test 2: High token usage alert
    console.log('\n2️⃣ Testing high token usage alert...')
    await EventNotifier.notifyHighTokenUsage(
      testUser.id,
      testUser.organizationId || 'test-org',
      15000,
      2.50,
      'Claude',
      'claude-3-sonnet',
      'test-conversation-123'
    )
    console.log('✅ High token usage alert sent')

    // Test 3: New member notification
    console.log('\n3️⃣ Testing new member notification...')
    await EventNotifier.notifyNewMember(
      testUser.id,
      testUser.organizationId || 'test-org',
      'newuser@example.com',
      'USER',
      testUser.email
    )
    console.log('✅ New member notification sent')

    // Test 4: API rate limit notification
    console.log('\n4️⃣ Testing rate limit notification...')
    await EventNotifier.notifyRateLimitExceeded(
      testUser.id,
      testUser.organizationId || 'test-org',
      'OpenAI',
      '/v1/chat/completions',
      new Date(Date.now() + 60000) // 1 minute from now
    )
    console.log('✅ Rate limit notification sent')

    // Test 5: Cost threshold exceeded
    console.log('\n5️⃣ Testing cost threshold exceeded...')
    await EventNotifier.notifyCostThresholdExceeded(
      testUser.organizationId || 'test-org',
      225.50,
      200.00,
      'OpenAI',
      'daily'
    )
    console.log('✅ Cost threshold exceeded notification sent')

    // Test 6: Unusual spending pattern
    console.log('\n6️⃣ Testing unusual spending pattern...')
    await EventNotifier.notifyUnusualSpending(
      testUser.organizationId || 'test-org',
      {
        provider: 'Claude',
        expectedCost: 50.00,
        actualCost: 125.75,
        timeframe: 'last 6 hours',
        confidence: 0.92
      }
    )
    console.log('✅ Unusual spending pattern notification sent')

    // Test 7: Thread collaboration
    console.log('\n7️⃣ Testing thread collaboration notification...')
    await EventNotifier.notifyThreadShared(
      'test-thread-123',
      testUser.id,
      'collaborator-id',
      testUser.organizationId || 'test-org',
      testUser.email,
      'collaborator@example.com'
    )
    console.log('✅ Thread collaboration notification sent')

    // Test 8: Payment failure
    console.log('\n8️⃣ Testing payment failure notification...')
    await EventNotifier.notifyPaymentFailed(
      testUser.organizationId || 'test-org',
      99.99,
      'Card declined',
      new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    )
    console.log('✅ Payment failure notification sent')

    // Test 9: Integration failure
    console.log('\n9️⃣ Testing integration failure notification...')
    await EventNotifier.notifyIntegrationFailure(
      testUser.organizationId || 'test-org',
      'OpenAI API',
      'Connection timeout after 30 seconds',
      ['AI Chat', 'Cost Tracking', 'Usage Analytics']
    )
    console.log('✅ Integration failure notification sent')

    // Test 10: Weekly cost report
    console.log('\n🔟 Testing weekly cost report...')
    await EventNotifier.sendWeeklyCostSummary(
      testUser.organizationId || 'test-org',
      {
        totalCost: 487.32,
        costByProvider: [
          { provider: 'OpenAI', cost: 287.15 },
          { provider: 'Claude', cost: 145.67 },
          { provider: 'Gemini', cost: 54.50 }
        ],
        topUsers: [
          { email: testUser.email, cost: 156.78 },
          { email: 'user2@example.com', cost: 89.45 },
          { email: 'user3@example.com', cost: 67.23 }
        ],
        insights: [
          'OpenAI usage increased 15% this week',
          'Peak usage occurs between 2-4 PM',
          'Code generation tasks show highest token consumption'
        ]
      }
    )
    console.log('✅ Weekly cost report sent')

    // Test 11: Check notification configuration
    console.log('\n🔧 Testing notification configuration...')
    const eventConfigs = slackNotificationService.getEventConfigs()
    const enabledEvents = Object.values(eventConfigs).filter(config => config.enabled).length
    const totalEvents = Object.keys(eventConfigs).length

    console.log(`📊 Configuration Summary:`)
    console.log(`   Total events: ${totalEvents}`)
    console.log(`   Enabled events: ${enabledEvents}`)
    console.log(`   Disabled events: ${totalEvents - enabledEvents}`)

    // Show sample of event configurations
    console.log('\n📋 Sample Event Configurations:')
    Object.entries(eventConfigs).slice(0, 5).forEach(([eventType, config]) => {
      console.log(`   ${eventType}: ${config.enabled ? '✅' : '❌'} (${config.priority}) -> ${config.channel || 'default'}`)
    })

    console.log('\n🎉 All Slack notification tests completed successfully!')
    console.log('\n📝 Next Steps:')
    console.log('1. Set up actual Slack workspace and bot token')
    console.log('2. Configure SLACK_BOT_TOKEN environment variable')
    console.log('3. Create appropriate Slack channels (#cost-alerts, #team-updates, etc.)')
    console.log('4. Test with real Slack workspace')
    console.log('5. Configure notification preferences per organization')

  } catch (error) {
    console.error('❌ Error testing Slack notifications:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the tests
testSlackNotifications()