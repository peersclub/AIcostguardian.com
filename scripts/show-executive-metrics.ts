/**
 * Display Executive Metrics Directly
 * Shows the calculated metrics without requiring authentication
 */

import { executiveMetricsService } from '../lib/services/executive-metrics.service';
import { predictiveAnalyticsService } from '../lib/services/predictive-analytics.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showExecutiveMetrics() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║              EXECUTIVE METRICS - LIVE DATA VIEW                   ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  try {
    // Get organization
    const user = await prisma.user.findUnique({
      where: { email: 'victor@aicostguardian.com' },
      include: { organization: true }
    });

    if (!user || !user.organizationId) {
      console.log('❌ User or organization not found');
      return;
    }

    const organizationId = user.organizationId;

    // 1. EXECUTIVE METRICS
    console.log('🎯 EXECUTIVE METRICS:');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    const metrics = await executiveMetricsService.calculateExecutiveMetrics(organizationId);
    
    console.log(`
   ┌─────────────────────────────────────────────┐
   │  Efficiency Score:     ${metrics.efficiency.toFixed(1).padStart(5)}%  ${getBar(metrics.efficiency)} │
   │  Risk Score:           ${String(metrics.riskScore).padStart(5)}   ${getBar(100 - metrics.riskScore)} │
   │  Forecast Accuracy:    ${metrics.forecastAccuracy.toFixed(1).padStart(5)}%  ${getBar(metrics.forecastAccuracy)} │
   │  Compliance Score:     ${String(metrics.complianceScore).padStart(5)}%  ${getBar(metrics.complianceScore)} │
   │  Savings Available:    $${metrics.savingsOpportunity.toFixed(2).padStart(6)}/month          │
   └─────────────────────────────────────────────┘`);

    // 2. PERFORMANCE METRICS
    console.log('\n⚡ PERFORMANCE METRICS:');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    const performance = await executiveMetricsService.getPerformanceMetrics(organizationId);
    
    console.log(`
   Response Time:     ${performance.responseTime}ms
   Availability:      ${performance.availability}%
   Error Rate:        ${performance.errorRate}%
   Throughput:        ${performance.throughput} req/min
`);

    // 3. COST FORECAST
    console.log('🔮 7-DAY COST FORECAST:');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    const forecasts = await predictiveAnalyticsService.generateCostForecast(organizationId, 7);
    
    console.log('   Date         Predicted    Range         Confidence');
    console.log('   ──────────   ─────────    ───────────   ──────────');
    for (const forecast of forecasts) {
      const date = forecast.date.toLocaleDateString();
      const predicted = `$${forecast.predictedCost.toFixed(2)}`;
      const range = `$${forecast.lowerBound.toFixed(2)}-${forecast.upperBound.toFixed(2)}`;
      const confidence = `${forecast.confidence.toFixed(0)}%`;
      console.log(`   ${date.padEnd(12)} ${predicted.padEnd(12)} ${range.padEnd(13)} ${confidence}`);
    }

    // 4. DETECTED PATTERNS
    console.log('\n📈 DETECTED PATTERNS:');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    const patterns = await predictiveAnalyticsService.detectPatterns(organizationId, 30);
    
    if (patterns.length > 0) {
      for (const pattern of patterns.slice(0, 5)) {
        const icon = pattern.type === 'trend' ? '📊' : 
                     pattern.type === 'spike' ? '⬆️' : 
                     pattern.type === 'dip' ? '⬇️' :
                     pattern.type === 'seasonal' ? '📅' : '⚠️';
        console.log(`   ${icon} ${pattern.description}`);
        if (pattern.recommendation) {
          console.log(`      └─ ${pattern.recommendation}`);
        }
      }
    } else {
      console.log('   No significant patterns detected');
    }

    // 5. OPTIMIZATION RECOMMENDATIONS
    console.log('\n💡 TOP OPTIMIZATION OPPORTUNITIES:');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    const optimizations = await predictiveAnalyticsService.generateOptimizationRecommendations(organizationId);
    
    if (optimizations.length > 0) {
      for (const opt of optimizations.slice(0, 3)) {
        console.log(`   ${opt.provider.toUpperCase()}: Save $${opt.savingsPotential.toFixed(2)}/month`);
        console.log(`   └─ ${opt.recommendation}`);
        console.log(`      Confidence: ${(opt.confidence * 100).toFixed(0)}%\n`);
      }
    }

    // 6. BUDGET STATUS
    console.log('💰 BUDGET STATUS:');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    const budgets = await prisma.budget.findMany({
      where: { organizationId, isActive: true },
      orderBy: { amount: 'desc' },
      take: 5
    });

    for (const budget of budgets) {
      const utilization = ((budget.spent / budget.amount) * 100).toFixed(1);
      const status = parseFloat(utilization) > budget.alertThreshold 
        ? '⚠️ ALERT' 
        : parseFloat(utilization) > 50 
        ? '📊 OK' 
        : '✅ GOOD';
      
      console.log(`   ${budget.name.padEnd(30)} $${budget.spent.toFixed(2)}/$${budget.amount} (${utilization}%) ${status}`);
    }

    // 7. RECENT ACTIVITY
    console.log('\n📊 RECENT ACTIVITY (Last 24 Hours):');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentStats = await prisma.usageLog.aggregate({
      where: {
        organizationId,
        timestamp: { gte: oneDayAgo }
      },
      _count: true,
      _sum: { cost: true, totalTokens: true }
    });

    const providerActivity = await prisma.usageLog.groupBy({
      by: ['provider'],
      where: {
        organizationId,
        timestamp: { gte: oneDayAgo }
      },
      _count: true,
      _sum: { cost: true }
    });

    console.log(`   Total Requests: ${recentStats._count}`);
    console.log(`   Total Cost: $${(recentStats._sum.cost || 0).toFixed(2)}`);
    console.log(`   Total Tokens: ${(recentStats._sum.totalTokens || 0).toLocaleString()}`);
    console.log('\n   By Provider:');
    for (const activity of providerActivity) {
      console.log(`   • ${activity.provider}: ${activity._count} requests, $${(activity._sum.cost || 0).toFixed(2)}`);
    }

    // 8. KEY INSIGHTS
    console.log('\n🎯 KEY INSIGHTS:');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    // Generate insights based on metrics
    const insights = [];
    
    if (metrics.efficiency > 90) {
      insights.push('✅ Excellent cost efficiency - maintaining optimal AI provider mix');
    } else if (metrics.efficiency < 60) {
      insights.push('⚠️ Efficiency below target - review provider selection and usage patterns');
    }
    
    if (metrics.riskScore < 30) {
      insights.push('✅ Low financial risk - budgets and controls are working well');
    } else if (metrics.riskScore > 60) {
      insights.push('⚠️ Elevated risk level - consider tightening budget controls');
    }
    
    if (metrics.savingsOpportunity > 100) {
      insights.push(`💰 Significant savings available: $${metrics.savingsOpportunity.toFixed(2)}/month`);
    }
    
    if (metrics.complianceScore > 85) {
      insights.push('✅ Strong compliance posture - all governance controls in place');
    } else if (metrics.complianceScore < 70) {
      insights.push('⚠️ Compliance gaps detected - review alert and budget configurations');
    }
    
    if (metrics.forecastAccuracy > 80) {
      insights.push('✅ High forecast reliability - predictions can be trusted for planning');
    }

    for (const insight of insights) {
      console.log(`   ${insight}`);
    }

    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log('📌 Access full dashboard at: http://localhost:3000/dashboard');
    console.log('═══════════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to create visual bars
function getBar(percentage: number): string {
  const filled = Math.round(percentage / 10);
  const empty = 10 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

// Run the display
showExecutiveMetrics()
  .catch(console.error);