'use client'

import { motion } from 'framer-motion'
import { Building2, Shield, Users, BarChart3, Lock, Globe, ChevronRight, CheckCircle, ArrowRight, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { getAIProviderLogo } from '@/components/ui/ai-logos'
import { AI_PROVIDER_IDS } from '@/lib/ai-providers-config'

const features = [
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 Type II, GDPR, HIPAA compliant. SSO, MFA, and role-based access control.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Department-level cost allocation, custom dashboards, and predictive modeling.',
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Granular permissions, approval workflows, and usage policies across teams.',
  },
  {
    icon: Globe,
    title: 'Global Scale',
    description: 'Multi-region deployment, 99.99% uptime SLA, and dedicated infrastructure.',
  },
  {
    icon: Lock,
    title: 'Data Governance',
    description: 'Data residency options, audit logs, and compliance reporting.',
  },
  {
    icon: Briefcase,
    title: 'White Glove Support',
    description: 'Dedicated account manager, 24/7 support, and custom integrations.',
  }
]

const stats = [
  { value: '87%', label: 'Cost Reduction', description: 'Average savings for enterprise clients' },
  { value: '10M+', label: 'API Calls', description: 'Processed daily across our platform' },
  { value: '99.99%', label: 'Uptime SLA', description: 'Guaranteed availability' },
  { value: '24/7', label: 'Support', description: 'Dedicated enterprise support team' }
]

const trustedBy = [
  'Fortune 500 Companies',
  'Leading Healthcare Providers',
  'Global Financial Institutions',
  'Government Agencies'
]

const complianceBadges = [
  'SOC 2 Type II',
  'GDPR',
  'HIPAA',
  'ISO 27001',
  'CCPA'
]

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/5 to-blue-900/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Building2 className="w-4 h-4" />
              <span>Enterprise Grade</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Enterprise AI Cost Management
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 mt-2">
                at Scale
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Trusted by Fortune 500 companies to manage millions in AI spend with enterprise-grade security, compliance, and control.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2"
              >
                Schedule Demo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/resources/whitepaper"
                className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                Download Whitepaper
              </Link>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16"
          >
            <p className="text-center text-sm text-gray-600 mb-6">Trusted by industry leaders</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {trustedBy.map((company, index) => (
                <div key={index} className="text-center">
                  <div className="h-12 flex items-center justify-center text-gray-500 font-medium">
                    {company}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg font-medium mb-1">{stat.label}</div>
                <div className="text-sm text-slate-400">{stat.description}</div>
              </motion.div>
            ))}
          </div>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Enterprise-Ready Features</h2>
            <p className="text-lg text-gray-600">Everything you need to manage AI costs at scale</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Seamless Integration with Your Stack
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Connect with your existing infrastructure and workflows. Our platform integrates with your cloud providers, 
                AI services, and enterprise systems.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Single Sign-On (SSO) with SAML 2.0',
                  'API access for custom integrations',
                  'Webhook notifications for real-time alerts',
                  'Export to your BI tools and data warehouses',
                  'Custom procurement and billing workflows'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/integrations"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Integrations
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-3 gap-4"
            >
              {AI_PROVIDER_IDS.map((provider, index) => (
                <div
                  key={provider}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex items-center justify-center"
                >
                  {getAIProviderLogo(provider, 'w-10 h-10')}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Compliance & Security</h2>
            <p className="text-lg text-gray-600">Meeting the highest standards of enterprise security</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {complianceBadges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="px-6 py-3 bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <span className="font-semibold text-gray-700">{badge}</span>
              </motion.div>
            ))}
          </div>

          <div className="bg-blue-50 rounded-xl p-8 border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Data Protection',
                  description: 'End-to-end encryption, data residency options, and zero-trust architecture'
                },
                {
                  title: 'Access Control',
                  description: 'Role-based permissions, MFA, and comprehensive audit logging'
                },
                {
                  title: 'Compliance',
                  description: 'Regular audits, compliance reporting, and dedicated security team'
                }
              ].map((item, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              See Your Potential ROI
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Enterprise clients save an average of $2.3M annually on AI costs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/ai-cost-calculator"
                className="px-8 py-3 bg-white text-slate-900 rounded-lg hover:bg-gray-100 transition-colors font-medium inline-flex items-center gap-2"
              >
                Calculate ROI
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Request Custom Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-200"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Let's Discuss Your Enterprise Needs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">What you'll get:</h3>
                <ul className="space-y-2">
                  {[
                    'Custom pricing based on your scale',
                    'Dedicated implementation team',
                    'Tailored onboarding and training',
                    'Priority support and SLA guarantees',
                    'Custom integrations and features'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col justify-center">
                <Link
                  href="/contact"
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                >
                  Contact Sales Team
                </Link>
                <p className="text-center text-sm text-gray-600 mt-4">
                  Or call us at <span className="font-semibold">1-800-AI-COSTS</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}