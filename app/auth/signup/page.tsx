'use client'

import { signIn, getSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function SignUp() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.push('/dashboard')
      }
    })
  }, [router])

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await signIn('google', { 
        callbackUrl: '/onboarding',
        redirect: true 
      })
    } catch (error) {
      console.error('Sign up error:', error)
      setError('Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const enterpriseFeatures = [
    { icon: '📊', title: 'Real-time Cost Tracking', description: 'Monitor AI spending across all providers' },
    { icon: '🔔', title: 'Smart Alerts', description: 'Budget alerts and usage notifications' },
    { icon: '📈', title: 'Advanced Analytics', description: 'Detailed cost breakdowns and insights' },
    { icon: '🔒', title: 'Enterprise Security', description: 'SOC 2 compliant with data encryption' },
    { icon: '👥', title: 'Team Management', description: 'Multi-user access and role controls' },
    { icon: '📋', title: 'Custom Reports', description: 'White-label reports for stakeholders' }
  ]

  const blockedDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
    'aol.com', 'icloud.com', 'mail.com', 'protonmail.com'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <span className="text-2xl font-bold text-white">Credit Tracker</span>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Start tracking AI costs today</h1>
          <p className="text-xl text-slate-300">Join hundreds of companies optimizing their AI spending</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-2xl border-slate-700 bg-white/95 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create Your Account</CardTitle>
              <CardDescription>
                Use your company email to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-red-500 text-xl">⚠️</div>
                    <div>
                      <h4 className="text-red-800 font-medium mb-1">Sign Up Error</h4>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-blue-500 text-xl">🏢</div>
                  <div>
                    <h4 className="text-blue-800 font-medium mb-1">Enterprise Email Required</h4>
                    <p className="text-blue-700 text-sm mb-2">
                      We require business email addresses to ensure you get the full enterprise experience.
                    </p>
                    <div className="text-xs text-blue-600">
                      <span className="font-medium">Personal emails not allowed:</span> {blockedDomains.slice(0, 4).join(', ')}, etc.
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="w-full h-12 text-base font-medium bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Sign up with Google</span>
                  </div>
                )}
              </Button>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="text-green-500 text-xl">🎉</div>
                  <div>
                    <h4 className="text-green-800 font-medium mb-1">Free 14-Day Trial</h4>
                    <p className="text-green-700 text-sm">
                      No credit card required. Full access to all enterprise features.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span>Already have an account?</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                
                <p className="text-sm text-gray-600">
                  <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium">Sign in here</Link>
                </p>
              </div>

              <div className="text-xs text-gray-500 text-center">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-700">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-white/10 border-slate-600 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white text-xl">What you&apos;ll get</CardTitle>
                <CardDescription className="text-slate-300">
                  Everything you need to control AI costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {enterpriseFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="text-2xl">{feature.icon}</div>
                      <div>
                        <h4 className="text-white font-medium">{feature.title}</h4>
                        <p className="text-slate-300 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center space-x-6">
              <Badge className="bg-green-100 text-green-700 px-4 py-2">
                ✓ SOC 2 Type II
              </Badge>
              <Badge className="bg-blue-100 text-blue-700 px-4 py-2">
                ✓ GDPR Compliant
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 px-4 py-2">
                ✓ 99.9% Uptime
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}