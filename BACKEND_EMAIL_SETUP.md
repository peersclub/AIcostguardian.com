# Backend Email Setup Guide

## 🚀 **Step 1: Backend Compilation**

The backend is currently compiling. Wait for it to finish, then proceed with the configuration.

### **Check Backend Status:**
```bash
# Check if backend is running
curl -X GET http://localhost:8080/health

# Check compilation status
ps aux | grep cargo
```

## 🔧 **Step 2: Environment Configuration**

Create a `.env.development` file in the `astwrks-be` directory:

```bash
# Development Environment Configuration
ENVIRONMENT=development

# Server Configuration
SERVER_ADDRESS=0.0.0.0:8080

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/assetworks
REDIS_URL=redis://localhost:6379

# SMTP Configuration for Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=your_email@gmail.com

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# AI Provider Keys (if needed)
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# AWS Configuration (if needed)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# Logging
RUST_LOG=debug
```

## 📧 **Step 3: SMTP Configuration**

### **Gmail Setup (Recommended):**
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Update Environment Variables**:
   ```bash
   SMTP_USERNAME=your_email@gmail.com
   SMTP_PASSWORD=your_16_character_app_password
   SMTP_FROM=your_email@gmail.com
   ```

### **Other SMTP Providers:**
- **Outlook**: `smtp-mail.outlook.com:587`
- **SendGrid**: `smtp.sendgrid.net:587`
- **Mailgun**: `smtp.mailgun.org:587`

## 🧪 **Step 4: Test Email Functionality**

### **Option 1: Direct API Test**
```bash
curl -X POST http://localhost:8080/api/v1/general/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "support@assetworks.ai",
    "subject": "🧪 Test Email from Local",
    "body": "<h1>Test Email</h1><p>This is a test email from local development.</p>"
  }'
```

### **Option 2: Frontend Test**
```bash
# Run the test scripts
cd /Users/Victor/anthropic-quickstarts/website-fe
node test-email.js
node test-waitlist.js
```

### **Option 3: Browser Test**
1. **Open** `http://localhost:8081` in browser
2. **Submit** waitlist form with test data
3. **Check** browser console for email logs
4. **Verify** email received at `support@assetworks.ai`

## 📋 **Step 5: Verify Email Delivery**

### **Check Email Inbox:**
- **Primary**: Check `support@assetworks.ai` inbox
- **Spam**: Check spam/junk folder
- **Logs**: Check backend console for email logs

### **Expected Email Content:**
```
Subject: 🎉 New Waitlist Submission - AssetWorks

📋 User Details:
- Email: test@example.com
- Mobile: +1234567890
- User Type: investor
- Message: Test submission
- Submission Time: 2024-01-01 12:00:00

[👁️ See User Details] → https://staging-admin.assetworks.ai/admin/waitlists

---
AssetWorks AI - Investment Intelligence Platform
```

## 🔍 **Step 6: Troubleshooting**

### **Backend Not Starting:**
```bash
# Check compilation errors
cd /Users/Victor/anthropic-quickstarts/astwrks-be
cargo check

# Check missing dependencies
brew install protobuf
```

### **Email Not Sending:**
```bash
# Check SMTP configuration
echo $SMTP_HOST
echo $SMTP_USERNAME
echo $SMTP_PASSWORD

# Test SMTP connection
telnet smtp.gmail.com 587
```

### **API Errors:**
```bash
# Check backend logs
tail -f /path/to/backend/logs

# Test API endpoint
curl -X GET http://localhost:8080/health
```

## ✅ **Step 7: Success Indicators**

### **Backend Running:**
- ✅ `curl http://localhost:8080/health` returns success
- ✅ Backend logs show "Server started on: http://0.0.0.0:8080"

### **Email Working:**
- ✅ `curl` to `/general/send-email` returns `200 OK`
- ✅ Email received at `support@assetworks.ai`
- ✅ Email contains correct content and admin link

### **Frontend Integration:**
- ✅ Waitlist form submission triggers email
- ✅ Browser console shows email logs
- ✅ No errors in network tab

## 🎯 **Next Steps**

1. **Wait** for backend compilation to complete
2. **Configure** SMTP environment variables
3. **Test** email functionality using one of the methods above
4. **Verify** email delivery to `support@assetworks.ai`
5. **Monitor** backend logs for any issues

The email notification system is ready to use once the backend is running with proper SMTP configuration! 🚀 