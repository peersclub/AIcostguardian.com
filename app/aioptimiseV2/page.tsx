import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import AIOptimiseV2Client from './client-enhanced'

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
      cost: true,
      inputTokens: true,
      outputTokens: true
    }
  })

  // Transform user data to match V2 component props
  const userProps = {
    id: user?.id || '',
    email: user?.email || '',
    name: user?.name || '',
    image: user?.image || '',
    hasApiKeys: hasApiKeys,
    subscription: user?.organization?.subscription || 'FREE',
    apiKeyStatus: {
      openai: user?.apiKeys?.some(key => key.provider === 'OPENAI') || false,
      anthropic: user?.apiKeys?.some(key => key.provider === 'ANTHROPIC') || false,
      google: user?.apiKeys?.some(key => key.provider === 'GOOGLE') || false,
      x: user?.apiKeys?.some(key => key.provider === 'XAI') || false,
    }
  }

  const limitsProps = {
    dailyLimit: user?.organization?.dailyLimit || 100,
    monthlyLimit: user?.organization?.monthlyLimit || 1000,
    dailyUsed: usageLimits._sum.cost || 0,
    monthlyUsed: monthlyUsage._sum.cost || 0,
    dailyTokens: usageLimits._sum.inputTokens || 0,
    monthlyTokens: monthlyUsage._sum.inputTokens || 0,
  }

  return (
    <AIOptimiseV2Client 
      user={userProps}
      limits={limitsProps}
    />
  )
}