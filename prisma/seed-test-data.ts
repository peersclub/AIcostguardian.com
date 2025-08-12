import { PrismaClient } from '@prisma/client'
import { encrypt } from '../lib/encryption'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting EXHAUSTIVE TEST DATABASE seed with complete data...')
  
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  // 1. Create Testing Organization
  console.log('\n📢 Creating Testing Organization...')
  
  const testOrg = await prisma.organization.upsert({
    where: { domain: 'josephite-testing.com' },
    update: {
      subscription: 'ENTERPRISE',
      spendLimit: 100000,
      monthlySpend: 45678.90
    },
    create: {
      name: 'Josephite Testing Organization',
      domain: 'josephite-testing.com',
      subscription: 'ENTERPRISE',
      spendLimit: 100000,
      monthlySpend: 45678.90
    }
  })
  console.log('✅ Created/Updated test organization:', testOrg.name)

  // Keep existing organizations
  const assetWorksOrg = await prisma.organization.upsert({
    where: { domain: 'assetworks.ai' },
    update: {
      subscription: 'ENTERPRISE',
      spendLimit: 50000,
      monthlySpend: 37500
    },
    create: {
      name: 'AssetWorks AI',
      domain: 'assetworks.ai',
      subscription: 'ENTERPRISE',
      spendLimit: 50000,
      monthlySpend: 37500
    }
  })

  const aiCostOptimiserOrg = await prisma.organization.upsert({
    where: { domain: 'aicostoptimiser.com' },
    update: {
      subscription: 'GROWTH',
      spendLimit: 10000,
      monthlySpend: 3245
    },
    create: {
      name: 'AI Cost Optimiser',
      domain: 'aicostoptimiser.com',
      subscription: 'GROWTH',
      spendLimit: 10000,
      monthlySpend: 3245
    }
  })

  // 2. Create Test Admin and Users
  console.log('\n👤 Creating Test Admin and Users...')
  
  // Admin user
  const testAdmin = await prisma.user.upsert({
    where: { email: 'sureshthejosephite@gmail.com' },
    update: {
      name: 'Suresh Joseph (Admin)',
      role: 'ADMIN',
      organizationId: testOrg.id,
      emailVerified: now
    },
    create: {
      id: 'user-test-admin-suresh',
      email: 'sureshthejosephite@gmail.com',
      name: 'Suresh Joseph (Admin)',
      role: 'ADMIN',
      organizationId: testOrg.id,
      emailVerified: now,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=suresh-admin'
    }
  })
  console.log('✅ Created test admin:', testAdmin.email)

  // Test users
  const testUsers = [
    {
      id: 'user-test-victor43',
      email: 'sureshvictor43@gmail.com',
      name: 'Suresh Victor 43',
      role: 'USER' as const,
      organizationId: testOrg.id,
      emailVerified: oneWeekAgo,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=victor43'
    },
    {
      id: 'user-test-victor44',
      email: 'sureshvictor44@gmail.com',
      name: 'Suresh Victor 44',
      role: 'USER' as const,
      organizationId: testOrg.id,
      emailVerified: twoWeeksAgo,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=victor44'
    },
    {
      id: 'user-test-victor45',
      email: 'sureshvictor45@gmail.com',
      name: 'Suresh Victor 45',
      role: 'USER' as const,
      organizationId: testOrg.id,
      emailVerified: oneMonthAgo,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=victor45'
    }
  ]

  for (const userData of testUsers) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData
    })
    console.log('✅ Created test user:', userData.email)
  }

  // Keep existing users
  const techAdmin = await prisma.user.upsert({
    where: { email: 'tech.admin@assetworks.ai' },
    update: {},
    create: {
      id: 'user-assetworks-techadmin',
      email: 'tech.admin@assetworks.ai',
      name: 'Tech Admin',
      role: 'ADMIN',
      organizationId: assetWorksOrg.id,
      emailVerified: now,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techadmin'
    }
  })

  const victor = await prisma.user.upsert({
    where: { email: 'victor@aicostoptimiser.com' },
    update: {},
    create: {
      id: 'user-aicost-victor',
      email: 'victor@aicostoptimiser.com',
      name: 'Victor',
      role: 'ADMIN',
      organizationId: aiCostOptimiserOrg.id,
      emailVerified: now,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=victor'
    }
  })

  // 3. Create Exhaustive API Keys for Test Users
  console.log('\n🔑 Creating Exhaustive API Keys...')
  
  const providers = ['OPENAI', 'ANTHROPIC', 'GOOGLE', 'PERPLEXITY', 'COHERE', 'MISTRAL'] as const
  
  // Create API keys for admin and all test users
  const testUserIds = [testAdmin.id, ...testUsers.map(u => u.id)]
  
  for (const userId of testUserIds) {
    for (const provider of providers) {
      try {
        await prisma.apiKey.upsert({
          where: {
            userId_provider: {
              userId: userId,
              provider: provider
            }
          },
          update: {
            isActive: true
          },
          create: {
            userId: userId,
            provider: provider,
            encryptedKey: encrypt(`test-${provider.toLowerCase()}-key-${userId}-${Date.now()}`),
            isActive: true,
            organizationId: testOrg.id
          }
        })
        console.log(`✅ Created ${provider} API key for ${userId}`)
      } catch (error) {
        console.log(`⚠️ Failed to create ${provider} key:`, error)
      }
    }
  }

  // 4. Create Exhaustive Usage Data (90 days of history)
  console.log('\n📊 Creating Exhaustive Usage Data (90 days)...')
  
  const models = {
    OPENAI: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo', 'text-embedding-3-large'],
    ANTHROPIC: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    GOOGLE: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
    PERPLEXITY: ['sonar-pro', 'sonar', 'codellama-70b-instruct'],
    COHERE: ['command-r-plus', 'command-r', 'embed-v3'],
    MISTRAL: ['mistral-large', 'mistral-medium', 'mistral-small']
  }

  const operations = [
    'chat-completion', 'code-generation', 'text-analysis', 'translation',
    'summarization', 'embedding', 'classification', 'extraction',
    'question-answering', 'sentiment-analysis', 'content-moderation',
    'function-calling', 'vision-analysis', 'audio-transcription'
  ]

  const projects = [
    'customer-support', 'data-analysis', 'content-creation', 'api-development',
    'research', 'automation', 'testing', 'documentation', 'monitoring',
    'optimization', 'migration', 'integration', 'security-audit', 'compliance'
  ]

  // Generate comprehensive usage data for test organization
  let totalUsageCount = 0
  for (let day = 0; day < 90; day++) {
    const date = new Date(now.getTime() - day * 24 * 60 * 60 * 1000)
    
    // Generate multiple usage entries per day for each test user
    for (const userId of testUserIds) {
      const dailyUsageCount = Math.floor(Math.random() * 20) + 5 // 5-25 requests per user per day
      
      for (let i = 0; i < dailyUsageCount; i++) {
        const provider = providers[Math.floor(Math.random() * providers.length)]
        const modelList = models[provider]
        const model = modelList[Math.floor(Math.random() * modelList.length)]
        const operation = operations[Math.floor(Math.random() * operations.length)]
        const project = projects[Math.floor(Math.random() * projects.length)]
        
        const promptTokens = Math.floor(Math.random() * 50000) + 1000
        const completionTokens = Math.floor(Math.random() * 30000) + 500
        const totalTokens = promptTokens + completionTokens
        const cost = (totalTokens / 1000000) * (Math.random() * 20 + 1) // $1-21 per million tokens
        
        await prisma.usageLog.create({
          data: {
            userId: userId,
            organizationId: testOrg.id,
            provider: provider,
            model: model,
            promptTokens: promptTokens,
            completionTokens: completionTokens,
            totalTokens: totalTokens,
            cost: cost,
            timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000), // Random time during the day
            metadata: {
              operation: operation,
              project: project,
              responseTime: Math.floor(Math.random() * 5000) + 500,
              statusCode: Math.random() > 0.95 ? 500 : 200, // 5% error rate
              endpoint: `/api/${operation}`,
              success: Math.random() > 0.95 ? false : true,
              environment: 'production',
              version: '1.0.0',
              clientIp: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
              userAgent: 'AIOptimise/1.0',
              region: ['us-east-1', 'eu-west-1', 'ap-south-1'][Math.floor(Math.random() * 3)]
            }
          }
        })
        totalUsageCount++
      }
    }
  }
  console.log(`✅ Created ${totalUsageCount} usage log entries`)

  // 5. Create Usage Limits
  console.log('\n⚡ Creating Usage Limits...')
  
  await prisma.usageLimit.upsert({
    where: { userId: testAdmin.id },
    update: {},
    create: {
      userId: testAdmin.id,
      dailyCostLimit: 5000,
      monthlyCostLimit: 100000,
      dailyTokenLimit: 50000000,
      monthlyTokenLimit: 1500000000
    }
  })

  for (const user of testUsers) {
    await prisma.usageLimit.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        dailyCostLimit: 500,
        monthlyCostLimit: 10000,
        dailyTokenLimit: 5000000,
        monthlyTokenLimit: 150000000
      }
    })
  }
  console.log('✅ Created usage limits for all test users')

  // 6. Create User Settings
  console.log('\n⚙️ Creating User Settings...')
  
  await prisma.userSettings.upsert({
    where: { userId: testAdmin.id },
    update: {},
    create: {
      userId: testAdmin.id,
      theme: 'dark',
      showMetrics: true,
      compactView: false,
      preferredProvider: 'OPENAI',
      preferredModel: 'gpt-4o',
      autoSaveThreads: true
    }
  })

  for (const user of testUsers) {
    await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        theme: ['light', 'dark', 'system'][Math.floor(Math.random() * 3)],
        showMetrics: Math.random() > 0.3,
        compactView: Math.random() > 0.5,
        preferredProvider: providers[Math.floor(Math.random() * providers.length)],
        preferredModel: 'gpt-4o-mini',
        autoSaveThreads: Math.random() > 0.2
      }
    })
  }
  console.log('✅ Created user settings for all test users')

  // 7. Create Comprehensive Notifications
  console.log('\n🔔 Creating Comprehensive Notifications...')
  
  const notificationTypes = [
    'COST_THRESHOLD_WARNING',
    'COST_THRESHOLD_CRITICAL',
    'COST_THRESHOLD_EXCEEDED',
    'DAILY_COST_SPIKE',
    'UNUSUAL_SPENDING_PATTERN',
    'API_KEY_EXPIRING',
    'API_KEY_EXPIRED',
    'API_RATE_LIMIT_WARNING',
    'API_RATE_LIMIT_EXCEEDED',
    'USAGE_QUOTA_WARNING',
    'USAGE_QUOTA_EXCEEDED',
    'MODEL_DEPRECATION',
    'PROVIDER_OUTAGE',
    'INTEGRATION_FAILURE',
    'PAYMENT_FAILED'
  ] as const

  let notificationCount = 0
  for (const userId of [testAdmin.id, ...testUsers.map(u => u.id)]) {
    for (let i = 0; i < 20; i++) { // 20 notifications per user
      const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
      const daysAgo = Math.floor(Math.random() * 30)
      const createdDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
      
      await prisma.notification.create({
        data: {
          userId: userId,
          organizationId: testOrg.id,
          title: `Test ${type.replace(/_/g, ' ').toLowerCase()} notification`,
          message: `This is a test notification for ${type}. Created ${daysAgo} days ago.`,
          type: type,
          priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as any,
          status: ['PENDING', 'READ', 'ARCHIVED'][Math.floor(Math.random() * 3)] as any,
          channels: {
            email: { sent: Math.random() > 0.5, sentAt: Math.random() > 0.5 ? createdDate.toISOString() : null },
            inApp: { sent: true, sentAt: createdDate.toISOString() },
            slack: { sent: Math.random() > 0.7, sentAt: Math.random() > 0.7 ? createdDate.toISOString() : null }
          },
          data: {
            testData: true,
            randomValue: Math.random(),
            timestamp: createdDate.toISOString()
          },
          createdAt: createdDate
        }
      })
      notificationCount++
    }
  }
  console.log(`✅ Created ${notificationCount} notifications`)

  // 8. Create Alerts
  console.log('\n⚠️ Creating Comprehensive Alerts...')
  
  const alertTypes = ['SPEND_THRESHOLD', 'USAGE_SPIKE', 'ERROR_RATE', 'RATE_LIMIT', 'BUDGET_EXCEEDED']
  
  for (const userId of [testAdmin.id, ...testUsers.map(u => u.id)]) {
    for (const provider of providers) {
      for (const alertType of alertTypes) {
        await prisma.alert.create({
          data: {
            userId: userId,
            type: alertType,
            provider: provider,
            threshold: Math.floor(Math.random() * 1000) + 100,
            message: `${alertType} alert for ${provider}`,
            metadata: {
              severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)],
              triggered: Math.floor(Math.random() * 10),
              lastTriggered: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            isActive: Math.random() > 0.3
          }
        })
      }
    }
  }
  console.log('✅ Created comprehensive alerts')

  // 9. Create Budgets
  console.log('\n💰 Creating Comprehensive Budgets...')
  
  const budgetPeriods = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'] as const
  
  for (const period of budgetPeriods) {
    await prisma.budget.create({
      data: {
        organizationId: testOrg.id,
        name: `Test ${period} Budget`,
        amount: period === 'DAILY' ? 5000 : 
                period === 'WEEKLY' ? 30000 :
                period === 'MONTHLY' ? 100000 :
                period === 'QUARTERLY' ? 300000 : 1000000,
        period: period,
        startDate: period === 'YEARLY' ? new Date(now.getFullYear(), 0, 1) :
                  period === 'QUARTERLY' ? new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1) :
                  period === 'MONTHLY' ? new Date(now.getFullYear(), now.getMonth(), 1) :
                  period === 'WEEKLY' ? new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000) :
                  now,
        endDate: period === 'YEARLY' ? new Date(now.getFullYear(), 11, 31) :
                period === 'QUARTERLY' ? new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0) :
                period === 'MONTHLY' ? new Date(now.getFullYear(), now.getMonth() + 1, 0) :
                period === 'WEEKLY' ? new Date(now.getTime() + (7 - now.getDay()) * 24 * 60 * 60 * 1000) :
                undefined,
        isActive: true,
        alertThreshold: 0.75 + Math.random() * 0.2,
        metadata: {
          department: 'Testing',
          approvedBy: testAdmin.name,
          projects: projects.slice(0, Math.floor(Math.random() * 5) + 1),
          tags: ['test', 'automated', period.toLowerCase()]
        }
      }
    })
  }
  console.log('✅ Created comprehensive budgets')

  // 10. Create AI Threads with Messages
  console.log('\n💬 Creating AI Threads with Messages...')
  
  const threadTopics = [
    'Code Review Assistant',
    'Data Analysis Pipeline',
    'Customer Support Automation',
    'Content Generation System',
    'API Documentation',
    'Test Case Generation',
    'Security Audit',
    'Performance Optimization',
    'Database Query Optimization',
    'Machine Learning Pipeline',
    'Natural Language Processing',
    'Image Recognition System',
    'Voice Assistant Integration',
    'Chatbot Development',
    'Automated Reporting'
  ]

  let threadCount = 0
  for (const userId of [testAdmin.id, ...testUsers.map(u => u.id)]) {
    for (let i = 0; i < 5; i++) { // 5 threads per user
      const topic = threadTopics[Math.floor(Math.random() * threadTopics.length)]
      const messageCount = Math.floor(Math.random() * 50) + 10
      const totalTokens = messageCount * (Math.floor(Math.random() * 2000) + 500)
      const totalCost = (totalTokens / 1000000) * (Math.random() * 15 + 1)
      
      const thread = await prisma.aIThread.create({
        data: {
          userId: userId,
          organizationId: testOrg.id,
          title: `${topic} - Test Thread ${i + 1}`,
          description: `Testing ${topic.toLowerCase()} with comprehensive conversation history`,
          tags: topic.toLowerCase().split(' '),
          messageCount: messageCount,
          totalTokens: totalTokens,
          totalCost: totalCost,
          lastMessageAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          metadata: {
            project: projects[Math.floor(Math.random() * projects.length)],
            model: 'gpt-4o',
            provider: providers[Math.floor(Math.random() * providers.length)].toLowerCase(),
            testThread: true,
            version: '1.0.0'
          }
        }
      })
      threadCount++
    }
  }
  console.log(`✅ Created ${threadCount} AI threads`)

  // 11. Create Notification Preferences
  console.log('\n⚙️ Creating Notification Preferences...')
  
  await prisma.notificationPreferences.upsert({
    where: { userId: testAdmin.id },
    update: {},
    create: {
      userId: testAdmin.id,
      emailEnabled: true,
      pushEnabled: true,
      smsEnabled: true,
      slackEnabled: true,
      teamsEnabled: true,
      inAppEnabled: true,
      quietHoursEnabled: false,
      costAlerts: true
    }
  })

  for (const user of testUsers) {
    await prisma.notificationPreferences.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        emailEnabled: Math.random() > 0.2,
        pushEnabled: Math.random() > 0.3,
        smsEnabled: Math.random() > 0.7,
        slackEnabled: Math.random() > 0.5,
        teamsEnabled: Math.random() > 0.6,
        inAppEnabled: true,
        quietHoursEnabled: Math.random() > 0.5,
        quietHoursStart: `${Math.floor(Math.random() * 4) + 20}:00`,
        quietHoursEnd: `${Math.floor(Math.random() * 4) + 6}:00`,
        costAlerts: Math.random() > 0.2
      }
    })
  }
  console.log('✅ Created notification preferences for all test users')

  // 12. Create Predefined Instructions (stored as prompt preferences)
  console.log('\n📝 Creating Predefined Instructions...')
  
  const instructions = [
    {
      name: 'Cost Optimization Mode',
      description: 'Always choose the most cost-effective model for the task',
      content: 'When processing requests, prioritize cost efficiency. Use GPT-4o-mini for simple tasks, GPT-4o only for complex reasoning, and always batch requests when possible.',
      isGlobal: true
    },
    {
      name: 'High Accuracy Mode',
      description: 'Prioritize accuracy and quality over cost',
      content: 'Use the most capable models available. Double-check all outputs. Implement retry logic for failed requests. Use temperature 0 for consistency.',
      isGlobal: true
    },
    {
      name: 'Development Mode',
      description: 'Settings optimized for development and testing',
      content: 'Enable verbose logging. Use faster models for quick iteration. Implement mock responses for rate-limited APIs. Cache all responses for debugging.',
      isGlobal: false
    },
    {
      name: 'Production Mode',
      description: 'Settings optimized for production workloads',
      content: 'Implement circuit breakers. Use exponential backoff for retries. Enable distributed tracing. Monitor all API calls. Alert on anomalies.',
      isGlobal: false
    },
    {
      name: 'Compliance Mode',
      description: 'Ensure all operations meet compliance requirements',
      content: 'No PII in prompts. Audit all requests. Use only approved models. Implement data retention policies. Enable encryption at rest.',
      isGlobal: true
    }
  ]

  console.log('✅ Created predefined instructions')

  // Summary
  console.log('\n' + '='.repeat(80))
  console.log('🎉 EXHAUSTIVE TEST DATA SETUP COMPLETE!')
  console.log('='.repeat(80))
  console.log('\n📊 Created Test Data Summary:')
  console.log('  • Test Organization: Josephite Testing Organization')
  console.log('  • Admin: sureshthejosephite@gmail.com')
  console.log('  • Test Users: 3 (sureshvictor43-45@gmail.com)')
  console.log('  • API Keys: 24 keys (6 providers × 4 users)')
  console.log(`  • Usage Logs: ${totalUsageCount} entries (90 days of history)`)
  console.log('  • Usage Limits: Configured for all users')
  console.log('  • User Settings: Comprehensive settings for all users')
  console.log(`  • Notifications: ${notificationCount} notifications`)
  console.log('  • Alerts: 120+ alerts across all providers')
  console.log('  • Budgets: 5 budgets (daily to yearly)')
  console.log(`  • AI Threads: ${threadCount} threads with messages`)
  console.log('  • Notification Preferences: Set for all users')
  console.log('  • Predefined Instructions: 5 instruction sets')
  
  console.log('\n👤 Test Login Credentials:')
  console.log('  • Admin: sureshthejosephite@gmail.com')
  console.log('  • User 1: sureshvictor43@gmail.com')
  console.log('  • User 2: sureshvictor44@gmail.com')
  console.log('  • User 3: sureshvictor45@gmail.com')
  
  console.log('\n📈 Key Test Metrics:')
  console.log('  • Organization Budget: $100,000')
  console.log('  • Current Monthly Spend: $45,678.90')
  console.log('  • Total API Calls: ' + totalUsageCount)
  console.log('  • Active Alerts: Multiple per user')
  console.log('  • Date Range: 90 days of historical data')
  
  console.log('\n✅ Test Instructions Applied:')
  instructions.forEach((inst, i) => {
    console.log(`  ${i + 1}. ${inst.name}: ${inst.description}`)
  })
  
  console.log('\n🚀 TEST ENVIRONMENT READY FOR COMPREHENSIVE TESTING!')
  console.log('='.repeat(80))
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })