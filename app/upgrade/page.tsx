'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AuthWrapper from '@/components/AuthWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Check, Zap, Shield, Users, BarChart3, Settings, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    billing: 'Forever',
    description: 'Perfect for getting started with AI usage tracking',
    features: [
      'Track usage for all AI providers',
      'Basic analytics and insights',
      '1 Admin API key',
      'Email support',
      'Usage history (30 days)',
      'Basic alerts'
    ],
    limitations: [
      'Limited to 1 admin API key',
      'Basic reporting only',
      'No team collaboration',
      'No advanced analytics'
    ],
    popular: false,
    buttonText: 'Current Plan',
    buttonVariant: 'outline' as const
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    billing: '/month',
    description: 'Advanced features for professionals and small teams',
    features: [
      'Everything in Free',
      'Unlimited Admin API keys',
      'Advanced analytics dashboard',
      'Team collaboration (up to 5 users)',
      'Custom alerts and notifications',
      'Usage history (unlimited)',
      'Export data (CSV, JSON, PDF)',
      'Priority email support',
      'Custom usage limits',
      'API access for integrations'
    ],
    limitations: [],
    popular: true,
    buttonText: 'Upgrade to Pro',
    buttonVariant: 'default' as const
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    billing: '/month',
    description: 'Full-featured solution for large organizations',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Advanced security features',
      'SSO integration',
      'Custom integrations',
      'Dedicated account manager',
      'Phone support',
      '99.9% SLA guarantee',
      'On-premise deployment option',
      'Custom reporting',
      'Audit logs',
      'Compliance tools (SOC2, GDPR)'
    ],
    limitations: [],
    popular: false,
    buttonText: 'Contact Sales',
    buttonVariant: 'outline' as const
  }
]

function UpgradeContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleUpgrade = async (planId: string) => {
    setIsLoading(planId)
    
    try {
      if (planId === 'enterprise') {
        // Redirect to contact form or sales
        window.open('mailto:sales@ai-credit-tracker.com?subject=Enterprise Plan Inquiry', '_blank')
        setIsLoading(null)
        return
      }

      if (planId === 'free') {
        setIsLoading(null)
        return
      }

      // Call the upgrade API
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        alert(`🎉 Successfully upgraded to ${planId.toUpperCase()} plan!\n\nYou can now add unlimited admin API keys and access all Pro features.`)
        router.push('/settings?upgraded=true')
      } else {
        throw new Error(result.error || 'Upgrade failed')
      }
      
    } catch (error) {
      console.error('Upgrade failed:', error)
      alert(`Upgrade failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
    } finally {
      setIsLoading(null)
    }
  }

  const currentPlan = 'free' // This would come from user's subscription status

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upgrade to Pro Features
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock advanced AI usage tracking and management capabilities. 
            Add unlimited admin API keys and get powerful insights for your team.
          </p>
        </div>

        {/* Feature Highlight */}
        <Alert className="mb-8 border-blue-200 bg-blue-50 max-w-4xl mx-auto">
          <Zap className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>🚀 Pro Feature Required:</strong> You're trying to add multiple admin API keys. 
            Upgrade to Pro to manage unlimited admin keys across all AI providers with advanced team collaboration features.
          </AlertDescription>
        </Alert>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {PRICING_PLANS.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${
                plan.popular 
                  ? 'border-blue-500 shadow-lg scale-105' 
                  : currentPlan === plan.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {currentPlan === plan.id && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white px-4 py-1">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-600">{plan.billing}</span>
                </div>
                <CardDescription className="mt-4 text-base">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4 mb-8">
                  <div>
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      Included Features
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-600 mb-3">
                        Limitations
                      </h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-500">
                            <div className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 rounded-full bg-gray-300"></div>
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isLoading === plan.id || currentPlan === plan.id}
                  variant={plan.buttonVariant}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : currentPlan === plan.id
                        ? 'bg-green-600 hover:bg-green-700'
                        : ''
                  }`}
                  size="lg"
                >
                  {isLoading === plan.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Feature Comparison</CardTitle>
            <CardDescription className="text-center">
              See what's included in each plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Features</th>
                    <th className="text-center py-3 px-4">Free</th>
                    <th className="text-center py-3 px-4">Pro</th>
                    <th className="text-center py-3 px-4">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-3 px-4 font-medium">Admin API Keys</td>
                    <td className="text-center py-3 px-4">1</td>
                    <td className="text-center py-3 px-4 text-green-600">Unlimited</td>
                    <td className="text-center py-3 px-4 text-green-600">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Team Members</td>
                    <td className="text-center py-3 px-4">1</td>
                    <td className="text-center py-3 px-4">5</td>
                    <td className="text-center py-3 px-4 text-green-600">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Usage History</td>
                    <td className="text-center py-3 px-4">30 days</td>
                    <td className="text-center py-3 px-4 text-green-600">Unlimited</td>
                    <td className="text-center py-3 px-4 text-green-600">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Advanced Analytics</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4 text-green-600">✅</td>
                    <td className="text-center py-3 px-4 text-green-600">✅</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Data Export</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4 text-green-600">✅</td>
                    <td className="text-center py-3 px-4 text-green-600">✅</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">SSO Integration</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4 text-green-600">✅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
                <p className="text-sm text-gray-600">
                  Yes! You can cancel your subscription at any time. You'll continue to have access to Pro features until the end of your billing period.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                <p className="text-sm text-gray-600">
                  We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Is there a free trial for Pro?</h4>
                <p className="text-sm text-gray-600">
                  Yes! We offer a 14-day free trial for all Pro features. No credit card required.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Do you offer refunds?</h4>
                <p className="text-sm text-gray-600">
                  We offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your purchase.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function UpgradePage() {
  return (
    <AuthWrapper>
      <UpgradeContent />
    </AuthWrapper>
  )
}