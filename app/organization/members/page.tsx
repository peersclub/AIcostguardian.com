import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { redirect } from 'next/navigation'
import MembersClient from './members-client'
import prisma from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function OrganizationMembersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin?callbackUrl=/organization/members')
  }

  // Check if user has admin/manager role
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email || '' },
    include: {
      organization: true
    }
  })

  if (!user?.organization) {
    redirect('/dashboard')
  }

  // Only ADMIN and MANAGER can access this page
  if (user.role !== 'ADMIN' && user.role !== 'MANAGER' && user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard')
  }

  return <MembersClient initialSession={session} organization={user.organization} userRole={user.role} />
}