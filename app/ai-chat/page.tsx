'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Brain,
  Zap,
  DollarSign,
  Clock,
  TrendingDown,
  Info,
  Plus,
  Menu,
  Settings,
  History,
  Copy,
  RefreshCw,
  Mic,
  Paperclip,
  StopCircle,
  Check,
  AlertCircle,
  Loader2,
  Award,
  Bot,
  User,
  BarChart3,
  X,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from 'next-auth/react';
import { getAIProviderLogo } from '@/components/ui/ai-logos';
import { 
  PromptAnalyzer as Analyzer, 
  type AnalysisResult,
  type ModelRecommendation 
} from '@/lib/prompt-analyzer/engine';

// Message Interface
interface Message {
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
  analysis?: AnalysisResult;
  status?: 'sending' | 'streaming' | 'complete' | 'error';
  error?: string;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
  totalCost: number;
  totalTokens: number;
}

const providerColors = {
  openai: 'text-green-600 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
  anthropic: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
  google: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  xai: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
  perplexity: 'text-pink-600 bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800',
};

export default function AIChatInterface() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | undefined>(undefined);
  const [selectedModel, setSelectedModel] = useState<ModelRecommendation | null>(null);
  const [showAnalysisDetails, setShowAnalysisDetails] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [totalSessionCost, setTotalSessionCost] = useState(0);
  const [totalSessionTokens, setTotalSessionTokens] = useState(0);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const analyzer = useRef(new Analyzer());

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch available models based on configured API keys
  useEffect(() => {
    const fetchAvailableModels = async () => {
      try {
        const response = await fetch('/api/chat');
        if (response.ok) {
          const data = await response.json();
          setAvailableModels(data.models || []);
          
          // Update the analyzer with available models
          if (data.models && data.models.length > 0) {
            // Filter recommendations based on available models
            analyzer.current.availableModels = data.models.map((m: any) => m.id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch available models:', error);
      }
    };

    if (session) {
      fetchAvailableModels();
    }
  }, [session]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Analyze prompt as user types (debounced)
  useEffect(() => {
    if (!input.trim()) {
      setAnalysis(undefined);
      setSelectedModel(null);
      return;
    }

    const timer = setTimeout(() => {
      setIsAnalyzing(true);
      const result = analyzer.current.analyze(input);
      setAnalysis(result);
      
      // Auto-select best model
      if (result.recommendations.length > 0) {
        setSelectedModel(result.recommendations[0]);
      }
      
      setIsAnalyzing(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [input]);

  // Send message
  const handleSend = async () => {
    if (!input.trim() || !selectedModel || isStreaming) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      analysis,
      status: 'complete',
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    // Create assistant message
    const assistantMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      model: {
        provider: selectedModel.provider,
        name: selectedModel.model,
        displayName: selectedModel.displayName,
      },
      status: 'streaming',
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Make real API call
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          model: selectedModel.model,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
      }

      const data = await response.json();
      const fullResponse = data.response.content;
      
      // Stream the response character by character for better UX
      for (let i = 0; i <= fullResponse.length; i += 5) {
        await new Promise(resolve => setTimeout(resolve, 20));
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id
            ? { ...msg, content: fullResponse.slice(0, i) }
            : msg
        ));
      }

      // Update message with real metrics from API
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id
          ? {
              ...msg,
              content: fullResponse,
              status: 'complete',
              metrics: {
                promptTokens: data.response.usage.promptTokens,
                completionTokens: data.response.usage.completionTokens,
                totalTokens: data.response.usage.totalTokens,
                cost: data.response.usage.cost,
                latency: data.response.usage.latency,
              },
            }
          : msg
      ));

      // Update session totals with real costs
      setTotalSessionCost(prev => prev + data.response.usage.cost);
      setTotalSessionTokens(prev => prev + data.response.usage.totalTokens);

    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Update message with error
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id
          ? {
              ...msg,
              content: `Error: ${error.message}. Please check your API keys in Settings.`,
              status: 'error',
              error: error.message
            }
          : msg
      ));
    } finally {
      setIsStreaming(false);
      setAnalysis(undefined);
      setSelectedModel(null);
    }
  };


  // Format cost
  const formatCost = (cost: number): string => {
    if (cost < 0.001) return `$${(cost * 1000).toFixed(4)}m`;
    if (cost < 0.01) return `$${cost.toFixed(5)}`;
    return `$${cost.toFixed(4)}`;
  };

  // Format latency
  const formatLatency = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // New conversation
  const startNewConversation = () => {
    const newConvo: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Chat',
      lastMessage: '',
      timestamp: new Date(),
      messages: [],
      totalCost: 0,
      totalTokens: 0,
    };
    setCurrentConversation(newConvo);
    setMessages([]);
    setInput('');
    setTotalSessionCost(0);
    setTotalSessionTokens(0);
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

  return (
    <div className="flex h-screen bg-background">
      <TooltipProvider>
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-64 border-r bg-muted/30 flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b">
                <Button 
                  className="w-full justify-start gap-2"
                  variant="outline"
                  onClick={startNewConversation}
                >
                  <Plus className="h-4 w-4" />
                  New Chat
                </Button>
              </div>

              {/* Conversations List */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground px-2">Today</p>
                  {conversations.map(conv => (
                    <Button
                      key={conv.id}
                      variant={currentConversation?.id === conv.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start text-left"
                      onClick={() => {
                        setCurrentConversation(conv);
                        setMessages(conv.messages);
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                      <div className="flex-1 truncate">
                        <p className="font-medium text-sm truncate">{conv.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>

              {/* Sidebar Footer - Session Stats */}
              <div className="p-4 border-t space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Session Cost</span>
                    <span className="font-mono font-medium text-green-600">
                      {formatCost(totalSessionCost)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Tokens</span>
                    <span className="font-mono">{totalSessionTokens.toLocaleString()}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image || ''} />
                    <AvatarFallback>
                      {session?.user?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-sm">
                    <p className="font-medium truncate">{session?.user?.name}</p>
                    <p className="text-xs text-muted-foreground">Free Plan</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b px-4 py-3 flex items-center justify-between bg-background/95 backdrop-blur">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <h1 className="font-semibold">AI Cost Guardian</h1>
                <Badge variant="outline" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Smart Mode
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <History className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <BarChart3 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.length === 0 && (
                <div className="text-center py-20">
                  <div className="inline-flex p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full mb-4">
                    <Brain className="h-12 w-12 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">AI Cost Guardian Chat</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Start typing below and I'll automatically select the most cost-effective AI model for your needs
                  </p>
                  <div className="grid grid-cols-3 gap-4 mt-8 max-w-xl mx-auto">
                    <Card className="p-4 text-center">
                      <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">Save Costs</p>
                      <p className="text-xs text-muted-foreground">Up to 80% savings</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">Fast Response</p>
                      <p className="text-xs text-muted-foreground">Optimized routing</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">Smart Selection</p>
                      <p className="text-xs text-muted-foreground">AI-powered choice</p>
                    </Card>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <motion.div 
                  key={message.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  {/* User Message */}
                  {message.role === 'user' && (
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session?.user?.image || ''} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">You</span>
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                        
                        {/* Analysis Info for User Message */}
                        {message.analysis && (
                          <Card className="p-3 bg-muted/50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Brain className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium">Prompt Analysis</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {message.analysis.confidence > 0.8 ? 'High' : 
                                 message.analysis.confidence > 0.6 ? 'Medium' : 'Low'} Confidence
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-xs">
                              <div>
                                <p className="text-muted-foreground">Type</p>
                                <p className="font-medium capitalize">
                                  {message.analysis.contentType.replace(/_/g, ' ')}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Complexity</p>
                                <p className="font-medium">Level {message.analysis.complexity}/5</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Est. Tokens</p>
                                <p className="font-medium">{message.analysis.tokens.estimated}</p>
                              </div>
                            </div>
                          </Card>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Assistant Message */}
                  {message.role === 'assistant' && (
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
                          <Bot className="h-4 w-4 text-white" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {message.model && (
                            <div className="flex items-center gap-2">
                              {getAIProviderLogo(message.model.provider, 'w-4 h-4')}
                              <span className="font-medium">{message.model.displayName}</span>
                            </div>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          {message.status === 'streaming' && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Generating
                            </Badge>
                          )}
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          {message.status === 'streaming' && (
                            <span className="inline-block w-2 h-4 bg-foreground animate-pulse" />
                          )}
                        </div>
                        
                        {/* Metrics for Assistant Message */}
                        {message.metrics && (
                          <Card className="p-3 bg-muted/30">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3 text-green-600" />
                                  <span className="font-mono font-medium">
                                    {formatCost(message.metrics.cost)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-blue-600" />
                                  <span>{formatLatency(message.metrics.latency)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <BarChart3 className="h-3 w-3 text-purple-600" />
                                  <span>{message.metrics.totalTokens} tokens</span>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </Card>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4 bg-background/95 backdrop-blur">
            <div className="max-w-4xl mx-auto space-y-3">
              {/* Model Recommendations */}
              {analysis && analysis.recommendations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 overflow-x-auto pb-2"
                >
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    Recommended:
                  </span>
                  {analysis.recommendations.slice(0, 3).map((rec) => {
                    const Icon = getBadgeIcon(rec.badge);
                    return (
                      <Button
                        key={rec.model}
                        variant={selectedModel?.model === rec.model ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedModel(rec)}
                        className={cn(
                          "flex-shrink-0 gap-2",
                          selectedModel?.model === rec.model && "ring-2 ring-purple-500"
                        )}
                      >
                        {getAIProviderLogo(rec.provider, 'w-3 h-3')}
                        <span>{rec.displayName}</span>
                        <span className="font-mono text-xs opacity-70">
                          {formatCost(rec.estimatedCost.total)}
                        </span>
                        {rec.badge && Icon && (
                          <Badge variant="secondary" className="ml-1 px-1 py-0">
                            <Icon className="h-3 w-3" />
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowModelSelector(!showModelSelector)}
                  >
                    {showModelSelector ? 'Less' : 'More'}
                    <ChevronDown className={cn(
                      "h-3 w-3 ml-1 transition-transform",
                      showModelSelector && "rotate-180"
                    )} />
                  </Button>
                </motion.div>
              )}

              {/* Extended Model Selector */}
              <AnimatePresence>
                {showModelSelector && analysis && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-2"
                  >
                    {analysis.recommendations.map((rec) => (
                      <Card
                        key={rec.model}
                        className={cn(
                          "p-3 cursor-pointer transition-all",
                          selectedModel?.model === rec.model && "ring-2 ring-purple-500"
                        )}
                        onClick={() => setSelectedModel(rec)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getAIProviderLogo(rec.provider, 'w-4 h-4')}
                            <div>
                              <p className="font-medium text-sm">{rec.displayName}</p>
                              <p className="text-xs text-muted-foreground">{rec.provider}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-xs font-medium">
                              {formatCost(rec.estimatedCost.total)}
                            </p>
                            <div className="flex gap-1 mt-1">
                              <Progress value={rec.scores.quality * 10} className="w-12 h-1" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Field */}
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your message... (AI model will be selected automatically)"
                  className="min-h-[60px] max-h-[200px] pr-24 resize-none"
                  disabled={isStreaming}
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  {isAnalyzing && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Analyzing
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    onClick={handleSend}
                    disabled={!input.trim() || !selectedModel || isStreaming}
                    className="gap-2"
                  >
                    {isStreaming ? (
                      <>
                        <StopCircle className="h-4 w-4" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Input Helper Text */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <button className="hover:text-foreground transition-colors">
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button className="hover:text-foreground transition-colors">
                    <Mic className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {selectedModel && (
                    <span className="flex items-center gap-1">
                      Using: <strong>{selectedModel.displayName}</strong>
                      <span className="font-mono opacity-70">
                        (~{formatCost(selectedModel.estimatedCost.total)})
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}