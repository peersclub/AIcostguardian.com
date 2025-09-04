import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { usageFetchService } from '@/lib/services/usage-fetch.service';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user and organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    });
    
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'User or organization not found' }, { status: 404 });
    }
    
    // Check if user has permission (could add role check here)
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Get request body for optional parameters
    const body = await request.json().catch(() => ({}));
    const { startDate, endDate, providers } = body;
    
    // Run the backfill
    console.log(`Starting usage backfill for user ${user.email}`);
    const result = await usageFetchService.backfillUsageData(
      user.id,
      user.organizationId
    );
    
    // Get updated statistics
    const stats = await prisma.usageLog.aggregate({
      where: {
        organizationId: user.organizationId
      },
      _count: true,
      _sum: {
        cost: true,
        totalTokens: true
      }
    });
    
    return NextResponse.json({
      success: result.success,
      recordsAdded: result.recordsAdded,
      errors: result.errors,
      totalRecords: stats._count,
      totalCost: stats._sum.cost || 0,
      totalTokens: stats._sum.totalTokens || 0,
      message: result.recordsAdded > 0 
        ? `Successfully added ${result.recordsAdded} usage records`
        : 'No new usage records found to backfill'
    });
    
  } catch (error) {
    console.error('Backfill API error:', error);
    return NextResponse.json(
      { error: 'Failed to backfill usage data' },
      { status: 500 }
    );
  }
}

// GET endpoint to check backfill status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user and organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        organization: true,
        apiKeys: true
      }
    });
    
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'User or organization not found' }, { status: 404 });
    }
    
    // Get current usage statistics
    const stats = await prisma.usageLog.aggregate({
      where: {
        organizationId: user.organizationId
      },
      _count: true,
      _sum: {
        cost: true,
        totalTokens: true
      }
    });
    
    // Get provider breakdown
    const providerStats = await prisma.usageLog.groupBy({
      by: ['provider'],
      where: {
        organizationId: user.organizationId
      },
      _count: true,
      _sum: {
        cost: true,
        totalTokens: true
      }
    });
    
    return NextResponse.json({
      status: 'ready',
      apiKeysConfigured: user.apiKeys.length,
      providers: user.apiKeys.map(k => k.provider),
      currentStats: {
        totalRecords: stats._count,
        totalCost: stats._sum.cost || 0,
        totalTokens: stats._sum.totalTokens || 0
      },
      providerBreakdown: providerStats.map(p => ({
        provider: p.provider,
        records: p._count,
        cost: p._sum.cost || 0,
        tokens: p._sum.totalTokens || 0
      })),
      backfillAvailable: {
        openai: 'Limited historical data via API',
        claude: 'No historical API - future tracking only',
        gemini: 'Via Google Cloud Console only',
        grok: 'API endpoints not documented'
      }
    });
    
  } catch (error) {
    console.error('Backfill status error:', error);
    return NextResponse.json(
      { error: 'Failed to get backfill status' },
      { status: 500 }
    );
  }
}