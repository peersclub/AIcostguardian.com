import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            About Us
          </h1>
          <h2 className="text-2xl lg:text-3xl font-semibold mb-8 text-slate-200">
            Empowering Businesses to Master AI Costs
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            At AI Cost Guardian, we believe that artificial intelligence should accelerate your business growth, not drain your budget. As AI adoption explodes across enterprises, organizations are struggling with a new challenge: unpredictable and escalating costs across multiple AI platforms that can quickly spiral out of control.
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Founded by a team of AI engineers and financial technology experts, AI Cost Guardian was born from a simple observation: while companies were racing to integrate AI into their operations, they were flying blind when it came to managing the associated costs. We witnessed organizations burning through budgets, struggling to track expenses across dozens of AI providers, and lacking the visibility needed to make informed decisions about their AI investments.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed font-medium">
              We knew there had to be a better way.
            </p>
          </div>
        </div>
      </div>

      {/* What We Do Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What We Do</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              AI Cost Guardian is the comprehensive cost management platform designed specifically for businesses using multiple AI services. Our software connects seamlessly with all major AI providers through simple API integrations, giving you complete visibility and control over your AI spending in one unified dashboard.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Our platform helps you:</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 mt-1">•</span>
                <span>Track costs across OpenAI, Anthropic, Google AI, Microsoft Azure AI, AWS Bedrock, and 50+ other providers</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 mt-1">•</span>
                <span>Monitor usage patterns and identify cost optimization opportunities</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 mt-1">•</span>
                <span>Set intelligent alerts and budgets to prevent overspending</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 mt-1">•</span>
                <span>Generate detailed reports for stakeholders and financial planning</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 mt-1">•</span>
                <span>Optimize AI model selection based on cost-performance analysis</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              We're on a mission to make AI cost management as sophisticated as the AI technologies themselves. Every business should have the power to harness AI's potential while maintaining complete financial control and transparency.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose AI Cost Guardian</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <CardTitle>Comprehensive Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Unlike generic cloud cost tools, we're built specifically for AI workloads and understand the unique billing models of AI providers.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🏢</span>
                </div>
                <CardTitle>Enterprise-Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our platform scales from startups to Fortune 500 companies, with enterprise-grade security and compliance features.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <CardTitle>Instant Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get started in minutes with our simple API key integration process – no complex configurations or lengthy implementations.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">💡</span>
                </div>
                <CardTitle>Actionable Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We don't just show you numbers; we provide intelligent recommendations to optimize your AI spending without sacrificing performance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Our Commitment Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Commitment</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              We're committed to transparency, security, and helping our customers achieve maximum value from their AI investments. Your cost data is encrypted, never shared, and always under your control.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to take control of your AI costs?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of forward-thinking companies who trust AI Cost Guardian to optimize their AI spending.
          </p>
          <p className="text-lg text-blue-100 mb-8 font-medium">
            Start tracking now – setup takes less than 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4">
                Start tracking now
              </Button>
            </Link>
            <Link href="mailto:hello@aicostly.com">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4">
                Contact our experts
              </Button>
            </Link>
          </div>
          <p className="text-blue-200 text-sm">
            Have questions? Our team of AI cost optimization experts is here to help. 
            Contact us at <a href="mailto:hello@aicostly.com" className="underline hover:text-white">hello@aicostly.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}