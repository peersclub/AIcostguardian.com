'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  DollarSign, 
  Clock,
  Settings,
  History,
  Plus,
  Archive,
  Pin,
  Share2,
  Download,
  Upload,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Copy,
  Edit,
  Trash2,
  AlertCircle,
  TrendingUp,
  Zap,
  Brain
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ModelSelector } from './components/model-selector';
import { ThreadSidebar } from './components/thread-sidebar';
import { MetricsPanel } from './components/metrics-panel';
import { MessageComponent } from './components/message';

interface Thread {
  id: string;
  title: string;
  lastMessageAt: string | null;
  messageCount: number;
  totalCost: number;
  isPinned: boolean;
  isArchived: boolean;
}

interface Message {
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
}

interface SessionMetrics {
  messageCount: number;
  totalCost: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  todayCost: number;
  savedAmount: number;
  savedPercentage: number;
}

export default function AIOptimiseClient() {
  const { data: session } = useSession();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics>({
    messageCount: 0,
    totalCost: 0,
    totalTokens: 0,
    inputTokens: 0,
    outputTokens: 0,
    todayCost: 0,
    savedAmount: 0,
    savedPercentage: 0,
  });
  const [optimizationMode, setOptimizationMode] = useState<'QUALITY' | 'BALANCED' | 'BUDGET' | 'SPEED'>('BALANCED');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [selectedModel, setSelectedModel] = useState<{ provider: string; model: string } | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [metricsCollapsed, setMetricsCollapsed] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load threads on mount
  useEffect(() => {
    loadThreads();
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadThreads = async () => {
    try {
      const response = await fetch('/api/aioptimise/threads');
      if (response.ok) {
        const data = await response.json();
        setThreads(data.threads);
      }
    } catch (error) {
      console.error('Failed to load threads:', error);
    }
  };

  const createNewThread = async () => {
    try {
      const response = await fetch('/api/aioptimise/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' }),
      });
      
      if (response.ok) {
        const thread = await response.json();
        setThreads([thread, ...threads]);
        setCurrentThread(thread);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to create thread:', error);
    }
  };

  const loadThread = async (threadId: string) => {
    try {
      const response = await fetch(`/api/aioptimise/threads/${threadId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setCurrentThread(threads.find(t => t.id === threadId) || null);
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to load thread:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentThread) return;
    
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: input,
      createdAt: new Date().toISOString(),
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      cost: 0,
    };
    
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);
    
    try {
      const response = await fetch('/api/aioptimise/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: currentThread.id,
          message: input,
          mode: optimizationMode,
          modelOverride: selectedModel,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      
      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage: Message = {
        id: `temp-assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'content') {
                assistantMessage.content += data.content;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { ...assistantMessage };
                  return updated;
                });
              } else if (data.type === 'metadata') {
                assistantMessage = { ...assistantMessage, ...data.metadata };
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = assistantMessage;
                  return updated;
                });
                
                // Update session metrics
                setSessionMetrics(prev => ({
                  ...prev,
                  messageCount: prev.messageCount + 1,
                  totalCost: prev.totalCost + data.metadata.cost,
                  totalTokens: prev.totalTokens + data.metadata.totalTokens,
                  inputTokens: prev.inputTokens + data.metadata.promptTokens,
                  outputTokens: prev.outputTokens + data.metadata.completionTokens,
                }));
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setSelectedModel(null);
    }
  };

  const regenerateMessage = async (messageId: string) => {
    // Implementation for regenerating a message
  };

  const handleFeedback = async (messageId: string, feedback: 'positive' | 'negative') => {
    try {
      await fetch(`/api/aioptimise/messages/${messageId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, feedback } : msg
      ));
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Thread Sidebar */}
      <ThreadSidebar
        threads={threads}
        currentThread={currentThread}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNewThread={createNewThread}
        onSelectThread={loadThread}
      />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-lg">AIOptimise</h1>
            {currentThread && (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{currentThread.title}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOptimizationMode(
                optimizationMode === 'BALANCED' 
                  ? 'QUALITY' 
                  : optimizationMode === 'QUALITY'
                  ? 'BUDGET'
                  : optimizationMode === 'BUDGET'
                  ? 'SPEED'
                  : 'BALANCED'
              )}
            >
              {optimizationMode === 'BALANCED' && <Brain className="h-4 w-4 mr-1" />}
              {optimizationMode === 'QUALITY' && <Sparkles className="h-4 w-4 mr-1" />}
              {optimizationMode === 'BUDGET' && <DollarSign className="h-4 w-4 mr-1" />}
              {optimizationMode === 'SPEED' && <Zap className="h-4 w-4 mr-1" />}
              {optimizationMode}
            </Button>
            
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          {!currentThread ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Welcome to AIOptimise</h2>
              <p className="text-muted-foreground mb-4">
                Intelligent AI interface with automatic model selection and real-time cost tracking
              </p>
              <Button onClick={createNewThread}>
                <Plus className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ready to assist</h3>
              <p className="text-muted-foreground">
                I'll automatically select the best AI model for your needs
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <MessageComponent
                  key={message.id}
                  message={message}
                  onRegenerate={() => regenerateMessage(message.id)}
                  onFeedback={(feedback) => handleFeedback(message.id, feedback)}
                />
              ))}
              {isStreaming && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="animate-pulse">AI is thinking...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        
        {/* Input Area */}
        {currentThread && (
          <div className="border-t p-4">
            {showModelSelector && (
              <ModelSelector
                onSelect={(provider, model) => {
                  setSelectedModel({ provider, model });
                  setShowModelSelector(false);
                }}
                onClose={() => setShowModelSelector(false)}
              />
            )}
            
            {selectedModel && (
              <Alert className="mb-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Using {selectedModel.provider} - {selectedModel.model} (Manual Override)
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowModelSelector(!showModelSelector)}
                title="Select Model"
              >
                <Bot className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                title="Upload File"
              >
                <Upload className="h-4 w-4" />
              </Button>
              
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 min-h-[60px] max-h-[200px] resize-none"
                disabled={isLoading}
              />
              
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <div>
                Press Enter to send, Shift+Enter for new line
              </div>
              <div className="flex items-center gap-4">
                <span>Tokens: {sessionMetrics.totalTokens.toLocaleString()}</span>
                <span>Cost: ${sessionMetrics.totalCost.toFixed(4)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Metrics Panel */}
      <MetricsPanel
        metrics={sessionMetrics}
        collapsed={metricsCollapsed}
        onToggle={() => setMetricsCollapsed(!metricsCollapsed)}
      />
    </div>
  );
}