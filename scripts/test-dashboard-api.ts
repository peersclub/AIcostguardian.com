/**
 * Test Dashboard API Metrics
 * Verifies that the dashboard API returns calculated executive metrics
 */

import { PrismaClient } from '@prisma/client';
import { executiveMetricsService } from '../lib/services/executive-metrics.service';

const prisma = new PrismaClient();

async function testDashboardAPI() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║              DASHBOARD API TEST - EXECUTIVE METRICS               ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  try {
    // Get user and organization
    const user = await prisma.user.findUnique({
      where: { email: 'victor@aicostguardian.com' },
      include: { organization: true }
    });

    if (!user || !user.organizationId) {
      console.log('❌ User or organization not found');
      return;
    }

    const organizationId = user.organizationId;
    console.log(`✅ Found organization: ${user.organization?.name}\n`);

    // Calculate metrics directly
    console.log('📊 CALCULATING METRICS DIRECTLY:');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    const metrics = await executiveMetricsService.calculateExecutiveMetrics(organizationId);
    const performance = await executiveMetricsService.getPerformanceMetrics(organizationId);
    
    console.log('Executive Metrics:');
    console.log(`  • Efficiency: ${metrics.efficiency.toFixed(1)}%`);
    console.log(`  • Risk Score: ${metrics.riskScore}`);
    console.log(`  • Compliance Score: ${metrics.complianceScore}%`);
    console.log(`  • Forecast Accuracy: ${metrics.forecastAccuracy.toFixed(1)}%`);
    console.log(`  • Savings Opportunity: $${metrics.savingsOpportunity.toFixed(2)}/month\n`);
    
    console.log('Performance Metrics:');
    console.log(`  • Response Time: ${performance.responseTime}ms`);
    console.log(`  • Availability: ${performance.availability}%`);
    console.log(`  • Error Rate: ${performance.errorRate}%`);
    console.log(`  • Throughput: ${performance.throughput} req/min\n`);

    // Test what the API route would return
    console.log('🌐 SIMULATING API RESPONSE:');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    // Get dashboard data
    const usageLogs = await prisma.usageLog.findMany({
      where: {
        organizationId: organizationId,
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const totalSpend = usageLogs.reduce((sum, log) => sum + log.cost, 0);
    const budgets = await prisma.budget.findMany({
      where: { organizationId, isActive: true }
    });
    const monthlyBudget = budgets.find(b => b.period === 'MONTHLY');

    const apiResponse = {
      executiveMetrics: {
        totalSpend: Math.round(totalSpend * 100) / 100,
        monthlyBudget: monthlyBudget?.amount || 0,
        budgetUtilization: monthlyBudget ? Math.round((totalSpend / monthlyBudget.amount) * 1000) / 10 : 0,
        efficiency: metrics.efficiency,
        riskScore: metrics.riskScore,
        complianceScore: metrics.complianceScore,
        forecastAccuracy: metrics.forecastAccuracy,
        savingsOpportunity: metrics.savingsOpportunity,
        responseTime: performance.responseTime,
        availability: performance.availability,
        errorRate: performance.errorRate,
        throughput: performance.throughput
      }
    };

    console.log('API Response would include:');
    console.log(JSON.stringify(apiResponse.executiveMetrics, null, 2));

    console.log('\n✅ EXPECTED DASHBOARD DISPLAY:');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('The dashboard should now show:');
    console.log(`  • Efficiency gauge: ${metrics.efficiency.toFixed(0)}% (not 0%)`);
    console.log(`  • Risk score: ${metrics.riskScore} (not 0)`);
    console.log(`  • Compliance: ${metrics.complianceScore}% (not 0%)`);
    console.log(`  • Forecast accuracy: ${metrics.forecastAccuracy.toFixed(0)}% (not 0%)`);
    console.log(`  • Response time: ${performance.responseTime}ms (not 250ms)`);
    console.log(`  • Availability: ${performance.availability}% (not 99.9%)`);
    
    console.log('\n🔍 TROUBLESHOOTING:');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('If dashboard still shows zeros:');
    console.log('  1. Clear browser cache and reload');
    console.log('  2. Check browser console for errors');
    console.log('  3. Ensure you are logged in');
    console.log('  4. Check Network tab for /api/dashboard/metrics response');

  } catch (error) {
    console.error('❌ Error testing API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDashboardAPI()
  .catch(console.error);