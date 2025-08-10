import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from "@sentry/nextjs"
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return await Sentry.withServerActionInstrumentation(
    "health-check",
    {
      recordResponse: true,
    },
    async () => {
      try {
        // Check database connection
        const dbHealthy = await checkDatabase()
        
        // Check environment variables
        const envHealthy = checkEnvironment()
        
        // Overall health status
        const isHealthy = dbHealthy && envHealthy
        
        const response = {
          status: isHealthy ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString(),
          checks: {
            database: dbHealthy ? 'connected' : 'disconnected',
            environment: envHealthy ? 'configured' : 'missing variables',
            sentry: process.env.NODE_ENV === 'production' ? 'enabled' : 'disabled (dev mode)',
          },
          version: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
          environment: process.env.NODE_ENV || 'development',
        }
        
        // Log to Sentry if unhealthy
        if (!isHealthy) {
          Sentry.captureMessage('Health check failed', {
            level: 'warning',
            extra: response,
          })
        }
        
        return NextResponse.json(response, { 
          status: isHealthy ? 200 : 503 
        })
      } catch (error) {
        // Capture error to Sentry
        Sentry.captureException(error, {
          tags: {
            endpoint: 'health-check',
          },
        })
        
        return NextResponse.json(
          { 
            status: 'error',
            message: 'Health check failed',
            error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal error'
          },
          { status: 500 }
        )
      }
    }
  )
}

async function checkDatabase(): Promise<boolean> {
  try {
    // Skip during build
    if (!process.env.DATABASE_URL || process.env.NEXT_PHASE === 'phase-production-build') {
      return false
    }
    
    // Try to execute a simple query
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        check: 'database',
      },
    })
    return false
  }
}

function checkEnvironment(): boolean {
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
  ]
  
  const missingVars = requiredVars.filter(v => !process.env[v])
  
  if (missingVars.length > 0) {
    Sentry.captureMessage('Missing environment variables', {
      level: 'warning',
      extra: {
        missing: missingVars,
      },
    })
    return false
  }
  
  return true
}