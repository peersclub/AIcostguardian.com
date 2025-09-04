import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsageData() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║              CHECKING REAL DATA IN DATABASE                       ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');
  
  // Get user data
  const user = await prisma.user.findUnique({
    where: { email: 'victor@aicostguardian.com' },
    include: {
      organization: true,
      usage: {
        take: 5,
        orderBy: { timestamp: 'desc' }
      }
    }
  });
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }
  
  console.log('👤 User Information:');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`   Email: ${user.email}`);
  console.log(`   Name: ${user.name}`);
  console.log(`   Organization: ${user.organization?.name}`);
  console.log(`   Organization ID: ${user.organizationId}\n`);
  
  // Check for usage logs
  console.log('📊 Usage Logs:');
  console.log('═══════════════════════════════════════════════════════════════════');
  
  const totalUsageLogs = await prisma.usageLog.count({
    where: { organizationId: user.organizationId! }
  });
  
  console.log(`   Total Usage Logs: ${totalUsageLogs}`);
  
  if (totalUsageLogs > 0) {
    const recentLogs = await prisma.usageLog.findMany({
      where: { organizationId: user.organizationId! },
      take: 10,
      orderBy: { timestamp: 'desc' }
    });
    
    console.log('\n   Recent Usage (last 10 entries):');
    for (const log of recentLogs) {
      console.log(`   - ${log.timestamp.toISOString().split('T')[0]} | ${log.provider} | Model: ${log.model} | Cost: $${log.cost.toFixed(4)}`);
      console.log(`     Tokens: ${log.totalTokens} | Type: ${(log as any).requestType || 'N/A'}`);
    }
    
    // Calculate totals
    const allLogs = await prisma.usageLog.findMany({
      where: { organizationId: user.organizationId! }
    });
    
    const totalCost = allLogs.reduce((sum, log) => sum + log.cost, 0);
    const totalTokens = allLogs.reduce((sum, log) => sum + log.totalTokens, 0);
    
    console.log('\n   📈 Summary Statistics:');
    console.log(`      Total Cost: $${totalCost.toFixed(2)}`);
    console.log(`      Total Tokens: ${totalTokens.toLocaleString()}`);
    console.log(`      Total Requests: ${totalUsageLogs}`);
    console.log(`      Avg Cost per Request: $${(totalCost / totalUsageLogs).toFixed(4)}`);
    
    // Provider breakdown
    const providerStats = allLogs.reduce((acc, log) => {
      if (!acc[log.provider]) {
        acc[log.provider] = { count: 0, cost: 0, tokens: 0 };
      }
      acc[log.provider].count++;
      acc[log.provider].cost += log.cost;
      acc[log.provider].tokens += log.totalTokens;
      return acc;
    }, {} as Record<string, any>);
    
    console.log('\n   🤖 Provider Breakdown:');
    for (const [provider, stats] of Object.entries(providerStats)) {
      console.log(`      ${provider}:`);
      console.log(`        - Requests: ${stats.count}`);
      console.log(`        - Cost: $${stats.cost.toFixed(2)}`);
      console.log(`        - Tokens: ${stats.tokens.toLocaleString()}`);
    }
  } else {
    console.log('   ❌ No usage logs found in the database');
    console.log('   ℹ️  Usage logs are created when you use AI services with your API keys\n');
  }
  
  // Check for budgets
  console.log('\n💰 Budget Configuration:');
  console.log('═══════════════════════════════════════════════════════════════════');
  
  const budgets = await prisma.budget.findMany({
    where: { organizationId: user.organizationId! }
  });
  
  if (budgets.length > 0) {
    for (const budget of budgets) {
      console.log(`   - ${budget.name}: $${budget.amount} (${budget.period})`);
      console.log(`     Active: ${budget.isActive ? '✅' : '❌'}`);
    }
  } else {
    console.log('   ❌ No budgets configured');
  }
  
  // Check for alerts
  console.log('\n🔔 Alert Configuration:');
  console.log('═══════════════════════════════════════════════════════════════════');
  
  const alerts = await prisma.alert.findMany({
    where: { userId: user.id }
  });
  
  if (alerts.length > 0) {
    for (const alert of alerts) {
      console.log(`   - ${alert.type}: ${alert.message}`);
      console.log(`     Threshold: ${alert.threshold} | Active: ${alert.isActive ? '✅' : '❌'}`);
    }
  } else {
    console.log('   ❌ No alerts configured');
  }
  
  console.log('\n📝 Data Status:');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`   Dashboard URL: http://localhost:3000/dashboard`);
  console.log(`   Usage URL: http://localhost:3000/usage`);
  
  if (totalUsageLogs > 0) {
    console.log('   ✅ Real usage data is available and should display in the dashboard');
  } else {
    console.log('   ⚠️  No real usage data yet. The dashboard will show default/placeholder values');
    console.log('   💡 To generate real data:');
    console.log('      1. Make API calls using your configured API keys');
    console.log('      2. Use the AIOptimise chat feature at http://localhost:3000/aioptimise');
    console.log('      3. Usage will be automatically tracked and displayed');
  }
  
  await prisma.$disconnect();
}

checkUsageData()
  .catch(console.error);