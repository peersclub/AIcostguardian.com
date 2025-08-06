'use client'

import { motion } from 'framer-motion'
import { Check, X, Sparkles, Zap, Shield, Users, BarChart3, Headphones, ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    name: 'Hobby',
    price: '$0',
    period: 'forever',
    description: 'For individual developers',
    features: [
      { text: 'Track up to $100/month', included: true },
      { text: '1 AI provider', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Community support', included: true },
      { text: 'API access', included: false },
      { text: 'Team collaboration', included: false },
      { text: 'Custom alerts', included: false },
      { text: 'Priority support', included: false }
    ],
    cta: 'Start Free',
    href: '/signup',
    popular: false,
    color: 'gray'
  },
  {
    name: 'Pro',
    price: '$20',
    period: '/user/month',
    description: 'For professional teams',
    features: [
      { text: 'Track up to $5K/month', included: true },
      { text: 'Unlimited AI providers', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Email support', included: true },
      { text: 'Full API access', included: true },
      { text: 'Up to 10 team members', included: true },
      { text: 'Custom alerts & limits', included: true },
      { text: 'Priority support', included: false }
    ],
    cta: 'Start Free Trial',
    href: '/signup',
    popular: true,
    color: 'purple'
  },
  {
    name: 'Team',
    price: '$50',
    period: '/user/month',
    description: 'For growing companies',
    features: [
      { text: 'Unlimited tracking', included: true },
      { text: 'Unlimited AI providers', included: true },
      { text: 'Advanced analytics & ML', included: true },
      { text: 'Priority support', included: true },
      { text: 'Full API access', included: true },
      { text: 'Unlimited team members', included: true },
      { text: 'Custom workflows', included: true },
      { text: 'SSO & advanced security', included: true }
    ],
    cta: 'Start Free Trial',
    href: '/signup',
    popular: false,
    color: 'blue'
  }
]

const features = [
  { icon: Zap, title: 'Lightning Fast', description: 'Real-time cost tracking with sub-second latency' },
  { icon: Shield, title: 'Enterprise Security', description: 'SOC 2 compliant with end-to-end encryption' },
  { icon: Users, title: 'Team Collaboration', description: 'Granular permissions and role-based access' },
  { icon: BarChart3, title: 'Advanced Analytics', description: 'ML-powered insights and cost predictions' },
  { icon: Headphones, title: '24/7 Support', description: 'Get help whenever you need it' },
  { icon: Sparkles, title: 'AI-Powered', description: 'Smart recommendations to optimize costs' }
]

const faqs = [
  {
    question: 'Can I change plans anytime?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.'
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes, all paid plans come with a 14-day free trial. No credit card required to start.'
  },
  {
    question: 'What happens if I exceed my limits?',
    answer: 'We\'ll notify you when you\'re close to your limits. You can upgrade anytime to continue tracking.'
  },
  {
    question: 'Do you offer discounts for startups?',
    answer: 'Yes! We offer 50% off for eligible startups in their first year. Contact us to apply.'
  }
]

export default function Pricing() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium mb-6 border border-purple-500/30">
              <Sparkles className="w-4 h-4" />
              <span>Simple, transparent pricing</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">
              Start free, scale as you grow
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Track AI costs across all providers. No hidden fees, no surprises.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className={`h-full bg-gray-900 rounded-2xl p-8 border ${
                  plan.popular ? 'border-purple-500' : 'border-gray-800'
                } hover:border-gray-700 transition-colors`}>
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-gray-400 mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-400">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-400 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-600 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-gray-300' : 'text-gray-600'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`block w-full py-3 px-4 rounded-lg font-medium text-center transition-colors ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 border border-gray-700"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium mb-4 border border-blue-500/30">
                  <Shield className="w-4 h-4" />
                  <span>Enterprise</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">Need more power?</h2>
                <p className="text-gray-400 mb-6">
                  Get custom pricing, dedicated support, and enterprise features tailored to your organization.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Custom AI provider integrations',
                    'Dedicated account manager',
                    'Custom SLA & uptime guarantees',
                    'On-premise deployment options',
                    'Advanced security & compliance'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 mt-0.5" />
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Contact Sales
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="text-center lg:text-right">
                <div className="inline-block">
                  <div className="text-5xl font-bold mb-2">Custom</div>
                  <div className="text-gray-400">Tailored to your needs</div>
                </div>
              </div>
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
            <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
            <p className="text-lg text-gray-400">Powerful features for teams of all sizes</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-lg mb-4">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <blockquote className="text-2xl font-medium mb-6">
              "AICostGuardian saved us over $50K in our first quarter. The insights are invaluable."
            </blockquote>
            <div>
              <div className="font-semibold">Sarah Chen</div>
              <div className="text-gray-400">CTO at TechStart</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Frequently asked questions</h2>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800"
              >
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Start tracking AI costs today
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of teams already saving on AI spend
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-gray-500 text-sm mt-4">No credit card required • 14-day free trial</p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}