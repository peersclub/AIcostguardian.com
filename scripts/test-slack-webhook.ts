/**
 * Test Slack Webhook Integration (Immediate Solution)
 * This will work right now with your webhook URL!
 */

async function testSlackWebhook() {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL || 'https://hooks.slack.com/services/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'

  console.log('🚀 Testing Slack Webhook Integration...')
  console.log(`Using webhook: ${webhookUrl.substring(0, 40)}...\n`)

  // Test 1: Simple notification
  console.log('1️⃣ Testing simple cost alert...')
  const message1 = {
    text: "🎉 AI Cost Guardian - Real Slack Integration Success!",
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🎉 AI Cost Guardian - Live Test!"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Congratulations!* Your AI Cost Guardian is now successfully connected to Slack and sending real notifications."
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Status:*\n✅ Working"
          },
          {
            type: "mrkdwn",
            text: "*Test Type:*\nWebhook Integration"
          }
        ]
      }
    ]
  }

  try {
    const response1 = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message1)
    })

    if (response1.ok) {
      console.log('✅ Simple notification sent successfully!')
    } else {
      console.log('❌ Failed to send simple notification')
    }
  } catch (error) {
    console.error('Error sending simple notification:', error)
  }

  // Test 2: Cost alert notification
  console.log('\n2️⃣ Testing cost threshold alert...')
  const message2 = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "💰 Cost Threshold Warning"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Daily AI spending is approaching your limit*\n\nYour organization has used 85% of the daily budget for OpenAI services."
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Current Cost:*\n$127.50"
          },
          {
            type: "mrkdwn",
            text: "*Daily Limit:*\n$150.00"
          },
          {
            type: "mrkdwn",
            text: "*Remaining:*\n$22.50"
          },
          {
            type: "mrkdwn",
            text: "*Usage:*\n85%"
          }
        ]
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "🕐 Alert sent at " + new Date().toLocaleTimeString() + " | 🤖 AI Cost Guardian"
          }
        ]
      }
    ]
  }

  try {
    const response2 = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message2)
    })

    if (response2.ok) {
      console.log('✅ Cost alert sent successfully!')
    } else {
      console.log('❌ Failed to send cost alert')
    }
  } catch (error) {
    console.error('Error sending cost alert:', error)
  }

  // Test 3: Team notification
  console.log('\n3️⃣ Testing team member notification...')
  const message3 = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "👋 New Team Member Activated"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Welcome to the team!*\n\n`newuser@example.com` has successfully activated their AI Cost Guardian account."
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Role:*\nUser"
          },
          {
            type: "mrkdwn",
            text: "*Access Level:*\nStandard"
          },
          {
            type: "mrkdwn",
            text: "*Invited By:*\nSystem Admin"
          },
          {
            type: "mrkdwn",
            text: "*Activated:*\n" + new Date().toLocaleDateString()
          }
        ]
      }
    ]
  }

  try {
    const response3 = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message3)
    })

    if (response3.ok) {
      console.log('✅ Team notification sent successfully!')
    } else {
      console.log('❌ Failed to send team notification')
    }
  } catch (error) {
    console.error('Error sending team notification:', error)
  }

  // Test 4: High usage alert
  console.log('\n4️⃣ Testing high usage alert...')
  const message4 = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "📊 High Token Usage Detected"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Unusual AI usage pattern detected*\n\nA user has consumed an unusually high number of tokens in a short period."
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Tokens Used:*\n23,450"
          },
          {
            type: "mrkdwn",
            text: "*Estimated Cost:*\n$4.69"
          },
          {
            type: "mrkdwn",
            text: "*Provider:*\nClaude"
          },
          {
            type: "mrkdwn",
            text: "*Model:*\nClaude-3-Sonnet"
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Recommendation:* Consider reviewing the conversation or implementing usage limits for this user."
        }
      }
    ]
  }

  try {
    const response4 = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message4)
    })

    if (response4.ok) {
      console.log('✅ High usage alert sent successfully!')
    } else {
      console.log('❌ Failed to send high usage alert')
    }
  } catch (error) {
    console.error('Error sending high usage alert:', error)
  }

  console.log('\n🎉 Slack Webhook Testing Complete!')
  console.log('\n📱 Check your Slack workspace for the test messages!')
  console.log('\n💡 Webhook vs Bot Token:')
  console.log('✅ Webhook: Works immediately, great for notifications')
  console.log('🔧 Bot Token: Needs scope configuration, more features')
  console.log('\n🚀 Your AI Cost Guardian notifications are LIVE!')
}

// Run the webhook test
testSlackWebhook().catch(console.error)