import { NextRequest, NextResponse } from 'next/server';
import { HealthCheckService } from '@/src/monitoring/health-checks';

// Public health check endpoint
export async function GET(request: NextRequest) {
  try {
    const healthService = new HealthCheckService();
    const health = await healthService.getSystemHealth();
    
    // Return appropriate status code based on health
    const statusCode = health.overall === 'healthy' ? 200 :
                      health.overall === 'degraded' ? 206 : 503;
    
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        overall: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date()
      },
      { status: 503 }
    );
  }
}