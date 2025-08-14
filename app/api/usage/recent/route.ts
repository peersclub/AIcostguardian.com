import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get recent usage logs
    const recentLogs = await prisma.usageLog.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit,
      select: {
        id: true,
        provider: true,
        model: true,
        cost: true,
        totalTokens: true,
        promptTokens: true,
        completionTokens: true,
        timestamp: true,
        metadata: true
      }
    })

    // Format the response
    const formattedLogs = recentLogs.map(log => ({
      id: log.id,
      provider: log.provider,
      model: log.model,
      cost: log.cost,
      tokens: log.totalTokens,
      promptTokens: log.promptTokens,
      completionTokens: log.completionTokens,
      timestamp: log.timestamp.toISOString(),
      metadata: log.metadata
    }))

    return NextResponse.json(formattedLogs)
  } catch (error) {
    console.error('Error fetching recent usage:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}