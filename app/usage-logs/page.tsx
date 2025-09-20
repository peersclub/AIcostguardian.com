import { Metadata } from 'next'
import AuthWrapper from '@/components/AuthWrapper'
import UsageLogsClient from './usage-logs-client'

export const metadata: Metadata = {
  title: 'Usage Logs Detail | AI Cost Guardian',
  description: 'Detailed view of all AI API usage logs and calls',
}

export default function UsageLogsPage() {
  return (
    <AuthWrapper>
      <UsageLogsClient />
    </AuthWrapper>
  )
}