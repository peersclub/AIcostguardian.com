# Amazon SES Email Troubleshooting

## Current Issue: Authentication Credentials Invalid (535 Error)

### Error Details
```
Error: Invalid login: 535 Authentication Credentials Invalid
Code: EAUTH
Response: 535 Authentication Credentials Invalid
```

### Provided Credentials
- **IAM User**: ses-smtp-user.20250813-233455
- **SMTP Username**: AKIAWZWMVW7D53AS2IXY
- **SMTP Password**: [CONFIGURED]

## Troubleshooting Steps

### 1. Verify Region Configuration
The SMTP endpoint must match the region where your SES is configured:

**Current Configuration**: `email-smtp.us-east-1.amazonaws.com`

If your SES is in a different region, update the `SES_SMTP_HOST` to match:
- US East (N. Virginia): `email-smtp.us-east-1.amazonaws.com`
- US West (Oregon): `email-smtp.us-west-2.amazonaws.com`
- EU (Ireland): `email-smtp.eu-west-1.amazonaws.com`
- Asia Pacific (Mumbai): `email-smtp.ap-south-1.amazonaws.com`

### 2. Verify IAM User Permissions
The IAM user `ses-smtp-user.20250813-233455` needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```

### 3. Check SMTP Credentials Generation
SMTP credentials are **different** from AWS Access Keys. To verify:

1. Go to AWS SES Console
2. Navigate to "SMTP Settings"
3. Click "Create My SMTP Credentials"
4. This will create an IAM user with proper permissions
5. **Important**: The password shown is the SMTP password, not the IAM secret key

### 4. Verify Email Addresses (Sandbox Mode)
If your account is in sandbox mode:
- **Sender email** (`noreply@aicostguardian.com`) must be verified
- **Recipient email** (`sureshthejosephite@gmail.com`) must also be verified

To verify emails:
1. Go to AWS SES Console → "Verified identities"
2. Click "Create identity"
3. Choose "Email address"
4. Enter the email and click "Create"
5. Check email for verification link

### 5. Test with AWS CLI
Test your SES configuration directly:

```bash
aws ses send-email \
  --from noreply@aicostguardian.com \
  --to sureshthejosephite@gmail.com \
  --subject "Test from AWS CLI" \
  --text "This is a test email" \
  --region us-east-1
```

### 6. Alternative: Use AWS SDK Instead of SMTP
If SMTP continues to fail, we can switch to using the AWS SDK directly:

```typescript
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const client = new SESClient({ 
  region: "us-east-1",
  credentials: {
    accessKeyId: "YOUR_ACCESS_KEY",
    secretAccessKey: "YOUR_SECRET_KEY"
  }
});
```

## Immediate Actions Required

1. **Verify the region** where your SES is configured
2. **Check if both sender and recipient emails are verified** in SES
3. **Confirm the SMTP credentials** were generated correctly (not just IAM credentials)
4. **Check IAM permissions** for the user

## To Send Test Emails

Once credentials are fixed, you can:

1. **Via Web Interface**: http://localhost:3000/test-email
2. **Via Script**: `npx tsx scripts/send-test-emails.ts`
3. **Via API**: Use the `/api/test-email` endpoint

## Support Resources

- [AWS SES SMTP Documentation](https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html)
- [Obtaining SMTP Credentials](https://docs.aws.amazon.com/ses/latest/dg/smtp-credentials.html)
- [Moving Out of Sandbox](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)

---

Last Updated: 2025-08-14