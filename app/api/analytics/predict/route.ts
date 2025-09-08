import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { costPredictionService } from '@/lib/analytics/cost-prediction.service'
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
      period = 'monthly',
      lookbackDays = 30
    } = body

    // Get cost prediction
    const prediction = await costPredictionService.predictCosts({
      userId: user.id,
      organizationId: user.organizationId || undefined,
      period: period as 'daily' | 'weekly' | 'monthly',
      lookbackDays
    })

    // Get prediction accuracy
    const accuracy = await costPredictionService.getPredictionAccuracy(
      user.id,
      user.organizationId || undefined
    )

    return NextResponse.json({
      success: true,
      prediction,
      accuracy,
      metadata: {
        period,
        lookbackDays,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('Cost prediction error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate cost prediction' },
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

    // Get prediction accuracy
    const accuracy = await costPredictionService.getPredictionAccuracy(
      user.id,
      user.organizationId || undefined
    )

    // Get latest predictions for all periods
    const predictions = await Promise.all([
      costPredictionService.predictCosts({
        userId: user.id,
        organizationId: user.organizationId || undefined,
        period: 'daily',
        lookbackDays: 7
      }),
      costPredictionService.predictCosts({
        userId: user.id,
        organizationId: user.organizationId || undefined,
        period: 'weekly',
        lookbackDays: 14
      }),
      costPredictionService.predictCosts({
        userId: user.id,
        organizationId: user.organizationId || undefined,
        period: 'monthly',
        lookbackDays: 30
      })
    ])

    return NextResponse.json({
      success: true,
      predictions: {
        daily: predictions[0],
        weekly: predictions[1],
        monthly: predictions[2]
      },
      accuracy
    })
  } catch (error: any) {
    console.error('Get predictions error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to get predictions' },
      { status: 500 }
    )
  }
}