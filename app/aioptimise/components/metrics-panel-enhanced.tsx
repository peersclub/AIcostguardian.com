'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Zap, 
  Brain,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  Circle,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Target,
  Shield,
  Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

interface MetricsPanelEnhancedProps {
  metrics: {
    messageCount: number;
    totalCost: number;
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    todayCost: number;
    savedAmount: number;
    savedPercentage: number;
    averageLatency?: number;
    successRate?: number;
    overrideCount?: number;
    feedbackScore?: number;
    dailyLimit?: number;
    monthlyLimit?: number;
    dailyUsed?: number;
    monthlyUsed?: number;
  };
  collapsed: boolean;
  onToggle: () => void;
  onRequestLimitIncrease?: () => void;
  mode?: 'standard' | 'focus';
}

export function MetricsPanelEnhanced({
  metrics,
  collapsed,
  onToggle,
  onRequestLimitIncrease,
  mode = 'standard',
}: MetricsPanelEnhancedProps) {
  const [isLive, setIsLive] = useState(true);
  const [showChart, setShowChart] = useState(false);

  // Simulated live data update
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        // Trigger re-render to simulate live updates
        setIsLive(prev => prev);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  const dailyUsagePercentage = metrics.dailyLimit 
    ? (metrics.dailyUsed || metrics.todayCost) / metrics.dailyLimit * 100 
    : 0;
    
  const monthlyUsagePercentage = metrics.monthlyLimit 
    ? (metrics.monthlyUsed || metrics.totalCost) / metrics.monthlyLimit * 100 
    : 0;

  const isNearDailyLimit = dailyUsagePercentage > 80;
  const isNearMonthlyLimit = monthlyUsagePercentage > 80;

  // Chart data
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Cost ($)',
        data: [0.12, 0.19, 0.15, 0.25, 0.22, 0.30, metrics.todayCost],
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  };

  if (mode === 'focus' || collapsed) {
    return (
      <div 
        className={cn(
          "flex flex-col bg-gray-900/50 backdrop-blur-xl border-l border-gray-800 transition-all duration-300",
          collapsed ? "w-16" : "w-80"
        )}
      >
        <div className="p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 flex flex-col bg-gray-900/50 backdrop-blur-xl border-l border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-white">Live Metrics</h3>
            {isLive && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Circle className="h-2 w-2 fill-green-500 text-green-500 animate-pulse" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Live data - Updates every 5s</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2">
          <Card className="p-2 bg-gradient-to-br from-green-900/50 to-emerald-800/50 border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-300">Today</p>
                <p className="text-sm font-bold text-white">${metrics.todayCost.toFixed(3)}</p>
              </div>
              {metrics.todayCost > metrics.totalCost * 0.5 ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
            </div>
          </Card>
          
          <Card className="p-2 bg-gradient-to-br from-violet-900/50 to-purple-800/50 border-violet-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-violet-300">Saved</p>
                <p className="text-sm font-bold text-white">
                  ${metrics.savedAmount.toFixed(2)}
                </p>
              </div>
              <Shield className="h-4 w-4 text-violet-400" />
            </div>
          </Card>
        </div>
      </div>

      {/* Main metrics */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Usage limits */}
        {(metrics.dailyLimit || metrics.monthlyLimit) && (
          <Card className="p-3 space-y-3 bg-gray-800/50 border-gray-700">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2 text-white">
                <Gauge className="h-4 w-4 text-violet-400" />
                Usage Limits
              </h4>
              {(isNearDailyLimit || isNearMonthlyLimit) && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Near limit
                </Badge>
              )}
            </div>
            
            {metrics.dailyLimit && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Daily</span>
                  <span className={cn(
                    "font-medium",
                    isNearDailyLimit && "text-red-500"
                  )}>
                    ${metrics.dailyUsed || metrics.todayCost} / ${metrics.dailyLimit}
                  </span>
                </div>
                <Progress 
                  value={dailyUsagePercentage} 
                  className={cn(
                    "h-2",
                    isNearDailyLimit && "[&>div]:bg-red-500"
                  )}
                />
              </div>
            )}
            
            {metrics.monthlyLimit && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Monthly</span>
                  <span className={cn(
                    "font-medium",
                    isNearMonthlyLimit && "text-orange-500"
                  )}>
                    ${metrics.monthlyUsed || metrics.totalCost} / ${metrics.monthlyLimit}
                  </span>
                </div>
                <Progress 
                  value={monthlyUsagePercentage} 
                  className={cn(
                    "h-2",
                    isNearMonthlyLimit && "[&>div]:bg-orange-500"
                  )}
                />
              </div>
            )}
            
            {(isNearDailyLimit || isNearMonthlyLimit) && onRequestLimitIncrease && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={onRequestLimitIncrease}
              >
                Request Limit Increase
              </Button>
            )}
          </Card>
        )}

        {/* Performance metrics */}
        <Card className="p-3 space-y-3 bg-gray-800/50 border-gray-700">
          <h4 className="text-sm font-medium flex items-center gap-2 text-white">
            <Activity className="h-4 w-4 text-violet-400" />
            Performance
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Avg Latency
              </span>
              <span className="text-xs font-medium text-white">
                {metrics.averageLatency || 1250}ms
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Success Rate
              </span>
              <span className="text-xs font-medium text-green-400">
                {metrics.successRate || 98.5}%
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Brain className="h-3 w-3" />
                Model Overrides
              </span>
              <span className="text-xs font-medium text-white">
                {metrics.overrideCount || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Feedback Score
              </span>
              <span className="text-xs font-medium text-white">
                {metrics.feedbackScore || 4.5}/5.0
              </span>
            </div>
          </div>
        </Card>

        {/* Cost breakdown */}
        <Card className="p-3 space-y-3 bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-500/30">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2 text-white">
              <DollarSign className="h-4 w-4 text-blue-400" />
              Cost Analysis
            </h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setShowChart(!showChart)}
            >
              <BarChart3 className="h-3 w-3" />
            </Button>
          </div>
          
          {showChart ? (
            <div className="h-32">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-300">Total Cost</span>
                <span className="text-sm font-bold text-white">
                  ${metrics.totalCost.toFixed(4)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-300">Messages</span>
                <span className="text-sm font-medium text-white">
                  {metrics.messageCount}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-300">Avg per msg</span>
                <span className="text-sm font-medium text-white">
                  ${metrics.messageCount > 0 
                    ? (metrics.totalCost / metrics.messageCount).toFixed(4)
                    : '0.0000'
                  }
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-300">Savings</span>
                <span className="text-sm font-medium text-green-400">
                  {metrics.savedPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Token usage */}
        <Card className="p-3 space-y-3 bg-gradient-to-br from-yellow-900/50 to-orange-800/50 border-yellow-500/30">
          <h4 className="text-sm font-medium flex items-center gap-2 text-white">
            <Zap className="h-4 w-4 text-yellow-400" />
            Token Usage
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-yellow-300">Total</span>
              <span className="text-sm font-bold text-white">
                {metrics.totalTokens.toLocaleString()}
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-yellow-300 flex items-center gap-1">
                  <ArrowUp className="h-3 w-3" />
                  Input
                </span>
                <span className="text-white">{metrics.inputTokens.toLocaleString()}</span>
              </div>
              <Progress 
                value={(metrics.inputTokens / metrics.totalTokens) * 100} 
                className="h-1.5"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-yellow-300 flex items-center gap-1">
                  <ArrowDown className="h-3 w-3" />
                  Output
                </span>
                <span className="text-white">{metrics.outputTokens.toLocaleString()}</span>
              </div>
              <Progress 
                value={(metrics.outputTokens / metrics.totalTokens) * 100} 
                className="h-1.5 [&>div]:bg-green-500"
              />
            </div>
          </div>
        </Card>

        {/* Optimization tips */}
        <Card className="p-3 space-y-2 bg-violet-900/30 border-violet-500/30">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-violet-400" />
            <h4 className="text-sm font-medium text-white">Optimization Tip</h4>
          </div>
          <p className="text-xs text-gray-300">
            {metrics.savedPercentage < 10 
              ? "Try using BUDGET mode for simple queries to save more"
              : metrics.overrideCount && metrics.overrideCount > 5
              ? "You've overridden models frequently. Consider adjusting your preferences"
              : "Great job! You're optimizing costs effectively"
            }
          </p>
        </Card>
      </div>
    </div>
  );
}