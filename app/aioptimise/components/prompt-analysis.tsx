import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Code, 
  FileText, 
  Zap, 
  TrendingUp,
  RefreshCw,
  Settings,
  Info
} from 'lucide-react';

interface PromptAnalysisProps {
  analysis: {
    complexity?: string;
    contentType?: string;
    domain?: string;
    hasCode?: boolean;
    estimatedTokens?: number;
    selectedModel?: { provider: string; model: string };
    modelReason?: string;
  } | null;
  onOverrideModel?: () => void;
  overrideCount?: number;
}

export function PromptAnalysis({ analysis, onOverrideModel, overrideCount = 0 }: PromptAnalysisProps) {
  if (!analysis) return null;

  const getComplexityColor = (complexity?: string) => {
    switch (complexity) {
      case 'SIMPLE': return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'MODERATE': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'COMPLEX': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'EXPERT': return 'bg-red-500/10 text-red-400 border-red-500/30';
      default: return 'bg-muted/10 text-muted-foreground border-muted/30';
    }
  };

  const getContentTypeIcon = (contentType?: string) => {
    switch (contentType) {
      case 'CODE': return <Code className="w-4 h-4" />;
      case 'CREATIVE': return <Brain className="w-4 h-4" />;
      case 'ANALYSIS': return <TrendingUp className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-xl border-border p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Brain className="w-4 h-4 text-violet-400" />
          Prompt Analysis
        </h3>
        {overrideCount > 0 && (
          <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
            {overrideCount} override{overrideCount > 1 ? 's' : ''} this session
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        {/* Complexity */}
        {analysis.complexity && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Complexity</span>
            <Badge className={`${getComplexityColor(analysis.complexity)} text-xs`}>
              {analysis.complexity}
            </Badge>
          </div>
        )}

        {/* Content Type */}
        {analysis.contentType && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Type</span>
            <div className="flex items-center gap-1">
              {getContentTypeIcon(analysis.contentType)}
              <span className="text-xs text-foreground">{analysis.contentType}</span>
            </div>
          </div>
        )}

        {/* Domain */}
        {analysis.domain && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Domain</span>
            <span className="text-xs text-foreground">{analysis.domain}</span>
          </div>
        )}

        {/* Has Code */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Contains Code</span>
          <span className="text-xs text-foreground">{analysis.hasCode ? 'Yes' : 'No'}</span>
        </div>

        {/* Estimated Tokens */}
        {analysis.estimatedTokens && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Est. Tokens</span>
            <span className="text-xs text-foreground">{analysis.estimatedTokens.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Selected Model */}
      {analysis.selectedModel && (
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-foreground">Selected Model</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onOverrideModel}
              className="text-xs text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Override
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300 border-violet-500/30">
              {analysis.selectedModel.provider}
            </Badge>
            <span className="text-sm text-foreground font-mono">
              {analysis.selectedModel.model}
            </span>
          </div>

          {analysis.modelReason && (
            <div className="flex items-start gap-2 mt-2">
              <Info className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground italic">{analysis.modelReason}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}