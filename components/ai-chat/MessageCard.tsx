'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  MoreVertical,
  Edit2,
  Trash2,
  RefreshCw,
  Check,
  User,
  Bot
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MessageCardProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    model?: {
      provider: string;
      name: string;
      displayName: string;
    };
    metrics?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      cost: number;
      latency: number;
    };
    status?: 'sending' | 'streaming' | 'complete' | 'error';
    error?: string;
  };
  onCopy?: (content: string) => void;
  onRegenerate?: () => void;
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
  onReaction?: (id: string, reaction: 'like' | 'dislike') => void;
  userImage?: string;
  userName?: string;
}

export function MessageCard({
  message,
  onCopy,
  onRegenerate,
  onEdit,
  onDelete,
  onReaction,
  userImage,
  userName = 'You'
}: MessageCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [reaction, setReaction] = useState<'like' | 'dislike' | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (onCopy) {
      onCopy(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReaction = (type: 'like' | 'dislike') => {
    const newReaction = reaction === type ? null : type;
    setReaction(newReaction);
    if (onReaction && newReaction) {
      onReaction(message.id, newReaction);
    }
  };

  const handleSaveEdit = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  const formatCost = (cost: number): string => {
    if (cost < 0.001) return `$${(cost * 1000).toFixed(4)}m`;
    if (cost < 0.01) return `$${cost.toFixed(5)}`;
    return `$${cost.toFixed(4)}`;
  };

  const formatLatency = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "group relative",
        message.role === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'
      )}
    >
      <div className={cn(
        "flex gap-3",
        message.role === 'user' && 'flex-row-reverse'
      )}>
        {/* Avatar */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          {message.role === 'user' ? (
            <>
              <AvatarImage src={userImage} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </>
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
              <Bot className="h-4 w-4 text-background" />
            </AvatarFallback>
          )}
        </Avatar>

        {/* Message Content */}
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className={cn(
            "flex items-center gap-2",
            message.role === 'user' && 'justify-end'
          )}>
            <span className="font-medium text-sm">
              {message.role === 'user' ? userName : message.model?.displayName || 'Assistant'}
            </span>
            <span className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString()}
            </span>
            {message.status === 'streaming' && (
              <Badge variant="outline" className="text-xs">
                Generating...
              </Badge>
            )}
            {message.status === 'error' && (
              <Badge variant="destructive" className="text-xs">
                Error
              </Badge>
            )}
          </div>

          {/* Message Body */}
          <Card className={cn(
            "p-4",
            message.role === 'user' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted',
            message.status === 'error' && 'border-destructive'
          )}>
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[100px] bg-background"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEdit}>
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(message.content);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.status === 'streaming' && (
                  <span className="inline-block w-2 h-4 bg-foreground animate-pulse" />
                )}
              </div>
            )}

            {/* Metrics */}
            {message.metrics && (
              <div className="mt-3 pt-3 border-t flex items-center gap-4 text-xs">
                <span className="text-green-600 dark:text-green-400">
                  {formatCost(message.metrics.cost)}
                </span>
                <span className="text-muted-foreground">
                  {message.metrics.totalTokens} tokens
                </span>
                <span className="text-muted-foreground">
                  {formatLatency(message.metrics.latency)}
                </span>
              </div>
            )}
          </Card>

          {/* Actions */}
          <div className={cn(
            "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
            message.role === 'user' && 'justify-end'
          )}>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>

            {message.role === 'assistant' && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "h-8 w-8",
                    reaction === 'like' && 'text-green-500'
                  )}
                  onClick={() => handleReaction('like')}
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "h-8 w-8",
                    reaction === 'dislike' && 'text-red-500'
                  )}
                  onClick={() => handleReaction('dislike')}
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
                {onRegenerate && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={onRegenerate}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={message.role === 'user' ? 'end' : 'start'}>
                {message.role === 'user' && onEdit && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(message.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.div>
  );
}