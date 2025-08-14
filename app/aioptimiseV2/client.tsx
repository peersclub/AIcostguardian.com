'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import {
  Send, Paperclip, Mic, StopCircle, Zap, Plus, Search,
  Settings, ChevronRight, ChevronLeft, Sparkles, Copy,
  ThumbsUp, ThumbsDown, RefreshCw, Download, Share2,
  Brain, Gauge, DollarSign, Timer, Cpu, Users, Archive,
  Pin, Trash2, MoreVertical, Edit2, Tag, X, Check,
  FileText, Image as ImageIcon, Code, Hash, MessageSquare,
  TrendingUp, AlertCircle, Lightbulb, BookOpen, Menu
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ThreadManager } from './components/thread-manager'
import { CleanInput } from './components/clean-input'
import { InfoPanel } from './components/info-panel'
import { ModeSelector } from './components/mode-selector'
import { useThreadManager } from './hooks/useThreadManager'

// Types
interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  model?: string
  provider?: string
  cost?: number
  tokens?: {
    input: number
    output: number
    total: number
  }
  latency?: number
  attachments?: Attachment[]
  feedback?: 'positive' | 'negative'
  status?: 'sending' | 'streaming' | 'complete' | 'error'
  metadata?: any
}

interface Attachment {
  id: string
  type: 'image' | 'file' | 'code'
  name: string
  size: number
  url?: string
  content?: string
}

interface Thread {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messageCount: number
  lastMessage?: string
  isPinned?: boolean
  isArchived?: boolean
  sharedWith?: string[]
  tags?: string[]
  metadata?: any
}

interface ModelOption {
  id: string
  name: string
  provider: 'openai' | 'anthropic' | 'google' | 'x'
  contextLength: number
  inputCost: number
  outputCost: number
  speed: 'fast' | 'medium' | 'slow'
  capabilities: string[]
}

interface PromptAnalysis {
  complexity: 'simple' | 'moderate' | 'complex' | 'expert'
  category: string
  suggestedModel: string
  estimatedTokens: number
  requiresContext: boolean
  requiresWeb: boolean
}

interface AIOptimiseV2ClientProps {
  user: {
    id: string
    email: string
    name?: string
    image?: string
    hasApiKeys: boolean
    subscription?: string
  }
  limits: {
    dailyLimit: number
    monthlyLimit: number
    dailyUsed: number
    monthlyUsed: number
  }
}

// Constants
const MODELS: ModelOption[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    contextLength: 128000,
    inputCost: 0.01,
    outputCost: 0.03,
    speed: 'medium',
    capabilities: ['reasoning', 'coding', 'analysis', 'creative']
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    contextLength: 200000,
    inputCost: 0.015,
    outputCost: 0.075,
    speed: 'slow',
    capabilities: ['reasoning', 'coding', 'analysis', 'creative', 'vision']
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    contextLength: 200000,
    inputCost: 0.003,
    outputCost: 0.015,
    speed: 'medium',
    capabilities: ['reasoning', 'coding', 'analysis', 'vision']
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    contextLength: 32000,
    inputCost: 0.0005,
    outputCost: 0.0015,
    speed: 'fast',
    capabilities: ['reasoning', 'analysis', 'creative']
  },
  {
    id: 'grok-1',
    name: 'Grok',
    provider: 'x',
    contextLength: 8192,
    inputCost: 0.001,
    outputCost: 0.002,
    speed: 'fast',
    capabilities: ['reasoning', 'humor', 'real-time']
  }
]

const MODES = [
  { id: 'chat', label: 'Chat', icon: MessageSquare, description: 'General conversation' },
  { id: 'coding', label: 'Code', icon: Code, description: 'Programming assistance' },
  { id: 'analysis', label: 'Analysis', icon: Brain, description: 'Data & research' },
  { id: 'creative', label: 'Creative', icon: Sparkles, description: 'Writing & ideation' },
  { id: 'focus', label: 'Focus', icon: Zap, description: 'Quick, concise answers' }
]

// Helper functions
const analyzePrompt = (prompt: string, mode: string): PromptAnalysis => {
  const wordCount = prompt.split(' ').length
  const hasCode = /```|function|class|const|let|var|import|export/.test(prompt)
  const hasQuestion = /\?|how|what|why|when|where|who/.test(prompt.toLowerCase())
  const hasAnalysis = /analyze|compare|evaluate|assess|review/.test(prompt.toLowerCase())
  
  let complexity: PromptAnalysis['complexity'] = 'simple'
  if (wordCount > 100 || hasCode) complexity = 'moderate'
  if (wordCount > 300 || (hasCode && hasAnalysis)) complexity = 'complex'
  if (wordCount > 500 || prompt.includes('architecture') || prompt.includes('system design')) complexity = 'expert'
  
  return {
    complexity,
    category: hasCode ? 'technical' : hasAnalysis ? 'analytical' : 'conversational',
    suggestedModel: complexity === 'simple' ? 'gemini-pro' : complexity === 'expert' ? 'claude-3-opus' : 'gpt-4o',
    estimatedTokens: Math.ceil(wordCount * 1.3),
    requiresContext: hasQuestion || hasAnalysis,
    requiresWeb: prompt.includes('latest') || prompt.includes('current') || prompt.includes('news')
  }
}

export default function AIOptimiseV2Client({ user, limits }: AIOptimiseV2ClientProps) {
  // Core state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedMode, setSelectedMode] = useState('chat')
  const [selectedModel, setSelectedModel] = useState(MODELS[0])
  const [autoOptimize, setAutoOptimize] = useState(true)
  const [streamResponse, setStreamResponse] = useState(true)
  const [showCostBreakdown, setShowCostBreakdown] = useState(false)
  
  // Thread management
  const threadManager = useThreadManager()
  const {
    threads,
    currentThread,
    loading: threadsLoading,
    createThread,
    selectThread,
    deleteThread,
    pinThread,
    archiveThread,
    renameThread,
    shareThread,
    addCollaborator,
    searchThreads
  } = threadManager
  
  // Performance metrics
  const [currentCost, setCurrentCost] = useState(0)
  const [savedAmount, setSavedAmount] = useState(0)
  const [promptAnalysis, setPromptAnalysis] = useState<PromptAnalysis | null>(null)
  
  // WebSocket state
  const [wsConnected, setWsConnected] = useState(false)
  const ws = useRef<WebSocket | null>(null)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Animation controls
  const controls = useAnimation()
  
  // Session
  const { data: session } = useSession()
  
  // Effects
  useEffect(() => {
    // Load threads on mount
    threadManager.loadThreads()
  }, [])
  
  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  useEffect(() => {
    // Analyze prompt as user types
    if (input.length > 10) {
      const timer = setTimeout(() => {
        const analysis = analyzePrompt(input, selectedMode)
        setPromptAnalysis(analysis)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [input, selectedMode])
  
  useEffect(() => {
    // WebSocket connection
    if (session?.user?.id) {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000'
      ws.current = new WebSocket(`${wsUrl}/ws?userId=${session.user.id}`)
      
      ws.current.onopen = () => {
        setWsConnected(true)
        console.log('WebSocket connected')
      }
      
      ws.current.onclose = () => {
        setWsConnected(false)
        console.log('WebSocket disconnected')
      }
      
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
      
      return () => {
        ws.current?.close()
      }
    }
  }, [session])
  
  // Handlers
  const handleSendMessage = async (text: string, mode: string, modelOverride?: ModelOption) => {
    if (!text.trim() && attachments.length === 0) return
    if (!user.hasApiKeys) {
      toast.error('Please configure API keys first')
      return
    }
    
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      attachments: [...attachments],
      status: 'sending'
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setAttachments([])
    setIsLoading(true)
    
    try {
      const modelToUse = modelOverride || (autoOptimize ? await selectOptimalModel(text) : selectedModel)
      
      const res = await fetch('/api/aioptimise/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: currentThread?.id,
          message: text,
          model: modelToUse.id,
          provider: modelToUse.provider,
          mode,
          attachments,
          stream: streamResponse
        })
      })
      
      if (!res.ok) throw new Error('Failed to send message')
      
      if (streamResponse && res.body) {
        setIsStreaming(true)
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
          model: modelToUse.name,
          provider: modelToUse.provider,
          status: 'streaming'
        }
        
        setMessages(prev => [...prev, assistantMessage])
        
        let fullContent = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          fullContent += chunk
          
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: fullContent }
              : msg
          ))
        }
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, status: 'complete', content: fullContent }
            : msg
        ))
        setIsStreaming(false)
      } else {
        const data = await res.json()
        const assistantMessage: Message = {
          id: data.id,
          role: 'assistant',
          content: data.content,
          timestamp: new Date().toISOString(),
          model: modelToUse.name,
          provider: modelToUse.provider,
          cost: data.cost,
          tokens: data.tokens,
          latency: data.latency,
          status: 'complete'
        }
        setMessages(prev => [...prev, assistantMessage])
        setCurrentCost(prev => prev + (data.cost || 0))
      }
    } catch (error) {
      toast.error('Failed to send message')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const selectOptimalModel = async (prompt: string): Promise<ModelOption> => {
    const analysis = promptAnalysis || analyzePrompt(prompt, selectedMode)
    
    if (selectedMode === 'coding') {
      if (analysis.complexity === 'expert') {
        return MODELS.find(m => m.id === 'claude-3-opus') || selectedModel
      }
      return MODELS.find(m => m.id === 'claude-3-sonnet') || selectedModel
    }
    
    if (selectedMode === 'creative') {
      return MODELS.find(m => m.id === 'gpt-4o') || selectedModel
    }
    
    if (selectedMode === 'analysis') {
      if (analysis.complexity === 'expert' || analysis.complexity === 'complex') {
        return MODELS.find(m => m.id === 'claude-3-opus') || selectedModel
      }
      return MODELS.find(m => m.id === 'gemini-pro') || selectedModel
    }
    
    if (selectedMode === 'focus') {
      return MODELS.find(m => m.id === 'gemini-pro') || selectedModel
    }
    
    const suggestedModelId = analysis.suggestedModel.toLowerCase().replace(/ /g, '-')
    return MODELS.find(m => m.id.includes(suggestedModelId)) || selectedModel
  }
  
  const handleFileUpload = (files: FileList) => {
    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      id: `att-${Date.now()}-${Math.random()}`,
      type: file.type.startsWith('image/') ? 'image' : file.type.includes('code') ? 'code' : 'file',
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file)
    }))
    setAttachments(prev => [...prev, ...newAttachments])
  }
  
  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }
  
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard')
  }
  
  const provideFeedback = async (messageId: string, type: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback: type } : msg
    ))
    
    try {
      await fetch('/api/aioptimise/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, type })
      })
      toast.success('Feedback recorded')
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
  }
  
  // Render
  return (
    <div className="fixed inset-0 bg-gray-950 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
      
      <div className="relative z-10 h-full flex">
        {/* Thread Manager Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-72 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 flex flex-col"
            >
              <ThreadManager
                threads={threads.map(t => ({
                  id: t.id,
                  title: t.title,
                  lastMessage: t.lastMessage || '',
                  timestamp: new Date(t.updatedAt),
                  messageCount: t.messageCount,
                  pinned: t.isPinned || false,
                  archived: t.isArchived || false,
                  tags: t.tags || [],
                  collaborators: t.sharedWith
                }))}
                currentThreadId={currentThread?.id || null}
                onSelectThread={selectThread}
                onCreateThread={createThread}
                onDeleteThread={deleteThread}
                onArchiveThread={archiveThread}
                onPinThread={pinThread}
                onShareThread={shareThread}
                onRenameThread={renameThread}
                onInviteCollaborator={addCollaborator}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="h-14 bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-400 hover:text-white"
              >
                {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-white">AIOptimise V2</h1>
                <p className="text-xs text-gray-400">
                  {currentThread ? currentThread.title : 'Select or create a conversation'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ModeSelector
                currentMode={selectedMode as any}
                onModeChange={(mode) => setSelectedMode(mode)}
              />
              <Select value={selectedModel.id} onValueChange={(id) => setSelectedModel(MODELS.find(m => m.id === id) || MODELS[0])}>
                <SelectTrigger className="w-40 bg-gray-800/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "mb-6 flex",
                      message.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[80%] rounded-xl p-4",
                      message.role === 'user' 
                        ? "bg-indigo-600 text-white" 
                        : "bg-gray-800/50 text-gray-100 border border-gray-700"
                    )}>
                      {/* Message Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={message.role === 'user' ? user.image : '/ai-avatar.png'} />
                          <AvatarFallback>{message.role === 'user' ? 'U' : 'AI'}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">
                          {message.role === 'user' ? 'You' : message.model || 'AI'}
                        </span>
                        {message.status === 'streaming' && (
                          <Badge variant="secondary" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1 animate-pulse" />
                            Generating...
                          </Badge>
                        )}
                      </div>
                      
                      {/* Message Content */}
                      <div className="prose prose-invert prose-sm max-w-none">
                        {message.role === 'assistant' ? (
                          <ReactMarkdown
                            components={{
                              code({ className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '')
                                const inline = !match
                                return !inline ? (
                                  <SyntaxHighlighter
                                    style={oneDark}
                                    language={match?.[1] || 'text'}
                                    PreTag="div"
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                )
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.attachments.map(attachment => (
                            <div key={attachment.id} className="flex items-center gap-2 px-2 py-1 bg-gray-700/50 rounded">
                              {attachment.type === 'image' ? (
                                <ImageIcon className="h-4 w-4" />
                              ) : attachment.type === 'code' ? (
                                <Code className="h-4 w-4" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                              <span className="text-xs">{attachment.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Message Footer */}
                      {message.role === 'assistant' && message.status === 'complete' && (
                        <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => copyMessage(message.content)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => provideFeedback(message.id, 'positive')}
                            >
                              <ThumbsUp className={cn("h-3 w-3", message.feedback === 'positive' && "text-green-500")} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => provideFeedback(message.id, 'negative')}
                            >
                              <ThumbsDown className={cn("h-3 w-3", message.feedback === 'negative' && "text-red-500")} />
                            </Button>
                          </div>
                          {message.cost && (
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span>Cost: ${message.cost.toFixed(4)}</span>
                              {message.tokens && (
                                <span>Tokens: {message.tokens.total}</span>
                              )}
                              {message.latency && (
                                <span>Latency: {message.latency}ms</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isStreaming && (
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="animate-pulse">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                  <span className="text-sm">AI is thinking...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Input Area */}
          <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm p-4">
            <div className="max-w-4xl mx-auto">
              <CleanInput
                onSend={(text) => handleSendMessage(text, selectedMode)}
                isLoading={isLoading || isStreaming}
                currentMode={selectedMode}
                onModeChange={setSelectedMode}
                onFileAttach={(files) => handleFileUpload(files as any)}
                attachedFiles={[]}
                onRemoveFile={(index) => {
                  const attachmentToRemove = attachments[index]
                  if (attachmentToRemove) {
                    removeAttachment(attachmentToRemove.id)
                  }
                }}
              />
              
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Tip: {autoOptimize ? 'Auto-optimizing for best model' : `Using ${selectedModel.name}`}</span>
                  {savedAmount > 0 && (
                    <span className="text-green-400">Saved ${savedAmount.toFixed(2)} today!</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setAutoOptimize(!autoOptimize)}
                    className={cn(autoOptimize && "text-indigo-400")}
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Auto-Optimize
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setStreamResponse(!streamResponse)}
                    className={cn(streamResponse && "text-indigo-400")}
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Stream
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Info Panel */}
        <InfoPanel
          subscription={(user as any)?.subscription || 'FREE'}
          usage={{
            dailyTokens: limits.dailyUsed * 1000,
            dailyLimit: limits.dailyLimit * 1000,
            monthlyCost: limits.monthlyUsed,
            monthlyBudget: limits.monthlyLimit
          }}
          activeCollaborators={currentThread?.sharedWith?.length || 0}
          currentModel={selectedModel.name}
          estimatedCost={promptAnalysis ? (promptAnalysis.estimatedTokens / 1000) * selectedModel.inputCost : 0}
          className="w-64 border-l border-gray-800"
        />
      </div>
    </div>
  )
}