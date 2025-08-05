import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function Startups() {
  const startupChallenges = [
    {
      challenge: "Unpredictable AI costs eating into runway",
      solution: "Real-time spend tracking with automatic alerts before budget overruns",
      icon: "💸"
    },
    {
      challenge: "No visibility into which AI experiments are worth the cost",
      solution: "Per-project cost tracking with ROI analysis for each AI initiative",
      icon: "🔍"
    },
    {
      challenge: "Limited engineering resources for cost monitoring",
      solution: "5-minute setup with zero maintenance required - focus on building",
      icon: "⚡"
    },
    {
      challenge: "Need to prove AI ROI to investors and stakeholders",
      solution: "Beautiful reports showing cost efficiency and business impact",
      icon: "📊"
    }
  ]

  const startupFeatures = [
    {
      title: "Budget Protection",
      description: "Never exceed your AI budget again with intelligent alerts and automatic shutoffs",
      icon: "🛡️",
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
      icon: "🧪",
      features: [
        "Project-based cost allocation",
        "A/B test cost comparison",
        "Model performance vs cost",
        "Experiment ROI metrics"
      ]
    },
    {
      title: "Growth Planning",
      description: "Forecast AI costs as you scale and plan your infrastructure investments",
      icon: "📈",
      features: [
        "Usage growth forecasting",
        "Scaling cost projections",
        "Team expansion planning",
        "Investor-ready reports"
      ]
    },
    {
      title: "Developer-First",
      description: "Built for developers, by developers - integrate in minutes, not weeks",
      icon: "👨‍💻",
      features: [
        "5-minute setup",
        "SDK for all languages",
        "Slack/Discord integration",
        "API-first architecture"
      ]
    }
  ]

  const startupStories = [
    {
      company: "TechFlow AI",
      stage: "Series A",
      industry: "Developer Tools",
      challenge: "Burning through $15K/month on GPT-4 with no visibility into which features drove value",
      solution: "Implemented per-feature cost tracking and discovered 60% of costs came from unused debug features",
      result: "Reduced AI costs by 40% while improving product performance",
      savings: "$6K/month"
    },
    {
      company: "DataBot Labs",
      stage: "Seed",
      industry: "Analytics",
      challenge: "Needed to prove AI ROI to investors while managing tight budget constraints",
      solution: "Used automated reporting to show clear correlation between AI spend and customer growth",
      result: "Secured Series A funding with data-driven AI investment strategy",
      savings: "Funding secured"
    },
    {
      company: "Creative AI Studio",
      stage: "Pre-seed",
      industry: "Content Creation",
      challenge: "Multiple AI models for different use cases with no cost visibility across experiments",
      solution: "Project-based tracking revealed most cost-effective model combinations",
      result: "Optimized model selection saved 50% on AI costs while maintaining quality",
      savings: "$3.2K/month"
    }
  ]

  const pricingTiers = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for early-stage startups",
      features: [
        "Track up to $500/month in AI costs",
        "Basic cost alerts",
        "3 team members",
        "Email support"
      ],
      cta: "Start free",
      popular: false
    },
    {
      name: "Growth",
      price: "$29",
      description: "For scaling startups",
      features: [
        "Track up to $5K/month in AI costs",
        "Advanced analytics & forecasting",
        "Unlimited team members",
        "Slack/Discord integration",
        "Priority support"
      ],
      cta: "Start free trial",
      popular: true
    },
    {
      name: "Scale",
      price: "$99",
      description: "For fast-growing companies",
      features: [
        "Unlimited AI cost tracking",
        "Custom reporting & dashboards",
        "API access & webhooks",
        "Advanced team permissions",
        "Dedicated success manager"
      ],
      cta: "Contact sales",
      popular: false
    }
  ]

  const integrations = [
    { name: "OpenAI GPT-4", logo: "🤖", setup: "2 min" },
    { name: "Claude 3.5", logo: "🧠", setup: "2 min" },
    { name: "Gemini Pro", logo: "💎", setup: "2 min" },
    { name: "Cohere", logo: "🌊", setup: "2 min" },
    { name: "Slack", logo: "💬", setup: "1 min" },
    { name: "Discord", logo: "🎮", setup: "1 min" },
    { name: "GitHub", logo: "⚡", setup: "3 min" },
    { name: "Vercel", logo: "▲", setup: "2 min" }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <Badge className="mb-6 bg-purple-100 text-purple-700 px-4 py-2">
              🚀 Built for Startups
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Don't let AI costs kill your runway
            </h1>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Get complete visibility into your AI spending with tools designed for fast-moving startups. 
              Track costs, optimize experiments, and prove ROI to investors — all in 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Link href="/signup">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4">
                  Start free - no credit card
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-purple-300 text-purple-300 hover:bg-white hover:text-purple-900 px-8 py-4">
                Book a demo
              </Button>
            </div>
            <p className="text-purple-200 text-sm">
              Used by 500+ startups • 5-minute setup • Cancel anytime
            </p>
          </div>
        </div>
      </div>

      {/* Startup Challenges */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Startup AI challenges we solve
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Every startup faces these AI cost management challenges. 
              Here's how we help you solve them.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {startupChallenges.map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{item.icon}</div>
                    <div>
                      <CardTitle className="text-lg text-red-600 mb-2">
                        Problem: {item.challenge}
                      </CardTitle>
                      <CardDescription className="text-green-700 font-medium">
                        ✓ Solution: {item.solution}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Startup Features */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Features built for fast-moving startups
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage AI costs without slowing down your development velocity.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {startupFeatures.map((feature, index) => (
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

      {/* Startup Success Stories */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Real startup success stories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how other startups are using AI Credit Tracker to optimize costs and accelerate growth.
            </p>
          </div>

          <div className="space-y-8">
            {startupStories.map((story, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{story.company}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{story.stage}</Badge>
                        <Badge variant="outline">{story.industry}</Badge>
                        <Badge className="bg-green-100 text-green-700">{story.savings} saved</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Challenge</h4>
                      <p className="text-sm text-gray-600">{story.challenge}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Solution</h4>
                      <p className="text-sm text-gray-600">{story.solution}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Result</h4>
                      <p className="text-sm font-medium text-green-700">{story.result}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Integrations */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Connect your stack in minutes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Pre-built integrations with the tools startups love. No complex setup required.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {integrations.map((integration, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow p-6">
                <div className="text-4xl mb-4">{integration.logo}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{integration.name}</h3>
                <Badge className="bg-purple-100 text-purple-700 text-xs">
                  {integration.setup} setup
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Startup Pricing */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Startup-friendly pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free and scale with your growth. No hidden fees, no surprises.
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
                    <span className="text-4xl font-bold">${tier.price}</span>
                    {tier.price !== 'Free' && <span className="text-gray-600">/month</span>}
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
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Start optimizing your AI costs today
          </h2>
          <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
            Join hundreds of startups who've reduced their AI costs by 40% on average. 
            Get started in 5 minutes — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Start free trial
                <span className="ml-2">→</span>
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg font-semibold">
              Book a demo
            </Button>
          </div>
          <p className="text-purple-200 text-sm mt-6">
            Free forever plan • No setup fees • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  )
}