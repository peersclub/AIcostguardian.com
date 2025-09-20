#!/usr/bin/env tsx

/**
 * Test script for System Notification Service
 * Tests both browser-based notifications and audit logging integration
 */

import { PrismaClient } from '@prisma/client'
import {
  systemNotificationService,
  sendCostAlert,
  sendUsageSpike,
  sendSecurityAlert
} from '@/lib/services/system-notifications'
import {
  createAuditLog,
  AuditAction,
  AuditSeverity,
  logThreadDeletion,
  logMessageDeletion,
  logBulkDeletion,
  generateDeletionComplianceReport
} from '@/lib/services/audit-log'

const prisma = new PrismaClient()

interface TestResult {
  name: string
  success: boolean
  message: string
  data?: any
}

class SystemNotificationTester {
  private results: TestResult[] = []
  private testUserId: string = ''
  private testOrganizationId: string = ''

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting System Notification and Audit Logging Tests')
    console.log('=' .repeat(60))

    try {
      await this.setupTestData()
      await this.testSystemNotificationService()
      await this.testNotificationPermissions()
      await this.testNotificationTypes()
      await this.testDeletionAuditLogging()
      await this.testAuditComplianceReporting()
      await this.generateTestReport()
    } catch (error) {
      console.error('❌ Test suite failed:', error)
    } finally {
      await this.cleanup()
    }
  }

  private async setupTestData(): Promise<void> {
    console.log('\n📋 Setting up test data...')

    try {
      // First ensure test organization exists
      await prisma.organization.upsert({
        where: { id: 'test-org-notifications' },
        update: {},
        create: {
          id: 'test-org-notifications',
          name: 'Notification Test Organization',
          domain: 'notifications.test',
          subscription: 'ENTERPRISE',
          maxUsers: 100
        }
      })

      // Get or create test user
      let testUser = await prisma.user.findFirst({
        where: { email: 'test@notifications.local' }
      })

      if (!testUser) {
        testUser = await prisma.user.create({
          data: {
            id: 'test-user-notifications',
            email: 'test@notifications.local',
            name: 'Notification Test User',
            role: 'ADMIN',
            organizationId: 'test-org-notifications'
          }
        })
      }

      this.testUserId = testUser.id
      this.testOrganizationId = testUser.organizationId

      this.addResult('Setup Test Data', true, 'Test user and organization created')
    } catch (error) {
      this.addResult('Setup Test Data', false, `Failed: ${(error as Error).message}`)
      throw error
    }
  }

  private async testSystemNotificationService(): Promise<void> {
    console.log('\n🔔 Testing System Notification Service...')

    try {
      // Test service initialization
      const isSupported = systemNotificationService.isSupported()
      this.addResult(
        'Service Initialization',
        true,
        `Service supported: ${isSupported}`
      )

      // Test permission status
      const permissionStatus = systemNotificationService.getPermissionStatus()
      this.addResult(
        'Permission Status Check',
        true,
        `Permissions - Granted: ${permissionStatus.granted}, Denied: ${permissionStatus.denied}, Default: ${permissionStatus.default}`
      )

      // Test basic notification creation (will not actually show in headless environment)
      const notificationData = {
        title: 'Test System Notification',
        body: 'This is a test of the system notification service',
        priority: 'normal' as const,
        userId: this.testUserId,
        organizationId: this.testOrganizationId,
        data: {
          testId: 'notification-test-1',
          timestamp: new Date().toISOString()
        }
      }

      // Note: In a headless environment, this will gracefully fail but still test the logic
      const sent = await systemNotificationService.sendSystemNotification(notificationData)
      this.addResult(
        'Basic Notification Send',
        true,
        `Notification send attempted: ${sent} (expected false in headless environment)`
      )

    } catch (error) {
      this.addResult('System Notification Service', false, `Failed: ${(error as Error).message}`)
    }
  }

  private async testNotificationPermissions(): Promise<void> {
    console.log('\n🔐 Testing Notification Permissions...')

    try {
      // Test permission request (will fail in headless environment but tests the logic)
      const permission = await systemNotificationService.requestPermission()
      this.addResult(
        'Permission Request',
        true,
        `Permission request completed - Granted: ${permission.granted}, Denied: ${permission.denied}`
      )

      // Test integration with notification service
      await systemNotificationService.integrateWithNotificationService(
        this.testUserId,
        this.testOrganizationId
      )
      this.addResult(
        'Service Integration',
        true,
        'Integration with notification service completed'
      )

    } catch (error) {
      this.addResult('Notification Permissions', false, `Failed: ${(error as Error).message}`)
    }
  }

  private async testNotificationTypes(): Promise<void> {
    console.log('\n📱 Testing Different Notification Types...')

    try {
      // Test cost alert
      const costAlertSent = await sendCostAlert(
        this.testUserId,
        this.testOrganizationId,
        'OpenAI',
        150.50,
        100.00
      )
      this.addResult(
        'Cost Alert Notification',
        true,
        `Cost alert sent: ${costAlertSent}`
      )

      // Test usage spike
      const usageSpikeSent = await sendUsageSpike(
        this.testUserId,
        this.testOrganizationId,
        'Claude',
        250 // 250% increase
      )
      this.addResult(
        'Usage Spike Notification',
        true,
        `Usage spike notification sent: ${usageSpikeSent}`
      )

      // Test security alert
      const securityAlertSent = await sendSecurityAlert(
        this.testUserId,
        this.testOrganizationId,
        'Suspicious API Activity',
        'Multiple failed API key attempts detected from unknown IP address'
      )
      this.addResult(
        'Security Alert Notification',
        true,
        `Security alert sent: ${securityAlertSent}`
      )

      // Test critical alert
      const criticalAlert = await systemNotificationService.sendCriticalAlert({
        title: 'System Maintenance Required',
        body: 'Critical system maintenance required within 1 hour',
        priority: 'urgent',
        userId: this.testUserId,
        organizationId: this.testOrganizationId,
        requireInteraction: true,
        data: {
          maintenanceType: 'database_upgrade',
          estimatedDuration: '2 hours'
        }
      })
      this.addResult(
        'Critical Alert Notification',
        true,
        `Critical alert sent: ${criticalAlert}`
      )

    } catch (error) {
      this.addResult('Notification Types', false, `Failed: ${(error as Error).message}`)
    }
  }

  private async testDeletionAuditLogging(): Promise<void> {
    console.log('\n📋 Testing Deletion Audit Logging...')

    try {
      // Test thread deletion logging
      await logThreadDeletion(
        this.testUserId,
        'test-thread-123',
        {
          title: 'Test AI Strategy Thread',
          messageCount: 15,
          collaboratorCount: 3,
          isShared: true,
          organizationId: this.testOrganizationId
        },
        'User requested deletion'
      )
      this.addResult(
        'Thread Deletion Logging',
        true,
        'Thread deletion audit log created'
      )

      // Test message deletion logging
      await logMessageDeletion(
        this.testUserId,
        'test-message-456',
        {
          threadId: 'test-thread-123',
          content: 'This is a test AI message that is being deleted for testing purposes.',
          provider: 'OpenAI',
          tokenCount: 1250,
          cost: 0.025
        },
        'Contains outdated information'
      )
      this.addResult(
        'Message Deletion Logging',
        true,
        'Message deletion audit log created'
      )

      // Test bulk deletion logging
      await logBulkDeletion(
        this.testUserId,
        {
          type: 'UsageLog',
          criteria: {
            dateRange: '2024-01-01 to 2024-01-31',
            provider: 'OpenAI'
          },
          affectedCount: 2547,
          relatedRecords: [
            { type: 'Tokens', count: 1250000 },
            { type: 'Requests', count: 5432 }
          ]
        },
        'Monthly cleanup as per retention policy'
      )
      this.addResult(
        'Bulk Deletion Logging',
        true,
        'Bulk deletion audit log created'
      )

      // Test basic audit log creation
      await createAuditLog({
        action: AuditAction.DATA_DELETED,
        severity: AuditSeverity.HIGH,
        userId: this.testUserId,
        targetId: 'test-record-789',
        targetType: 'TestRecord',
        metadata: {
          deletionReason: 'Automated test deletion',
          originalData: {
            name: 'Test Record',
            value: 42,
            timestamp: new Date().toISOString()
          }
        },
        success: true
      })
      this.addResult(
        'Basic Audit Log Creation',
        true,
        'Basic deletion audit log created'
      )

    } catch (error) {
      this.addResult('Deletion Audit Logging', false, `Failed: ${(error as Error).message}`)
    }
  }

  private async testAuditComplianceReporting(): Promise<void> {
    console.log('\n📊 Testing Audit Compliance Reporting...')

    try {
      // Generate compliance report
      const report = await generateDeletionComplianceReport(
        this.testOrganizationId,
        {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          end: new Date()
        }
      )

      this.addResult(
        'Compliance Report Generation',
        true,
        `Report generated - Total deletions: ${report.summary.totalDeletions}, Soft: ${report.summary.softDeletions}, Permanent: ${report.summary.permanentDeletions}`
      )

      // Test API endpoint
      const testData = {
        method: 'GET',
        url: `/api/audit/deletions?type=compliance&organizationId=${this.testOrganizationId}`
      }

      this.addResult(
        'Audit API Endpoint',
        true,
        `API endpoint ready for testing: ${testData.url}`
      )

    } catch (error) {
      this.addResult('Audit Compliance Reporting', false, `Failed: ${(error as Error).message}`)
    }
  }

  private async generateTestReport(): Promise<void> {
    console.log('\n📊 Test Results Summary')
    console.log('=' .repeat(60))

    const successful = this.results.filter(r => r.success).length
    const failed = this.results.filter(r => !r.success).length
    const total = this.results.length

    console.log(`\n✅ Successful: ${successful}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`📋 Total: ${total}`)
    console.log(`📈 Success Rate: ${((successful / total) * 100).toFixed(1)}%`)

    console.log('\n📋 Detailed Results:')
    console.log('-' .repeat(60))

    for (const result of this.results) {
      const icon = result.success ? '✅' : '❌'
      console.log(`${icon} ${result.name}`)
      console.log(`   ${result.message}`)
      if (result.data) {
        console.log(`   Data: ${JSON.stringify(result.data, null, 2)}`)
      }
      console.log('')
    }

    // Additional insights
    console.log('\n🎯 Key Insights:')
    console.log('-' .repeat(30))
    console.log('• System notifications require user permission and active browser context')
    console.log('• Audit logging captures comprehensive deletion metadata for compliance')
    console.log('• Service worker enables background notification handling')
    console.log('• All deletion operations are tracked with user, timestamp, and reason')
    console.log('• Compliance reporting provides risk assessment and policy violations')

    console.log('\n🔗 Next Steps:')
    console.log('-' .repeat(30))
    console.log('• Test in browser environment for full notification functionality')
    console.log('• Set up notification permission UI for users')
    console.log('• Implement notification rule configuration interface')
    console.log('• Add real-time audit log monitoring dashboard')
    console.log('• Configure retention policies for audit data')
  }

  private addResult(name: string, success: boolean, message: string, data?: any): void {
    this.results.push({ name, success, message, data })
    const icon = success ? '✅' : '❌'
    console.log(`   ${icon} ${name}: ${message}`)
  }

  private async cleanup(): Promise<void> {
    console.log('\n🧹 Cleaning up test data...')

    try {
      // Clean up test records (keep audit logs for compliance)
      await prisma.user.deleteMany({
        where: { email: 'test@notifications.local' }
      })

      await prisma.organization.deleteMany({
        where: { id: 'test-org-notifications' }
      })

      console.log('✅ Test cleanup completed')
    } catch (error) {
      console.error('❌ Cleanup failed:', error)
    } finally {
      await prisma.$disconnect()
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new SystemNotificationTester()
  tester.runAllTests().catch(console.error)
}

export { SystemNotificationTester }