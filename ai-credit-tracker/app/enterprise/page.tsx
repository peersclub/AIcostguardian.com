import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function Enterprise() {
  const enterpriseFeatures = [
    {
      title: "Advanced Cost Analytics",
      description: "Deep insights into AI spending patterns across departments, teams, and projects",
      icon: "📊",
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
      icon: "🏛️",
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
      icon: "🔒",
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
      icon: "🔌",
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
      logo: "🏦",
      challenge: "Managing AI costs across trading algorithms, risk analysis, and customer service",
      solution: "Department-level cost tracking with real-time budget monitoring and compliance reporting",
      results: "35% reduction in AI spending with improved risk management compliance"
    },
    {
      industry: "Healthcare",
      logo: "🏥",
      challenge: "Tracking AI costs for medical imaging, diagnostics, and research initiatives",
      solution: "Project-based cost allocation with HIPAA-compliant data handling and audit trails",
      results: "28% cost optimization while maintaining regulatory compliance"
    },
    {
      industry: "Technology",
      logo: "💻",
      challenge: "Managing AI infrastructure costs across multiple product teams and environments",
      solution: "Multi-tenant cost tracking with automated scaling recommendations",
      results: "42% reduction in AI infrastructure costs through optimization insights"
    },
    {
      industry: "Manufacturing",
      logo: "🏭",
      challenge: "Optimizing AI costs for predictive maintenance and quality control systems",
      solution: "Real-time cost monitoring with predictive analytics for budget planning",
      results: "31% cost savings with improved operational efficiency"
    }
  ]

  const enterpriseStats = [
    { metric: "99.99%", label: "Uptime SLA", description: "Enterprise-grade reliability" },
    { metric: "$50M+", label: "AI Costs Tracked", description: "Across enterprise customers" },
    { metric: "24/7", label: "Support", description: "Dedicated enterprise support" },
    { metric: "30+", label: "Integrations", description: "Enterprise system connectors" }
  ]

  const implementationProcess = [
    {
      step: "1",
      title: "Discovery & Planning",
      duration: "Week 1-2",
      activities: [
        "Architecture assessment",
        "Requirements gathering",
        "Custom integration planning",
        "Implementation roadmap"
      ]
    },
    {
      step: "2",
      title: "Custom Setup",
      duration: "Week 3-6",
      activities: [
        "Private cloud deployment",
        "Custom integrations development",
        "Security configuration",
        "Data migration & testing"
      ]
    },
    {
      step: "3",
      title: "Training & Rollout",
      duration: "Week 7-8",
      activities: [
        "Administrator training",
        "User onboarding",
        "Pilot program launch",
        "Performance optimization"
      ]
    },
    {
      step: "4",
      title: "Ongoing Support",
      duration: "Ongoing",
      activities: [
        "24/7 technical support",
        "Regular health checks",
        "Feature updates",
        "Strategic consultations"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-blue-100 text-blue-700 px-4 py-2">
                🏢 Enterprise Solution
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Scale AI cost management across your entire organization
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                Purpose-built for large enterprises with complex AI operations. 
                Get enterprise-grade security, custom integrations, and dedicated support 
                to optimize AI spending at scale.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4">
                  Schedule enterprise demo
                </Button>
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-300 hover:bg-white hover:text-slate-900 px-8 py-4">
                  Download ROI calculator
                </Button>
              </div>
            </div>
            <div className="relative">
              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Monthly AI Spend</span>
                    <span className="text-2xl font-bold text-green-400">$847K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Cost Optimization</span>
                    <span className="text-xl font-bold text-blue-400">32% ↓</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Departments</span>
                    <span className="text-xl font-bold text-purple-400">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Active Users</span>
                    <span className="text-xl font-bold text-yellow-400">1,847</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Stats */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {enterpriseStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.metric}</div>
                <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enterprise Features */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Enterprise-Grade Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced capabilities designed for large organizations with complex AI operations, 
              strict compliance requirements, and custom integration needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {enterpriseFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">{feature.icon}</span>
                    </div>
                    <div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-gray-600 mt-1">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-sm">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Industry Use Cases */}
      <div className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how enterprises across different industries are using AI Credit Tracker 
              to optimize costs and improve AI governance.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-3xl">{useCase.logo}</span>
                    </div>
                    <div>
                      <CardTitle className="text-xl">{useCase.industry}</CardTitle>
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        {useCase.results.split(' ')[0]} savings
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Challenge</h4>
                    <p className="text-sm text-gray-600">{useCase.challenge}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Solution</h4>
                    <p className="text-sm text-gray-600">{useCase.solution}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Results</h4>
                    <p className="text-sm font-medium text-green-700">{useCase.results}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Implementation Process */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Enterprise Implementation Process
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our proven implementation methodology ensures smooth deployment 
              with minimal disruption to your operations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {implementationProcess.map((phase, index) => (
              <div key={index} className="relative">
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                      {phase.step}
                    </div>
                    <CardTitle className="text-lg">{phase.title}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {phase.duration}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {phase.activities.map((activity, activityIndex) => (
                        <li key={activityIndex} className="text-sm text-gray-600 flex items-start">
                          <span className="text-blue-500 mr-2 mt-1">•</span>
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                {index < implementationProcess.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                    <div className="w-0 h-0 border-l-4 border-l-gray-300 border-t-2 border-t-transparent border-b-2 border-b-transparent absolute right-0 top-1/2 transform -translate-y-1/2"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enterprise Support */}
      <div className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              White-Glove Enterprise Support
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Dedicated support team with deep expertise in enterprise AI operations 
              and cost optimization strategies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gray-800 border-gray-700 text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <CardTitle className="text-white">Dedicated Success Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Personal success manager who understands your business and helps optimize your AI investment
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700 text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <CardTitle className="text-white">Priority Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  24/7 technical support with guaranteed response times and escalation procedures
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700 text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <CardTitle className="text-white">Strategic Consulting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Regular strategic reviews and optimization recommendations from our AI cost experts
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to optimize AI costs at enterprise scale?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Schedule a personalized demo to see how AI Credit Tracker can help your enterprise 
            reduce AI costs while improving governance and compliance.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
              Schedule enterprise demo
              <span className="ml-2">→</span>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
              Download case studies
            </Button>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            Custom pricing • White-glove onboarding • 99.99% uptime SLA
          </p>
        </div>
      </div>
    </div>
  )
}