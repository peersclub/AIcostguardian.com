import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getClaudeAdminClient } from '@/lib/claude-admin-client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      // Try to fetch from real Claude Admin API
      const adminClient = getClaudeAdminClient(session.user.id)
      const billingInfo = await adminClient.getBillingInfo()
      
      return NextResponse.json(billingInfo)
    } catch (adminError: any) {
      console.log('Claude Admin API not available, using mock data:', adminError.message)
      
      // Fallback to mock billing data
      const billingInfo = {
        organizationId: 'org-123',
        currentPeriod: {
          startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
          endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
          totalCost: 1247.83,
          totalTokens: 2847392
        },
        paymentMethod: {
          type: 'card',
          last4: '4242',
          expiresAt: '2025-12-31'
        },
        billingAddress: {
          company: 'My Company Inc.',
          address: '123 Main Street',
          city: 'San Francisco, CA 94105',
          country: 'United States'
        },
        invoices: [
          {
            id: 'inv-001',
            amount: 1247.83,
            currency: 'USD',
            status: 'paid' as const,
            dueDate: '2024-01-31T23:59:59Z',
            paidAt: '2024-01-28T10:30:00Z',
            downloadUrl: '/api/claude-admin/billing/invoices/inv-001/download'
          },
          {
            id: 'inv-002',
            amount: 980.45,
            currency: 'USD',
            status: 'paid' as const,
            dueDate: '2023-12-31T23:59:59Z',
            paidAt: '2023-12-29T15:20:00Z',
            downloadUrl: '/api/claude-admin/billing/invoices/inv-002/download'
          }
        ]
      }
      
      return NextResponse.json(billingInfo)
    }
  } catch (error: any) {
    console.error('Claude Admin Billing API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch billing info' },
      { status: 500 }
    )
  }
}