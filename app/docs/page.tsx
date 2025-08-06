'use client'

import { motion } from 'framer-motion'
import { Book, Code2, Rocket, Settings, Shield, Users, ChevronRight, Search, FileText, Video, MessageCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const quickLinks = [
  {
    icon: Rocket,
    title: 'Quick Start',
    description: 'Get up and running in 5 minutes',
    href: '/docs/quickstart',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20'
  },
  {
    icon: Code2,
    title: 'API Reference',
    description: 'Complete API documentation',
    href: '/docs/api',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  },
  {
    icon: Settings,
    title: 'Integrations',
    description: 'Connect AI providers',
    href: '/docs/integrations',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20'
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Security best practices',
    href: '/docs/security',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20'
  }
]

const sections = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', href: '/docs/introduction' },
      { title: 'Quick Start Guide', href: '/docs/quickstart' },
      { title: 'Installation', href: '/docs/installation' },
      { title: 'Authentication', href: '/docs/authentication' },
      { title: 'Your First Integration', href: '/docs/first-integration' }
    ]
  },
  {
    title: 'Core Concepts',
    items: [
      { title: 'Cost Tracking', href: '/docs/cost-tracking' },
      { title: 'Usage Analytics', href: '/docs/usage-analytics' },
      { title: 'Alerts & Limits', href: '/docs/alerts' },
      { title: 'Team Management', href: '/docs/teams' },
      { title: 'Billing & Invoices', href: '/docs/billing' }
    ]
  },
  {
    title: 'Integrations',
    items: [
      { title: 'OpenAI', href: '/docs/integrations/openai' },
      { title: 'Anthropic Claude', href: '/docs/integrations/claude' },
      { title: 'Google Gemini', href: '/docs/integrations/gemini' },
      { title: 'Custom Providers', href: '/docs/integrations/custom' },
      { title: 'Webhooks', href: '/docs/integrations/webhooks' }
    ]
  },
  {
    title: 'API & SDKs',
    items: [
      { title: 'REST API', href: '/docs/api/rest' },
      { title: 'GraphQL API', href: '/docs/api/graphql' },
      { title: 'Python SDK', href: '/docs/sdk/python' },
      { title: 'Node.js SDK', href: '/docs/sdk/nodejs' },
      { title: 'CLI Tool', href: '/docs/cli' }
    ]
  },
  {
    title: 'Best Practices',
    items: [
      { title: 'Cost Optimization', href: '/docs/best-practices/optimization' },
      { title: 'Security Guidelines', href: '/docs/best-practices/security' },
      { title: 'Performance Tips', href: '/docs/best-practices/performance' },
      { title: 'Scaling Guide', href: '/docs/best-practices/scaling' },
      { title: 'Troubleshooting', href: '/docs/troubleshooting' }
    ]
  }
]

const resources = [
  {
    icon: Video,
    title: 'Video Tutorials',
    description: 'Step-by-step video guides',
    href: '/resources/videos'
  },
  {
    icon: FileText,
    title: 'Case Studies',
    description: 'Learn from other teams',
    href: '/resources/case-studies'
  },
  {
    icon: MessageCircle,
    title: 'Community',
    description: 'Join our Discord server',
    href: 'https://discord.gg/aicostguardian'
  }
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6">
              <Book className="w-4 h-4" />
              <span>Documentation</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">
              Everything you need to know
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
              Comprehensive guides, API references, and resources to help you integrate and optimize AI cost tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/docs/quickstart"
                className="px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-medium inline-flex items-center gap-2"
              >
                Quick Start Guide
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="px-8 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors font-medium inline-flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Docs
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 -mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className="block bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 ${link.bgColor} rounded-lg mb-4`}>
                    <link.icon className={`w-6 h-6 ${link.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{link.title}</h3>
                  <p className="text-gray-600 text-sm">{link.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse Documentation</h2>
                <div className="space-y-12">
                  {sections.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h3>
                      <div className="space-y-3">
                        {section.items.map((item, itemIndex) => (
                          <Link
                            key={itemIndex}
                            href={item.href}
                            className="block group"
                          >
                            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all">
                              <span className="text-gray-700 group-hover:text-purple-600 transition-colors">
                                {item.title}
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-8"
              >
                {/* Search Box */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
                  <h3 className="font-semibold text-gray-900 mb-4">Search Documentation</h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Popular Topics */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
                  <h3 className="font-semibold text-gray-900 mb-4">Popular Topics</h3>
                  <div className="space-y-2">
                    {[
                      'Getting Started',
                      'API Authentication',
                      'Cost Optimization',
                      'Team Permissions',
                      'Webhook Setup'
                    ].map((topic, index) => (
                      <Link
                        key={index}
                        href="#"
                        className="block text-sm text-gray-600 hover:text-purple-600 transition-colors"
                      >
                        {topic}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Resources */}
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Additional Resources</h3>
                  <div className="space-y-3">
                    {resources.map((resource, index) => (
                      <Link
                        key={index}
                        href={resource.href}
                        className="flex items-start gap-3 group"
                      >
                        <div className="p-2 bg-white rounded-lg group-hover:bg-purple-100 transition-colors">
                          <resource.icon className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm group-hover:text-purple-600 transition-colors">
                            {resource.title}
                          </div>
                          <div className="text-xs text-gray-600">{resource.description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Still need help?
            </h2>
            <p className="text-gray-600 mb-8">
              Our support team is here to help you with any questions or issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Contact Support
              </Link>
              <Link
                href="https://discord.gg/aicostguardian"
                className="px-6 py-3 bg-white text-purple-600 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors font-medium"
              >
                Join Community
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}