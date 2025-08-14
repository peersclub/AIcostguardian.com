import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Define available plans
    const plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        priceMonthly: 0,
        priceYearly: 0,
        credits: 1000,
        features: [
          '1,000 API calls/month',
          'Basic analytics',
          'Community support',
          '2 AI providers',
          'Usage tracking',
          'Export data (CSV)'
        ],
        limits: {
          apiCalls: 1000,
          providers: 2,
          teamMembers: 1,
          dataRetention: 7 // days
        },
        badge: null
      },
      {
        id: 'starter',
        name: 'Starter',
        price: 29,
        priceMonthly: 29,
        priceYearly: 290, // 2 months free
        credits: 10000,
        features: [
          '10,000 API calls/month',
          'Advanced analytics',
          'Email support',
          '4 AI providers',
          'Team collaboration (up to 3)',
          'API key rotation',
          'Export data (CSV, JSON)',
          '30-day data retention'
        ],
        limits: {
          apiCalls: 10000,
          providers: 4,
          teamMembers: 3,
          dataRetention: 30
        },
        badge: null
      },
      {
        id: 'growth',
        name: 'Growth',
        price: 59,
        priceMonthly: 59,
        priceYearly: 590,
        credits: 25000,
        features: [
          '25,000 API calls/month',
          'Advanced analytics',
          'Priority email support',
          '6 AI providers',
          'Team collaboration (up to 5)',
          'Budget alerts',
          'Export data (CSV, JSON)',
          '60-day data retention'
        ],
        limits: {
          apiCalls: 25000,
          providers: 6,
          teamMembers: 5,
          dataRetention: 60
        },
        badge: null
      },
      {
        id: 'scale',
        name: 'Scale',
        price: 99,
        priceMonthly: 99,
        priceYearly: 990,
        credits: 50000,
        features: [
          '50,000 API calls/month',
          'Advanced analytics & insights',
          'Priority email support',
          'All AI providers',
          'Team collaboration (up to 10)',
          'Custom alerts & budgets',
          'API access',
          'Export data (All formats)',
          '90-day data retention',
          'Usage predictions'
        ],
        limits: {
          apiCalls: 50000,
          providers: -1, // unlimited
          teamMembers: 10,
          dataRetention: 90
        },
        badge: 'Most Popular',
        recommended: true
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 299,
        priceMonthly: 299,
        priceYearly: 2990,
        credits: -1, // unlimited
        features: [
          'Unlimited API calls',
          'Advanced analytics & ML insights',
          '24/7 dedicated support',
          'All AI providers',
          'Unlimited team members',
          'Custom integrations',
          'SSO & advanced security',
          'SLA guarantee',
          'Unlimited data retention',
          'Custom reporting',
          'Dedicated account manager'
        ],
        limits: {
          apiCalls: -1,
          providers: -1,
          teamMembers: -1,
          dataRetention: -1
        },
        badge: 'Best Value'
      }
    ]

    // Get user's current plan if they have an organization
    let currentPlan = 'free'
    if (session.user.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { organization: true }
      })
      
      if (user?.organization) {
        currentPlan = user.organization.subscription?.toLowerCase() || 'free'
      }
    }

    return NextResponse.json({
      plans,
      currentPlan,
      currency: 'USD'
    })
  } catch (error) {
    console.error('Error fetching billing plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing plans' },
      { status: 500 }
    )
  }
}