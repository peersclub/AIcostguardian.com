/**
 * Test Executive Metrics with Existing Usage Data
 * This script validates that our executive metrics calculations work with real data
 */

import { executiveMetricsService } from '../lib/services/executive-metrics.service';
import { predictiveAnalyticsService } from '../lib/services/predictive-analytics.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testExecutiveMetrics() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║        EXECUTIVE METRICS TEST - REAL DATA VALIDATION              ║');
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

    // Get current usage stats
    const stats = await prisma.usageLog.aggregate({
      where: { organizationId },
      _count: true,
      _sum: { cost: true, totalTokens: true }
    });

    console.log('📊 Current Usage Data:');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log(`   Usage Records: ${stats._count}`);
    console.log(`   Total Cost: $${(stats._sum.cost || 0).toFixed(2)}`);
    console.log(`   Total Tokens: ${(stats._sum.totalTokens || 0).toLocaleString()}\n`);

    // Test Executive Metrics Calculation
    console.log('🎯 EXECUTIVE METRICS:');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    const executiveMetrics = await executiveMetricsService.calculateExecutiveMetrics(organizationId);
    
    console.log(`   Efficiency Score: ${executiveMetrics.efficiency.toFixed(1)}%`);
    console.log(`   └─ ${getEfficiencyInterpretation(executiveMetrics.efficiency)}`);
    
    console.log(`   Risk Score: ${executiveMetrics.riskScore} (lower is better)`);
    console.log(`   └─ ${getRiskInterpretation(executiveMetrics.riskScore)}`);
    
    console.log(`   Forecast Accuracy: ${executiveMetrics.forecastAccuracy.toFixed(1)}%`);
    console.log(`   └─ ${getForecastInterpretation(executiveMetrics.forecastAccuracy)}`);
    
    console.log(`   Savings Opportunity: $${executiveMetrics.savingsOpportunity.toFixed(2)}/month`);
    console.log(`   └─ ${getSavingsInterpretation(executiveMetrics.savingsOpportunity)}`);
    
    console.log(`   Compliance Score: ${executiveMetrics.complianceScore}%`);
    console.log(`   └─ ${getComplianceInterpretation(executiveMetrics.complianceScore)}\n`);

    // Test Performance Metrics
    console.log('⚡ PERFORMANCE METRICS:');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    const performanceMetrics = await executiveMetricsService.getPerformanceMetrics(organizationId);
    
    console.log(`   Response Time: ${performanceMetrics.responseTime}ms`);
    console.log(`   Availability: ${performanceMetrics.availability}%`);
    console.log(`   Error Rate: ${performanceMetrics.errorRate}%`);
    console.log(`   Throughput: ${performanceMetrics.throughput} requests/min\n`);

    // Test Predictive Analytics
    console.log('🔮 PREDICTIVE ANALYTICS:');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    const forecasts = await predictiveAnalyticsService.generateCostForecast(organizationId, 7);
    
    console.log('   7-Day Cost Forecast:');
    for (const forecast of forecasts.slice(0, 3)) {
      console.log(`   ${forecast.date.toLocaleDateString()}: $${forecast.predictedCost.toFixed(2)} (±${((forecast.upperBound - forecast.lowerBound) / 2).toFixed(2)}) - ${forecast.confidence.toFixed(0)}% confidence`);
    }
    
    // Test Pattern Detection
    console.log('\n📈 DETECTED PATTERNS:');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    const patterns = await predictiveAnalyticsService.detectPatterns(organizationId, 30);
    
    if (patterns.length > 0) {
      for (const pattern of patterns.slice(0, 3)) {
        console.log(`   ${pattern.type.toUpperCase()}: ${pattern.description}`);
        if (pattern.recommendation) {
          console.log(`   └─ Recommendation: ${pattern.recommendation}`);
        }
      }
    } else {
      console.log('   No significant patterns detected (need more usage data)');
    }

    // Test Optimization Recommendations
    console.log('\n💡 OPTIMIZATION RECOMMENDATIONS:');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    const optimizations = await predictiveAnalyticsService.generateOptimizationRecommendations(organizationId);
    
    if (optimizations.length > 0) {
      for (const opt of optimizations.slice(0, 3)) {
        console.log(`   ${opt.provider.toUpperCase()}: Save $${opt.savingsPotential.toFixed(2)}/month`);
        console.log(`   └─ ${opt.recommendation}`);
      }
    } else {
      console.log('   No optimization opportunities found yet');
    }

    // Test Trend Data
    console.log('\n📊 TREND ANALYSIS (Last 7 Days):');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    const costTrend = await executiveMetricsService.getTrendData(organizationId, 'cost', 7);
    const efficiencyTrend = await executiveMetricsService.getTrendData(organizationId, 'efficiency', 7);
    
    console.log('   Cost Trend:');
    for (const day of costTrend.slice(-3)) {
      const changeIndicator = day.change > 0 ? '↑' : day.change < 0 ? '↓' : '→';
      console.log(`   ${day.period}: $${day.value.toFixed(2)} ${changeIndicator} ${Math.abs(day.change).toFixed(1)}%`);
    }
    
    console.log('\n   Efficiency Trend:');
    for (const day of efficiencyTrend.slice(-3)) {
      const changeIndicator = day.change > 0 ? '↑' : day.change < 0 ? '↓' : '→';
      console.log(`   ${day.period}: ${day.value.toFixed(1)}% ${changeIndicator} ${Math.abs(day.change).toFixed(1)}%`);
    }

    // Summary and Recommendations
    console.log('\n\n🎯 EXECUTIVE SUMMARY:');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    if (stats._count < 100) {
      console.log('⚠️  LIMITED DATA: You have less than 100 usage records.');
      console.log('   Metrics will become more accurate with more usage data.');
      console.log('   Consider importing historical data or generating more usage.\n');
    }
    
    if (executiveMetrics.efficiency < 70) {
      console.log('⚠️  EFFICIENCY ALERT: Your efficiency score is below 70%.');
      console.log('   Review optimization recommendations to improve cost efficiency.\n');
    }
    
    if (executiveMetrics.riskScore > 50) {
      console.log('⚠️  RISK ALERT: Your risk score is above 50.');
      console.log('   Consider setting up budgets and diversifying AI providers.\n');
    }
    
    if (executiveMetrics.savingsOpportunity > 100) {
      console.log('💰 SAVINGS OPPORTUNITY: You could save over $100/month.');
      console.log('   Implement the optimization recommendations above.\n');
    }
    
    if (executiveMetrics.complianceScore < 80) {
      console.log('📋 COMPLIANCE: Your compliance score needs improvement.');
      console.log('   Configure budgets, alerts, and team collaboration features.\n');
    }
    
    console.log('✅ Executive metrics are calculating correctly with your data!');
    console.log('   Dashboard will now show real-time calculated values.\n');

  } catch (error) {
    console.error('❌ Error testing executive metrics:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper functions for interpretation
function getEfficiencyInterpretation(score: number): string {
  if (score >= 90) return '🌟 Excellent - Industry leading efficiency';
  if (score >= 75) return '✅ Good - Above average efficiency';
  if (score >= 60) return '📊 Average - Room for improvement';
  if (score >= 40) return '⚠️ Below Average - Optimization needed';
  return '❌ Poor - Immediate action required';
}

function getRiskInterpretation(score: number): string {
  if (score <= 20) return '🛡️ Very Low Risk - Excellent control';
  if (score <= 40) return '✅ Low Risk - Well managed';
  if (score <= 60) return '📊 Moderate Risk - Monitor closely';
  if (score <= 80) return '⚠️ High Risk - Action needed';
  return '❌ Critical Risk - Immediate intervention required';
}

function getForecastInterpretation(accuracy: number): string {
  if (accuracy >= 90) return '🎯 Highly Accurate - Very reliable predictions';
  if (accuracy >= 75) return '✅ Good Accuracy - Reliable for planning';
  if (accuracy >= 60) return '📊 Moderate Accuracy - Use with caution';
  if (accuracy >= 40) return '⚠️ Low Accuracy - Need more data';
  return '❌ Insufficient Data - Cannot predict reliably';
}

function getSavingsInterpretation(savings: number): string {
  if (savings >= 500) return '💎 Major Savings - Significant optimization potential';
  if (savings >= 200) return '💰 Good Savings - Worth implementing';
  if (savings >= 50) return '💵 Moderate Savings - Consider optimizing';
  if (savings >= 10) return '💸 Minor Savings - Low priority';
  return '✅ Optimized - Already efficient';
}

function getComplianceInterpretation(score: number): string {
  if (score >= 95) return '🏆 Excellent - Full compliance';
  if (score >= 80) return '✅ Good - Well configured';
  if (score >= 60) return '📊 Adequate - Some gaps';
  if (score >= 40) return '⚠️ Poor - Many gaps to address';
  return '❌ Critical - Immediate setup required';
}

// Run the test
testExecutiveMetrics()
  .then(() => console.log('═══════════════════════════════════════════════════════════════════'))
  .catch(console.error);