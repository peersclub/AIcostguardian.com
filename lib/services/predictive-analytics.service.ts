/**
 * Predictive Analytics Service
 * Advanced forecasting and pattern detection for AI usage and costs
 */

import { PrismaClient } from '@prisma/client';
import { subDays, addDays, startOfDay, endOfDay, format } from 'date-fns';

const prisma = new PrismaClient();

export interface Forecast {
  date: Date;
  predictedCost: number;
  confidence: number;
  lowerBound: number;
  upperBound: number;
  factors: string[];
}

export interface Pattern {
  type: 'spike' | 'dip' | 'trend' | 'seasonal' | 'anomaly';
  description: string;
  impact: 'high' | 'medium' | 'low';
  startDate: Date;
  endDate?: Date;
  value: number;
  recommendation?: string;
}

export interface CostOptimization {
  provider: string;
  currentCost: number;
  optimalCost: number;
  savingsPotential: number;
  recommendation: string;
  confidence: number;
}

export interface UsageAnomaly {
  timestamp: Date;
  provider: string;
  actual: number;
  expected: number;
  deviation: number;
  severity: 'critical' | 'warning' | 'info';
  possibleCause?: string;
}

class PredictiveAnalyticsService {
  /**
   * Generate cost forecasts for the next N days
   */
  async generateCostForecast(
    organizationId: string,
    daysToForecast: number = 30
  ): Promise<Forecast[]> {
    // Get historical data (90 days for better prediction)
    const historicalDays = 90;
    const startDate = subDays(new Date(), historicalDays);
    
    const historicalData = await this.getHistoricalDailyData(
      organizationId,
      startDate,
      new Date()
    );

    if (historicalData.length < 7) {
      // Not enough data for reliable prediction
      return this.generateDefaultForecast(daysToForecast);
    }

    const forecasts: Forecast[] = [];
    const today = new Date();

    // Analyze patterns in historical data
    const weeklyPattern = this.detectWeeklyPattern(historicalData);
    const trend = this.calculateTrend(historicalData);
    const volatility = this.calculateVolatility(historicalData);

    for (let i = 1; i <= daysToForecast; i++) {
      const forecastDate = addDays(today, i);
      const dayOfWeek = forecastDate.getDay();
      
      // Base prediction using multiple methods
      const movingAverage = this.movingAveragePrediction(historicalData, 7);
      const trendPrediction = this.trendBasedPrediction(trend, i);
      const seasonalPrediction = weeklyPattern[dayOfWeek] || movingAverage;
      
      // Weighted ensemble prediction
      const predictedCost = 
        movingAverage * 0.3 +
        trendPrediction * 0.3 +
        seasonalPrediction * 0.4;

      // Calculate confidence based on data quality and volatility
      const confidence = this.calculateConfidence(
        historicalData.length,
        volatility,
        i
      );

      // Calculate prediction bounds
      const margin = predictedCost * volatility * (i / 10); // Wider bounds for further predictions
      const lowerBound = Math.max(0, predictedCost - margin);
      const upperBound = predictedCost + margin;

      // Identify influencing factors
      const factors = this.identifyInfluencingFactors(
        dayOfWeek,
        trend,
        i,
        historicalData
      );

      forecasts.push({
        date: forecastDate,
        predictedCost: Math.round(predictedCost * 100) / 100,
        confidence: Math.round(confidence * 100) / 100,
        lowerBound: Math.round(lowerBound * 100) / 100,
        upperBound: Math.round(upperBound * 100) / 100,
        factors
      });
    }

    return forecasts;
  }

  /**
   * Detect usage patterns and anomalies
   */
  async detectPatterns(
    organizationId: string,
    lookbackDays: number = 30
  ): Promise<Pattern[]> {
    const patterns: Pattern[] = [];
    const startDate = subDays(new Date(), lookbackDays);
    
    const dailyData = await this.getHistoricalDailyData(
      organizationId,
      startDate,
      new Date()
    );

    if (dailyData.length < 7) return patterns;

    // Detect trend patterns
    const trend = this.calculateTrend(dailyData);
    if (Math.abs(trend.slope) > 0.1) {
      patterns.push({
        type: 'trend',
        description: trend.slope > 0 
          ? `Costs increasing by $${Math.abs(trend.slope).toFixed(2)}/day`
          : `Costs decreasing by $${Math.abs(trend.slope).toFixed(2)}/day`,
        impact: Math.abs(trend.slope) > 1 ? 'high' : 'medium',
        startDate: startDate,
        value: trend.slope,
        recommendation: trend.slope > 0
          ? 'Consider optimizing model selection or implementing usage limits'
          : 'Current optimization strategies are working well'
      });
    }

    // Detect spikes and dips
    const spikesAndDips = this.detectSpikesAndDips(dailyData);
    patterns.push(...spikesAndDips);

    // Detect weekly seasonality
    const weeklyPattern = this.detectWeeklyPattern(dailyData);
    const hasWeeklyPattern = this.hasSignificantWeeklyPattern(weeklyPattern);
    if (hasWeeklyPattern) {
      const peakDay = this.findPeakDay(weeklyPattern);
      const lowDay = this.findLowDay(weeklyPattern);
      
      patterns.push({
        type: 'seasonal',
        description: `Weekly pattern detected: Peak on ${this.getDayName(peakDay)}, Low on ${this.getDayName(lowDay)}`,
        impact: 'medium',
        startDate: startDate,
        value: weeklyPattern[peakDay] - weeklyPattern[lowDay],
        recommendation: 'Consider scheduling heavy workloads during low-cost periods'
      });
    }

    // Detect anomalies
    const anomalies = await this.detectAnomalies(organizationId, dailyData);
    for (const anomaly of anomalies) {
      if (anomaly.severity === 'critical') {
        patterns.push({
          type: 'anomaly',
          description: `Unusual ${anomaly.deviation > 0 ? 'spike' : 'drop'} in ${anomaly.provider} usage`,
          impact: 'high',
          startDate: anomaly.timestamp,
          value: anomaly.actual,
          recommendation: anomaly.possibleCause
        });
      }
    }

    return patterns;
  }

  /**
   * Generate optimization recommendations
   */
  async generateOptimizationRecommendations(
    organizationId: string
  ): Promise<CostOptimization[]> {
    const recommendations: CostOptimization[] = [];
    const thirtyDaysAgo = subDays(new Date(), 30);

    // Get provider usage statistics
    const providerStats = await prisma.usageLog.groupBy({
      by: ['provider', 'model'],
      where: {
        organizationId,
        timestamp: { gte: thirtyDaysAgo }
      },
      _sum: { cost: true, totalTokens: true },
      _count: true,
      _avg: { cost: true }
    });

    // Cost efficiency by provider
    const providerEfficiency: { [key: string]: number } = {
      'gemini': 1.0,      // Most efficient
      'claude': 0.85,
      'grok': 0.75,
      'openai': 0.6       // Least efficient
    };

    // Model capabilities mapping
    const modelCapabilities: { [key: string]: string[] } = {
      'gpt-4': ['complex-reasoning', 'code-generation', 'analysis'],
      'gpt-3.5-turbo': ['general-chat', 'simple-tasks'],
      'claude-3-opus': ['complex-reasoning', 'creative-writing'],
      'claude-3-sonnet': ['balanced-tasks', 'code-review'],
      'gemini-pro': ['multimodal', 'cost-effective'],
      'grok-beta': ['real-time-data', 'humor']
    };

    // Group by provider
    const providerTotals = new Map<string, number>();
    for (const stat of providerStats) {
      const current = providerTotals.get(stat.provider) || 0;
      providerTotals.set(stat.provider, current + (stat._sum.cost || 0));
    }

    // Generate recommendations for each provider
    for (const [provider, currentCost] of Array.from(providerTotals.entries())) {
      const efficiency = providerEfficiency[provider] || 0.7;
      const optimalEfficiency = 1.0;
      
      if (efficiency < optimalEfficiency) {
        const optimalCost = currentCost * (efficiency / optimalEfficiency);
        const savings = currentCost - optimalCost;
        
        recommendations.push({
          provider,
          currentCost: Math.round(currentCost * 100) / 100,
          optimalCost: Math.round(optimalCost * 100) / 100,
          savingsPotential: Math.round(savings * 100) / 100,
          recommendation: this.generateProviderRecommendation(provider, providerStats),
          confidence: 0.75 + (efficiency * 0.25)
        });
      }
    }

    // Add task-specific optimizations
    const taskOptimizations = await this.analyzeTaskPatterns(organizationId);
    recommendations.push(...taskOptimizations);

    return recommendations.sort((a, b) => b.savingsPotential - a.savingsPotential);
  }

  /**
   * Detect usage anomalies
   */
  private async detectAnomalies(
    organizationId: string,
    dailyData: any[]
  ): Promise<UsageAnomaly[]> {
    const anomalies: UsageAnomaly[] = [];
    
    if (dailyData.length < 14) return anomalies; // Need at least 2 weeks

    // Calculate statistics for anomaly detection
    const costs = dailyData.map(d => d.cost);
    const mean = costs.reduce((sum, c) => sum + c, 0) / costs.length;
    const stdDev = Math.sqrt(
      costs.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / costs.length
    );

    // Z-score based anomaly detection
    for (let i = 0; i < dailyData.length; i++) {
      const zScore = Math.abs((dailyData[i].cost - mean) / stdDev);
      
      if (zScore > 3) {
        // Severe anomaly (3 standard deviations)
        anomalies.push({
          timestamp: dailyData[i].date,
          provider: dailyData[i].provider || 'all',
          actual: dailyData[i].cost,
          expected: mean,
          deviation: ((dailyData[i].cost - mean) / mean) * 100,
          severity: 'critical',
          possibleCause: this.inferAnomalyCause(dailyData[i], mean)
        });
      } else if (zScore > 2) {
        // Moderate anomaly
        anomalies.push({
          timestamp: dailyData[i].date,
          provider: dailyData[i].provider || 'all',
          actual: dailyData[i].cost,
          expected: mean,
          deviation: ((dailyData[i].cost - mean) / mean) * 100,
          severity: 'warning',
          possibleCause: this.inferAnomalyCause(dailyData[i], mean)
        });
      }
    }

    return anomalies;
  }

  /**
   * Get historical daily data
   */
  private async getHistoricalDailyData(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    const dailyData = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayStart = startOfDay(currentDate);
      const dayEnd = endOfDay(currentDate);

      const dayStats = await prisma.usageLog.aggregate({
        where: {
          organizationId,
          timestamp: { gte: dayStart, lte: dayEnd }
        },
        _sum: { cost: true, totalTokens: true },
        _count: true
      });

      dailyData.push({
        date: new Date(currentDate),
        cost: dayStats._sum.cost || 0,
        tokens: dayStats._sum.totalTokens || 0,
        requests: dayStats._count
      });

      currentDate = addDays(currentDate, 1);
    }

    return dailyData;
  }

  /**
   * Calculate trend using linear regression
   */
  private calculateTrend(data: any[]): { slope: number; intercept: number } {
    if (data.length < 2) return { slope: 0, intercept: 0 };

    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data.map(d => d.cost);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  /**
   * Detect weekly pattern
   */
  private detectWeeklyPattern(data: any[]): number[] {
    const pattern = new Array(7).fill(0);
    const counts = new Array(7).fill(0);

    for (const day of data) {
      const dayOfWeek = day.date.getDay();
      pattern[dayOfWeek] += day.cost;
      counts[dayOfWeek]++;
    }

    // Calculate average for each day of week
    for (let i = 0; i < 7; i++) {
      if (counts[i] > 0) {
        pattern[i] = pattern[i] / counts[i];
      }
    }

    return pattern;
  }

  /**
   * Calculate volatility (standard deviation)
   */
  private calculateVolatility(data: any[]): number {
    if (data.length < 2) return 0.1;

    const costs = data.map(d => d.cost);
    const mean = costs.reduce((sum, c) => sum + c, 0) / costs.length;
    const variance = costs.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / costs.length;
    const stdDev = Math.sqrt(variance);

    return mean > 0 ? stdDev / mean : 0.1; // Coefficient of variation
  }

  /**
   * Moving average prediction
   */
  private movingAveragePrediction(data: any[], window: number): number {
    if (data.length < window) {
      return data.length > 0 
        ? data.reduce((sum, d) => sum + d.cost, 0) / data.length
        : 0;
    }

    const recentData = data.slice(-window);
    return recentData.reduce((sum, d) => sum + d.cost, 0) / window;
  }

  /**
   * Trend-based prediction
   */
  private trendBasedPrediction(trend: { slope: number; intercept: number }, daysAhead: number): number {
    return Math.max(0, trend.intercept + trend.slope * daysAhead);
  }

  /**
   * Calculate prediction confidence
   */
  private calculateConfidence(dataPoints: number, volatility: number, daysAhead: number): number {
    let confidence = 100;

    // Reduce confidence based on data availability
    if (dataPoints < 30) confidence -= (30 - dataPoints);
    
    // Reduce confidence based on volatility
    confidence -= volatility * 100;
    
    // Reduce confidence for further predictions
    confidence -= daysAhead * 2;

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Identify factors influencing the forecast
   */
  private identifyInfluencingFactors(
    dayOfWeek: number,
    trend: { slope: number },
    daysAhead: number,
    historicalData: any[]
  ): string[] {
    const factors: string[] = [];

    // Day of week effect
    const dayName = this.getDayName(dayOfWeek);
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      factors.push(`Weekend (${dayName})`);
    } else if (dayOfWeek === 1) {
      factors.push('Monday (typically higher usage)');
    } else if (dayOfWeek === 5) {
      factors.push('Friday (end of week)');
    }

    // Trend effect
    if (trend.slope > 0.5) {
      factors.push('Strong upward trend');
    } else if (trend.slope < -0.5) {
      factors.push('Strong downward trend');
    }

    // Confidence factors
    if (daysAhead > 14) {
      factors.push('Long-range forecast (lower confidence)');
    }

    // Historical patterns
    if (historicalData.length < 30) {
      factors.push('Limited historical data');
    }

    return factors;
  }

  /**
   * Generate default forecast when insufficient data
   */
  private generateDefaultForecast(days: number): Forecast[] {
    const forecasts: Forecast[] = [];
    const baselineCost = 10; // Default baseline

    for (let i = 1; i <= days; i++) {
      forecasts.push({
        date: addDays(new Date(), i),
        predictedCost: baselineCost,
        confidence: 25,
        lowerBound: baselineCost * 0.5,
        upperBound: baselineCost * 2,
        factors: ['Insufficient historical data', 'Using baseline estimates']
      });
    }

    return forecasts;
  }

  /**
   * Detect spikes and dips in data
   */
  private detectSpikesAndDips(data: any[]): Pattern[] {
    const patterns: Pattern[] = [];
    if (data.length < 3) return patterns;

    const movingAvg = this.movingAveragePrediction(data, Math.min(7, data.length));

    for (let i = 1; i < data.length - 1; i++) {
      const current = data[i].cost;
      const deviation = ((current - movingAvg) / movingAvg) * 100;

      if (deviation > 50) {
        patterns.push({
          type: 'spike',
          description: `Cost spike of ${Math.round(deviation)}% above average`,
          impact: deviation > 100 ? 'high' : 'medium',
          startDate: data[i].date,
          value: current,
          recommendation: 'Review usage logs for this period to identify cause'
        });
      } else if (deviation < -50) {
        patterns.push({
          type: 'dip',
          description: `Cost dip of ${Math.round(Math.abs(deviation))}% below average`,
          impact: 'low',
          startDate: data[i].date,
          value: current
        });
      }
    }

    return patterns;
  }

  /**
   * Check if weekly pattern is significant
   */
  private hasSignificantWeeklyPattern(pattern: number[]): boolean {
    const max = Math.max(...pattern);
    const min = Math.min(...pattern.filter(p => p > 0));
    return min > 0 && (max / min) > 1.5; // 50% variation
  }

  /**
   * Helper functions
   */
  private getDayName(day: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  }

  private findPeakDay(pattern: number[]): number {
    return pattern.indexOf(Math.max(...pattern));
  }

  private findLowDay(pattern: number[]): number {
    const filtered = pattern.filter(p => p > 0);
    return pattern.indexOf(Math.min(...filtered));
  }

  private inferAnomalyCause(data: any, mean: number): string {
    if (data.cost > mean * 3) {
      return 'Possible batch processing or automated job';
    } else if (data.cost < mean * 0.1) {
      return 'Possible service outage or maintenance';
    } else if (data.requests > 100) {
      return 'High request volume detected';
    }
    return 'Unusual usage pattern detected';
  }

  private generateProviderRecommendation(provider: string, stats: any[]): string {
    switch (provider) {
      case 'openai':
        return 'Consider using GPT-3.5-Turbo for simpler tasks, or switch to Gemini for cost savings';
      case 'claude':
        return 'Optimize by using Claude Haiku for quick tasks, Opus only for complex reasoning';
      case 'grok':
        return 'Good balance of cost and performance, consider for real-time data tasks';
      case 'gemini':
        return 'Already using most cost-effective provider, consider expanding usage';
      default:
        return 'Review usage patterns to optimize model selection';
    }
  }

  private async analyzeTaskPatterns(organizationId: string): Promise<CostOptimization[]> {
    const optimizations: CostOptimization[] = [];
    
    // Analyze usage by time of day
    const hourlyUsage = await prisma.usageLog.groupBy({
      by: ['provider'],
      where: {
        organizationId,
        timestamp: { gte: subDays(new Date(), 30) }
      },
      _sum: { cost: true },
      _count: true
    });

    // Add batch processing recommendation if high volume
    const totalRequests = hourlyUsage.reduce((sum, h) => sum + h._count, 0);
    if (totalRequests > 1000) {
      optimizations.push({
        provider: 'batch-processing',
        currentCost: 100, // Placeholder
        optimalCost: 70,
        savingsPotential: 30,
        recommendation: 'Consider batching similar requests to reduce API calls and costs',
        confidence: 0.8
      });
    }

    return optimizations;
  }
}

export const predictiveAnalyticsService = new PredictiveAnalyticsService();