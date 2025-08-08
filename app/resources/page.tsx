import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function Resources() {
  const featuredResources = [
    {
      title: "Complete Guide to AI Cost Optimization",
      description: "Learn proven strategies to reduce AI costs by 40% without sacrificing performance",
      type: "Guide",
      readTime: "15 min read",
      category: "Cost Optimization",
      featured: true
    },
    {
      title: "AI Cost Calculator",
      description: "Calculate and compare costs across different AI providers and models",
      type: "Tool",
      readTime: "Interactive",
      category: "Tools",
      featured: true
    },
    {
      title: "Setting Up AI Budget Alerts",
      description: "Step-by-step tutorial to never exceed your AI budget again",
      type: "Tutorial",
      readTime: "8 min read",
      category: "Getting Started",
      featured: true
    }
  ]

  const resourceCategories = [
    {
      name: "Getting Started",
      icon: "🚀",
      description: "Quick start guides and tutorials",
      resources: [
        {
          title: "5-Minute Setup Guide",
          description: "Get AI Credit Tracker running in your environment",
          type: "Tutorial",
          readTime: "5 min"
        },
        {
          title: "Understanding AI Costs",
          description: "Learn how AI pricing works across different providers",
          type: "Guide",
          readTime: "12 min"
        },
        {
          title: "Setting Up Your First Dashboard",
          description: "Create custom dashboards for your team",
          type: "Tutorial",
          readTime: "8 min"
        },
        {
          title: "API Key Management Best Practices",
          description: "Secure and organize your AI provider credentials",
          type: "Guide",
          readTime: "6 min"
        }
      ]
    },
    {
      name: "Cost Optimization",
      icon: "💰",
      description: "Strategies to reduce AI spending",
      resources: [
        {
          title: "Model Selection for Cost Efficiency",
          description: "Choose the right model for each use case",
          type: "Guide",
          readTime: "18 min"
        },
        {
          title: "Prompt Engineering for Cost Reduction",
          description: "Optimize prompts to reduce token usage",
          type: "Tutorial",
          readTime: "25 min"
        },
        {
          title: "Caching Strategies for AI APIs",
          description: "Implement intelligent caching to avoid redundant calls",
          type: "Guide",
          readTime: "15 min"
        },
        {
          title: "Batch Processing Best Practices",
          description: "Process multiple requests efficiently",
          type: "Tutorial",
          readTime: "12 min"
        }
      ]
    },
    {
      name: "Analytics & Reporting",
      icon: "📊",
      description: "Make data-driven decisions",
      resources: [
        {
          title: "Building Executive Reports",
          description: "Create reports that resonate with leadership",
          type: "Guide",
          readTime: "14 min"
        },
        {
          title: "ROI Analysis for AI Projects",
          description: "Measure and communicate AI project value",
          type: "Framework",
          readTime: "20 min"
        },
        {
          title: "Custom Metrics and KPIs",
          description: "Track what matters for your business",
          type: "Guide",
          readTime: "10 min"
        },
        {
          title: "Automated Reporting Setup",
          description: "Schedule and distribute reports automatically",
          type: "Tutorial",
          readTime: "8 min"
        }
      ]
    },
    {
      name: "Enterprise",
      icon: "🏢",
      description: "Large-scale deployment guides",
      resources: [
        {
          title: "Multi-Department Cost Allocation",
          description: "Implement chargeback and showback models",
          type: "Guide",
          readTime: "22 min"
        },
        {
          title: "Enterprise Security Setup",
          description: "Configure SSO, RBAC, and audit logging",
          type: "Tutorial",
          readTime: "30 min"
        },
        {
          title: "Scaling AI Operations",
          description: "Best practices for large-scale AI deployments",
          type: "Framework",
          readTime: "28 min"
        },
        {
          title: "Compliance and Governance",
          description: "Meet regulatory requirements for AI usage",
          type: "Guide",
          readTime: "35 min"
        }
      ]
    }
  ]

  const tools = [
    {
      name: "AI Cost Calculator",
      description: "Compare costs across different AI providers and models",
      icon: "🧮",
      type: "Calculator",
      popular: true
    },
    {
      name: "ROI Calculator",
      description: "Calculate return on investment for AI initiatives",
      icon: "📈",
      type: "Calculator",
      popular: true
    },
    {
      name: "Budget Planner",
      description: "Plan and forecast your AI spending",
      icon: "📅",
      type: "Planner",
      popular: false
    },
    {
      name: "Token Usage Estimator",
      description: "Estimate token consumption for different use cases",
      icon: "🔢",
      type: "Estimator",
      popular: false
    },
    {
      name: "API Benchmark Tool",
      description: "Compare performance and costs across providers",
      icon: "⚡",
      type: "Benchmark",
      popular: true
    },
    {
      name: "Cost Optimization Checklist",
      description: "Comprehensive checklist for reducing AI costs",
      icon: "✅",
      type: "Checklist",
      popular: false
    }
  ]

  const webinars = [
    {
      title: "AI Cost Management in 2025: Trends and Strategies",
      date: "March 15, 2025",
      duration: "45 min",
      speaker: "Sarah Chen, Head of AI Operations",
      registrations: "1,200+",
      type: "upcoming"
    },
    {
      title: "Building AI Budgets That Actually Work",
      date: "February 20, 2025",
      duration: "40 min",
      speaker: "Mike Rodriguez, Finance Director",
      registrations: "850+",
      type: "recorded"
    },
    {
      title: "Enterprise AI Governance and Compliance",
      date: "January 18, 2025",
      duration: "50 min",
      speaker: "Dr. Emma Thompson, Compliance Expert",
      registrations: "650+",
      type: "recorded"
    }
  ]

  const caseStudies = [
    {
      company: "TechCorp",
      industry: "SaaS",
      challenge: "Uncontrolled AI spending across 50+ engineering teams",
      result: "45% cost reduction with improved visibility",
      timeline: "3 months",
      logo: "💼"
    },
    {
      company: "FinanceAI",
      industry: "Financial Services",
      challenge: "Need for compliance-ready AI cost reporting",
      result: "100% audit compliance with automated reporting",
      timeline: "2 months",
      logo: "🏦"
    },
    {
      company: "HealthTech Solutions",
      industry: "Healthcare",
      challenge: "HIPAA-compliant AI cost tracking for medical AI",
      result: "30% cost savings while maintaining compliance",
      timeline: "4 months",
      logo: "🏥"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <Badge className="mb-6 bg-indigo-100 text-indigo-700 px-4 py-2">
              📚 Knowledge Hub
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Everything you need to master AI cost management
            </h1>
            <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Comprehensive guides, tools, and resources to help you optimize AI costs, 
              improve efficiency, and make data-driven decisions about your AI investments.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4">
                Explore resources
              </Button>
              <Button size="lg" variant="outline" className="border-indigo-300 text-indigo-300 hover:bg-white hover:text-indigo-900 px-8 py-4">
                Join our newsletter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Resources */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Featured Resources
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start with these popular resources to quickly improve your AI cost management.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredResources.map((resource, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-2 hover:border-indigo-200">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-indigo-100 text-indigo-700">
                      {resource.type}
                    </Badge>
                    <span className="text-sm text-gray-500">{resource.readTime}</span>
                  </div>
                  <CardTitle className="text-xl">{resource.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {resource.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    {resource.type === 'Tool' ? 'Use Tool' : 'Read Now'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Resource Categories */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Browse by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find exactly what you need with our organized resource library.
            </p>
          </div>

          <div className="space-y-12">
            {resourceCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="flex items-center mb-8">
                  <div className="text-4xl mr-4">{category.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{category.name}</h3>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {category.resources.map((resource, resourceIndex) => (
                    <Card key={resourceIndex} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {resource.type}
                          </Badge>
                          <span className="text-xs text-gray-500">{resource.readTime}</span>
                        </div>
                        <CardTitle className="text-lg leading-tight">{resource.title}</CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          {resource.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" size="sm" className="w-full">
                          Read More
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Free Tools & Calculators
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Interactive tools to help you calculate, plan, and optimize your AI costs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool, index) => (
              <Card key={index} className={`hover:shadow-lg transition-shadow ${
                tool.popular ? 'border-2 border-indigo-200' : ''
              }`}>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">{tool.icon}</span>
                  </div>
                  <CardTitle className="text-lg">{tool.name}</CardTitle>
                  {tool.popular && (
                    <Badge className="bg-indigo-100 text-indigo-700 mx-auto">
                      Popular
                    </Badge>
                  )}
                  <CardDescription className="text-gray-600">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Use {tool.type}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Webinars Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Webinars & Events
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join live sessions with AI cost optimization experts and industry leaders.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {webinars.map((webinar, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={webinar.type === 'upcoming' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {webinar.type === 'upcoming' ? 'Upcoming' : 'Recorded'}
                    </Badge>
                    <span className="text-sm text-gray-500">{webinar.duration}</span>
                  </div>
                  <CardTitle className="text-lg">{webinar.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {webinar.speaker}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Date: {webinar.date}</span>
                    <span>{webinar.registrations} registered</span>
                  </div>
                  <Button className={`w-full ${
                    webinar.type === 'upcoming' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}>
                    {webinar.type === 'upcoming' ? 'Register Now' : 'Watch Recording'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Case Studies */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Customer Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Learn from real companies who have successfully optimized their AI costs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">{study.logo}</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{study.company}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {study.industry}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Challenge</h4>
                    <p className="text-sm text-gray-600">{study.challenge}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Result</h4>
                    <p className="text-sm font-medium text-green-700">{study.result}</p>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Timeline: {study.timeline}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Read Full Case Study
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter CTA */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Stay updated with the latest AI cost optimization insights
          </h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Get weekly insights, new resources, and expert tips delivered directly to your inbox. 
            Join 5,000+ AI practitioners who trust our content.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 font-semibold">
              Subscribe Free
            </Button>
          </div>
          <p className="text-indigo-200 text-sm mt-4">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </div>
  )
}