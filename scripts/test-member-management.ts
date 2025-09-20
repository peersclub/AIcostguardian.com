#!/usr/bin/env tsx

/**
 * Test script for organization member management functionality
 * This script verifies that all member management features work correctly
 */

import { PrismaClient } from '@prisma/client'
import { generateId } from '@/lib/utils'

const prisma = new PrismaClient()

interface TestResults {
  passed: number
  failed: number
  tests: Array<{
    name: string
    status: 'PASS' | 'FAIL'
    error?: string
    duration: number
  }>
}

async function runTest(testName: string, testFn: () => Promise<void>): Promise<{ status: 'PASS' | 'FAIL', error?: string, duration: number }> {
  const startTime = Date.now()
  try {
    await testFn()
    return { status: 'PASS', duration: Date.now() - startTime }
  } catch (error) {
    return {
      status: 'FAIL',
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime
    }
  }
}

async function testMemberManagement(): Promise<TestResults> {
  const results: TestResults = { passed: 0, failed: 0, tests: [] }

  console.log('🧪 Testing Organization Member Management Functionality\n')

  // Test 1: Create organization
  const test1 = await runTest('Create test organization', async () => {
    await prisma.organization.create({
      data: {
        id: 'test-org-001',
        name: 'Test Organization',
        domain: 'test-members.com',
        subscription: 'FREE',
        maxUsers: 10
      }
    })
  })
  results.tests.push({ name: 'Create test organization', ...test1 })

  // Test 2: Create admin user
  const test2 = await runTest('Create admin user', async () => {
    await prisma.user.create({
      data: {
        id: 'test-admin-001',
        email: 'admin@test-members.com',
        name: 'Test Admin',
        role: 'ADMIN',
        organizationId: 'test-org-001'
      }
    })
  })
  results.tests.push({ name: 'Create admin user', ...test2 })

  // Test 3: Create invitation
  const test3 = await runTest('Create member invitation', async () => {
    const invitation = await prisma.invitation.create({
      data: {
        id: 'test-invite-001',
        email: 'newmember@test-members.com',
        role: 'USER',
        organizationId: 'test-org-001',
        invitedBy: 'admin@test-members.com',
        token: 'test-token-123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    })

    if (!invitation.id) throw new Error('Invitation not created')
  })
  results.tests.push({ name: 'Create member invitation', ...test3 })

  // Test 4: Accept invitation (create user)
  const test4 = await runTest('Accept invitation and create user', async () => {
    // Create user
    await prisma.user.create({
      data: {
        id: 'test-user-001',
        email: 'newmember@test-members.com',
        name: 'New Member',
        role: 'USER',
        organizationId: 'test-org-001',
        invitedBy: 'admin@test-members.com',
        acceptedAt: new Date()
      }
    })

    // Mark invitation as accepted
    await prisma.invitation.update({
      where: { id: 'test-invite-001' },
      data: { acceptedAt: new Date() }
    })
  })
  results.tests.push({ name: 'Accept invitation and create user', ...test4 })

  // Test 5: Test organization member query
  const test5 = await runTest('Query organization members', async () => {
    const members = await prisma.user.findMany({
      where: { organizationId: 'test-org-001' },
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

    if (members.length !== 2) throw new Error(`Expected 2 members, found ${members.length}`)

    const adminUser = members.find(m => m.role === 'ADMIN')
    const regularUser = members.find(m => m.role === 'USER')

    if (!adminUser) throw new Error('Admin user not found')
    if (!regularUser) throw new Error('Regular user not found')
    if (regularUser.invitedBy !== 'admin@test-members.com') throw new Error('Invitation tracking failed')
  })
  results.tests.push({ name: 'Query organization members', ...test5 })

  // Test 6: Test pending invitations query
  const test6 = await runTest('Query pending invitations', async () => {
    // Create another pending invitation
    await prisma.invitation.create({
      data: {
        id: 'test-invite-002',
        email: 'pending@test-members.com',
        role: 'USER',
        organizationId: 'test-org-001',
        invitedBy: 'admin@test-members.com',
        token: 'test-token-456',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    const pendingInvitations = await prisma.invitation.findMany({
      where: {
        organizationId: 'test-org-001',
        acceptedAt: null
      }
    })

    if (pendingInvitations.length !== 1) {
      throw new Error(`Expected 1 pending invitation, found ${pendingInvitations.length}`)
    }

    if (pendingInvitations[0].email !== 'pending@test-members.com') {
      throw new Error('Wrong pending invitation found')
    }
  })
  results.tests.push({ name: 'Query pending invitations', ...test6 })

  // Test 7: Test organization limits
  const test7 = await runTest('Test organization member limits', async () => {
    const org = await prisma.organization.findUnique({
      where: { id: 'test-org-001' }
    })

    const memberCount = await prisma.user.count({
      where: { organizationId: 'test-org-001' }
    })

    if (!org?.maxUsers) throw new Error('Organization maxUsers not set')
    if (memberCount > org.maxUsers) throw new Error('Member count exceeds organization limit')

    // Verify limit checking would work
    const remaining = org.maxUsers - memberCount
    if (remaining < 8) throw new Error('Unexpected remaining member slots')
  })
  results.tests.push({ name: 'Test organization member limits', ...test7 })

  // Test 8: Test role-based access
  const test8 = await runTest('Test role-based access controls', async () => {
    const adminUser = await prisma.user.findFirst({
      where: {
        organizationId: 'test-org-001',
        role: 'ADMIN'
      }
    })

    const regularUser = await prisma.user.findFirst({
      where: {
        organizationId: 'test-org-001',
        role: 'USER'
      }
    })

    if (!adminUser) throw new Error('Admin user not found')
    if (!regularUser) throw new Error('Regular user not found')

    // Verify roles are correct
    const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
    const userRoles = ['USER', 'VIEWER']

    if (!adminRoles.includes(adminUser.role)) throw new Error('Admin user has wrong role')
    if (!userRoles.includes(regularUser.role)) throw new Error('Regular user has wrong role')
  })
  results.tests.push({ name: 'Test role-based access controls', ...test8 })

  // Clean up test data
  const cleanup = await runTest('Clean up test data', async () => {
    await prisma.invitation.deleteMany({
      where: { organizationId: 'test-org-001' }
    })

    await prisma.user.deleteMany({
      where: { organizationId: 'test-org-001' }
    })

    await prisma.organization.delete({
      where: { id: 'test-org-001' }
    })
  })
  results.tests.push({ name: 'Clean up test data', ...cleanup })

  // Calculate results
  results.passed = results.tests.filter(t => t.status === 'PASS').length
  results.failed = results.tests.filter(t => t.status === 'FAIL').length

  return results
}

async function main() {
  try {
    const results = await testMemberManagement()

    console.log('\n📊 Test Results Summary:')
    console.log('========================')
    console.log(`✅ Passed: ${results.passed}`)
    console.log(`❌ Failed: ${results.failed}`)
    console.log(`📝 Total: ${results.tests.length}`)

    console.log('\n📋 Detailed Results:')
    console.log('====================')

    results.tests.forEach((test, index) => {
      const status = test.status === 'PASS' ? '✅' : '❌'
      const duration = `${test.duration}ms`
      console.log(`${index + 1}. ${status} ${test.name} (${duration})`)

      if (test.error) {
        console.log(`   Error: ${test.error}`)
      }
    })

    console.log('\n🎯 Summary:')
    if (results.failed === 0) {
      console.log('🎉 All member management functionality is working correctly!')
    } else {
      console.log(`⚠️  ${results.failed} test(s) failed. Please review the errors above.`)
    }

    process.exit(results.failed === 0 ? 0 : 1)

  } catch (error) {
    console.error('💥 Test execution failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}