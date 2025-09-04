import { PrismaClient } from '@prisma/client';
import { usageFetchService } from '../lib/services/usage-fetch.service';

const prisma = new PrismaClient();

async function backfillUsage() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║           BACKFILLING USAGE DATA FROM API PROVIDERS               ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');
  
  // Get user
  const user = await prisma.user.findUnique({
    where: { email: 'victor@aicostguardian.com' },
    include: { 
      organization: true,
      apiKeys: true 
    }
  });
  
  if (!user || !user.organizationId) {
    console.log('❌ User or organization not found');
    await prisma.$disconnect();
    return;
  }
  
  console.log('👤 User:', user.email);
  console.log('🏢 Organization:', user.organization?.name);
  console.log('🔑 API Keys Configured:', user.apiKeys.length, '\n');
  
  // Show which providers have keys
  console.log('📋 Available Providers:');
  console.log('═══════════════════════════════════════════════════════════════════');
  for (const key of user.apiKeys) {
    console.log(`   ✅ ${key.provider} - Active: ${key.isActive ? 'Yes' : 'No'}`);
  }
  console.log('');
  
  // Check current usage data before backfill
  const existingUsage = await prisma.usageLog.count({
    where: { organizationId: user.organizationId }
  });
  console.log(`📊 Existing Usage Records: ${existingUsage}\n`);
  
  // Run the backfill
  console.log('🔄 Starting Backfill Process...');
  console.log('═══════════════════════════════════════════════════════════════════\n');
  
  const result = await usageFetchService.backfillUsageData(
    user.id,
    user.organizationId
  );
  
  console.log('\n📈 Backfill Results:');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`   Status: ${result.success ? '✅ Success' : '⚠️  Completed with errors'}`);
  console.log(`   Records Added: ${result.recordsAdded}`);
  
  if (result.errors.length > 0) {
    console.log('\n   ⚠️  Errors encountered:');
    for (const error of result.errors) {
      console.log(`      - ${error}`);
    }
  }
  
  // Check usage data after backfill
  const newUsageCount = await prisma.usageLog.count({
    where: { organizationId: user.organizationId }
  });
  console.log(`\n   Total Usage Records Now: ${newUsageCount}`);
  console.log(`   New Records Added: ${newUsageCount - existingUsage}`);
  
  // Show summary of backfilled data
  if (result.recordsAdded > 0) {
    const recentUsage = await prisma.usageLog.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { timestamp: 'desc' },
      take: 5
    });
    
    console.log('\n📝 Recent Usage Records:');
    for (const usage of recentUsage) {
      console.log(`   - ${usage.timestamp.toISOString().split('T')[0]} | ${usage.provider} | ${usage.model} | $${usage.cost.toFixed(4)}`);
    }
  }
  
  console.log('\n💡 Notes:');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('   • OpenAI: Limited historical data available via API');
  console.log('   • Claude: No public usage API - tracking future usage only');
  console.log('   • Gemini: Usage tracked through Google Cloud Console');
  console.log('   • Grok: New API - usage endpoints not yet documented');
  console.log('');
  console.log('   ℹ️  Most providers don\'t offer historical usage APIs.');
  console.log('   Future usage will be tracked automatically when you make API calls.\n');
  
  console.log('🎯 Next Steps:');
  console.log('   1. Visit http://localhost:3000/dashboard to see updated data');
  console.log('   2. Use http://localhost:3000/aioptimise to generate new usage');
  console.log('   3. Set up webhooks for real-time tracking (if available)');
  
  await prisma.$disconnect();
}

// Run the backfill
backfillUsage()
  .catch((error) => {
    console.error('Backfill failed:', error);
    process.exit(1);
  });