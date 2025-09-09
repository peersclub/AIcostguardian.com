'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  RefreshCw, 
  MoreVertical,
  Bot,
  User,
  Edit,
  Trash2,
  Flag,
  Download,
  Share2,
  Code,
  FileText,
  MessageSquare,
  Sparkles,
  Brain,
  Search,
  PenTool
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAIProviderLogo } from '@/components/ui/ai-logos';
import Markdown from 'react-markdown';

interface MessageEnhancedProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
    selectedModel?: string;
    selectedProvider?: string;
    cost?: number;
    totalTokens?: number;
    latency?: number;
    feedback?: 'positive' | 'negative' | null;
    status?: 'sending' | 'sent' | 'processing' | 'streaming' | 'completed' | 'failed' | 'cancelled';
    errorMessage?: string;
    images?: string[];
    contentType?: string;
  };
  onRegenerate: (model?: { provider: string; model: string }) => void;
  onFeedback: (type: 'positive' | 'negative') => void;
  onCopy: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isStreaming?: boolean;
  mode?: 'standard' | 'focus' | 'coding' | 'research' | 'creative';
}

const getContentTypeIcon = (contentType?: string) => {
  switch (contentType) {
    case 'CODE': return <Code className="h-4 w-4" />;
    case 'CREATIVE': return <PenTool className="h-4 w-4" />;
    case 'ANALYSIS': return <Brain className="h-4 w-4" />;
    case 'RESEARCH': return <Search className="h-4 w-4" />;
    default: return <MessageSquare className="h-4 w-4" />;
  }
};

export function MessageEnhanced({
  message,
  onRegenerate,
  onFeedback,
  onCopy,
  onEdit,
  onDelete,
  isStreaming = false,
  mode = 'standard',
}: MessageEnhancedProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [showRegenerateMenu, setShowRegenerateMenu] = useState(false);

  const isUser = message.role === 'user';
  const isFailed = message.status === 'failed';
  const isProcessing = message.status === 'processing' || message.status === 'streaming';

  const providerLogo = message.selectedProvider 
    ? getAIProviderLogo(message.selectedProvider) 
    : null;

  return (
    <div 
      className={cn(
        "group flex gap-3 py-4 px-2 rounded-lg transition-all duration-200",
        isUser ? "flex-row-reverse" : "flex-row",
        mode === 'focus' && "max-w-3xl mx-auto",
        "hover:bg-muted/30"
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="relative">
            <Avatar className="h-8 w-8 bg-gradient-to-r from-violet-500/20 to-purple-500/20">
              <AvatarFallback>
                {providerLogo ? (
                  providerLogo
                ) : (
                  <Bot className="h-4 w-4 text-violet-400" />
                )}
              </AvatarFallback>
            </Avatar>
            {isProcessing && (
              <div className="absolute -bottom-1 -right-1 h-3 w-3">
                <div className="h-full w-full rounded-full bg-green-500 animate-pulse" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn(
        "flex-1 space-y-2",
        isUser && "flex flex-col items-end"
      )}>
        {/* Header */}
        {mode !== 'focus' && (
          <div className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground",
            isUser && "flex-row-reverse"
          )}>
            {message.contentType && (
              <div className="flex items-center gap-1">
                {getContentTypeIcon(message.contentType)}
              </div>
            )}
            {message.selectedModel && (
              <span className="font-mono">
                {message.selectedModel}
              </span>
            )}
            {message.latency && (
              <span>{message.latency}ms</span>
            )}
            {message.cost && (
              <span>${message.cost.toFixed(4)}</span>
            )}
            {message.totalTokens && (
              <span>{message.totalTokens.toLocaleString()} tokens</span>
            )}
          </div>
        )}

        {/* Message bubble */}
        <Card className={cn(
          "relative p-3 max-w-[85%] transition-all duration-200",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-card",
          isFailed && "border-red-500 bg-red-50/5",
          isProcessing && "border-primary/50"
        )}>
          {/* Error message */}
          {isFailed && message.errorMessage && (
            <div className="mb-2 p-2 rounded bg-red-100/10 text-red-600 text-sm">
              {message.errorMessage}
            </div>
          )}

          {/* Images */}
          {message.images && message.images.length > 0 && (
            <div className="mb-2 grid grid-cols-2 gap-2">
              {message.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Uploaded image ${idx + 1}`}
                  className="rounded-lg w-full h-32 object-cover"
                />
              ))}
            </div>
          )}

          {/* Content */}
          {isProcessing && !message.content ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          ) : (
            <div className={cn(
              "prose prose-sm max-w-none",
              isUser ? "prose-invert" : "dark:prose-invert",
              mode === 'coding' && "font-mono"
            )}>
              {mode === 'coding' || message.contentType === 'CODE' ? (
                <pre className="bg-muted/50 rounded-lg p-3 overflow-x-auto">
                  <code className="text-sm font-mono">
                    {message.content}
                  </code>
                </pre>
              ) : (
                <Markdown
                  components={{
                    code({ className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !match;
                      return !isInline ? (
                        <pre className="bg-muted/50 rounded-lg p-3 overflow-x-auto my-2">
                          <code className="text-sm font-mono" {...props}>
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code className="bg-muted/50 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content}
                </Markdown>
              )}
            </div>
          )}

          {/* Feedback indicator */}
          {message.feedback && (
            <div className={cn(
              "absolute -top-2 -right-2 p-1 rounded-full",
              message.feedback === 'positive' 
                ? "bg-green-500 text-white" 
                : "bg-red-500 text-white"
            )}>
              {message.feedback === 'positive' ? (
                <ThumbsUp className="h-3 w-3" />
              ) : (
                <ThumbsDown className="h-3 w-3" />
              )}
            </div>
          )}
        </Card>

        {/* Actions */}
        {!isUser && mode !== 'focus' && (
          <div className={cn(
            "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            showFeedback && "opacity-100"
          )}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFeedback('positive')}
              className={cn(
                "h-8 w-8 p-0",
                message.feedback === 'positive' && "text-green-500"
              )}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFeedback('negative')}
              className={cn(
                "h-8 w-8 p-0",
                message.feedback === 'negative' && "text-red-500"
              )}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopy}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-gray-900 border-gray-800">
                <DropdownMenuLabel className="text-gray-400">Regenerate with</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem onClick={() => onRegenerate()} className="hover:bg-gray-800 text-gray-200 cursor-pointer focus:bg-gray-800 focus:text-gray-100">
                  <Bot className="h-4 w-4 mr-2" />
                  Same model
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRegenerate({ provider: 'openai', model: 'gpt-4o' })} className="hover:bg-gray-800 text-gray-200 cursor-pointer focus:bg-gray-800 focus:text-gray-100">
                  GPT-4o
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRegenerate({ provider: 'anthropic', model: 'claude-3.5-sonnet' })} className="hover:bg-gray-800 text-gray-200 cursor-pointer focus:bg-gray-800 focus:text-gray-100">
                  Claude 3.5 Sonnet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRegenerate({ provider: 'google', model: 'gemini-1.5-pro' })} className="hover:bg-gray-800 text-gray-200 cursor-pointer focus:bg-gray-800 focus:text-gray-100">
                  Gemini 1.5 Pro
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-gray-900 border-gray-800">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit} className="hover:bg-gray-800 text-gray-200 cursor-pointer focus:bg-gray-800 focus:text-gray-100">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => {}} className="hover:bg-gray-800 text-gray-200 cursor-pointer focus:bg-gray-800 focus:text-gray-100">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}} className="hover:bg-gray-800 text-gray-200 cursor-pointer focus:bg-gray-800 focus:text-gray-100">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowFeedback(!showFeedback)} className="hover:bg-gray-800 text-gray-200 cursor-pointer focus:bg-gray-800 focus:text-gray-100">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add feedback
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem onClick={() => {}} className="hover:bg-gray-800 text-gray-200 cursor-pointer focus:bg-gray-800 focus:text-gray-100">
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="hover:bg-red-900/30 text-red-400 hover:text-red-300 cursor-pointer focus:bg-red-900/30 focus:text-red-300">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Feedback form */}
        {showFeedback && (
          <Card className="p-3 space-y-2">
            <Textarea
              placeholder="Add your feedback..."
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              className="min-h-[60px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowFeedback(false);
                  setFeedbackComment('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  // Submit feedback
                  setShowFeedback(false);
                  setFeedbackComment('');
                }}
              >
                Submit
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}