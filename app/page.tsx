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
import { PremiumStat, PremiumStatsGrid } from '@/components/ui/premium-stats'

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
                <span className="text-sm font-semibold text-gray-800">Trusted by Fortune 500 Companies</span>
                <div className="flex -space-x-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white" />
                  ))}
                  <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-semibold">
                    +500
                  </div>
                </div>
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
            <PremiumStatsGrid>
              <PremiumStat
                label="Average Savings"
                value="40"
                suffix="%"
                icon={TrendingDown}
                color="green"
                change={{ value: 12, trend: 'up' }}
                description="vs. last quarter"
              />
              <PremiumStat
                label="AI Providers"
                value="25"
                suffix="+"
                icon={Globe}
                color="blue"
                description="Integrated platforms"
              />
              <PremiumStat
                label="Active Users"
                value="50,000"
                suffix="+"
                icon={Users}
                color="purple"
                change={{ value: 28, trend: 'up' }}
                description="Enterprise users"
              />
              <PremiumStat
                label="Cost Reduced"
                value="2.5"
                prefix="$"
                suffix="M"
                icon={DollarSign}
                color="yellow"
                change={{ value: 35, trend: 'up' }}
                description="Total saved"
              />
            </PremiumStatsGrid>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              >
                <PremiumCard hover glow={index === 1}>
                  <PremiumCardHeader
                    icon={feature.icon}
                    title={feature.title}
                    subtitle={feature.description}
                  />
                  <PremiumCardContent>
                    <div className="flex items-center gap-2 text-sm text-purple-600 font-medium mt-4">
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
              <div className="grid lg:grid-cols-2 gap-12 items-center p-12">
                <div>
                  <h3 className="text-3xl lg:text-4xl font-bold mb-6">
                    See AICostGuardian in Action
                  </h3>
                  <p className="text-lg text-gray-600 mb-8">
                    Watch how leading enterprises reduce AI costs by 40% while improving efficiency and control.
                  </p>
                  <ul className="space-y-4 mb-8">
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
                  <div className="flex gap-4">
                    <PremiumButton icon={PlayCircle}>
                      Watch Demo
                    </PremiumButton>
                    <PremiumButton variant="ghost" icon={ArrowRight} iconPosition="right">
                      Schedule Call
                    </PremiumButton>
                  </div>
                </div>
                <div className="relative">
                  {/* Dashboard Preview */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative rounded-2xl overflow-hidden shadow-2xl"
                  >
                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-8">
                      <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-white/20 rounded-lg p-4">
                            <LineChart className="w-8 h-8 text-white mb-2" />
                            <div className="text-2xl font-bold text-white">$24,580</div>
                            <div className="text-sm text-white/80">Monthly Spend</div>
                          </div>
                          <div className="bg-white/20 rounded-lg p-4">
                            <PieChart className="w-8 h-8 text-white mb-2" />
                            <div className="text-2xl font-bold text-white">-35%</div>
                            <div className="text-sm text-white/80">vs Last Month</div>
                          </div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-4">
                          <Activity className="w-full h-24 text-white/40" />
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
              >
                <PremiumCard variant="glass">
                  <PremiumCardContent>
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                    <div>
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
            <PremiumCard variant="dark" className="text-center p-12 lg:p-16">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                Ready to Optimize Your AI Spending?
              </h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Join 500+ companies saving millions on AI costs with intelligent monitoring and optimization.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth/signup">
                  <PremiumButton size="xl" icon={Sparkles}>
                    Start 14-Day Free Trial
                  </PremiumButton>
                </Link>
                <Link href="/pricing">
                  <PremiumButton size="xl" variant="secondary" icon={DollarSign}>
                    View Pricing
                  </PremiumButton>
                </Link>
              </div>
              <p className="text-gray-400 text-sm mt-8">
                No credit card required • Setup in 5 minutes • Cancel anytime
              </p>
            </PremiumCard>
          </motion.div>
        </div>
      </section>
    </div>
  )
}