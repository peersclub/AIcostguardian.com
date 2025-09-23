# 🔧 Slack Permission Fix Required

## ✅ Current Status
- **Slack App Created**: ✅ AiCostGuardian (ID: A09A81C7KQU)
- **Tokens Generated**: ✅ OAuth token working
- **API Connection**: ✅ Successfully connecting to Slack API
- **Issue**: ❌ Missing `chat:write` permission scope

## 🚨 Error Details
```
Slack API error: missing_scope
```

This means your Slack app needs additional permissions to send messages.

## 🛠️ Quick Fix Steps

### 1. Go to Your Slack App Settings
1. Visit: https://api.slack.com/apps/A09A81C7KQU
2. Or go to https://api.slack.com/apps and click "AiCostGuardian"

### 2. Add Required Bot Token Scopes
1. Click **"OAuth & Permissions"** in the left sidebar
2. Scroll down to **"Scopes"** section
3. Under **"Bot Token Scopes"**, click **"Add an OAuth Scope"**
4. Add these required scopes:

**Essential Scopes (Required):**
- `chat:write` - Send messages as the bot
- `chat:write.public` - Send messages to public channels
- `channels:read` - View basic information about public channels

**Recommended Scopes (Optional but useful):**
- `users:read` - View people in the workspace
- `im:write` - Send direct messages
- `reactions:write` - Add emoji reactions
- `files:write` - Upload files (for reports/screenshots)

### 3. Reinstall App to Workspace
After adding scopes:
1. Scroll to top of "OAuth & Permissions" page
2. Click **"Reinstall to Workspace"**
3. Review and approve the new permissions
4. **Copy the new Bot User OAuth Token** (it will change)

### 4. Update Your Token
Replace the token in your `.env.local` file:
```bash
# Update this with the NEW token after reinstalling
SLACK_BOT_TOKEN=xoxb-[NEW-BOT-TOKEN-HERE]
```

### 5. Create Required Channels (If Not Exist)
Create these channels in your Slack workspace:
- `#ai-cost-guardian` (main channel)
- `#cost-alerts` (cost notifications)
- `#team-updates` (member notifications)
- `#system-alerts` (API/system issues)

### 6. Add Bot to Channels
1. Go to each channel
2. Type: `/invite @AiCostGuardian`
3. Or mention the bot: `@AiCostGuardian`

## 🧪 Test After Fix

Run this command to test:
```bash
SLACK_BOT_TOKEN=your-new-token SLACK_DEFAULT_CHANNEL=#ai-cost-guardian npx tsx scripts/test-real-slack.ts
```

## 📋 Expected Result After Fix

You should see:
```
✅ Real Slack message sent successfully!
✅ Rich formatted message sent successfully!
✅ Team notification sent successfully!
✅ Weekly report sent successfully!
```

And messages will appear in your Slack channels!

## 🔍 Troubleshooting

**If you still get errors:**

1. **Token Format Check**: New token should start with `xoxb-` (not `xoxe.xoxp-`)
2. **Channel Access**: Make sure bot is added to the channel you're testing
3. **App Installation**: Ensure app is properly installed in workspace
4. **Permissions**: Double-check all required scopes are added

**Common Issues:**
- `channel_not_found` - Create the channel or add bot to existing channel
- `not_in_channel` - Invite bot to the channel with `/invite @AiCostGuardian`
- `invalid_auth` - Token expired or incorrect, reinstall app

## 🎯 Once Fixed

Your AI Cost Guardian will automatically send notifications for:
- 💰 Cost threshold warnings and exceeded alerts
- 👥 New team member activations
- 📊 High token usage alerts
- 🚨 System failures and API issues
- 📈 Weekly cost reports
- 🔧 Integration problems
- And 23+ other event types!

---

**Status**: Waiting for Slack app permission fix
**Next Step**: Add `chat:write` scope and reinstall app