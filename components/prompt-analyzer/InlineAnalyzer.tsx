'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  PromptAnalyzer as Analyzer, 
  type AnalysisResult 
} from '@/lib/prompt-analyzer/engine';

interface InlineAnalyzerProps {
  prompt: string;
  onModelRecommendation?: (provider: string, model: string, cost: number) => void;
  className?: string;
  compact?: boolean;
}

export function InlineAnalyzer({ 
  prompt, 
  onModelRecommendation,
  className,
  compact = false 
}: InlineAnalyzerProps) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzer] = useState(() => new Analyzer());

  useEffect(() => {
    if (!prompt.trim()) {
      setResult(null);
      return;
    }

    const timer = setTimeout(() => {
      const analysis = analyzer.analyze(prompt);
      setResult(analysis);
      
      // Auto-recommend best model
      if (analysis.recommendations.length > 0 && onModelRecommendation) {
        const best = analysis.recommendations[0];
        onModelRecommendation(
          best.provider,
          best.model,
          best.estimatedCost.total
        );
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [prompt, analyzer, onModelRecommendation]);

  if (!result) return null;

  const bestModel = result.recommendations[0];
  const savings = result.recommendations.length > 1 
    ? ((result.recommendations[result.recommendations.length - 1].estimatedCost.total - 
        bestModel.estimatedCost.total) / 
        result.recommendations[result.recommendations.length - 1].estimatedCost.total * 100)
    : 0;

  if (compact) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={cn('flex items-center gap-2 text-sm', className)}
        >
          <Brain className="h-4 w-4 text-purple-600" />
          <span className="text-muted-foreground">Best model:</span>
          <Badge variant="secondary">
            {bestModel.displayName}
          </Badge>
          <Badge variant="outline" className="text-green-600">
            ${bestModel.estimatedCost.total.toFixed(4)}
          </Badge>
          {savings > 0 && (
            <Badge variant="outline" className="text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Save {savings.toFixed(0)}%
            </Badge>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          'p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">AI Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {result.tokens.estimated} tokens
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {result.contentType.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>

        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Recommended:</span>
            <div className="flex items-center gap-2">
              <Badge className="text-xs">
                {bestModel.displayName}
              </Badge>
              <Badge variant="outline" className="text-xs text-green-600">
                ${bestModel.estimatedCost.total.toFixed(4)}
              </Badge>
            </div>
          </div>

          {result.recommendations.length > 1 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Alternative:</span>
              <span>
                {result.recommendations[1].displayName} 
                (${result.recommendations[1].estimatedCost.total.toFixed(4)})
              </span>
            </div>
          )}

          {savings > 0 && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Sparkles className="h-3 w-3" />
              <span>You're saving {savings.toFixed(0)}% with smart model selection!</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}