import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getUserSubscription, getUserSubscriptionPlan } from '@/lib/subscription'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = getUserSubscription(session.user.id)
    const plan = getUserSubscriptionPlan(session.user.id)
    
    return NextResponse.json({ 
      subscription,
      plan
    })
    
  } catch (error) {
    console.error('Subscription status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}