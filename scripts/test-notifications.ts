#!/usr/bin/env tsx

/**
 * Test script for notification system functionality
 */

import { sendSlackNotification, formatInvitationMessage } from '@/lib/slack-integration'

async function testNotifications() {
  console.log('🔔 Testing Notification System Integration\n')

  try {
    // Test Slack notification formatting
    console.log('1. Testing Slack message formatting...')
    const message = formatInvitationMessage(
      'Test Admin',
      'testuser@example.com',
      'USER',
      'Test Organization'
    )

    console.log('✅ Slack message formatted successfully')
    console.log('   Message preview:', JSON.stringify(message, null, 2))

    // Test notification system configuration
    console.log('\n2. Testing notification system configuration...')

    // Check if Slack is enabled
    const slackEnabled = process.env.ENABLE_SLACK_NOTIFICATIONS === 'true'
    console.log(`   Slack notifications enabled: ${slackEnabled}`)

    // Check email configuration
    const sendGridConfigured = !!process.env.SENDGRID_API_KEY
    const sesConfigured = !!(process.env.SES_SMTP_USERNAME && process.env.SES_SMTP_PASSWORD)

    console.log(`   SendGrid configured: ${sendGridConfigured}`)
    console.log(`   AWS SES configured: ${sesConfigured}`)

    console.log('\n📊 Notification System Status:')
    console.log('================================')
    console.log(`✅ Slack formatting: Working`)
    console.log(`${slackEnabled ? '✅' : '⚠️ '} Slack notifications: ${slackEnabled ? 'Enabled' : 'Disabled (set ENABLE_SLACK_NOTIFICATIONS=true)'}`)
    console.log(`${sendGridConfigured ? '✅' : '⚠️ '} SendGrid email: ${sendGridConfigured ? 'Configured' : 'Missing API key'}`)
    console.log(`${sesConfigured ? '✅' : '⚠️ '} AWS SES email: ${sesConfigured ? 'Configured' : 'Missing credentials'}`)

    return {
      slack: { enabled: slackEnabled, working: true },
      sendgrid: { configured: sendGridConfigured },
      ses: { configured: sesConfigured }
    }

  } catch (error) {
    console.error('❌ Notification test failed:', error)
    throw error
  }
}

async function main() {
  try {
    const results = await testNotifications()

    console.log('\n🎯 Summary:')
    const allWorking = results.slack.working && (results.sendgrid.configured || results.ses.configured)

    if (allWorking) {
      console.log('🎉 Notification system is properly configured!')
    } else {
      console.log('⚠️  Notification system needs configuration for full functionality')
    }

    console.log('\n💡 Next Steps:')
    if (!results.slack.enabled) {
      console.log('   - Set ENABLE_SLACK_NOTIFICATIONS=true to enable Slack notifications')
    }
    if (!results.sendgrid.configured && !results.ses.configured) {
      console.log('   - Configure SendGrid API key or AWS SES credentials for email notifications')
    }

  } catch (error) {
    console.error('💥 Test failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}