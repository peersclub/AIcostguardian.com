import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import AIOptimiseV2Client from './client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AIOptimiseV2Page() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/auth/signin?callbackUrl=/aioptimiseV2')
  }

  // Get user with organization and API keys
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      organization: true,
      apiKeys: true,
    }
  })

  // Check if user has at least one API key configured
  const hasApiKeys = user?.apiKeys && user.apiKeys.length > 0
  
  // Get user's usage limits
  const usageLimits = await prisma.usage.aggregate({
    where: {
      userId: user?.id,
      timestamp: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)) // Today
      }
    },
    _sum: {
      cost: true,
      inputTokens: true,
      outputTokens: true
    }
  })

  const monthlyUsage = await prisma.usage.aggregate({
    where: {
      userId: user?.id,
      timestamp: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    },
    _sum: {
      cost: true
    }
  })

  return (
    <AIOptimiseV2Client 
      user={{
        id: user?.id || '',
        name: user?.name || session.user.name || '',
        email: session.user.email,
        image: user?.image || session.user.image || '',
        hasApiKeys: hasApiKeys || false,
        subscription: user?.organization?.subscription || 'FREE',
      }}
      limits={{
        dailyUsed: usageLimits._sum.cost || 0,
        dailyLimit: 100, // TODO: Get from user settings
        monthlyUsed: monthlyUsage._sum.cost || 0,
        monthlyLimit: 3000, // TODO: Get from organization
      }}
    />
  )
}