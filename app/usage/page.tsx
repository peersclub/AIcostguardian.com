import { Metadata } from 'next'
import AuthWrapper from '@/components/AuthWrapper'
import UsageRedesigned from './usage-redesigned'

export const metadata: Metadata = {
  title: 'Usage Analytics | AI Cost Guardian',
  description: 'Track and optimize your AI API usage across all providers',
}

export default function UsagePage() {
  return (
    <AuthWrapper>
      <UsageRedesigned />
    </AuthWrapper>
  )
}