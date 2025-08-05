// Email service for waitlist notifications
import { ContactFormData } from "@/types/types";

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/*------------------------------------------------------------------------------*/
// Generate Waitlist Notification Email
/*------------------------------------------------------------------------------*/
export const generateWaitlistEmail = (formData: ContactFormData): EmailData => {
  const timestamp = new Date().toLocaleString();
  const adminUrl = "https://staging-admin.assetworks.ai/admin/waitlists";
  
  return {
    to: "support@assetworks.ai",
    subject: "🎉 New Waitlist Submission - AssetWorks",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AssetWorks - New Waitlist Submission</title>
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
          .user-details {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .user-details table {
            width: 100%;
            border-collapse: collapse;
          }
          .user-details td {
            padding: 8px 0;
          }
          .user-details td:first-child {
            font-weight: bold;
            color: #333;
            width: 30%;
          }
          .user-details td:last-child {
            color: #666;
          }
          .cta-button {
            text-align: center;
            margin: 30px 0;
          }
          .cta-button a {
            background: #000;
            color: #fff !important;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            font-weight: bold;
            font-size: 16px;
          }
          .info-box {
            background: #e8f5e8;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .info-box p {
            margin: 0;
            color: #2d5a2d;
            font-size: 14px;
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
            <h1 style="color: #333; margin: 0; font-size: 24px;">🎉 New Waitlist Submission</h1>
            <p style="color: #666; margin: 10px 0 0 0;">AssetWorks AI Platform</p>
          </div>
          
          <div class="user-details">
            <h3 style="color: #333; margin-top: 0; font-size: 18px;">📋 User Details:</h3>
            <table>
              <tr>
                <td>Email:</td>
                <td>${formData.email}</td>
              </tr>
              ${formData.mobile ? `
              <tr>
                <td>Mobile:</td>
                <td>${formData.mobile}</td>
              </tr>
              ` : ''}
              ${formData.user_type ? `
              <tr>
                <td>User Type:</td>
                <td>${formData.user_type}</td>
              </tr>
              ` : ''}
              ${formData.message ? `
              <tr>
                <td>Message:</td>
                <td>${formData.message}</td>
              </tr>
              ` : ''}
              <tr>
                <td>Submission Time:</td>
                <td>${timestamp}</td>
              </tr>
            </table>
          </div>
          
          <div class="cta-button">
            <a href="${adminUrl}">👁️ See User Details</a>
          </div>
          
          <div class="info-box">
            <p><strong>ℹ️ Note:</strong> This is an automated notification. The user has been added to the waitlist and can be managed through the admin panel.</p>
          </div>
          
          <div class="footer">
            <p><strong>AssetWorks AI - Investment Intelligence Platform</strong></p>
            <p>This email was sent automatically from the waitlist submission form.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
New Waitlist Submission - AssetWorks

User Details:
- Email: ${formData.email}
${formData.mobile ? `- Mobile: ${formData.mobile}` : ''}
${formData.user_type ? `- User Type: ${formData.user_type}` : ''}
${formData.message ? `- Message: ${formData.message}` : ''}
- Submission Time: ${timestamp}

View User Details: ${adminUrl}

---
AssetWorks AI - Investment Intelligence Platform
    `
  };
};

/*------------------------------------------------------------------------------*/
// Send Email via Backend API (Using same SMTP config as backend)
/*------------------------------------------------------------------------------*/
export const sendEmail = async (emailData: EmailData): Promise<void> => {
  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    if (!apiUrl) {
      console.error("API base URL not configured");
      return;
    }
    
    // Use the same email structure as the backend
    const backendEmailData = {
      to: emailData.to,
      subject: emailData.subject,
      body: emailData.html // Backend uses 'body' field for HTML content
    };
    
    const response = await fetch(`${apiUrl}/general/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendEmailData)
    });
    
    if (response.ok) {
      console.log("✅ Email sent successfully via backend API");
    } else {
      const errorText = await response.text();
      console.error("❌ Backend email API error:", errorText);
      throw new Error(`Email service failed: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ Email service error:", error);
    // Fallback: log the email data for manual sending
    console.log("📧 Email notification data (manual sending required):", emailData);
  }
}; 