import { prisma } from '@/lib/prisma'
import { threadManager } from '@/src/services/thread-manager'

async function testSharingIntegration() {
  console.log('🧪 Testing Thread Sharing Integration...')

  try {
    // 1. Check if we can find a demo user
    const demoUser = await prisma.user.findFirst({
      where: {
        email: {
          contains: 'demo'
        }
      }
    })

    if (!demoUser) {
      console.error('❌ No demo user found for testing')
      return false
    }

    console.log(`✅ Found demo user: ${demoUser.name} (${demoUser.email})`)

    // 2. Create a test thread
    const testThread = await threadManager.createThread({
      title: 'Test Sharing Integration Thread',
      userId: demoUser.id,
      organizationId: demoUser.organizationId || undefined,
      mode: 'STANDARD',
      metadata: {
        testData: true,
        createdForSharing: true
      }
    })

    console.log(`✅ Created test thread: ${testThread.id}`)

    // 3. Add some test messages to the thread
    const testMessage = await prisma.aIMessage.create({
      data: {
        threadId: testThread.id,
        role: 'USER',
        content: 'This is a test message for sharing functionality',
        selectedProvider: 'test',
        selectedModel: 'test-model',
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
        cost: 0.001,
        metadata: {
          test: true
        }
      }
    })

    const responseMessage = await prisma.aIMessage.create({
      data: {
        threadId: testThread.id,
        role: 'ASSISTANT',
        content: 'This is a test AI response for the sharing functionality. It demonstrates how shared threads display conversation history.',
        selectedProvider: 'openai',
        selectedModel: 'gpt-4',
        promptTokens: 15,
        completionTokens: 35,
        totalTokens: 50,
        cost: 0.002,
        metadata: {
          test: true
        }
      }
    })

    console.log(`✅ Added test messages: ${testMessage.id}, ${responseMessage.id}`)

    // 4. Test sharing the thread
    const shareResult = await threadManager.shareThread(testThread.id, demoUser.id, {
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      allowEdit: false,
      requireAuth: false,
      maxCollaborators: 5
    })

    console.log(`✅ Shared thread successfully!`)
    console.log(`   Share URL: ${shareResult.shareUrl}`)
    console.log(`   Share ID: ${shareResult.thread.shareToken}`)

    // 5. Test retrieving the shared thread
    const sharedThread = await threadManager.getThreadByShareToken(shareResult.thread.shareToken!)

    if (!sharedThread) {
      console.error('❌ Failed to retrieve shared thread by token')
      return false
    }

    console.log(`✅ Successfully retrieved shared thread`)
    console.log(`   Thread ID: ${sharedThread.id}`)
    console.log(`   Message Count: ${sharedThread.messageCount}`)
    console.log(`   Has Messages: ${sharedThread.messages?.length || 0}`)

    // 6. Test adding a collaborator
    const collaboratorEmail = 'collaborator@test.com'

    // First create a test collaborator user
    const collaborator = await prisma.user.upsert({
      where: { email: collaboratorEmail },
      update: {},
      create: {
        email: collaboratorEmail,
        name: 'Test Collaborator',
        organizationId: demoUser.organizationId
      }
    })

    await threadManager.addCollaborator(
      testThread.id,
      collaboratorEmail,
      'VIEWER',
      demoUser.id
    )

    console.log(`✅ Added collaborator: ${collaboratorEmail}`)

    // 7. Test getting collaborators
    const collaborators = await threadManager.getCollaborators(testThread.id)
    console.log(`✅ Retrieved ${collaborators.length} collaborators`)

    // 8. Test unsharing
    await threadManager.unshareThread(testThread.id, demoUser.id)
    console.log(`✅ Successfully unshared thread`)

    // 9. Verify thread is no longer accessible by share token
    const unsharedThread = await threadManager.getThreadByShareToken(shareResult.thread.shareToken!)
    if (unsharedThread === null) {
      console.log(`✅ Confirmed thread is no longer accessible after unsharing`)
    } else {
      console.error('❌ Thread is still accessible after unsharing')
      return false
    }

    // 10. Cleanup test data
    await prisma.aIMessage.deleteMany({
      where: { threadId: testThread.id }
    })

    await prisma.threadCollaborator.deleteMany({
      where: { threadId: testThread.id }
    })

    await prisma.aIThread.delete({
      where: { id: testThread.id }
    })

    await prisma.user.delete({
      where: { id: collaborator.id }
    })

    console.log(`✅ Cleaned up test data`)

    console.log('\n🎉 ALL SHARING INTEGRATION TESTS PASSED!')
    return true

  } catch (error) {
    console.error('❌ Sharing integration test failed:', error)
    return false
  }
}

// Run the test
testSharingIntegration()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('Test script error:', error)
    process.exit(1)
  })