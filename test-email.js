// Test script to send an email notification
const testEmail = async () => {
  const emailData = {
    to: "support@assetworks.ai",
    subject: "🧪 Test Email from Local Development",
    body: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AssetWorks - Test Email</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
          }
          .test-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #333; margin: 0; font-size: 24px;">🧪 Test Email</h1>
            <p style="color: #666; margin: 10px 0 0 0;">AssetWorks AI Platform - Local Development</p>
          </div>
          
          <div class="test-info">
            <h3 style="color: #333; margin-top: 0; font-size: 18px;">📋 Test Details:</h3>
            <p><strong>Test Type:</strong> Email Notification System</p>
            <p><strong>Environment:</strong> Local Development</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Purpose:</strong> Testing waitlist email notifications</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666;">This is a test email to verify the email notification system is working correctly.</p>
          </div>
          
          <div class="footer">
            <p><strong>AssetWorks AI - Investment Intelligence Platform</strong></p>
            <p>This is a test email from the local development environment.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    // Try to send via backend API
    const apiUrl = process.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
    console.log(`🌐 Attempting to send email via: ${apiUrl}/general/send-email`);
    
    const response = await fetch(`${apiUrl}/general/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Email sent successfully!');
      console.log('📧 Response:', result);
    } else {
      const errorText = await response.text();
      console.error('❌ Email sending failed:', errorText);
      console.log('📧 Email data for manual sending:', emailData);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('📧 Email data for manual sending:', emailData);
  }
};

// Run the test
testEmail(); 