'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  BarChart3, Building2, Shield, Plug, Users, TrendingUp, 
  CheckCircle, ArrowRight, Globe, Lock, Activity, Cpu,
  Database, FileCheck, Briefcase, Award, ChevronRight,
  Settings, LineChart, PieChart, Target, AlertTriangle
} from 'lucide-react'

export default function Enterprise() {
  const enterpriseFeatures = [
    {
      title: "Advanced Cost Analytics",
      description: "Deep insights into AI spending patterns across departments, teams, and projects",
      icon: BarChart3,
      color: "from-blue-500 to-indigo-500",
      features: [
        "Multi-dimensional cost analysis",
        "Department & project cost allocation",
        "Budget forecasting & variance analysis",
        "ROI tracking for AI initiatives"
      ]
    },
    {
      title: "Enterprise Governance",
      description: "Comprehensive controls and policies for large-scale AI operations",
      icon: Building2,
      color: "from-purple-500 to-pink-500",
      features: [
        "Custom approval workflows",
        "Spending policies & limits",
        "Risk assessment frameworks",
        "Compliance audit trails"
      ]
    },
    {
      title: "Advanced Security",
      description: "Enterprise-grade security with custom compliance requirements",
      icon: Shield,
      color: "from-green-500 to-emerald-500",
      features: [
        "Private cloud deployment",
        "Custom security policies",
        "Advanced threat detection",
        "Regulatory compliance support"
      ]
    },
    {
      title: "Custom Integrations",
      description: "Seamless integration with your existing enterprise systems",
      icon: Plug,
      color: "from-orange-500 to-red-500",
      features: [
        "ERP system integration",
        "Custom API development",
        "Data warehouse connectivity",
        "Business intelligence tools"
      ]
    }
  ]

  const useCases = [
    {
      industry: "Financial Services",
      icon: Briefcase,
      color: "from-blue-600 to-blue-800",
      challenge: "Managing AI costs across trading algorithms, risk analysis, and customer service",
      solution: "Department-level cost tracking with real-time budget monitoring and compliance reporting",
      results: "35% reduction in AI spending with improved risk management compliance"
    },
    {
      industry: "Healthcare",
      icon: Activity,
      color: "from-green-600 to-teal-800",
      challenge: "Tracking AI costs for medical imaging, diagnostics, and research initiatives",
      solution: "Project-based cost allocation with HIPAA-compliant data handling and audit trails",
      results: "28% cost optimization while maintaining regulatory compliance"
    },
    {
      industry: "Technology",
      icon: Cpu,
      color: "from-purple-600 to-indigo-800",
      challenge: "Managing AI infrastructure costs across multiple product teams and environments",
      solution: "Multi-tenant cost tracking with automated scaling recommendations",
      results: "42% reduction in AI infrastructure costs through optimization insights"
    },
    {
      industry: "Manufacturing",
      icon: Settings,
      color: "from-orange-600 to-red-800",
      challenge: "Optimizing AI costs for predictive maintenance and quality control systems",
      solution: "Real-time cost monitoring with predictive analytics for budget planning",
      results: "31% cost savings with improved operational efficiency"
    }
  ]

  const enterpriseStats = [
    { metric: "99.99%", label: "Uptime SLA", description: "Enterprise-grade reliability", icon: Activity },
    { metric: "$50M+", label: "AI Costs Tracked", description: "Across enterprise customers", icon: TrendingUp },
    { metric: "24/7", label: "Support", description: "Dedicated enterprise support", icon: Users },
    { metric: "30+", label: "Integrations", description: "Enterprise system connectors", icon: Plug }
  ]

  const implementationProcess = [
    {
      step: "1",
      title: "Discovery & Planning",
      duration: "Week 1-2",
      icon: Target,
      activities: [
        "Architecture assessment",
        "Requirements gathering",
        "Custom integration planning",
        "Compliance review"
      ]
    },
    {
      step: "2",
      title: "Implementation",
      duration: "Week 3-6",
      icon: Settings,
      activities: [
        "Platform deployment",
        "System integration",
        "Data migration",
        "Security configuration"
      ]
    },
    {
      step: "3",
      title: "Training & Onboarding",
      duration: "Week 7-8",
      icon: Users,
      activities: [
        "Team training sessions",
        "Admin certification",
        "Process documentation",
        "Best practices workshop"
      ]
    },
    {
      step: "4",
      title: "Optimization",
      duration: "Ongoing",
      icon: TrendingUp,
      activities: [
        "Performance tuning",
        "Cost optimization",
        "Quarterly reviews",
        "Feature expansion"
      ]
    }
  ]

  const securityFeatures = [
    { feature: "SOC 2 Type II Certified", icon: Award },
    { feature: "GDPR & CCPA Compliant", icon: FileCheck },
    { feature: "End-to-end Encryption", icon: Lock },
    { feature: "Single Sign-On (SSO)", icon: Shield },
    { feature: "Role-Based Access Control", icon: Users },
    { feature: "Audit Logging", icon: Database }
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 px-4 py-2">
              <Building2 className="w-4 h-4 mr-2 inline" />
              Enterprise Grade
            </Badge>
            <h1 className="text-5xl font-bold text-white mb-6">
              Enterprise AI Cost Management at Scale
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Comprehensive AI spending governance, compliance, and optimization for Fortune 500 companies.
              Trusted by industry leaders managing millions in AI infrastructure.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg">
                  Schedule Enterprise Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/resources">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-6 text-lg">
                  Download Whitepaper
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
            {enterpriseStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700 hover:border-blue-500/50 transition-all">
                  <CardContent className="pt-6">
                    <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-white mb-1">{stat.metric}</div>
                    <div className="text-sm text-blue-400 font-medium">{stat.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{stat.description}</div>
                  </CardContent>
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
            Enterprise-Grade Capabilities
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Comprehensive tools designed for complex enterprise AI operations
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {enterpriseFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700 hover:border-blue-500/50 transition-all h-full">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.color}`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white">{feature.title}</CardTitle>
                        <CardDescription className="text-gray-400 mt-1">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.features.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-300">
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

      {/* Use Cases Section */}
      <div className="py-16 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Industry Solutions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700 hover:border-blue-500/50 transition-all h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${useCase.color}`}>
                        <useCase.icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl text-white">{useCase.industry}</CardTitle>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-gray-400 mb-1">Challenge</div>
                        <p className="text-gray-300">{useCase.challenge}</p>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-400 mb-1">Solution</div>
                        <p className="text-gray-300">{useCase.solution}</p>
                      </div>
                      <div className="pt-3 border-t border-gray-700">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-medium">{useCase.results}</span>
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

      {/* Implementation Process */}
      <div className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Enterprise Implementation Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {implementationProcess.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700 hover:border-blue-500/50 transition-all h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                        Step {phase.step}
                      </Badge>
                      <phase.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <CardTitle className="text-white text-lg">{phase.title}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {phase.duration}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {phase.activities.map((activity, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                          <ChevronRight className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                          {activity}
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

      {/* Security Section */}
      <div className="py-16 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Enterprise Security & Compliance
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Bank-grade security with comprehensive compliance certifications
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {securityFeatures.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="text-center p-4 bg-gray-900/50 border-gray-800 hover:border-blue-500/50 transition-all">
                  <item.icon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">{item.feature}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Enterprise AI Operations?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join Fortune 500 companies optimizing millions in AI spending
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/contact">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg">
                Schedule Enterprise Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/resources">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-6 text-lg">
                Download ROI Calculator
              </Button>
            </Link>
          </div>
          <p className="text-gray-400 text-sm mt-6">
            Speak with our enterprise team to discuss custom requirements
          </p>
        </div>
      </div>
    </div>
  )
}