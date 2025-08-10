'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Bot, 
  ThumbsUp, 
  ThumbsDown,
  RefreshCw,
  Copy,
  Edit,
  Star,
  Sparkles,
  DollarSign,
  Clock,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
    selectedModel?: string;
    selectedProvider?: string;
    recommendedModel?: string;
    modelReason?: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
    latency?: number;
    feedback?: 'positive' | 'negative' | null;
    rating?: number;
  };
  onRegenerate?: () => void;
  onFeedback?: (feedback: 'positive' | 'negative') => void;
}

export function MessageComponent({ message, onRegenerate, onFeedback }: MessageProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const isUser = message.role === 'user';
  
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      
      <div className={cn("flex-1 space-y-2", isUser && "items-end")}>
        <div className={cn("flex items-center gap-2", isUser && "justify-end")}>
          <span className="text-sm font-medium">
            {isUser ? "You" : "AI Assistant"}
          </span>
          {message.selectedModel && (
            <Badge variant="secondary" className="text-xs">
              {message.selectedProvider} - {message.selectedModel}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
        </div>
        
        <Card className={cn(
          "p-4",
          isUser && "bg-primary/5"
        )}>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          
          {!isUser && (
            <>
              {message.modelReason && (
                <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                  <div className="flex items-center gap-1 mb-1">
                    <Sparkles className="h-3 w-3" />
                    <span className="font-medium">Smart Selection</span>
                  </div>
                  {message.modelReason}
                </div>
              )}
              
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={handleCopy}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  
                  {onRegenerate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={onRegenerate}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Regenerate
                    </Button>
                  )}
                  
                  {onFeedback && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 px-2",
                          message.feedback === 'positive' && "text-green-600"
                        )}
                        onClick={() => onFeedback('positive')}
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 px-2",
                          message.feedback === 'negative' && "text-red-600"
                        )}
                        onClick={() => onFeedback('negative')}
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <Info className="h-3 w-3 mr-1" />
                  Details
                  {showDetails ? (
                    <ChevronUp className="h-3 w-3 ml-1" />
                  ) : (
                    <ChevronDown className="h-3 w-3 ml-1" />
                  )}
                </Button>
              </div>
              
              {showDetails && (
                <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Cost:</span>
                    <span className="font-mono">${message.cost.toFixed(5)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Latency:</span>
                    <span className="font-mono">{message.latency}ms</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Input:</span>
                    <span className="font-mono">{message.promptTokens} tokens</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Output:</span>
                    <span className="font-mono">{message.completionTokens} tokens</span>
                  </div>
                  
                  {message.recommendedModel && message.recommendedModel !== message.selectedModel && (
                    <div className="col-span-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                      <span className="text-yellow-700 dark:text-yellow-400">
                        Originally recommended: {message.recommendedModel}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}