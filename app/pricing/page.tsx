import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Simple, transparent pricing</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Start free and scale as you grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Starter Plan */}
          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Starter</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <CardDescription>Perfect for small teams getting started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Track up to $500/month in AI costs
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  3 AI provider integrations
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Basic analytics & alerts
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  5 team members
                </li>
              </ul>
              <Link href="/signup" className="block">
                <Button className="w-full">Start free trial</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Professional Plan */}
          <Card className="border-2 border-blue-500 relative">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
              Most Popular
            </Badge>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Professional</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-gray-600">/month</span>
              </div>
              <CardDescription>For growing teams and businesses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Track up to $5K/month in AI costs
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Unlimited AI provider integrations
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Advanced analytics & forecasting
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  25 team members
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  API access & webhooks
                </li>
              </ul>
              <Link href="/signup" className="block">
                <Button className="w-full">Start free trial</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="border-2 hover:border-purple-200 transition-colors">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Enterprise</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$199</span>
                <span className="text-gray-600">/month</span>
              </div>
              <CardDescription>For large organizations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Unlimited AI cost tracking
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Custom integrations
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Advanced security & compliance
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Unlimited team members
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Priority support & SLA
                </li>
              </ul>
              <Button variant="outline" className="w-full">Contact Sales</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}