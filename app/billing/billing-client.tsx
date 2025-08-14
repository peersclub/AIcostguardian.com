'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  CreditCard,
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  CheckCircle,
  AlertTriangle,
  Shield,
  Star,
  Zap,
  Users,
  BarChart3,
  Clock,
  ChevronRight,
  Check,
  X,
  Info,
  Settings,
  Receipt,
  FileText,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'
import { getAIProviderLogo } from '@/components/ui/ai-logos'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface BillingPlan {
  id: string
  name: string
  price: number
  priceMonthly: number
  priceYearly: number
  credits: number
  features: string[]
  limits: {
    apiCalls: number
    providers: number
    teamMembers: number
    dataRetention: number
  }
  badge?: string | null
  recommended?: boolean
}

export default function BillingClient() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [isLoading, setIsLoading] = useState(true)
  
  // Data states
  const [plans, setPlans] = useState<BillingPlan[]>([])
  const [currentPlan, setCurrentPlan] = useState('free')
  const [billingHistory, setBillingHistory] = useState<any[]>([])
  const [currentBilling, setCurrentBilling] = useState<any>(null)
  const [usageBreakdown, setUsageBreakdown] = useState<any[]>([])

  // Handle URL-based tab navigation
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['overview', 'plans', 'history', 'usage'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    if (session?.user) {
      fetchBillingData()
    }
  }, [session])

  const fetchBillingData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch all billing data in parallel
      const [plansRes, historyRes, currentRes, usageRes] = await Promise.all([
        fetch('/api/billing/plans'),
        fetch('/api/billing/history'),
        fetch('/api/billing/current'),
        fetch('/api/billing/usage')
      ])

      if (plansRes.ok) {
        const plansData = await plansRes.json()
        setPlans(plansData.plans || [])
        setCurrentPlan(plansData.currentPlan || 'free')
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json()
        setBillingHistory(historyData.history || [])
      }

      if (currentRes.ok) {
        const currentData = await currentRes.json()
        setCurrentBilling(currentData)
      }

      if (usageRes.ok) {
        const usageData = await usageRes.json()
        setUsageBreakdown(usageData.breakdown || [])
      }
    } catch (error) {
      console.error('Failed to fetch billing data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load billing information',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatNumber = (value: number) => {
    if (value === -1) return 'Unlimited'
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toString()
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black to-blue-900/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Billing & Subscription
                </h1>
                <p className="text-gray-400">
                  Manage your subscription, billing, and payment methods
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className="bg-gray-900/50 border-gray-700 text-white hover:bg-gray-800"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Payment Methods
                </Button>
                <Button
                  variant="outline"
                  className="bg-gray-900/50 border-gray-700 text-white hover:bg-gray-800"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoices
                </Button>
              </div>
            </div>

            {/* Current Plan Overview */}
            {currentBilling && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl border border-blue-500/30 p-6 mb-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-8 h-8 text-blue-400" />
                      <div>
                        <h2 className="text-2xl font-bold text-white capitalize">
                          {currentBilling.plan} Plan
                        </h2>
                        <p className="text-gray-400">
                          {currentBilling.status === 'active' ? 'Active subscription' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Current Usage</p>
                        <p className="text-2xl font-bold text-white">
                          {formatCurrency(currentBilling.currentUsage)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">API Calls</p>
                        <p className="text-2xl font-bold text-white">
                          {formatNumber(currentBilling.currentApiCalls)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm mb-1">Next billing date</p>
                    <p className="text-xl font-semibold text-white">
                      {currentBilling.nextBillingDate ? 
                        new Date(currentBilling.nextBillingDate).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        }) : 'N/A'}
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {formatCurrency(currentBilling.billing?.amount || 0)}
                      <span className="text-lg text-gray-400">/month</span>
                    </p>
                  </div>
                </div>
                
                {currentBilling.limit > 0 && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">Usage Limit</span>
                      <span className="text-white text-sm">
                        {formatCurrency(currentBilling.currentUsage)} / {formatCurrency(currentBilling.limit)}
                      </span>
                    </div>
                    <Progress 
                      value={currentBilling.usagePercentage || 0} 
                      className="h-2 bg-gray-700"
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* Tabs */}
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => {
                setActiveTab(value)
                router.push(`/billing?tab=${value}`)
              }} 
              className="w-full"
            >
              <TabsList className="bg-gray-900/50 border border-gray-700 p-1">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="plans" 
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Plans
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Billing History
                </TabsTrigger>
                <TabsTrigger 
                  value="usage" 
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Usage Breakdown
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Quick Stats */}
                  <Card className="bg-gray-900/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-gray-400 text-sm">Total Spent</p>
                          <p className="text-2xl font-bold text-white">
                            {formatCurrency(currentBilling?.currentUsage || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">API Calls</p>
                          <p className="text-xl font-semibold text-white">
                            {formatNumber(currentBilling?.currentApiCalls || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Team Members</p>
                          <p className="text-xl font-semibold text-white">
                            {currentBilling?.teamMembers || 1}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Providers */}
                  <Card className="bg-gray-900/50 border-gray-700 col-span-2">
                    <CardHeader>
                      <CardTitle className="text-white">Top Providers by Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {usageBreakdown.slice(0, 4).map((provider, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getAIProviderLogo(provider.provider, 'w-6 h-6')}
                              <div>
                                <p className="text-white font-medium capitalize">
                                  {provider.provider}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  {formatNumber(provider.requests)} requests
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-semibold">
                                {formatCurrency(provider.cost)}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {provider.percentage.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="plans" className="mt-6">
                {/* Billing Period Toggle */}
                <div className="flex justify-center mb-8">
                  <div className="bg-gray-900/50 rounded-lg p-1 border border-gray-700">
                    <button
                      onClick={() => setBillingPeriod('monthly')}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        billingPeriod === 'monthly' 
                          ? 'bg-green-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingPeriod('yearly')}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        billingPeriod === 'yearly' 
                          ? 'bg-green-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Yearly (Save 20%)
                    </button>
                  </div>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {plans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative bg-gray-900/50 rounded-2xl border ${
                        plan.recommended ? 'border-green-500' : 'border-gray-700'
                      } p-6`}
                    >
                      {plan.badge && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-green-600 text-white">
                            {plan.badge}
                          </Badge>
                        </div>
                      )}
                      
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {plan.name}
                        </h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-white">
                            {formatCurrency(billingPeriod === 'yearly' ? plan.priceYearly / 12 : plan.priceMonthly)}
                          </span>
                          <span className="text-gray-400">/month</span>
                        </div>
                        {billingPeriod === 'yearly' && plan.priceYearly > 0 && (
                          <p className="text-green-400 text-sm mt-1">
                            Save {formatCurrency((plan.priceMonthly * 12) - plan.priceYearly)}/year
                          </p>
                        )}
                      </div>

                      <div className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        className={`w-full ${
                          currentPlan === plan.id 
                            ? 'bg-gray-700 text-gray-300' 
                            : plan.recommended 
                              ? 'bg-green-600 hover:bg-green-700 text-white' 
                              : 'bg-gray-800 hover:bg-gray-700 text-white'
                        }`}
                        disabled={currentPlan === plan.id}
                      >
                        {currentPlan === plan.id ? 'Current Plan' : 'Upgrade'}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Billing History</CardTitle>
                    <CardDescription className="text-gray-400">
                      Your past invoices and payment history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">Date</TableHead>
                          <TableHead className="text-gray-300">Invoice</TableHead>
                          <TableHead className="text-gray-300">Plan</TableHead>
                          <TableHead className="text-gray-300">Amount</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {billingHistory.map((bill) => (
                          <TableRow key={bill.id} className="border-gray-700">
                            <TableCell className="text-white">
                              {new Date(bill.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-white font-mono">
                              {bill.invoice}
                            </TableCell>
                            <TableCell className="text-white">
                              {bill.plan}
                            </TableCell>
                            <TableCell className="text-white font-semibold">
                              {formatCurrency(bill.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={bill.status === 'paid' ? 'default' : 'secondary'}
                                className={
                                  bill.status === 'paid' 
                                    ? 'bg-green-600/20 text-green-400 border-green-600/30' 
                                    : 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
                                }
                              >
                                {bill.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="usage" className="mt-6">
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Usage Breakdown by Provider</CardTitle>
                    <CardDescription className="text-gray-400">
                      Detailed breakdown of your AI API usage costs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {usageBreakdown.map((provider, index) => (
                        <div key={index} className="border border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {getAIProviderLogo(provider.provider, 'w-8 h-8')}
                              <div>
                                <h4 className="text-lg font-semibold text-white capitalize">
                                  {provider.provider}
                                </h4>
                                <p className="text-gray-400 text-sm">
                                  {formatNumber(provider.requests)} requests • {formatNumber(provider.tokens)} tokens
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-white">
                                {formatCurrency(provider.cost)}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {provider.percentage.toFixed(1)}% of total
                              </p>
                            </div>
                          </div>
                          
                          {provider.models && provider.models.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-gray-400 text-sm mb-2">Model breakdown:</p>
                              {provider.models.map((model: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center bg-gray-800/30 rounded p-2">
                                  <span className="text-gray-300 text-sm">{model.model}</span>
                                  <span className="text-white text-sm font-medium">
                                    {formatCurrency(model.cost)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="mt-3">
                            <Progress 
                              value={provider.percentage} 
                              className="h-2 bg-gray-700"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  )
}