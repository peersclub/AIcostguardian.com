import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { redirect } from 'next/navigation'

export default async function ProtectedLayout({
  children,
  redirectTo = '/auth/signin'
}: {
  children: React.ReactNode
  redirectTo?: string
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    const callbackUrl = encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/')
    redirect(`${redirectTo}?callbackUrl=${callbackUrl}`)
  }

  return <>{children}</>
}