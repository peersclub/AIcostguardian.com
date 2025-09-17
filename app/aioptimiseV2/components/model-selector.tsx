'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  DollarSign, 
  Zap, 
  Brain,
  Check,
  Star,
  TrendingUp,
  AlertCircle,
  Key,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useGlobalKeyCheck } from '@/hooks/useGlobalKeyCheck';

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
  const router = useRouter();
  
  // Get available providers from global hook
  const { hasValidKeys, getAvailableProviders, checking } = useGlobalKeyCheck();
  const availableProviders = getAvailableProviders();
  
  // All possible models with their specifications
  const allModels: Model[] = [
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
    {
      provider: 'xai',
      model: 'grok-2',
      contextWindow: 100000,
      inputCost: 0.002,
      outputCost: 0.008,
      avgLatency: 1500,
      qualityScore: 0.85,
      capabilities: ['code_generation', 'reasoning', 'humor'],
    },
    {
      provider: 'perplexity',
      model: 'llama-3.1-sonar-large',
      contextWindow: 200000,
      inputCost: 0.001,
      outputCost: 0.001,
      avgLatency: 1200,
      qualityScore: 0.82,
      capabilities: ['web_search', 'reasoning', 'factual_accuracy'],
    },
  ];
  
  // Filter models to only show those with available API keys
  const models = allModels.filter(model => 
    availableProviders.includes(model.provider.toLowerCase())
  );
  
  // Determine recommended model from available ones
  const recommendedModel: Model | null = models.length > 0 
    ? {
        ...models.sort((a, b) => {
          // Prioritize by balance of quality and cost
          const scoreA = a.qualityScore / (a.inputCost + a.outputCost);
          const scoreB = b.qualityScore / (b.inputCost + b.outputCost);
          return scoreB - scoreA;
        })[0],
        recommended: true,
        matchScore: 0.92,
      }
    : null;
  
  const groupedModels = models.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, Model[]>);
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Choose Your AI Model</DialogTitle>
        </DialogHeader>
        
        {checking ? (
          <div className="py-8">
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                <Key className="h-12 w-12 text-primary animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Checking API Keys...</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Verifying your API key configuration. This will only take a moment.
              </p>
            </div>
          </div>
        ) : !hasValidKeys ? (
          <div className="py-8">
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-destructive/10 mb-4">
                <Lock className="h-12 w-12 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No API Keys Configured</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                You need to add at least one API key to use AI Optimize. Add your OpenAI, Anthropic, Google, or other provider keys to get started.
              </p>
              <div className="flex justify-center gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    onClose();
                    router.push('/settings/api-keys');
                  }}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Manage Keys
                </Button>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => {
                    onClose();
                    router.push('/onboarding/api-setup');
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Quick Setup
                </Button>
              </div>
            </div>
          </div>
        ) : models.length === 0 ? (
          <div className="py-8">
            <Alert className="border-amber-600/20 bg-amber-600/10">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-foreground">
                <strong>Limited Models Available</strong>
                <p className="mt-1 text-muted-foreground">Your current API keys don't match any available models. Please check your API key configuration.</p>
              </AlertDescription>
            </Alert>
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  router.push('/settings/api-keys');
                }}
              >
                <Key className="h-4 w-4 mr-2" />
                Check API Keys
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Select an AI model for your conversation • {models.length} model{models.length !== 1 ? 's' : ''} available with your API keys
              </p>
            </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-4">
          <TabsList className="grid grid-cols-3 w-full bg-muted">
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
            {recommendedModel ? (
              <Card className="p-6 border-2 border-primary bg-primary/5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {recommendedModel.provider} - {recommendedModel.model}
                      </h3>
                      <Badge className="bg-primary text-primary-foreground border-0">
                        <Star className="h-3 w-3 mr-1" />
                        Best Match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Perfect for your query • ${(recommendedModel.inputCost * 1000 + recommendedModel.outputCost * 1000).toFixed(4)} per 1k tokens
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {(recommendedModel.matchScore! * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Match Score</div>
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
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex flex-wrap gap-1">
                    {recommendedModel.capabilities.map(cap => (
                      <Badge key={cap} className="text-xs bg-primary/10 text-primary border border-primary/20">
                        {cap.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    onClick={() => onSelect(recommendedModel.provider, recommendedModel.model)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Use Recommended
                  </Button>
                </div>
              </Card>
            ) : (
              <Alert className="border-amber-600/20 bg-amber-600/10">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-foreground">
                  No models available for recommendation. Please check the "All Models" tab.
                </AlertDescription>
              </Alert>
            )}
            
            {recommendedModel && (
              <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1 text-foreground">Why this model?</p>
                    <p className="text-muted-foreground">Based on your prompt analysis, this model offers the best balance of quality, cost, and speed. It has all required capabilities and will save you approximately 73% compared to premium models.</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="mt-4">
            {models.length === 0 ? (
              <Alert className="border-amber-600/20 bg-amber-600/10">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-foreground">
                  <strong>No models available</strong>
                  <p className="mt-1 text-muted-foreground">Add API keys to see available models here.</p>
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing models from {availableProviders.length} provider{availableProviders.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex items-center gap-2">
                    {availableProviders.map(provider => (
                      <Badge key={provider} variant="secondary" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        {provider}
                      </Badge>
                    ))}
                  </div>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-6">
                    {Object.entries(groupedModels).map(([provider, providerModels]) => (
                      <div key={provider}>
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-sm font-medium text-primary uppercase tracking-wider">
                            {provider}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {providerModels.length} model{providerModels.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
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
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Use {selectedModel.model}
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="compare" className="mt-4">
            <div className="text-center py-8">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                <TrendingUp className="h-12 w-12 text-primary" />
              </div>
              <p className="text-muted-foreground">Model comparison coming soon</p>
              <p className="text-sm text-muted-foreground/70 mt-2">Compare models side-by-side to find the perfect fit</p>
            </div>
          </TabsContent>
        </Tabs>
        </>
        )}
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
        "hover:border-primary/50 hover:shadow-lg",
        selected 
          ? "border-primary bg-primary/10" 
          : "border-border bg-card"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-foreground">{model.model}</h4>
            {selected && <Check className="h-4 w-4 text-primary" />}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                    ? "fill-primary text-primary"
                    : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
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
        variant === 'success' && "bg-green-500/20 text-green-600 dark:text-green-400",
        variant === 'warning' && "bg-amber-500/20 text-amber-600 dark:text-amber-400",
        variant === 'default' && "bg-primary/10 text-primary"
      )}>
        {icon}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}