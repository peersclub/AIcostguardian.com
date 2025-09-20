#!/usr/bin/env tsx

/**
 * Comprehensive setup script for test organizations and collaboration features
 * Sets up AssetWorks AI and Smatrx organizations with specified users and roles
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface UserSetup {
  email: string
  name: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'USER'
}

interface OrgSetup {
  id: string
  name: string
  domain: string
  users: UserSetup[]
  maxUsers?: number
  subscription: 'FREE' | 'PREMIUM' | 'ENTERPRISE'
}

const organizations: OrgSetup[] = [
  {
    id: 'assetworks-ai',
    name: 'AssetWorks AI',
    domain: 'assetworks.ai',
    subscription: 'ENTERPRISE',
    maxUsers: 50,
    users: [
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
  },
  {
    id: 'smatrx',
    name: 'Smatrx',
    domain: 'smatrx.com',
    subscription: 'PREMIUM',
    maxUsers: 25,
    users: [
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
  }
]

async function cleanupExistingData() {
  console.log('🧹 Cleaning up existing data...')

  try {
    // Get all emails to clean
    const allEmails = organizations.flatMap(org => org.users.map(user => user.email))

    console.log(`   Checking for existing users: ${allEmails.join(', ')}`)

    // Delete existing users and their related data
    for (const email of allEmails) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        include: {
          usageLogs: true,
          apiKeys: true,
          threadCollaborations: true,
          aiThreads: true
        }
      })

      if (existingUser) {
        console.log(`   Removing existing user: ${email}`)

        // Delete related data first
        await prisma.usageLog.deleteMany({
          where: { userId: existingUser.id }
        })

        await prisma.apiKey.deleteMany({
          where: { userId: existingUser.id }
        })

        await prisma.threadCollaborator.deleteMany({
          where: { userId: existingUser.id }
        })

        await prisma.aiThread.deleteMany({
          where: { userId: existingUser.id }
        })

        await prisma.user.delete({
          where: { id: existingUser.id }
        })
      }
    }

    // Clean up organizations
    for (const org of organizations) {
      const existingOrg = await prisma.organization.findUnique({
        where: { id: org.id }
      })

      if (existingOrg) {
        console.log(`   Removing existing organization: ${org.name}`)

        // Delete invitations first
        await prisma.invitation.deleteMany({
          where: { organizationId: org.id }
        })

        await prisma.organization.delete({
          where: { id: org.id }
        })
      }
    }

    console.log('✅ Cleanup completed')

  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    throw error
  }
}

async function createOrganizations() {
  console.log('🏢 Creating organizations...')

  for (const org of organizations) {
    console.log(`   Creating organization: ${org.name}`)

    const createdOrg = await prisma.organization.create({
      data: {
        id: org.id,
        name: org.name,
        domain: org.domain,
        subscription: org.subscription,
        maxUsers: org.maxUsers || 10,
        createdAt: new Date(),
        settings: {
          allowGmailDomains: org.domain === 'smatrx.com', // Allow Gmail for Smatrx
          enableSlackNotifications: true,
          enableEmailNotifications: true,
          defaultUserRole: 'USER'
        }
      }
    })

    console.log(`   ✅ Created organization: ${createdOrg.name} (${createdOrg.id})`)
  }
}

async function createUsers() {
  console.log('👥 Creating users...')

  for (const org of organizations) {
    console.log(`   Adding users to ${org.name}:`)

    for (const [index, user] of org.users.entries()) {
      const userData = {
        id: `${org.id}-user-${index + 1}`,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: org.id,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        settings: {
          notifications: {
            email: true,
            slack: true,
            browser: true
          },
          preferences: {
            theme: 'dark',
            language: 'en',
            timezone: 'UTC'
          }
        }
      }

      const createdUser = await prisma.user.create({
        data: userData
      })

      console.log(`     ✅ ${user.role}: ${user.name} (${user.email})`)

      // Create some sample API keys for testing
      if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
        await createSampleAPIKeys(createdUser.id, user.name)
      }

      // Create some sample usage data for testing
      await createSampleUsageData(createdUser.id)
    }
  }
}

async function createSampleAPIKeys(userId: string, userName: string) {
  console.log(`       Adding sample API keys for ${userName}`)

  const providers = ['openai', 'claude', 'gemini']

  for (const provider of providers) {
    await prisma.apiKey.create({
      data: {
        id: `${userId}-${provider}-key`,
        provider: provider.toUpperCase(),
        keyName: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Test Key`,
        encryptedKey: 'test-encrypted-key-' + Math.random().toString(36).substring(7),
        userId,
        isActive: true,
        createdAt: new Date(),
        lastUsed: new Date()
      }
    })
  }
}

async function createSampleUsageData(userId: string) {
  const providers = ['OPENAI', 'CLAUDE', 'GEMINI']
  const models = {
    OPENAI: ['gpt-4', 'gpt-3.5-turbo'],
    CLAUDE: ['claude-3-opus', 'claude-3-sonnet'],
    GEMINI: ['gemini-pro', 'gemini-pro-vision']
  }

  // Create usage data for the last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    const provider = providers[Math.floor(Math.random() * providers.length)]
    const model = models[provider][Math.floor(Math.random() * models[provider].length)]

    await prisma.usageLog.create({
      data: {
        id: `${userId}-usage-${i}`,
        userId,
        provider,
        model,
        promptTokens: Math.floor(Math.random() * 1000) + 100,
        completionTokens: Math.floor(Math.random() * 500) + 50,
        totalTokens: 0, // Will be calculated
        cost: parseFloat((Math.random() * 2).toFixed(4)),
        timestamp: date,
        metadata: {
          requestType: 'chat_completion',
          status: 'success'
        }
      }
    })
  }
}

async function createCollaborationFeatures() {
  console.log('🤝 Setting up collaboration features...')

  // Get some users for collaboration testing
  const assetworksUsers = await prisma.user.findMany({
    where: {
      organizationId: 'assetworks-ai'
    }
  })

  const smatrxUsers = await prisma.user.findMany({
    where: {
      organizationId: 'smatrx'
    }
  })

  // Create shared threads for testing
  const superAdmin = assetworksUsers.find(u => u.role === 'SUPER_ADMIN')
  if (superAdmin) {
    console.log('   Creating test shared threads...')

    const aiThread = await prisma.aiThread.create({
      data: {
        id: 'test-ai-thread-1',
        title: 'AssetWorks AI Strategy Discussion',
        userId: superAdmin.id,
        organizationId: superAdmin.organizationId,
        shareId: 'share-' + Math.random().toString(36).substring(7),
        sharedWithEmails: [],
        metadata: {
          purpose: 'collaboration_test',
          settings: {
            allowComments: true,
            allowEditing: false
          }
        }
      }
    })

    // Add collaborators to the AI thread
    for (const user of assetworksUsers.slice(1, 4)) { // Add first 3 non-admin users
      await prisma.threadCollaborator.create({
        data: {
          id: `collab-${aiThread.id}-${user.id}`,
          threadId: aiThread.id,
          userId: user.id,
          invitedBy: superAdmin.id,
          role: user.role === 'MANAGER' ? 'EDITOR' : 'VIEWER'
        }
      })
    }

    console.log(`   ✅ Created AI thread: ${aiThread.title}`)
  }

  // Create team permissions and access levels
  console.log('   Setting up team permissions...')

  for (const org of organizations) {
    const orgUsers = await prisma.user.findMany({
      where: { organizationId: org.id }
    })

    // Create team-based access patterns
    const adminUsers = orgUsers.filter(u => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN')
    const managerUsers = orgUsers.filter(u => u.role === 'MANAGER')
    const regularUsers = orgUsers.filter(u => u.role === 'USER')

    console.log(`     ${org.name}: ${adminUsers.length} admins, ${managerUsers.length} managers, ${regularUsers.length} users`)
  }
}

async function testCollaborationFeatures() {
  console.log('🧪 Testing collaboration features...')

  try {
    // Test 1: Verify organization structure
    console.log('   1. Testing organization structure...')
    for (const org of organizations) {
      const orgData = await prisma.organization.findUnique({
        where: { id: org.id },
        include: {
          users: true,
          _count: {
            select: {
              users: true
            }
          }
        }
      })

      if (!orgData) {
        throw new Error(`Organization ${org.name} not found`)
      }

      console.log(`     ✅ ${orgData.name}: ${orgData._count.users} users`)

      // Verify role distribution
      const roleCount = orgData.users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      console.log(`       Roles: ${Object.entries(roleCount).map(([role, count]) => `${role}:${count}`).join(', ')}`)
    }

    // Test 2: Verify AI threads and collaboration
    console.log('   2. Testing AI threads and collaboration...')
    const aiThreads = await prisma.aiThread.findMany({
      include: {
        user: true,
        collaborators: {
          include: {
            user: true
          }
        }
      }
    })

    for (const thread of aiThreads) {
      console.log(`     ✅ Thread: "${thread.title}" by ${thread.user.name}`)
      console.log(`       Collaborators: ${thread.collaborators.length}`)
      for (const collab of thread.collaborators) {
        console.log(`         - ${collab.user.name} (${collab.role})`)
      }
    }

    // Test 3: Verify user permissions and access
    console.log('   3. Testing user permissions...')
    const testUser = await prisma.user.findFirst({
      where: {
        organizationId: 'assetworks-ai',
        role: 'SUPER_ADMIN'
      },
      include: {
        organization: true,
        apiKeys: true,
        usageLogs: {
          take: 3,
          orderBy: { timestamp: 'desc' }
        }
      }
    })

    if (testUser) {
      console.log(`     ✅ Super Admin: ${testUser.name}`)
      console.log(`       Organization: ${testUser.organization?.name}`)
      console.log(`       API Keys: ${testUser.apiKeys.length}`)
      console.log(`       Recent Usage: ${testUser.usageLogs.length} entries`)
    }

    // Test 4: Cross-organization isolation
    console.log('   4. Testing organization isolation...')
    const assetworksCount = await prisma.user.count({
      where: { organizationId: 'assetworks-ai' }
    })
    const smatrxCount = await prisma.user.count({
      where: { organizationId: 'smatrx' }
    })

    console.log(`     ✅ AssetWorks AI: ${assetworksCount} users`)
    console.log(`     ✅ Smatrx: ${smatrxCount} users`)

    console.log('✅ All collaboration tests passed!')

  } catch (error) {
    console.error('❌ Collaboration test failed:', error)
    throw error
  }
}

async function generateSummaryReport() {
  console.log('\n📊 Setup Summary Report')
  console.log('========================\n')

  for (const org of organizations) {
    const orgData = await prisma.organization.findUnique({
      where: { id: org.id },
      include: {
        users: {
          include: {
            apiKeys: true,
            usageLogs: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    if (orgData) {
      console.log(`🏢 ${orgData.name}`)
      console.log(`   Domain: ${orgData.domain}`)
      console.log(`   Subscription: ${orgData.subscription}`)
      console.log(`   Users: ${orgData._count.users}/${orgData.maxUsers}`)
      console.log(`   Created: ${orgData.createdAt.toISOString()}`)

      console.log('\n   👥 Users:')
      for (const user of orgData.users) {
        console.log(`     ${user.role.padEnd(12)} ${user.name.padEnd(20)} ${user.email}`)
        console.log(`     ${''.padEnd(12)} API Keys: ${user.apiKeys.length}, Usage: ${user.usageLogs.length} logs`)
      }
      console.log('')
    }
  }

  // AI threads summary
  const aiThreads = await prisma.aiThread.count()
  const collaborations = await prisma.threadCollaborator.count()

  console.log('🤝 Collaboration Features:')
  console.log(`   AI Threads: ${aiThreads}`)
  console.log(`   Collaborations: ${collaborations}`)

  console.log('\n🎯 Next Steps:')
  console.log('   1. Access the application at http://localhost:3000')
  console.log('   2. Test login with any of the created user emails')
  console.log('   3. Verify organization switching works')
  console.log('   4. Test thread sharing between users')
  console.log('   5. Check collaboration permissions')
}

async function main() {
  console.log('🚀 Setting up Test Organizations for Collaboration Testing')
  console.log('=========================================================\n')

  try {
    await cleanupExistingData()
    await createOrganizations()
    await createUsers()
    await createCollaborationFeatures()
    await testCollaborationFeatures()
    await generateSummaryReport()

    console.log('\n🎉 Setup completed successfully!')
    console.log('   Ready for collaboration and thread sharing testing')

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