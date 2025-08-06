'use client'

import { signIn, getSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { Shield, Zap, BarChart3, Users, Lock, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import { getAIProviderLogo } from '@/components/ui/ai-logos'
import { AI_PROVIDER_IDS } from '@/lib/ai-providers-config'

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
    { icon: BarChart3, title: 'Real-time Cost Tracking', description: 'Monitor AI spending across all providers' },
    { icon: Shield, title: 'Enterprise Security', description: 'SOC 2 compliant with data encryption' },
    { icon: Users, title: 'Team Management', description: 'Multi-user access and role controls' },
    { icon: Zap, title: 'Instant Integration', description: 'Connect all AI providers in minutes' }
  ]

  const blockedDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
    'aol.com', 'icloud.com', 'mail.com', 'protonmail.com'
  ]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-6xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Link href="/" className="inline-flex items-center justify-center gap-3 mb-8">
              <Logo size="lg" className="h-12" />
            </Link>
            <h1 className="text-5xl font-bold text-white mb-4">
              Start Your AI Cost Journey
            </h1>
            <p className="text-xl text-gray-400">
              Join 500+ companies saving millions on AI infrastructure
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sign Up Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium mb-4 border border-green-500/30">
                  <Sparkles className="w-4 h-4" />
                  <span>14-Day Free Trial</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
                <p className="text-gray-400">Use your company email to get started</p>
              </div>

              <div className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
                  >
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}

                <button
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all font-medium flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-blue-400 text-sm font-medium mb-1">Enterprise Email Required</p>
                      <p className="text-gray-400 text-xs">
                        Use your company email address for full access
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-800" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-900/50 text-gray-400">Already have an account?</span>
                  </div>
                </div>

                <Link
                  href="/auth/signin"
                  className="w-full py-3 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all font-medium text-center"
                >
                  Sign In Instead
                </Link>

                <p className="text-xs text-gray-500 text-center">
                  By signing up, you agree to our{' '}
                  <Link href="/terms" className="text-purple-400 hover:text-purple-300">Terms</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</Link>
                </p>
              </div>
            </motion.div>

            {/* Features Side */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl border border-gray-800 p-8">
                <h3 className="text-xl font-bold text-white mb-6">What you'll get</h3>
                <div className="space-y-4">
                  {enterpriseFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <feature.icon className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{feature.title}</h4>
                        <p className="text-gray-400 text-sm">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* AI Providers */}
              <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
                <p className="text-sm text-gray-400 mb-4">Track costs across all major providers</p>
                <div className="flex items-center justify-center gap-4">
                  {AI_PROVIDER_IDS.map((provider) => (
                    <div key={provider} className="opacity-60 hover:opacity-100 transition-opacity">
                      {getAIProviderLogo(provider, 'w-8 h-8')}
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  SOC 2 Type II
                </div>
                <div className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium border border-blue-500/30">
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  GDPR Compliant
                </div>
                <div className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium border border-purple-500/30">
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  99.9% Uptime
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}