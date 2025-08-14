# Amazon SES Email Integration Setup

## Overview
AI Cost Guardian now uses Amazon Simple Email Service (SES) for sending all email notifications including usage alerts, monthly reports, team invitations, and system notifications.

## Configuration Status
✅ **SMTP Credentials Configured**
✅ **Email Service Implemented**
✅ **Templates Created**
✅ **Test Endpoint Available**

## Environment Variables

The following environment variables have been configured in `.env.local`:

```env
# Amazon SES Email Configuration
SES_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SES_SMTP_PORT=587
SES_SMTP_USERNAME=AKIAWZWMVW7D53AS2IXY
SES_SMTP_PASSWORD=[CONFIGURED]

# Email Settings
SES_FROM_EMAIL=noreply@aicostguardian.com
SES_FROM_NAME="AI Cost Guardian"
SES_REPLY_TO_EMAIL=support@aicostguardian.com

# SES Configuration (Optional)
SES_REGION=us-east-1
SES_CONFIGURATION_SET=ai-cost-guardian-tracking
```

## Testing the Integration

### 1. Via Web Interface
Navigate to: http://localhost:3000/test-email

This page allows you to:
- Verify SES connection status
- Send different types of test emails
- View configuration details

### 2. Via API
```bash
# Verify connection
curl -X GET http://localhost:3000/api/test-email \
  -H "Cookie: [your-session-cookie]"

# Send test email
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-session-cookie]" \
  -d '{"type": "test"}'
```

## Email Templates Available

1. **Test Email** - Simple verification email
2. **Welcome Email** - New user onboarding
3. **Usage Alert** - Cost threshold warnings
4. **Monthly Report** - Usage summary reports
5. **Team Invitation** - Organization invites
6. **Password Reset** - Account recovery

## Important Setup Steps

### 1. Verify Domain in AWS SES
Before production use, verify your sending domain:
1. Go to AWS SES Console
2. Navigate to "Verified identities"
3. Add and verify `aicostguardian.com`
4. Update DNS records as instructed

### 2. Move Out of Sandbox Mode
By default, SES accounts are in sandbox mode:
1. Can only send to verified email addresses
2. Limited sending rate (1 email/second)
3. Request production access via AWS Console

### 3. Configure Bounce and Complaint Handling
Set up SNS topics for:
- Bounce notifications
- Complaint notifications
- Delivery notifications (optional)

## Service Architecture

```
┌─────────────────────┐
│   Application       │
├─────────────────────┤
│ Notification Service│
├─────────────────────┤
│   Email Channel     │
├─────────────────────┤
│  SES Email Service  │
├─────────────────────┤
│    Amazon SES       │
└─────────────────────┘
```

## File Structure

```
lib/
├── email/
│   └── ses-email.service.ts       # Core SES implementation
├── notifications/
│   ├── channels/
│   │   └── email.channel.ts       # Email notification channel
│   └── notification.service.ts    # Main notification service
app/
├── api/
│   └── test-email/
│       └── route.ts               # Test API endpoint
└── test-email/
    └── page.tsx                   # Test UI page
```

## Features Implemented

### Core Functionality
- ✅ SMTP-based email sending via SES
- ✅ HTML and plain text email support
- ✅ Bulk email sending with rate limiting
- ✅ Template-based emails
- ✅ Attachment support
- ✅ Custom headers and metadata

### Templates
- ✅ Responsive HTML templates
- ✅ Dark/light theme support
- ✅ Mobile-optimized layouts
- ✅ Personalization variables
- ✅ Call-to-action buttons

### Error Handling
- ✅ Graceful fallback for missing config
- ✅ Retry logic for transient failures
- ✅ Rate limit compliance
- ✅ Detailed error logging

## Usage Examples

### Sending a Simple Email
```typescript
import { sesEmailService } from '@/lib/email/ses-email.service'

await sesEmailService.sendEmail({
  to: 'user@example.com',
  subject: 'Hello from AI Cost Guardian',
  html: '<h1>Welcome!</h1>',
  text: 'Welcome to AI Cost Guardian'
})
```

### Sending a Templated Email
```typescript
await sesEmailService.sendTemplatedEmail(
  'user@example.com',
  'welcome',
  {
    name: 'John Doe',
    dashboardUrl: 'https://app.aicostguardian.com'
  }
)
```

### Bulk Email Sending
```typescript
const recipients = ['user1@example.com', 'user2@example.com']
const template = {
  subject: 'Monthly Update',
  html: '<p>Your monthly report is ready</p>',
  text: 'Your monthly report is ready'
}

const result = await sesEmailService.sendBulkEmails(recipients, template)
console.log(`Sent: ${result.success.length}, Failed: ${result.failed.length}`)
```

## Monitoring and Debugging

### Check Email Service Status
```typescript
const isConnected = await sesEmailService.verifyConnection()
console.log('SES Connected:', isConnected)
```

### View Logs
Email operations are logged to the console with:
- Timestamp
- Recipient
- Subject
- Status (success/failure)
- Error details (if any)

## Production Checklist

Before deploying to production:

- [ ] Verify domain ownership in AWS SES
- [ ] Request production access (move out of sandbox)
- [ ] Configure bounce/complaint handling
- [ ] Set up CloudWatch alarms for bounces/complaints
- [ ] Update FROM email to use verified domain
- [ ] Test with actual user emails
- [ ] Configure DKIM signing for better deliverability
- [ ] Set up SPF records in DNS
- [ ] Configure DMARC policy
- [ ] Test rate limiting behavior
- [ ] Verify email templates render correctly
- [ ] Set up email analytics tracking

## Troubleshooting

### Common Issues

1. **"Email address not verified" error**
   - Solution: Verify recipient email in SES console (sandbox mode)

2. **"Could not connect to SMTP server"**
   - Check credentials in `.env.local`
   - Verify security group allows outbound SMTP

3. **"Rate exceeded" error**
   - Implement exponential backoff
   - Check current SES sending limits

4. **Emails going to spam**
   - Configure DKIM signing
   - Set up SPF records
   - Monitor sender reputation

## Security Considerations

1. **Credentials**: Store SMTP credentials securely in environment variables
2. **Rate Limiting**: Implement proper rate limiting to avoid abuse
3. **Input Validation**: Validate all email addresses and content
4. **Template Injection**: Sanitize user input in templates
5. **Monitoring**: Set up alerts for unusual sending patterns

## Support

For issues or questions:
1. Check AWS SES documentation
2. Review CloudWatch logs
3. Contact AWS Support for SES-specific issues
4. Check application logs at `/api/test-email`

---

Last Updated: 2025-08-13
Configured by: Claude Code Assistant