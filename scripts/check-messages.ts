import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkMessages() {
  try {
    console.log('📊 Checking message data in database...\n')

    // Get total count of messages
    const totalMessages = await prisma.message.count()
    console.log(`Total messages in database: ${totalMessages}`)

    // Get count by role
    const messagesByRole = await prisma.message.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    })

    console.log('\nMessages by role:')
    messagesByRole.forEach(group => {
      console.log(`  ${group.role}: ${group._count.role}`)
    })

    // Get recent messages with thread info
    const recentMessages = await prisma.message.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        role: true,
        content: true,
        threadId: true,
        userId: true,
        createdAt: true,
        thread: {
          select: {
            id: true,
            title: true,
            userId: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log('\nRecent messages:')
    recentMessages.forEach((message, index) => {
      console.log(`\n${index + 1}. Message ID: ${message.id}`)
      console.log(`   Role: ${message.role}`)
      console.log(`   Thread: ${message.thread?.title || 'No title'} (${message.threadId})`)
      console.log(`   User: ${message.user?.name || message.user?.email || 'No user'} (${message.userId || 'NULL'})`)
      console.log(`   Content: ${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}`)
      console.log(`   Created: ${message.createdAt}`)
    })

    // Check for threads with missing user messages
    console.log('\n🔍 Checking for threads with only assistant messages...')

    const threadsWithMessages = await prisma.thread.findMany({
      include: {
        messages: {
          select: {
            id: true,
            role: true,
            userId: true
          }
        }
      },
      where: {
        messages: {
          some: {}
        }
      }
    })

    const threadsWithOnlyAssistant = threadsWithMessages.filter(thread => {
      const roles = thread.messages.map(m => m.role)
      return roles.includes('assistant') && !roles.includes('user')
    })

    console.log(`Threads with only assistant messages: ${threadsWithOnlyAssistant.length}`)

    if (threadsWithOnlyAssistant.length > 0) {
      console.log('\nProblematic threads:')
      threadsWithOnlyAssistant.slice(0, 5).forEach((thread, index) => {
        console.log(`${index + 1}. Thread ${thread.id}: ${thread.messages.length} messages, all assistant`)
      })
    }

  } catch (error) {
    console.error('Error checking messages:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkMessages()