import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { upgradeUserSubscription } from '@/lib/subscription'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId } = await request.json()

    if (!planId || !['pro', 'enterprise'].includes(planId)) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
    }

    // In a real implementation, this would:
    // 1. Create a Stripe/Paddle subscription
    // 2. Handle payment processing
    // 3. Update the database with subscription details
    // 4. Send confirmation emails
    
    // For now, we'll just mock the upgrade
    const success = await upgradeUserSubscription(session.user.id, planId)
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: `Successfully upgraded to ${planId} plan`,
        planId 
      })
    } else {
      return NextResponse.json({ error: 'Upgrade failed' }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Subscription upgrade error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}