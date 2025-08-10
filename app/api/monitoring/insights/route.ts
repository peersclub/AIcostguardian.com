import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { usageMonitor } from '@/lib/services/usage-monitor'
import { PRICING_CONFIG, ProviderName } from '@/config/providers'
import prisma from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

interface InsightData {
  type: 'optimization' | 'cost_saving' | 'usage_pattern' | 'warning'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionItems: string[]
  data?: any
  createdAt: Date
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '7')

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get usage data for analysis
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000))

    const aggregatedUsage = await usageMonitor.getAggregatedUsage(startDate, endDate)
    
    // Generate insights
    const insights = await generateIntelligentInsights(aggregatedUsage, days)

    return NextResponse.json(insights)

  } catch (error: any) {
    console.error('Error generating insights:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate insights' },
      { status: 500 }
    )
  }
}

async function generateIntelligentInsights(
  aggregatedUsage: Record<ProviderName, any>,
  days: number
): Promise<InsightData[]> {
  const insights: InsightData[] = []

  // Calculate total costs and usage
  let totalCost = 0
  let totalTokens = 0
  const providerCosts: Record<string, number> = {}
  const modelUsage: Record<string, any> = {}

  for (const [provider, usage] of Object.entries(aggregatedUsage)) {
    totalCost += usage.totalCost || 0
    totalTokens += usage.totalTokens || 0
    providerCosts[provider] = usage.totalCost || 0

    // Analyze model usage
    if (usage.byModel) {
      for (const [model, modelData] of Object.entries(usage.byModel)) {
        if (!modelUsage[model]) {
          modelUsage[model] = { cost: 0, tokens: 0, requests: 0, provider }
        }
        const data = modelData as any
        modelUsage[model].cost += data.cost || 0
        modelUsage[model].tokens += data.tokens || 0
        modelUsage[model].requests += data.requests || 0
      }
    }
  }

  // Cost optimization insights
  if (totalCost > 0) {
    // Find most expensive provider
    const mostExpensiveProvider = Object.entries(providerCosts)
      .sort(([,a], [,b]) => b - a)[0]

    if (mostExpensiveProvider && mostExpensiveProvider[1] > totalCost * 0.5) {
      insights.push({
        type: 'cost_saving',
        title: `High ${mostExpensiveProvider[0]} Usage Detected`,
        description: `${mostExpensiveProvider[0]} accounts for ${((mostExpensiveProvider[1] / totalCost) * 100).toFixed(1)}% of your total costs ($${mostExpensiveProvider[1].toFixed(2)} of $${totalCost.toFixed(2)}).`,
        impact: 'high',
        actionItems: [
          'Consider using cheaper models for non-critical tasks',
          'Implement request batching to reduce API calls',
          'Review prompt optimization to reduce token usage'
        ],
        data: { provider: mostExpensiveProvider[0], cost: mostExpensiveProvider[1], percentage: (mostExpensiveProvider[1] / totalCost) * 100 },
        createdAt: new Date()
      })
    }

    // Model optimization insights
    const expensiveModels = Object.entries(modelUsage)
      .sort(([,a], [,b]) => b.cost - a.cost)
      .slice(0, 3)

    for (const [model, data] of expensiveModels) {
      if (data.cost > totalCost * 0.2) {
        const pricing = PRICING_CONFIG[data.provider as ProviderName]
        const modelPricing = pricing ? pricing[model as keyof typeof pricing] : null

        if (modelPricing) {
          // Suggest cheaper alternatives
          const cheaperModels = getCheaperAlternatives(data.provider, model, modelPricing)
          
          if (cheaperModels.length > 0) {
            insights.push({
              type: 'optimization',
              title: `Consider Cheaper Model: ${model}`,
              description: `${model} costs $${data.cost.toFixed(2)} (${((data.cost / totalCost) * 100).toFixed(1)}% of total). Switching to cheaper models could reduce costs by up to 80%.`,
              impact: 'medium',
              actionItems: [
                `Try ${cheaperModels[0]} for similar tasks`,
                'Test cheaper models with your specific use cases',
                'Implement model routing based on task complexity'
              ],
              data: { model, currentCost: data.cost, alternatives: cheaperModels },
              createdAt: new Date()
            })
          }
        }
      }
    }
  }

  // Usage pattern insights
  const dailyAverage = totalCost / days
  if (dailyAverage > 50) {
    insights.push({
      type: 'usage_pattern',
      title: 'High Daily Usage Pattern',
      description: `Your average daily spend is $${dailyAverage.toFixed(2)}. This projects to $${(dailyAverage * 30).toFixed(2)}/month.`,
      impact: 'medium',
      actionItems: [
        'Set up cost alerts to monitor spending',
        'Review usage patterns to identify peak usage times',
        'Consider implementing usage limits for team members'
      ],
      data: { dailyAverage, monthlyProjection: dailyAverage * 30 },
      createdAt: new Date()
    })
  }

  // Token efficiency insights
  const avgTokensPerRequest = totalTokens / Object.values(aggregatedUsage)
    .reduce((sum, usage) => sum + (usage.totalRequests || 0), 0)

  if (avgTokensPerRequest > 2000) {
    insights.push({
      type: 'optimization',
      title: 'High Token Usage Per Request',
      description: `Average ${avgTokensPerRequest.toFixed(0)} tokens per request. Optimizing prompts could reduce costs by 30-50%.`,
      impact: 'high',
      actionItems: [
        'Review and optimize prompt engineering',
        'Remove unnecessary context from prompts',
        'Use system messages efficiently',
        'Implement prompt caching where possible'
      ],
      data: { avgTokensPerRequest },
      createdAt: new Date()
    })
  }

  // Warning insights
  if (totalCost > 100 && days <= 7) {
    insights.push({
      type: 'warning',
      title: 'High Weekly Spending Alert',
      description: `You've spent $${totalCost.toFixed(2)} in ${days} days. This could reach $${(totalCost / days * 30).toFixed(2)}/month.`,
      impact: 'high',
      actionItems: [
        'Set up immediate cost alerts',
        'Review all active API integrations',
        'Consider implementing rate limiting',
        'Audit automated processes for efficiency'
      ],
      data: { weeklySpend: totalCost, projectedMonthly: totalCost / days * 30 },
      createdAt: new Date()
    })
  }

  // Provider diversity insight
  const activeProviders = Object.keys(aggregatedUsage).filter(
    provider => aggregatedUsage[provider as ProviderName]?.totalCost > 0
  )

  if (activeProviders.length === 1 && totalCost > 20) {
    insights.push({
      type: 'optimization',
      title: 'Single Provider Dependency',
      description: `You're only using ${activeProviders[0]}. Diversifying providers could reduce costs and improve reliability.`,
      impact: 'medium',
      actionItems: [
        'Test other providers for cost comparison',
        'Implement provider failover for reliability',
        'Use specialized providers for specific tasks',
        'Compare pricing across providers for your use cases'
      ],
      data: { currentProvider: activeProviders[0], totalCost },
      createdAt: new Date()
    })
  }

  // Sort insights by impact
  const impactOrder = { high: 3, medium: 2, low: 1 }
  insights.sort((a, b) => impactOrder[b.impact] - impactOrder[a.impact])

  return insights.slice(0, 10) // Return top 10 insights
}

function getCheaperAlternatives(provider: string, currentModel: string, currentPricing: any): string[] {
  const alternatives: string[] = []
  const pricing = PRICING_CONFIG[provider as ProviderName]
  
  if (!pricing) return alternatives

  const currentCost = currentPricing.input + currentPricing.output

  for (const [model, modelPricing] of Object.entries(pricing)) {
    if (model !== currentModel) {
      const modelCost = modelPricing.input + modelPricing.output
      if (modelCost < currentCost * 0.8) { // At least 20% cheaper
        alternatives.push(model)
      }
    }
  }

  return alternatives.sort((a, b) => {
    const aCost = pricing[a as keyof typeof pricing] as any
    const bCost = pricing[b as keyof typeof pricing] as any
    return (aCost.input + aCost.output) - (bCost.input + bCost.output)
  })
}