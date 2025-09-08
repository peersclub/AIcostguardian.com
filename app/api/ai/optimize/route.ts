import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { modelOptimizer } from '@/lib/ai/model-optimizer.service'
import { apiKeyService } from '@/lib/core/api-key.service'
import { userService } from '@/lib/core/user.service'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with organization
    const user = await userService.ensureUser({
      email: session.user.email,
      name: session.user.name,
      image: session.user.image
    })

    const body = await request.json()
    const {
      taskType = 'chat',
      estimatedTokens = 1000,
      requiresVision = false,
      requiresFunctionCalling = false,
      requiresStreaming = false,
      maxLatency,
      maxCost,
      minQuality = 'medium',
      optimizeFor = 'balanced' // 'cost', 'quality', 'speed', 'balanced'
    } = body

    // Get available providers (those with API keys)
    const availableProviders: string[] = []
    const providers = ['openai', 'claude', 'gemini', 'grok', 'perplexity'] as const
    
    for (const provider of providers) {
      const hasKey = await apiKeyService.getApiKey(
        user.id,
        provider as any,
        user.organizationId || undefined
      )
      if (hasKey) {
        availableProviders.push(provider)
      }
    }

    if (availableProviders.length === 0) {
      return NextResponse.json({
        error: 'No API keys configured',
        message: 'Please add at least one AI provider API key in Settings'
      }, { status: 400 })
    }

    // Get optimal models based on requirements
    const requirements = {
      taskType,
      estimatedTokens,
      requiresVision,
      requiresFunctionCalling,
      requiresStreaming,
      maxLatency,
      maxCost,
      minQuality
    } as any

    let models
    
    if (optimizeFor === 'cost') {
      // Optimize for lowest cost
      models = modelOptimizer.optimizeForCost(requirements, 
        minQuality === 'low' ? 0.6 :
        minQuality === 'medium' ? 0.75 :
        minQuality === 'high' ? 0.85 : 0.9
      )
    } else {
      // Get balanced recommendations
      models = await modelOptimizer.selectOptimalModel(
        requirements,
        user.id,
        availableProviders
      )
      
      // Adjust based on optimization preference
      if (optimizeFor === 'quality') {
        // Re-sort by quality (task fit)
        models.sort((a, b) => {
          const qualityA = a.reasons.find(r => r.includes('Task fit'))?.match(/(\d+)%/)?.[1] || '0'
          const qualityB = b.reasons.find(r => r.includes('Task fit'))?.match(/(\d+)%/)?.[1] || '0'
          return parseInt(qualityB) - parseInt(qualityA)
        })
      } else if (optimizeFor === 'speed') {
        // Re-sort by latency
        models.sort((a, b) => a.estimatedLatency - b.estimatedLatency)
      }
    }

    // Get personalized recommendations
    const personalizedRecs = await modelOptimizer.getPersonalizedRecommendations(
      user.id,
      taskType
    )

    // Build fallback chains for top 3 models
    const topModels = models.slice(0, 3)
    const fallbackChains = topModels.map(model => ({
      primary: model.model,
      chain: modelOptimizer.buildFallbackChain(model.model, requirements)
    }))

    // Track this optimization request
    if (models.length > 0) {
      await modelOptimizer.trackModelPerformance(
        user.id,
        models[0].model,
        taskType,
        {
          latency: 0,
          cost: 0,
          success: true,
          userRating: undefined
        }
      )
    }

    return NextResponse.json({
      success: true,
      recommendations: models.slice(0, 5),
      personalized: personalizedRecs,
      fallbackChains,
      availableProviders,
      summary: {
        bestModel: models[0]?.model || null,
        estimatedCost: models[0]?.estimatedCost || 0,
        estimatedLatency: models[0]?.estimatedLatency || 0,
        confidence: models[0]?.score || 0
      }
    })
  } catch (error: any) {
    console.error('Model optimization error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to optimize model selection' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await userService.ensureUser({
      email: session.user.email,
      name: session.user.name,
      image: session.user.image
    })

    // Get user's model performance history
    const url = new URL(request.url)
    const taskType = url.searchParams.get('taskType') || 'chat'
    
    const recommendations = await modelOptimizer.getPersonalizedRecommendations(
      user.id,
      taskType
    )

    return NextResponse.json({
      success: true,
      taskType,
      recommendations
    })
  } catch (error: any) {
    console.error('Get recommendations error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to get recommendations' },
      { status: 500 }
    )
  }
}