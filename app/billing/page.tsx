'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Download, Calendar, BarChart3, CheckCircle2, Zap, Crown, Building2 } from 'lucide-react'

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
    <div className="min-h-screen bg-gray-950 p-6 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-10 animate-pulse delay-500"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-white">Billing & Plans</h1>
          <p className="text-gray-300 mt-2">Manage your subscription and view billing history</p>
        </motion.div>

        {/* Current Plan */}
        <motion.div 
          className="mb-8 bg-gradient-to-br from-blue-900/50 to-blue-800/50 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Crown className="w-5 h-5 mr-2 text-blue-400" />
              Current Plan
            </h3>
            <p className="text-gray-300 mt-1">You're currently on the Pro plan</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Pro Plan</h3>
              <p className="text-gray-300">50,000 credits per month</p>
              <p className="text-sm text-gray-400 mt-1 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Next billing date: September 1, 2025
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">$49<span className="text-lg text-gray-400">/month</span></p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Change Plan
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Usage This Month */}
        <motion.div 
          className="mb-8 bg-gradient-to-br from-green-900/50 to-emerald-800/50 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
              This Month's Usage
            </h3>
            <p className="text-gray-300 mt-1">Breakdown of your credit consumption</p>
          </div>
          <div className="space-y-4">
            {usageBreakdown.map((item, index) => (
              <motion.div 
                key={index} 
                className="flex items-center justify-between p-4 border border-gray-600 rounded-lg bg-gray-800/30"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
                  <div>
                    <p className="font-medium text-white">{item.provider}</p>
                    <p className="text-sm text-gray-400">{item.credits.toLocaleString()} credits</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">${item.cost.toFixed(2)}</p>
                  <p className="text-sm text-gray-400">{item.percentage}%</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-600">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-300">Total This Month</span>
              <span className="text-xl font-bold text-white">$50.00</span>
            </div>
          </div>
        </motion.div>

        {/* Available Plans */}
        <motion.div 
          className="mb-8 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-purple-400" />
              Available Plans
            </h3>
            <p className="text-gray-300 mt-1">Choose the plan that best fits your needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, planIndex) => {
              const gradients = [
                'from-yellow-900/50 to-orange-800/50 border-yellow-500/30',
                'from-blue-900/50 to-blue-800/50 border-blue-500/30', 
                'from-purple-900/50 to-purple-800/50 border-purple-500/30'
              ]
              const icons = [<Zap key="zap" className="w-6 h-6" />, <Crown key="crown" className="w-6 h-6" />, <Building2 key="building" className="w-6 h-6" />]
              return (
                <motion.div 
                  key={plan.id} 
                  className={`p-6 rounded-lg bg-gradient-to-br backdrop-blur-xl border ${
                    currentPlan === plan.id 
                      ? 'border-blue-400 shadow-lg shadow-blue-500/20' 
                      : gradients[planIndex]
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * planIndex }}
                >
                  <div className="text-center mb-4">
                    <div className="flex justify-center items-center mb-2 text-gray-300">
                      {icons[planIndex]}
                    </div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    {currentPlan === plan.id && (
                      <Badge className="mt-2 bg-blue-900/20 text-blue-300 border-blue-500/30">Current Plan</Badge>
                    )}
                  </div>
                  <div className="text-center mb-6">
                    <span className="text-3xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-300 flex items-center">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${
                      currentPlan === plan.id
                        ? 'border-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0'
                    }`}
                    variant={currentPlan === plan.id ? 'outline' : 'default'}
                    disabled={currentPlan === plan.id}
                  >
                    {currentPlan === plan.id ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Billing History */}
        <motion.div 
          className="bg-gradient-to-br from-indigo-900/50 to-purple-800/50 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-indigo-400" />
              Billing History
            </h3>
            <p className="text-gray-300 mt-1">Your past invoices and payments</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left p-2 text-gray-300 font-medium">Date</th>
                  <th className="text-left p-2 text-gray-300 font-medium">Plan</th>
                  <th className="text-left p-2 text-gray-300 font-medium">Amount</th>
                  <th className="text-left p-2 text-gray-300 font-medium">Status</th>
                  <th className="text-left p-2 text-gray-300 font-medium">Invoice</th>
                  <th className="text-left p-2 text-gray-300 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((item, index) => (
                  <motion.tr 
                    key={index} 
                    className="border-b border-gray-700 hover:bg-gray-800/30 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 * index }}
                  >
                    <td className="p-2 text-white">{item.date}</td>
                    <td className="p-2 text-gray-300">{item.plan}</td>
                    <td className="p-2 font-medium text-white">${item.amount.toFixed(2)}</td>
                    <td className="p-2">
                      <Badge className={
                        item.status === 'Paid' 
                          ? 'bg-green-900/20 text-green-300 border-green-500/30' 
                          : 'bg-red-900/20 text-red-300 border-red-500/30'
                      }>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-2 text-sm text-gray-400">{item.invoice}</td>
                    <td className="p-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}