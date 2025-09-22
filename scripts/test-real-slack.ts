import { slackNotificationService } from '@/lib/services/slack-notifications.service'

async function testRealSlackIntegration() {
  try {
    console.log('🚀 Testing Real Slack Integration...\n')

    // Check environment variables
    const hasToken = !!process.env.SLACK_BOT_TOKEN
    const hasChannel = !!process.env.SLACK_DEFAULT_CHANNEL

    console.log('🔍 Environment Check:')
    console.log(`SLACK_BOT_TOKEN: ${hasToken ? '✅ Present' : '❌ Missing'}`)
    console.log(`SLACK_DEFAULT_CHANNEL: ${hasChannel ? '✅ Present' : '❌ Missing'}`)
    console.log(`SLACK_APP_ID: ${process.env.SLACK_APP_ID || 'Not set'}`)
    console.log(`SLACK_WORKSPACE: ${process.env.SLACK_WORKSPACE || 'Not set'}\n`)

    if (!hasToken) {
      console.log('❌ SLACK_BOT_TOKEN is required. Please add it to .env.local')
      return
    }

    // Test 1: Simple notification
    console.log('1️⃣ Testing simple cost alert notification...')
    const result1 = await slackNotificationService.sendEventNotification('COST_THRESHOLD_WARNING', {
      title: '🎉 AI Cost Guardian - Real Slack Test!',
      message: 'This is a real message sent from your AI Cost Guardian application to Slack! The integration is working perfectly.',
      context: {
        testType: 'Real Slack Integration',
        timestamp: new Date().toISOString(),
        success: true
      }
    })

    if (result1) {
      console.log('✅ Real Slack message sent successfully!')
    } else {
      console.log('❌ Failed to send real Slack message')
    }

    // Test 2: High usage alert with rich formatting
    console.log('\n2️⃣ Testing high usage alert with rich formatting...')
    const result2 = await slackNotificationService.sendEventNotification('HIGH_TOKEN_USAGE', {
      title: '📊 High Token Usage Alert - Live Test',
      message: 'Testing high token usage notification with rich Slack Block Kit formatting and interactive elements.',
      context: {
        tokenCount: 25000,
        estimatedCost: 5.75,
        provider: 'OpenAI',
        model: 'gpt-4',
        user: 'test-user@example.com'
      }
    })

    if (result2) {
      console.log('✅ Rich formatted message sent successfully!')
    }

    // Test 3: Team notification
    console.log('\n3️⃣ Testing team notification...')
    const result3 = await slackNotificationService.sendEventNotification('NEW_TEAM_MEMBER', {
      title: '👋 New Team Member Welcome',
      message: 'Testing team notification system - welcome message for new team members joining AI Cost Guardian!',
      context: {
        newMember: 'test.user@example.com',
        role: 'Admin',
        invitedBy: 'system',
        features: ['Cost Monitoring', 'Usage Analytics', 'Team Collaboration']
      }
    })

    if (result3) {
      console.log('✅ Team notification sent successfully!')
    }

    // Test 4: Weekly report
    console.log('\n4️⃣ Testing weekly report...')
    const result4 = await slackNotificationService.sendEventNotification('WEEKLY_COST_REPORT', {
      title: '📈 Weekly AI Cost Report - Live Test',
      message: 'Your weekly AI usage and cost summary is ready! This report includes usage across all providers and team members.',
      context: {
        totalCost: 234.67,
        topProvider: 'OpenAI ($156.78)',
        costIncrease: '+12.5%',
        recommendations: [
          'Consider switching to Claude for long-form content',
          'Optimize prompt lengths for better efficiency',
          'Set up usage alerts for high-consumption users'
        ]
      }
    })

    if (result4) {
      console.log('✅ Weekly report sent successfully!')
    }

    console.log('\n🎉 Real Slack Integration Test Complete!')
    console.log('\n📝 What to check in your Slack workspace:')
    console.log('1. Look for messages in your #ai-cost-guardian channel')
    console.log('2. Check #cost-alerts, #usage-alerts, #team-updates channels if they exist')
    console.log('3. Verify rich formatting with emojis and structured blocks')
    console.log('4. Test interactive buttons if they appear')

    console.log('\n🔧 Next Steps:')
    console.log('1. Create the missing Slack channels for organized notifications')
    console.log('2. Customize channel routing in slack-notifications.service.ts')
    console.log('3. Set up automatic triggers in your application workflows')
    console.log('4. Configure organization-specific notification preferences')

  } catch (error) {
    console.error('❌ Error testing real Slack integration:', error)

    if (error instanceof Error) {
      if (error.message.includes('invalid_auth')) {
        console.log('\n💡 Token issue detected. Check:')
        console.log('1. Token format (should start with xoxe.xoxp-)')
        console.log('2. App installation in workspace')
        console.log('3. Required bot permissions (chat:write, etc.)')
      } else if (error.message.includes('channel_not_found')) {
        console.log('\n💡 Channel issue detected. Check:')
        console.log('1. Channel exists in workspace')
        console.log('2. Bot is added to the channel')
        console.log('3. Channel name format (#channel-name)')
      }
    }
  }
}

// Run the real Slack test
testRealSlackIntegration()