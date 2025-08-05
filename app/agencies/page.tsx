import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function Agencies() {
  const agencyChallenges = [
    {
      challenge: "Client AI costs eating into project margins",
      solution: "Track and bill AI costs per client project with transparent reporting",
      icon: "💰",
      impact: "Protect 15-25% profit margins"
    },
    {
      challenge: "No visibility into AI spend across creative projects",
      solution: "Real-time cost tracking for copywriting, design generation, and content creation",
      icon: "👁️",
      impact: "100% cost visibility"
    },
    {
      challenge: "Difficult to justify AI tool costs to clients",
      solution: "Detailed reports showing AI usage value and efficiency gains",
      icon: "📊",
      impact: "Easier client conversations"
    },
    {
      challenge: "Team members over-using expensive AI models",
      solution: "Smart alerts and usage limits to prevent budget overruns",
      icon: "⚠️",
      impact: "30% cost reduction"
    }
  ]

  const agencyFeatures = [
    {
      title: "Client Cost Allocation",
      description: "Track AI costs by client, project, and campaign for accurate billing",
      icon: "🏷️",
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
      icon: "🎨",
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
      icon: "👥",
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
      icon: "📈",
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
      challenge: "Managing AI costs across 15+ client accounts with different budgets and requirements",
      aiTools: ["Claude 3.5 Sonnet", "Claude 3.5 Haiku", "Claude 3 Opus"],
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
      challenge: "High AI costs for content creation and ad copy generation across multiple campaigns",
      aiTools: ["Claude 3.5 Sonnet", "Claude 3.5 Haiku"],
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
      challenge: "Expensive design generation tools impacting small project margins",
      aiTools: ["Midjourney", "DALL-E 2", "Stable Diffusion", "Adobe Firefly"],
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
      tools: [
        { name: "Claude 3.5 Sonnet", use: "Long-form content, strategy docs", cost: "High accuracy" },
        { name: "Claude 3.5 Haiku", use: "Social media, quick copy", cost: "Cost effective" },
        { name: "Claude 3 Opus", use: "Complex research, analysis", cost: "Premium intelligence" }
      ]
    },
    {
      category: "Visual Design",
      tools: [
        { name: "Midjourney", use: "Concept art, mood boards", cost: "Subscription" },
        { name: "DALL-E 2", use: "Product mockups, illustrations", cost: "Per image" },
        { name: "Stable Diffusion", use: "Bulk image generation", cost: "Low cost" },
        { name: "Adobe Firefly", use: "Brand-safe content", cost: "Subscription" }
      ]
    },
    {
      category: "Video & Audio",
      tools: [
        { name: "Runway ML", use: "Video editing, effects", cost: "Credit system" },
        { name: "ElevenLabs", use: "Voice generation", cost: "Per character" },
        { name: "Descript", use: "Audio editing", cost: "Subscription" },
        { name: "Synthesia", use: "Video presentations", cost: "Per video" }
      ]
    }
  ]

  const pricingTiers = [
    {
      name: "Agency Starter",
      price: "$49",
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
      price: "$149",
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
      tools: ["Claude 3.5 Sonnet", "Claude 3.5 Haiku", "Claude 3 Opus"]
    },
    {
      step: "2", 
      title: "Set Up Client Projects",
      description: "Create projects and assign team members with budget limits",
      time: "10 minutes",
      tools: ["Project Management", "Budget Controls", "Team Access"]
    },
    {
      step: "3",
      title: "Track Usage in Real-Time",
      description: "Monitor AI costs as your team creates content and designs",
      time: "Automatic",
      tools: ["Real-time Tracking", "Usage Alerts", "Cost Analytics"]
    },
    {
      step: "4",
      title: "Generate Client Reports",
      description: "Create professional reports showing AI value and costs",
      time: "2 minutes",
      tools: ["White-label Reports", "ROI Metrics", "Billing Integration"]
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-900 to-pink-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-purple-100 text-purple-700 px-4 py-2">
                🎨 Built for Creative Agencies
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Transform AI costs from expense to profit center
              </h1>
              <p className="text-xl text-purple-100 mb-8">
                Stop losing money on AI tools. Track, allocate, and bill AI costs to clients 
                with precision. Built specifically for creative agencies managing multiple client projects.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4">
                  Start 14-day free trial
                </Button>
                <Button size="lg" variant="outline" className="border-purple-300 text-purple-300 hover:bg-white hover:text-purple-900 px-8 py-4">
                  See agency demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Monthly Agency Dashboard</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">$12,450</div>
                      <div className="text-sm text-gray-300">AI Costs Tracked</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">23</div>
                      <div className="text-sm text-gray-300">Active Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">18%</div>
                      <div className="text-sm text-gray-300">Margin Increase</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">47</div>
                      <div className="text-sm text-gray-300">Hours Saved</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Agency Challenges */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Agency AI Cost Challenges We Solve
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Creative agencies face unique challenges when managing AI costs across multiple clients and projects.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {agencyChallenges.map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{item.icon}</div>
                    <div>
                      <CardTitle className="text-lg text-red-600 mb-2">
                        Challenge: {item.challenge}
                      </CardTitle>
                      <CardDescription className="text-green-700 font-medium mb-2">
                        ✓ Solution: {item.solution}
                      </CardDescription>
                      <Badge className="bg-purple-100 text-purple-700">
                        Impact: {item.impact}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Agency Features */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Features Built for Creative Agencies
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage AI costs across clients, projects, and creative workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {agencyFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
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
                        <span className="text-purple-500 mr-2">✓</span>
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

      {/* Agency Success Stories */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Real Agency Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how creative agencies are using AI Cost Guardian to increase profitability and client satisfaction.
            </p>
          </div>

          <div className="space-y-12">
            {agencyUseCases.map((useCase, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl">{useCase.agency}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{useCase.type}</Badge>
                        <Badge variant="outline">{useCase.size}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Challenge</h4>
                        <p className="text-gray-600">{useCase.challenge}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">AI Tools Used</h4>
                        <div className="flex flex-wrap gap-2">
                          {useCase.aiTools.map((tool, toolIndex) => (
                            <Badge key={toolIndex} className="bg-purple-100 text-purple-700">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Solution</h4>
                        <p className="text-gray-600">{useCase.solution}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Results</h4>
                        <ul className="space-y-1">
                          {useCase.results.map((result, resultIndex) => (
                            <li key={resultIndex} className="text-green-700 font-medium flex items-center">
                              <span className="text-green-500 mr-2">✓</span>
                              {result}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="lg:col-span-1">
                      <div className="bg-purple-50 p-6 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Client Testimonial</h4>
                        <blockquote className="text-gray-700 italic">
                          "{useCase.testimonial}"
                        </blockquote>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* AI Tools for Agencies */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Track Costs Across All Your AI Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We support all the AI tools creative agencies use daily. Get complete visibility into your creative workflow costs.
            </p>
          </div>

          <div className="space-y-12">
            {agencyTools.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="mr-3">
                    {category.category === 'Content Creation' ? '✍️' : 
                     category.category === 'Visual Design' ? '🎨' : '🎬'}
                  </span>
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {category.tools.map((tool, toolIndex) => (
                    <Card key={toolIndex} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                        <Badge className="bg-purple-100 text-purple-700 w-fit">
                          {tool.cost}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">{tool.use}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workflow */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Simple Setup for Agency Workflows
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get up and running in under 30 minutes with our agency-optimized setup process.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {workflowSteps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                      {step.step}
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <Badge variant="outline" className="text-xs mx-auto">
                      {step.time}
                    </Badge>
                    <CardDescription className="text-gray-600">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {step.tools.map((tool, toolIndex) => (
                        <div key={toolIndex} className="text-sm text-gray-600 flex items-center">
                          <span className="text-purple-500 mr-2">•</span>
                          {tool}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                {index < workflowSteps.length - 1 && (
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

      {/* Agency Pricing */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Agency-Focused Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Plans designed specifically for creative agencies with client billing and project management features.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`hover:shadow-lg transition-shadow ${
                tier.popular ? 'border-2 border-purple-500 relative' : ''
              }`}>
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tier.price === 'Custom' ? 'Custom' : `$${tier.price}`}</span>
                    {tier.price !== 'Custom' && <span className="text-gray-600">/month</span>}
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3 text-sm">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <span className="text-purple-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full ${
                    tier.popular 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}>
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to turn AI costs into profit?
          </h2>
          <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
            Join 200+ creative agencies who've increased project margins by tracking and billing AI costs accurately. 
            Start your free trial today — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Start 14-day free trial
                <span className="ml-2">→</span>
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg font-semibold">
              Schedule agency demo
            </Button>
          </div>
          <p className="text-purple-200 text-sm mt-6">
            14-day free trial • No setup fees • Cancel anytime • White-label reports included
          </p>
        </div>
      </div>
    </div>
  )
}