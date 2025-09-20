#!/usr/bin/env tsx

/**
 * Comprehensive system test for member management with notifications
 * Tests: Database stability, Slack notifications, and member workflow
 */

import { PrismaClient } from '@prisma/client'
import { sendSlackNotification, formatInvitationMessage } from '@/lib/slack-integration'

const prisma = new PrismaClient()

interface SystemTestResults {
  databaseStability: {
    status: 'PASS' | 'FAIL'
    averageQueryTime: number
    successfulQueries: number
    failedQueries: number
    errors: string[]
  }
  slackNotifications: {
    status: 'PASS' | 'FAIL'
    notificationsSent: number
    errors: string[]
  }
  memberWorkflow: {
    status: 'PASS' | 'FAIL'
    stepsCompleted: number
    totalSteps: number
    errors: string[]
  }
}

async function testDatabaseStability(): Promise<SystemTestResults['databaseStability']> {
  console.log('🔄 Testing Database Connection Stability...')

  const results = {
    status: 'PASS' as const,
    averageQueryTime: 0,
    successfulQueries: 0,
    failedQueries: 0,
    errors: [] as string[]
  }

  const queryTimes: number[] = []
  const testQueries = 10 // Run 10 test queries

  for (let i = 0; i < testQueries; i++) {
    try {
      const startTime = Date.now()

      // Test simple query
      await prisma.organization.count()

      const queryTime = Date.now() - startTime
      queryTimes.push(queryTime)
      results.successfulQueries++

      console.log(`   Query ${i + 1}: ${queryTime}ms`)

      // Small delay to avoid overwhelming the connection
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (error) {
      results.failedQueries++
      results.errors.push(`Query ${i + 1}: ${error instanceof Error ? error.message : String(error)}`)
      console.log(`   Query ${i + 1}: FAILED`)
    }
  }

  results.averageQueryTime = queryTimes.length > 0
    ? Math.round(queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length)
    : 0

  if (results.failedQueries > testQueries * 0.2) { // More than 20% failure rate
    results.status = 'FAIL'
  }

  console.log(`   ✅ Successful queries: ${results.successfulQueries}/${testQueries}`)
  console.log(`   📊 Average query time: ${results.averageQueryTime}ms`)

  return results
}

async function testSlackNotifications(): Promise<SystemTestResults['slackNotifications']> {
  console.log('🔔 Testing Slack Notification System...')

  const results = {
    status: 'PASS' as const,
    notificationsSent: 0,
    errors: [] as string[]
  }

  try {
    // Create test organization for notifications with unique domain
    const timestamp = Date.now()
    const testOrg = await prisma.organization.create({
      data: {
        id: `slack-test-org-${timestamp}`,
        name: 'Slack Test Organization',
        domain: `test-${timestamp}.aicostguardian.com`, // Unique domain for testing
        subscription: 'FREE'
      }
    })

    // Test 1: Format invitation message
    console.log('   1. Testing message formatting...')
    const message = formatInvitationMessage(
      'Test Admin',
      'test@aicostguardian.com',
      'USER',
      'Slack Test Organization'
    )

    if (!message.text || !message.blocks) {
      throw new Error('Message formatting failed')
    }

    console.log('   ✅ Message formatted successfully')

    // Test 2: Send Slack notification
    console.log('   2. Testing Slack notification delivery...')
    const slackEnabled = process.env.ENABLE_SLACK_NOTIFICATIONS === 'true'

    if (slackEnabled) {
      try {
        const sent = await sendSlackNotification('slack-test-org', message)

        if (sent) {
          results.notificationsSent++
          console.log('   ✅ Slack notification sent successfully')
        } else {
          console.log('   ⚠️  Slack notification not sent (webhook not configured)')
        }
      } catch (error) {
        results.errors.push(`Slack send error: ${error instanceof Error ? error.message : String(error)}`)
        console.log('   ❌ Slack notification failed')
      }
    } else {
      console.log('   ⚠️  Slack notifications disabled')
    }

    // Cleanup
    await prisma.organization.delete({
      where: { id: testOrg.id }
    })

  } catch (error) {
    results.status = 'FAIL'
    results.errors.push(`Slack test error: ${error instanceof Error ? error.message : String(error)}`)
  }

  return results
}

async function testMemberWorkflow(): Promise<SystemTestResults['memberWorkflow']> {
  console.log('👥 Testing Complete Member Management Workflow...')

  const results = {
    status: 'PASS' as const,
    stepsCompleted: 0,
    totalSteps: 6,
    errors: [] as string[]
  }

  try {
    // Step 1: Create organization
    console.log('   1. Creating test organization...')
    const timestamp = Date.now()
    const organization = await prisma.organization.create({
      data: {
        id: `workflow-test-org-${timestamp}`,
        name: 'Workflow Test Organization',
        domain: `workflow-test-${timestamp}.com`,
        subscription: 'FREE',
        maxUsers: 5
      }
    })
    results.stepsCompleted++

    // Step 2: Create admin user
    console.log('   2. Creating admin user...')
    const adminUser = await prisma.user.create({
      data: {
        id: `workflow-admin-${timestamp}`,
        email: `admin@${organization.domain}`,
        name: 'Workflow Admin',
        role: 'ADMIN',
        organizationId: organization.id
      }
    })
    results.stepsCompleted++

    // Step 3: Create invitation with notification
    console.log('   3. Creating member invitation...')
    const invitation = await prisma.invitation.create({
      data: {
        id: `workflow-invitation-${timestamp}`,
        email: `member@${organization.domain}`,
        role: 'USER',
        organizationId: organization.id,
        invitedBy: adminUser.email,
        token: `workflow-test-token-${timestamp}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    // Test notification (if enabled)
    if (process.env.ENABLE_SLACK_NOTIFICATIONS === 'true') {
      const message = formatInvitationMessage(
        adminUser.name || adminUser.email,
        invitation.email,
        invitation.role,
        organization.name
      )
      await sendSlackNotification(organization.id, message)
    }
    results.stepsCompleted++

    // Step 4: Accept invitation (create user)
    console.log('   4. Accepting invitation...')
    const newUser = await prisma.user.create({
      data: {
        id: `workflow-member-${timestamp}`,
        email: invitation.email,
        name: 'New Member',
        role: invitation.role,
        organizationId: organization.id,
        invitedBy: invitation.invitedBy,
        acceptedAt: new Date()
      }
    })

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() }
    })
    results.stepsCompleted++

    // Step 5: Verify member listing
    console.log('   5. Verifying member listing...')
    const members = await prisma.user.findMany({
      where: { organizationId: organization.id },
      include: {
        usageLogs: {
          select: {
            cost: true,
            totalTokens: true,
            timestamp: true
          }
        }
      }
    })

    if (members.length !== 2) {
      throw new Error(`Expected 2 members, found ${members.length}`)
    }
    results.stepsCompleted++

    // Step 6: Test organization limits
    console.log('   6. Testing organization limits...')
    const memberCount = await prisma.user.count({
      where: { organizationId: organization.id }
    })

    const remainingSlots = organization.maxUsers! - memberCount
    if (remainingSlots < 0) {
      throw new Error('Organization over member limit')
    }
    results.stepsCompleted++

    // Cleanup
    console.log('   7. Cleaning up test data...')
    await prisma.invitation.deleteMany({
      where: { organizationId: organization.id }
    })
    await prisma.user.deleteMany({
      where: { organizationId: organization.id }
    })
    await prisma.organization.delete({
      where: { id: organization.id }
    })

    console.log(`   ✅ Workflow completed: ${results.stepsCompleted}/${results.totalSteps} steps`)

  } catch (error) {
    results.status = 'FAIL'
    results.errors.push(`Workflow error: ${error instanceof Error ? error.message : String(error)}`)
  }

  return results
}

async function main() {
  console.log('🧪 Running Comprehensive System Tests')
  console.log('=====================================\n')

  try {
    // Run all tests
    const databaseResults = await testDatabaseStability()
    const slackResults = await testSlackNotifications()
    const workflowResults = await testMemberWorkflow()

    const overallResults: SystemTestResults = {
      databaseStability: databaseResults,
      slackNotifications: slackResults,
      memberWorkflow: workflowResults
    }

    // Print detailed results
    console.log('\n📊 Comprehensive Test Results')
    console.log('==============================')

    console.log('\n🔄 Database Stability:')
    console.log(`   Status: ${databaseResults.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`   Successful queries: ${databaseResults.successfulQueries}`)
    console.log(`   Failed queries: ${databaseResults.failedQueries}`)
    console.log(`   Average query time: ${databaseResults.averageQueryTime}ms`)
    if (databaseResults.errors.length > 0) {
      console.log(`   Errors: ${databaseResults.errors.join(', ')}`)
    }

    console.log('\n🔔 Slack Notifications:')
    console.log(`   Status: ${slackResults.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`   Notifications sent: ${slackResults.notificationsSent}`)
    if (slackResults.errors.length > 0) {
      console.log(`   Errors: ${slackResults.errors.join(', ')}`)
    }

    console.log('\n👥 Member Workflow:')
    console.log(`   Status: ${workflowResults.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`   Steps completed: ${workflowResults.stepsCompleted}/${workflowResults.totalSteps}`)
    if (workflowResults.errors.length > 0) {
      console.log(`   Errors: ${workflowResults.errors.join(', ')}`)
    }

    // Overall assessment
    const allPassed = databaseResults.status === 'PASS' &&
                     slackResults.status === 'PASS' &&
                     workflowResults.status === 'PASS'

    console.log('\n🎯 Overall System Health:')
    console.log('=========================')
    if (allPassed) {
      console.log('🎉 ALL SYSTEMS OPERATIONAL')
      console.log('   • Database connections stable')
      console.log('   • Notification system ready')
      console.log('   • Member management working perfectly')
    } else {
      console.log('⚠️  SOME ISSUES DETECTED')
      if (databaseResults.status === 'FAIL') console.log('   • Database connection issues')
      if (slackResults.status === 'FAIL') console.log('   • Slack notification problems')
      if (workflowResults.status === 'FAIL') console.log('   • Member workflow errors')
    }

    process.exit(allPassed ? 0 : 1)

  } catch (error) {
    console.error('💥 System test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}