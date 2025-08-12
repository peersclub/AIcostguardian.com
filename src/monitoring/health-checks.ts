import { prisma } from '../../lib/prisma';
import Redis from 'ioredis';

export interface HealthStatus {
  provider: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  lastSuccess?: Date;
  error?: string;
  responseTime?: number;
  metrics?: {
    requestsPerMinute?: number;
    errorRate?: number;
    avgLatency?: number;
  };
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  providers: HealthStatus[];
  database: {
    status: 'healthy' | 'unhealthy';
    latency?: number;
  };
  cache: {
    status: 'healthy' | 'unhealthy';
    latency?: number;
  };
  timestamp: Date;
}

export class HealthCheckService {
  private redis: Redis;
  private checkInterval: NodeJS.Timeout | null = null;
  private alertWebhookUrl?: string;
  
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
    
    this.alertWebhookUrl = process.env.ALERT_WEBHOOK_URL;
  }
  
  async checkProviderHealth(): Promise<HealthStatus[]> {
    const providers = ['openai', 'anthropic', 'google', 'xai'];
    const results: HealthStatus[] = [];
    
    for (const provider of providers) {
      const status = await this.checkProvider(provider);
      results.push(status);
      
      // Alert if provider is unhealthy
      if (status.status === 'unhealthy') {
        await this.sendAlert({
          severity: 'high',
          provider,
          message: `${provider} API is not responding`,
          details: status.error
        });
      } else if (status.status === 'degraded') {
        await this.sendAlert({
          severity: 'medium',
          provider,
          message: `${provider} API is experiencing delays`,
          details: status.message
        });
      }
    }
    
    return results;
  }
  
  private async checkProvider(provider: string): Promise<HealthStatus> {
    try {
      // Check if provider has any API keys configured
      const apiKeys = await prisma.apiKey.findMany({
        where: { provider },
        take: 1
      });
      
      if (apiKeys.length === 0) {
        return {
          provider,
          status: 'unhealthy',
          message: 'No API keys configured for this provider'
        };
      }
      
      // Check recent usage to determine health
      const recentUsage = await prisma.usage.findFirst({
        where: { 
          provider,
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        orderBy: { timestamp: 'desc' }
      });
      
      if (!recentUsage) {
        return {
          provider,
          status: 'degraded',
          message: 'No recent usage data available',
        };
      }
      
      // Check for recent high costs or failures (simplified check)
      const recentHighCosts = await prisma.usage.count({
        where: {
          provider,
          cost: {
            gte: 1.0 // High cost threshold
          },
          timestamp: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
          }
        }
      });
      
      if (recentHighCosts > 5) {
        return {
          provider,
          status: 'unhealthy',
          message: `${recentHighCosts} high cost requests in the last hour`,
          lastSuccess: recentUsage.timestamp
        };
      }
      
      if (recentHighCosts > 0) {
        return {
          provider,
          status: 'degraded',
          message: `${recentHighCosts} high cost requests in the last hour`,
          lastSuccess: recentUsage.timestamp
        };
      }
      
      // Get metrics from Redis
      const metrics = await this.getProviderMetrics(provider);
      
      return {
        provider,
        status: 'healthy',
        message: 'Operating normally',
        lastSuccess: recentUsage.timestamp,
        metrics
      };
    } catch (error) {
      return {
        provider,
        status: 'unhealthy',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  private getExpectedInterval(provider: string): number {
    const intervals: Record<string, number> = {
      openai: 24 * 60 * 60 * 1000,     // 24 hours
      anthropic: 5 * 60 * 1000,         // 5 minutes
      google: 60 * 60 * 1000,           // 1 hour
      xai: 60 * 1000                    // 1 minute
    };
    
    return intervals[provider] || 60 * 60 * 1000;
  }
  
  private async getProviderMetrics(provider: string) {
    const keys = [
      `metrics:${provider}:requests:total`,
      `metrics:${provider}:errors:count`,
      `metrics:${provider}:latency:avg`
    ];
    
    const values = await this.redis.mget(...keys);
    
    return {
      requestsPerMinute: parseInt(values[0] || '0') / 60,
      errorRate: parseInt(values[1] || '0') / Math.max(1, parseInt(values[0] || '1')),
      avgLatency: parseFloat(values[2] || '0')
    };
  }
  
  async checkDatabaseHealth(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number }> {
    const startTime = Date.now();
    
    try {
      // Simple query to check database connectivity
      await prisma.$queryRaw`SELECT 1`;
      
      const latency = Date.now() - startTime;
      
      return {
        status: latency < 1000 ? 'healthy' : 'unhealthy',
        latency
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime
      };
    }
  }
  
  async checkCacheHealth(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number }> {
    const startTime = Date.now();
    
    try {
      // Simple ping to check Redis connectivity
      await this.redis.ping();
      
      const latency = Date.now() - startTime;
      
      return {
        status: latency < 100 ? 'healthy' : 'unhealthy',
        latency
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime
      };
    }
  }
  
  async getSystemHealth(): Promise<SystemHealth> {
    const [providers, database, cache] = await Promise.all([
      this.checkProviderHealth(),
      this.checkDatabaseHealth(),
      this.checkCacheHealth()
    ]);
    
    // Determine overall health
    const unhealthyProviders = providers.filter(p => p.status === 'unhealthy').length;
    const degradedProviders = providers.filter(p => p.status === 'degraded').length;
    
    let overall: 'healthy' | 'degraded' | 'unhealthy';
    
    if (database.status === 'unhealthy' || cache.status === 'unhealthy' || unhealthyProviders > 2) {
      overall = 'unhealthy';
    } else if (degradedProviders > 2 || unhealthyProviders > 0) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }
    
    return {
      overall,
      providers,
      database,
      cache,
      timestamp: new Date()
    };
  }
  
  private async sendAlert(alert: {
    severity: 'low' | 'medium' | 'high';
    provider?: string;
    message: string;
    details?: string;
  }) {
    try {
      // Get a system user for alerts
      const systemUser = await prisma.user.findFirst();
      if (!systemUser) {
        console.error('No user found for storing alerts');
        return;
      }

      // Store alert in database
      await prisma.alert.create({
        data: {
          userId: systemUser.id,
          type: 'HEALTH_CHECK',
          provider: alert.provider || 'system',
          message: alert.message,
          metadata: {
            severity: alert.severity,
            details: alert.details
          }
        }
      });
      
      // Send webhook if configured
      if (this.alertWebhookUrl) {
        await fetch(this.alertWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...alert,
            timestamp: new Date().toISOString()
          })
        });
      }
      
      // Log alert
      console.error(`[ALERT] ${alert.severity.toUpperCase()}: ${alert.message}`, alert.details);
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }
  
  startMonitoring(intervalMs: number = 60000) {
    // Run initial check
    this.runHealthCheck();
    
    // Set up recurring checks
    this.checkInterval = setInterval(() => {
      this.runHealthCheck();
    }, intervalMs);
    
    console.log(`Health monitoring started (interval: ${intervalMs}ms)`);
  }
  
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('Health monitoring stopped');
    }
  }
  
  private async runHealthCheck() {
    try {
      const health = await this.getSystemHealth();
      
      // Store health status in cache for quick access
      await this.redis.set(
        'system:health',
        JSON.stringify(health),
        'EX',
        120 // 2 minutes TTL
      );
      
      // Log if not healthy
      if (health.overall !== 'healthy') {
        console.warn(`System health: ${health.overall}`, {
          unhealthyProviders: health.providers.filter(p => p.status === 'unhealthy').map(p => p.provider),
          database: health.database.status,
          cache: health.cache.status
        });
      }
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }
  
  async getCostAlerts(userId: string, limit: number = 10): Promise<any[]> {
    return prisma.alert.findMany({
      where: {
        userId,
        isActive: true,
        type: 'HEALTH_CHECK'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
  }
  
  async resolveAlert(alertId: string) {
    await prisma.alert.update({
      where: { id: alertId },
      data: {
        isActive: false,
        metadata: {
          resolvedAt: new Date().toISOString()
        }
      }
    });
  }
}