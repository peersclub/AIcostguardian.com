'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  AlertCircle,
  Plus,
  Sparkles,
  ChevronRight,
  Info,
  Users,
  Shield,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import all enhanced components
import { ThreadSidebarEnhanced } from './components/thread-sidebar-enhanced';
import { MetricsPanelEnhanced } from './components/metrics-panel-enhanced';
import { MessageEnhanced } from './components/message-enhanced';
import { ClaudeUnifiedInput } from './components/claude-unified-input';
import { VoiceInput } from './components/voice-input';
import { ModeSettings } from './components/mode-settings';
import { ModelSelector } from './components/model-selector';
import { useThreadManager } from './hooks/useThreadManager';
import { ShareThreadDialog } from './components/share-thread-dialog';
import { CollaborationPresence, TypingIndicator } from './components/collaboration-presence';
import { useSocket, useThreadSocket } from '@/hooks/useSocket';

// Types
interface Thread {
  id: string;
  title: string;
  lastMessageAt: string | null;
  messageCount: number;
  totalCost: number;
  isPinned: boolean;
  isArchived: boolean;
  tags: string[];
  mode?: 'standard' | 'focus' | 'coding' | 'research' | 'creative';
  isLive?: boolean;
  hasError?: boolean;
  isShared?: boolean;
  shareId?: string;
  collaborators?: any[];
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
  status?: 'sending' | 'sent' | 'processing' | 'streaming' | 'completed' | 'failed' | 'cancelled';
  errorMessage?: string;
  images?: string[];
  contentType?: string;
  wasOverridden?: boolean;
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
  averageLatency?: number;
  successRate?: number;
  overrideCount?: number;
  feedbackScore?: number;
  dailyLimit?: number;
  monthlyLimit?: number;
  dailyUsed?: number;
  monthlyUsed?: number;
}

export default function AIOptimiseProClient() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // State management
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
    averageLatency: 1250,
    successRate: 98.5,
    overrideCount: 0,
    feedbackScore: 4.5,
    dailyLimit: 10,
    monthlyLimit: 100,
    dailyUsed: 0,
    monthlyUsed: 0,
  });
  
  // UI state
  const [mode, setMode] = useState<'standard' | 'focus' | 'coding' | 'research' | 'creative'>('standard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [metricsCollapsed, setMetricsCollapsed] = useState(false);
  const [selectedModel, setSelectedModel] = useState<{ provider: string; model: string } | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [overrideCount, setOverrideCount] = useState(0);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [settings, setSettings] = useState({
    showMetrics: true,
    showAnalysis: true,
    autoSave: true,
    autoRetry: true,
    voiceEnabled: false,
    theme: 'system' as 'light' | 'dark' | 'system',
    preferredProvider: undefined as string | undefined,
    preferredModel: undefined as string | undefined,
  });
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef<number>(0);
  
  // Thread management hook
  const threadActions = useThreadManager();
  
  // Collaboration state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedThreadForShare, setSelectedThreadForShare] = useState<Thread | null>(null);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  
  // WebSocket integration
  const { isConnected, connect, disconnect } = useSocket({
    onConnect: () => {
      toast.success('Connected to real-time server');
    },
    onDisconnect: () => {
      toast.warning('Disconnected from real-time server');
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
  });
  
  const {
    presence,
    typingUsers,
    startTyping,
    stopTyping,
    sendMessage: sendSocketMessage,
    editMessage: editSocketMessage,
    deleteMessage: deleteSocketMessage,
  } = useThreadSocket({
    threadId: currentThread?.id || null,
    onMessageReceived: (message) => {
      // Add received message to the messages list
      if (message.user?.id !== session?.user?.id) {
        const formattedMessage: Message = {
          id: message.id,
          role: message.role as 'user' | 'assistant',
          content: message.content,
          createdAt: message.createdAt.toString(),
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          cost: 0,
          status: 'completed',
        };
        setMessages(prev => [...prev, formattedMessage]);
      }
    },
    onMessageEdited: (data) => {
      // Update edited message
      setMessages(prev => prev.map(m => 
        m.id === data.messageId 
          ? { ...m, content: data.content, editedAt: data.editedAt }
          : m
      ));
    },
    onMessageDeleted: (data) => {
      // Remove deleted message
      setMessages(prev => prev.filter(m => m.id !== data.messageId));
    },
  });
  
  // Organization info
  const organizationName = session?.user?.company || "Your Organization";
  
  // Handle typing indicator based on input changes
  useEffect(() => {
    if (input.length > 0 && currentThread && isConnected) {
      startTyping();
    } else {
      stopTyping();
    }
  }, [input, currentThread, isConnected, startTyping, stopTyping]);
  const isRestricted = false; // Check user restrictions
  const hasReachedLimit = (sessionMetrics.dailyUsed || 0) >= (sessionMetrics.dailyLimit || 0);

  // Load initial data
  useEffect(() => {
    if (session) {
      loadThreads();
      loadUserSettings();
      loadUsageLimits();
    }
  }, [session]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-save thread
  useEffect(() => {
    if (settings.autoSave && currentThread && messages.length > 0) {
      const timer = setTimeout(() => {
        saveThread();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [messages, currentThread, settings.autoSave]);

  // API functions
  const loadThreads = async () => {
    try {
      const response = await fetch('/api/aioptimise/threads');
      if (response.ok) {
        const data = await response.json();
        setThreads(data.threads);
      }
    } catch (error) {
      console.error('Failed to load threads:', error);
      toast.error('Failed to load chat history');
    }
  };

  const loadUserSettings = async () => {
    try {
      const response = await fetch('/api/aioptimise/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadUsageLimits = async () => {
    try {
      const response = await fetch('/api/aioptimise/limits');
      if (response.ok) {
        const data = await response.json();
        setSessionMetrics(prev => ({
          ...prev,
          dailyLimit: data.dailyLimit,
          monthlyLimit: data.monthlyLimit,
          dailyUsed: data.dailyUsed,
          monthlyUsed: data.monthlyUsed,
        }));
      }
    } catch (error) {
      console.error('Failed to load usage limits:', error);
    }
  };

  const createNewThread = async () => {
    try {
      const response = await fetch('/api/aioptimise/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: 'New Chat',
          mode: mode,
        }),
      });
      
      if (response.ok) {
        const thread = await response.json();
        setThreads([thread, ...threads]);
        setCurrentThread(thread);
        setMessages([]);
        setCurrentAnalysis(null);
        return thread; // Return the created thread
      }
    } catch (error) {
      console.error('Failed to create thread:', error);
      toast.error('Failed to create new chat');
    }
    return null;
  };

  const saveThread = async () => {
    if (!currentThread || messages.length === 0) return;
    
    try {
      await fetch(`/api/aioptimise/threads/${currentThread.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          title: currentThread.title,
        }),
      });
    } catch (error) {
      console.error('Failed to save thread:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && uploadedImages.length === 0) return;
    
    let threadToUse = currentThread;
    if (!threadToUse) {
      const newThread = await createNewThread();
      if (!newThread) return;
      threadToUse = newThread;
    }
    
    // Check usage limits
    if (hasReachedLimit) {
      toast.error('Daily usage limit reached. Please request an increase.');
      return;
    }
    
    const messageText = input;
    const images = [...uploadedImages];
    
    // Create user message
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: messageText,
      images: images.length > 0 ? images : undefined,
      createdAt: new Date().toISOString(),
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      cost: 0,
      status: 'sending',
    };
    
    setMessages([...messages, userMessage]);
    setInput('');
    setUploadedImages([]);
    setIsLoading(true);
    setIsStreaming(true);
    
    // Stop typing indicator
    stopTyping();
    
    // Send via WebSocket for real-time sync
    if (isConnected && threadToUse) {
      try {
        await sendSocketMessage({
          content: messageText,
          images,
          metadata: { timestamp: new Date().toISOString() }
        });
      } catch (error) {
        console.error('Failed to send via WebSocket:', error);
      }
    }
    setCurrentAnalysis(null);
    retryCountRef.current = 0;
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    
    try {
      if (!threadToUse) {
        throw new Error('No thread available');
      }
      await sendMessageWithRetry(messageText, images, threadToUse);
    } catch (error) {
      console.error('Failed to send message:', error);
      handleMessageError(error);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setSelectedModel(null);
      abortControllerRef.current = null;
    }
  };

  const sendMessageWithRetry = async (messageText: string, images: string[], thread: Thread, retryCount = 0): Promise<void> => {
    try {
      const response = await fetch('/api/aioptimise/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: thread.id,
          message: messageText,
          images: images,
          mode: mode,
          modelOverride: selectedModel,
        }),
        signal: abortControllerRef.current?.signal,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Handle streaming response
      await handleStreamingResponse(response);
      
    } catch (error: any) {
      // Handle retry logic
      if (settings.autoRetry && retryCount < 3 && !error.name?.includes('Abort')) {
        retryCountRef.current = retryCount + 1;
        toast.info(`Retrying... (${retryCount + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        return sendMessageWithRetry(messageText, images, thread, retryCount + 1);
      }
      throw error;
    }
  };

  const handleStreamingResponse = async (response: Response) => {
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
      status: 'streaming',
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
            
            if (data.type === 'analysis') {
              setCurrentAnalysis(data.analysis);
              if (selectedModel) {
                setOverrideCount(prev => prev + 1);
              }
            } else if (data.type === 'content') {
              assistantMessage.content += data.content;
              assistantMessage.status = 'streaming';
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { ...assistantMessage };
                return updated;
              });
            } else if (data.type === 'metadata') {
              assistantMessage = { ...assistantMessage, ...data.metadata, status: 'completed' };
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = assistantMessage;
                return updated;
              });
              
              // Update session metrics
              updateSessionMetrics(data.metadata);
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }
  };

  const handleMessageError = (error: any) => {
    const errorMessage = error.message || 'Failed to send message';
    
    // Update last message with error
    setMessages(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        const lastMessage = updated[updated.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.status = 'failed';
          lastMessage.errorMessage = errorMessage;
        }
      }
      return updated;
    });
    
    toast.error(errorMessage);
  };

  const updateSessionMetrics = (metadata: any) => {
    setSessionMetrics(prev => ({
      ...prev,
      messageCount: prev.messageCount + 1,
      totalCost: prev.totalCost + (metadata.cost || 0),
      totalTokens: prev.totalTokens + (metadata.totalTokens || 0),
      inputTokens: prev.inputTokens + (metadata.promptTokens || 0),
      outputTokens: prev.outputTokens + (metadata.completionTokens || 0),
      todayCost: prev.todayCost + (metadata.cost || 0),
      dailyUsed: prev.dailyUsed + (metadata.cost || 0),
      monthlyUsed: prev.monthlyUsed + (metadata.cost || 0),
    }));
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      
      // Update last message status
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          const lastMessage = updated[updated.length - 1];
          if (lastMessage.role === 'assistant' && lastMessage.status === 'streaming') {
            lastMessage.status = 'cancelled';
          }
        }
        return updated;
      });
      
      toast.info('Streaming stopped');
    }
  };

  const regenerateMessage = async (messageId: string, model?: { provider: string; model: string }) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;
    
    // Get the previous user message
    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.role !== 'user') return;
    
    // Remove all messages after the user message
    setMessages(messages.slice(0, messageIndex));
    
    // Set model override if provided
    if (model) {
      setSelectedModel(model);
    }
    
    // Resend the message
    setInput(userMessage.content);
    await sendMessage();
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
      
      // Update feedback score
      const positiveCount = messages.filter(m => m.feedback === 'positive').length;
      const totalFeedback = messages.filter(m => m.feedback).length;
      if (totalFeedback > 0) {
        setSessionMetrics(prev => ({
          ...prev,
          feedbackScore: (positiveCount / totalFeedback) * 5,
        }));
      }
      
      toast.success('Feedback recorded');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleImageUpload = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (result && typeof result === 'string') {
            setUploadedImages(prev => [...prev, result]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
    
    toast.success(`${files.length} image(s) added`);
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInput(prev => prev + ' ' + transcript);
    setIsVoiceActive(false);
    toast.success('Voice input added');
  };

  const requestLimitIncrease = async () => {
    try {
      await fetch('/api/aioptimise/limits/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Requesting increased usage limits for productivity',
        }),
      });
      toast.success('Limit increase requested. You will be notified once approved.');
    } catch (error) {
      console.error('Failed to request limit increase:', error);
      toast.error('Failed to request limit increase');
    }
  };
  
  const loadCollaborators = async (threadId: string) => {
    try {
      const response = await fetch(`/api/aioptimise/threads/${threadId}/collaborators`);
      if (response.ok) {
        const data = await response.json();
        setCollaborators(data);
      }
    } catch (error) {
      console.error('Failed to load collaborators:', error);
    }
  };
  
  const handleAddCollaborator = async (email: string, role: string) => {
    if (!selectedThreadForShare) return;
    await threadActions.addCollaborator(selectedThreadForShare.id, email);
    await loadCollaborators(selectedThreadForShare.id);
  };
  
  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (!selectedThreadForShare) return;
    try {
      const response = await fetch(
        `/api/aioptimise/threads/${selectedThreadForShare.id}/collaborators/${collaboratorId}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        await loadCollaborators(selectedThreadForShare.id);
        toast.success('Collaborator removed');
      }
    } catch (error) {
      toast.error('Failed to remove collaborator');
    }
  };
  
  const handleUpdateCollaboratorRole = async (collaboratorId: string, role: string) => {
    // TODO: Implement role update endpoint
    toast.info('Role update coming soon');
  };

  // Render different modes
  const renderContent = () => {
    if (mode === 'focus') {
      return (
        <div className="flex-1 flex flex-col bg-transparent">
          <div className="flex-1 relative flex flex-col">
            <ScrollArea className="flex-1 pb-40">
              <div className="max-w-3xl mx-auto px-4 py-8">
                {messages.map((message) => (
                  <MessageEnhanced
                    key={message.id}
                    message={message}
                    onRegenerate={(model) => regenerateMessage(message.id, model)}
                    onFeedback={(type) => handleFeedback(message.id, type)}
                    onCopy={() => navigator.clipboard.writeText(message.content)}
                    isStreaming={isStreaming && message.status === 'streaming'}
                    mode="focus"
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent z-20">
              <div className="max-w-3xl mx-auto">
                <ClaudeUnifiedInput
                  value={input}
                  onChange={setInput}
                  onSend={sendMessage}
                  onStop={stopStreaming}
                  onImageUpload={handleImageUpload}
                  onVoiceToggle={() => setIsVoiceActive(!isVoiceActive)}
                  onModelSelect={(provider, model) => setSelectedModel({ provider, model })}
                  onModeChange={setMode}
                  isLoading={isLoading}
                  isStreaming={isStreaming}
                  isVoiceActive={isVoiceActive}
                  selectedModel={selectedModel}
                  mode={mode}
                  uploadedImages={uploadedImages}
                  onRemoveImage={(index) => {
                    const newImages = [...uploadedImages];
                    newImages.splice(index, 1);
                    setUploadedImages(newImages);
                  }}
                  promptAnalysis={currentAnalysis}
                  overrideCount={overrideCount}
                  onOverrideModel={() => {
                    // This could open a model selector or reset to auto
                    setSelectedModel(null);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <>
        {/* Main chat area */}
        <div className="flex-1 flex flex-col bg-transparent">
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between bg-gray-900/50 backdrop-blur-xl border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-violet-400" />
              </div>
              <h1 className="text-xl font-bold text-white">AIOptimise Pro</h1>
              {currentThread && (
                <>
                  <ChevronRight className="h-3 w-3 text-gray-400" />
                  <span className="text-sm text-gray-300">{currentThread.title}</span>
                  {currentThread.isLive && (
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  )}
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <ModeSettings
                currentMode={mode}
                onModeChange={(newMode) => setMode(newMode as any)}
                settings={settings}
                onSettingsChange={setSettings}
              />
              
              {currentThread?.isShared && (
                <Button variant="outline" size="sm" className="gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300">
                  <Users className="h-3 w-3" />
                  {currentThread.collaborators?.length || 0} Collaborators
                </Button>
              )}
            </div>
          </div>
          
          {/* Restriction/limit warnings */}
          {(isRestricted || hasReachedLimit) && (
            <Alert className="mx-6 mt-4 border-yellow-500/30 bg-yellow-900/20 backdrop-blur-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {hasReachedLimit 
                  ? 'You have reached your daily usage limit.' 
                  : 'Your account has restrictions.'}
                {' '}
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-yellow-400 hover:text-yellow-300"
                  onClick={requestLimitIncrease}
                >
                  Request increase
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Content area with relative positioning for chat controls */}
          <div className="flex-1 relative flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 overflow-y-auto pb-40">
              <div className="max-w-4xl mx-auto px-4 py-8">
              {!currentThread ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <div className="p-3 rounded-2xl bg-violet-500/20 mb-4">
                    <Sparkles className="h-8 w-8 text-violet-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome to AIOptimise Pro</h2>
                  <p className="text-gray-400 mb-6 max-w-md">
                    Professional AI interface with intelligent model selection, real-time collaboration, and advanced analytics
                  </p>
                  <Button
                    onClick={createNewThread}
                    className="gap-2 bg-violet-600 hover:bg-violet-700 text-white transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Start New Chat
                  </Button>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <div className="p-3 rounded-2xl bg-gray-800/50 mb-4">
                    <Info className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Ready to assist</h3>
                  <p className="text-gray-400 max-w-md">
                    I'll automatically select the best AI model for your needs and show you why
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <MessageEnhanced
                      key={message.id}
                      message={message}
                      onRegenerate={(model) => regenerateMessage(message.id, model)}
                      onFeedback={(type) => handleFeedback(message.id, type)}
                      onCopy={() => {
                        navigator.clipboard.writeText(message.content);
                        toast.success('Copied to clipboard');
                      }}
                      isStreaming={isStreaming && message.status === 'streaming'}
                      mode={mode}
                    />
                  ))}
                  {isStreaming && messages[messages.length - 1]?.status === 'streaming' && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-violet-400 mr-2" />
                      <span className="text-sm text-gray-400">AI is thinking...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
              </div>
            </ScrollArea>
            
            {/* Prompt analysis is now integrated into ClaudeUnifiedInput */}
            
            {/* Input controls - positioned absolutely within content area */}
            {currentThread && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent z-20">
                <div className="max-w-4xl mx-auto">
                  <ClaudeUnifiedInput
                    value={input}
                    onChange={setInput}
                    onSend={sendMessage}
                    onStop={stopStreaming}
                    onImageUpload={handleImageUpload}
                    onVoiceToggle={() => setIsVoiceActive(!isVoiceActive)}
                    onModelSelect={(provider, model) => setSelectedModel({ provider, model })}
                    onModeChange={setMode}
                    isLoading={isLoading}
                    isStreaming={isStreaming}
                    isVoiceActive={isVoiceActive}
                    selectedModel={selectedModel}
                    mode={mode}
                    uploadedImages={uploadedImages}
                    onRemoveImage={(index) => {
                      const newImages = [...uploadedImages];
                      newImages.splice(index, 1);
                      setUploadedImages(newImages);
                    }}
                    promptAnalysis={currentAnalysis}
                    overrideCount={overrideCount}
                    onOverrideModel={() => {
                      // This could open a model selector or reset to auto
                      setSelectedModel(null);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Metrics panel */}
        {settings.showMetrics && (
          <MetricsPanelEnhanced
            metrics={sessionMetrics}
            collapsed={metricsCollapsed}
            onToggle={() => setMetricsCollapsed(!metricsCollapsed)}
            onRequestLimitIncrease={requestLimitIncrease}
            mode={mode}
          />
        )}
      </>
    );
  };

  return (
    <div className="flex h-screen bg-black relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-black to-purple-900/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="relative z-10 flex w-full">
      {/* Thread sidebar */}
      <ThreadSidebarEnhanced
        threads={threads}
        currentThread={currentThread}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNewThread={createNewThread}
        onSelectThread={async (threadId) => {
          const thread = threads.find(t => t.id === threadId);
          if (thread) {
            setCurrentThread(thread);
            // Load thread messages
            try {
              const response = await fetch(`/api/aioptimise/threads/${threadId}/messages`);
              if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
                // Update session metrics from thread
                setSessionMetrics(prev => ({
                  ...prev,
                  messageCount: thread.messageCount || 0,
                  totalCost: thread.totalCost || 0,
                }));
              }
            } catch (error) {
              console.error('Failed to load thread messages:', error);
              toast.error('Failed to load messages');
            }
          }
        }}
        onPinThread={async (threadId) => {
          await threadActions.pinThread(threadId);
        }}
        onDeleteThread={threadActions.deleteThread}
        onShareThread={(threadId) => {
          const thread = threads.find(t => t.id === threadId);
          if (thread) {
            setSelectedThreadForShare(thread);
            setShareDialogOpen(true);
            loadCollaborators(threadId);
          }
        }}
        organizationName={organizationName}
      />
      
      {renderContent()}
      </div>
      
      {/* Voice input modal */}
      {isVoiceActive && (
        <VoiceInput
          isActive={isVoiceActive}
          onToggle={() => setIsVoiceActive(!isVoiceActive)}
          onTranscript={handleVoiceTranscript}
          provider={selectedModel?.provider || settings.preferredProvider}
        />
      )}
      
      {/* Share thread dialog */}
      {selectedThreadForShare && (
        <ShareThreadDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          thread={{
            id: selectedThreadForShare.id,
            title: selectedThreadForShare.title,
            isShared: selectedThreadForShare.isShared || false,
            shareId: selectedThreadForShare.shareId
          }}
          onShare={async (options) => {
            const result = await threadActions.shareThread(selectedThreadForShare.id, options);
            if (!result) throw new Error('Failed to share thread');
            // Update the thread in state
            setThreads(threads.map(t => 
              t.id === selectedThreadForShare.id 
                ? { ...t, isShared: true } 
                : t
            ));
            if (currentThread?.id === selectedThreadForShare.id) {
              setCurrentThread({ ...currentThread, isShared: true });
            }
            return result;
          }}
          onUnshare={async () => {
            // Unshare functionality - for now just update the state
            // TODO: Implement unshareThread method in useThreadManager
            // Update the thread in state
            setThreads(threads.map(t => 
              t.id === selectedThreadForShare.id 
                ? { ...t, isShared: false } 
                : t
            ));
            if (currentThread?.id === selectedThreadForShare.id) {
              setCurrentThread({ ...currentThread, isShared: false });
            }
          }}
          onAddCollaborator={handleAddCollaborator}
          onRemoveCollaborator={handleRemoveCollaborator}
          onUpdateCollaboratorRole={handleUpdateCollaboratorRole}
          collaborators={collaborators}
        />
      )}
    </div>
  );
}