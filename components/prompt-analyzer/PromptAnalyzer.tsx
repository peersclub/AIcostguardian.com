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
  Cpu,
  Layers,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw
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
  openai: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400',
  anthropic: 'from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-400',
  google: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
  xai: 'from-purple-500/20 to-violet-500/20 border-purple-500/30 text-purple-400',
  perplexity: 'from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-400',
};

const providerLogos = {
  openai: '🟢',
  anthropic: '🟠',
  google: '🔵',
  xai: '🟣',
  perplexity: '🔴',
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
  const [comparisonModels, setComparisonModels] = useState<ModelRecommendation[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const analyzer = useMemo(() => new Analyzer(), []);

  const handleAnalyze = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setSelectedModel(null);
    setComparisonModels([]);

    // Simulate async analysis with animation
    await new Promise(resolve => setTimeout(resolve, 800));

    const analysisResult = analyzer.analyze(prompt);
    setResult(analysisResult);
    
    // Auto-select best recommendation
    if (analysisResult.recommendations.length > 0) {
      setSelectedModel(analysisResult.recommendations[0]);
      // Add first 3 for comparison
      setComparisonModels(analysisResult.recommendations.slice(0, 3));
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
    if (cost < 0.001) return `$${(cost * 1000).toFixed(4)}m`;
    if (cost < 0.01) return `$${(cost * 100).toFixed(3)}¢`;
    return `$${cost.toFixed(4)}`;
  };

  const getComplexityColor = (level: ComplexityLevel) => {
    const colors = [
      '',
      'from-green-500 to-emerald-500',
      'from-blue-500 to-cyan-500',
      'from-yellow-500 to-amber-500',
      'from-orange-500 to-red-500',
      'from-purple-500 to-pink-500',
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

  const getCostDifference = (model: ModelRecommendation) => {
    if (!selectedModel || model.model === selectedModel.model) return null;
    const diff = model.estimatedCost.total - selectedModel.estimatedCost.total;
    const percentage = (diff / selectedModel.estimatedCost.total) * 100;
    
    if (diff > 0) {
      return {
        icon: ArrowUpRight,
        color: 'text-red-400',
        text: `+${percentage.toFixed(0)}%`
      };
    } else if (diff < 0) {
      return {
        icon: ArrowDownRight,
        color: 'text-green-400',
        text: `${percentage.toFixed(0)}%`
      };
    }
    return {
      icon: Minus,
      color: 'text-gray-400',
      text: '0%'
    };
  };

  const handleReset = () => {
    setPrompt('');
    setResult(null);
    setSelectedModel(null);
    setComparisonModels([]);
    setShowComparison(false);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Futuristic Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700 overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-transparent to-purple-600" />
            <motion.div
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              className="absolute inset-0"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                backgroundSize: '60px 60px',
              }}
            />
          </div>

          <div className="relative p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg blur-lg opacity-50 animate-pulse" />
                  <div className="relative bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg p-2">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Model Intelligence Engine</h3>
                  <p className="text-xs text-gray-400">Paste your prompt to find the perfect model</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {result && (
                  <Badge className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-300">
                    <Activity className="h-3 w-3 mr-1" />
                    {result.confidence > 0.8 ? 'High' : result.confidence > 0.6 ? 'Medium' : 'Low'} Confidence
                  </Badge>
                )}
                {(prompt || result) && (
                  <Button
                    onClick={handleReset}
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:border-violet-500/50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                )}
              </div>
            </div>

            <div className="relative">
              <Textarea
                placeholder="Paste or type your prompt here... The AI will analyze it and recommend the best model for optimal performance and cost."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] resize-none bg-gray-800/50 border-gray-600 text-white placeholder-gray-500 focus:border-violet-500 focus:ring-violet-500/20"
              />
              {prompt && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute bottom-2 right-2"
                >
                  <Badge className="bg-gray-800/80 border-gray-600 text-gray-300 text-xs">
                    {prompt.length} chars
                  </Badge>
                </motion.div>
              )}
            </div>

            {/* Quick Stats */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-2"
              >
                <Badge className="bg-gray-800/50 border-gray-700 text-gray-300 p-2 justify-start">
                  <Clock className="h-3 w-3 mr-2 text-violet-400" />
                  ~{result.tokens.estimated} tokens
                </Badge>
                <Badge className="bg-gray-800/50 border-gray-700 text-gray-300 p-2 justify-start">
                  {React.createElement(contentTypeIcons[result.contentType], { 
                    className: 'h-3 w-3 mr-2 text-blue-400' 
                  })}
                  {result.contentType.replace(/_/g, ' ')}
                </Badge>
                <Badge className="bg-gray-800/50 border-gray-700 text-gray-300 p-2 justify-start">
                  <Layers className="h-3 w-3 mr-2 text-green-400" />
                  Complexity: {result.complexity}/5
                </Badge>
                <Badge className="bg-gray-800/50 border-gray-700 text-gray-300 p-2 justify-start">
                  <Target className="h-3 w-3 mr-2 text-orange-400" />
                  {result.recommendations.length} models
                </Badge>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Analysis Results */}
      <AnimatePresence mode="wait">
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 rounded-full border-4 border-violet-500/20 border-t-violet-500"
              />
              <Brain className="absolute inset-0 m-auto w-8 h-8 text-violet-400" />
            </div>
            <p className="mt-4 text-gray-400 font-medium">Analyzing your prompt...</p>
            <p className="text-xs text-gray-500 mt-1">Finding the perfect model match</p>
          </motion.div>
        )}

        {result && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Analysis Summary with Gradient */}
            <Card className="bg-gradient-to-br from-violet-900/20 via-purple-900/20 to-pink-900/20 border-violet-500/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-purple-600/5" />
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-violet-300 mb-1">Analysis Complete</h4>
                    <p className="text-lg font-semibold text-white">{result.summary}</p>
                  </div>
                  <div className={cn(
                    'px-3 py-1 rounded-full bg-gradient-to-r text-white text-xs font-bold',
                    getComplexityColor(result.complexity)
                  )}>
                    Level {result.complexity}
                  </div>
                </div>

                {/* Feature Pills */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(result.features).map(([key, value]) => {
                    if (typeof value === 'boolean' && value) {
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-1.5 px-3 py-1 bg-gray-800/50 rounded-full border border-gray-700"
                        >
                          <Check className="h-3 w-3 text-green-400" />
                          <span className="text-xs text-gray-300 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </motion.div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </Card>

            {/* Toggle Comparison View */}
            <div className="flex justify-center">
              <Button
                onClick={() => setShowComparison(!showComparison)}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
              >
                <Layers className="w-4 h-4 mr-2" />
                {showComparison ? 'Hide' : 'Show'} Model Comparison
              </Button>
            </div>

            {/* Model Recommendations Grid */}
            {!showComparison ? (
              <div className="grid gap-4">
                {result.recommendations.map((rec, index) => (
                  <motion.div
                    key={`${rec.provider}-${rec.model}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Card
                      className={cn(
                        'relative overflow-hidden cursor-pointer transition-all',
                        'bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700',
                        'hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10',
                        selectedModel?.model === rec.model && 'border-violet-500 shadow-lg shadow-violet-500/20'
                      )}
                      onClick={() => handleModelSelect(rec)}
                    >
                      {/* Gradient accent */}
                      <div className={cn(
                        'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
                        providerColors[rec.provider].split(' ')[0].replace('from-', 'from-').replace('/20', ''),
                        providerColors[rec.provider].split(' ')[1].replace('to-', 'to-').replace('/20', '')
                      )} />

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'text-2xl p-2 rounded-lg bg-gradient-to-br',
                              providerColors[rec.provider]
                            )}>
                              {providerLogos[rec.provider]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-white text-lg">{rec.displayName}</p>
                                {rec.badge && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                                  >
                                    <Badge className={cn('text-white border-0', getBadgeColor(rec.badge))}>
                                      {React.createElement(getBadgeIcon(rec.badge)!, { 
                                        className: 'h-3 w-3 mr-1' 
                                      })}
                                      {rec.badge}
                                    </Badge>
                                  </motion.div>
                                )}
                              </div>
                              <p className="text-sm text-gray-400 font-mono">{rec.model}</p>
                            </div>
                          </div>

                          {/* Cost Display */}
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                              {formatCost(rec.estimatedCost.total)}
                            </div>
                            <div className="text-xs text-gray-400">estimated cost</div>
                          </div>
                        </div>

                        {/* Scores Visualization */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-400">Quality</span>
                              <span className="text-xs font-bold text-white">{rec.scores.quality}/10</span>
                            </div>
                            <Progress 
                              value={rec.scores.quality * 10} 
                              className="h-2 bg-gray-800"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-400">Speed</span>
                              <span className="text-xs font-bold text-white">{rec.scores.speed}/10</span>
                            </div>
                            <Progress 
                              value={rec.scores.speed * 10} 
                              className="h-2 bg-gray-800"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-400">Value</span>
                              <span className="text-xs font-bold text-white">{rec.scores.cost}/10</span>
                            </div>
                            <Progress 
                              value={rec.scores.cost * 10} 
                              className="h-2 bg-gray-800"
                            />
                          </div>
                        </div>

                        {/* Reasoning Tags */}
                        <div className="flex flex-wrap gap-1">
                          {rec.reasoning.map((reason, i) => (
                            <Badge 
                              key={i} 
                              className="bg-gray-800/50 border-gray-700 text-gray-300 text-xs"
                            >
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Enhanced Comparison View */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <div className="bg-gradient-to-br from-violet-900/10 to-purple-900/10 rounded-2xl p-6 border border-violet-500/20">
                  <h4 className="text-lg font-bold text-white mb-6 text-center">Model Comparison</h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {comparisonModels.map((model, index) => {
                      const costDiff = getCostDifference(model);
                      const isSelected = selectedModel?.model === model.model;
                      const isBest = index === 0;
                      
                      return (
                        <motion.div
                          key={`${model.provider}-${model.model}`}
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ 
                            delay: index * 0.15,
                            type: 'spring',
                            stiffness: 300,
                            damping: 20
                          }}
                          whileHover={{ y: -8, transition: { duration: 0.2 } }}
                          className={cn(
                            'relative',
                            isBest && 'lg:scale-105 z-10'
                          )}
                        >
                          <Card 
                            className={cn(
                              'relative h-full cursor-pointer transition-all duration-300',
                              'bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur',
                              'border-2',
                              isSelected 
                                ? 'border-violet-500 shadow-2xl shadow-violet-500/30' 
                                : isBest 
                                  ? 'border-yellow-500/50 shadow-xl shadow-yellow-500/10'
                                  : 'border-gray-700 hover:border-violet-500/30',
                            )}
                            onClick={() => handleModelSelect(model)}
                          >
                            {/* Top Badge */}
                            {(isSelected || isBest) && (
                              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                                <Badge className={cn(
                                  'text-white border-0 px-4 py-1 font-bold',
                                  isSelected 
                                    ? 'bg-gradient-to-r from-violet-600 to-purple-600' 
                                    : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                )}>
                                  {isSelected ? '✓ Selected' : '⭐ Recommended'}
                                </Badge>
                              </div>
                            )}

                            {/* Provider Accent Bar */}
                            <div className={cn(
                              'absolute top-0 left-0 right-0 h-1.5 rounded-t-lg bg-gradient-to-r',
                              providerColors[model.provider].split(' ')[0].replace('from-', 'from-').replace('/20', ''),
                              providerColors[model.provider].split(' ')[1].replace('to-', 'to-').replace('/20', '')
                            )} />

                            <div className="p-6 space-y-5">
                              {/* Header with Logo */}
                              <div className="text-center space-y-3">
                                <motion.div 
                                  className="text-4xl"
                                  animate={{ rotate: [0, 5, -5, 0] }}
                                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                >
                                  {providerLogos[model.provider]}
                                </motion.div>
                                <div>
                                  <h4 className="font-bold text-white text-lg">{model.displayName}</h4>
                                  <p className="text-xs text-gray-400 font-mono mt-1">{model.model}</p>
                                </div>
                                {model.badge && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500 }}
                                  >
                                    <Badge className={cn('text-white border-0', getBadgeColor(model.badge))}>
                                      {React.createElement(getBadgeIcon(model.badge)!, { 
                                        className: 'h-3 w-3 mr-1' 
                                      })}
                                      {model.badge}
                                    </Badge>
                                  </motion.div>
                                )}
                              </div>

                              {/* Cost Card */}
                              <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl p-4 border border-gray-700">
                                <div className="text-center space-y-2">
                                  <p className="text-xs text-gray-400 uppercase tracking-wider">Estimated Cost</p>
                                  <div className="text-3xl font-bold text-white">
                                    {formatCost(model.estimatedCost.total)}
                                  </div>
                                  {costDiff && (
                                    <div className={cn('flex items-center justify-center gap-1', costDiff.color)}>
                                      <costDiff.icon className="h-4 w-4" />
                                      <span className="text-sm font-bold">{costDiff.text}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Visual Score Bars */}
                              <div className="space-y-3">
                                {[
                                  { label: 'Quality', score: model.scores.quality, color: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
                                  { label: 'Speed', score: model.scores.speed, color: 'bg-gradient-to-r from-green-500 to-emerald-500' },
                                  { label: 'Value', score: model.scores.cost, color: 'bg-gradient-to-r from-yellow-500 to-orange-500' },
                                  { label: 'Overall', score: model.scores.overall, color: 'bg-gradient-to-r from-violet-500 to-purple-500' }
                                ].map((metric) => (
                                  <div key={metric.label} className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-gray-400">{metric.label}</span>
                                      <span className="text-xs font-bold text-white">{metric.score}/10</span>
                                    </div>
                                    <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${metric.score * 10}%` }}
                                        transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                                        className={cn('h-full rounded-full', metric.color)}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Key Features */}
                              <div className="space-y-2">
                                <p className="text-xs text-gray-400 uppercase tracking-wider text-center">Key Strengths</p>
                                <div className="flex flex-wrap gap-1 justify-center">
                                  {model.reasoning.slice(0, 2).map((reason, i) => (
                                    <Badge 
                                      key={i} 
                                      className="bg-gray-800/50 border-gray-700 text-gray-300 text-xs"
                                    >
                                      {reason}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Action Button */}
                              <Button
                                className={cn(
                                  'w-full font-semibold transition-all',
                                  isSelected 
                                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white' 
                                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleModelSelect(model);
                                }}
                              >
                                {isSelected ? (
                                  <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Currently Selected
                                  </>
                                ) : (
                                  <>
                                    Select This Model
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                  </>
                                )}
                              </Button>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Use Selected Model CTA */}
            {selectedModel && onModelSelect && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8"
                  onClick={() => onModelSelect(selectedModel.provider, selectedModel.model)}
                >
                  Use {selectedModel.displayName}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}