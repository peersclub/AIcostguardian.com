import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAIMessages() {
  try {
    console.log('📊 Checking AIMessage and AIThread data in database...\n')

    // Get total count of AI messages
    const totalAIMessages = await prisma.aIMessage.count()
    console.log(`Total AIMessages in database: ${totalAIMessages}`)

    // Get count by role
    const aiMessagesByRole = await prisma.aIMessage.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    })

    console.log('\nAI Messages by role:')
    aiMessagesByRole.forEach(group => {
      console.log(`  ${group.role}: ${group._count.role}`)
    })

    // Get total AI threads
    const totalAIThreads = await prisma.aIThread.count()
    console.log(`\nTotal AIThreads in database: ${totalAIThreads}`)

    // Get recent AI messages
    const recentAIMessages = await prisma.aIMessage.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        role: true,
        content: true,
        threadId: true,
        createdAt: true,
        thread: {
          select: {
            id: true,
            title: true,
            userId: true
          }
        }
      }
    })

    console.log('\nRecent AI messages:')
    recentAIMessages.forEach((message, index) => {
      console.log(`\n${index + 1}. AIMessage ID: ${message.id}`)
      console.log(`   Role: ${message.role}`)
      console.log(`   Thread: ${message.thread?.title || 'No title'} (${message.threadId})`)
      console.log(`   Content: ${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}`)
      console.log(`   Created: ${message.createdAt}`)
    })

    // Compare with regular Message table
    const totalMessages = await prisma.message.count()
    const totalThreads = await prisma.thread.count()

    console.log('\n🔍 Comparison:')
    console.log(`Regular Message table: ${totalMessages} messages`)
    console.log(`AIMessage table: ${totalAIMessages} messages`)
    console.log(`Regular Thread table: ${totalThreads} threads`)
    console.log(`AIThread table: ${totalAIThreads} threads`)

    console.log('\n💡 Issue Analysis:')
    if (totalAIMessages > 0 && totalMessages === 0) {
      console.log('✅ Messages are being saved to AIMessage table (correct)')
      console.log('❌ Frontend is querying Message table (incorrect)')
      console.log('🔧 Solution: Update frontend to query AIMessage table')
    } else if (totalAIMessages === 0 && totalMessages === 0) {
      console.log('❌ No messages in either table - possible API or DB connection issue')
    } else {
      console.log('⚠️  Messages found in both tables - schema inconsistency')
    }

  } catch (error) {
    console.error('Error checking AI messages:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAIMessages()