'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getAIProviderLogo, getAIProviderLogoWithFallback } from '@/components/ui/ai-logos'
import { 
  DollarSign, Search, Zap, TrendingUp, Shield, Beaker, Rocket, Target,
  CheckCircle, ArrowRight, Clock, Users, ChartBar, AlertCircle,
  Cpu, Globe, Activity, BarChart3, Lightbulb, Package, ChevronRight
} from 'lucide-react'

export default function Startups() {
  const startupChallenges = [
    {
      challenge: "Unpredictable AI costs eating into runway",
      solution: "Real-time spend tracking with automatic alerts before budget overruns",
      icon: DollarSign,
      color: "from-red-500 to-orange-500"
    },
    {
      challenge: "No visibility into which AI experiments are worth the cost",
      solution: "Per-project cost tracking with ROI analysis for each AI initiative",
      icon: Search,
      color: "from-blue-500 to-cyan-500"
    },
    {
      challenge: "Limited engineering resources for cost monitoring",
      solution: "5-minute setup with zero maintenance required - focus on building",
      icon: Zap,
      color: "from-yellow-500 to-orange-500"
    },
    {
      challenge: "Need to prove AI ROI to investors and stakeholders",
      solution: "Beautiful reports showing cost efficiency and business impact",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500"
    }
  ]

  const startupFeatures = [
    {
      title: "Budget Protection",
      description: "Never exceed your AI budget again with intelligent alerts and automatic shutoffs",
      icon: Shield,
      color: "from-purple-500 to-pink-500",
      features: [
        "Real-time budget tracking",
        "Smart spending alerts",
        "Automatic cost limits",
        "Runway impact analysis"
      ]
    },
    {
      title: "Experiment Tracking",
      description: "Track costs for every AI experiment and prototype to optimize your research",
      icon: Beaker,
      color: "from-blue-500 to-indigo-500",
      features: [
        "Project-based cost allocation",
        "A/B test cost comparison",
        "Model performance vs cost",
        "Experiment ROI tracking"
      ]
    },
    {
      title: "Quick Integration",
      description: "Get started in minutes, not days - built for fast-moving startups",
      icon: Rocket,
      color: "from-orange-500 to-red-500",
      features: [
        "5-minute setup",
        "No-code integration",
        "Automatic discovery",
        "Zero maintenance"
      ]
    },
    {
      title: "Investor Reporting",
      description: "Impress investors with professional AI spending reports and insights",
      icon: ChartBar,
      color: "from-green-500 to-teal-500",
      features: [
        "Executive dashboards",
        "ROI metrics",
        "Growth projections",
        "Cost optimization insights"
      ]
    }
  ]

  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      description: "Perfect for early-stage startups",
      features: [
        "Up to 3 team members",
        "Basic cost tracking",
        "Email alerts",
        "7-day data retention",
        "Community support"
      ],
      cta: "Start free trial",
      popular: false
    },
    {
      name: "Growth",
      price: "$99",
      description: "For startups ready to scale",
      features: [
        "Up to 10 team members",
        "Advanced analytics",
        "Slack & email alerts",
        "90-day data retention",
        "Priority support",
        "Custom reports"
      ],
      cta: "Start free trial",
      popular: true
    },
    {
      name: "Scale",
      price: "$299",
      description: "For funded startups",
      features: [
        "Unlimited team members",
        "Enterprise analytics",
        "All integrations",
        "Unlimited data retention",
        "24/7 phone support",
        "Custom integrations",
        "Dedicated success manager"
      ],
      cta: "Contact sales",
      popular: false
    }
  ]

  const integrations = [
    { name: "OpenAI GPT-4", providerId: "openai", setup: "2 min" },
    { name: "Claude 3.5", providerId: "claude", setup: "2 min" },
    { name: "Gemini Pro", providerId: "gemini", setup: "2 min" },
    { name: "Cohere", providerId: "cohere", setup: "2 min" },
    { name: "Slack", icon: Package, setup: "1 min" },
    { name: "Discord", icon: Globe, setup: "1 min" },
    { name: "GitHub", icon: Activity, setup: "3 min" },
    { name: "Vercel", icon: Cpu, setup: "2 min" }
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <Badge className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-2">
              <Rocket className="w-4 h-4 mr-2 inline" />
              Built for Startups
            </Badge>
            <h1 className="text-5xl font-bold text-white mb-6">
              Stop AI Costs from Killing Your Runway
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Track, optimize, and control your AI spending before it becomes a problem. 
              Built by startup founders who burned through $50K in AI costs.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-6 text-lg">
                  View Demo Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Pain Points Section */}
      <div className="py-16 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Sound Familiar?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {startupChallenges.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${item.color}`}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-2">{item.challenge}</CardTitle>
                        <CardDescription className="text-gray-400">
                          {item.solution}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Built for Fast-Moving Startups
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Everything you need to control AI costs without slowing down your development
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {startupFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700 hover:border-purple-500/50 transition-all h-full">
                  <CardHeader>
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.color} w-fit mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.features.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-16 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Startup-Friendly Pricing
          </h2>
          <p className="text-gray-400 text-center mb-12">
            30-day free trial. No credit card required. Cancel anytime.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={plan.popular ? 'relative' : ''}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card className={`h-full ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/50' 
                    : 'bg-gray-900/50 border-gray-800'
                } hover:border-gray-600 transition-all`}>
                  <CardHeader>
                    <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-400">/month</span>
                    </div>
                    <CardDescription className="text-gray-400 mt-2">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href="/auth/signup" className="block">
                      <Button className={`w-full ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                          : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                      }`}>
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Integrations Section */}
      <div className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Works With Your Stack
          </h2>
          <p className="text-gray-400 text-center mb-12">
            Seamless integration with all major AI providers and tools
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {integrations.map((integration, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="text-center hover:border-purple-500/50 transition-all p-4 bg-gray-900/50 border-gray-800">
                  <div className="mb-2">
                    {integration.providerId ? (
                      <div className="flex justify-center text-white">
                        {getAIProviderLogo(integration.providerId, 'w-8 h-8', true) || (
                          <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg text-white font-bold">
                            <span className="text-xs">{integration.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                    ) : integration.icon ? (
                      <div className="flex justify-center">
                        <integration.icon className="w-8 h-8 text-gray-400" />
                      </div>
                    ) : null}
                  </div>
                  <h3 className="font-medium text-white text-sm">{integration.name}</h3>
                  <Badge className="mt-2 bg-gray-800 text-gray-400 text-xs border-gray-700">
                    {integration.setup} setup
                  </Badge>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Take Control of Your AI Costs?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of startups saving thousands on AI spending every month
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg">
                Start Free 30-Day Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-6 text-lg">
                View Full Pricing
              </Button>
            </Link>
          </div>
          <p className="text-gray-400 text-sm mt-6">
            No credit card required • Setup in 5 minutes • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  )
}