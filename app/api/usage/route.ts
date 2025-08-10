import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Generate mock usage data for demonstration
function generateMockUsage(daysBack: number = 30) {
  const providers = ['openai', 'claude', 'gemini', 'perplexity', 'grok']
  const models = {
    openai: ['gpt-4', 'gpt-3.5-turbo', 'dall-e-3'],
    claude: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    gemini: ['gemini-pro', 'gemini-pro-vision'],
    perplexity: ['llama-3', 'mistral-7b'],
    grok: ['grok-1', 'grok-2']
  }
  
  const usage = []
  const now = new Date()
  
  for (let i = daysBack; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    // Generate 5-15 requests per day
    const requestsPerDay = Math.floor(Math.random() * 10) + 5
    
    for (let j = 0; j < requestsPerDay; j++) {
      const provider = providers[Math.floor(Math.random() * providers.length)]
      const model = (models as any)[provider][Math.floor(Math.random() * (models as any)[provider].length)]
      
      // Calculate tokens and cost based on provider and model
      const inputTokens = Math.floor(Math.random() * 2000) + 100
      const outputTokens = Math.floor(Math.random() * 1000) + 50
      
      // Mock pricing per 1K tokens (in USD)
      const pricing = {
        'gpt-4': { input: 0.03, output: 0.06 },
        'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
        'dall-e-3': { input: 0.04, output: 0.04 },
        'claude-3-opus': { input: 0.015, output: 0.075 },
        'claude-3-sonnet': { input: 0.003, output: 0.015 },
        'claude-3-haiku': { input: 0.00025, output: 0.00125 },
        'gemini-pro': { input: 0.0005, output: 0.0015 },
        'gemini-pro-vision': { input: 0.001, output: 0.002 },
        'llama-3': { input: 0.0002, output: 0.0002 },
        'mistral-7b': { input: 0.0002, output: 0.0002 },
        'grok-1': { input: 0.002, output: 0.008 },
        'grok-2': { input: 0.004, output: 0.012 }
      }
      
      const modelPricing = (pricing as any)[model] || { input: 0.001, output: 0.002 }
      const cost = (inputTokens * modelPricing.input / 1000) + (outputTokens * modelPricing.output / 1000)
      
      const timestamp = new Date(date)
      timestamp.setHours(Math.floor(Math.random() * 24))
      timestamp.setMinutes(Math.floor(Math.random() * 60))
      
      usage.push({
        id: `usage-${date.toISOString()}-${j}`,
        provider,
        model,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        cost: parseFloat(cost.toFixed(6)),
        timestamp: timestamp.toISOString(),
        endpoint: `/v1/${provider}/chat/completions`,
        statusCode: 200,
        latency: Math.floor(Math.random() * 2000) + 200
      })
    }
  }
  
  return usage.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const provider = searchParams.get('provider')
    const model = searchParams.get('model')
    
    // Generate mock usage data
    let usage = generateMockUsage(days)
    
    // Filter by provider if specified
    if (provider && provider !== 'all') {
      usage = usage.filter(u => u.provider === provider)
    }
    
    // Filter by model if specified
    if (model && model !== 'all') {
      usage = usage.filter(u => u.model === model)
    }
    
    // Calculate summary statistics
    const summary = {
      totalRequests: usage.length,
      totalTokens: usage.reduce((acc, u) => acc + u.totalTokens, 0),
      totalCost: usage.reduce((acc, u) => acc + u.cost, 0),
      averageLatency: usage.length > 0 
        ? Math.round(usage.reduce((acc, u) => acc + u.latency, 0) / usage.length)
        : 0,
      byProvider: {},
      byModel: {},
      byDay: {}
    }
    
    // Group by provider
    usage.forEach(u => {
      if (!(summary.byProvider as any)[u.provider]) {
        (summary.byProvider as any)[u.provider] = {
          requests: 0,
          tokens: 0,
          cost: 0
        }
      }
      (summary.byProvider as any)[u.provider].requests++;
      (summary.byProvider as any)[u.provider].tokens += u.totalTokens;
      (summary.byProvider as any)[u.provider].cost += u.cost
      
      // Group by model
      if (!(summary.byModel as any)[u.model]) {
        (summary.byModel as any)[u.model] = {
          requests: 0,
          tokens: 0,
          cost: 0
        }
      }
      (summary.byModel as any)[u.model].requests++;
      (summary.byModel as any)[u.model].tokens += u.totalTokens;
      (summary.byModel as any)[u.model].cost += u.cost
      
      // Group by day
      const day = u.timestamp.split('T')[0]
      if (!(summary.byDay as any)[day]) {
        (summary.byDay as any)[day] = {
          requests: 0,
          tokens: 0,
          cost: 0
        }
      }
      (summary.byDay as any)[day].requests++;
      (summary.byDay as any)[day].tokens += u.totalTokens;
      (summary.byDay as any)[day].cost += u.cost
    })
    
    // Round costs to 6 decimal places
    summary.totalCost = parseFloat(summary.totalCost.toFixed(6))
    Object.keys(summary.byProvider).forEach(p => {
      (summary.byProvider as any)[p].cost = parseFloat((summary.byProvider as any)[p].cost.toFixed(6))
    })
    Object.keys(summary.byModel).forEach(m => {
      (summary.byModel as any)[m].cost = parseFloat((summary.byModel as any)[m].cost.toFixed(6))
    })
    Object.keys(summary.byDay).forEach(d => {
      (summary.byDay as any)[d].cost = parseFloat((summary.byDay as any)[d].cost.toFixed(6))
    })
    
    return NextResponse.json({
      usage: usage.slice(0, 100), // Return first 100 records for performance
      summary,
      totalRecords: usage.length
    })
  } catch (error) {
    console.error('Error fetching usage data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Track new usage (for production implementation)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { provider, model, inputTokens, outputTokens, cost, endpoint, latency } = body
    
    if (!provider || !model) {
      return NextResponse.json({ error: 'Provider and model are required' }, { status: 400 })
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // In production, you would save this to the database
    // For now, just return success
    const usage = {
      id: `usage-${Date.now()}`,
      userId: user.id,
      organizationId: user.organizationId,
      provider,
      model,
      inputTokens: inputTokens || 0,
      outputTokens: outputTokens || 0,
      totalTokens: (inputTokens || 0) + (outputTokens || 0),
      cost: cost || 0,
      endpoint: endpoint || '',
      latency: latency || 0,
      timestamp: new Date().toISOString()
    }
    
    // In production: await prisma.usage.create({ data: usage })
    
    return NextResponse.json({ message: 'Usage tracked', usage })
  } catch (error) {
    console.error('Error tracking usage:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}