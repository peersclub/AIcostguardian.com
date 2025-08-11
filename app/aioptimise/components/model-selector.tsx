'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  DollarSign, 
  Zap, 
  Brain,
  Check,
  Star,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Model {
  provider: string;
  model: string;
  contextWindow: number;
  inputCost: number;
  outputCost: number;
  avgLatency: number;
  qualityScore: number;
  capabilities: string[];
  recommended?: boolean;
  matchScore?: number;
}

interface ModelSelectorProps {
  onSelect: (provider: string, model: string) => void;
  onClose: () => void;
  open?: boolean;
}

export function ModelSelector({ onSelect, onClose, open = true }: ModelSelectorProps) {
  const [selectedTab, setSelectedTab] = useState('recommended');
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  
  // Mock data - in production, this would come from the API
  const recommendedModel: Model = {
    provider: 'openai',
    model: 'gpt-4o-mini',
    contextWindow: 128000,
    inputCost: 0.00015,
    outputCost: 0.0006,
    avgLatency: 1200,
    qualityScore: 0.75,
    capabilities: ['vision', 'code_generation', 'reasoning'],
    recommended: true,
    matchScore: 0.92,
  };
  
  const models: Model[] = [
    {
      provider: 'openai',
      model: 'gpt-4o',
      contextWindow: 128000,
      inputCost: 0.0025,
      outputCost: 0.01,
      avgLatency: 2000,
      qualityScore: 0.95,
      capabilities: ['vision', 'code_generation', 'reasoning', 'web_browsing'],
    },
    {
      provider: 'openai',
      model: 'gpt-4o-mini',
      contextWindow: 128000,
      inputCost: 0.00015,
      outputCost: 0.0006,
      avgLatency: 1200,
      qualityScore: 0.75,
      capabilities: ['vision', 'code_generation', 'reasoning'],
    },
    {
      provider: 'anthropic',
      model: 'claude-3.5-sonnet',
      contextWindow: 200000,
      inputCost: 0.003,
      outputCost: 0.015,
      avgLatency: 2200,
      qualityScore: 0.96,
      capabilities: ['vision', 'code_generation', 'reasoning', 'creative_writing'],
    },
    {
      provider: 'anthropic',
      model: 'claude-3.5-haiku',
      contextWindow: 200000,
      inputCost: 0.0008,
      outputCost: 0.004,
      avgLatency: 1000,
      qualityScore: 0.78,
      capabilities: ['code_generation', 'reasoning'],
    },
    {
      provider: 'google',
      model: 'gemini-1.5-pro',
      contextWindow: 2000000,
      inputCost: 0.00125,
      outputCost: 0.005,
      avgLatency: 1800,
      qualityScore: 0.88,
      capabilities: ['vision', 'code_generation', 'reasoning'],
    },
    {
      provider: 'google',
      model: 'gemini-1.5-flash',
      contextWindow: 1000000,
      inputCost: 0.000075,
      outputCost: 0.0003,
      avgLatency: 600,
      qualityScore: 0.72,
      capabilities: ['vision', 'code_generation', 'reasoning'],
    },
  ];
  
  const groupedModels = models.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, Model[]>);
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Your AI Model</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Select an AI model for your conversation</p>
        </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="recommended">
              <Sparkles className="h-4 w-4 mr-2" />
              Recommended
            </TabsTrigger>
            <TabsTrigger value="all">
              <Brain className="h-4 w-4 mr-2" />
              All Models
            </TabsTrigger>
            <TabsTrigger value="compare">
              <TrendingUp className="h-4 w-4 mr-2" />
              Compare
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommended" className="mt-4">
            <Card className="p-6 border-2 border-violet-500 bg-gradient-to-br from-violet-500/5 to-purple-500/5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {recommendedModel.provider} - {recommendedModel.model}
                    </h3>
                    <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0">
                      <Star className="h-3 w-3 mr-1" />
                      Best Match
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Perfect for your query • ${(recommendedModel.inputCost * 1000 + recommendedModel.outputCost * 1000).toFixed(4)} per 1k tokens
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                    {(recommendedModel.matchScore! * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Match Score</div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mb-4">
                <MetricCard
                  icon={<Star className="h-4 w-4" />}
                  label="Quality"
                  value={`${(recommendedModel.qualityScore * 100).toFixed(0)}%`}
                />
                <MetricCard
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Cost"
                  value="Low"
                  variant="success"
                />
                <MetricCard
                  icon={<Zap className="h-4 w-4" />}
                  label="Speed"
                  value={`${recommendedModel.avgLatency}ms`}
                />
                <MetricCard
                  icon={<Brain className="h-4 w-4" />}
                  label="Context"
                  value={`${(recommendedModel.contextWindow / 1000).toFixed(0)}k`}
                />
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex flex-wrap gap-1">
                  {recommendedModel.capabilities.map(cap => (
                    <Badge key={cap} className="text-xs bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20">
                      {cap.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
                <Button 
                  onClick={() => onSelect(recommendedModel.provider, recommendedModel.model)}
                  className="bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 shadow-lg shadow-violet-500/25"
                >
                  Use Recommended
                </Button>
              </div>
            </Card>
            
            <div className="mt-4 p-4 bg-gradient-to-br from-violet-500/5 to-purple-500/5 border border-violet-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-violet-600 dark:text-violet-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1 text-violet-700 dark:text-violet-300">Why this model?</p>
                  <p className="text-gray-600 dark:text-gray-400">Based on your prompt analysis, this model offers the best balance of quality, cost, and speed. It has all required capabilities and will save you approximately 73% compared to premium models.</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="all" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-6">
                {Object.entries(groupedModels).map(([provider, providerModels]) => (
                  <div key={provider}>
                    <h3 className="text-sm font-medium text-violet-600 dark:text-violet-400 mb-3 uppercase tracking-wider">
                      {provider}
                    </h3>
                    <div className="space-y-2">
                      {providerModels.map(model => (
                        <ModelCard
                          key={`${model.provider}-${model.model}`}
                          model={model}
                          selected={selectedModel?.model === model.model}
                          onSelect={() => setSelectedModel(model)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {selectedModel && (
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={() => onSelect(selectedModel.provider, selectedModel.model)}
                  className="bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 shadow-lg shadow-violet-500/25"
                >
                  Use {selectedModel.model}
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="compare" className="mt-4">
            <div className="text-center py-8">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-violet-500/10 to-purple-500/10 mb-4">
                <TrendingUp className="h-12 w-12 text-violet-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">Model comparison coming soon</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Compare models side-by-side to find the perfect fit</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function ModelCard({ 
  model, 
  selected, 
  onSelect 
}: { 
  model: Model; 
  selected: boolean; 
  onSelect: () => void;
}) {
  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all duration-200 border-2",
        "hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10",
        selected 
          ? "border-violet-500 bg-gradient-to-br from-violet-500/10 to-purple-500/10" 
          : "border-gray-200 dark:border-gray-800"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">{model.model}</h4>
            {selected && <Check className="h-4 w-4 text-violet-500" />}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>${(model.inputCost * 1000).toFixed(4)}/1k in</span>
            <span>${(model.outputCost * 1000).toFixed(4)}/1k out</span>
            <span>{model.avgLatency}ms</span>
            <span>{(model.contextWindow / 1000).toFixed(0)}k context</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3 w-3",
                  i < Math.round(model.qualityScore * 5)
                    ? "fill-violet-500 text-violet-500"
                    : "text-gray-300 dark:text-gray-700"
                )}
              />
            ))}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Quality: {(model.qualityScore * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </Card>
  );
}

function MetricCard({ 
  icon, 
  label, 
  value, 
  variant = 'default' 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  variant?: 'default' | 'success' | 'warning';
}) {
  return (
    <div className="text-center">
      <div className={cn(
        "inline-flex p-2 rounded-lg mb-2",
        variant === 'success' && "bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-600 dark:text-green-400",
        variant === 'warning' && "bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400",
        variant === 'default' && "bg-gradient-to-br from-violet-500/10 to-purple-500/10"
      )}>
        {icon}
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</div>
    </div>
  );
}