import { Metadata } from 'next'
import AuthWrapper from '@/components/AuthWrapper'
import BillingClient from './billing-client'

export const metadata: Metadata = {
  title: 'Billing & Subscription | AI Cost Guardian',
  description: 'Manage your subscription, billing, and payment methods',
}

export default function BillingPage() {
  return (
    <AuthWrapper>
      <BillingClient />
    </AuthWrapper>
  )
}