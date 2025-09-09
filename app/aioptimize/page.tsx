import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import AiOptimizeClient from './client'

// Force dynamic rendering for database queries
export const dynamic = 'force-dynamic'

export default async function AiOptimizePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/auth/signin?callbackUrl=/aioptimize')
  }

  // Get user with all related data for comprehensive feature support
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      organization: true,
      apiKeys: true,
      usage: {
        orderBy: { timestamp: 'desc' },
        take: 100 // Recent usage for analytics
      },
      threads: {
        orderBy: { updatedAt: 'desc' },
        take: 50 // Recent threads
      }
    }
  })

  if (!user) {
    redirect('/auth/signin')
  }

  // Enhanced API key status for all providers (using actual database values)
  const apiKeyStatus = {
    openai: user.apiKeys?.some(key => key.provider === 'openai' && key.isActive) || false,
    anthropic: user.apiKeys?.some(key => key.provider === 'claude' && key.isActive) || false,
    google: user.apiKeys?.some(key => key.provider === 'gemini' && key.isActive) || false,
    x: user.apiKeys?.some(key => key.provider === 'grok' && key.isActive) || false,
  }

  const hasApiKeys = Object.values(apiKeyStatus).some(status => status)
  
  // Get comprehensive usage data for limits and analytics
  const today = new Date(new Date().setHours(0, 0, 0, 0))
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  
  const [dailyUsage, monthlyUsage, recentThreads] = await Promise.all([
    prisma.usage.aggregate({
      where: {
        userId: user.id,
        timestamp: { gte: today }
      },
      _sum: {
        cost: true,
        inputTokens: true,
        outputTokens: true
      }
    }),
    prisma.usage.aggregate({
      where: {
        userId: user.id,
        timestamp: { gte: monthStart }
      },
      _sum: {
        cost: true,
        inputTokens: true,
        outputTokens: true
      }
    }),
    prisma.thread.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 20
    })
  ])

  // Comprehensive user props with all features
  const userProps = {
    id: user.id,
    email: user.email,
    name: user.name || session.user.name || '',
    image: user.image || session.user.image || '',
    hasApiKeys,
    apiKeyStatus,
    subscription: 'FREE',
    organizationId: user.organizationId || undefined,
    role: user.role
  }

  // Enhanced limits with real data
  const limitsProps = {
    dailyLimit: 100,
    monthlyLimit: 1000,
    dailyUsed: dailyUsage._sum.cost || 0,
    monthlyUsed: monthlyUsage._sum.cost || 0,
    dailyTokens: dailyUsage._sum.inputTokens || 0,
    monthlyTokens: monthlyUsage._sum.inputTokens || 0,
    remainingDaily: Math.max(0, 100 - (dailyUsage._sum.cost || 0)),
    remainingMonthly: Math.max(0, 1000 - (monthlyUsage._sum.cost || 0))
  }

  // Transform threads for client
  const threadsData = recentThreads.map(thread => ({
    id: thread.id,
    title: thread.title,
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
    messageCount: thread.messages?.length || 0,
    lastMessage: thread.messages[0]?.content?.substring(0, 100) || '',
    lastMessageAt: thread.messages[0]?.createdAt?.toISOString() || null,
    totalCost: 0, // This would need to be calculated from usage data
    isPinned: false,
    isArchived: false,
    sharedWith: [],
    tags: [],
    model: undefined,
    provider: undefined
  }))

  return (
    <AiOptimizeClient 
      user={userProps}
      limits={limitsProps}
      threads={threadsData}
      initialApiKeys={user.apiKeys.map(key => ({
        id: key.id,
        provider: key.provider,
        isActive: key.isActive,
        createdAt: key.createdAt.toISOString()
      }))}
    />
  )
}