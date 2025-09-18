import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { redirect } from 'next/navigation'
import ExecutiveDashboardClient from './executive-client'

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic'

export default async function ExecutivePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin?callbackUrl=/executive')
  }

  return <ExecutiveDashboardClient initialSession={session} />
}