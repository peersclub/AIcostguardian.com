'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function Billing() {
  const [currentPlan, setCurrentPlan] = useState('pro')
  
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 19,
      credits: 10000,
      features: ['10,000 credits/month', 'Basic analytics', 'Email support', '3 AI providers']
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 49,
      credits: 50000,
      features: ['50,000 credits/month', 'Advanced analytics', 'Priority support', 'All AI providers', 'Custom alerts']
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 149,
      credits: 200000,
      features: ['200,000 credits/month', 'Custom analytics', '24/7 support', 'All AI providers', 'White-label options', 'API access']
    }
  ]

  const billingHistory = [
    { date: '2025-08-01', amount: 49.00, plan: 'Pro', status: 'Paid', invoice: 'INV-2025-001' },
    { date: '2025-07-01', amount: 49.00, plan: 'Pro', status: 'Paid', invoice: 'INV-2025-002' },
    { date: '2025-06-01', amount: 19.00, plan: 'Starter', status: 'Paid', invoice: 'INV-2025-003' },
    { date: '2025-05-01', amount: 19.00, plan: 'Starter', status: 'Paid', invoice: 'INV-2025-004' }
  ]

  const usageBreakdown = [
    { provider: 'OpenAI GPT-4', credits: 15000, cost: 30.00, percentage: 60 },
    { provider: 'Claude 3', credits: 8000, cost: 16.00, percentage: 32 },
    { provider: 'Gemini Pro', credits: 2000, cost: 4.00, percentage: 8 }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Plans</h1>
          <p className="text-gray-600 mt-2">Manage your subscription and view billing history</p>
        </div>

        {/* Current Plan */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>You're currently on the Pro plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Pro Plan</h3>
                <p className="text-gray-600">50,000 credits per month</p>
                <p className="text-sm text-gray-500 mt-1">Next billing date: September 1, 2025</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">$49<span className="text-lg text-gray-500">/month</span></p>
                <Button variant="outline" size="sm" className="mt-2">
                  Change Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage This Month */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>This Month's Usage</CardTitle>
            <CardDescription>Breakdown of your credit consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usageBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">{item.provider}</p>
                      <p className="text-sm text-gray-500">{item.credits.toLocaleString()} credits</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.cost.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total This Month</span>
                <span className="text-xl font-bold">$50.00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>Choose the plan that best fits your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className={`p-6 border rounded-lg ${currentPlan === plan.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    {currentPlan === plan.id && (
                      <Badge className="mt-2">Current Plan</Badge>
                    )}
                  </div>
                  <div className="text-center mb-6">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={currentPlan === plan.id ? 'outline' : 'default'}
                    disabled={currentPlan === plan.id}
                  >
                    {currentPlan === plan.id ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>Your past invoices and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Plan</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Invoice</th>
                    <th className="text-left p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">{item.date}</td>
                      <td className="p-2">{item.plan}</td>
                      <td className="p-2 font-medium">${item.amount.toFixed(2)}</td>
                      <td className="p-2">
                        <Badge variant={item.status === 'Paid' ? 'default' : 'destructive'}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="p-2 text-sm text-gray-600">{item.invoice}</td>
                      <td className="p-2">
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}