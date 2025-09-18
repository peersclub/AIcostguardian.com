import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { redirect } from 'next/navigation'
import ModelOptimizationClient from './optimization-client'

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic'

export default async function ModelOptimizationPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin?callbackUrl=/optimization')
  }

  return <ModelOptimizationClient initialSession={session} />
}