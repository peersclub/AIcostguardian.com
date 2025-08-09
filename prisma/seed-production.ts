import { PrismaClient } from '@prisma/client'
import { encrypt } from '../lib/encryption'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting production database seed...')

  // 1. Create AssetWorks Organization
  const organization = await prisma.organization.upsert({
    where: { id: 'assetworks-org' },
    update: {},
    create: {
      id: 'assetworks-org',
      name: 'AssetWorks',
      domain: 'assetworks.com',
      plan: 'ENTERPRISE',
      billingEmail: 'billing@assetworks.com',
      stripeCustomerId: 'cus_assetworks_001',
      settings: {
        allowedProviders: ['OPENAI', 'ANTHROPIC', 'GOOGLE', 'XAI', 'PERPLEXITY'],
        maxMonthlySpend: 10000,
        alertThreshold: 0.8
      },
      metadata: {
        industry: 'Technology',
        size: 'Enterprise',
        created: new Date().toISOString()
      }
    }
  })
  console.log('✅ Created organization:', organization.name)

  // 2. Create main user account
  const mainUser = await prisma.user.upsert({
    where: { email: 'admin@assetworks.com' },
    update: {},
    create: {
      id: 'user-assetworks-admin',
      email: 'admin@assetworks.com',
      name: 'AssetWorks Admin',
      role: 'ADMIN',
      organizationId: organization.id,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    }
  })
  console.log('✅ Created admin user:', mainUser.email)

  // 3. Create additional team members
  const users = [
    {
      id: 'user-assetworks-dev1',
      email: 'developer@assetworks.com',
      name: 'John Developer',
      role: 'USER' as const,
      organizationId: organization.id,
    },
    {
      id: 'user-assetworks-analyst',
      email: 'analyst@assetworks.com',
      name: 'Sarah Analyst',
      role: 'USER' as const,
      organizationId: organization.id,
    }
  ]

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData
    })
    console.log('✅ Created user:', userData.email)
  }

  // 4. Add Sample API Keys (you'll need to update these with real ones)
  const apiKeys = [
    {
      provider: 'OPENAI' as const,
      sampleKey: 'sk-proj-sample-openai-key-replace-with-real',
      label: 'OpenAI GPT-4 Access'
    },
    {
      provider: 'ANTHROPIC' as const,
      sampleKey: 'sk-ant-api-sample-anthropic-key-replace-with-real',
      label: 'Claude 3.5 Access'
    },
    {
      provider: 'GOOGLE' as const,
      sampleKey: 'AIzaSy-sample-google-key-replace-with-real',
      label: 'Gemini Pro Access'
    },
    {
      provider: 'XAI' as const,
      sampleKey: 'xai-sample-key-replace-with-real',
      label: 'Grok Access'
    },
    {
      provider: 'PERPLEXITY' as const,
      sampleKey: 'pplx-sample-key-replace-with-real',
      label: 'Perplexity Access'
    }
  ]

  console.log('\n📝 Creating sample API keys (replace with real ones)...')
  
  for (const keyData of apiKeys) {
    try {
      // Encrypt the API key
      const encryptedString = encrypt(keyData.sampleKey)
      const [iv, tag, ...encryptedParts] = encryptedString.split(':')
      const encryptedKey = encryptedParts.join(':')

      await prisma.apiKey.upsert({
        where: {
          userId_provider: {
            userId: mainUser.id,
            provider: keyData.provider
          }
        },
        update: {},
        create: {
          userId: mainUser.id,
          provider: keyData.provider,
          encryptedKey,
          iv,
          tag,
          label: keyData.label,
          isActive: true,
          organizationId: organization.id,
          metadata: {
            environment: 'production',
            addedBy: 'seed-script'
          }
        }
      })
      console.log(`✅ Created ${keyData.provider} API key (sample - replace with real key)`)
    } catch (error) {
      console.log(`⚠️  Failed to create ${keyData.provider} key:`, error)
    }
  }

  // 5. Create some usage data
  const today = new Date()
  const yesterday = new Date(Date.now() - 86400000)
  const twoDaysAgo = new Date(Date.now() - 172800000)
  
  console.log('\n📊 Creating usage data...')
  
  const usageData = [
    {
      userId: mainUser.id,
      organizationId: organization.id,
      provider: 'OPENAI' as const,
      model: 'gpt-4o',
      operation: 'completion',
      inputTokens: 5000,
      outputTokens: 3000,
      totalTokens: 8000,
      cost: 0.12,
      responseTime: 2500,
      statusCode: 200,
      timestamp: yesterday,
      metadata: {
        endpoint: '/api/chat',
        success: true
      }
    },
    {
      userId: mainUser.id,
      organizationId: organization.id,
      provider: 'ANTHROPIC' as const,
      model: 'claude-3-5-sonnet-20241022',
      operation: 'completion',
      inputTokens: 3000,
      outputTokens: 2000,
      totalTokens: 5000,
      cost: 0.09,
      responseTime: 1800,
      statusCode: 200,
      timestamp: twoDaysAgo,
      metadata: {
        endpoint: '/api/chat',
        success: true
      }
    },
    {
      userId: mainUser.id,
      organizationId: organization.id,
      provider: 'GOOGLE' as const,
      model: 'gemini-1.5-pro',
      operation: 'completion',
      inputTokens: 10000,
      outputTokens: 5000,
      totalTokens: 15000,
      cost: 0.07,
      responseTime: 3200,
      statusCode: 200,
      timestamp: today,
      metadata: {
        endpoint: '/api/chat',
        success: true
      }
    }
  ]

  for (const usage of usageData) {
    await prisma.usageLog.create({
      data: usage
    })
  }
  console.log('✅ Created sample usage data')

  // 6. Create alerts
  const alerts = [
    {
      organizationId: organization.id,
      type: 'USAGE_SPIKE' as const,
      severity: 'MEDIUM' as const,
      title: 'Unusual API usage detected',
      message: 'API usage has increased by 150% compared to last week',
      isRead: false,
      metadata: {
        currentUsage: 15000,
        previousUsage: 6000,
        percentageIncrease: 150
      }
    },
    {
      organizationId: organization.id,
      type: 'BUDGET_EXCEEDED' as const,
      severity: 'HIGH' as const,
      title: 'Approaching monthly budget limit',
      message: 'You have used 85% of your monthly API budget',
      isRead: false,
      metadata: {
        budgetUsed: 850,
        budgetLimit: 1000,
        percentageUsed: 85
      }
    }
  ]

  console.log('\n🔔 Creating alerts...')
  for (const alert of alerts) {
    try {
      await prisma.alert.create({
        data: alert
      })
    } catch (error) {
      console.log('⚠️  Failed to create alert:', error)
    }
  }
  console.log('✅ Created sample alerts')

  // 7. Create notification preferences
  try {
    await prisma.notificationPreferences.upsert({
      where: { userId: mainUser.id },
      update: {},
      create: {
        userId: mainUser.id,
        email: true,
        push: true,
        sms: false,
        slack: false,
        teams: false,
        webhook: false,
        // Alert preferences
        costAlerts: true,
        usageAlerts: true,
        performanceAlerts: true,
        securityAlerts: true,
        // Thresholds
        costThreshold: 100,
        usageThreshold: 10000,
        // Frequency
        dailyDigest: true,
        weeklyReport: true,
        monthlyReport: true,
        // Quiet hours
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        timezone: 'America/New_York'
      }
    })
    console.log('✅ Created notification preferences')
  } catch (error) {
    console.log('⚠️  Failed to create notification preferences:', error)
  }

  // 8. Create budgets
  const budgets = [
    {
      organizationId: organization.id,
      name: 'Monthly AI Budget',
      amount: 1000,
      period: 'MONTHLY' as const,
      startDate: new Date(today.getFullYear(), today.getMonth(), 1),
      isActive: true,
      alertThreshold: 0.8,
      metadata: {
        department: 'Engineering',
        approvedBy: 'CFO'
      }
    },
    {
      organizationId: organization.id,
      name: 'Daily Safety Limit',
      amount: 50,
      period: 'DAILY' as const,
      startDate: today,
      isActive: true,
      alertThreshold: 0.9,
      metadata: {
        type: 'safety-limit',
        autoRenew: true
      }
    }
  ]

  console.log('\n💰 Creating budgets...')
  for (const budget of budgets) {
    try {
      await prisma.budget.create({
        data: budget
      })
    } catch (error) {
      console.log('⚠️  Failed to create budget:', error)
    }
  }
  console.log('✅ Created budgets')

  // 9. Create subscription (if it exists in your schema)
  try {
    await prisma.subscription.create({
      data: {
        organizationId: organization.id,
        plan: 'ENTERPRISE',
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        cancelAtPeriodEnd: false,
        metadata: {
          seats: 100,
          features: ['unlimited-api-calls', 'priority-support', 'custom-models']
        }
      }
    })
    console.log('✅ Created subscription')
  } catch (error) {
    console.log('⚠️  Subscription table might not exist:', error)
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎉 DATABASE SETUP COMPLETE!')
  console.log('='.repeat(60))
  console.log('\n📋 Created Resources:')
  console.log('  • Organization: AssetWorks')
  console.log('  • Admin User: admin@assetworks.com')
  console.log('  • Team Members: 3 users')
  console.log('  • API Keys: 5 providers (samples - replace with real keys)')
  console.log('  • Usage Data: Sample data for analytics')
  console.log('  • Alerts: 2 active alerts')
  console.log('  • Budgets: Monthly and daily limits')
  console.log('\n⚠️  IMPORTANT NEXT STEPS:')
  console.log('  1. Sign in with Google OAuth using admin@assetworks.com')
  console.log('  2. Go to Settings and replace sample API keys with real ones')
  console.log('  3. Test the AI Chat feature with real models')
  console.log('\n🔐 To sign in:')
  console.log('  1. Go to http://localhost:3000')
  console.log('  2. Click "Sign In"')
  console.log('  3. Use Google OAuth')
  console.log('  Note: The email admin@assetworks.com is pre-configured')
  console.log('='.repeat(60))
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })