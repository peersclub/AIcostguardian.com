'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getAIProviderLogo, getAIProviderLogoWithFallback } from '@/components/ui/ai-logos'
import { 
  DollarSign, Eye, BarChart2, AlertTriangle, Tags, Palette, Users, FileText,
  CheckCircle, ArrowRight, Clock, ChartBar, Shield, TrendingUp,
  Cpu, Globe, Activity, BarChart3, Lightbulb, Package, ChevronRight,
  Briefcase, Building, Layers, Zap, Settings, Database, Award
} from 'lucide-react'

export default function Agencies() {
  const agencyChallenges = [
    {
      challenge: "Client AI costs eating into project margins",
      solution: "Track and bill AI costs per client project with transparent reporting",
      icon: DollarSign,
      color: "from-red-500 to-orange-500",
      impact: "Protect 15-25% profit margins"
    },
    {
      challenge: "No visibility into AI spend across creative projects",
      solution: "Real-time cost tracking for copywriting, design generation, and content creation",
      icon: Eye,
      color: "from-blue-500 to-cyan-500",
      impact: "100% cost visibility"
    },
    {
      challenge: "Difficult to justify AI tool costs to clients",
      solution: "Detailed reports showing AI usage value and efficiency gains",
      icon: BarChart2,
      color: "from-green-500 to-emerald-500",
      impact: "Easier client conversations"
    },
    {
      challenge: "Team members over-using expensive AI models",
      solution: "Smart alerts and usage limits to prevent budget overruns",
      icon: AlertTriangle,
      color: "from-yellow-500 to-orange-500",
      impact: "30% cost reduction"
    }
  ]

  const agencyFeatures = [
    {
      title: "Client Cost Allocation",
      description: "Track AI costs by client, project, and campaign for accurate billing",
      icon: Tags,
      color: "from-purple-500 to-pink-500",
      features: [
        "Per-client cost tracking",
        "Project-based cost allocation",
        "Campaign-level analytics",
        "Automated billing reports"
      ]
    },
    {
      title: "Creative Workflow Integration",
      description: "Monitor AI usage across design, copy, and content creation workflows",
      icon: Palette,
      color: "from-blue-500 to-indigo-500",
      features: [
        "Design generation tracking",
        "Copywriting cost monitoring",
        "Content creation analytics",
        "Creative tool integration"
      ]
    },
    {
      title: "Team Management",
      description: "Control access and monitor usage across your creative team",
      icon: Users,
      color: "from-green-500 to-teal-500",
      features: [
        "Role-based access control",
        "Individual usage tracking",
        "Team budget limits",
        "Performance analytics"
      ]
    },
    {
      title: "Client Reporting",
      description: "Professional reports that demonstrate AI tool value to clients",
      icon: FileText,
      color: "from-orange-500 to-red-500",
      features: [
        "White-label reports",
        "ROI calculations",
        "Before/after comparisons",
        "Value justification metrics"
      ]
    }
  ]

  const agencyUseCases = [
    {
      agency: "Creative Studios Inc.",
      type: "Full-Service Creative Agency",
      size: "25 employees",
      icon: Briefcase,
      color: "from-purple-600 to-pink-800",
      challenge: "Managing AI costs across 15+ client accounts with different budgets and requirements",
      aiTools: ["openai", "claude", "gemini"],
      solution: "Implemented client-specific cost tracking with automated billing integration",
      results: [
        "40% increase in project profitability",
        "Zero budget overruns in 6 months",
        "Client satisfaction up 25%",
        "Billing accuracy improved by 90%"
      ],
      testimonial: "AI Cost Guardian transformed how we handle AI expenses. We can now confidently offer AI-powered services knowing exactly what each client project costs."
    },
    {
      agency: "Digital Marketing Pros",
      type: "Digital Marketing Agency",
      size: "12 employees",
      icon: TrendingUp,
      color: "from-blue-600 to-cyan-800",
      challenge: "High AI costs for content creation and ad copy generation across multiple campaigns",
      aiTools: ["claude", "openai"],
      solution: "Set up campaign-level tracking with real-time alerts for budget management",
      results: [
        "35% reduction in AI tool costs",
        "Improved campaign ROI by 28%",
        "Faster client reporting turnaround",
        "Better resource allocation"
      ],
      testimonial: "We used to guess at AI costs. Now we optimize every campaign with precise cost data and our clients love the transparency."
    },
    {
      agency: "Brand Design Studio",
      type: "Brand & Identity Agency",
      size: "8 employees",
      icon: Palette,
      color: "from-green-600 to-emerald-800",
      challenge: "Expensive design generation tools impacting small project margins",
      aiTools: ["midjourney", "dalle", "stable-diffusion"],
      solution: "Project-based cost allocation with model optimization recommendations",
      results: [
        "50% cost savings through model optimization",
        "Maintained design quality standards",
        "Faster project delivery times",
        "Increased project margins by 20%"
      ],
      testimonial: "The cost optimization suggestions helped us use the right AI tool for each design task, saving money without compromising creativity."
    }
  ]

  const agencyTools = [
    {
      category: "Content Creation",
      icon: FileText,
      tools: [
        { name: "Claude 3.5", providerId: "claude", use: "Long-form content, strategy docs", cost: "High accuracy" },
        { name: "GPT-4", providerId: "openai", use: "Social media, quick copy", cost: "Cost effective" },
        { name: "Gemini Pro", providerId: "gemini", use: "Complex research, analysis", cost: "Premium intelligence" },
        { name: "Cohere", providerId: "cohere", use: "Natural language processing", cost: "Balanced pricing" }
      ]
    },
    {
      category: "Visual Design",
      icon: Palette,
      tools: [
        { name: "Midjourney", providerId: "midjourney", use: "Concept art, mood boards", cost: "Subscription" },
        { name: "DALL-E 3", providerId: "dalle", use: "Product mockups, illustrations", cost: "Per image" },
        { name: "Stable Diffusion", providerId: "stable-diffusion", use: "Bulk image generation", cost: "Low cost" },
        { name: "Perplexity", providerId: "perplexity", use: "Research & insights", cost: "Usage-based" }
      ]
    },
    {
      category: "Integration Tools",
      icon: Layers,
      tools: [
        { name: "Slack", icon: Package, use: "Team notifications", cost: "Free" },
        { name: "Discord", icon: Globe, use: "Community updates", cost: "Free" },
        { name: "GitHub", icon: Activity, use: "Code integration", cost: "Free" },
        { name: "Vercel", icon: Cpu, use: "Deployment", cost: "Free" }
      ]
    }
  ]

  const pricingTiers = [
    {
      name: "Agency Starter",
      price: "49",
      description: "Perfect for small creative teams",
      features: [
        "Track up to $2K/month in AI costs",
        "5 client projects",
        "Basic reporting",
        "Email support",
        "Team of up to 10"
      ],
      cta: "Start free trial",
      popular: false
    },
    {
      name: "Agency Pro",
      price: "149",
      description: "For growing agencies",
      features: [
        "Track up to $10K/month in AI costs",
        "Unlimited client projects",
        "White-label reports",
        "Client billing integration",
        "Priority support",
        "Advanced analytics"
      ],
      cta: "Start free trial",
      popular: true
    },
    {
      name: "Agency Enterprise",
      price: "Custom",
      description: "For large agencies",
      features: [
        "Unlimited AI cost tracking",
        "Custom integrations",
        "Dedicated account manager",
        "Advanced security",
        "Custom reporting",
        "API access"
      ],
      cta: "Contact sales",
      popular: false
    }
  ]

  const workflowSteps = [
    {
      step: "1",
      title: "Connect Your AI Tools",
      description: "Integrate with all major AI platforms your agency uses",
      time: "5 minutes",
      icon: Zap,
      tools: ["OpenAI", "Claude", "Gemini", "Midjourney"]
    },
    {
      step: "2", 
      title: "Set Up Client Projects",
      description: "Create projects and assign team members with budget limits",
      time: "10 minutes",
      icon: Settings,
      tools: ["Project Management", "Budget Controls", "Team Access"]
    },
    {
      step: "3",
      title: "Track Usage in Real-Time",
      description: "Monitor AI costs as your team creates content and designs",
      time: "Automatic",
      icon: Activity,
      tools: ["Real-time Tracking", "Usage Alerts", "Cost Analytics"]
    },
    {
      step: "4",
      title: "Generate Client Reports",
      description: "Create professional reports showing AI value and costs",
      time: "2 minutes",
      icon: FileText,
      tools: ["White-label Reports", "ROI Metrics", "Billing Integration"]
    }
  ]

  const securityFeatures = [
    { feature: "SOC 2 Type II Certified", icon: Award },
    { feature: "GDPR & CCPA Compliant", icon: Shield },
    { feature: "End-to-end Encryption", icon: Database },
    { feature: "Single Sign-On (SSO)", icon: Users },
    { feature: "Role-Based Access", icon: Settings },
    { feature: "Audit Logging", icon: FileText }
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <Badge className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-2">
              <Palette className="w-4 h-4 mr-2 inline" />
              Built for Creative Agencies
            </Badge>
            <h1 className="text-5xl font-bold text-white mb-6">
              Transform AI Costs into Profit Centers
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Track, allocate, and bill AI costs to clients with precision. Built specifically for creative 
              agencies managing multiple client projects and AI-powered workflows.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg">
                  Start 14-Day Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-6 text-lg">
                  View Agency Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700 hover:border-purple-500/50 transition-all">
                <CardContent className="pt-6">
                  <Briefcase className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">200+</div>
                  <div className="text-sm text-purple-400 font-medium">Active Agencies</div>
                  <div className="text-xs text-gray-400 mt-1">Growing every month</div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700 hover:border-purple-500/50 transition-all">
                <CardContent className="pt-6">
                  <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">35%</div>
                  <div className="text-sm text-green-400 font-medium">Cost Reduction</div>
                  <div className="text-xs text-gray-400 mt-1">Average savings</div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700 hover:border-purple-500/50 transition-all">
                <CardContent className="pt-6">
                  <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">40%</div>
                  <div className="text-sm text-blue-400 font-medium">Margin Increase</div>
                  <div className="text-xs text-gray-400 mt-1">Project profitability</div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700 hover:border-purple-500/50 transition-all">
                <CardContent className="pt-6">
                  <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">5 min</div>
                  <div className="text-sm text-yellow-400 font-medium">Setup Time</div>
                  <div className="text-xs text-gray-400 mt-1">Start tracking instantly</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Pain Points Section */}
      <div className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Agency AI Cost Challenges We Solve
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agencyChallenges.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gray-900/50 border-gray-800 hover:border-purple-500/50 transition-all">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${item.color}`}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-2">{item.challenge}</CardTitle>
                        <CardDescription className="text-gray-400 mb-3">
                          {item.solution}
                        </CardDescription>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          Impact: {item.impact}
                        </Badge>
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
      <div className="py-16 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Features Built for Creative Agencies
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Everything you need to manage AI costs across clients, projects, and creative workflows
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agencyFeatures.map((feature, index) => (
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

      {/* Success Stories */}
      <div className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Real Agency Success Stories
          </h2>
          <div className="space-y-8">
            {agencyUseCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700 hover:border-purple-500/50 transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${useCase.color}`}>
                        <useCase.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-white">{useCase.agency}</CardTitle>
                        <div className="flex gap-2 mt-1">
                          <Badge className="bg-gray-700 text-gray-300 border-gray-600">{useCase.type}</Badge>
                          <Badge className="bg-gray-700 text-gray-300 border-gray-600">{useCase.size}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-300 mb-2">Challenge</h4>
                          <p className="text-gray-400">{useCase.challenge}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-300 mb-2">AI Tools Used</h4>
                          <div className="flex flex-wrap gap-2">
                            {useCase.aiTools.map((tool, toolIndex) => {
                              const logo = getAIProviderLogo(tool, 'w-4 h-4', true)
                              return logo ? (
                                <div key={toolIndex} className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-lg border border-gray-700">
                                  {logo}
                                  <span className="text-gray-300 text-sm capitalize">{tool}</span>
                                </div>
                              ) : null
                            })}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-300 mb-2">Solution</h4>
                          <p className="text-gray-400">{useCase.solution}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-300 mb-2">Results</h4>
                          <ul className="space-y-1">
                            {useCase.results.map((result, resultIndex) => (
                              <li key={resultIndex} className="text-green-400 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                {result}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="lg:col-span-1">
                        <div className="bg-purple-900/20 p-6 rounded-lg border border-purple-500/30">
                          <h4 className="font-semibold text-white mb-3">Testimonial</h4>
                          <blockquote className="text-gray-300 italic">
                            "{useCase.testimonial}"
                          </blockquote>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Tools Section */}
      <div className="py-16 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Track Costs Across All Your AI Tools
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            We support all the AI tools creative agencies use daily
          </p>
          <div className="space-y-12">
            {agencyTools.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <category.icon className="w-6 h-6 mr-3 text-purple-400" />
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {category.tools.map((tool, toolIndex) => (
                    <Card key={toolIndex} className="bg-gray-900/50 border-gray-800 hover:border-purple-500/50 transition-all">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          {'providerId' in tool && tool.providerId ? (
                            getAIProviderLogo(tool.providerId, 'w-6 h-6', true)
                          ) : 'icon' in tool && tool.icon ? (
                            <tool.icon className="w-6 h-6 text-gray-400" />
                          ) : null}
                          <CardTitle className="text-lg text-white">{tool.name}</CardTitle>
                        </div>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 w-fit">
                          {tool.cost}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-400">{tool.use}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workflow Section */}
      <div className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Simple Setup for Agency Workflows
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700 hover:border-purple-500/50 transition-all h-full">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                      {step.step}
                    </div>
                    <step.icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                    <CardTitle className="text-white">{step.title}</CardTitle>
                    <Badge variant="outline" className="text-xs mx-auto border-gray-600 text-gray-400">
                      {step.time}
                    </Badge>
                    <CardDescription className="text-gray-400 mt-2">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {step.tools.map((tool, toolIndex) => (
                        <div key={toolIndex} className="text-sm text-gray-400 flex items-center">
                          <ChevronRight className="w-3 h-3 text-purple-500 mr-2" />
                          {tool}
                        </div>
                      ))}
                    </div>
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
            Agency-Focused Pricing
          </h2>
          <p className="text-gray-400 text-center mb-12">
            14-day free trial. No credit card required. Cancel anytime.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={tier.popular ? 'relative' : ''}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card className={`h-full ${
                  tier.popular 
                    ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/50' 
                    : 'bg-gray-900/50 border-gray-800'
                } hover:border-gray-600 transition-all`}>
                  <CardHeader>
                    <CardTitle className="text-2xl text-white">{tier.name}</CardTitle>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-bold text-white">
                        {tier.price === 'Custom' ? 'Custom' : `$${tier.price}`}
                      </span>
                      {tier.price !== 'Custom' && <span className="text-gray-400">/month</span>}
                    </div>
                    <CardDescription className="text-gray-400 mt-2">
                      {tier.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href="/auth/signup" className="block">
                      <Button className={`w-full ${
                        tier.popular 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                          : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                      }`}>
                        {tier.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Enterprise Security & Compliance
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Your client data is protected with bank-grade security
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {securityFeatures.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="text-center p-4 bg-gray-900/50 border-gray-800 hover:border-purple-500/50 transition-all">
                  <item.icon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">{item.feature}</p>
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
            Ready to Turn AI Costs into Profit?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join 200+ creative agencies increasing project margins by tracking and billing AI costs accurately
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg">
                Start 14-Day Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-6 text-lg">
                Schedule Agency Demo
              </Button>
            </Link>
          </div>
          <p className="text-gray-400 text-sm mt-6">
            14-day free trial • No setup fees • Cancel anytime • White-label reports included
          </p>
        </div>
      </div>
    </div>
  )
}