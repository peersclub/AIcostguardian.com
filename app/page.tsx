import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="text-center">
            <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2">
              ✨ Trusted by 500+ AI-powered companies
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              AI spending made
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                simple and smart
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Track, optimize, and control your AI costs across all providers. Get real-time insights, 
              set intelligent limits, and reduce spending by up to 40%.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link href="/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg">
                  Start free trial
                  <span className="ml-2">→</span>
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-300 hover:bg-white hover:text-slate-900 px-8 py-4 text-lg font-semibold">
                  View demo
                </Button>
              </Link>
            </div>
            <p className="text-slate-400 text-sm">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>

      {/* Logo Strip */}
      <div className="bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-slate-500 text-sm font-medium mb-8">
            INTEGRATE WITH YOUR FAVORITE AI PROVIDERS
          </p>
          <div className="flex justify-center items-center space-x-12 opacity-60">
            <div className="text-2xl font-bold text-slate-700">OpenAI</div>
            <div className="text-2xl font-bold text-slate-700">Claude</div>
            <div className="text-2xl font-bold text-slate-700">Gemini</div>
            <div className="text-2xl font-bold text-slate-700">GPT-4</div>
            <div className="text-2xl font-bold text-slate-700">Dall-E</div>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            Stop overspending on AI. Start optimizing.
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Companies using AI Credit Tracker reduce their AI costs by an average of 35% 
            while improving usage efficiency and team productivity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">35% average cost reduction</h3>
            <p className="text-slate-600">
              Our intelligent optimization algorithms help you identify waste and optimize usage patterns automatically.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Real-time monitoring</h3>
            <p className="text-slate-600">
              Track every API call, token usage, and cost in real-time across all your AI providers and applications.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Smart budget controls</h3>
            <p className="text-slate-600">
              Set intelligent limits, get predictive alerts, and automatically prevent budget overruns before they happen.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Everything you need to master AI costs
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Comprehensive tools designed for modern businesses using AI at scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-semibold">Usage Analytics</CardTitle>
                <CardDescription className="text-slate-600">
                  Deep insights into usage patterns, trends, and optimization opportunities
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-semibold">Multi-Provider Support</CardTitle>
                <CardDescription className="text-slate-600">
                  Unified tracking across OpenAI, Claude, Gemini, and 20+ AI providers
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7H4l5-5v5z" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-semibold">Smart Alerts</CardTitle>
                <CardDescription className="text-slate-600">
                  Predictive notifications and automated budget protection
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-semibold">Team Management</CardTitle>
                <CardDescription className="text-slate-600">
                  User limits, role-based access, and team usage insights
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-semibold">Enterprise Security</CardTitle>
                <CardDescription className="text-slate-600">
                  SOC 2 compliant with encrypted API key storage and audit logs
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-semibold">API Integration</CardTitle>
                <CardDescription className="text-slate-600">
                  Easy setup with REST APIs, webhooks, and popular frameworks
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Trusted by AI-forward companies
            </h2>
            <p className="text-xl text-slate-600">
              Join hundreds of companies already optimizing their AI spending
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-700">TechCorp</div>
              <p className="text-sm text-slate-500 mt-2">Saved $50K/month</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-700">AI Startup</div>
              <p className="text-sm text-slate-500 mt-2">40% cost reduction</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-700">Enterprise Co</div>
              <p className="text-sm text-slate-500 mt-2">Real-time visibility</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-700">InnovateLab</div>
              <p className="text-sm text-slate-500 mt-2">Better budget control</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to optimize your AI spending?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join hundreds of companies that have reduced their AI costs by up to 40% 
            with intelligent monitoring and optimization.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg">
                Start your free trial
                <span className="ml-2">→</span>
              </Button>
            </Link>
            <Link href="/usage">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
                See it in action
              </Button>
            </Link>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            14-day free trial • No credit card required • Setup in 5 minutes
          </p>
        </div>
      </div>
    </div>
  )
}