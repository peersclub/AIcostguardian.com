'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import LoginRequired from './LoginRequired'

interface AuthWrapperProps {
  children: React.ReactNode
  showLoading?: boolean
}

export default function AuthWrapper({ children, showLoading = true }: AuthWrapperProps) {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted (prevents hydration issues)
  if (!mounted) {
    return null
  }

  // Show loading state
  if (status === 'loading' && showLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login required page if not authenticated
  if (status === 'unauthenticated' || !session) {
    return <LoginRequired />
  }

  // User is authenticated, show the protected content
  return <>{children}</>
}