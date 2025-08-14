import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Creating organization: AssetWorks Pro...')

  const domain = 'assetworks.pro'

  // Create or update organization
  const organization = await prisma.organization.upsert({
    where: { domain },
    update: {
      name: 'AssetWorks Pro',
      subscription: 'ENTERPRISE',
      isActive: true,
      industry: 'Technology',
      size: '51-200',
      website: 'https://assetworks.pro',
      description: 'Advanced AI asset management platform (Pro)',
      contactEmail: 'admin@assetworks.pro',
      allowedProviders: ['openai', 'anthropic', 'google', 'grok'],
      maxUsers: 100,
      maxApiKeys: 20,
      spendLimit: 20000,
      billingEmail: 'billing@assetworks.pro',
      billingCycle: 'monthly'
    },
    create: {
      name: 'AssetWorks Pro',
      domain,
      subscription: 'ENTERPRISE',
      isActive: true,
      industry: 'Technology',
      size: '51-200',
      website: 'https://assetworks.pro',
      description: 'Advanced AI asset management platform (Pro)',
      contactEmail: 'admin@assetworks.pro',
      allowedProviders: ['openai', 'anthropic', 'google', 'grok'],
      maxUsers: 100,
      maxApiKeys: 20,
      spendLimit: 20000,
      billingEmail: 'billing@assetworks.pro',
      billingCycle: 'monthly'
    }
  })

  console.log('✅ Organization ready:', organization.name)

  // Create or update admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@assetworks.pro' },
    update: {
      name: 'AssetWorks Pro Admin',
      role: 'ADMIN',
      organizationId: organization.id,
      emailVerified: new Date()
    },
    create: {
      email: 'admin@assetworks.pro',
      name: 'AssetWorks Pro Admin',
      role: 'ADMIN',
      organizationId: organization.id,
      company: 'AssetWorks Pro',
      emailVerified: new Date()
    }
  })

  console.log('✅ Admin user ready:', adminUser.email)

  // Ensure default notification preferences exist
  await prisma.notificationPreferences.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      emailEnabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      costAlerts: true,
      usageAlerts: true,
      systemAlerts: true,
      teamAlerts: true,
      reports: true,
      recommendations: true
    }
  })

  console.log('📦 AssetWorks Pro setup complete.')
}

main()
  .catch((e) => {
    console.error('❌ Failed to create AssetWorks Pro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


