'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Signup() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to new auth signup page
    router.replace('/auth/signup')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p>Redirecting to sign up...</p>
      </div>
    </div>
  )
}