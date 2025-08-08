'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ClientAuthWrapperProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export default function ClientAuthWrapper({ 
  children, 
  requireAuth = true,
  redirectTo = '/auth/signin',
  fallback
}: ClientAuthWrapperProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (requireAuth && status === 'unauthenticated') {
      const callbackUrl = encodeURIComponent(window.location.pathname)
      router.push(`${redirectTo}?callbackUrl=${callbackUrl}`)
    }
  }, [status, requireAuth, redirectTo, router])

  // Show loading state
  if (status === 'loading') {
    return fallback || (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    )
  }

  // If auth is required but no session, show nothing (redirect will happen)
  if (requireAuth && !session) {
    return null
  }

  // Render children with session
  return <>{children}</>
}