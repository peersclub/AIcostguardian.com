import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { proxyMiddleware } from '@/lib/services/proxy-middleware.service';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering - critical for proxy
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/proxy/ai
 * Main proxy endpoint for all AI API calls
 * Tracks usage in real-time as per PRODUCT_KNOWLEDGE.md Priority 1
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 2. Get user and organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    });
    
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'User or organization not found' }, { status: 404 });
    }
    
    // 3. Parse request body
    const body = await request.json();
    const { provider, model, endpoint, method = 'POST', headers = {}, data } = body;
    
    // 4. Validate required fields
    if (!provider || !model || !endpoint) {
      return NextResponse.json(
        { error: 'Missing required fields: provider, model, endpoint' },
        { status: 400 }
      );
    }
    
    // 5. Validate provider is supported
    const supportedProviders = ['openai', 'claude', 'gemini', 'grok'];
    if (!supportedProviders.includes(provider)) {
      return NextResponse.json(
        { error: `Unsupported provider: ${provider}` },
        { status: 400 }
      );
    }
    
    // 6. Make proxied request with tracking
    const result = await proxyMiddleware.proxyRequest({
      provider,
      model,
      endpoint,
      method,
      headers,
      body: data,
      userId: user.id,
      organizationId: user.organizationId
    });
    
    // 7. Return response with usage data
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        usage: result.usage,
        tracked: true, // Indicate that usage was tracked
        message: 'Request completed and usage tracked'
      });
    } else {
      return NextResponse.json(
        { 
          error: result.error || 'Proxy request failed',
          tracked: false 
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Proxy API error:', error);
    return NextResponse.json(
      { error: 'Internal proxy error', tracked: false },
      { status: 500 }
    );
  }
}

/**
 * GET /api/proxy/ai
 * Get proxy configuration and status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json({
      enabled: true,
      supportedProviders: ['openai', 'claude', 'gemini', 'grok'],
      endpoints: {
        openai: ['/chat/completions', '/completions', '/embeddings', '/images/generations'],
        claude: ['/messages', '/complete'],
        gemini: ['/models/gemini-pro:generateContent'],
        grok: ['/chat/completions']
      },
      tracking: {
        realTime: true,
        storeUsage: true,
        calculateCost: true,
        checkBudgets: true,
        sendAlerts: true
      },
      documentation: '/api/proxy/ai/docs'
    });
    
  } catch (error) {
    console.error('Proxy status error:', error);
    return NextResponse.json(
      { error: 'Failed to get proxy status' },
      { status: 500 }
    );
  }
}