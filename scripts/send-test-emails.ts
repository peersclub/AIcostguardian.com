import { sesEmailService } from '../lib/email/ses-email.service'

async function sendTestEmails() {
  const recipientEmail = 'sureshthejosephite@gmail.com'
  const results: { type: string; success: boolean; error?: string }[] = []

  console.log(`\n📧 Sending test emails to ${recipientEmail}...\n`)

  // 1. Simple Test Email
  console.log('1. Sending simple test email...')
  try {
    const result = await sesEmailService.sendEmail({
      to: recipientEmail,
      subject: 'Test Email from AI Cost Guardian',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #3b82f6;">Test Email Successful! 🎉</h1>
          <p>Hello,</p>
          <p>This test email confirms that Amazon SES is properly configured for AI Cost Guardian.</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Configuration Details:</h3>
            <ul style="color: #4b5563;">
              <li>Provider: Amazon SES</li>
              <li>SMTP Host: ${process.env.SES_SMTP_HOST || 'Not configured'}</li>
              <li>From: ${process.env.SES_FROM_EMAIL || 'Not configured'}</li>
              <li>Region: ${process.env.SES_REGION || 'us-east-1'}</li>
            </ul>
          </div>
          <p>You can now receive notifications for:</p>
          <ul>
            <li>✅ Usage alerts and threshold warnings</li>
            <li>✅ Monthly usage reports</li>
            <li>✅ Team invitations</li>
            <li>✅ Password reset requests</li>
            <li>✅ System notifications</li>
          </ul>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Sent from AI Cost Guardian at ${new Date().toLocaleString()}
          </p>
        </div>
      `,
      text: `Test Email Successful!\n\nThis confirms that Amazon SES is properly configured for AI Cost Guardian.\n\nSent at ${new Date().toLocaleString()}`
    })
    results.push({ type: 'Simple Test', success: result })
    console.log(`   ✅ Simple test email sent successfully`)
  } catch (error) {
    results.push({ type: 'Simple Test', success: false, error: (error as Error).message })
    console.log(`   ❌ Failed: ${(error as Error).message}`)
  }

  // Add delay between emails to respect rate limits
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 2. Welcome Email
  console.log('2. Sending welcome email...')
  try {
    const result = await sesEmailService.sendTemplatedEmail(
      recipientEmail,
      'welcome',
      {
        name: 'Test User',
        dashboardUrl: 'http://localhost:3000'
      }
    )
    results.push({ type: 'Welcome Email', success: result })
    console.log(`   ✅ Welcome email sent successfully`)
  } catch (error) {
    results.push({ type: 'Welcome Email', success: false, error: (error as Error).message })
    console.log(`   ❌ Failed: ${(error as Error).message}`)
  }

  await new Promise(resolve => setTimeout(resolve, 1000))

  // 3. Usage Alert
  console.log('3. Sending usage alert...')
  try {
    const result = await sesEmailService.sendTemplatedEmail(
      recipientEmail,
      'usageAlert',
      {
        alertType: 'Cost Threshold Warning',
        provider: 'OpenAI',
        usage: '$85.50',
        threshold: '$100.00',
        period: 'This Month',
        dashboardUrl: 'http://localhost:3000/usage'
      }
    )
    results.push({ type: 'Usage Alert', success: result })
    console.log(`   ✅ Usage alert sent successfully`)
  } catch (error) {
    results.push({ type: 'Usage Alert', success: false, error: (error as Error).message })
    console.log(`   ❌ Failed: ${(error as Error).message}`)
  }

  await new Promise(resolve => setTimeout(resolve, 1000))

  // 4. Monthly Report
  console.log('4. Sending monthly report...')
  try {
    const result = await sesEmailService.sendTemplatedEmail(
      recipientEmail,
      'monthlyReport',
      {
        month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        totalCost: '$1,234.56',
        totalRequests: '45,678',
        activeUsers: '12',
        providers: [
          { name: 'OpenAI', cost: '$567.89', requests: '23,456' },
          { name: 'Claude', cost: '$456.78', requests: '15,432' },
          { name: 'Gemini', cost: '$209.89', requests: '6,790' }
        ],
        reportUrl: 'http://localhost:3000/analytics'
      }
    )
    results.push({ type: 'Monthly Report', success: result })
    console.log(`   ✅ Monthly report sent successfully`)
  } catch (error) {
    results.push({ type: 'Monthly Report', success: false, error: (error as Error).message })
    console.log(`   ❌ Failed: ${(error as Error).message}`)
  }

  await new Promise(resolve => setTimeout(resolve, 1000))

  // 5. Team Invitation
  console.log('5. Sending team invitation...')
  try {
    const result = await sesEmailService.sendTemplatedEmail(
      recipientEmail,
      'teamInvite',
      {
        inviterName: 'Admin User',
        organizationName: 'AI Cost Guardian Demo',
        role: 'Member',
        inviteLink: 'http://localhost:3000/invite/accept'
      }
    )
    results.push({ type: 'Team Invitation', success: result })
    console.log(`   ✅ Team invitation sent successfully`)
  } catch (error) {
    results.push({ type: 'Team Invitation', success: false, error: (error as Error).message })
    console.log(`   ❌ Failed: ${(error as Error).message}`)
  }

  // Summary
  console.log('\n📊 Summary of Email Tests:')
  console.log('================================')
  
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.type}: ${result.success ? '✅ Success' : `❌ Failed - ${result.error}`}`)
  })
  
  console.log('================================')
  console.log(`Total: ${results.length} | Successful: ${successful} | Failed: ${failed}`)
  
  if (failed === 0) {
    console.log('\n🎉 All test emails sent successfully!')
    console.log(`📬 Check the inbox for: ${recipientEmail}`)
  } else {
    console.log('\n⚠️  Some emails failed to send. Please check the configuration.')
  }

  // Verify connection status
  console.log('\n🔍 Verifying SES connection...')
  const isConnected = await sesEmailService.verifyConnection()
  console.log(`Connection status: ${isConnected ? '✅ Connected' : '❌ Not connected'}`)
  
  if (!isConnected) {
    console.log('\n⚠️  Important Notes:')
    console.log('1. Make sure your AWS SES credentials are correct in .env.local')
    console.log('2. Verify that the sender email is verified in AWS SES')
    console.log('3. If in sandbox mode, the recipient email must also be verified')
    console.log('4. Check that your AWS SES region is correct')
  }
}

// Run the test
sendTestEmails().catch(console.error)