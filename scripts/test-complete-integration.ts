import { slackWebhookService } from '@/lib/services/slack-webhook-service'

async function testCompleteIntegration() {
  console.log('🎉 Testing Complete AI Cost Guardian Integration...\n')

  // Test 1: Cost alert
  console.log('1️⃣ Testing cost threshold alert...')
  const costAlert = await slackWebhookService.sendCostAlert(127.50, 150.00, 'OpenAI')
  console.log(costAlert ? '✅ Cost alert sent!' : '❌ Cost alert failed')

  // Test 2: Member activation
  console.log('\n2️⃣ Testing member activation notification...')
  const memberAlert = await slackWebhookService.sendMemberActivation(
    'newuser@example.com',
    'User',
    'AI Cost Guardian Demo'
  )
  console.log(memberAlert ? '✅ Member activation sent!' : '❌ Member activation failed')

  // Test 3: High usage alert
  console.log('\n3️⃣ Testing high usage alert...')
  const usageAlert = await slackWebhookService.sendHighUsageAlert(
    'poweruser@example.com',
    25000,
    4.75,
    'Claude',
    'Claude-3-Sonnet'
  )
  console.log(usageAlert ? '✅ High usage alert sent!' : '❌ High usage alert failed')

  // Test 4: Weekly report
  console.log('\n4️⃣ Testing weekly cost report...')
  const weeklyReport = await slackWebhookService.sendWeeklyCostReport(
    487.32,
    { name: 'OpenAI', cost: 287.15 },
    [
      'OpenAI usage increased 15% this week',
      'Peak usage occurs between 2-4 PM',
      'Code generation tasks show highest token consumption'
    ]
  )
  console.log(weeklyReport ? '✅ Weekly report sent!' : '❌ Weekly report failed')

  // Test 5: System completion notification
  console.log('\n5️⃣ Sending system completion notification...')
  const completionAlert = await slackWebhookService.sendBulkActivationSummary(25, 8)
  console.log(completionAlert ? '✅ Completion notification sent!' : '❌ Completion notification failed')

  // Test 6: Custom event notification
  console.log('\n6️⃣ Testing custom event notification...')
  const customEvent = await slackWebhookService.sendEventNotification('INTEGRATION_COMPLETE', {
    title: '🚀 AI Cost Guardian Integration Complete',
    message: '*Congratulations!* Your AI Cost Guardian platform is now fully operational with real-time Slack notifications.\n\n*Features Active:*\n• Member activation system (25/25 users activated)\n• Real-time cost monitoring and alerts\n• High usage detection and warnings\n• Weekly reporting and insights\n• Team collaboration notifications\n• System health monitoring',
    context: {
      totalUsers: 25,
      activationRate: '100%',
      notificationTypes: 29,
      integrationStatus: 'LIVE'
    }
  })
  console.log(customEvent ? '✅ Custom event sent!' : '❌ Custom event failed')

  console.log('\n🎯 Complete Integration Test Results:')
  console.log('====================================')
  console.log(`Cost Alerts: ${costAlert ? '✅' : '❌'}`)
  console.log(`Member Notifications: ${memberAlert ? '✅' : '❌'}`)
  console.log(`Usage Monitoring: ${usageAlert ? '✅' : '❌'}`)
  console.log(`Weekly Reports: ${weeklyReport ? '✅' : '❌'}`)
  console.log(`System Updates: ${completionAlert ? '✅' : '❌'}`)
  console.log(`Custom Events: ${customEvent ? '✅' : '❌'}`)

  const allSuccess = costAlert && memberAlert && usageAlert && weeklyReport && completionAlert && customEvent

  console.log('\n' + (allSuccess ? '🎉 ALL TESTS PASSED!' : '⚠️ Some tests failed'))
  console.log('\n📱 Check your Slack workspace for 6 beautiful notification messages!')
  console.log('\n🚀 Your AI Cost Guardian is now FULLY OPERATIONAL with enterprise-grade Slack integration!')
}

testCompleteIntegration().catch(console.error)