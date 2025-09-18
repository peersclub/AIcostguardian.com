'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ProjectSettings } from './ProjectSettings';
import {
  Settings,
  ChevronDown,
  ChevronUp,
  Target,
  Brain,
  Users,
  Folder,
  Edit3,
  Lightbulb
} from 'lucide-react';

interface ThreadContext {
  id: string;
  projectName?: string;
  projectType: string;
  systemPrompt?: string;
  instructions?: string;
  defaultModel?: string;
  defaultProvider?: string;
  category?: string;
  keywords: string[];
  projectGoals?: string;
  expectedOutcome?: string;
  version: number;
  lastEditedAt?: string;
  lastEditor?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface ContextPanelProps {
  threadId: string;
  className?: string;
}

export function ContextPanel({ threadId, className = '' }: ContextPanelProps) {
  const [context, setContext] = useState<ThreadContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadContext();
  }, [threadId]);

  const loadContext = async () => {
    if (!threadId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/aioptimise/threads/${threadId}/context`);

      if (response.ok) {
        const data = await response.json();
        setContext(data);
      } else if (response.status === 404) {
        // No context exists yet - this is normal for new threads
        setContext(null);
      }
    } catch (error) {
      console.error('Error loading context:', error);
      setContext(null);
    } finally {
      setLoading(false);
    }
  };

  const formatProjectType = (type: string) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getProjectTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'GENERAL': '💬',
      'DEVELOPMENT': '💻',
      'RESEARCH': '🔬',
      'CONTENT_CREATION': '✍️',
      'ANALYSIS': '📊',
      'BRAINSTORMING': '💡',
      'SUPPORT': '🎧',
      'TRAINING': '🎓',
      'CUSTOM': '⚙️'
    };
    return icons[type] || '📝';
  };

  if (loading) {
    return (
      <Card className={`w-80 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Project Context
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!context) {
    return (
      <Card className={`w-80 ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Project Context
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground text-sm">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No project context configured</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setShowSettings(true)}
            >
              Set up project
            </Button>
          </div>
        </CardContent>
        <ProjectSettings
          threadId={threadId}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSave={(newContext) => {
            setContext(newContext);
            setShowSettings(false);
          }}
        />
      </Card>
    );
  }

  return (
    <>
      <Card className={`w-80 ${className}`}>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="text-base">{getProjectTypeIcon(context.projectType)}</span>
                  <span>
                    {context.projectName || 'Project Context'}
                  </span>
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSettings(true);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {formatProjectType(context.projectType)}
                </Badge>
                {context.category && (
                  <Badge variant="outline" className="text-xs">
                    {context.category}
                  </Badge>
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-80">
                <div className="space-y-4">
                  {/* AI Configuration */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Brain className="h-3 w-3" />
                      AI Configuration
                    </div>
                    <div className="pl-5 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Model:</span>
                        <span className="text-foreground">{context.defaultModel || 'Default'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Provider:</span>
                        <span className="text-foreground">{context.defaultProvider || 'OpenAI'}</span>
                      </div>
                    </div>
                  </div>

                  {/* System Prompt */}
                  {context.systemPrompt && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Edit3 className="h-3 w-3" />
                        System Prompt
                      </div>
                      <div className="pl-5 text-xs text-foreground bg-muted/50 rounded p-2 font-mono">
                        {context.systemPrompt.length > 100
                          ? `${context.systemPrompt.substring(0, 100)}...`
                          : context.systemPrompt
                        }
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  {context.instructions && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Target className="h-3 w-3" />
                        Instructions
                      </div>
                      <div className="pl-5 text-xs text-foreground">
                        {context.instructions.length > 120
                          ? `${context.instructions.substring(0, 120)}...`
                          : context.instructions
                        }
                      </div>
                    </div>
                  )}

                  {/* Project Goals */}
                  {context.projectGoals && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Target className="h-3 w-3" />
                        Goals
                      </div>
                      <div className="pl-5 text-xs text-foreground">
                        {context.projectGoals.length > 120
                          ? `${context.projectGoals.substring(0, 120)}...`
                          : context.projectGoals
                        }
                      </div>
                    </div>
                  )}

                  {/* Keywords */}
                  {context.keywords.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <span className="h-3 w-3 text-center">#</span>
                        Keywords
                      </div>
                      <div className="pl-5 flex flex-wrap gap-1">
                        {context.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-indigo-500/30 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Version Info */}
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Version {context.version}</span>
                      {context.lastEditedAt && (
                        <span>
                          {new Date(context.lastEditedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <ProjectSettings
        threadId={threadId}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={(newContext) => {
          setContext(newContext);
          setShowSettings(false);
        }}
      />
    </>
  );
}