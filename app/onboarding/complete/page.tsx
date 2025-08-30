'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { 
  CheckCircle, ArrowRight, Sparkles, Zap, Brain,
  BarChart3, Shield, Users, Settings, Key,
  Rocket, Trophy, Star, Gift, PartyPopper
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export default function OnboardingCompletePage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }))
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }))
    }, 250)

    // Animate progress bar
    const timer = setTimeout(() => setProgress(100), 100)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [])

  const quickStartItems = [
    {
      icon: Key,
      title: 'API Keys',
      description: 'Manage your AI provider credentials',
      href: '/settings/api-keys',
      color: 'text-blue-500'
    },
    {
      icon: BarChart3,
      title: 'Dashboard',
      description: 'View your usage analytics and costs',
      href: '/dashboard',
      color: 'text-green-500'
    },
    {
      icon: Brain,
      title: 'AI Optimize',
      description: 'Start using AI with optimized models',
      href: '/aioptimiseV2',
      color: 'text-purple-500'
    },
    {
      icon: Settings,
      title: 'Settings',
      description: 'Configure your preferences',
      href: '/settings',
      color: 'text-orange-500'
    }
  ]

  const features = [
    'Real-time usage tracking',
    'Cost optimization',
    'Multi-provider support',
    'Team collaboration',
    'Advanced analytics',
    'Budget alerts'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-indigo-900">
      <div className="container max-w-6xl mx-auto py-12 px-4">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full p-6">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to AI Cost Guardian! 🎉
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your account is all set up and ready to go
          </p>
          
          <div className="max-w-md mx-auto mb-8">
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">Setup complete!</p>
          </div>
        </motion.div>

        {/* Quick Start Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center">Quick Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStartItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              >
                <Card 
                  className="hover:shadow-lg transition-all cursor-pointer hover:scale-105 border-gray-200 dark:border-gray-800"
                  onClick={() => router.push(item.href)}
                >
                  <CardHeader className="pb-3">
                    <item.icon className={`w-8 h-8 ${item.color} mb-2`} />
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{item.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-12"
        >
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                What You Can Do Now
              </CardTitle>
              <CardDescription>
                You have access to all these powerful features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
          >
            <Rocket className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push('/aioptimise')}
            className="border-gray-300 dark:border-gray-700"
          >
            <Brain className="w-5 h-5 mr-2" />
            Try AI Optimize
          </Button>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Need help getting started?{' '}
            <a href="/docs" className="text-indigo-600 hover:underline">
              Check our documentation
            </a>
            {' '}or{' '}
            <a href="/support" className="text-indigo-600 hover:underline">
              contact support
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}