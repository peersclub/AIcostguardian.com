import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Features() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Comprehensive AI Cost Tracking</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to monitor, manage, and optimize your AI spending across all providers and applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <CardTitle>Real-time Dashboard</CardTitle>
              <CardDescription>Monitor your AI usage and costs in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Get instant visibility into your AI spending with live updates, beautiful visualizations, and actionable insights.
              </p>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">View Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>Deep insights into usage patterns and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Understand your AI usage with comprehensive analytics, forecasting, and optimization recommendations.
              </p>
              <Link href="/usage">
                <Button variant="outline" size="sm">View Analytics</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔔</span>
              </div>
              <CardTitle>Smart Alerts</CardTitle>
              <CardDescription>Proactive notifications and budget protection</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Set intelligent thresholds and get notified before you exceed your budget limits.
              </p>
              <Button variant="outline" size="sm">Configure Alerts</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}