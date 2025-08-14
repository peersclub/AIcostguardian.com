'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { toast } from 'sonner'
import { 
  Sparkles, Send, Paperclip, Mic, MicOff, Image, FileText, 
  Code, Zap, Brain, TrendingUp, DollarSign, Users, Plus,
  Settings, ChevronLeft, ChevronRight, X, Check, AlertCircle,
  Loader2, Copy, ThumbsUp, ThumbsDown, RefreshCw, Share2,
  Lock, Unlock, Eye, EyeOff, Download, Upload, Hash,
  MessageSquare, History, Star, ArrowUp, ArrowDown, 
  GitBranch, Target, Shield, Activity, BarChart3, Crown,
  Layers, Command, Cpu, Database, Globe, Wand2, Bot,
  PlusCircle, MinusCircle, ChevronDown, ChevronUp,
  Volume2, VolumeX, Play, Pause, StopCircle, FastForward
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { PromptAnalyzer, analyzePrompt } from './components/prompt-analyzer'
import { CleanInput } from './components/clean-input'
import { ParticipantManager } from './components/participant-manager'
import { ModelSwitcher } from './components/model-switcher'
import { ThreadManager } from './components/thread-manager'
import { InfoPanel } from './components/info-panel'
import { getModeSettings, OptimizationMode } from './components/mode-selector'
import { useWebSocket } from '@/lib/websocket'

// Types
interface User {
  id: string
  name: string
  email: string
  image: string
  organization: string | null
  hasApiKeys: boolean
  isEnterpriseUser: boolean
}

interface Limits {
  dailyUsed: number
  dailyLimit: number
  monthlyUsed: number
  monthlyLimit: number
  tokensUsedToday: number
}

interface Thread {
  id: string
  title: string
  preview: string
  timestamp: string
  messageCount: number
  cost: number
  status: 'active' | 'archived' | 'shared'
  collaborators?: string[]
  participants?: any[]
  tags?: string[]
  isPinned?: boolean
}

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  model?: string
  provider?: string
  cost?: number
  tokens?: {
    prompt: number
    completion: number
    total: number
  }
  latency?: number
  status?: 'sending' | 'processing' | 'streaming' | 'complete' | 'error'
  error?: string
  feedback?: 'positive' | 'negative' | null
  attachments?: Attachment[]
  metadata?: {
    temperature?: number
    maxTokens?: number
    topP?: number
  }
}

interface Attachment {
  id: string
  type: 'image' | 'document' | 'code'
  name: string
  size: number
  url: string
  mimeType: string
}

interface ModelOption {
  id: string
  name: string
  provider: string
  contextWindow: number
  inputCost: number
  outputCost: number
  speed: 'fast' | 'medium' | 'slow'
  capabilities: string[]
  icon: string
}

// Available models with real costs
const MODELS: ModelOption[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    contextWindow: 128000,
    inputCost: 0.005,
    outputCost: 0.015,
    speed: 'medium',
    capabilities: ['chat', 'vision', 'function-calling'],
    icon: '🟢'
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    contextWindow: 200000,
    inputCost: 0.015,
    outputCost: 0.075,
    speed: 'slow',
    capabilities: ['chat', 'vision', 'analysis'],
    icon: '🟣'
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    contextWindow: 200000,
    inputCost: 0.003,
    outputCost: 0.015,
    speed: 'medium',
    capabilities: ['chat', 'vision', 'analysis'],
    icon: '🔵'
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    contextWindow: 32000,
    inputCost: 0.00125,
    outputCost: 0.00375,
    speed: 'fast',
    capabilities: ['chat', 'vision'],
    icon: '🔶'
  },
  {
    id: 'grok-beta',
    name: 'Grok Beta',
    provider: 'xAI',
    contextWindow: 100000,
    inputCost: 0.005,
    outputCost: 0.015,
    speed: 'fast',
    capabilities: ['chat', 'realtime'],
    icon: '⚡'
  }
]

interface AIOptimiseV2ClientProps {
  user: User
  limits: Limits
}

export default function AIOptimiseV2Client({ user, limits }: AIOptimiseV2ClientProps) {
  // Core state
  const [threads, setThreads] = useState<Thread[]>([])
  const [currentThread, setCurrentThread] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedMode, setSelectedMode] = useState<OptimizationMode>('focus')
  const [promptAnalysis, setPromptAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [threadParticipants, setThreadParticipants] = useState<any[]>([])
  
  // WebSocket integration
  const {
    isConnected: wsConnected,
    participants: wsParticipants,
    typingUsers: wsTypingUsers,
    startTyping: wsStartTyping,
    stopTyping: wsStopTyping,
    updatePresence,
    broadcastModelChange,
    broadcastCostUpdate
  } = useWebSocket(user.email, currentThread?.id)
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState<ModelOption>(MODELS[1]) // Default to Claude Sonnet
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isRecording, setIsRecording] = useState(false)
  
  // Features state
  const [autoOptimize, setAutoOptimize] = useState(true)
  const [streamResponse, setStreamResponse] = useState(true)
  const [saveHistory, setSaveHistory] = useState(true)
  const [currentCost, setCurrentCost] = useState(0)
  const [savedAmount, setSavedAmount] = useState(0)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Animation controls
  const controls = useAnimation()
  
  // Calculate usage percentages
  const dailyUsagePercent = (limits.dailyUsed / limits.dailyLimit) * 100
  const monthlyUsagePercent = (limits.monthlyUsed / limits.monthlyLimit) * 100
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])
  
  // Analyze prompt when input changes
  useEffect(() => {
    if (input.length > 5) {
      setIsAnalyzing(true)
      // Notify others that we're typing
      if (wsConnected && currentThread) {
        wsStartTyping()
      }
      const timer = setTimeout(() => {
        const analysis = analyzePrompt(input, selectedMode)
        setPromptAnalysis(analysis)
        setIsAnalyzing(false)
      }, 300) // Debounce analysis
      return () => {
        clearTimeout(timer)
        // Stop typing notification
        if (wsConnected && currentThread) {
          wsStopTyping()
        }
      }
    } else {
      setPromptAnalysis(null)
      if (wsConnected && currentThread) {
        wsStopTyping()
      }
    }
  }, [input, selectedMode, wsConnected, currentThread, wsStartTyping, wsStopTyping])
  
  // Load initial data
  useEffect(() => {
    loadThreads()
    checkApiKeys()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const loadThreads = async () => {
    try {
      const res = await fetch('/api/aioptimise/threads')
      if (res.ok) {
        const data = await res.json()
        setThreads(data.threads || [])
        if (data.threads?.length > 0 && !currentThread) {
          selectThread(data.threads[0])
        }
      }
    } catch (error) {
      console.error('Failed to load threads:', error)
    }
  }
  
  const checkApiKeys = async () => {
    if (!user.hasApiKeys) {
      toast.error('No API keys configured', {
        description: 'Please add your API keys in Settings to use AIOptimise',
        action: {
          label: 'Go to Settings',
          onClick: () => window.location.href = '/settings/api-keys'
        }
      })
    }
  }
  
  const selectThread = async (thread: Thread) => {
    setCurrentThread(thread)
    try {
      const res = await fetch(`/api/aioptimise/threads/${thread.id}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
      
      // Mock participants for demo
      setThreadParticipants([
        {
          id: user.email,
          name: user.name,
          email: user.email,
          avatar: user.image,
          role: 'owner',
          status: 'online',
          joinedAt: new Date().toISOString(),
          permissions: {
            canEdit: true,
            canDelete: true,
            canInvite: true,
            canManageModels: true,
            canViewCosts: true
          }
        }
      ])
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }
  
  const createNewThread = async () => {
    try {
      const res = await fetch('/api/aioptimise/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Conversation',
          mode: 'standard'
        })
      })
      
      if (res.ok) {
        const thread = await res.json()
        setThreads(prev => [thread, ...prev])
        setCurrentThread(thread)
        setMessages([])
        toast.success('New conversation started')
      }
    } catch (error) {
      toast.error('Failed to create new thread')
    }
  }
  
  const handleSendMessage = async (messageText: string, mode: string, modelOverride?: any) => {
    if (!messageText.trim() || isLoading || !user.hasApiKeys) return
    
    // Apply mode settings
    const modeSettings = getModeSettings(selectedMode)
    
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
      attachments: [...attachments],
      status: 'sending'
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setAttachments([])
    setIsLoading(true)
    setIsStreaming(true)
    
    try {
      const res = await fetch('/api/aioptimise/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: currentThread?.id,
          message: messageText,
          mode: mode,
          modelOverride: modelOverride
        })
      })
      
      if (!res.ok) {
        throw new Error('Failed to send message')
      }
      
      // Handle SSE streaming
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        status: 'streaming'
      }
      
      setMessages(prev => [...prev, assistantMessage])
      
      let buffer = ''
      let fullContent = ''
      let analysisReceived = false
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                setIsStreaming(false)
                break
              }
              
              try {
                const parsed = JSON.parse(data)
                
                if (parsed.type === 'analysis' && !analysisReceived) {
                  // Handle analysis data
                  analysisReceived = true
                  console.log('Analysis received:', parsed.analysis)
                  // Update message with model info
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { 
                          ...msg, 
                          model: parsed.analysis.selectedModel?.model,
                          provider: parsed.analysis.selectedModel?.provider
                        }
                      : msg
                  ))
                } else if (parsed.type === 'token') {
                  // Handle streaming tokens
                  fullContent += parsed.content || ''
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: fullContent }
                      : msg
                  ))
                } else if (parsed.type === 'error') {
                  toast.error(parsed.error || 'An error occurred')
                  setIsStreaming(false)
                  break
                } else if (parsed.type === 'done') {
                  // Final message with metadata
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { 
                          ...msg, 
                          status: 'complete',
                          cost: parsed.cost,
                          tokens: parsed.tokens
                        }
                      : msg
                  ))
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e)
              }
            }
          }
        }
      }
      
      // Mark message as complete
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, status: 'complete' }
          : msg
      ))
      
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }
  
  const sendMessage = async () => {
    if (!input.trim() && attachments.length === 0) return
    if (!user.hasApiKeys) {
      toast.error('Please configure API keys first')
      return
    }
    
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      attachments: [...attachments],
      status: 'sending'
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setAttachments([])
    setIsLoading(true)
    
    // Animate cost prediction
    const estimatedCost = calculateEstimatedCost(input, selectedModel)
    setCurrentCost(prev => prev + estimatedCost)
    
    try {
      // If auto-optimize is on, select best model
      const modelToUse = autoOptimize ? await selectOptimalModel(input) : selectedModel
      
      // Show optimization savings
      if (autoOptimize && modelToUse.id !== selectedModel.id) {
        const saved = (selectedModel.inputCost - modelToUse.inputCost) * input.length / 1000
        setSavedAmount(prev => prev + saved)
        toast.success(`Optimized! Saved $${saved.toFixed(4)} by using ${modelToUse.name}`)
      }
      
      // Broadcast cost update via WebSocket
      if (wsConnected && currentThread) {
        const estimatedCost = calculateEstimatedCost(input, modelToUse)
        broadcastCostUpdate(estimatedCost)
      }
      
      const res = await fetch('/api/aioptimise/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: currentThread?.id,
          message: input,
          model: modelToUse.id,
          provider: modelToUse.provider,
          attachments: attachments,
          stream: streamResponse
        })
      })
      
      if (!res.ok) throw new Error('Failed to send message')
      
      if (streamResponse) {
        setIsStreaming(true)
        const reader = res.body?.getReader()
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
        
        if (reader) {
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
          
          // Update with final metadata
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, status: 'complete', content: fullContent }
              : msg
          ))
        }
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
  
  const calculateEstimatedCost = (text: string, model: ModelOption) => {
    const tokens = text.length / 4 // Rough estimation
    return (tokens / 1000) * model.inputCost
  }
  
  const selectOptimalModel = async (prompt: string): Promise<ModelOption> => {
    // Use prompt analysis for smarter model selection
    const analysis = promptAnalysis || analyzePrompt(prompt, selectedMode)
    
    // Mode-based model selection
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
    
    // Focus mode - optimize for speed and cost
    if (selectedMode === 'focus') {
      if (analysis.complexity === 'simple') {
        return MODELS.find(m => m.id === 'gemini-pro') || selectedModel
      }
      return MODELS.find(m => m.id === 'gpt-4o') || selectedModel
    }
    
    // Fallback to suggested model from analysis
    const suggestedModelId = analysis.suggestedModel.toLowerCase().replace(/ /g, '-')
    return MODELS.find(m => m.id.includes(suggestedModelId)) || selectedModel
  }
  
  const handleFileUpload = (files: FileList) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const attachment: Attachment = {
          id: `att-${Date.now()}-${Math.random()}`,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          name: file.name,
          size: file.size,
          url: event.target?.result as string,
          mimeType: file.type
        }
        setAttachments(prev => [...prev, attachment])
      }
      reader.readAsDataURL(file)
    })
  }
  
  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }
  
  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        // Start recording logic here
        setIsRecording(true)
        toast.success('Recording started')
      } catch (error) {
        toast.error('Microphone access denied')
      }
    } else {
      setIsRecording(false)
      toast.success('Recording stopped')
      // Process and transcribe audio
    }
  }
  
  const regenerateMessage = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (!message || message.role !== 'assistant') return
    
    toast.info('Regenerating response...')
    // Regeneration logic here
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

  return (
    <div className="fixed inset-0 bg-gray-950 overflow-hidden">
      {/* Simplified background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />

      <div className="relative z-10 h-full flex">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-72 flex flex-col"
            >
              <ThreadManager
                threads={threads.map(t => ({
                  ...t,
                  pinned: t.isPinned || false,
                  archived: false,
                  tags: [],
                  collaborators: t.sharedWith
                }))}
                currentThreadId={currentThread?.id || null}
                onSelectThread={selectThread}
                onCreateThread={createNewThread}
                onDeleteThread={deleteThread}
                onArchiveThread={(id) => console.log('Archive', id)}
                onPinThread={togglePin}
                onShareThread={(id) => setShareThreadId(id)}
                onRenameThread={(id, title) => {
                  setThreads(prev => prev.map(t => 
                    t.id === id ? { ...t, title } : t
                  ))
                }}
                onInviteCollaborator={async (threadId, email) => {
                  await shareThread(threadId, email)
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="h-14 bg-gray-900/50 border-b border-gray-800 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                    </div>
                    <div>
                      <h2 className="font-bold text-white">AIOptimise V2</h2>
                      <p className="text-xs text-gray-400">Next-gen AI Assistant</p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* New Thread Button */}
                <Button
                  onClick={createNewThread}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Conversation
                </Button>
              </div>
              
              {/* Usage Stats */}
              <div className="p-4 border-b border-gray-800">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Daily Usage</span>
                      <span className="text-white">${limits.dailyUsed.toFixed(2)} / ${limits.dailyLimit}</span>
                    </div>
                    <Progress value={dailyUsagePercent} className="h-1.5 bg-gray-800">
                      <div 
                        className={cn(
                          "h-full transition-all",
                          dailyUsagePercent > 90 ? "bg-red-500" :
                          dailyUsagePercent > 75 ? "bg-yellow-500" :
                          "bg-gradient-to-r from-indigo-500 to-purple-500"
                        )}
                        style={{ width: `${Math.min(dailyUsagePercent, 100)}%` }}
                      />
                    </Progress>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Monthly Usage</span>
                      <span className="text-white">${limits.monthlyUsed.toFixed(2)} / ${limits.monthlyLimit}</span>
                    </div>
                    <Progress value={monthlyUsagePercent} className="h-1.5 bg-gray-800">
                      <div 
                        className={cn(
                          "h-full transition-all",
                          monthlyUsagePercent > 90 ? "bg-red-500" :
                          monthlyUsagePercent > 75 ? "bg-yellow-500" :
                          "bg-gradient-to-r from-indigo-500 to-purple-500"
                        )}
                        style={{ width: `${Math.min(monthlyUsagePercent, 100)}%` }}
                      />
                    </Progress>
                  </div>
                  
                  {savedAmount > 0 && (
                    <div className="flex items-center justify-between p-2 bg-green-500/10 rounded-lg border border-green-500/30">
                      <span className="text-xs text-green-400">Saved Today</span>
                      <span className="text-sm font-bold text-green-400">${savedAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "mb-4",
                        message.role === 'user' ? "flex justify-end" : "flex justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[80%] rounded-xl p-4",
                        message.role === 'user' 
                          ? "bg-indigo-600/20 border border-indigo-500/30" 
                          : "bg-gray-800/50 border border-gray-700"
                      )}>
                        <div className="text-sm text-white">
                          {message.content}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                          {message.model && (
                            <Badge variant="secondary" className="text-xs">
                              {message.model}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Settings */}
              <div className="p-4 border-t border-gray-800">
                <div className="space-y-2">
                  <label className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Auto-Optimize</span>
                    <button
                      onClick={() => setAutoOptimize(!autoOptimize)}
                      className={cn(
                        "w-10 h-5 rounded-full transition-all",
                        autoOptimize ? "bg-indigo-600" : "bg-gray-700"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 bg-white rounded-full transition-all",
                        autoOptimize ? "translate-x-5" : "translate-x-0.5"
                      )} />
                    </button>
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Stream Responses</span>
                    <button
                      onClick={() => setStreamResponse(!streamResponse)}
                      className={cn(
                        "w-10 h-5 rounded-full transition-all",
                        streamResponse ? "bg-indigo-600" : "bg-gray-700"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 bg-white rounded-full transition-all",
                        streamResponse ? "translate-x-5" : "translate-x-0.5"
                      )} />
                    </button>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Sidebar Toggle (when closed) */}
        {!sidebarOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSidebarOpen(true)}
            className="absolute left-4 top-4 z-20 p-2 bg-gray-900/50 backdrop-blur-xl rounded-lg border border-gray-800 text-gray-400 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        )}
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="h-16 bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              {currentThread && (
                <>
                  <h1 className="text-lg font-semibold text-white">{currentThread.title}</h1>
                  {currentThread.collaborators && currentThread.collaborators.length > 0 && (
                    <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                      <Users className="w-3 h-3 mr-1" />
                      {currentThread.collaborators.length} collaborating
                    </Badge>
                  )}
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* WebSocket Status */}
              {wsConnected && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1" />
                  Live
                </Badge>
              )}
              
              {/* Mode Selector */}
              <div className="flex items-center bg-gray-800/50 rounded-lg border border-gray-700 p-1">
                {[
                  { id: 'focus', icon: Target, label: 'Focus', color: 'text-blue-400' },
                  { id: 'coding', icon: Code, label: 'Coding', color: 'text-green-400' },
                  { id: 'creative', icon: Sparkles, label: 'Creative', color: 'text-purple-400' },
                  { id: 'analysis', icon: Brain, label: 'Analysis', color: 'text-orange-400' }
                ].map((mode) => {
                  const Icon = mode.icon
                  return (
                    <TooltipProvider key={mode.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setSelectedMode(mode.id as any)}
                            className={cn(
                              "px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all",
                              selectedMode === mode.id
                                ? "bg-gray-700 text-white"
                                : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                            )}
                          >
                            <Icon className={cn("w-4 h-4", selectedMode === mode.id && mode.color)} />
                            <span className="text-xs font-medium">{mode.label}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {mode.id === 'focus' && 'Quick, efficient responses'}
                            {mode.id === 'coding' && 'Optimized for code generation'}
                            {mode.id === 'creative' && 'Enhanced creative writing'}
                            {mode.id === 'analysis' && 'Deep analysis and reasoning'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </div>
              
              {/* Model Selector */}
              <ModelSwitcher
                selectedModel={selectedModel}
                onModelChange={(model) => {
                  setSelectedModel(model)
                  // Broadcast model change to other participants
                  if (wsConnected && currentThread) {
                    broadcastModelChange(model.name)
                  }
                }}
                mode={selectedMode}
                usage={{
                  dailySpent: limits.dailyUsed,
                  dailyLimit: limits.dailyLimit,
                  tokensUsed: limits.tokensUsedToday
                }}
                isEnterprise={user.isEnterpriseUser}
                onCompare={(models) => {
                  console.log('Comparing models:', models)
                  // Could open a comparison modal here
                }}
              />
              
              {/* Current Session Cost */}
              <div className="px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-white">${currentCost.toFixed(4)}</span>
                </div>
              </div>
              
              {/* Participant Manager */}
              {currentThread && (
                <ParticipantManager
                  threadId={currentThread.id}
                  currentUserId={user.email}
                  participants={threadParticipants}
                  onInvite={(email, role) => {
                    console.log('Inviting:', email, role)
                    toast.success(`Invitation sent to ${email}`)
                  }}
                  onRemove={(participantId) => {
                    setThreadParticipants(prev => prev.filter(p => p.id !== participantId))
                    toast.success('Participant removed')
                  }}
                  onUpdateRole={(participantId, role) => {
                    setThreadParticipants(prev => prev.map(p => 
                      p.id === participantId ? { ...p, role } : p
                    ))
                    toast.success('Role updated')
                  }}
                  onUpdatePermissions={(participantId, permissions) => {
                    setThreadParticipants(prev => prev.map(p => 
                      p.id === participantId ? { ...p, permissions } : p
                    ))
                  }}
                  isCollaborationEnabled={user.isEnterpriseUser}
                  maxParticipants={user.isEnterpriseUser ? 20 : 5}
                />
              )}
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
                      "mb-6",
                      message.role === 'user' ? "flex justify-end" : "flex justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[80%] rounded-2xl p-4",
                      message.role === 'user' 
                        ? "bg-indigo-600/20 border border-indigo-500/30" 
                        : "bg-gray-800/50 border border-gray-700"
                    )}>
                      {/* Message Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {message.role === 'assistant' && (
                            <>
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                <Bot className="w-3 h-3 text-white" />
                              </div>
                              {message.model && (
                                <Badge className="bg-gray-700 text-gray-300 text-xs">
                                  {message.model}
                                </Badge>
                              )}
                            </>
                          )}
                          {message.role === 'user' && (
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={user.image} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                          )}
                          <span className="text-xs text-gray-400">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        {/* Message Actions */}
                        {message.role === 'assistant' && message.status === 'complete' && (
                          <div className="flex items-center gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="w-6 h-6"
                                    onClick={() => copyMessage(message.content)}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className={cn(
                                      "w-6 h-6",
                                      message.feedback === 'positive' && "text-green-400"
                                    )}
                                    onClick={() => provideFeedback(message.id, 'positive')}
                                  >
                                    <ThumbsUp className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Helpful</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className={cn(
                                      "w-6 h-6",
                                      message.feedback === 'negative' && "text-red-400"
                                    )}
                                    onClick={() => provideFeedback(message.id, 'negative')}
                                  >
                                    <ThumbsDown className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Not Helpful</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="w-6 h-6"
                                    onClick={() => regenerateMessage(message.id)}
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Regenerate</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}
                      </div>
                      
                      {/* Message Content */}
                      <div className="text-sm text-white">
                        {message.status === 'streaming' ? (
                          <div className="space-y-2">
                            <div className="prose prose-invert prose-sm max-w-none">
                              <ReactMarkdown>
                                {message.content}
                              </ReactMarkdown>
                            </div>
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                              <span className="text-xs text-indigo-400">Generating...</span>
                            </div>
                          </div>
                        ) : (
                          <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown 
                              components={{
                                code({node, className, children, ...props}: any) {
                                  const match = /language-(\w+)/.exec(className || '')
                                  const inline = !match
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
                                  )
                                }
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="p-2 bg-gray-700 rounded-lg flex items-center gap-2"
                            >
                              {attachment.type === 'image' ? (
                                <>
                                  <Image className="w-4 h-4 text-blue-400" />
                                  <span className="sr-only">Image attachment</span>
                                </>
                              ) : (
                                <FileText className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-xs text-gray-300">{attachment.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Message Metadata */}
                      {message.role === 'assistant' && message.cost && (
                        <div className="mt-3 pt-3 border-t border-gray-700 flex items-center gap-4 text-xs text-gray-400">
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
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Typing Indicator */}
              {isLoading && !isStreaming && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-gray-400"
                >
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                  <span className="text-sm">AI is thinking...</span>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Input Area */}
          <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-xl p-4">
            <div className="max-w-4xl mx-auto">
              {/* Clean Input */}
              <CleanInput
                onSend={handleSendMessage}
                isLoading={isLoading}
                currentMode={selectedMode}
                onModeChange={(mode) => setSelectedMode(mode as 'focus' | 'coding' | 'creative' | 'analysis')}
                onFileAttach={(files) => {
                  const newAttachments: Attachment[] = files.map(file => ({
                    id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: file.type.startsWith('image/') ? 'image' : 
                          file.type.includes('code') || file.name.match(/\.(js|ts|py|java|cpp|c|h|css|html|jsx|tsx|json|xml|yaml|yml)$/i) ? 'code' : 
                          'document',
                    name: file.name,
                    size: file.size,
                    url: URL.createObjectURL(file),
                    mimeType: file.type
                  }))
                  setAttachments(prev => [...prev, ...newAttachments])
                }}
                attachedFiles={attachments.map(a => new File([], a.name, { type: a.mimeType }))}
                onRemoveFile={(index) => {
                  const attachment = attachments[index]
                  if (attachment) {
                    removeAttachment(attachment.id)
                  }
                }}
              />
              
              {/* Tips */}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Tip: {autoOptimize ? 'Auto-optimizing for best model' : 'Using ' + selectedModel.name}</span>
                  {savedAmount > 0 && (
                    <span className="text-green-400">Saved ${savedAmount.toFixed(2)} today!</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {user.isEnterpriseUser && (
                    <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30">
                      <Crown className="w-3 h-3 mr-1" />
                      Enterprise
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Sidebar - Info Panel */}
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
          estimatedCost={0}
          className="w-64"
        />
      </div>
    </div>
  )
}