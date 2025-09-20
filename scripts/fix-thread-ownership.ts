#!/usr/bin/env tsx

/**
 * Fix thread ownership and create proper context for testing
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixThreadOwnership() {
  console.log('🔧 Fixing thread ownership and permissions...')

  try {
    // Get demo user
    const demoUser = await prisma.user.findFirst({
      where: { email: 'demo@example.com' }
    })

    if (!demoUser) {
      console.log('❌ Demo user not found')
      return
    }

    console.log(`✅ Demo user: ${demoUser.name} (ID: ${demoUser.id})`)

    const targetThreadId = 'thread-1758303061847'

    // Update thread ownership
    const updatedThread = await prisma.aIThread.update({
      where: { id: targetThreadId },
      data: {
        userId: demoUser.id,
        organizationId: demoUser.organizationId
      }
    })

    console.log(`✅ Updated thread ownership: ${updatedThread.title}`)

    // Check thread context with proper relationships
    const existingContext = await prisma.threadContext.findUnique({
      where: { threadId: targetThreadId }
    })

    if (existingContext) {
      console.log('✅ Thread context exists')
    } else {
      // Create context with proper structure
      await prisma.threadContext.create({
        data: {
          threadId: targetThreadId,
          projectName: 'AI Strategy Project',
          systemPrompt: 'You are an expert AI strategist helping organizations implement AI solutions.',
          temperature: 0.7,
          maxTokens: 2000,
          defaultModel: 'gpt-4o-mini',
          defaultProvider: 'openai',
          contextWindow: 8000,
          memoryEnabled: true,
          memorySize: 50,
          allowEditing: true,
          requireApproval: false,
          version: 1,
          lastEditedBy: demoUser.id,
          lastEditedAt: new Date()
        }
      })
      console.log('✅ Created comprehensive thread context')
    }

    // Verify thread API access
    const threadWithContext = await prisma.aIThread.findUnique({
      where: { id: targetThreadId },
      include: {
        context: true,
        messages: true,
        user: true
      }
    })

    if (threadWithContext) {
      console.log(`\n📊 Thread Summary:`)
      console.log(`   Title: ${threadWithContext.title}`)
      console.log(`   Owner: ${threadWithContext.user?.name || 'Unknown'}`)
      console.log(`   Messages: ${threadWithContext.messages?.length || 0}`)
      console.log(`   Context: ${threadWithContext.context ? 'Present' : 'Missing'}`)
      console.log(`   Organization: ${threadWithContext.organizationId}`)
    }

    console.log('\n✅ Thread should now be accessible via API')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  fixThreadOwnership()
}