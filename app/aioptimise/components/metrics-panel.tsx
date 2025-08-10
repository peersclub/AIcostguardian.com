'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Activity,
  PieChart,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionMetrics {
  messageCount: number;
  totalCost: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  todayCost: number;
  savedAmount: number;
  savedPercentage: number;
}

interface MetricsPanelProps {
  metrics: SessionMetrics;
  collapsed: boolean;
  onToggle: () => void;
}

export function MetricsPanel({ metrics, collapsed, onToggle }: MetricsPanelProps) {
  if (collapsed) {
    return (
      <div className="w-16 border-l flex flex-col items-center py-4 gap-2">
        <Button variant="ghost" size="icon" onClick={onToggle}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <PieChart className="h-4 w-4 text-muted-foreground" />
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-80 border-l flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Live Metrics</h2>
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Current Session */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Current Session</h3>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="space-y-3">
            <MetricRow
              label="Input Tokens"
              value={metrics.inputTokens.toLocaleString()}
              cost={`$${(metrics.inputTokens * 0.000003).toFixed(4)}`}
            />
            <MetricRow
              label="Output Tokens"
              value={metrics.outputTokens.toLocaleString()}
              cost={`$${(metrics.outputTokens * 0.000015).toFixed(4)}`}
            />
            <div className="pt-2 border-t">
              <MetricRow
                label="Total Cost"
                value={`$${metrics.totalCost.toFixed(4)}`}
                highlight
              />
            </div>
          </div>
        </Card>
        
        {/* Savings */}
        {metrics.savedAmount > 0 && (
          <Card className="p-4 bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-green-700 dark:text-green-400">
                Savings
              </h3>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                ${metrics.savedAmount.toFixed(3)}
              </div>
              <div className="text-sm text-green-600 dark:text-green-500">
                {metrics.savedPercentage.toFixed(0)}% saved vs premium models
              </div>
              <Progress 
                value={metrics.savedPercentage} 
                className="h-2"
              />
            </div>
          </Card>
        )}
        
        {/* Today's Usage */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Today's Usage</h3>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Messages</span>
              <span className="text-sm font-medium">{metrics.messageCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tokens</span>
              <span className="text-sm font-medium">
                {metrics.totalTokens.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Cost</span>
              <span className="text-sm font-medium">
                ${metrics.todayCost.toFixed(3)}
              </span>
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Budget remaining</span>
                <span>$4.17 of $5.00</span>
              </div>
              <Progress value={17} className="h-1 mt-1" />
            </div>
          </div>
        </Card>
        
        {/* Model Distribution */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Model Usage</h3>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <ModelUsageRow model="GPT-4o-mini" percentage={45} count={12} />
            <ModelUsageRow model="Claude 3.5 Haiku" percentage={30} count={8} />
            <ModelUsageRow model="Gemini Flash" percentage={15} count={4} />
            <ModelUsageRow model="GPT-4o" percentage={10} count={3} />
          </div>
        </Card>
        
        {/* Performance */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Performance</h3>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg Response Time</span>
              <span className="text-sm font-medium">1.2s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Quality Score</span>
              <span className="text-sm font-medium">9.2/10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Override Rate</span>
              <span className="text-sm font-medium">12%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricRow({ 
  label, 
  value, 
  cost, 
  highlight = false 
}: { 
  label: string; 
  value: string; 
  cost?: string; 
  highlight?: boolean;
}) {
  return (
    <div className={cn("flex justify-between", highlight && "font-medium")}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-right">
        <div className="text-sm">{value}</div>
        {cost && <div className="text-xs text-muted-foreground">{cost}</div>}
      </div>
    </div>
  );
}

function ModelUsageRow({ 
  model, 
  percentage, 
  count 
}: { 
  model: string; 
  percentage: number; 
  count: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>{model}</span>
        <span className="text-muted-foreground">{count} calls</span>
      </div>
      <Progress value={percentage} className="h-1" />
    </div>
  );
}