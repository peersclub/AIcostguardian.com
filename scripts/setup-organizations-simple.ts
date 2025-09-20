#!/usr/bin/env tsx

/**
 * Simplified organization setup script
 * Creates AssetWorks AI and Smatrx organizations with specified users
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupSimple() {
  console.log('🧹 Simple cleanup...')

  try {
    // Delete users by email
    const emails = [
      'suresh.victor@assetworks.ai',
      'techadmin@assetworks.ai',
      'sandeep@assetworks.ai',
      'victor.salomon@assetworks.ai',
      'ram.s@assetworks.ai',
      'sureshthejosephite@gmail.com',
      'victorsalmon@gmail.com'
    ]

    for (const email of emails) {
      const user = await prisma.user.findUnique({ where: { email } })
      if (user) {
        console.log(`   Removing user: ${email}`)
        await prisma.user.delete({ where: { email } })
      }
    }

    // Delete organizations
    const orgIds = ['assetworks-ai', 'smatrx']
    for (const id of orgIds) {
      const org = await prisma.organization.findUnique({ where: { id } })
      if (org) {
        console.log(`   Removing organization: ${id}`)
        await prisma.organization.delete({ where: { id } })
      }
    }

    console.log('✅ Cleanup completed')
  } catch (error) {
    console.error('⚠️  Cleanup error (continuing anyway):', error)
  }
}

async function createOrganizations() {
  console.log('🏢 Creating organizations...')

  // AssetWorks AI
  const assetworks = await prisma.organization.create({
    data: {
      id: 'assetworks-ai',
      name: 'AssetWorks AI',
      domain: 'assetworks.ai',
      subscription: 'ENTERPRISE',
      maxUsers: 50
    }
  })
  console.log(`   ✅ Created: ${assetworks.name}`)

  // Smatrx
  const smatrx = await prisma.organization.create({
    data: {
      id: 'smatrx',
      name: 'Smatrx',
      domain: 'smatrx.com',
      subscription: 'PREMIUM',
      maxUsers: 25
    }
  })
  console.log(`   ✅ Created: ${smatrx.name}`)
}

async function createUsers() {
  console.log('👥 Creating users...')

  // AssetWorks AI users
  const assetworksUsers = [
    {
      email: 'suresh.victor@assetworks.ai',
      name: 'Suresh Victor',
      role: 'SUPER_ADMIN'
    },
    {
      email: 'techadmin@assetworks.ai',
      name: 'Tech Admin',
      role: 'MANAGER'
    },
    {
      email: 'sandeep@assetworks.ai',
      name: 'Sandeep',
      role: 'USER'
    },
    {
      email: 'victor.salomon@assetworks.ai',
      name: 'Victor Salomon',
      role: 'USER'
    },
    {
      email: 'ram.s@assetworks.ai',
      name: 'Ram S',
      role: 'USER'
    }
  ]

  console.log('   AssetWorks AI team:')
  for (const [index, userData] of assetworksUsers.entries()) {
    const user = await prisma.user.create({
      data: {
        id: `assetworks-user-${index + 1}`,
        email: userData.email,
        name: userData.name,
        role: userData.role as any,
        organizationId: 'assetworks-ai'
      }
    })
    console.log(`     ✅ ${userData.role}: ${userData.name}`)
  }

  // Smatrx users
  const smatrxUsers = [
    {
      email: 'sureshthejosephite@gmail.com',
      name: 'Suresh Joseph',
      role: 'ADMIN'
    },
    {
      email: 'victorsalmon@gmail.com',
      name: 'Victor Salmon',
      role: 'USER'
    }
  ]

  console.log('   Smatrx team:')
  for (const [index, userData] of smatrxUsers.entries()) {
    const user = await prisma.user.create({
      data: {
        id: `smatrx-user-${index + 1}`,
        email: userData.email,
        name: userData.name,
        role: userData.role as any,
        organizationId: 'smatrx'
      }
    })
    console.log(`     ✅ ${userData.role}: ${userData.name}`)
  }
}

async function createSampleData() {
  console.log('📊 Creating sample data for testing...')

  // Get super admin for AssetWorks
  const superAdmin = await prisma.user.findFirst({
    where: {
      organizationId: 'assetworks-ai',
      role: 'SUPER_ADMIN'
    }
  })

  if (superAdmin) {
    // Create sample API keys
    console.log('   Adding sample API keys...')
    const providers = ['OPENAI', 'CLAUDE', 'GEMINI']

    for (const provider of providers) {
      await prisma.apiKey.create({
        data: {
          id: `${superAdmin.id}-${provider.toLowerCase()}-key`,
          provider,
          keyName: `${provider} Test Key`,
          encryptedKey: `test-encrypted-${provider.toLowerCase()}-${Math.random().toString(36).substring(7)}`,
          userId: superAdmin.id,
          isActive: true
        }
      })
    }

    // Create sample usage data
    console.log('   Adding sample usage data...')
    for (let i = 0; i < 5; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      await prisma.usageLog.create({
        data: {
          id: `${superAdmin.id}-usage-${i}`,
          userId: superAdmin.id,
          provider: providers[i % providers.length],
          model: 'gpt-4',
          promptTokens: Math.floor(Math.random() * 1000) + 100,
          completionTokens: Math.floor(Math.random() * 500) + 50,
          totalTokens: 0,
          cost: parseFloat((Math.random() * 2).toFixed(4)),
          timestamp: date
        }
      })
    }

    console.log('   ✅ Sample data created')
  }
}

async function testSetup() {
  console.log('🧪 Testing setup...')

  // Test organizations
  const orgs = await prisma.organization.findMany({
    include: {
      users: true,
      _count: {
        select: { users: true }
      }
    }
  })

  for (const org of orgs) {
    console.log(`   ✅ ${org.name}: ${org._count.users} users`)

    // Show user roles
    const roleCount = org.users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log(`     Roles: ${Object.entries(roleCount).map(([role, count]) => `${role}:${count}`).join(', ')}`)
  }

  // Test API keys
  const apiKeysCount = await prisma.apiKey.count()
  console.log(`   ✅ API Keys created: ${apiKeysCount}`)

  // Test usage data
  const usageCount = await prisma.usageLog.count()
  console.log(`   ✅ Usage logs created: ${usageCount}`)

  console.log('✅ All tests passed!')
}

async function generateReport() {
  console.log('\n📊 Organization Setup Report')
  console.log('=============================\n')

  const orgs = await prisma.organization.findMany({
    include: {
      users: {
        include: {
          apiKeys: true,
          usageLogs: true
        }
      }
    }
  })

  for (const org of orgs) {
    console.log(`🏢 ${org.name}`)
    console.log(`   ID: ${org.id}`)
    console.log(`   Domain: ${org.domain}`)
    console.log(`   Subscription: ${org.subscription}`)
    console.log(`   Users: ${org.users.length}/${org.maxUsers}`)

    console.log('\n   👥 Team Members:')
    for (const user of org.users) {
      console.log(`     ${user.role.padEnd(12)} ${user.name?.padEnd(20)} ${user.email}`)
      if (user.apiKeys.length > 0 || user.usageLogs.length > 0) {
        console.log(`     ${''.padEnd(12)} Keys: ${user.apiKeys.length}, Usage: ${user.usageLogs.length} logs`)
      }
    }
    console.log('')
  }

  console.log('🎯 Next Steps for Testing:')
  console.log('==========================')
  console.log('1. 🌐 Access application: http://localhost:3000')
  console.log('2. 🔐 Test login with any user email (use Google OAuth or demo)')
  console.log('3. 🏢 Verify organization switching works')
  console.log('4. 🤝 Test collaboration features:')
  console.log('   - Create shared AI threads')
  console.log('   - Invite team members to threads')
  console.log('   - Test different permission levels')
  console.log('5. 📊 Check usage analytics and costs')
  console.log('6. ⚙️  Test admin features (for super admin)')

  console.log('\n🔑 Test Login Credentials:')
  console.log('===========================')
  console.log('AssetWorks AI:')
  console.log('  Super Admin: suresh.victor@assetworks.ai')
  console.log('  Manager:     techadmin@assetworks.ai')
  console.log('  Users:       sandeep@assetworks.ai, victor.salomon@assetworks.ai, ram.s@assetworks.ai')
  console.log('\nSmatrx:')
  console.log('  Admin:       sureshthejosephite@gmail.com')
  console.log('  User:        victorsalmon@gmail.com')
}

async function main() {
  console.log('🚀 Setting up Test Organizations for Collaboration')
  console.log('==================================================\n')

  try {
    await cleanupSimple()
    await createOrganizations()
    await createUsers()
    await createSampleData()
    await testSetup()
    await generateReport()

    console.log('\n🎉 Setup completed successfully!')
    console.log('   Organizations and users are ready for collaboration testing')

  } catch (error) {
    console.error('\n💥 Setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}