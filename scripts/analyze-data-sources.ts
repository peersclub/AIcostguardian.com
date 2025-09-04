/**
 * Script to analyze which screens use real API data vs dummy data
 * Based on PRODUCT_KNOWLEDGE.md requirements
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ScreenAnalysis {
  screen: string;
  url: string;
  dataSource: 'REAL_API' | 'MIXED' | 'DUMMY' | 'STATIC';
  realDataEndpoints?: string[];
  dummyDataUsed?: string[];
  reason?: string;
}

async function analyzeDataSources() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║        AI COST GUARDIAN - DATA SOURCE ANALYSIS                    ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  // Get actual data counts
  const user = await prisma.user.findUnique({
    where: { email: 'victor@aicostguardian.com' },
    include: { organization: true }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  const stats = await prisma.usageLog.aggregate({
    where: { organizationId: user.organizationId! },
    _count: true,
    _sum: { cost: true, totalTokens: true }
  });

  const budgetCount = await prisma.budget.count({
    where: { organizationId: user.organizationId! }
  });

  const alertCount = await prisma.notification.count({
    where: { organizationId: user.organizationId! }
  });

  console.log('📊 Current Database Statistics:');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`   Usage Logs: ${stats._count} records`);
  console.log(`   Total Cost: $${(stats._sum.cost || 0).toFixed(2)}`);
  console.log(`   Total Tokens: ${(stats._sum.totalTokens || 0).toLocaleString()}`);
  console.log(`   Budgets: ${budgetCount}`);
  console.log(`   Notifications: ${alertCount}\n`);

  const screens: ScreenAnalysis[] = [
    // 1. DASHBOARD
    {
      screen: 'Dashboard',
      url: '/dashboard',
      dataSource: 'MIXED',
      realDataEndpoints: [
        '/api/dashboard/metrics',
        '/api/keys/status'
      ],
      dummyDataUsed: [
        'executiveMetrics.efficiency (hardcoded 94.2%)',
        'executiveMetrics.riskScore (hardcoded 23)',
        'executiveMetrics.forecastAccuracy (hardcoded 87.3%)',
        'performanceMetrics (random values)',
        'businessInsights (default messages when no data)'
      ],
      reason: 'Uses real usage data when available, but fills in placeholder metrics for executive dashboard elements that require historical trend analysis'
    },

    // 2. USAGE ANALYTICS
    {
      screen: 'Usage Analytics',
      url: '/usage',
      dataSource: 'REAL_API',
      realDataEndpoints: [
        '/api/usage/stats',
        '/api/usage/recent',
        '/api/usage/export'
      ],
      dummyDataUsed: [],
      reason: 'Fully connected to real usage data. Shows empty state when no usage recorded'
    },

    // 3. AIOPTIMISE CHAT
    {
      screen: 'AIOptimise Chat',
      url: '/aioptimise',
      dataSource: 'REAL_API',
      realDataEndpoints: [
        '/api/aioptimise/chat',
        '/api/aioptimise/threads',
        '/api/aioptimise/settings',
        '/api/aioptimise/limits'
      ],
      dummyDataUsed: [],
      reason: 'Makes real API calls to AI providers and tracks usage in real-time'
    },

    // 4. API KEYS SETTINGS
    {
      screen: 'API Keys Settings',
      url: '/settings/api-keys',
      dataSource: 'REAL_API',
      realDataEndpoints: [
        '/api/api-keys (GET, POST, DELETE, PATCH)'
      ],
      dummyDataUsed: [],
      reason: 'Manages real encrypted API keys stored in database'
    },

    // 5. ORGANIZATIONS
    {
      screen: 'Organization Settings',
      url: '/settings/organization',
      dataSource: 'REAL_API',
      realDataEndpoints: [
        '/api/organizations',
        '/api/organizations/members'
      ],
      dummyDataUsed: [],
      reason: 'Real organization and member data from database'
    },

    // 6. BILLING
    {
      screen: 'Billing',
      url: '/billing',
      dataSource: 'DUMMY',
      realDataEndpoints: [],
      dummyDataUsed: [
        'Subscription plans (hardcoded)',
        'Payment methods (placeholder)',
        'Invoice history (mock data)'
      ],
      reason: 'Stripe integration not yet implemented. Shows placeholder subscription info'
    },

    // 7. NOTIFICATIONS
    {
      screen: 'Notifications',
      url: '/notifications',
      dataSource: 'REAL_API',
      realDataEndpoints: [
        '/api/notifications',
        '/api/notifications/preferences'
      ],
      dummyDataUsed: [],
      reason: 'Real notifications from database, but email sending requires configuration'
    },

    // 8. MODELS COMPARISON
    {
      screen: 'Models',
      url: '/models',
      dataSource: 'STATIC',
      realDataEndpoints: [],
      dummyDataUsed: [
        'Model pricing tables',
        'Performance benchmarks',
        'Feature comparisons'
      ],
      reason: 'Static information page showing AI model specifications and pricing'
    },

    // 9. ANALYTICS
    {
      screen: 'Analytics',
      url: '/analytics',
      dataSource: 'MIXED',
      realDataEndpoints: [
        '/api/analytics/overview'
      ],
      dummyDataUsed: [
        'Trend predictions',
        'Cost optimization suggestions',
        'Performance scores'
      ],
      reason: 'Uses real usage data but generates placeholder insights when insufficient data'
    },

    // 10. TEAM
    {
      screen: 'Team Management',
      url: '/organization/members',
      dataSource: 'REAL_API',
      realDataEndpoints: [
        '/api/organizations/members',
        '/api/organizations/invitations'
      ],
      dummyDataUsed: [],
      reason: 'Real team member data, invitation system functional'
    },

    // 11. ALERTS
    {
      screen: 'Alerts',
      url: '/alerts',
      dataSource: 'REAL_API',
      realDataEndpoints: [
        '/api/alerts',
        '/api/budgets'
      ],
      dummyDataUsed: [
        'Suggested thresholds (if no history)'
      ],
      reason: 'Real alert configuration, but needs usage history for smart suggestions'
    },

    // 12. ONBOARDING
    {
      screen: 'Onboarding',
      url: '/onboarding',
      dataSource: 'REAL_API',
      realDataEndpoints: [
        '/api/api-keys',
        '/api/organizations'
      ],
      dummyDataUsed: [
        'Welcome messages',
        'Setup suggestions'
      ],
      reason: 'Real data creation but guided by static content'
    }
  ];

  console.log('\n📱 SCREEN-BY-SCREEN ANALYSIS:');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  // Categorize screens
  const realApiScreens = screens.filter(s => s.dataSource === 'REAL_API');
  const mixedScreens = screens.filter(s => s.dataSource === 'MIXED');
  const dummyScreens = screens.filter(s => s.dataSource === 'DUMMY');
  const staticScreens = screens.filter(s => s.dataSource === 'STATIC');

  console.log('✅ SCREENS USING REAL API DATA:');
  console.log('───────────────────────────────────────────────────────────────────');
  for (const screen of realApiScreens) {
    console.log(`   ${screen.screen} (${screen.url})`);
    console.log(`   └─ ${screen.reason}`);
  }

  console.log('\n🔄 SCREENS USING MIXED DATA (Real + Placeholder):');
  console.log('───────────────────────────────────────────────────────────────────');
  for (const screen of mixedScreens) {
    console.log(`   ${screen.screen} (${screen.url})`);
    console.log(`   ├─ Real: ${screen.realDataEndpoints?.join(', ')}`);
    console.log(`   ├─ Dummy: ${screen.dummyDataUsed?.slice(0, 2).join(', ')}...`);
    console.log(`   └─ ${screen.reason}`);
  }

  console.log('\n⚠️  SCREENS USING DUMMY DATA:');
  console.log('───────────────────────────────────────────────────────────────────');
  for (const screen of dummyScreens) {
    console.log(`   ${screen.screen} (${screen.url})`);
    console.log(`   ├─ Dummy: ${screen.dummyDataUsed?.join(', ')}`);
    console.log(`   └─ ${screen.reason}`);
  }

  console.log('\n📄 STATIC CONTENT SCREENS:');
  console.log('───────────────────────────────────────────────────────────────────');
  for (const screen of staticScreens) {
    console.log(`   ${screen.screen} (${screen.url})`);
    console.log(`   └─ ${screen.reason}`);
  }

  console.log('\n\n📊 SUMMARY:');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`   Real API Data: ${realApiScreens.length} screens (${Math.round(realApiScreens.length / screens.length * 100)}%)`);
  console.log(`   Mixed Data: ${mixedScreens.length} screens (${Math.round(mixedScreens.length / screens.length * 100)}%)`);
  console.log(`   Dummy Data: ${dummyScreens.length} screens (${Math.round(dummyScreens.length / screens.length * 100)}%)`);
  console.log(`   Static Content: ${staticScreens.length} screens (${Math.round(staticScreens.length / screens.length * 100)}%)`);

  console.log('\n\n❓ WHY SOME SCREENS USE DUMMY DATA:');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('\n1. DASHBOARD MIXED DATA:');
  console.log('   - Executive metrics need historical trends (30-90 days)');
  console.log('   - Performance scores require baseline data');
  console.log('   - Shows placeholders to demonstrate value even with no data');
  
  console.log('\n2. BILLING DUMMY DATA:');
  console.log('   - Stripe integration pending (requires business account)');
  console.log('   - Subscription management not yet implemented');
  console.log('   - Shows UI/UX for future monetization');
  
  console.log('\n3. MODELS STATIC DATA:');
  console.log('   - Pricing and specs are reference information');
  console.log('   - Not user-specific data');
  console.log('   - Updated manually when providers change pricing');

  console.log('\n\n🎯 RECOMMENDATIONS:');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('1. Generate more usage data to populate executive metrics');
  console.log('2. Configure Stripe for real billing integration');
  console.log('3. Set up email service (SendGrid/SES) for notifications');
  console.log('4. Create budgets and alerts to test those features');
  console.log('5. Use the proxy middleware for all AI calls to ensure tracking');

  await prisma.$disconnect();
}

analyzeDataSources().catch(console.error);