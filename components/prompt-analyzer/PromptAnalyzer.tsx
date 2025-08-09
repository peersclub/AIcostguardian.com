'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  DollarSign, 
  Award, 
  AlertCircle,
  Brain,
  Code,
  PenTool,
  MessageSquare,
  Calculator,
  Search,
  Image,
  Globe,
  ChevronRight,
  X,
  Check,
  TrendingUp,
  Clock,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  PromptAnalyzer as Analyzer, 
  ContentType, 
  ComplexityLevel,
  type AnalysisResult,
  type ModelRecommendation 
} from '@/lib/prompt-analyzer/engine';

interface PromptAnalyzerProps {
  onModelSelect?: (provider: string, model: string) => void;
  initialPrompt?: string;
  className?: string;
}

const contentTypeIcons: Record<ContentType, React.ElementType> = {
  [ContentType.CREATIVE_WRITING]: PenTool,
  [ContentType.PROFESSIONAL_WRITING]: PenTool,
  [ContentType.MARKETING_COPY]: TrendingUp,
  [ContentType.CODE_GENERATION]: Code,
  [ContentType.CODE_DEBUGGING]: Code,
  [ContentType.CODE_EXPLANATION]: Code,
  [ContentType.CODE_REVIEW]: Code,
  [ContentType.DATA_ANALYSIS]: Calculator,
  [ContentType.MATH_PROBLEM]: Calculator,
  [ContentType.LOGICAL_REASONING]: Brain,
  [ContentType.RESEARCH]: Search,
  [ContentType.SIMPLE_QA]: MessageSquare,
  [ContentType.COMPLEX_QA]: MessageSquare,
  [ContentType.CHAT]: MessageSquare,
  [ContentType.ROLE_PLAY]: MessageSquare,
  [ContentType.TRANSLATION]: Globe,
  [ContentType.SUMMARIZATION]: Globe,
  [ContentType.EXTRACTION]: Globe,
  [ContentType.CLASSIFICATION]: Globe,
  [ContentType.IMAGE_GENERATION]: Image,
  [ContentType.IMAGE_ANALYSIS]: Image,
  [ContentType.VISION_TASKS]: Image,
};

const providerColors = {
  openai: 'bg-green-500/10 text-green-600 border-green-500/20',
  anthropic: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  google: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  xai: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  perplexity: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
};

export function PromptAnalyzer({ 
  onModelSelect, 
  initialPrompt = '', 
  className 
}: PromptAnalyzerProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelRecommendation | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const analyzer = useMemo(() => new Analyzer(), []);

  const handleAnalyze = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setSelectedModel(null);

    // Simulate async analysis (in real app, this could be an API call)
    await new Promise(resolve => setTimeout(resolve, 500));

    const analysisResult = analyzer.analyze(prompt);
    setResult(analysisResult);
    
    // Auto-select best recommendation
    if (analysisResult.recommendations.length > 0) {
      setSelectedModel(analysisResult.recommendations[0]);
    }

    setIsAnalyzing(false);
  }, [prompt, analyzer]);

  // Auto-analyze on prompt change (debounced)
  useEffect(() => {
    if (!prompt.trim()) {
      setResult(null);
      return;
    }

    const timer = setTimeout(() => {
      handleAnalyze();
    }, 1000);

    return () => clearTimeout(timer);
  }, [prompt, handleAnalyze]);

  const handleModelSelect = (model: ModelRecommendation) => {
    setSelectedModel(model);
    if (onModelSelect) {
      onModelSelect(model.provider, model.model);
    }
  };

  const formatCost = (cost: number) => {
    if (cost < 0.01) return `$${(cost * 100).toFixed(3)}¢`;
    return `$${cost.toFixed(4)}`;
  };

  const getComplexityColor = (level: ComplexityLevel) => {
    const colors = [
      '',
      'text-green-600',
      'text-blue-600',
      'text-yellow-600',
      'text-orange-600',
      'text-red-600',
    ];
    return colors[level];
  };

  const getBadgeIcon = (badge?: string) => {
    switch (badge) {
      case 'best': return Award;
      case 'fastest': return Zap;
      case 'cheapest': return DollarSign;
      case 'balanced': return TrendingUp;
      default: return null;
    }
  };

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'best': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'fastest': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'cheapest': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'balanced': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Input Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Smart Prompt Analyzer</h3>
            </div>
            {result && (
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" />
                {result.confidence > 0.8 ? 'High' : result.confidence > 0.6 ? 'Medium' : 'Low'} Confidence
              </Badge>
            )}
          </div>

          <Textarea
            placeholder="Paste or type your prompt here... The AI will analyze it and recommend the best model for your needs."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] resize-none"
          />

          {/* Quick Stats */}
          {result && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                ~{result.tokens.estimated} tokens
              </Badge>
              <Badge variant="secondary" className="gap-1">
                {React.createElement(contentTypeIcons[result.contentType], { className: 'h-3 w-3' })}
                {result.contentType.replace(/_/g, ' ')}
              </Badge>
              <Badge 
                variant="secondary" 
                className={cn('gap-1', getComplexityColor(result.complexity))}
              >
                <Cpu className="h-3 w-3" />
                Complexity: {result.complexity}/5
              </Badge>
            </div>
          )}
        </div>
      </Card>

      {/* Analysis Results */}
      <AnimatePresence mode="wait">
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-center py-8"
          >
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
              <span className="text-muted-foreground">Analyzing your prompt...</span>
            </div>
          </motion.div>
        )}

        {result && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Summary Card */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Analysis Summary</h4>
                    <p className="text-lg font-semibold mt-1">{result.summary}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? 'Hide' : 'Show'} Details
                  </Button>
                </div>

                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t"
                  >
                    {Object.entries(result.features).map(([key, value]) => {
                      if (typeof value === 'boolean' && value) {
                        return (
                          <div key={key} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </motion.div>
                )}
              </div>
            </Card>

            {/* Model Recommendations */}
            <Card className="p-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Recommended Models</h4>
                
                <div className="space-y-3">
                  {result.recommendations.map((rec, index) => (
                    <motion.div
                      key={`${rec.provider}-${rec.model}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className={cn(
                          'p-4 cursor-pointer transition-all hover:shadow-md',
                          selectedModel?.model === rec.model && 'ring-2 ring-purple-600'
                        )}
                        onClick={() => handleModelSelect(rec)}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                'px-2 py-1 rounded-md text-xs font-medium',
                                providerColors[rec.provider]
                              )}>
                                {rec.provider.toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold">{rec.displayName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {rec.model}
                                </p>
                              </div>
                            </div>

                            {rec.badge && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                              >
                                <Badge 
                                  className={cn(
                                    'text-white border-0',
                                    getBadgeColor(rec.badge)
                                  )}
                                >
                                  {React.createElement(getBadgeIcon(rec.badge)!, { 
                                    className: 'h-3 w-3 mr-1' 
                                  })}
                                  {rec.badge}
                                </Badge>
                              </motion.div>
                            )}
                          </div>

                          {/* Scores */}
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Quality</span>
                                <span className="font-medium">{rec.scores.quality}/10</span>
                              </div>
                              <Progress value={rec.scores.quality * 10} className="h-1" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Speed</span>
                                <span className="font-medium">{rec.scores.speed}/10</span>
                              </div>
                              <Progress value={rec.scores.speed * 10} className="h-1" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Value</span>
                                <span className="font-medium">{rec.scores.cost}/10</span>
                              </div>
                              <Progress value={rec.scores.cost * 10} className="h-1" />
                            </div>
                          </div>

                          {/* Cost Breakdown */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="text-sm text-muted-foreground">
                              Estimated Cost
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                {formatCost(rec.estimatedCost.total)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatCost(rec.estimatedCost.prompt)} prompt + {formatCost(rec.estimatedCost.completion)} completion
                              </p>
                            </div>
                          </div>

                          {/* Reasoning */}
                          {rec.reasoning.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-2">
                              {rec.reasoning.map((reason, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {reason}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Use Selected Model Button */}
                {selectedModel && onModelSelect && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Button 
                      className="w-full"
                      onClick={() => onModelSelect(selectedModel.provider, selectedModel.model)}
                    >
                      Use {selectedModel.displayName}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}