/**
 * Executive Metrics API Endpoint
 * Provides real-time executive dashboard metrics calculated from actual usage data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { executiveMetricsService } from '@/lib/services/executive-metrics.service';
import { predictiveAnalyticsService } from '@/lib/services/predictive-analytics.service';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any;
    
    if (!session?.user?.id || !session?.organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const organizationId = session.organizationId;

    // Get executive metrics
    const executiveMetrics = await executiveMetricsService.calculateExecutiveMetrics(organizationId);

    // Get performance metrics
    const performanceMetrics = await executiveMetricsService.getPerformanceMetrics(organizationId);

    // Get trend data for the last 30 days
    const costTrend = await executiveMetricsService.getTrendData(organizationId, 'cost', 30);
    const usageTrend = await executiveMetricsService.getTrendData(organizationId, 'usage', 30);
    const efficiencyTrend = await executiveMetricsService.getTrendData(organizationId, 'efficiency', 30);

    // Get cost forecasts for next 7 days
    const forecasts = await predictiveAnalyticsService.generateCostForecast(organizationId, 7);

    // Get detected patterns
    const patterns = await predictiveAnalyticsService.detectPatterns(organizationId, 30);

    // Get optimization recommendations
    const optimizations = await predictiveAnalyticsService.generateOptimizationRecommendations(organizationId);

    // Format business insights from patterns and optimizations
    const businessInsights = formatBusinessInsights(patterns, optimizations, executiveMetrics);

    return NextResponse.json({
      executiveMetrics,
      performanceMetrics,
      trends: {
        cost: costTrend,
        usage: usageTrend,
        efficiency: efficiencyTrend
      },
      forecasts,
      patterns,
      optimizations,
      businessInsights,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching executive metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Format patterns and optimizations into business insights
 */
function formatBusinessInsights(
  patterns: any[],
  optimizations: any[],
  metrics: any
): Array<{
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  metric?: string;
}> {
  const insights: Array<{
    type: 'info' | 'success' | 'warning' | 'danger';
    title: string;
    message: string;
    metric?: string;
  }> = [];

  // Add efficiency insights
  if (metrics.efficiency > 80) {
    insights.push({
      type: 'success',
      title: 'Excellent Cost Efficiency',
      message: `Your organization is operating at ${metrics.efficiency.toFixed(1)}% efficiency, well above industry average`,
      metric: `${metrics.efficiency.toFixed(1)}%`
    });
  } else if (metrics.efficiency < 60) {
    insights.push({
      type: 'warning',
      title: 'Efficiency Improvement Needed',
      message: `Current efficiency at ${metrics.efficiency.toFixed(1)}%. Review optimization recommendations to improve`,
      metric: `${metrics.efficiency.toFixed(1)}%`
    });
  }

  // Add risk insights
  if (metrics.riskScore > 60) {
    insights.push({
      type: 'danger',
      title: 'High Financial Risk Detected',
      message: 'Consider implementing budget controls and diversifying AI providers',
      metric: `Risk: ${metrics.riskScore}`
    });
  } else if (metrics.riskScore < 30) {
    insights.push({
      type: 'success',
      title: 'Low Risk Profile',
      message: 'Your AI spending is well-controlled with good provider diversity',
      metric: `Risk: ${metrics.riskScore}`
    });
  }

  // Add savings insights
  if (metrics.savingsOpportunity > 100) {
    insights.push({
      type: 'info',
      title: 'Significant Savings Available',
      message: `Potential monthly savings of $${metrics.savingsOpportunity.toFixed(2)} identified through optimization`,
      metric: `$${metrics.savingsOpportunity.toFixed(2)}`
    });
  }

  // Add pattern insights
  const criticalPatterns = patterns.filter(p => p.impact === 'high');
  if (criticalPatterns.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Usage Patterns Detected',
      message: criticalPatterns[0].description,
      metric: 'Review'
    });
  }

  // Add optimization insights
  if (optimizations.length > 0 && optimizations[0].savingsPotential > 50) {
    insights.push({
      type: 'info',
      title: 'Top Optimization Opportunity',
      message: optimizations[0].recommendation,
      metric: `Save $${optimizations[0].savingsPotential.toFixed(2)}`
    });
  }

  // Add compliance insights
  if (metrics.complianceScore < 70) {
    insights.push({
      type: 'warning',
      title: 'Compliance Score Below Target',
      message: 'Configure budgets and alerts to improve governance',
      metric: `${metrics.complianceScore}%`
    });
  }

  // Add forecast accuracy insight
  if (metrics.forecastAccuracy > 85) {
    insights.push({
      type: 'success',
      title: 'Accurate Cost Forecasting',
      message: `Predictions are ${metrics.forecastAccuracy.toFixed(1)}% accurate based on historical data`,
      metric: `${metrics.forecastAccuracy.toFixed(1)}%`
    });
  }

  // Limit to top 6 insights
  return insights.slice(0, 6);
}