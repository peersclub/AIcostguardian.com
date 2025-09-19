'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Zap,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip as TooltipComponent,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ForecastData {
  daily: any
  weekly: any
  monthly: any
}

interface AccuracyMetrics {
  overall: number
  trend: number
  seasonal: number
  confidence: number
}

interface CostForecastChartProps {
  predictions: ForecastData | null
  accuracy: AccuracyMetrics | null
  selectedPeriod: string
  onPeriodChange: (period: string) => void
}

interface ChartDataPoint {
  date: string
  historical?: number
  predicted: number
  confidence: number
  upper: number
  lower: number
  isProjected: boolean
}

const PROVIDER_COLORS = {
  openai: '#10B981',
  anthropic: '#8B5CF6',
  google: '#F59E0B',
  perplexity: '#EF4444',
  cohere: '#06B6D4',
  mistral: '#F97316',
  other: '#6B7280'
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-lg p-4 shadow-2xl">
        <p className="text-white font-medium mb-2">{formatDate(label)}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-300">{entry.name}:</span>
            <span className="text-white font-medium">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
        {data.confidence && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <span className="text-gray-400 text-xs">
              Confidence: {(data.confidence * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>
    )
  }
  return null
}

export default function CostForecastChart({
  predictions,
  accuracy,
  selectedPeriod,
  onPeriodChange
}: CostForecastChartProps) {
  const [chartView, setChartView] = useState<'timeline' | 'breakdown' | 'trends'>('timeline')
  const [isLoading, setIsLoading] = useState(false)

  // Generate chart data based on predictions
  const chartData = useMemo(() => {
    if (!predictions || !predictions[selectedPeriod as keyof ForecastData]) {
      return []
    }

    const data = predictions[selectedPeriod as keyof ForecastData]
    const dataPoints: ChartDataPoint[] = []

    // Generate historical points (last 30 days)
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      // Simulate historical data with some variability
      const baseValue = data.predictedCost * 0.8 * (1 + Math.sin(i / 5) * 0.2)
      const historicalCost = baseValue + (Math.random() - 0.5) * baseValue * 0.3

      dataPoints.push({
        date: date.toISOString().split('T')[0],
        historical: Math.max(0, historicalCost),
        predicted: data.predictedCost,
        confidence: data.confidence || 0.8,
        upper: data.predictedCost * 1.2,
        lower: data.predictedCost * 0.8,
        isProjected: false
      })
    }

    // Generate future projection points
    const daysToProject = selectedPeriod === 'daily' ? 7 : selectedPeriod === 'weekly' ? 4 : 12
    for (let i = 1; i <= daysToProject; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)

      // Add growth trend to predictions
      const growthFactor = 1 + (0.15 / 30) * i // 15% annual growth
      const projectedCost = data.predictedCost * growthFactor

      dataPoints.push({
        date: date.toISOString().split('T')[0],
        predicted: projectedCost,
        confidence: Math.max(0.4, data.confidence - i * 0.05), // Confidence decreases with time
        upper: projectedCost * (1 + 0.3 - i * 0.02),
        lower: projectedCost * (1 - 0.3 + i * 0.02),
        isProjected: true
      })
    }

    return dataPoints
  }, [predictions, selectedPeriod])

  // Generate breakdown data for provider/model analysis
  const breakdownData = useMemo(() => {
    if (!predictions || !predictions[selectedPeriod as keyof ForecastData]) {
      return { providers: [], models: [] }
    }

    const data = predictions[selectedPeriod as keyof ForecastData]

    // Simulate provider breakdown
    const providers = [
      { name: 'OpenAI', value: data.predictedCost * 0.4, color: PROVIDER_COLORS.openai },
      { name: 'Anthropic', value: data.predictedCost * 0.3, color: PROVIDER_COLORS.anthropic },
      { name: 'Google', value: data.predictedCost * 0.2, color: PROVIDER_COLORS.google },
      { name: 'Perplexity', value: data.predictedCost * 0.1, color: PROVIDER_COLORS.perplexity }
    ]

    // Simulate model breakdown
    const models = [
      { name: 'GPT-4o', cost: data.predictedCost * 0.25, provider: 'OpenAI' },
      { name: 'Claude 3.5 Sonnet', cost: data.predictedCost * 0.2, provider: 'Anthropic' },
      { name: 'GPT-4o-mini', cost: data.predictedCost * 0.15, provider: 'OpenAI' },
      { name: 'Gemini 1.5 Pro', cost: data.predictedCost * 0.15, provider: 'Google' },
      { name: 'Claude 3 Haiku', cost: data.predictedCost * 0.1, provider: 'Anthropic' },
      { name: 'Sonar Medium', cost: data.predictedCost * 0.1, provider: 'Perplexity' },
      { name: 'Other', cost: data.predictedCost * 0.05, provider: 'Various' }
    ]

    return { providers, models }
  }, [predictions, selectedPeriod])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-400" />
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-green-400" />
      default:
        return <Activity className="w-4 h-4 text-blue-400" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400'
    if (confidence >= 0.6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="w-4 h-4 text-green-400" />
    if (confidence >= 0.6) return <AlertCircle className="w-4 h-4 text-yellow-400" />
    return <AlertCircle className="w-4 h-4 text-red-400" />
  }

  if (!predictions) {
    return (
      <Card className="bg-gray-900/50 backdrop-blur-xl border border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <LineChartIcon className="w-5 h-5 text-blue-400" />
            Cost Forecast Visualization
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-64 bg-gray-800/30 rounded-lg border border-gray-700 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-400 text-lg font-medium">Loading Forecast Data...</p>
              <p className="text-gray-500 text-sm">Analyzing usage patterns and generating predictions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentPrediction = predictions[selectedPeriod as keyof ForecastData]

  return (
    <TooltipProvider>
      <Card className="bg-gray-900/50 backdrop-blur-xl border border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-blue-400" />
              Cost Forecast Visualization
              <Badge className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium">
                AI-Powered
              </Badge>
            </CardTitle>

            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={onPeriodChange}>
                <SelectTrigger className="w-40 bg-gray-800/50 border-gray-700 text-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="daily">Daily View</SelectItem>
                  <SelectItem value="weekly">Weekly View</SelectItem>
                  <SelectItem value="monthly">Monthly View</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-gray-400 text-sm">Predicted Cost</span>
              </div>
              <div className="text-white text-lg font-semibold">
                {formatCurrency(currentPrediction?.predictedCost || 0)}
              </div>
            </div>

            <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                {getConfidenceIcon(currentPrediction?.confidence || 0)}
                <span className="text-gray-400 text-sm">Confidence</span>
              </div>
              <div className={`text-lg font-semibold ${getConfidenceColor(currentPrediction?.confidence || 0)}`}>
                {((currentPrediction?.confidence || 0) * 100).toFixed(0)}%
              </div>
            </div>

            <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                {getTrendIcon(currentPrediction?.trend || 'stable')}
                <span className="text-gray-400 text-sm">Trend</span>
              </div>
              <div className="text-white text-lg font-semibold capitalize">
                {currentPrediction?.trend || 'Stable'}
              </div>
            </div>

            <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-400 text-sm">Change</span>
              </div>
              <div className="text-white text-lg font-semibold">
                {currentPrediction?.percentageChange > 0 ? '+' : ''}
                {(currentPrediction?.percentageChange || 0).toFixed(1)}%
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={chartView} onValueChange={(value) => setChartView(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 p-1">
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <LineChartIcon className="w-4 h-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="breakdown" className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4" />
                Breakdown
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Trends
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-6 mt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={formatDate}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {/* Confidence interval */}
                    <Area
                      dataKey="upper"
                      stroke="none"
                      fill="url(#confidenceGradient)"
                      fillOpacity={0.3}
                    />
                    <Area
                      dataKey="lower"
                      stroke="none"
                      fill="#1F2937"
                      fillOpacity={1}
                    />

                    {/* Historical data */}
                    <Area
                      dataKey="historical"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fill="url(#historicalGradient)"
                      connectNulls={false}
                      name="Historical Cost"
                    />

                    {/* Predicted data */}
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#10B981"
                      strokeWidth={3}
                      strokeDasharray="5,5"
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      name="Predicted Cost"
                    />

                    {/* Reference line for today */}
                    <ReferenceLine
                      x={new Date().toISOString().split('T')[0]}
                      stroke="#F59E0B"
                      strokeDasharray="2,2"
                      label={{ value: "Today", position: "top" }}
                    />

                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="breakdown" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Provider Breakdown */}
                <div>
                  <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-blue-400" />
                    Cost by Provider
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={breakdownData.providers}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {breakdownData.providers.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: 'rgba(17, 24, 39, 0.95)',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Model Breakdown */}
                <div>
                  <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-green-400" />
                    Cost by Model
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={breakdownData.models} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="name"
                          stroke="#9CA3AF"
                          fontSize={10}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis
                          stroke="#9CA3AF"
                          fontSize={12}
                          tickFormatter={formatCurrency}
                        />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: 'rgba(17, 24, 39, 0.95)',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Bar dataKey="cost" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    Growth Analysis
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Monthly Growth Rate:</span>
                      <span className="text-white font-medium">
                        {currentPrediction?.percentageChange > 0 ? '+' : ''}
                        {(currentPrediction?.percentageChange || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trend Direction:</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(currentPrediction?.trend || 'stable')}
                        <span className="text-white font-medium capitalize">
                          {currentPrediction?.trend || 'Stable'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Prediction Accuracy:</span>
                      <span className="text-white font-medium">
                        {(accuracy?.overall || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-yellow-400" />
                    Key Insights
                  </h4>
                  <div className="space-y-2">
                    {currentPrediction?.recommendations?.slice(0, 3).map((rec: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{rec}</span>
                      </div>
                    )) || (
                      <div className="text-gray-500 text-sm">
                        No specific recommendations available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}