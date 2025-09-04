import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateUsageData() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('           GENERATING SAMPLE USAGE DATA');
  console.log('═══════════════════════════════════════════════════════════════════\n');
  
  // Get user and organization
  const user = await prisma.user.findUnique({
    where: { email: 'victor@aicostguardian.com' },
    include: { organization: true }
  });
  
  if (!user || !user.organizationId) {
    console.log('❌ User or organization not found');
    return;
  }
  
  console.log(`👤 User: ${user.email}`);
  console.log(`🏢 Organization: ${user.organization?.name}\n`);
  
  // Sample data for different providers
  const providers = [
    { name: 'openai', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'], costPerToken: 0.00003 },
    { name: 'claude', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'], costPerToken: 0.00004 },
    { name: 'gemini', models: ['gemini-pro', 'gemini-pro-vision'], costPerToken: 0.00002 },
    { name: 'grok', models: ['grok-beta'], costPerToken: 0.00002 }
  ];
  
  const now = new Date();
  const usageLogs = [];
  
  // Generate usage data for the last 30 days
  for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    
    // Random number of requests per day (0-20)
    const requestsPerDay = Math.floor(Math.random() * 20);
    
    for (let i = 0; i < requestsPerDay; i++) {
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const model = provider.models[Math.floor(Math.random() * provider.models.length)];
      
      // Random tokens between 100 and 5000
      const promptTokens = Math.floor(Math.random() * 2000) + 100;
      const completionTokens = Math.floor(Math.random() * 3000) + 100;
      const totalTokens = promptTokens + completionTokens;
      
      // Calculate cost
      const cost = totalTokens * provider.costPerToken;
      
      // Random hour of the day
      const hour = Math.floor(Math.random() * 24);
      date.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
      
      usageLogs.push({
        organizationId: user.organizationId,
        userId: user.id,
        provider: provider.name,
        model: model,
        promptTokens: promptTokens,
        completionTokens: completionTokens,
        totalTokens: totalTokens,
        cost: cost,
        timestamp: new Date(date),
        metadata: {
          requestType: ['chat', 'completion', 'embedding'][Math.floor(Math.random() * 3)],
          environment: 'production',
          feature: ['chat', 'analysis', 'generation', 'translation'][Math.floor(Math.random() * 4)]
        }
      });
    }
  }
  
  console.log(`📊 Generating ${usageLogs.length} usage records...\n`);
  
  // Insert all usage logs
  for (const log of usageLogs) {
    await prisma.usageLog.create({ data: log });
  }
  
  // Calculate summary statistics
  const totalCost = usageLogs.reduce((sum, log) => sum + log.cost, 0);
  const totalTokens = usageLogs.reduce((sum, log) => sum + log.totalTokens, 0);
  
  // Provider breakdown
  const providerStats: Record<string, any> = {};
  for (const log of usageLogs) {
    if (!providerStats[log.provider]) {
      providerStats[log.provider] = { count: 0, cost: 0, tokens: 0 };
    }
    providerStats[log.provider].count++;
    providerStats[log.provider].cost += log.cost;
    providerStats[log.provider].tokens += log.totalTokens;
  }
  
  console.log('✅ Sample usage data generated successfully!\n');
  console.log('📈 Summary:');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`   Total Records: ${usageLogs.length}`);
  console.log(`   Total Cost: $${totalCost.toFixed(2)}`);
  console.log(`   Total Tokens: ${totalTokens.toLocaleString()}`);
  console.log(`   Average Cost per Request: $${(totalCost / usageLogs.length).toFixed(4)}\n`);
  
  console.log('🤖 Provider Breakdown:');
  for (const [provider, stats] of Object.entries(providerStats)) {
    console.log(`   ${provider}:`);
    console.log(`     - Requests: ${stats.count}`);
    console.log(`     - Cost: $${stats.cost.toFixed(2)}`);
    console.log(`     - Tokens: ${stats.tokens.toLocaleString()}`);
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('   1. Visit http://localhost:3000/dashboard to see the data');
  console.log('   2. Visit http://localhost:3000/usage for detailed analytics');
  console.log('   3. The charts and metrics will now show real data!');
  
  await prisma.$disconnect();
}

generateUsageData()
  .catch(console.error);