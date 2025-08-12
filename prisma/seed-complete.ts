import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive database seed...')

  // Note: Skipping cleanup to avoid foreign key issues
  // In production, you'd handle this more carefully
  console.log('🌱 Creating test data...')

  // Create organizations
  console.log('🏢 Creating organizations...')
  const org1 = await prisma.organization.upsert({
    where: { domain: 'acme.com' },
    update: {},
    create: {
      name: 'Acme Corporation',
      domain: 'acme.com',
      subscription: 'GROWTH',
      spendLimit: 1000,
      monthlySpend: 0,
    },
  })

  const org2 = await prisma.organization.upsert({
    where: { domain: 'techstart.io' },
    update: {},
    create: {
      name: 'TechStart Inc',
      domain: 'techstart.io',
      subscription: 'ENTERPRISE',
      spendLimit: 5000,
      monthlySpend: 0,
    },
  })

  // Create users
  console.log('👥 Creating test users...')
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: {
      email: 'admin@acme.com',
      name: 'Admin User',
      role: 'ADMIN',
      company: 'Acme Corporation',
      organizationId: org1.id,
      emailVerified: new Date(),
    },
  })

  const regularUser = await prisma.user.upsert({
    where: { email: 'john@acme.com' },
    update: {},
    create: {
      email: 'john@acme.com',
      name: 'John Doe',
      role: 'USER',
      company: 'Acme Corporation',
      organizationId: org1.id,
      emailVerified: new Date(),
    },
  })

  const enterpriseUser = await prisma.user.upsert({
    where: { email: 'sarah@techstart.io' },
    update: {},
    create: {
      email: 'sarah@techstart.io',
      name: 'Sarah Johnson',
      role: 'USER',
      company: 'TechStart Inc',
      organizationId: org2.id,
      emailVerified: new Date(),
    },
  })

  // Create AI threads with proper data
  console.log('💬 Creating AI threads...')
  const thread1 = await prisma.aIThread.create({
    data: {
      userId: adminUser.id,
      organizationId: org1.id,
      title: 'Project Planning Discussion',
      description: 'Q4 2024 roadmap planning',
      tags: ['planning', 'roadmap', 'Q4'],
      mode: 'STANDARD',
      totalCost: 2.45,
      totalTokens: 15000,
      messageCount: 10,
      lastMessageAt: new Date(),
    },
  })

  const thread2 = await prisma.aIThread.create({
    data: {
      userId: regularUser.id,
      organizationId: org1.id,
      title: 'Code Review Assistant',
      description: 'Python code optimization help',
      tags: ['coding', 'python', 'optimization'],
      mode: 'CODING',
      isPinned: true,
      totalCost: 1.23,
      totalTokens: 8500,
      messageCount: 5,
      lastMessageAt: new Date(Date.now() - 3600000), // 1 hour ago
    },
  })

  const thread3 = await prisma.aIThread.create({
    data: {
      userId: enterpriseUser.id,
      organizationId: org2.id,
      title: 'Market Research Analysis',
      description: 'Competitive analysis for Q1 2025',
      tags: ['research', 'market', 'analysis'],
      mode: 'RESEARCH',
      totalCost: 5.67,
      totalTokens: 35000,
      messageCount: 15,
      lastMessageAt: new Date(Date.now() - 86400000), // 1 day ago
      shareId: nanoid(10),
    },
  })

  // Create AI messages
  console.log('📝 Creating AI messages...')
  await prisma.aIMessage.createMany({
    data: [
      {
        threadId: thread1.id,
        role: 'USER',
        content: 'What are the key priorities for Q4 2024?',
        promptTokens: 12,
        completionTokens: 0,
        totalTokens: 12,
        cost: 0.0002,
        status: 'COMPLETED',
      },
      {
        threadId: thread1.id,
        role: 'ASSISTANT',
        content: 'Based on our discussion, here are the key priorities for Q4 2024:\n\n1. **Product Development**\n   - Launch version 2.0\n   - Complete mobile app beta\n\n2. **Market Expansion**\n   - Enter European market\n   - Establish Asian partnerships\n\n3. **Team Growth**\n   - Hire 5 senior engineers\n   - Expand sales by 30%',
        selectedModel: 'gpt-4',
        selectedProvider: 'openai',
        promptTokens: 12,
        completionTokens: 156,
        totalTokens: 168,
        cost: 0.0084,
        latency: 2345,
        status: 'COMPLETED',
      },
      {
        threadId: thread2.id,
        role: 'USER',
        content: 'How can I optimize this recursive Fibonacci function?',
        promptTokens: 45,
        completionTokens: 0,
        totalTokens: 45,
        cost: 0.0009,
        status: 'COMPLETED',
      },
      {
        threadId: thread2.id,
        role: 'ASSISTANT',
        content: 'Here are optimization approaches:\n\n1. Use memoization\n2. Iterative approach\n3. Use functools.lru_cache',
        selectedModel: 'claude-3-sonnet',
        selectedProvider: 'anthropic',
        promptTokens: 45,
        completionTokens: 234,
        totalTokens: 279,
        cost: 0.00837,
        latency: 1876,
        status: 'COMPLETED',
      },
    ],
  })

  // Create usage logs
  console.log('📊 Creating usage logs...')
  const now = new Date()
  const usageLogs = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    usageLogs.push({
      userId: adminUser.id,
      organizationId: org1.id,
      provider: ['OPENAI', 'ANTHROPIC', 'GOOGLE'][i % 3],
      model: ['gpt-4', 'claude-3-opus', 'gemini-pro'][i % 3],
      promptTokens: Math.floor(Math.random() * 1000) + 100,
      completionTokens: Math.floor(Math.random() * 500) + 50,
      totalTokens: 0,
      cost: Math.random() * 5 + 0.5,
      timestamp: date,
    })
  }
  
  for (const log of usageLogs) {
    log.totalTokens = log.promptTokens + log.completionTokens
  }
  
  await prisma.usageLog.createMany({ data: usageLogs })

  // Create notifications
  console.log('🔔 Creating notifications...')
  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        organizationId: org1.id,
        type: 'COST_THRESHOLD_WARNING',
        priority: 'HIGH',
        title: 'Usage Alert',
        message: 'You have used 80% of your monthly budget',
        status: 'DELIVERED',
        channels: { email: true, inApp: true },
        deliveredAt: new Date(Date.now() - 86400000),
      },
      {
        userId: regularUser.id,
        organizationId: org1.id,
        type: 'OPTIMIZATION_RECOMMENDATIONS',
        priority: 'MEDIUM',
        title: 'New Optimization Available',
        message: 'We found ways to reduce your AI costs by 30%',
        status: 'READ',
        channels: { inApp: true },
        deliveredAt: new Date(Date.now() - 172800000),
        readAt: new Date(Date.now() - 86400000),
      },
    ],
  })

  // Create audit logs
  console.log('📋 Creating audit logs...')
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'LOGIN',
        severity: 'LOW',
        userId: adminUser.id,
        success: true,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
      {
        action: 'API_KEY_CREATED',
        severity: 'MEDIUM',
        userId: adminUser.id,
        targetType: 'ApiKey',
        metadata: { provider: 'openai' },
        success: true,
      },
      {
        action: 'THREAD_SHARED',
        severity: 'MEDIUM',
        userId: enterpriseUser.id,
        targetId: thread3.id,
        targetType: 'Thread',
        success: true,
      },
    ],
  })

  console.log('✅ Database seed completed successfully!')
  console.log(`
  Summary:
  - Organizations: 2
  - Users: 3 (1 admin, 2 regular)
  - AI Threads: 3
  - AI Messages: 4
  - Usage Logs: 7
  - Notifications: 2
  - Audit Logs: 3
  
  Test Accounts:
  - Admin: admin@acme.com
  - User: john@acme.com
  - Enterprise: sarah@techstart.io
  `)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })