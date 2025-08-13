'use client'

import { motion } from 'framer-motion'
import { Shield, Users, Zap, Globe, Star, ArrowRight, Target, Award, TrendingUp, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function About() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-20"
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-full text-sm font-medium mb-6 border border-indigo-500/30">
              <Shield className="w-4 h-4" />
              <span>Trusted by 1000+ companies</span>
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              About AI Cost Guardian
            </h1>
            <h2 className="text-2xl font-semibold mb-8 text-gray-300">
              Empowering Businesses to Master AI Costs
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              At AI Cost Guardian, we believe that artificial intelligence should accelerate your business growth, not drain your budget. As AI adoption explodes across enterprises, organizations are struggling with a new challenge: unpredictable and escalating costs across multiple AI platforms that can quickly spiral out of control.
            </p>
          </div>
        </motion.div>

        {/* Our Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="py-20"
        >
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-12">
              <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Founded by a team of AI engineers and financial technology experts, AI Cost Guardian was born from a simple observation: while companies were racing to integrate AI into their operations, they were flying blind when it came to managing the associated costs. We witnessed organizations burning through budgets, struggling to track expenses across dozens of AI providers, and lacking the visibility needed to make informed decisions about their AI investments.
              </p>
              <p className="text-lg text-indigo-400 leading-relaxed font-medium">
                We knew there had to be a better way.
              </p>
            </div>
          </div>
        </motion.div>

        {/* What We Do Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="py-20"
        >
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-800/50 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-12">
              <h2 className="text-3xl font-bold text-white mb-6">What We Do</h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                AI Cost Guardian is the comprehensive cost management platform designed specifically for businesses using multiple AI services. Our software connects seamlessly with all major AI providers through simple API integrations, giving you complete visibility and control over your AI spending in one unified dashboard.
              </p>
              
              <h3 className="text-xl font-semibold text-white mb-4">Our platform helps you:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-indigo-400 mr-3 mt-1" />
                  <span className="text-gray-300">Track costs across OpenAI, Anthropic, Google AI, Microsoft Azure AI, AWS Bedrock, and 50+ other providers</span>
                </li>
                <li className="flex items-start">
                  <TrendingUp className="w-5 h-5 text-indigo-400 mr-3 mt-1" />
                  <span className="text-gray-300">Monitor usage patterns and identify cost optimization opportunities</span>
                </li>
                <li className="flex items-start">
                  <Shield className="w-5 h-5 text-indigo-400 mr-3 mt-1" />
                  <span className="text-gray-300">Set intelligent alerts and budgets to prevent overspending</span>
                </li>
                <li className="flex items-start">
                  <BarChart3 className="w-5 h-5 text-indigo-400 mr-3 mt-1" />
                  <span className="text-gray-300">Generate detailed reports for stakeholders and financial planning</span>
                </li>
                <li className="flex items-start">
                  <Target className="w-5 h-5 text-indigo-400 mr-3 mt-1" />
                  <span className="text-gray-300">Optimize AI model selection based on cost-performance analysis</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="py-20"
        >
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-900/50 to-pink-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-12">
                <Award className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  We're on a mission to make AI cost management as sophisticated as the AI technologies themselves. Every business should have the power to harness AI's potential while maintaining complete financial control and transparency.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Why Choose Us Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="py-20"
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-6">Why Choose AI Cost Guardian</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Target className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Comprehensive Coverage</h3>
                </div>
                <p className="text-gray-300">
                  Unlike generic cloud cost tools, we're built specifically for AI workloads and understand the unique billing models of AI providers.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/50 backdrop-blur-xl rounded-2xl border border-emerald-500/30 p-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-emerald-500/20 rounded-lg">
                    <Globe className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Enterprise-Ready</h3>
                </div>
                <p className="text-gray-300">
                  Our platform scales from startups to Fortune 500 companies, with enterprise-grade security and compliance features.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Zap className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Instant Setup</h3>
                </div>
                <p className="text-gray-300">
                  Get started in minutes with our simple API key integration process – no complex configurations or lengthy implementations.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-br from-yellow-900/50 to-orange-800/50 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <Star className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Actionable Insights</h3>
                </div>
                <p className="text-gray-300">
                  We don't just show you numbers; we provide intelligent recommendations to optimize your AI spending without sacrificing performance.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Our Commitment Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="py-20"
        >
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center">
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-12">
                <Shield className="w-16 h-16 text-green-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-white mb-6">Our Commitment</h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  We're committed to transparency, security, and helping our customers achieve maximum value from their AI investments. Your cost data is encrypted, never shared, and always under your control.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="py-20"
        >
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-6">Ready to take control of your AI costs?</h2>
              <p className="text-xl text-gray-300 mb-8">
                Join hundreds of forward-thinking companies who trust AI Cost Guardian to optimize their AI spending.
              </p>
              <p className="text-lg text-indigo-400 mb-8 font-medium">
                Start tracking now – setup takes less than 5 minutes.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <Link
                  href="/auth/signup"
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  Start tracking now
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="mailto:hello@aicostguardian.com"
                  className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all border border-gray-700"
                >
                  Contact our experts
                </Link>
              </div>
              <p className="text-gray-400 text-sm">
                Have questions? Our team of AI cost optimization experts is here to help. 
                Contact us at <a href="mailto:hello@aicostguardian.com" className="text-indigo-400 underline hover:text-indigo-300">hello@aicostguardian.com</a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}