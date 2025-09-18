import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { redirect } from 'next/navigation'
import PredictiveAnalyticsClient from './analytics-client'

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic'

export default async function PredictiveAnalyticsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin?callbackUrl=/analytics')
  }

  return <PredictiveAnalyticsClient initialSession={session} />
}