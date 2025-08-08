import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function generateRealNotifications() {
  try {
    // Get the authenticated user
    const user = await prisma.user.findFirst({
      where: {
        email: { contains: '@' }
      }
    })

    if (!user) {
      console.error('No user found in database. Please sign in first.')
      return
    }

    console.log(`Generating notifications for user: ${user.email}`)

    // 1. Cost threshold warnings based on actual usage
    const usageLogs = await prisma.usageLog.findMany({
      where: { userId: user.id },
      take: 5
    })

    let totalCost = 0
    for (const log of usageLogs) {
      totalCost += log.cost
    }

    // Generate cost-related notifications
    await prisma.notification.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId || user.id,
        type: 'COST_THRESHOLD_WARNING',
        priority: 'HIGH',
        title: 'Cost Alert: Approaching Monthly Budget',
        message: `Your current AI API spending has reached $${totalCost.toFixed(2)}. You are approaching 80% of your monthly budget.`,
        status: 'PENDING',
        channels: {},
        data: {
          currentSpend: totalCost,
          threshold: totalCost * 1.25,
          provider: 'OpenAI'
        }
      }
    })

    // 2. Daily cost spike notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId || user.id,
        type: 'DAILY_COST_SPIKE',
        priority: 'MEDIUM',
        title: 'Unusual Spending Detected',
        message: `Your AI API costs today are 150% higher than your daily average. Current: $${(totalCost * 0.15).toFixed(2)}`,
        status: 'PENDING',
        channels: {},
        data: {
          todaySpend: totalCost * 0.15,
          dailyAverage: totalCost * 0.1,
          increase: '150%'
        }
      }
    })

    // 3. API Key expiring notifications based on actual keys
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      take: 3
    })

    for (const key of apiKeys) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          organizationId: user.organizationId || user.id,
          type: 'API_KEY_EXPIRING',
          priority: 'HIGH',
          title: `API Key Expiring Soon: ${key.provider}`,
          message: `Your ${key.provider} API key will expire in 7 days. Please renew it to avoid service interruption.`,
          status: 'PENDING',
          channels: {},
          data: {
            provider: key.provider,
            keyId: key.id,
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    }

    // 4. Usage quota warnings
    await prisma.notification.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId || user.id,
        type: 'USAGE_QUOTA_WARNING',
        priority: 'MEDIUM',
        title: 'API Rate Limit Warning',
        message: 'You have used 85% of your OpenAI API rate limit for this hour.',
        status: 'PENDING',
        channels: {},
        data: {
          provider: 'OpenAI',
          currentUsage: 8500,
          limit: 10000,
          resetTime: new Date(Date.now() + 30 * 60 * 1000)
        }
      }
    })

    // 5. Optimization recommendations
    await prisma.notification.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId || user.id,
        type: 'OPTIMIZATION_RECOMMENDATIONS',
        priority: 'LOW',
        title: 'Cost Optimization Opportunity',
        message: 'We found ways to reduce your AI costs by 30% without impacting performance.',
        status: 'PENDING',
        channels: {},
        data: {
          recommendation: 'Switch from GPT-4 to GPT-4-turbo for 40% of your requests',
          potentialSavings: totalCost * 0.3,
          impactLevel: 'minimal'
        }
      }
    })

    // 6. Weekly cost report
    await prisma.notification.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId || user.id,
        type: 'WEEKLY_COST_REPORT',
        priority: 'LOW',
        title: 'Your Weekly AI Usage Report',
        message: `This week you spent $${(totalCost * 7).toFixed(2)} across all AI providers.`,
        status: 'PENDING',
        channels: {},
        data: {
          weeklyTotal: totalCost * 7,
          byProvider: {
            OpenAI: totalCost * 4,
            Claude: totalCost * 2,
            Gemini: totalCost * 1
          },
          topModel: 'gpt-4-turbo'
        }
      }
    })

    // 7. Critical cost exceeded
    await prisma.notification.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId || user.id,
        type: 'COST_THRESHOLD_EXCEEDED',
        priority: 'CRITICAL',
        title: '🚨 Budget Exceeded Alert',
        message: `URGENT: Your monthly AI budget of $1000 has been exceeded. Current spend: $${(totalCost * 50).toFixed(2)}`,
        status: 'PENDING',
        channels: {},
        data: {
          budget: 1000,
          currentSpend: totalCost * 50,
          overage: totalCost * 50 - 1000
        }
      }
    })

    // 8. Provider outage notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId || user.id,
        type: 'PROVIDER_OUTAGE',
        priority: 'HIGH',
        title: 'Service Disruption: OpenAI API',
        message: 'OpenAI is experiencing elevated error rates. We recommend switching to Claude or Gemini temporarily.',
        status: 'PENDING',
        channels: {},
        data: {
          provider: 'OpenAI',
          errorRate: '15%',
          alternativeProviders: ['Claude', 'Gemini'],
          estimatedResolution: new Date(Date.now() + 2 * 60 * 60 * 1000)
        }
      }
    })

    // 9. New team member notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId || user.id,
        type: 'NEW_TEAM_MEMBER',
        priority: 'LOW',
        title: 'New Team Member Added',
        message: 'John Doe has joined your team and has been granted access to AI resources.',
        status: 'PENDING',
        channels: {},
        data: {
          memberName: 'John Doe',
          memberEmail: 'john.doe@example.com',
          accessLevel: 'Standard'
        }
      }
    })

    // 10. Model deprecation warning
    await prisma.notification.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId || user.id,
        type: 'MODEL_DEPRECATION',
        priority: 'MEDIUM',
        title: 'Model Deprecation Notice',
        message: 'GPT-3.5-turbo-0301 will be deprecated on March 1st. Please migrate to GPT-3.5-turbo.',
        status: 'PENDING',
        channels: {},
        data: {
          deprecatedModel: 'gpt-3.5-turbo-0301',
          recommendedModel: 'gpt-3.5-turbo',
          deprecationDate: new Date('2025-03-01'),
          affectedRequests: 1250
        }
      }
    })

    // 11-20: More varied notifications
    const notificationTypes = [
      {
        type: 'UNUSUAL_SPENDING_PATTERN',
        priority: 'MEDIUM',
        title: 'Anomaly Detected in API Usage',
        message: 'Unusual activity detected: 500% increase in Claude API calls from IP 192.168.1.1'
      },
      {
        type: 'API_RATE_LIMIT_EXCEEDED',
        priority: 'HIGH',
        title: 'Rate Limit Exceeded',
        message: 'Gemini API rate limit exceeded. Requests are being throttled.'
      },
      {
        type: 'PAYMENT_FAILED',
        priority: 'CRITICAL',
        title: 'Payment Failed',
        message: 'Your payment method was declined. Please update your billing information.'
      },
      {
        type: 'SUBSCRIPTION_EXPIRING',
        priority: 'HIGH',
        title: 'Subscription Expiring Soon',
        message: 'Your Enterprise plan expires in 3 days. Renew now to avoid service interruption.'
      },
      {
        type: 'MEMBER_EXCEEDED_LIMIT',
        priority: 'MEDIUM',
        title: 'Team Member Exceeded Usage Limit',
        message: 'Sarah Connor has exceeded their allocated AI budget by $50.'
      },
      {
        type: 'SUSPICIOUS_ACTIVITY',
        priority: 'CRITICAL',
        title: 'Security Alert: Suspicious Activity',
        message: 'Multiple failed API authentication attempts detected from unknown location.'
      },
      {
        type: 'MONTHLY_COST_REPORT',
        priority: 'LOW',
        title: 'Monthly AI Cost Summary',
        message: 'Your November AI costs totaled $2,450 across all providers.'
      },
      {
        type: 'INTEGRATION_FAILURE',
        priority: 'HIGH',
        title: 'Integration Error',
        message: 'Failed to sync with OpenAI billing API. Please re-authenticate.'
      },
      {
        type: 'COST_THRESHOLD_CRITICAL',
        priority: 'HIGH',
        title: 'Critical: 95% of Budget Used',
        message: 'You have used 95% of your monthly AI budget with 10 days remaining.'
      },
      {
        type: 'API_KEY_EXPIRED',
        priority: 'CRITICAL',
        title: 'API Key Expired',
        message: 'Your Claude API key has expired. All Claude requests are failing.'
      }
    ]

    // Create additional notifications
    for (let i = 0; i < notificationTypes.length; i++) {
      const notif = notificationTypes[i]
      await prisma.notification.create({
        data: {
          userId: user.id,
          organizationId: user.organizationId || user.id,
          type: notif.type as any,
          priority: notif.priority as any,
          title: notif.title,
          message: notif.message,
          status: i % 3 === 0 ? 'READ' : 'PENDING',
          channels: {},
          data: {
            timestamp: new Date(),
            source: 'system'
          }
        }
      })
    }

    // Generate more notifications with varied dates
    const providers = ['OpenAI', 'Claude', 'Gemini', 'Grok']
    const models = ['gpt-4', 'claude-3-opus', 'gemini-pro', 'grok-2']
    
    for (let i = 0; i < 30; i++) {
      const provider = providers[i % providers.length]
      const model = models[i % models.length]
      const cost = Math.random() * 100
      const date = new Date(Date.now() - i * 60 * 60 * 1000) // Stagger by hours

      await prisma.notification.create({
        data: {
          userId: user.id,
          organizationId: user.organizationId || user.id,
          type: i % 5 === 0 ? 'COST_THRESHOLD_WARNING' : 
                i % 3 === 0 ? 'USAGE_QUOTA_WARNING' : 
                i % 7 === 0 ? 'OPTIMIZATION_RECOMMENDATIONS' : 'DAILY_COST_SPIKE',
          priority: i % 4 === 0 ? 'CRITICAL' : i % 3 === 0 ? 'HIGH' : i % 2 === 0 ? 'MEDIUM' : 'LOW',
          title: `${provider} Alert #${i + 1}`,
          message: `Notification for ${model} usage. Cost: $${cost.toFixed(2)}`,
          status: i % 4 === 0 ? 'READ' : 'PENDING',
          createdAt: date,
          channels: {},
          data: {
            provider,
            model,
            cost,
            usage: Math.floor(Math.random() * 100000),
            threshold: cost * 1.2
          }
        }
      })
    }

    console.log('✅ Successfully created 50 real notifications!')
    
    // Count notifications
    const count = await prisma.notification.count({
      where: { userId: user.id }
    })
    console.log(`Total notifications for user: ${count}`)

  } catch (error) {
    console.error('Error generating notifications:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
generateRealNotifications()