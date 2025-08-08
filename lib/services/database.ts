import prisma from '@/lib/prisma'
import { UserRole, SubscriptionTier, AlertType } from '@prisma/client'
import bcrypt from 'bcryptjs'

// User Services
export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: true,
      apiKeys: true,
      alerts: true,
    },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      organization: true,
    },
  })
}

export async function createUser(data: {
  email: string
  name?: string
  image?: string
  company?: string
}) {
  // Extract company from email if not provided
  const company = data.company || data.email.split('@')[1]?.split('.')[0] || 'Unknown'
  
  // Check if organization exists
  let organization = await prisma.organization.findUnique({
    where: { domain: data.email.split('@')[1] },
  })

  // Create organization if it doesn't exist
  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: company,
        domain: data.email.split('@')[1],
        subscription: SubscriptionTier.FREE,
      },
    })
  }

  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      image: data.image,
      company,
      role: UserRole.USER,
      organizationId: organization.id,
    },
  })
}

// API Key Services
export async function getApiKeys(userId: string) {
  return prisma.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      provider: true,
      isActive: true,
      lastUsed: true,
      createdAt: true,
    },
  })
}

export async function saveApiKey(
  userId: string,
  provider: string,
  apiKey: string,
  organizationId: string
) {
  // Encrypt the API key
  const encryptedKey = await bcrypt.hash(apiKey, 10)

  return prisma.apiKey.upsert({
    where: {
      userId_provider: {
        userId,
        provider,
      },
    },
    update: {
      encryptedKey,
      isActive: true,
      lastUsed: new Date(),
    },
    create: {
      userId,
      provider,
      encryptedKey,
      organizationId,
      isActive: true,
    },
  })
}

export async function getApiKey(userId: string, provider: string) {
  return prisma.apiKey.findUnique({
    where: {
      userId_provider: {
        userId,
        provider,
      },
    },
  })
}

export async function deleteApiKey(userId: string, provider: string) {
  return prisma.apiKey.delete({
    where: {
      userId_provider: {
        userId,
        provider,
      },
    },
  })
}

// Usage Log Services
export async function logUsage(data: {
  userId: string
  organizationId: string
  provider: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
}) {
  // Create usage log
  const log = await prisma.usageLog.create({
    data,
  })

  // Update organization monthly spend
  await prisma.organization.update({
    where: { id: data.organizationId },
    data: {
      monthlySpend: {
        increment: data.cost,
      },
    },
  })

  return log
}

export async function getUsageLogs(userId: string, days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return prisma.usageLog.findMany({
    where: {
      userId,
      timestamp: {
        gte: startDate,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
  })
}

export async function getOrganizationUsage(organizationId: string, days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return prisma.usageLog.findMany({
    where: {
      organizationId,
      timestamp: {
        gte: startDate,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
  })
}

export async function getUsageStats(userId: string) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const stats = await prisma.usageLog.aggregate({
    where: {
      userId,
      timestamp: {
        gte: thirtyDaysAgo,
      },
    },
    _sum: {
      promptTokens: true,
      completionTokens: true,
      totalTokens: true,
      cost: true,
    },
    _count: true,
  })

  return {
    totalCalls: stats._count,
    totalTokens: stats._sum.totalTokens || 0,
    totalCost: stats._sum.cost || 0,
    promptTokens: stats._sum.promptTokens || 0,
    completionTokens: stats._sum.completionTokens || 0,
  }
}

// Alert Services
export async function createAlert(data: {
  userId: string
  name: string
  type: AlertType
  threshold: number
}) {
  return prisma.alert.create({
    data,
  })
}

export async function getAlerts(userId: string) {
  return prisma.alert.findMany({
    where: { userId },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function updateAlert(alertId: string, data: {
  name?: string
  threshold?: number
  isActive?: boolean
}) {
  return prisma.alert.update({
    where: { id: alertId },
    data,
  })
}

export async function deleteAlert(alertId: string) {
  return prisma.alert.delete({
    where: { id: alertId },
  })
}

export async function triggerAlert(alertId: string) {
  return prisma.alert.update({
    where: { id: alertId },
    data: {
      lastTriggered: new Date(),
    },
  })
}

// Organization Services
export async function getOrganization(organizationId: string) {
  return prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      users: true,
      _count: {
        select: {
          apiKeys: true,
          usageLogs: true,
        },
      },
    },
  })
}

export async function updateOrganization(organizationId: string, data: {
  name?: string
  subscription?: SubscriptionTier
  spendLimit?: number
}) {
  return prisma.organization.update({
    where: { id: organizationId },
    data,
  })
}

// Team Services
export async function getTeamMembers(organizationId: string) {
  return prisma.user.findMany({
    where: { organizationId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          usageLogs: true,
        },
      },
    },
  })
}

export async function updateUserRole(userId: string, role: UserRole) {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
  })
}