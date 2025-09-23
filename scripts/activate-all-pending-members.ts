import { PrismaClient } from '@prisma/client'
import EventNotifier from '@/lib/services/event-notifier'

const prisma = new PrismaClient()

async function activateAllPendingMembers() {
  try {
    console.log('🚀 Starting activation of all pending members...')

    // 1. Process pending invitations
    console.log('\n📨 Processing pending invitations...')
    const pendingInvitations = await prisma.invitation.findMany({
      where: {
        acceptedAt: null
      },
      include: {
        organization: true
      }
    })

    console.log(`Found ${pendingInvitations.length} pending invitations`)

    for (const invitation of pendingInvitations) {
      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email: invitation.email }
      })

      if (!user) {
        // Create new user from invitation
        user = await prisma.user.create({
          data: {
            email: invitation.email,
            name: invitation.email.split('@')[0], // Default name from email
            role: invitation.role,
            organizationId: invitation.organizationId,
            emailVerified: new Date(),
            invitedBy: invitation.invitedBy,
            invitedAt: invitation.createdAt,
            acceptedAt: new Date()
          }
        })
        console.log(`✅ Created and activated user: ${user.email} in ${invitation.organization.name}`)
      } else {
        // Update existing user
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: new Date(),
            acceptedAt: new Date(),
            organizationId: invitation.organizationId,
            role: invitation.role
          }
        })
        console.log(`✅ Activated existing user: ${user.email} in ${invitation.organization.name}`)
      }

      // Mark invitation as accepted
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          acceptedAt: new Date()
        }
      })
    }

    // 2. Activate unverified users
    console.log('\n👥 Processing unverified users...')
    const unverifiedUsers = await prisma.user.findMany({
      where: {
        OR: [
          { emailVerified: null },
          { acceptedAt: null }
        ]
      },
      include: {
        organization: true
      }
    })

    console.log(`Found ${unverifiedUsers.length} unverified users`)

    for (const user of unverifiedUsers) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: user.emailVerified || new Date(),
          acceptedAt: user.acceptedAt || new Date(),
          lastActiveAt: new Date()
        }
      })
      console.log(`✅ Activated user: ${user.email} in ${user.organization?.name || 'No organization'}`)
    }

    // 3. Generate activation summary
    console.log('\n📊 Activation Summary:')
    const totalUsers = await prisma.user.count()
    const activeUsers = await prisma.user.count({
      where: {
        AND: [
          { emailVerified: { not: null } },
          { acceptedAt: { not: null } }
        ]
      }
    })
    const remainingInvitations = await prisma.invitation.count({
      where: { acceptedAt: null }
    })

    console.log(`Total users: ${totalUsers}`)
    console.log(`Active users: ${activeUsers}`)
    console.log(`Remaining pending invitations: ${remainingInvitations}`)

    // 4. Create default API keys for activated users (if they don't have any)
    console.log('\n🔑 Ensuring activated users have default API keys...')
    const usersWithoutApiKeys = await prisma.user.findMany({
      where: {
        AND: [
          { emailVerified: { not: null } },
          { acceptedAt: { not: null } },
          { apiKeys: { none: {} } }
        ]
      }
    })

    for (const user of usersWithoutApiKeys) {
      // Create a demo API key for testing
      await prisma.apiKey.create({
        data: {
          name: 'Demo API Key',
          provider: 'OPENAI',
          keyValue: 'demo-key-for-testing', // This would be encrypted in real usage
          encryptedKey: 'demo-encrypted-key-for-testing',
          userId: user.id,
          isActive: true,
          isDefault: true
        }
      })
      console.log(`🔑 Created demo API key for ${user.email}`)
    }

    console.log('\n🎉 All pending members have been activated successfully!')

    // 5. Send Slack notification about bulk activation
    console.log('\n📢 Sending Slack notification...')
    const organizations = await prisma.organization.count()
    await EventNotifier.notifyBulkActivationComplete(activeUsers, organizations)
    console.log('✅ Slack notification sent successfully!')

  } catch (error) {
    console.error('❌ Error activating pending members:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the activation
activateAllPendingMembers()