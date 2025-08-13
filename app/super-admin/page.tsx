import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { redirect } from 'next/navigation'
import SuperAdminClient from './super-admin-client'
import prisma from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function SuperAdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin?callbackUrl=/super-admin')
  }

  // Check if user is super admin
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email || '' },
    select: { isSuperAdmin: true }
  })

  if (!user?.isSuperAdmin) {
    redirect('/dashboard')
  }

  return <SuperAdminClient initialSession={session} />
}