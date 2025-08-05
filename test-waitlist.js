// Test script to simulate waitlist submission and trigger email notification
const testWaitlistSubmission = async () => {
  const waitlistData = {
    email: "test@example.com",
    mobile: "+1234567890",
    user_type: "investor",
    message: "This is a test waitlist submission from local development"
  };

  try {
    // Try to submit waitlist via frontend API
    const apiUrl = process.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
    console.log(`🌐 Attempting to submit waitlist via: ${apiUrl}/general/waitlist`);
    
    const response = await fetch(`${apiUrl}/general/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(waitlistData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Waitlist submitted successfully!');
      console.log('📧 Response:', result);
      console.log('📧 Email notification should have been sent to support@assetworks.ai');
    } else {
      const errorText = await response.text();
      console.error('❌ Waitlist submission failed:', errorText);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('📧 Waitlist data for manual testing:', waitlistData);
  }
};

// Run the test
testWaitlistSubmission(); 