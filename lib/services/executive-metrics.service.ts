/**
 * Executive Metrics Service
 * Calculates real-time executive dashboard metrics from actual usage data
 */

import { PrismaClient } from '@prisma/client';
import { subDays, startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();

export interface ExecutiveMetrics {
  efficiency: number;      // Cost efficiency percentage (0-100)
  riskScore: number;       // Financial risk score (0-100)
  forecastAccuracy: number;// Forecast accuracy percentage (0-100)
  savingsOpportunity: number; // Potential savings in USD
  complianceScore: number; // Compliance and governance score (0-100)
}

export interface TrendData {
  period: string;
  value: number;
  change: number;
  forecast?: number;
}

export interface PerformanceMetrics {
  responseTime: number;    // Average response time in ms
  availability: number;    // System availability percentage
  errorRate: number;       // Error rate percentage
  throughput: number;      // Requests per minute
}

class ExecutiveMetricsService {
  /**
   * Calculate executive metrics based on actual usage data
   */
  async calculateExecutiveMetrics(organizationId: string): Promise<ExecutiveMetrics> {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);
    
    // Get current period usage
    const currentUsage = await prisma.usageLog.aggregate({
      where: {
        organizationId,
        timestamp: { gte: thirtyDaysAgo, lte: now }
      },
      _sum: { cost: true, totalTokens: true },
      _count: true,
      _avg: { cost: true }
    });

    // Get previous period for comparison
    const previousUsage = await prisma.usageLog.aggregate({
      where: {
        organizationId,
        timestamp: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
      },
      _sum: { cost: true, totalTokens: true },
      _count: true,
      _avg: { cost: true }
    });

    // Get budget information
    const budgets = await prisma.budget.findMany({
      where: { organizationId }
    });

    // Get provider diversity
    const providerUsage = await prisma.usageLog.groupBy({
      by: ['provider'],
      where: {
        organizationId,
        timestamp: { gte: thirtyDaysAgo }
      },
      _sum: { cost: true },
      _count: true
    });

    // Calculate efficiency score (0-100)
    const efficiency = this.calculateEfficiencyScore(
      currentUsage,
      previousUsage,
      providerUsage
    );

    // Calculate risk score (0-100, lower is better)
    const riskScore = await this.calculateRiskScore(
      currentUsage,
      budgets,
      providerUsage
    );

    // Calculate forecast accuracy
    const forecastAccuracy = await this.calculateForecastAccuracy(
      organizationId,
      thirtyDaysAgo,
      now
    );

    // Calculate potential savings
    const savingsOpportunity = this.calculateSavingsOpportunity(
      currentUsage,
      providerUsage
    );

    // Calculate compliance score
    const complianceScore = await this.calculateComplianceScore(
      organizationId,
      budgets
    );

    return {
      efficiency: Math.round(efficiency * 10) / 10,
      riskScore: Math.round(riskScore * 10) / 10,
      forecastAccuracy: Math.round(forecastAccuracy * 10) / 10,
      savingsOpportunity,
      complianceScore: Math.round(complianceScore * 10) / 10
    };
  }

  /**
   * Calculate efficiency score based on cost trends and optimization
   */
  private calculateEfficiencyScore(
    current: any,
    previous: any,
    providerUsage: any[]
  ): number {
    let score = 50; // Base score

    // Improvement in cost per request
    if (current._count > 0 && previous._count > 0) {
      const currentCostPerRequest = (current._sum.cost || 0) / current._count;
      const previousCostPerRequest = (previous._sum.cost || 0) / previous._count;
      
      if (previousCostPerRequest > 0) {
        const improvement = ((previousCostPerRequest - currentCostPerRequest) / previousCostPerRequest) * 100;
        score += Math.min(30, Math.max(-30, improvement)); // ±30 points for cost improvement
      }
    }

    // Provider optimization (using cheaper providers)
    const totalCost = providerUsage.reduce((sum, p) => sum + (p._sum.cost || 0), 0);
    if (totalCost > 0) {
      const providerScores: { [key: string]: number } = {
        'gemini': 1.0,    // Most cost-effective
        'claude': 0.8,
        'grok': 0.7,
        'openai': 0.6     // Most expensive
      };

      let weightedScore = 0;
      for (const usage of providerUsage) {
        const weight = (usage._sum.cost || 0) / totalCost;
        const providerScore = providerScores[usage.provider] || 0.5;
        weightedScore += weight * providerScore * 20; // Max 20 points
      }
      score += weightedScore;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate financial risk score
   */
  private async calculateRiskScore(
    usage: any,
    budgets: any[],
    providerUsage: any[]
  ): Promise<number> {
    let riskScore = 0;

    // Budget overrun risk
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const currentSpend = usage._sum.cost || 0;
    
    if (totalBudget > 0) {
      const budgetUtilization = (currentSpend / totalBudget) * 100;
      if (budgetUtilization > 90) riskScore += 40;
      else if (budgetUtilization > 75) riskScore += 25;
      else if (budgetUtilization > 50) riskScore += 10;
    } else {
      riskScore += 30; // No budget set is risky
    }

    // Provider concentration risk
    const providerCount = providerUsage.length;
    if (providerCount === 1) {
      riskScore += 30; // High risk: single provider dependency
    } else if (providerCount === 2) {
      riskScore += 15; // Medium risk
    }

    // Spending volatility risk
    if (usage._count > 10) {
      const avgCost = usage._avg.cost || 0;
      const variance = await this.calculateCostVariance(usage.organizationId, 30);
      if (variance > avgCost * 2) riskScore += 20; // High volatility
      else if (variance > avgCost) riskScore += 10;
    }

    // Compliance risk
    const hasAlerts = await prisma.notification.count({
      where: {
        organizationId: usage.organizationId,
        type: 'COST_THRESHOLD_EXCEEDED',
        createdAt: { gte: subDays(new Date(), 30) }
      }
    });
    if (hasAlerts > 5) riskScore += 10;

    return Math.min(100, Math.max(0, riskScore));
  }

  /**
   * Calculate forecast accuracy based on predictions vs actual
   */
  private async calculateForecastAccuracy(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Get daily usage for the period
    const dailyUsage = await prisma.usageLog.groupBy({
      by: ['timestamp'],
      where: {
        organizationId,
        timestamp: { gte: startDate, lte: endDate }
      },
      _sum: { cost: true }
    });

    if (dailyUsage.length < 7) {
      return 75; // Default accuracy for insufficient data
    }

    // Simple moving average forecast
    let totalError = 0;
    let predictions = 0;

    for (let i = 7; i < dailyUsage.length; i++) {
      // Use previous 7 days to predict next day
      const previousWeek = dailyUsage.slice(i - 7, i);
      const predicted = previousWeek.reduce((sum, day) => sum + (day._sum.cost || 0), 0) / 7;
      const actual = dailyUsage[i]._sum.cost || 0;
      
      if (actual > 0) {
        const error = Math.abs(predicted - actual) / actual;
        totalError += error;
        predictions++;
      }
    }

    if (predictions === 0) return 75;

    const avgError = totalError / predictions;
    const accuracy = Math.max(0, (1 - avgError)) * 100;

    return Math.min(100, Math.max(50, accuracy));
  }

  /**
   * Calculate potential savings opportunity
   */
  private calculateSavingsOpportunity(
    usage: any,
    providerUsage: any[]
  ): number {
    const currentMonthlySpend = usage._sum.cost || 0;
    
    if (currentMonthlySpend === 0) return 0;

    let potentialSavings = 0;

    // Calculate savings by optimizing provider mix
    const providerCosts: { [key: string]: number } = {
      'openai': 1.0,      // Baseline
      'claude': 0.85,     // 15% cheaper
      'grok': 0.75,       // 25% cheaper
      'gemini': 0.65      // 35% cheaper
    };

    for (const provider of providerUsage) {
      const currentCost = provider._sum.cost || 0;
      const currentRate = providerCosts[provider.provider] || 1.0;
      const optimalRate = 0.65; // Gemini rate
      
      if (currentRate > optimalRate) {
        const savings = currentCost * (1 - optimalRate / currentRate);
        potentialSavings += savings;
      }
    }

    // Add savings from usage optimization (assume 10% reduction possible)
    potentialSavings += currentMonthlySpend * 0.1;

    return Math.round(potentialSavings * 100) / 100;
  }

  /**
   * Calculate compliance and governance score
   */
  private async calculateComplianceScore(
    organizationId: string,
    budgets: any[]
  ): Promise<number> {
    let score = 100; // Start with perfect score

    // Check for API key management
    const apiKeys = await prisma.apiKey.count({
      where: { organizationId }
    });
    if (apiKeys === 0) score -= 30; // No API keys configured

    // Check for budget controls
    if (budgets.length === 0) score -= 20; // No budgets set

    // Check for alerts configuration
    const alerts = await prisma.notification.count({
      where: { 
        organizationId,
        type: { in: ['COST_THRESHOLD_WARNING', 'COST_THRESHOLD_EXCEEDED'] }
      }
    });
    if (alerts === 0) score -= 15; // No alerts configured

    // Check for regular usage (data freshness)
    const recentUsage = await prisma.usageLog.findFirst({
      where: { organizationId },
      orderBy: { timestamp: 'desc' }
    });
    
    if (recentUsage) {
      const daysSinceLastUsage = Math.floor(
        (Date.now() - recentUsage.timestamp.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastUsage > 7) score -= 10;
      else if (daysSinceLastUsage > 3) score -= 5;
    }

    // Check for team collaboration
    const teamMembers = await prisma.user.count({
      where: { organizationId }
    });
    if (teamMembers === 1) score -= 10; // Single user, no collaboration

    return Math.max(0, score);
  }

  /**
   * Calculate cost variance for volatility analysis
   */
  private async calculateCostVariance(
    organizationId: string,
    days: number
  ): Promise<number> {
    const startDate = subDays(new Date(), days);
    
    const dailyCosts = await prisma.usageLog.groupBy({
      by: ['timestamp'],
      where: {
        organizationId,
        timestamp: { gte: startDate }
      },
      _sum: { cost: true }
    });

    if (dailyCosts.length < 2) return 0;

    const costs = dailyCosts.map(d => d._sum.cost || 0);
    const mean = costs.reduce((sum, c) => sum + c, 0) / costs.length;
    const variance = costs.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / costs.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(organizationId: string): Promise<PerformanceMetrics> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Get recent usage for performance calculations
    const recentUsage = await prisma.usageLog.findMany({
      where: {
        organizationId,
        timestamp: { gte: oneHourAgo }
      },
      select: {
        metadata: true,
        cost: true,
        timestamp: true
      }
    });

    // Calculate metrics from metadata or use defaults
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    let errors = 0;

    for (const usage of recentUsage) {
      const metadata = usage.metadata as any;
      
      // Extract response time from metadata if available
      if (metadata?.responseTime) {
        totalResponseTime += metadata.responseTime;
        responseTimeCount++;
      }
      
      // Check for errors in metadata
      if (metadata?.error === true || metadata?.status === 'error') {
        errors++;
      }
    }

    // Calculate average response time
    const responseTime = responseTimeCount > 0
      ? totalResponseTime / responseTimeCount
      : 250; // Default

    const errorRate = recentUsage.length > 0
      ? (errors / recentUsage.length) * 100
      : 0;

    const throughput = recentUsage.length; // Requests in last hour

    // Calculate availability (simplified - based on error rate)
    const availability = Math.max(0, 100 - errorRate);

    return {
      responseTime: Math.round(responseTime),
      availability: Math.round(availability * 10) / 10,
      errorRate: Math.round(errorRate * 100) / 100,
      throughput: Math.round(throughput / 60 * 10) / 10 // Per minute
    };
  }

  /**
   * Get trend data for charts
   */
  async getTrendData(
    organizationId: string,
    metric: 'cost' | 'usage' | 'efficiency',
    days: number = 30
  ): Promise<TrendData[]> {
    const data: TrendData[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const startOfDate = startOfDay(date);
      const endOfDate = endOfDay(date);

      const dayUsage = await prisma.usageLog.aggregate({
        where: {
          organizationId,
          timestamp: { gte: startOfDate, lte: endOfDate }
        },
        _sum: { cost: true, totalTokens: true },
        _count: true
      });

      const value = metric === 'cost' 
        ? dayUsage._sum.cost || 0
        : metric === 'usage'
        ? dayUsage._count
        : this.calculateDailyEfficiency(dayUsage);

      // Calculate change from previous day
      const change = i < days - 1 && data.length > 0
        ? ((value - data[data.length - 1].value) / data[data.length - 1].value) * 100
        : 0;

      data.push({
        period: date.toISOString().split('T')[0],
        value: Math.round(value * 100) / 100,
        change: Math.round(change * 10) / 10,
        forecast: i === 0 ? this.forecastNextValue(data, value) : undefined
      });
    }

    return data;
  }

  /**
   * Calculate daily efficiency score
   */
  private calculateDailyEfficiency(usage: any): number {
    if (usage._count === 0) return 0;
    
    const costPerRequest = (usage._sum.cost || 0) / usage._count;
    const tokensPerRequest = (usage._sum.totalTokens || 0) / usage._count;
    
    // Efficiency based on cost and token optimization
    const costEfficiency = Math.max(0, 100 - (costPerRequest * 100));
    const tokenEfficiency = Math.max(0, 100 - (tokensPerRequest / 10000 * 100));
    
    return (costEfficiency + tokenEfficiency) / 2;
  }

  /**
   * Simple forecast for next value
   */
  private forecastNextValue(historicalData: TrendData[], currentValue: number): number {
    if (historicalData.length < 3) return currentValue;

    // Simple linear regression for forecast
    const recentData = historicalData.slice(-7); // Last 7 days
    const trend = recentData.reduce((sum, d, i) => {
      if (i === 0) return 0;
      return sum + (d.value - recentData[i - 1].value);
    }, 0) / (recentData.length - 1);

    return Math.max(0, currentValue + trend);
  }
}

export const executiveMetricsService = new ExecutiveMetricsService();