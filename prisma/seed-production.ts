import { PrismaClient } from '@prisma/client'
import { encrypt } from '../lib/encryption'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting production database seed...')

  // 1. Create AssetWorks Organization
  const organization = await prisma.organization.upsert({
    where: { domain: 'assetworks.com' },
    update: {},
    create: {
      name: 'AssetWorks',
      domain: 'assetworks.com',
      subscription: 'ENTERPRISE',
      spendLimit: 10000
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
      // Encrypt the API key (encryption service handles iv/tag internally)
      const encryptedKey = encrypt(keyData.sampleKey)

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
          isActive: true,
          organizationId: organization.id
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
      promptTokens: 5000,
      completionTokens: 3000,
      totalTokens: 8000,
      cost: 0.12,
      timestamp: yesterday,
      metadata: {
        operation: 'completion',
        responseTime: 2500,
        statusCode: 200,
        endpoint: '/api/chat',
        success: true
      }
    },
    {
      userId: mainUser.id,
      organizationId: organization.id,
      provider: 'CLAUDE' as const,
      model: 'claude-3-5-sonnet-20241022',
      promptTokens: 3000,
      completionTokens: 2000,
      totalTokens: 5000,
      cost: 0.09,
      timestamp: twoDaysAgo,
      metadata: {
        operation: 'completion',
        responseTime: 1800,
        statusCode: 200,
        endpoint: '/api/chat',
        success: true
      }
    },
    {
      userId: mainUser.id,
      organizationId: organization.id,
      provider: 'GEMINI' as const,
      model: 'gemini-1.5-pro',
      promptTokens: 10000,
      completionTokens: 5000,
      totalTokens: 15000,
      cost: 0.07,
      timestamp: today,
      metadata: {
        operation: 'completion',
        responseTime: 3200,
        statusCode: 200,
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
      userId: mainUser.id,
      type: 'COST_THRESHOLD',
      provider: 'OPENAI',
      threshold: 100,
      message: 'OpenAI API usage has exceeded $100',
      metadata: {
        severity: 'HIGH',
        currentUsage: 105,
        percentageOverage: 5
      },
      isActive: true
    },
    {
      userId: mainUser.id,
      type: 'COST_THRESHOLD',
      provider: 'CLAUDE',
      threshold: 50,
      message: 'Claude API usage approaching $50 limit',
      metadata: {
        severity: 'MEDIUM',
        currentUsage: 45,
        percentageUsed: 90
      },
      isActive: true
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
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        slackEnabled: false,
        teamsEnabled: false,
        inAppEnabled: true,
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00'
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
  // Note: Subscription model doesn't exist in current schema
  // Uncomment and modify when subscription model is added
  /*
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
  */

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