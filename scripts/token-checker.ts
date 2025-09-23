/**
 * Token Type Checker and Slack Setup Status
 */

console.log('🔍 Slack Token Analysis')
console.log('========================\n')

const currentToken = process.env.SLACK_BOT_TOKEN || 'not-set'

console.log('Current Token Details:')
console.log(`Token: ${currentToken.substring(0, 20)}...`)
console.log(`Length: ${currentToken.length} characters`)

// Analyze token type
if (currentToken.startsWith('xoxb-')) {
  console.log('Type: ✅ Bot User OAuth Token (CORRECT)')
  console.log('Status: Ready for messaging!')
} else if (currentToken.startsWith('xapp-')) {
  console.log('Type: ❌ App-Level Token (WRONG TYPE)')
  console.log('Status: Cannot send messages')
  console.log('\n🔧 Fix Required:')
  console.log('1. Go to: https://api.slack.com/apps/A09A81C7KQU/oauth')
  console.log('2. Add Bot Token Scopes: chat:write, chat:write.public, channels:read')
  console.log('3. Click "Install to Workspace"')
  console.log('4. Copy the "Bot User OAuth Token" (starts with xoxb-)')
} else if (currentToken.startsWith('xoxp-')) {
  console.log('Type: ❌ User OAuth Token (WRONG TYPE)')
  console.log('Status: User token, need bot token')
} else if (currentToken.startsWith('xoxe.xoxp-')) {
  console.log('Type: ❌ OAuth Access Token (WRONG TYPE)')
  console.log('Status: OAuth token, need bot token')
} else {
  console.log('Type: ❌ Unknown or missing')
  console.log('Status: No valid token found')
}

console.log('\n📋 Required Token Format:')
console.log('✅ Correct: xoxb-1234567890-1234567890123-ABC...')
console.log('❌ Wrong:   xapp-1-A09A81C7KQU-9346...')
console.log('❌ Wrong:   xoxp-1234567890-1234...')
console.log('❌ Wrong:   xoxe.xoxp-1-Mi0y...')

console.log('\n🎯 Next Steps:')
if (currentToken.startsWith('xoxb-')) {
  console.log('✅ Token is correct! Test Slack integration:')
  console.log('npx tsx scripts/test-real-slack.ts')
} else {
  console.log('1. Visit: https://api.slack.com/apps/A09A81C7KQU/oauth')
  console.log('2. Ensure Bot Token Scopes include: chat:write, chat:write.public')
  console.log('3. Click "Install to Workspace" (or "Reinstall")')
  console.log('4. Copy the Bot User OAuth Token (xoxb-...)')
  console.log('5. Update .env.local with the new token')
  console.log('6. Test: npx tsx scripts/test-real-slack.ts')
}

console.log('\n🚀 Once Fixed:')
console.log('Your AI Cost Guardian will send real Slack notifications for:')
console.log('- 💰 Cost alerts and budget warnings')
console.log('- 👥 Team member activations')
console.log('- 📊 Usage monitoring and reports')
console.log('- 🔧 System health and failures')
console.log('- And 25+ other event types!')