'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  Brain,
  DollarSign,
  Zap,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Clock,
  Users,
  Gauge,
  BookOpen,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Filter,
  Download,
  Lightbulb,
  Shield
} from 'lucide-react'

export default function TrendsAnalyticsV2() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [selectedView, setSelectedView] = useState('business')

  // Enhanced mock data for business intelligence
  const businessMetrics = {
    totalSpend: 4247.85,
    projectedSpend: 5680.32,
    costPerUser: 28.43,
    roi: 340,
    efficiency: 87,
    riskLevel: 'medium',
    budgetVariance: 12.3,
    trendsScore: 82
  }

  const forecastData = {
    nextMonth: {
      predicted: 5680,
      confidence: 89,
      factors: ['Seasonal increase', 'New features launch', 'Team growth'],
      recommendation: 'Increase budget by 15%'
    },
    quarter: {
      predicted: 16240,
      confidence: 76,
      factors: ['Market expansion', 'Product scaling', 'Efficiency gains'],
      recommendation: 'Plan for 20% growth'
    },
    riskFactors: [
      { factor: 'Usage spike potential', probability: 68, impact: 'High' },
      { factor: 'Model price changes', probability: 34, impact: 'Medium' },
      { factor: 'Seasonal demand', probability: 89, impact: 'Low' }
    ]
  }

  const costDrivers = [
    {
      driver: 'Team Growth',
      impact: '+$342/month',
      trend: 'increasing',
      description: '3 new engineers added this month',
      recommendation: 'Scale usage limits proportionally'
    },
    {
      driver: 'Model Upgrades',
      impact: '+$156/month',
      trend: 'stable',
      description: 'Migration to GPT-4 Turbo for premium features',
      recommendation: 'Monitor cost vs quality improvements'
    },
    {
      driver: 'Efficiency Gains',
      impact: '-$89/month',
      trend: 'improving',
      description: 'Better prompt engineering and caching',
      recommendation: 'Continue optimization efforts'
    }
  ]

  const benchmarks = {
    industry: {
      yourSpend: 28.43,
      industryAvg: 45.67,
      percentile: 78,
      efficiency: 'Above Average'
    },
    optimization: {
      potential: 425.67,
      timeToValue: '< 2 weeks',
      effort: 'Low',
      impact: 'High'
    }
  }

  const marketIntelligence = {
    trends: [
      {
        trend: 'AI Cost Optimization Tools',
        impact: 'Opportunity',
        timeline: 'Q1 2025'
      },
      {
        trend: 'Model Price Reductions',
        impact: 'Positive',
        timeline: 'Q2 2025'
      },
      {
        trend: 'Enterprise Adoption Surge',
        impact: 'Positive',
        timeline: 'Current'
      }
    ]
  }

  const scenarios = [
    {
      name: 'Conservative Growth',
      spend: 4890,
      probability: 'High (85%)',
      description: 'Current trends continue',
      actions: ['Maintain current limits', 'Monitor usage patterns']
    },
    {
      name: 'Aggressive Scaling',
      spend: 7240,
      probability: 'Medium (45%)',
      description: 'New product launches succeed',
      actions: ['Increase budget 40%', 'Implement auto-scaling']
    },
    {
      name: 'Market Downturn',
      spend: 3120,
      probability: 'Low (20%)',
      description: 'Economic headwinds reduce usage',
      actions: ['Reduce limits 30%', 'Focus on efficiency']
    }
  ]

  const insights = [
    {
      type: 'opportunity',
      title: 'Cost Optimization Window',
      description: 'Current usage patterns show 23% potential savings through model optimization',
      impact: '$156/month',
      effort: 'Low',
      timeline: '1-2 weeks'
    },
    {
      type: 'risk',
      title: 'Budget Variance Alert',
      description: 'Projected to exceed monthly budget by 15% based on current trajectory',
      impact: '+$234 overspend',
      effort: 'Medium',
      timeline: 'Act within 5 days'
    },
    {
      type: 'trend',
      title: 'Efficiency Improvement',
      description: 'Response quality maintained while reducing costs by 12% through optimization',
      impact: '+$89 savings',
      effort: 'Completed',
      timeline: 'Ongoing benefit'
    }
  ]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-black to-teal-900/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 min-h-screen py-6">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Brain className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Business Intelligence</h1>
                  <span className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 text-sm font-medium rounded-full border border-emerald-500/30">
                    v2.0
                  </span>
                </div>
                <p className="text-gray-400">AI-powered cost forecasting and business insights</p>
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 3 months</option>
                  <option value="1y">Last year</option>
                </select>
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex space-x-1 bg-gray-800/30 rounded-lg p-1">
              {['business', 'forecasting', 'optimization'].map((view) => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view)}
                  className={`px-4 py-2 rounded-md font-medium transition-all capitalize ${
                    selectedView === view
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Executive Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* ROI Metric */}
            <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/50 backdrop-blur-xl rounded-2xl border border-emerald-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-emerald-400" />
                <h3 className="text-lg font-semibold text-white">ROI</h3>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-300 mb-2">{businessMetrics.roi}%</div>
                <p className="text-emerald-200 text-sm mb-4">Return on Investment</p>
                <div className="flex items-center justify-center gap-2 text-emerald-300 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+34% vs last quarter</span>
                </div>
              </div>
            </div>

            {/* Cost Per User */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Cost/User</h3>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">${businessMetrics.costPerUser}</div>
                <p className="text-gray-400 text-sm mb-4">Monthly Average</p>
                <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                  <TrendingDown className="w-4 h-4" />
                  <span>-12% vs industry avg</span>
                </div>
              </div>
            </div>

            {/* Efficiency Score */}
            <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Gauge className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Efficiency</h3>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300 mb-2">{businessMetrics.efficiency}%</div>
                <p className="text-blue-200 text-sm mb-4">Performance Score</p>
                <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Above target</span>
                </div>
              </div>
            </div>

            {/* Risk Level */}
            <div className={`backdrop-blur-xl rounded-2xl border p-6 ${
              businessMetrics.riskLevel === 'high' ? 'bg-gradient-to-br from-red-900/50 to-red-800/50 border-red-500/30' :
              businessMetrics.riskLevel === 'medium' ? 'bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-500/30' :
              'bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-500/30'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <Shield className={`w-6 h-6 ${
                  businessMetrics.riskLevel === 'high' ? 'text-red-400' :
                  businessMetrics.riskLevel === 'medium' ? 'text-yellow-400' :
                  'text-green-400'
                }`} />
                <h3 className="text-lg font-semibold text-white">Risk Level</h3>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold mb-2 capitalize ${
                  businessMetrics.riskLevel === 'high' ? 'text-red-300' :
                  businessMetrics.riskLevel === 'medium' ? 'text-yellow-300' :
                  'text-green-300'
                }`}>
                  {businessMetrics.riskLevel}
                </div>
                <p className={`text-sm mb-4 ${
                  businessMetrics.riskLevel === 'high' ? 'text-red-200' :
                  businessMetrics.riskLevel === 'medium' ? 'text-yellow-200' :
                  'text-green-200'
                }`}>
                  Budget Variance: {businessMetrics.budgetVariance}%
                </p>
              </div>
            </div>
          </motion.div>

          {selectedView === 'business' && (
            <>
              {/* Strategic Insights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Lightbulb className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-xl font-semibold text-white">Strategic Insights</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-2 rounded-lg ${
                          insight.type === 'opportunity' ? 'bg-green-500/20' :
                          insight.type === 'risk' ? 'bg-red-500/20' : 'bg-blue-500/20'
                        }`}>
                          {insight.type === 'opportunity' && <TrendingUp className="w-5 h-5 text-green-400" />}
                          {insight.type === 'risk' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                          {insight.type === 'trend' && <Activity className="w-5 h-5 text-blue-400" />}
                        </div>
                        <span className={`text-sm font-medium ${
                          insight.type === 'opportunity' ? 'text-green-400' :
                          insight.type === 'risk' ? 'text-red-400' : 'text-blue-400'
                        }`}>
                          {insight.impact}
                        </span>
                      </div>
                      
                      <h3 className="text-white font-semibold mb-2">{insight.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{insight.description}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Timeline: {insight.timeline}</span>
                        <span className="text-gray-400">Effort: {insight.effort}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Cost Drivers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
              >
                {/* Cost Driver Analysis */}
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Cost Drivers</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {costDrivers.map((driver, index) => (
                      <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{driver.driver}</span>
                          <span className={`font-semibold ${
                            driver.impact.startsWith('+') ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {driver.impact}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{driver.description}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            driver.trend === 'increasing' ? 'bg-red-500/20 text-red-300' :
                            driver.trend === 'stable' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                            {driver.trend}
                          </span>
                          <span className="text-gray-400 text-sm">{driver.recommendation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benchmark Comparison */}
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Target className="w-6 h-6 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Industry Benchmark</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400 mb-2">
                        {benchmarks.industry.percentile}th
                      </div>
                      <p className="text-gray-400">Industry Percentile</p>
                      <p className="text-green-400 text-sm mt-1">{benchmarks.industry.efficiency}</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Your Cost/User</span>
                        <span className="text-white font-semibold">${benchmarks.industry.yourSpend}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Industry Average</span>
                        <span className="text-gray-300">${benchmarks.industry.industryAvg}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-green-400">Savings vs Avg</span>
                        <span className="text-green-400 font-semibold">
                          ${(benchmarks.industry.industryAvg - benchmarks.industry.yourSpend).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <h4 className="text-green-300 font-medium mb-2">Optimization Potential</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-200">Additional Savings</span>
                          <span className="text-green-300">${benchmarks.optimization.potential}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-200">Time to Value</span>
                          <span className="text-green-300">{benchmarks.optimization.timeToValue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {selectedView === 'forecasting' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              {/* Predictive Analytics */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <LineChart className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">AI-Powered Forecasting</h3>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full">
                    ML Model v2.1
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-800/30 rounded-lg">
                      <h4 className="text-white font-medium mb-3">Next Month Prediction</h4>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold text-blue-400">${forecastData.nextMonth.predicted.toLocaleString()}</span>
                        <span className="text-sm text-green-400">{forecastData.nextMonth.confidence}% confidence</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{forecastData.nextMonth.recommendation}</p>
                      <div className="space-y-1">
                        {forecastData.nextMonth.factors.map((factor, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                            {factor}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Scenario Planning</h4>
                    {scenarios.map((scenario, idx) => (
                      <div key={idx} className="p-3 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-medium">{scenario.name}</span>
                          <span className="text-blue-400 font-semibold">${scenario.spend.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">{scenario.probability}</span>
                        </div>
                        <p className="text-gray-400 text-sm">{scenario.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="w-6 h-6 text-orange-400" />
                  <h3 className="text-lg font-semibold text-white">Risk Assessment</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {forecastData.riskFactors.map((risk, idx) => (
                    <div key={idx} className="p-4 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium">{risk.factor}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          risk.impact === 'High' ? 'bg-red-500/20 text-red-300' :
                          risk.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {risk.impact}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Probability</span>
                          <span className="text-white">{risk.probability}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              risk.probability > 70 ? 'bg-red-500' :
                              risk.probability > 40 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${risk.probability}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {selectedView === 'optimization' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              {/* Budget Optimization Engine */}
              <div className="bg-gradient-to-br from-green-900/20 to-emerald-800/20 backdrop-blur-xl rounded-2xl border border-green-500/30 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-8 h-8 text-green-400" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">Budget Optimization Engine</h2>
                    <p className="text-green-300">AI-powered budget allocation and cost forecasting</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm font-medium rounded-full border border-green-500/30">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">$1,240</div>
                    <p className="text-green-300 text-sm">Optimized Budget</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">18%</div>
                    <p className="text-blue-300 text-sm">Efficiency Gain</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">97%</div>
                    <p className="text-purple-300 text-sm">Forecast Accuracy</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-400 mb-2">$328</div>
                    <p className="text-emerald-300 text-sm">Monthly Savings</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-white font-medium mb-4">Budget Reallocation Plan</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">High-Value Tasks</span>
                          <span className="text-green-400">+$156 → OpenAI</span>
                        </div>
                        <p className="text-gray-300 text-sm">Allocate premium budget to complex reasoning tasks for maximum ROI</p>
                      </div>
                      <div className="p-4 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">Bulk Processing</span>
                          <span className="text-blue-400">+$89 → Gemini</span>
                        </div>
                        <p className="text-gray-300 text-sm">Route high-volume, simple tasks to cost-effective providers</p>
                      </div>
                      <div className="p-4 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">Context-Heavy Tasks</span>
                          <span className="text-purple-400">+$67 → Claude</span>
                        </div>
                        <p className="text-gray-300 text-sm">Leverage large context windows for document analysis tasks</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-medium mb-4">Market Intelligence</h4>
                    <div className="space-y-3">
                      {marketIntelligence.trends.map((trend, idx) => (
                        <div key={idx} className="p-4 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{trend.trend}</span>
                            <span className={`text-sm px-2 py-1 rounded-full ${
                              trend.impact === 'Positive' ? 'bg-green-500/20 text-green-300' :
                              trend.impact === 'Opportunity' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-purple-500/20 text-purple-300'
                            }`}>
                              {trend.impact}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">{trend.timeline}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Control Strategies */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Cost Control Strategies</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <h4 className="text-blue-300 font-medium mb-3">Automated Scaling</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Peak Hour Limits</span>
                        <span className="text-white">$200/hr</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Off-Peak Limits</span>
                        <span className="text-white">$50/hr</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Emergency Cap</span>
                        <span className="text-red-400">$500/hr</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Configure
                    </button>
                  </div>

                  <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <h4 className="text-green-300 font-medium mb-3">Quality Gates</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Min Quality Score</span>
                        <span className="text-white">85%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Fallback Threshold</span>
                        <span className="text-white">70%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Auto-Retry Limit</span>
                        <span className="text-yellow-400">3x</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                      Update Rules
                    </button>
                  </div>

                  <div className="p-6 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                    <h4 className="text-purple-300 font-medium mb-3">Smart Routing</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Cost-First Mode</span>
                        <span className="text-green-400">Active</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Quality Threshold</span>
                        <span className="text-white">90%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Savings Rate</span>
                        <span className="text-green-400">23%</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                      Optimize
                    </button>
                  </div>
                </div>
              </div>

              {/* Budget Alerts & Notifications */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Smart Alerts & Controls</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-white font-medium mb-4">Active Budget Alerts</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div>
                          <span className="text-red-300 font-medium">Budget Threshold</span>
                          <p className="text-red-200 text-sm">80% of monthly limit reached</p>
                        </div>
                        <button className="px-3 py-1 bg-red-600 text-white rounded text-sm">View</button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <div>
                          <span className="text-yellow-300 font-medium">Usage Spike</span>
                          <p className="text-yellow-200 text-sm">3x normal usage detected</p>
                        </div>
                        <button className="px-3 py-1 bg-yellow-600 text-white rounded text-sm">Review</button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <div>
                          <span className="text-blue-300 font-medium">Optimization Ready</span>
                          <p className="text-blue-200 text-sm">New savings opportunity identified</p>
                        </div>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Apply</button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-4">Automated Actions</h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">Circuit Breaker</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-green-400 text-sm">Active</span>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm">Automatically stop requests when budget limit is reached</p>
                      </div>
                      <div className="p-4 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">Smart Throttling</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span className="text-blue-400 text-sm">Enabled</span>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm">Reduce request rate when approaching budget limits</p>
                      </div>
                      <div className="p-4 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">Quality Failover</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span className="text-purple-400 text-sm">Monitoring</span>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm">Switch to backup provider if quality drops below threshold</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}