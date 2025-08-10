import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin?callbackUrl=/dashboard')
  }

  return <DashboardClient initialSession={session} />
}