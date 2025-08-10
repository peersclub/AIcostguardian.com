import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { usageMonitor } from '@/lib/services/usage-monitor'
import prisma from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const active = searchParams.get('active') === 'true'

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get alert rules and active alerts
    const alerts = await prisma.alert.findMany({
      where: {
        userId: user.id,
        ...(type && { type }),
        ...(active !== undefined && { isActive: active })
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return NextResponse.json(alerts)

  } catch (error: any) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const alertData = await request.json()
    const { type, provider, threshold, message, metadata } = alertData

    if (!type || !provider) {
      return NextResponse.json(
        { error: 'Type and provider are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create alert record
    const alert = await prisma.alert.create({
      data: {
        userId: user.id,
        type,
        provider,
        threshold: threshold || 0,
        message: message || `${type} alert for ${provider}`,
        metadata: metadata || {},
        isActive: true,
        triggeredAt: new Date()
      }
    })

    // Set cost alert threshold in usage monitor if it's a cost alert
    if (type === 'cost_alert' && threshold) {
      usageMonitor.setCostAlert(provider, threshold)
    }

    return NextResponse.json({ 
      success: true, 
      alert 
    })

  } catch (error: any) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create alert' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, isActive } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update alert status
    const alert = await prisma.alert.update({
      where: { 
        id,
        userId: user.id // Ensure user owns the alert
      },
      data: {
        isActive,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      alert 
    })

  } catch (error: any) {
    console.error('Error updating alert:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update alert' },
      { status: 500 }
    )
  }
}