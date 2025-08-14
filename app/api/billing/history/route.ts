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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get billing history from database
    // For now, we'll return sample data based on organization creation
    const billingHistory = []
    
    if (user.organization) {
      const orgCreatedDate = new Date(user.organization.createdAt)
      const now = new Date()
      
      // Generate monthly billing history since organization creation
      const currentDate = new Date(now.getFullYear(), now.getMonth(), 1)
      const startDate = new Date(orgCreatedDate.getFullYear(), orgCreatedDate.getMonth(), 1)
      
      let billDate = new Date(currentDate)
      let invoiceNumber = 1
      
      while (billDate >= startDate && invoiceNumber <= 12) {
        const plan = user.organization.subscription || 'FREE'
        const amount = plan === 'FREE' ? 0 : 
                      plan === 'STARTER' ? 29 :
                      plan === 'GROWTH' ? 59 :
                      plan === 'SCALE' ? 99 :
                      plan === 'ENTERPRISE' ? 299 : 0
        
        if (amount > 0) {
          billingHistory.push({
            id: `bill-${invoiceNumber}`,
            date: billDate.toISOString(),
            amount,
            plan: plan.charAt(0) + plan.slice(1).toLowerCase(),
            status: billDate < now ? 'paid' : 'pending',
            invoice: `INV-${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, '0')}-${String(invoiceNumber).padStart(3, '0')}`,
            description: `${plan.charAt(0) + plan.slice(1).toLowerCase()} Plan - Monthly Subscription`,
            paymentMethod: 'card'
          })
        }
        
        billDate.setMonth(billDate.getMonth() - 1)
        invoiceNumber++
      }
    }

    return NextResponse.json({
      history: billingHistory,
      totalSpent: billingHistory.reduce((sum, bill) => sum + (bill.status === 'paid' ? bill.amount : 0), 0)
    })
  } catch (error) {
    console.error('Error fetching billing history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing history' },
      { status: 500 }
    )
  }
}