'use client'

import { motion } from 'framer-motion'
import { Rocket, TrendingUp, Users, Zap, Shield, DollarSign, ChevronRight, Star, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getAIProviderLogo } from '@/components/ui/ai-logos'
import { AI_PROVIDER_IDS } from '@/lib/ai-providers-config'

const features = [
  {
    icon: DollarSign,
    title: 'Pay As You Grow',
    description: 'Start with zero upfront costs. Scale pricing with your user base and revenue.'
  },
  {
    icon: Zap,
    title: 'Quick Setup',
    description: 'Get started in under 5 minutes. No complex configurations or lengthy onboarding.'
  },
  {
    icon: TrendingUp,
    title: 'Growth Analytics',
    description: 'Track AI usage patterns as you scale. Identify optimization opportunities early.'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level encryption and SOC 2 compliance from day one.'
  }
]

const pricingTiers = [
  {
    name: 'Bootstrap',
    price: '$0',
    period: '/month',
    description: 'Perfect for MVP and validation',
    users: 'Up to 10 users',
    features: [
      '1 AI provider integration',
      'Basic usage tracking',
      'Email support',
      '10K API calls/month'
    ],
    cta: 'Start Free',
    popular: false
  },
  {
    name: 'Growth',
    price: '$99',
    period: '/month',
    description: 'For startups gaining traction',
    users: 'Up to 100 users',
    features: [
      '3 AI provider integrations',
      'Advanced analytics',
      'Priority support',
      '100K API calls/month',
      'Custom alerts'
    ],
    cta: 'Start Trial',
    popular: true
  },
  {
    name: 'Scale',
    price: '$499',
    period: '/month',
    description: 'Ready to scale rapidly',
    users: 'Unlimited users',
    features: [
      'Unlimited integrations',
      'Real-time monitoring',
      'Dedicated support',
      'Unlimited API calls',
      'Custom reporting',
      'API access'
    ],
    cta: 'Contact Sales',
    popular: false
  }
]

const testimonials = [
  {
    company: 'TechStart',
    quote: 'Saved us $15K in our first quarter by optimizing AI model usage.',
    author: 'Sarah Chen',
    role: 'CTO',
    savings: '$15K saved'
  },
  {
    company: 'AIFlow',
    quote: 'Essential tool for managing our multi-provider AI infrastructure.',
    author: 'Mike Johnson',
    role: 'Founder',
    savings: '40% cost reduction'
  },
  {
    company: 'DataMind',
    quote: 'The insights helped us choose the right AI models for our use case.',
    author: 'Lisa Wang',
    role: 'Head of Engineering',
    savings: '60% faster deployment'
  }
]

export default function StartupsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
              <Rocket className="w-4 h-4" />
              <span>Built for Startups</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AI Cost Management for
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"> Startups</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Start with $0, scale smartly. Track and optimize your AI costs from MVP to IPO.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium inline-flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/ai-cost-calculator"
                className="px-8 py-3 bg-white text-purple-600 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors font-medium"
              >
                Calculate Savings
              </Link>
            </div>
          </motion.div>

          {/* Trusted By */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16"
          >
            <p className="text-center text-sm text-gray-600 mb-6">Trusted by 500+ startups using</p>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              {AI_PROVIDER_IDS.map((provider) => (
                <div key={provider} className="opacity-60 hover:opacity-100 transition-opacity">
                  {getAIProviderLogo(provider, 'w-8 h-8')}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for the Startup Journey</h2>
            <p className="text-lg text-gray-600">From idea validation to Series B and beyond</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pricing that Scales with You</h2>
            <p className="text-lg text-gray-600">Start free, upgrade when you're ready</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl p-8 ${tier.popular ? 'ring-2 ring-purple-600 shadow-xl' : 'border border-gray-200'} relative`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="flex items-baseline mb-2">
                    <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                    <span className="text-gray-600 ml-1">{tier.period}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{tier.description}</p>
                  <p className="text-purple-600 font-medium text-sm">{tier.users}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  tier.popular
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  {tier.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Loved by Startup Teams</h2>
            <p className="text-lg text-gray-600">See how startups are saving on AI costs</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</p>
                  </div>
                  <span className="text-green-600 font-semibold text-sm">{testimonial.savings}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Start Saving on AI Costs Today
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join 500+ startups already optimizing their AI spend
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-medium inline-flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors font-medium"
              >
                Talk to Sales
              </Link>
            </div>
            <p className="text-white/80 text-sm mt-4">No credit card required • 14-day free trial</p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}