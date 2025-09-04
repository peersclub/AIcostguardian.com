async function testBackfillAPI() {
  console.log('Testing Usage Backfill API Endpoint\n');
  console.log('══════════════════════════════════════════════════════════════════\n');
  
  // First, check the status endpoint
  console.log('1. Checking backfill status...');
  try {
    const statusResponse = await fetch('http://localhost:3000/api/usage/backfill', {
      headers: {
        'Cookie': 'next-auth.session-token=your-session-token' // Would need real session
      }
    });
    
    if (statusResponse.status === 401) {
      console.log('   ⚠️  Authentication required - this is expected without a valid session\n');
    } else if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('   ✅ Status retrieved:');
      console.log('      - API Keys:', statusData.apiKeysConfigured);
      console.log('      - Total Records:', statusData.currentStats?.totalRecords);
      console.log('      - Total Cost: $' + (statusData.currentStats?.totalCost || 0).toFixed(2));
      console.log('');
    }
  } catch (error) {
    console.log('   ❌ Failed to check status:', error);
  }
  
  console.log('2. API Endpoint Summary:');
  console.log('   • GET  /api/usage/backfill - Check current usage statistics');
  console.log('   • POST /api/usage/backfill - Trigger usage data backfill\n');
  
  console.log('3. Provider Support Status:');
  console.log('   ┌─────────────┬────────────────────────────────────────────┐');
  console.log('   │ Provider    │ Historical Data Availability              │');
  console.log('   ├─────────────┼────────────────────────────────────────────┤');
  console.log('   │ OpenAI      │ ⚠️  Limited (requires org permissions)     │');
  console.log('   │ Claude      │ ❌ No public API                          │');
  console.log('   │ Gemini      │ ❌ Google Cloud Console only              │');
  console.log('   │ Grok        │ ❌ Not documented                         │');
  console.log('   │ Perplexity  │ ❌ No usage API                           │');
  console.log('   │ Cohere      │ ⚠️  Limited dashboard access              │');
  console.log('   │ Mistral     │ ❌ No public API                          │');
  console.log('   └─────────────┴────────────────────────────────────────────┘\n');
  
  console.log('4. Alternative Data Sources:');
  console.log('   • Email receipts/invoices from providers');
  console.log('   • CSV exports from provider dashboards');
  console.log('   • Manual entry for historical data');
  console.log('   • Webhook integration for real-time tracking\n');
  
  console.log('5. Recommended Approach:');
  console.log('   ✅ Track all future usage through the app');
  console.log('   ✅ Use the AIOptimise feature to generate usage');
  console.log('   ✅ Set up proxy middleware for API calls');
  console.log('   ✅ Import historical data from CSV if available\n');
  
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('To use the backfill feature:');
  console.log('1. Visit http://localhost:3000/usage');
  console.log('2. Look for the "Usage Data Backfill" card');
  console.log('3. Click "Run Backfill" to fetch available data\n');
}

testBackfillAPI().catch(console.error);