'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginRequired() {
  const [mounted, setMounted] = useState(false)
  const [dots, setDots] = useState('')
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    // Animate dots
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)

    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 transform transition-all duration-500 hover:scale-105">
          {/* Lock Icon with Animation */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                <svg 
                  className="w-12 h-12 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                  />
                </svg>
              </div>
              {/* Floating particles */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="absolute top-8 -right-4 w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Hold On There!
            </h1>
            <p className="text-gray-600">
              You need to be logged in to access this page
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <span>Track API usage across all providers</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <span>Monitor costs in real-time</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <span>Manage all your AI API keys securely</span>
            </div>
          </div>

          {/* Login Button */}
          <Link 
            href="/auth/signin"
            className="block w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transform transition-all duration-200 hover:scale-105 shadow-lg"
          >
            Sign In to Continue
          </Link>

          {/* Loading indicator */}
          <div className="text-center text-sm text-gray-500">
            Waiting for authentication{dots}
          </div>
        </div>

        {/* Bottom text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link href="/auth/signin" className="text-purple-600 hover:text-purple-700 font-medium">
            Get started for free
          </Link>
        </p>
      </div>
    </div>
  )
}