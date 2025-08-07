'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Shield, TrendingDown, Brain, Lock, BarChart3, Users, 
  Zap, Globe, CheckCircle, ArrowRight, Star, Award,
  LineChart, PieChart, Activity, DollarSign, AlertCircle,
  Sparkles, ChevronRight, PlayCircle
} from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumCard, PremiumCardHeader, PremiumCardContent } from '@/components/ui/premium-card'
import { getAIProviderLogo } from '@/components/ui/ai-logos'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Premium Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50" />
          <div className="absolute inset-0 gradient-mesh opacity-30" />
          {/* Floating orbs */}
          <motion.div
            animate={{ 
              y: [0, -30, 0],
              x: [0, 20, 0]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-20 left-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              y: [0, 30, 0],
              x: [0, -20, 0]
            }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerChildren}
            className="text-center"
          >
            {/* Premium Badge */}
            <motion.div variants={fadeInUp} className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 backdrop-blur-xl border border-purple-200/50 shadow-lg">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="text-xs sm:text-sm font-semibold text-gray-800">Trusted by Fortune 500 Companies</span>
              </div>
            </motion.div>

            {/* Main Heading with Animation */}
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8"
            >
              <span className="text-gray-900">AI Cost Management</span>
              <br />
              <span className="text-gradient">Reimagined for Enterprise</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p 
              variants={fadeInUp}
              className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Save 40% on AI expenses with real-time monitoring, intelligent optimization, 
              and enterprise-grade control across all major providers.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
            >
              <Link href="/auth/signup">
                <PremiumButton size="lg" icon={ArrowRight} iconPosition="right">
                  Start Free Trial
                </PremiumButton>
              </Link>
              <Link href="/demo">
                <PremiumButton size="lg" variant="secondary" icon={PlayCircle}>
                  Watch Demo
                </PremiumButton>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-wrap justify-center gap-8 text-sm text-gray-600"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>SOC 2 Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <span>Bank-Level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                <span>G2 Leader 2024</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronRight className="w-6 h-6 text-gray-400 rotate-90" />
        </motion.div>
      </section>

      {/* Premium Stats Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {/* Average Savings Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg p-6 h-[160px] flex flex-col justify-between overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-green-50">
                      <TrendingDown className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      +12%
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">40</span>
                      <span className="text-xl font-semibold text-gray-600">%</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Average Savings</p>
                  </div>
                </div>
              </motion.div>

              {/* AI Providers Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg p-6 h-[160px] flex flex-col justify-between overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex -space-x-2">
                      {['openai', 'claude', 'gemini'].map((provider) => (
                        <div key={provider} className="w-7 h-7 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                          {getAIProviderLogo(provider, 'w-4 h-4')}
                        </div>
                      ))}
                      <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                        <span className="text-[10px] font-bold text-gray-600">+22</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">25</span>
                      <span className="text-xl font-semibold text-gray-600">+</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">AI Providers</p>
                  </div>
                </div>
              </motion.div>

              {/* Active Users Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg p-6 h-[160px] flex flex-col justify-between overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-purple-50">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                      +28%
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-gray-900">50K</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Active Users</p>
                  </div>
                </div>
              </motion.div>

              {/* Cost Reduced Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg p-6 h-[160px] flex flex-col justify-between overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-yellow-50">
                      <DollarSign className="w-5 h-5 text-yellow-600" />
                    </div>
                    <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                      +35%
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-semibold text-gray-600">$</span>
                      <span className="text-3xl font-bold text-gray-900">2.5</span>
                      <span className="text-xl font-semibold text-gray-600">M</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Cost Reduced</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Premium Features Grid */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-gradient-blue">Enterprise Features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to master AI costs at scale
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Insights',
                description: 'Machine learning algorithms analyze your usage patterns to identify optimization opportunities.',
                color: 'from-purple-500/10 to-pink-500/10'
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Bank-level encryption, SSO, and compliance with SOC 2, GDPR, and HIPAA standards.',
                color: 'from-blue-500/10 to-cyan-500/10'
              },
              {
                icon: BarChart3,
                title: 'Advanced Analytics',
                description: 'Deep dive into usage metrics with custom dashboards and automated reporting.',
                color: 'from-green-500/10 to-teal-500/10'
              },
              {
                icon: Zap,
                title: 'Real-time Monitoring',
                description: 'Track every API call with millisecond precision and instant cost calculations.',
                color: 'from-yellow-500/10 to-orange-500/10'
              },
              {
                icon: Users,
                title: 'Team Management',
                description: 'Role-based access control, usage limits, and department-level cost allocation.',
                color: 'from-red-500/10 to-pink-500/10'
              },
              {
                icon: AlertCircle,
                title: 'Smart Alerts',
                description: 'Predictive alerts before budget overruns with AI-powered anomaly detection.',
                color: 'from-indigo-500/10 to-purple-500/10'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <PremiumCard hover glow={index === 1} className="h-full flex flex-col">
                  <div className="flex-1">
                    <PremiumCardHeader
                      icon={feature.icon}
                      title={feature.title}
                      subtitle={feature.description}
                    />
                  </div>
                  <PremiumCardContent>
                    <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                      <span>Learn more</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </PremiumCardContent>
                </PremiumCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <PremiumCard variant="gradient" className="overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center p-6 sm:p-8 lg:p-12">
                <div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                    See AICostGuardian in Action
                  </h3>
                  <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                    Watch how leading enterprises reduce AI costs by 40% while improving efficiency and control.
                  </p>
                  <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {[
                      'Real-time cost tracking across 25+ AI providers',
                      'Automated budget alerts and spending limits',
                      'Team usage analytics and optimization',
                      'Enterprise SSO and advanced security'
                    ].map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <PremiumButton icon={PlayCircle}>
                      Watch Demo
                    </PremiumButton>
                    <PremiumButton variant="ghost" icon={ArrowRight} iconPosition="right">
                      Schedule Call
                    </PremiumButton>
                  </div>
                </div>
                <div className="relative mt-8 lg:mt-0">
                  {/* Dashboard Preview */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative rounded-2xl overflow-hidden shadow-2xl"
                  >
                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 sm:p-6 lg:p-8">
                      <div className="bg-white/10 backdrop-blur rounded-xl p-3 sm:p-4 lg:p-6">
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-2 sm:mb-3 lg:mb-4">
                          <div className="bg-white/20 rounded-lg p-2 sm:p-3 lg:p-4">
                            <LineChart className="w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 text-white mb-1 sm:mb-2" />
                            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">$24,580</div>
                            <div className="text-xs sm:text-sm text-white/80">Monthly Spend</div>
                          </div>
                          <div className="bg-white/20 rounded-lg p-2 sm:p-3 lg:p-4">
                            <PieChart className="w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 text-white mb-1 sm:mb-2" />
                            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">-35%</div>
                            <div className="text-xs sm:text-sm text-white/80">vs Last Month</div>
                          </div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-2 sm:p-3 lg:p-4">
                          <Activity className="w-full h-16 sm:h-20 lg:h-24 text-white/40" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  {/* Floating badges */}
                  <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -top-4 -right-4 bg-white rounded-full shadow-xl p-3"
                  >
                    <Star className="w-6 h-6 text-yellow-500" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [10, -10, 10] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -bottom-4 -left-4 bg-white rounded-full shadow-xl p-3"
                  >
                    <Shield className="w-6 h-6 text-green-500" />
                  </motion.div>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Loved by <span className="text-gradient">Industry Leaders</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "AICostGuardian reduced our AI spending by 42% in just 3 months. Incredible ROI!",
                author: "Sarah Chen",
                role: "CTO, TechCorp",
                rating: 5
              },
              {
                quote: "The real-time monitoring and alerts have been game-changing for our team.",
                author: "Michael Rodriguez",
                role: "VP Engineering, DataFlow",
                rating: 5
              },
              {
                quote: "Enterprise-grade security with consumer-grade simplicity. Exactly what we needed.",
                author: "Emily Watson",
                role: "CISO, FinanceAI",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <PremiumCard variant="glass" className="h-full flex flex-col">
                  <PremiumCardContent className="flex-1 flex flex-col">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 italic flex-1">"{testimonial.quote}"</p>
                    <div className="mt-auto">
                      <div className="font-semibold text-gray-900">{testimonial.author}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </PremiumCardContent>
                </PremiumCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <PremiumCard variant="dark" className="text-center p-8 sm:p-10 lg:p-12 xl:p-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6">
                Ready to Optimize Your AI Spending?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 lg:mb-10 max-w-2xl mx-auto">
                Join 500+ companies saving millions on AI costs with intelligent monitoring and optimization.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link href="/auth/signup" className="w-full sm:w-auto">
                  <PremiumButton size="lg" icon={Sparkles} className="w-full sm:w-auto">
                    Start 14-Day Free Trial
                  </PremiumButton>
                </Link>
                <Link href="/pricing" className="w-full sm:w-auto">
                  <PremiumButton size="lg" variant="secondary" icon={DollarSign} className="w-full sm:w-auto">
                    View Pricing
                  </PremiumButton>
                </Link>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mt-6 sm:mt-8">
                No credit card required • Setup in 5 minutes • Cancel anytime
              </p>
            </PremiumCard>
          </motion.div>
        </div>
      </section>
    </div>
  )
}