# Email Notification Setup for Waitlist Submissions

## Overview
This setup enables automatic email notifications to `support@assetworks.ai` whenever someone submits the waitlist form. The system uses the **same SMTP configuration** as the AssetWorks backend for OTP and login emails.

## Email Content
The email includes:
- 🎉 **Subject**: "New Waitlist Submission - AssetWorks"
- 📋 **User Details**: Email, mobile, user type, message, submission time
- 👁️ **CTA Button**: "See User Details" linking to `https://staging-admin.assetworks.ai/admin/waitlists`
- ℹ️ **Info Box**: Automated notification note
- 📧 **Professional Footer**: AssetWorks branding

## Backend Integration

### **SMTP Configuration (Same as Backend)**
The frontend uses the backend's email service with the same SMTP configuration:

```bash
# Backend environment variables (already configured)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=your_email@gmail.com
```

### **Backend Email Service**
The backend uses the `lettre` crate for SMTP email sending:
- **Service**: `src/services/email_service.rs`
- **Worker**: `src/workers/email_worker.rs`
- **Template**: Uses Tera templates for email rendering

### **Frontend-Backend Integration**
1. **Frontend** generates email content and sends to backend API
2. **Backend** uses existing SMTP configuration to send email
3. **Same email service** used for OTP, login alerts, and waitlist notifications

## API Endpoint

### **Backend Route**
```rust
// POST /general/send-email
{
  "to": "support@assetworks.ai",
  "subject": "🎉 New Waitlist Submission - AssetWorks",
  "body": "<html>...</html>"
}
```

### **Frontend Integration**
```typescript
// Frontend sends email data to backend
const response = await fetch(`${apiUrl}/general/send-email`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: "support@assetworks.ai",
    subject: "🎉 New Waitlist Submission - AssetWorks",
    body: htmlContent
  })
});
```

## Email Template Structure

### **HTML Version**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>AssetWorks - New Waitlist Submission</title>
  <style>
    /* Professional styling matching backend email templates */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 New Waitlist Submission</h1>
      <p>AssetWorks AI Platform</p>
    </div>
    
    <div class="user-details">
      <h3>📋 User Details:</h3>
      <table>
        <tr><td>Email:</td><td>user@example.com</td></tr>
        <tr><td>Submission Time:</td><td>2024-01-01 12:00:00</td></tr>
      </table>
    </div>
    
    <div class="cta-button">
      <a href="https://staging-admin.assetworks.ai/admin/waitlists">
        👁️ See User Details
      </a>
    </div>
    
    <div class="info-box">
      <p><strong>ℹ️ Note:</strong> This is an automated notification.</p>
    </div>
    
    <div class="footer">
      <p><strong>AssetWorks AI - Investment Intelligence Platform</strong></p>
    </div>
  </div>
</body>
</html>
```

### **Text Version**
```
New Waitlist Submission - AssetWorks

User Details:
- Email: user@example.com
- Submission Time: 2024-01-01 12:00:00

View User Details: https://staging-admin.assetworks.ai/admin/waitlists

---
AssetWorks AI - Investment Intelligence Platform
```

## Testing
1. **Submit** the waitlist form on the website
2. **Check** browser console for email service logs
3. **Verify** email is received at `support@assetworks.ai`
4. **Test** the "See User Details" button link
5. **Check** backend logs for email sending confirmation

## Troubleshooting
- **Email not sending**: Check browser console and backend logs
- **Backend errors**: Verify SMTP configuration in backend environment
- **API errors**: Check network tab for `/general/send-email` endpoint
- **Template issues**: Verify email HTML structure matches backend format

## Security Notes
- **Same SMTP credentials** as OTP and login emails
- **Rate limiting** applied to email endpoint
- **Email validation** on both frontend and backend
- **Logging** for debugging and monitoring

## Benefits
- ✅ **Consistent email service** across the entire platform
- ✅ **Same SMTP configuration** as existing email functionality
- ✅ **Professional email templates** matching backend standards
- ✅ **Reliable delivery** using proven backend email infrastructure
- ✅ **Easy maintenance** - single email service to manage 