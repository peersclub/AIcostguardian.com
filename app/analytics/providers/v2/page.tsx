'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Globe,
  Zap,
  Shield,
  Target,
  Brain,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Star,
  Activity,
  BarChart3,
  PieChart,
  Users,
  Cpu,
  Gauge,
  Award,
  Lightbulb,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Eye,
  Settings,
  Download
} from 'lucide-react'
import { getAIProviderLogo } from '@/components/ui/ai-logos'

export default function ProviderIntelligenceV2() {
  const [selectedView, setSelectedView] = useState('overview')
  const [selectedProvider, setSelectedProvider] = useState('all')

  // Enhanced provider intelligence data
  const portfolioMetrics = {
    totalProviders: 4,
    activeProviders: 4,
    diversificationScore: 87,
    riskLevel: 'optimal',
    costEfficiency: 91,
    performanceScore: 88,
    recommendedChanges: 2
  }

  const providerIntelligence = [
    {
      id: 'openai',
      name: 'OpenAI',
      tier: 'strategic',
      health: 95,
      performance: 92,
      costEfficiency: 78,
      reliability: 99.2,
      responseTime: 1.8,
      monthlySpend: 2847.32,
      marketShare: 42.3,
      strengths: ['Quality leadership', 'Model variety', 'Developer tools'],
      concerns: ['Premium pricing', 'API limits'],
      recommendation: 'Maintain as primary for complex tasks',
      contractStatus: 'Optimal',
      nextReview: '2024-03-15',
      slaCompliance: 98.7,
      riskFactors: ['High dependency', 'Price volatility'],
      qualityScore: 94,
      innovationScore: 96,
      supportScore: 88
    },
    {
      id: 'claude',
      name: 'Anthropic Claude',
      tier: 'strategic',
      health: 97,
      performance: 89,
      costEfficiency: 85,
      reliability: 99.8,
      responseTime: 1.4,
      monthlySpend: 1923.45,
      marketShare: 28.7,
      strengths: ['Large context', 'Safety focus', 'Reasoning'],
      concerns: ['Limited availability', 'Newer ecosystem'],
      recommendation: 'Expand usage for long-context tasks',
      contractStatus: 'Good',
      nextReview: '2024-04-20',
      slaCompliance: 99.1,
      riskFactors: ['Geographic limits', 'Capacity constraints'],
      qualityScore: 91,
      innovationScore: 89,
      supportScore: 92
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      tier: 'cost-optimizer',
      health: 93,
      performance: 85,
      costEfficiency: 96,
      reliability: 98.9,
      responseTime: 0.9,
      monthlySpend: 1234.67,
      marketShare: 18.4,
      strengths: ['Cost effective', 'Speed', 'Integration'],
      concerns: ['Quality variance', 'Model maturity'],
      recommendation: 'Increase for high-volume, simple tasks',
      contractStatus: 'Excellent',
      nextReview: '2024-05-10',
      slaCompliance: 97.8,
      riskFactors: ['Quality inconsistency', 'Google dependency'],
      qualityScore: 82,
      innovationScore: 87,
      supportScore: 85
    },
    {
      id: 'grok',
      name: 'X.AI Grok',
      tier: 'specialized',
      health: 89,
      performance: 78,
      costEfficiency: 73,
      reliability: 97.2,
      responseTime: 2.3,
      monthlySpend: 678.91,
      marketShare: 10.1,
      strengths: ['Real-time data', 'X integration', 'Unique perspective'],
      concerns: ['Higher error rate', 'Limited models'],
      recommendation: 'Use for specialized real-time tasks only',
      contractStatus: 'Review needed',
      nextReview: '2024-02-28',
      slaCompliance: 94.5,
      riskFactors: ['Performance volatility', 'Platform dependency'],
      qualityScore: 76,
      innovationScore: 82,
      supportScore: 79
    }
  ]

  const optimizationRecommendations = [
    {
      type: 'cost-reduction',
      priority: 'high',
      title: 'Smart Routing Implementation',
      description: 'Implement intelligent routing to optimize 40% of queries to lower-cost providers',
      impact: '$892/month savings',
      effort: 'Medium',
      timeline: '2-3 weeks',
      providers: ['gemini', 'claude'],
      confidence: 89
    },
    {
      type: 'risk-reduction',
      priority: 'high',
      title: 'Reduce OpenAI Dependency',
      description: 'Currently 42% dependent on single provider. Diversify to reduce business risk',
      impact: 'Risk score: 87→72',
      effort: 'High',
      timeline: '6-8 weeks',
      providers: ['claude', 'gemini'],
      confidence: 92
    },
    {
      type: 'performance',
      priority: 'medium',
      title: 'Grok Contract Optimization',
      description: 'Renegotiate or replace Grok for specialized tasks with better performing alternatives',
      impact: '15% performance improvement',
      effort: 'Low',
      timeline: '1 week',
      providers: ['claude'],
      confidence: 78
    }
  ]

  const marketIntelligence = {
    trends: [
      { trend: 'Model price reduction', impact: 'Positive', timeline: 'Next 3 months' },
      { trend: 'Context window expansion', impact: 'Opportunity', timeline: 'Ongoing' },
      { trend: 'Multimodal capabilities', impact: 'Strategic', timeline: '6+ months' }
    ],
    competitive: {
      yourRank: 'Top 15%',
      costPosition: '23% below market avg',
      performancePosition: '12% above average',
      recommendations: ['Maintain cost advantage', 'Invest in quality improvements']
    }
  }

  const riskAssessment = {
    overall: 'Medium',
    factors: [
      { risk: 'Single provider dependency', level: 'High', provider: 'OpenAI', mitigation: 'Diversify workloads' },
      { risk: 'Cost volatility', level: 'Medium', provider: 'All', mitigation: 'Fixed-price contracts' },
      { risk: 'Quality variance', level: 'Low', provider: 'Gemini', mitigation: 'Quality monitoring' }
    ]
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-black to-purple-900/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
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
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Provider Intelligence</h1>
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-300 text-sm font-medium rounded-full border border-purple-500/30">
                    v2.0
                  </span>
                </div>
                <p className="text-gray-400">Strategic provider management and optimization</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Sync Data
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Executive Report
                </button>
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex space-x-1 bg-gray-800/30 rounded-lg p-1">
              {['overview', 'intelligence', 'optimization'].map((view) => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view)}
                  className={`px-4 py-2 rounded-md font-medium transition-all capitalize ${
                    selectedView === view
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Portfolio Health Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8"
          >
            {/* Diversification Score */}
            <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">Diversification</h3>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-300 mb-2">{portfolioMetrics.diversificationScore}%</div>
                <div className="flex items-center justify-center gap-2 text-green-400 text-xs">
                  <CheckCircle className="w-3 h-3" />
                  <span>Optimal</span>
                </div>
              </div>
            </div>

            {/* Cost Efficiency */}
            <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-green-400" />
                <h3 className="text-sm font-semibold text-white">Cost Efficiency</h3>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-300 mb-2">{portfolioMetrics.costEfficiency}%</div>
                <div className="flex items-center justify-center gap-2 text-green-400 text-xs">
                  <TrendingUp className="w-3 h-3" />
                  <span>+7% vs market</span>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Gauge className="w-6 h-6 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Performance</h3>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-300 mb-2">{portfolioMetrics.performanceScore}%</div>
                <div className="flex items-center justify-center gap-2 text-blue-400 text-xs">
                  <Activity className="w-3 h-3" />
                  <span>Above target</span>
                </div>
              </div>
            </div>

            {/* Risk Level */}
            <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                <h3 className="text-sm font-semibold text-white">Risk Level</h3>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-300 mb-2 capitalize">{portfolioMetrics.riskLevel}</div>
                <div className="flex items-center justify-center gap-2 text-yellow-400 text-xs">
                  <Target className="w-3 h-3" />
                  <span>Balanced</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 backdrop-blur-xl rounded-2xl border border-orange-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-orange-400" />
                <h3 className="text-sm font-semibold text-white">Actions</h3>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-300 mb-2">{portfolioMetrics.recommendedChanges}</div>
                <div className="flex items-center justify-center gap-2 text-orange-400 text-xs">
                  <ArrowUpCircle className="w-3 h-3" />
                  <span>Pending</span>
                </div>
              </div>
            </div>
          </motion.div>

          {selectedView === 'overview' && (
            <>
              {/* Provider Intelligence Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
              >
                {providerIntelligence.map((provider, index) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 hover:border-purple-500/50 transition-colors"
                  >
                    {/* Provider Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        {getAIProviderLogo(provider.id, 'w-8 h-8')}
                        <div>
                          <h3 className="text-lg font-semibold text-white">{provider.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              provider.tier === 'strategic' ? 'bg-purple-500/20 text-purple-300' :
                              provider.tier === 'cost-optimizer' ? 'bg-green-500/20 text-green-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`}>
                              {provider.tier}
                            </span>
                            <span className="text-gray-400 text-sm">{provider.marketShare}% share</span>
                          </div>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        provider.health > 95 ? 'bg-green-400' :
                        provider.health > 90 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}></div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{provider.performance}%</div>
                        <div className="text-xs text-gray-400">Performance</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{provider.costEfficiency}%</div>
                        <div className="text-xs text-gray-400">Cost Efficiency</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{provider.responseTime}s</div>
                        <div className="text-xs text-gray-400">Avg Response</div>
                      </div>
                    </div>

                    {/* Monthly Spend */}
                    <div className="flex items-center justify-between mb-4 p-3 bg-gray-800/30 rounded-lg">
                      <span className="text-gray-400">Monthly Spend</span>
                      <span className="text-white font-semibold">${provider.monthlySpend.toLocaleString()}</span>
                    </div>

                    {/* Contract Status */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-400 text-sm">Contract Status</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        provider.contractStatus === 'Optimal' ? 'bg-green-500/20 text-green-300' :
                        provider.contractStatus === 'Good' ? 'bg-blue-500/20 text-blue-300' :
                        provider.contractStatus === 'Excellent' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {provider.contractStatus}
                      </span>
                    </div>

                    {/* Quick Stats */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">SLA Compliance</span>
                        <span className="text-white">{provider.slaCompliance}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Quality Score</span>
                        <span className="text-white">{provider.qualityScore}/100</span>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-200 text-sm">{provider.recommendation}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Risk Assessment */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 mb-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="w-6 h-6 text-orange-400" />
                  <h3 className="text-lg font-semibold text-white">Risk Assessment</h3>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    riskAssessment.overall === 'Low' ? 'bg-green-500/20 text-green-300' :
                    riskAssessment.overall === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {riskAssessment.overall} Risk
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {riskAssessment.factors.map((factor, index) => (
                    <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{factor.risk}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          factor.level === 'High' ? 'bg-red-500/20 text-red-300' :
                          factor.level === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {factor.level}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">Provider: {factor.provider}</p>
                      <p className="text-blue-300 text-sm">{factor.mitigation}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}

          {selectedView === 'optimization' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              {/* Optimization Recommendations */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Smart Optimization Engine</h3>
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-medium rounded-full">
                    AI-Powered
                  </span>
                </div>

                <div className="space-y-6">
                  {optimizationRecommendations.map((rec, index) => (
                    <div key={index} className="p-6 bg-gray-800/30 rounded-xl border border-gray-700">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${
                              rec.type === 'cost-reduction' ? 'bg-green-500/20' :
                              rec.type === 'risk-reduction' ? 'bg-red-500/20' : 'bg-blue-500/20'
                            }`}>
                              {rec.type === 'cost-reduction' && <DollarSign className="w-5 h-5 text-green-400" />}
                              {rec.type === 'risk-reduction' && <Shield className="w-5 h-5 text-red-400" />}
                              {rec.type === 'performance' && <Zap className="w-5 h-5 text-blue-400" />}
                            </div>
                            <h4 className="text-white font-semibold">{rec.title}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              rec.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                              rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`}>
                              {rec.priority} priority
                            </span>
                          </div>
                          <p className="text-gray-400 mb-4">{rec.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-semibold mb-1">{rec.impact}</div>
                          <div className="text-gray-400 text-sm">{rec.confidence}% confidence</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400 text-sm">Timeline: {rec.timeline}</span>
                          <span className="text-gray-400 text-sm">Effort: {rec.effort}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">Providers:</span>
                          {rec.providers.map((providerId, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              {getAIProviderLogo(providerId, 'w-4 h-4')}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                          Implement
                        </button>
                        <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium">
                          Simulate Impact
                        </button>
                        <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm">
                          Learn More
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {selectedView === 'intelligence' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              {/* Market Intelligence */}
              <div className="bg-gradient-to-br from-violet-900/20 to-purple-800/20 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Eye className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Market Intelligence</h3>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full">
                    Real-time
                  </span>
                </div>

                {/* Market Trends */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  {marketIntelligence.trends.map((trend, index) => (
                    <div key={index} className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium">{trend.trend}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          trend.impact === 'Positive' ? 'bg-green-500/20 text-green-300' :
                          trend.impact === 'Opportunity' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-purple-500/20 text-purple-300'
                        }`}>
                          {trend.impact}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{trend.timeline}</p>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-300 text-sm">Active trend</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Competitive Position */}
                <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-gold-400" />
                    Competitive Position
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-300 mb-2">{marketIntelligence.competitive.yourRank}</div>
                      <div className="text-gray-400 text-sm">Market Position</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-300 mb-2">{marketIntelligence.competitive.costPosition}</div>
                      <div className="text-gray-400 text-sm">Cost Advantage</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-300 mb-2">{marketIntelligence.competitive.performancePosition}</div>
                      <div className="text-gray-400 text-sm">Performance Edge</div>
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    {marketIntelligence.competitive.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-blue-200 text-sm">
                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strategic Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Provider Deep Dive */}
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Cpu className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Provider Deep Dive</h3>
                  </div>

                  <div className="space-y-4">
                    {providerIntelligence.slice(0, 2).map((provider, index) => (
                      <div key={provider.id} className="p-4 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          {getAIProviderLogo(provider.id, 'w-6 h-6')}
                          <h4 className="text-white font-medium">{provider.name}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            provider.tier === 'strategic' ? 'bg-purple-500/20 text-purple-300' : 'bg-green-500/20 text-green-300'
                          }`}>
                            {provider.tier}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div className="text-center">
                            <div className="text-sm font-bold text-white">{provider.qualityScore}</div>
                            <div className="text-xs text-gray-400">Quality</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-white">{provider.innovationScore}</div>
                            <div className="text-xs text-gray-400">Innovation</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-white">{provider.supportScore}</div>
                            <div className="text-xs text-gray-400">Support</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-blue-200 text-sm">
                            <span className="text-gray-400">Next Review:</span> {provider.nextReview}
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-400">Risk Factors:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {provider.riskFactors.map((risk, idx) => (
                                <span key={idx} className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">
                                  {risk}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strategic Recommendations */}
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Settings className="w-6 h-6 text-orange-400" />
                    <h3 className="text-lg font-semibold text-white">Strategic Actions</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-green-900/30 to-green-800/30 rounded-lg border border-green-500/30">
                      <div className="flex items-center gap-3 mb-2">
                        <ArrowUpCircle className="w-5 h-5 text-green-400" />
                        <h4 className="text-green-300 font-medium">Expand Claude Usage</h4>
                      </div>
                      <p className="text-green-200 text-sm mb-3">
                        Increase Claude utilization by 35% for long-context tasks to improve quality scores.
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-green-400 text-sm font-medium">Impact: High</span>
                        <button className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors">
                          Implement
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-blue-900/30 to-blue-800/30 rounded-lg border border-blue-500/30">
                      <div className="flex items-center gap-3 mb-2">
                        <RefreshCw className="w-5 h-5 text-blue-400" />
                        <h4 className="text-blue-300 font-medium">Contract Renewals</h4>
                      </div>
                      <p className="text-blue-200 text-sm mb-3">
                        2 contracts up for renewal in Q2. Negotiate volume discounts.
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-400 text-sm font-medium">Timeline: 6 weeks</span>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors">
                          Schedule
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-900/30 to-purple-800/30 rounded-lg border border-purple-500/30">
                      <div className="flex items-center gap-3 mb-2">
                        <Brain className="w-5 h-5 text-purple-400" />
                        <h4 className="text-purple-300 font-medium">Innovation Tracking</h4>
                      </div>
                      <p className="text-purple-200 text-sm mb-3">
                        Monitor emerging providers and beta features for competitive advantage.
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-400 text-sm font-medium">Continuous</span>
                        <button className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors">
                          Enable Alerts
                        </button>
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