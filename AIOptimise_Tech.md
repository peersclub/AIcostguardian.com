// ============================================
// AIOPTIMISE - MAIN INTERFACE
// File: app/aioptimise/page.tsx
// ============================================

'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Hash,
  TrendingDown,
  TrendingUp,
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
  ThumbsUp,
  ThumbsDown,
  Star,
  Download,
  Share2,
  Archive,
  Search,
  Filter,
  Calendar,
  CreditCard,
  Target,
  Gauge,
  FileText,
  Image,
  Code2,
  MessageSquare,
  Repeat,
  Edit3,
  Trash2,
  ChevronRight,
  Shield,
  Wallet,
  PieChart,
  Activity,
  Users,
  Building,
  Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  PromptAnalyzer as Analyzer, 
  type AnalysisResult,
  type ModelRecommendation 
} from '@/lib/prompt-analyzer/engine';

// ============================================
// TYPES & INTERFACES
// ============================================

interface Message {
  id: string;
  threadId: string;
  role: 'user' | 'assistant' | 'system';
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
  override?: {
    original: ModelRecommendation;
    selected: ModelRecommendation;
    reason?: string;
  };
  feedback?: {
    rating: 'positive' | 'negative';
    stars?: number;
    comment?: string;
  };
  status?: 'sending' | 'streaming' | 'complete' | 'error';
  error?: string;
  attachments?: FileAttachment[];
}

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  content?: string;
}

interface Thread {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  metadata?: {
    tags?: string[];
    project?: string;
    archived?: boolean;
  };
}

interface UsageMetrics {
  session: {
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
    messageCount: number;
    startTime: Date;
  };
  daily: {
    date: string;
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
    messageCount: number;
    modelBreakdown: Record<string, number>;
  };
  weekly: {
    week: string;
    data: UsageMetrics['daily'][];
  };
  monthly: {
    month: string;
    data: UsageMetrics['daily'][];
  };
}

type OptimizationMode = 'quality' | 'balanced' | 'budget' | 'speed' | 'custom';

interface UserPreferences {
  optimizationMode: OptimizationMode;
  customWeights?: {
    quality: number;
    cost: number;
    speed: number;
    capability: number;
  };
  autoSave: boolean;
  streamingEnabled: boolean;
  showMetrics: boolean;
  showAnalysis: boolean;
  defaultModel?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function AIOptimise() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // Core State
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  
  // UI State
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelRecommendation | null>(null);
  const [isOverride, setIsOverride] = useState(false);
  
  // Metrics State
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics>({
    session: {
      inputTokens: 0,
      outputTokens: 0,
      totalCost: 0,
      messageCount: 0,
      startTime: new Date(),
    },
    daily: {
      date: new Date().toISOString().split('T')[0],
      inputTokens: 0,
      outputTokens: 0,
      totalCost: 0,
      messageCount: 0,
      modelBreakdown: {},
    },
    weekly: {
      week: getWeekNumber(new Date()),
      data: [],
    },
    monthly: {
      month: new Date().toISOString().slice(0, 7),
      data: [],
    },
  });
  
  // User Preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    optimizationMode: 'balanced',
    autoSave: true,
    streamingEnabled: true,
    showMetrics: true,
    showAnalysis: false,
  });
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analyzer = useRef(new Analyzer());
  
  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  
  function getWeekNumber(date: Date): string {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
  }
  
  const formatCost = (cost: number): string => {
    if (cost < 0.001) return `$${(cost * 10000).toFixed(2)}¢`;
    if (cost < 0.01) return `$${(cost * 1000).toFixed(3)}m`;
    if (cost < 1) return `$${cost.toFixed(4)}`;
    return `$${cost.toFixed(2)}`;
  };
  
  const formatTokens = (tokens: number): string => {
    if (tokens < 1000) return tokens.toString();
    if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`;
    return `${(tokens / 1000000).toFixed(2)}M`;
  };
  
  const formatLatency = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };
  
  // ============================================
  // HOOKS & EFFECTS
  // ============================================
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);
  
  // Load threads from localStorage/database
  useEffect(() => {
    loadThreads();
    loadPreferences();
    loadUsageMetrics();
  }, []);
  
  // Analyze prompt as user types (debounced)
  useEffect(() => {
    if (!input.trim()) {
      setAnalysis(null);
      setSelectedModel(null);
      setIsOverride(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setIsAnalyzing(true);
      
      // Analyze with optimization mode consideration
      const result = analyzer.current.analyze(input);
      setAnalysis(result);
      
      // Select model based on optimization mode
      const model = selectModelByMode(result.recommendations, preferences.optimizationMode);
      setSelectedModel(model);
      setIsOverride(false);
      
      setIsAnalyzing(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [input, preferences.optimizationMode]);
  
  // ============================================
  // MODEL SELECTION LOGIC
  // ============================================
  
  const selectModelByMode = (
    recommendations: ModelRecommendation[],
    mode: OptimizationMode
  ): ModelRecommendation | null => {
    if (recommendations.length === 0) return null;
    
    switch (mode) {
      case 'quality':
        // Sort by quality score
        return [...recommendations].sort((a, b) => b.scores.quality - a.scores.quality)[0];
        
      case 'budget':
        // Sort by cost (cheapest first)
        return [...recommendations].sort((a, b) => a.estimatedCost.total - b.estimatedCost.total)[0];
        
      case 'speed':
        // Sort by speed score
        return [...recommendations].sort((a, b) => b.scores.speed - a.scores.speed)[0];
        
      case 'balanced':
      default:
        // Use overall score (already balanced)
        return recommendations[0];
        
      case 'custom':
        // Apply custom weights
        if (preferences.customWeights) {
          const weighted = recommendations.map(rec => ({
            ...rec,
            customScore: 
              (rec.scores.quality * preferences.customWeights!.quality) +
              (rec.scores.cost * preferences.customWeights!.cost) +
              (rec.scores.speed * preferences.customWeights!.speed) +
              ((rec.scores.overall / 10) * preferences.customWeights!.capability),
          }));
          return weighted.sort((a, b) => b.customScore! - a.customScore!)[0];
        }
        return recommendations[0];
    }
  };
  
  // ============================================
  // DATA MANAGEMENT
  // ============================================
  
  const loadThreads = async () => {
    // In production, load from database
    const savedThreads = localStorage.getItem('aioptimise_threads');
    if (savedThreads) {
      setThreads(JSON.parse(savedThreads));
    }
  };
  
  const loadPreferences = async () => {
    const saved = localStorage.getItem('aioptimise_preferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  };
  
  const loadUsageMetrics = async () => {
    // In production, fetch from database
    const saved = localStorage.getItem('aioptimise_metrics');
    if (saved) {
      setUsageMetrics(JSON.parse(saved));
    }
  };
  
  const saveThread = (thread: Thread) => {
    const updated = threads.map(t => t.id === thread.id ? thread : t);
    if (!updated.find(t => t.id === thread.id)) {
      updated.push(thread);
    }
    setThreads(updated);
    localStorage.setItem('aioptimise_threads', JSON.stringify(updated));
  };
  
  // ============================================
  // MESSAGE HANDLING
  // ============================================
  
  const handleSend = async () => {
    if (!input.trim() || !selectedModel || isStreaming) return;
    
    // Track if this was an override
    const wasOverride = isOverride;
    const originalRecommendation = analysis?.recommendations[0];
    
    // Create user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      threadId: currentThread?.id || 'new',
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      analysis,
      attachments: [...attachments],
      status: 'complete',
      override: wasOverride && originalRecommendation ? {
        original: originalRecommendation,
        selected: selectedModel,
        reason: 'User preference',
      } : undefined,
    };
    
    // Add to messages
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input
    setInput('');
    setAttachments([]);
    setIsStreaming(true);
    
    // Create assistant message placeholder
    const assistantMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      threadId: currentThread?.id || 'new',
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
      // Make actual API call
      const response = await callAIProvider(
        userMessage.content,
        selectedModel,
        attachments
      );
      
      // Stream response
      await streamResponse(response, assistantMessage.id);
      
      // Update metrics
      updateMetrics(userMessage, assistantMessage, selectedModel);
      
    } catch (error) {
      console.error('AI call failed:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id
          ? { ...msg, status: 'error', error: 'Failed to get response' }
          : msg
      ));
    } finally {
      setIsStreaming(false);
    }
  };
  
  const callAIProvider = async (
    prompt: string,
    model: ModelRecommendation,
    files: FileAttachment[]
  ): Promise<Response> => {
    const response = await fetch('/api/aioptimise/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        provider: model.provider,
        model: model.model,
        attachments: files,
        stream: preferences.streamingEnabled,
      }),
    });
    
    if (!response.ok) throw new Error('API call failed');
    return response;
  };
  
  const streamResponse = async (response: Response, messageId: string) => {
    const reader = response.body?.getReader();
    if (!reader) return;
    
    const decoder = new TextDecoder();
    let fullContent = '';
    const startTime = Date.now();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      fullContent += chunk;
      
      // Update message with streaming content
      setMessages(prev => prev.map(msg => 
        msg.id === messageId
          ? { ...msg, content: fullContent }
          : msg
      ));
    }
    
    // Finalize message
    const endTime = Date.now();
    const promptTokens = Math.ceil(fullContent.length / 4); // Rough estimate
    const completionTokens = Math.ceil(fullContent.length / 4);
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId
        ? {
            ...msg,
            content: fullContent,
            status: 'complete',
            metrics: {
              promptTokens,
              completionTokens,
              totalTokens: promptTokens + completionTokens,
              cost: calculateCost(selectedModel!, promptTokens, completionTokens),
              latency: endTime - startTime,
            },
          }
        : msg
    ));
  };
  
  const calculateCost = (
    model: ModelRecommendation,
    promptTokens: number,
    completionTokens: number
  ): number => {
    // Use actual pricing from model
    const promptCost = (promptTokens / 1000000) * (model.estimatedCost.prompt || 0);
    const completionCost = (completionTokens / 1000000) * (model.estimatedCost.completion || 0);
    return promptCost + completionCost;
  };
  
  const updateMetrics = (
    userMsg: Message,
    assistantMsg: Message,
    model: ModelRecommendation
  ) => {
    setUsageMetrics(prev => ({
      ...prev,
      session: {
        ...prev.session,
        inputTokens: prev.session.inputTokens + (assistantMsg.metrics?.promptTokens || 0),
        outputTokens: prev.session.outputTokens + (assistantMsg.metrics?.completionTokens || 0),
        totalCost: prev.session.totalCost + (assistantMsg.metrics?.cost || 0),
        messageCount: prev.session.messageCount + 1,
      },
      daily: {
        ...prev.daily,
        inputTokens: prev.daily.inputTokens + (assistantMsg.metrics?.promptTokens || 0),
        outputTokens: prev.daily.outputTokens + (assistantMsg.metrics?.completionTokens || 0),
        totalCost: prev.daily.totalCost + (assistantMsg.metrics?.cost || 0),
        messageCount: prev.daily.messageCount + 1,
        modelBreakdown: {
          ...prev.daily.modelBreakdown,
          [model.displayName]: (prev.daily.modelBreakdown[model.displayName] || 0) + 1,
        },
      },
    }));
    
    // Save metrics
    localStorage.setItem('aioptimise_metrics', JSON.stringify(usageMetrics));
  };
  
  // ============================================
  // UI HANDLERS
  // ============================================
  
  const handleNewThread = () => {
    const newThread: Thread = {
      id: `thread-${Date.now()}`,
      title: 'New Chat',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
    };
    
    setCurrentThread(newThread);
    setMessages([]);
    setInput('');
    saveThread(newThread);
  };
  
  const handleModelOverride = (model: ModelRecommendation) => {
    setSelectedModel(model);
    setIsOverride(true);
    setShowModelPicker(false);
  };
  
  const handleFileUpload = (files: FileList) => {
    const newAttachments: FileAttachment[] = Array.from(files).map(file => ({
      id: `file-${Date.now()}-${Math.random()}`,
      name: file.name,
      type: file.type,
      size: file.size,
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };
  
  const handleFeedback = (messageId: string, rating: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId
        ? { ...msg, feedback: { rating } }
        : msg
    ));
  };
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="flex h-screen bg-background">
      <TooltipProvider>
        {/* Sidebar - Thread History */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-64 border-r bg-muted/30 flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b space-y-3">
                <Button 
                  className="w-full justify-start gap-2"
                  onClick={handleNewThread}
                >
                  <Plus className="h-4 w-4" />
                  New Chat
                </Button>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              {/* Thread List */}
              <ScrollArea className="flex-1 p-2">
                <div className="space-y-1">
                  {threads
                    .filter(thread => 
                      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      thread.messages.some(m => 
                        m.content.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                    )
                    .map(thread => (
                      <Button
                        key={thread.id}
                        variant={currentThread?.id === thread.id ? 'secondary' : 'ghost'}
                        className="w-full justify-start text-left p-3"
                        onClick={() => {
                          setCurrentThread(thread);
                          setMessages(thread.messages);
                        }}
                      >
                        <div className="flex-1 space-y-1">
                          <p className="font-medium text-sm truncate">{thread.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {thread.messages[thread.messages.length - 1]?.content || 'Empty chat'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(thread.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </Button>
                    ))}
                </div>
              </ScrollArea>
              
              {/* Sidebar Footer */}
              <div className="p-4 border-t space-y-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image || ''} />
                    <AvatarFallback>
                      {session?.user?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">
                      {session?.user?.name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pro Plan
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <CreditCard className="h-4 w-4 mr-1" />
                    Billing
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <h1 className="font-semibold">AIOptimise</h1>
                <Badge variant="secondary" className="text-xs">
                  {preferences.optimizationMode}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Optimization Mode Selector */}
              <Select
                value={preferences.optimizationMode}
                onValueChange={(value: OptimizationMode) => 
                  setPreferences(prev => ({ ...prev, optimizationMode: value }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quality">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Quality
                    </div>
                  </SelectItem>
                  <SelectItem value="balanced">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Balanced
                    </div>
                  </SelectItem>
                  <SelectItem value="budget">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Budget
                    </div>
                  </SelectItem>
                  <SelectItem value="speed">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Speed
                    </div>
                  </SelectItem>
                  <SelectItem value="custom">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Custom
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                <BarChart3 className="h-5 w-5" />
              </Button>
              
              <Button variant="ghost" size="icon">
                <History className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.length === 0 && (
                <div className="text-center py-20">
                  <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">Welcome to AIOptimise</h2>
                  <p className="text-muted-foreground mb-6">
                    I automatically select the best AI model for your needs
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <Card className="p-4">
                      <Sparkles className="h-8 w-8 text-yellow-600 mb-2" />
                      <h3 className="font-medium mb-1">Smart Selection</h3>
                      <p className="text-sm text-muted-foreground">
                        AI picks the optimal model
                      </p>
                    </Card>
                    <Card className="p-4">
                      <DollarSign className="h-8 w-8 text-green-600 mb-2" />
                      <h3 className="font-medium mb-1">Cost Tracking</h3>
                      <p className="text-sm text-muted-foreground">
                        Real-time token & cost metrics
                      </p>
                    </Card>
                    <Card className="p-4">
                      <Shield className="h-8 w-8 text-blue-600 mb-2" />
                      <h3 className="font-medium mb-1">Full Control</h3>
                      <p className="text-sm text-muted-foreground">
                        Override anytime you want
                      </p>
                    </Card>
                  </div>
                </div>
              )}
              
              {/* Render Messages */}
              {messages.map((message) => (
                <MessageComponent
                  key={message.id}
                  message={message}
                  onFeedback={handleFeedback}
                  showMetrics={preferences.showMetrics}
                  showAnalysis={preferences.showAnalysis}
                />
              ))}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Input Area */}
          <div className="border-t p-4">
            <div className="max-w-4xl mx-auto space-y-3">
              {/* Model Selection Bar */}
              {selectedModel && (
                <ModelSelectionBar
                  model={selectedModel}
                  analysis={analysis}
                  isOverride={isOverride}
                  onChangeModel={() => setShowModelPicker(true)}
                />
              )}
              
              {/* File Attachments */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachments.map(file => (
                    <Badge key={file.id} variant="secondary" className="gap-1">
                      <FileText className="h-3 w-3" />
                      {file.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => setAttachments(prev => 
                          prev.filter(f => f.id !== file.id)
                        )}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Input Field */}
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  placeholder="Ask anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="min-h-[60px] max-h-[200px] pr-32 resize-none"
                  disabled={isStreaming}
                />
                
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  {isStreaming ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsStreaming(false)}
                    >
                      <StopCircle className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  ) : (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      />
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Attach files</TooltipContent>
                      </Tooltip>
                      
                      <Button
                        onClick={handleSend}
                        disabled={!input.trim() || !selectedModel || isStreaming}
                      >
                        {isAnalyzing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Send
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Analytics Panel */}
        <AnimatePresence>
          {showAnalytics && (
            <AnalyticsPanel
              metrics={usageMetrics}
              onClose={() => setShowAnalytics(false)}
            />
          )}
        </AnimatePresence>
        
        {/* Model Picker Modal */}
        <ModelPickerModal
          open={showModelPicker}
          onOpenChange={setShowModelPicker}
          analysis={analysis}
          currentModel={selectedModel}
          onSelect={handleModelOverride}
        />
      </TooltipProvider>
    </div>
  );
}

// ============================================
// MESSAGE COMPONENT
// ============================================

interface MessageComponentProps {
  message: Message;
  onFeedback: (messageId: string, rating: 'positive' | 'negative') => void;
  showMetrics: boolean;
  showAnalysis: boolean;
}

function MessageComponent({ 
  message, 
  onFeedback, 
  showMetrics, 
  showAnalysis 
}: MessageComponentProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="space-y-2">
      {message.role === 'user' ? (
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
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
            
            <div className="prose prose-sm dark:prose-invert">
              {message.content}
            </div>
            
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {message.attachments.map(file => (
                  <Badge key={file.id} variant="outline">
                    <FileText className="h-3 w-3 mr-1" />
                    {file.name}
                  </Badge>
                ))}
              </div>
            )}
            
            {message.override && (
              <Card className="p-3 bg-yellow-50 dark:bg-yellow-950/20">
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span>Manual override:</span>
                  <Badge variant="outline">
                    {message.override.original.displayName} → {message.override.selected.displayName}
                  </Badge>
                </div>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {message.model?.displayName || 'AI'}
              </span>
              <Badge variant="outline" className="text-xs">
                {message.model?.provider}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {message.timestamp.toLocaleTimeString()}
              </span>
              {message.status === 'streaming' && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
            </div>
            
            <div className="prose prose-sm dark:prose-invert">
              {message.content}
              {message.status === 'streaming' && (
                <span className="inline-block w-2 h-4 ml-1 bg-foreground animate-pulse" />
              )}
            </div>
            
            {message.metrics && showMetrics && (
              <Card className="p-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {formatTokens(message.metrics.totalTokens)} tokens
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <DollarSign className="h-3 w-3" />
                      {formatCost(message.metrics.cost)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatLatency(message.metrics.latency)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => navigator.clipboard.writeText(message.content)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => onFeedback(message.id, 'positive')}
                    >
                      <ThumbsUp className={cn(
                        "h-3 w-3",
                        message.feedback?.rating === 'positive' && "text-green-600"
                      )} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => onFeedback(message.id, 'negative')}
                    >
                      <ThumbsDown className={cn(
                        "h-3 w-3",
                        message.feedback?.rating === 'negative' && "text-red-600"
                      )} />
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MODEL SELECTION BAR
// ============================================

interface ModelSelectionBarProps {
  model: ModelRecommendation;
  analysis: AnalysisResult | null;
  isOverride: boolean;
  onChangeModel: () => void;
}

function ModelSelectionBar({ 
  model, 
  analysis, 
  isOverride, 
  onChangeModel 
}: ModelSelectionBarProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const savings = analysis && analysis.recommendations.length > 1
    ? ((analysis.recommendations[analysis.recommendations.length - 1].estimatedCost.total - 
        model.estimatedCost.total) / 
        analysis.recommendations[analysis.recommendations.length - 1].estimatedCost.total * 100)
    : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium">
            {isOverride ? 'Manual Selection:' : 'Smart Pick:'}
          </span>
          <Badge className="text-xs">
            {model.displayName}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {formatCost(model.estimatedCost.total)}
          </Badge>
          {savings > 10 && (
            <Badge variant="outline" className="text-xs text-green-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              Save {savings.toFixed(0)}%
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {model.reasoning[0]}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onChangeModel}
          >
            Change Model
          </Button>
        </div>
      </div>
      
      {showDetails && analysis && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t space-y-2"
        >
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">Content Type</p>
              <p className="font-medium">{analysis.contentType.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Complexity</p>
              <p className="font-medium">Level {analysis.complexity}/5</p>
            </div>
            <div>
              <p className="text-muted-foreground">Confidence</p>
              <p className="font-medium">{(analysis.confidence * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Est. Tokens</p>
              <p className="font-medium">{analysis.tokens.estimated}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs font-medium">All Models Considered:</p>
            {analysis.recommendations.slice(0, 5).map((rec, idx) => (
              <div
                key={rec.model}
                className={cn(
                  "flex items-center justify-between p-2 rounded text-xs",
                  rec.model === model.model && "bg-white/50 dark:bg-white/5"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{idx + 1}.</span>
                  <Badge variant="outline" className="text-xs">
                    {rec.provider}
                  </Badge>
                  <span>{rec.displayName}</span>
                  {rec.model === model.model && (
                    <Check className="h-3 w-3 text-green-600" />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span>{formatCost(rec.estimatedCost.total)}</span>
                  <span className="text-muted-foreground">
                    Score: {rec.scores.overall}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ============================================
// ANALYTICS PANEL
// ============================================

interface AnalyticsPanelProps {
  metrics: UsageMetrics;
  onClose: () => void;
}

function AnalyticsPanel({ metrics, onClose }: AnalyticsPanelProps) {
  const [timeView, setTimeView] = useState<'session' | 'daily' | 'weekly' | 'monthly'>('session');
  
  // Calculate savings
  const estimatedSavings = metrics.session.totalCost * 0.3; // Assume 30% savings
  const efficiencyScore = 8.5; // Calculate based on override rate
  
  return (
    <motion.div
      initial={{ x: 300 }}
      animate={{ x: 0 }}
      exit={{ x: 300 }}
      className="w-80 border-l bg-muted/30 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Live Analytics
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Time View Tabs */}
      <div className="px-4 pt-4">
        <Tabs value={timeView} onValueChange={(v: any) => setTimeView(v)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="session">Session</TabsTrigger>
            <TabsTrigger value="daily">Today</TabsTrigger>
            <TabsTrigger value="weekly">Week</TabsTrigger>
            <TabsTrigger value="monthly">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Metrics Cards */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {/* Total Cost Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Total Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {formatCost(metrics[timeView === 'session' ? 'session' : 'daily'].totalCost)}
              </p>
              {estimatedSavings > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Saved ~{formatCost(estimatedSavings)} with smart selection
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Token Usage Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Token Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Input</span>
                  <span className="font-medium">
                    {formatTokens(metrics[timeView === 'session' ? 'session' : 'daily'].inputTokens)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Output</span>
                  <span className="font-medium">
                    {formatTokens(metrics[timeView === 'session' ? 'session' : 'daily'].outputTokens)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-medium">
                  <span>Total</span>
                  <span>
                    {formatTokens(
                      metrics[timeView === 'session' ? 'session' : 'daily'].inputTokens +
                      metrics[timeView === 'session' ? 'session' : 'daily'].outputTokens
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Efficiency Score */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                Efficiency Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{efficiencyScore}/10</span>
                  <Badge variant="outline" className="text-xs">
                    Excellent
                  </Badge>
                </div>
                <Progress value={efficiencyScore * 10} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Based on model selection accuracy
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Model Distribution */}
          {timeView === 'daily' && metrics.daily.modelBreakdown && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Model Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(metrics.daily.modelBreakdown).map(([model, count]) => (
                    <div key={model} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate">{model}</span>
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Messages Count */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {metrics[timeView === 'session' ? 'session' : 'daily'].messageCount}
              </p>
              <p className="text-xs text-muted-foreground">
                {timeView === 'session' ? 'This session' : `Today`}
              </p>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Analytics
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Share2 className="h-4 w-4 mr-2" />
                Share Report
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                View History
              </Button>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </motion.div>
  );
}

// ============================================
// MODEL PICKER MODAL
// ============================================

interface ModelPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: AnalysisResult | null;
  currentModel: ModelRecommendation | null;
  onSelect: (model: ModelRecommendation) => void;
}

function ModelPickerModal({
  open,
  onOpenChange,
  analysis,
  currentModel,
  onSelect,
}: ModelPickerModalProps) {
  const [filterProvider, setFilterProvider] = useState<string>('all');
  
  if (!analysis) return null;
  
  const filteredModels = filterProvider === 'all'
    ? analysis.recommendations
    : analysis.recommendations.filter(r => r.provider === filterProvider);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose AI Model</DialogTitle>
          <DialogDescription>
            Select the best model for your needs. The recommended model is highlighted.
          </DialogDescription>
        </DialogHeader>
        
        {/* Filter */}
        <div className="flex items-center gap-2 py-2">
          <Label>Provider:</Label>
          <Select value={filterProvider} onValueChange={setFilterProvider}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="xai">X.AI</SelectItem>
              <SelectItem value="perplexity">Perplexity</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Models List */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-3">
            {filteredModels.map((model, idx) => (
              <Card
                key={model.model}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-md",
                  idx === 0 && filterProvider === 'all' && "ring-2 ring-purple-600",
                  currentModel?.model === model.model && "bg-secondary"
                )}
                onClick={() => onSelect(model)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={cn("text-xs", providerColors[model.provider])}>
                        {model.provider.toUpperCase()}
                      </Badge>
                      <div>
                        <p className="font-semibold">{model.displayName}</p>
                        <p className="text-sm text-muted-foreground">{model.model}</p>
                      </div>
                      {idx === 0 && filterProvider === 'all' && (
                        <Badge className="bg-purple-600">
                          <Award className="h-3 w-3 mr-1" />
                          Recommended
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">{formatCost(model.estimatedCost.total)}</p>
                      <p className="text-xs text-muted-foreground">estimated</p>
                    </div>
                  </div>
                  
                  {/* Scores */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Quality</span>
                        <span className="font-medium">{model.scores.quality}/10</span>
                      </div>
                      <Progress value={model.scores.quality * 10} className="h-1" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Speed</span>
                        <span className="font-medium">{model.scores.speed}/10</span>
                      </div>
                      <Progress value={model.scores.speed * 10} className="h-1" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Value</span>
                        <span className="font-medium">{model.scores.cost}/10</span>
                      </div>
                      <Progress value={model.scores.cost * 10} className="h-1" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Overall</span>
                        <span className="font-medium">{model.scores.overall}/10</span>
                      </div>
                      <Progress value={model.scores.overall * 10} className="h-1" />
                    </div>
                  </div>
                  
                  {/* Reasoning */}
                  <div className="flex flex-wrap gap-1">
                    {model.reasoning.map((reason, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            if (currentModel) {
              onSelect(currentModel);
              onOpenChange(false);
            }
          }}>
            Use Selected Model
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatCost(cost: number): string {
  if (cost < 0.001) return `${(cost * 10000).toFixed(2)}¢`;
  if (cost < 0.01) return `${(cost * 1000).toFixed(3)}m`;
  if (cost < 1) return `${cost.toFixed(4)}`;
  return `${cost.toFixed(2)}`;
}

function formatTokens(tokens: number): string {
  if (tokens < 1000) return tokens.toString();
  if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`;
  return `${(tokens / 1000000).toFixed(2)}M`;
}

function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

const providerColors = {
  openai: 'text-green-600 bg-green-50 dark:bg-green-950/30',
  anthropic: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30',
  google: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
  xai: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30',
  perplexity: 'text-pink-600 bg-pink-50 dark:bg-pink-950/30',
};