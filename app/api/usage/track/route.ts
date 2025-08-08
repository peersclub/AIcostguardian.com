import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'

// This would be called by your AI integration to track usage
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { provider, model, promptTokens, completionTokens, cost } = body

    if (!provider || !model || promptTokens === undefined || completionTokens === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate cost if not provided
    const calculatedCost = cost || calculateCost(provider, model, promptTokens, completionTokens)

    // Create usage log
    const usageLog = await prisma.usageLog.create({
      data: {
        provider,
        model,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        cost: calculatedCost,
        userId: user.id,
        organizationId: user.organizationId || user.id
      }
    })

    // Update organization monthly spend
    if (user.organizationId) {
      await prisma.organization.update({
        where: { id: user.organizationId },
        data: {
          monthlySpend: {
            increment: calculatedCost
          }
        }
      })

      // Check if spend limit is exceeded and create alert
      const org = await prisma.organization.findUnique({
        where: { id: user.organizationId }
      })

      if (org && org.spendLimit && org.monthlySpend > org.spendLimit) {
        await prisma.alert.create({
          data: {
            type: 'spend_threshold',
            provider: provider || 'system',
            threshold: org.spendLimit,
            message: 'Spend Limit Exceeded',
            userId: user.id,
            isActive: true,
            triggeredAt: new Date()
          }
        })
      }
    }

    return NextResponse.json({ 
      message: 'Usage tracked successfully',
      usageLog 
    })
  } catch (error) {
    console.error('Error tracking usage:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Cost calculation helper (simplified - you'd want more comprehensive pricing)
function calculateCost(provider: string, model: string, promptTokens: number, completionTokens: number): number {
  const pricing: Record<string, Record<string, { prompt: number, completion: number }>> = {
    openai: {
      'gpt-4': { prompt: 0.03, completion: 0.06 },
      'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
      'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 }
    },
    anthropic: {
      'claude-3-opus': { prompt: 0.015, completion: 0.075 },
      'claude-3-sonnet': { prompt: 0.003, completion: 0.015 },
      'claude-3-haiku': { prompt: 0.00025, completion: 0.00125 }
    },
    google: {
      'gemini-pro': { prompt: 0.0005, completion: 0.0015 },
      'gemini-ultra': { prompt: 0.007, completion: 0.021 }
    }
  }

  const modelPricing = pricing[provider]?.[model] || { prompt: 0.001, completion: 0.002 }
  
  // Price per 1K tokens
  const promptCost = (promptTokens / 1000) * modelPricing.prompt
  const completionCost = (completionTokens / 1000) * modelPricing.completion
  
  return promptCost + completionCost
}