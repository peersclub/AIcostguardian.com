import { PrismaClient } from '@prisma/client'
import { encrypt } from '../lib/encryption'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // 1. Create Organization
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
      email: 'admin@assetworks.com',
      name: 'AssetWorks Admin',
      role: 'ADMIN',
      organizationId: organization.id,
      company: 'AssetWorks'
    }
  })
  console.log('✅ Created admin user:', mainUser.email)

  // 3. Create additional team members
  const users = [
    {
      email: 'developer@assetworks.com',
      name: 'John Developer',
      role: 'USER' as const,
      organizationId: organization.id,
      company: 'AssetWorks'
    },
    {
      email: 'analyst@assetworks.com',
      name: 'Sarah Analyst',
      role: 'USER' as const,
      organizationId: organization.id,
      company: 'AssetWorks'
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

  // 4. Add Sample API Keys
  const apiKeys = [
    { provider: 'openai', sampleKey: 'sk-proj-sample-key' },
    { provider: 'claude', sampleKey: 'sk-ant-sample-key' },
    { provider: 'gemini', sampleKey: 'AIzaSy-sample-key' },
    { provider: 'grok', sampleKey: 'xai-sample-key' }
  ]

  console.log('\n📝 Creating sample API keys...')
  
  for (const keyData of apiKeys) {
    try {
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
      console.log(`✅ Created ${keyData.provider} API key`)
    } catch (error) {
      console.log(`⚠️  Failed to create ${keyData.provider} key:`, error)
    }
  }

  // 5. Create some usage data
  const today = new Date()
  const yesterday = new Date(Date.now() - 86400000)
  
  console.log('\n📊 Creating usage data...')
  
  const usageData = [
    {
      userId: mainUser.id,
      organizationId: organization.id,
      provider: 'openai',
      model: 'gpt-4o',
      promptTokens: 5000,
      completionTokens: 3000,
      totalTokens: 8000,
      cost: 0.12,
      timestamp: yesterday
    },
    {
      userId: mainUser.id,
      organizationId: organization.id,
      provider: 'claude',
      model: 'claude-3-5-sonnet',
      promptTokens: 3000,
      completionTokens: 2000,
      totalTokens: 5000,
      cost: 0.09,
      timestamp: today
    }
  ]

  for (const usage of usageData) {
    await prisma.usageLog.create({ data: usage })
  }
  console.log('✅ Created sample usage data')

  // 6. Create alerts
  const alerts = [
    {
      userId: mainUser.id,
      type: 'USAGE_SPIKE',
      provider: 'openai',
      threshold: 100,
      message: 'API usage increased by 150% compared to last week'
    }
  ]

  console.log('\n🔔 Creating alerts...')
  for (const alert of alerts) {
    await prisma.alert.create({ data: alert })
  }
  console.log('✅ Created sample alerts')

  // 7. Create notification preferences
  await prisma.notificationPreferences.upsert({
    where: { userId: mainUser.id },
    update: {},
    create: {
      userId: mainUser.id,
      emailEnabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      costAlerts: true,
      usageAlerts: true,
      systemAlerts: true,
      teamAlerts: false,
      reports: false,
      recommendations: true
    }
  })
  console.log('✅ Created notification preferences')

  // 8. Create budgets
  const budgets = [
    {
      organizationId: organization.id,
      name: 'Monthly AI Budget',
      amount: 1000,
      period: 'MONTHLY' as const,
      startDate: new Date(today.getFullYear(), today.getMonth(), 1),
      isActive: true,
      alertThreshold: 0.8
    },
    {
      organizationId: organization.id,
      name: 'Daily Safety Limit',
      amount: 50,
      period: 'DAILY' as const,
      startDate: today,
      isActive: true,
      alertThreshold: 0.9
    }
  ]

  console.log('\n💰 Creating budgets...')
  for (const budget of budgets) {
    await prisma.budget.create({ data: budget })
  }
  console.log('✅ Created budgets')

  console.log('\n' + '='.repeat(60))
  console.log('🎉 DATABASE SETUP COMPLETE!')
  console.log('='.repeat(60))
  console.log('\n📋 Created Resources:')
  console.log('  • Organization: AssetWorks')
  console.log('  • Admin User: admin@assetworks.com')
  console.log('  • Team Members: 3 users')
  console.log('  • API Keys: 4 providers')
  console.log('  • Usage Data: Sample data')
  console.log('  • Alerts: 1 active alert')
  console.log('  • Budgets: Monthly and daily limits')
  console.log('\n🔐 To sign in:')
  console.log('  1. Go to http://localhost:3000')
  console.log('  2. Click "Sign In"')
  console.log('  3. Use Google OAuth with admin@assetworks.com')
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