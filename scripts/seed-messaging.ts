import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedMessaging() {
  try {
    console.log('Starting messaging system seeding...')

    // Get all organizations
    const organizations = await prisma.organization.findMany({
      include: {
        users: true
      }
    })

    for (const org of organizations) {
      if (org.users.length === 0) continue

      console.log(`Seeding messaging for organization: ${org.name}`)

      // Create default channels for each organization
      const generalChannel = await prisma.messagingChannel.upsert({
        where: {
          organizationId_name: {
            organizationId: org.id,
            name: 'general'
          }
        },
        update: {},
        create: {
          name: 'general',
          description: 'Company-wide announcements and general discussion',
          type: 'PUBLIC',
          organizationId: org.id,
          createdById: org.users[0].id,
          memberCount: org.users.length
        }
      })

      const aiDiscussionsChannel = await prisma.messagingChannel.upsert({
        where: {
          organizationId_name: {
            organizationId: org.id,
            name: 'ai-discussions'
          }
        },
        update: {},
        create: {
          name: 'ai-discussions',
          description: 'Discuss AI implementations and best practices',
          type: 'PUBLIC',
          organizationId: org.id,
          createdById: org.users[0].id,
          memberCount: org.users.length
        }
      })

      // Add all users as members of the default channels
      for (const user of org.users) {
        // General channel membership
        await prisma.channelMember.upsert({
          where: {
            channelId_userId: {
              channelId: generalChannel.id,
              userId: user.id
            }
          },
          update: {},
          create: {
            channelId: generalChannel.id,
            userId: user.id,
            role: user.id === org.users[0].id ? 'OWNER' : 'MEMBER',
            isAdmin: user.id === org.users[0].id
          }
        })

        // AI discussions channel membership
        await prisma.channelMember.upsert({
          where: {
            channelId_userId: {
              channelId: aiDiscussionsChannel.id,
              userId: user.id
            }
          },
          update: {},
          create: {
            channelId: aiDiscussionsChannel.id,
            userId: user.id,
            role: user.id === org.users[0].id ? 'OWNER' : 'MEMBER',
            isAdmin: user.id === org.users[0].id
          }
        })
      }

      // Add some sample messages to general channel
      if (org.users.length >= 2) {
        const sampleMessages = [
          {
            content: `Welcome to ${org.name}! This is our general discussion channel.`,
            senderId: org.users[0].id,
            type: 'SYSTEM' as const
          },
          {
            content: 'Hello everyone! Excited to be working with the team.',
            senderId: org.users[1].id,
            type: 'TEXT' as const
          },
          {
            content: 'Welcome to the team! Looking forward to collaborating.',
            senderId: org.users[0].id,
            type: 'TEXT' as const
          }
        ]

        for (const messageData of sampleMessages) {
          await prisma.messagingMessage.create({
            data: {
              ...messageData,
              channelId: generalChannel.id
            }
          })
        }

        // Update channel message count and last message time
        await prisma.messagingChannel.update({
          where: { id: generalChannel.id },
          data: {
            messageCount: sampleMessages.length,
            lastMessageAt: new Date()
          }
        })

        // Add a sample message to AI discussions
        await prisma.messagingMessage.create({
          data: {
            content: 'What are your thoughts on the latest Claude models? Has anyone tried the new features?',
            senderId: org.users[0].id,
            channelId: aiDiscussionsChannel.id,
            type: 'TEXT'
          }
        })

        // Update AI discussions channel
        await prisma.messagingChannel.update({
          where: { id: aiDiscussionsChannel.id },
          data: {
            messageCount: 1,
            lastMessageAt: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
          }
        })
      }

      console.log(`✅ Seeded messaging for ${org.name}`)
    }

    console.log('✅ Messaging system seeding completed successfully!')

  } catch (error) {
    console.error('❌ Error seeding messaging system:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding
seedMessaging()