import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting enterprise seed...')

  try {
    // 1. Create or update super admin (Victor)
    const superAdmin = await prisma.user.upsert({
      where: { email: 'victor@aicostguardian.com' },
      update: {
        isSuperAdmin: true,
        role: 'SUPER_ADMIN',
        name: 'Victor',
        emailVerified: new Date()
      },
      create: {
        email: 'victor@aicostguardian.com',
        name: 'Victor',
        isSuperAdmin: true,
        role: 'SUPER_ADMIN',
        emailVerified: new Date()
      }
    })
    console.log('✅ Super Admin created/updated:', superAdmin.email)

    // 2. Create AssetWorks AI organization
    const assetWorksOrg = await prisma.organization.upsert({
      where: { domain: 'assetworks.ai' },
      update: {
        name: 'AssetWorks AI',
        subscription: 'ENTERPRISE',
        isActive: true,
        industry: 'Technology',
        size: '51-200',
        website: 'https://assetworks.ai',
        description: 'AI-powered asset management and reporting solutions',
        contactEmail: 'tech.admin@assetworks.ai',
        allowedProviders: ['openai', 'anthropic', 'google', 'grok'],
        maxUsers: 100,
        maxApiKeys: 20,
        spendLimit: 10000,
        billingEmail: 'billing@assetworks.ai',
        billingCycle: 'monthly'
      },
      create: {
        name: 'AssetWorks AI',
        domain: 'assetworks.ai',
        subscription: 'ENTERPRISE',
        isActive: true,
        industry: 'Technology',
        size: '51-200',
        website: 'https://assetworks.ai',
        description: 'AI-powered asset management and reporting solutions',
        contactEmail: 'tech.admin@assetworks.ai',
        allowedProviders: ['openai', 'anthropic', 'google', 'grok'],
        maxUsers: 100,
        maxApiKeys: 20,
        spendLimit: 10000,
        billingEmail: 'billing@assetworks.ai',
        billingCycle: 'monthly'
      }
    })
    console.log('✅ Organization created/updated:', assetWorksOrg.name)

    // 3. Create AssetWorks admin
    const assetWorksAdmin = await prisma.user.upsert({
      where: { email: 'tech.admin@assetworks.ai' },
      update: {
        role: 'ADMIN',
        organizationId: assetWorksOrg.id,
        name: 'Tech Admin',
        department: 'Technology',
        jobTitle: 'Technology Administrator',
        emailVerified: new Date(),
        acceptedAt: new Date()
      },
      create: {
        email: 'tech.admin@assetworks.ai',
        name: 'Tech Admin',
        role: 'ADMIN',
        organizationId: assetWorksOrg.id,
        department: 'Technology',
        jobTitle: 'Technology Administrator',
        emailVerified: new Date(),
        invitedBy: 'victor@aicostguardian.com',
        invitedAt: new Date(),
        acceptedAt: new Date()
      }
    })
    console.log('✅ AssetWorks Admin created/updated:', assetWorksAdmin.email)

    // 4. Create AssetWorks members
    const members = [
      {
        email: 'suresh.victor@assetworks.ai',
        name: 'Suresh Victor',
        department: 'Engineering',
        jobTitle: 'Senior Software Engineer'
      },
      {
        email: 'victor.salomon@assetworks.ai',
        name: 'Victor Salomon',
        department: 'Product',
        jobTitle: 'Product Manager'
      },
      {
        email: 'ram.s@assetworks.ai',
        name: 'Ram S',
        department: 'Engineering',
        jobTitle: 'DevOps Engineer'
      }
    ]

    for (const member of members) {
      const user = await prisma.user.upsert({
        where: { email: member.email },
        update: {
          role: 'USER',
          organizationId: assetWorksOrg.id,
          name: member.name,
          department: member.department,
          jobTitle: member.jobTitle,
          emailVerified: new Date(),
          acceptedAt: new Date()
        },
        create: {
          email: member.email,
          name: member.name,
          role: 'USER',
          organizationId: assetWorksOrg.id,
          department: member.department,
          jobTitle: member.jobTitle,
          emailVerified: new Date(),
          invitedBy: 'tech.admin@assetworks.ai',
          invitedAt: new Date(),
          acceptedAt: new Date()
        }
      })
      console.log('✅ Member created/updated:', user.email)
    }

    // 5. Create sample API keys for AssetWorks
    const providers = ['openai', 'anthropic', 'google']
    for (const provider of providers) {
      await prisma.apiKey.upsert({
        where: {
          userId_provider: {
            userId: assetWorksAdmin.id,
            provider: provider
          }
        },
        update: {
          isActive: true,
          organizationId: assetWorksOrg.id
        },
        create: {
          provider: provider,
          encryptedKey: `encrypted_${provider}_key_sample`, // In production, this would be properly encrypted
          userId: assetWorksAdmin.id,
          organizationId: assetWorksOrg.id,
          isActive: true
        }
      })
    }
    console.log('✅ Sample API keys created for AssetWorks')

    // 6. Create sample usage data for AssetWorks members
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    for (const member of [assetWorksAdmin, ...members]) {
      const memberUser = await prisma.user.findUnique({
        where: { email: member.email }
      })

      if (memberUser) {
        // Create sample usage logs
        for (let i = 0; i < 5; i++) {
          const timestamp = new Date(
            thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
          )
          
          await prisma.usageLog.create({
            data: {
              provider: providers[Math.floor(Math.random() * providers.length)],
              model: 'gpt-4',
              promptTokens: Math.floor(Math.random() * 1000) + 100,
              completionTokens: Math.floor(Math.random() * 500) + 50,
              totalTokens: Math.floor(Math.random() * 1500) + 150,
              cost: Math.random() * 10 + 0.5,
              timestamp: timestamp,
              userId: memberUser.id,
              organizationId: assetWorksOrg.id
            }
          })
        }

        // Update last active
        await prisma.user.update({
          where: { id: memberUser.id },
          data: { lastActiveAt: now }
        })
      }
    }
    console.log('✅ Sample usage data created')

    // 7. Create additional test organizations
    const testOrgs = [
      {
        name: 'TechCorp Solutions',
        domain: 'techcorp.com',
        subscription: 'GROWTH',
        industry: 'Software',
        size: '201-500'
      },
      {
        name: 'DataSync Industries',
        domain: 'datasync.io',
        subscription: 'STARTER',
        industry: 'Data Analytics',
        size: '1-50'
      },
      {
        name: 'CloudFirst Enterprises',
        domain: 'cloudfirst.net',
        subscription: 'SCALE',
        industry: 'Cloud Computing',
        size: '501-1000'
      }
    ]

    for (const org of testOrgs) {
      const createdOrg = await prisma.organization.upsert({
        where: { domain: org.domain },
        update: org as any,
        create: {
          ...org,
          isActive: true,
          allowedProviders: ['openai', 'anthropic'],
          maxUsers: org.subscription === 'STARTER' ? 10 : org.subscription === 'GROWTH' ? 50 : 100
        } as any
      })
      console.log('✅ Test organization created/updated:', createdOrg.name)
    }

    // 8. Update organization spend
    const orgs = await prisma.organization.findMany()
    for (const org of orgs) {
      const totalSpend = await prisma.usageLog.aggregate({
        where: { organizationId: org.id },
        _sum: { cost: true }
      })
      
      await prisma.organization.update({
        where: { id: org.id },
        data: { monthlySpend: totalSpend._sum.cost || 0 }
      })
    }
    console.log('✅ Organization spend updated')

    console.log('✨ Enterprise seed completed successfully!')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })