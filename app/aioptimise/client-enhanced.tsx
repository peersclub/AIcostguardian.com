'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { formatDistanceToNow, format, isValid } from 'date-fns'
import {
  Send, Paperclip, Mic, StopCircle, Zap, Plus, Search,
  Settings, ChevronRight, ChevronLeft, Sparkles, Copy,
  ThumbsUp, ThumbsDown, RefreshCw, Download, Share2,
  Brain, Gauge, DollarSign, Timer, Cpu, Users, Archive,
  Pin, Trash2, MoreVertical, Edit2, Tag, X, Check,
  FileText, Image as ImageIcon, Code, Hash, MessageSquare,
  TrendingUp, AlertCircle, Lightbulb, BookOpen, Menu,
  Globe, Database, Upload, Eye, EyeOff, Clock,
  User, Bot, Loader2, ChevronDown, Maximize2, MessageSquareOff,
  Shield, Key, ExternalLink, Palette, ChevronUp, ArrowLeft, Folder
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ShareThreadDialog } from './components/share-thread-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { useThreadManager } from './hooks/useThreadManager'
import { useApiKeys } from '@/hooks/use-api-keys'
import type { Provider } from '@/lib/core/api-key.service'
import { ContextPanel } from '@/components/ai-projects/ContextPanel'
import { ProjectSettings } from '@/components/ai-projects/ProjectSettings'
import { getAIProviderLogoWithFallback } from '@/components/ui/ai-logos'

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
  thinkingSteps?: ThinkingStep[]
}

interface ThinkingStep {
  id: string
  title: string
  content: string
  status: 'pending' | 'active' | 'complete'
  duration?: number
}

interface Attachment {
  id: string
  type: 'image' | 'file' | 'code'
  name: string
  size: number
  url?: string
  content?: string
  uploadProgress?: number
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
  provider: Provider
  contextLength: number
  inputCost: number
  outputCost: number
  speed: 'fast' | 'medium' | 'slow'
  capabilities: string[]
  requiresApiKey?: boolean
}

interface PromptAnalysis {
  complexity: 'simple' | 'moderate' | 'complex' | 'expert'
  category: string
  suggestedModel: string
  estimatedTokens: number
  requiresContext: boolean
  requiresWeb: boolean
  estimatedCost: number
}

interface CollaboratorStatus {
  id: string
  name: string
  email: string
  avatar?: string
  isOnline: boolean
  lastSeen: string
  isTyping: boolean
  cursor?: { x: number; y: number }
}

interface AIOptimiseClientProps {
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

// Constants - Provider logo renderer
const getProviderIcon = (provider: string, className: string = "w-4 h-4") => {
  return getAIProviderLogoWithFallback(provider, className, true)
}

const MODELS: ModelOption[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    contextLength: 128000,
    inputCost: 0.005,
    outputCost: 0.015,
    speed: 'medium',
    capabilities: ['reasoning', 'coding', 'analysis', 'creative', 'vision'],
    requiresApiKey: true
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    contextLength: 128000,
    inputCost: 0.00015,
    outputCost: 0.0006,
    speed: 'fast',
    capabilities: ['reasoning', 'coding', 'analysis', 'creative', 'vision'],
    requiresApiKey: true
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    contextLength: 128000,
    inputCost: 0.01,
    outputCost: 0.03,
    speed: 'medium',
    capabilities: ['reasoning', 'coding', 'analysis', 'creative', 'vision'],
    requiresApiKey: true
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    contextLength: 16385,
    inputCost: 0.0005,
    outputCost: 0.0015,
    speed: 'fast',
    capabilities: ['reasoning', 'coding', 'analysis', 'creative'],
    requiresApiKey: true
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'claude',
    contextLength: 200000,
    inputCost: 0.015,
    outputCost: 0.075,
    speed: 'slow',
    capabilities: ['reasoning', 'coding', 'analysis', 'creative', 'vision'],
    requiresApiKey: true
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'claude',
    contextLength: 200000,
    inputCost: 0.003,
    outputCost: 0.015,
    speed: 'medium',
    capabilities: ['reasoning', 'coding', 'analysis', 'vision'],
    requiresApiKey: true
  },
  {
    id: 'claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'claude',
    contextLength: 200000,
    inputCost: 0.0008,
    outputCost: 0.004,
    speed: 'fast',
    capabilities: ['reasoning', 'coding', 'analysis'],
    requiresApiKey: true
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'claude',
    contextLength: 200000,
    inputCost: 0.003,
    outputCost: 0.015,
    speed: 'medium',
    capabilities: ['reasoning', 'coding', 'analysis', 'vision'],
    requiresApiKey: true
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    contextLength: 2000000,
    inputCost: 0.0035,
    outputCost: 0.0105,
    speed: 'medium',
    capabilities: ['reasoning', 'coding', 'analysis', 'creative', 'vision'],
    requiresApiKey: true
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    contextLength: 1000000,
    inputCost: 0.00035,
    outputCost: 0.00105,
    speed: 'fast',
    capabilities: ['reasoning', 'analysis', 'creative', 'vision'],
    requiresApiKey: true
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'gemini',
    contextLength: 32000,
    inputCost: 0.0005,
    outputCost: 0.0015,
    speed: 'fast',
    capabilities: ['reasoning', 'analysis', 'creative'],
    requiresApiKey: true
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'mistral',
    contextLength: 32000,
    inputCost: 0.008,
    outputCost: 0.024,
    speed: 'medium',
    capabilities: ['reasoning', 'coding', 'analysis', 'creative'],
    requiresApiKey: true
  },
  {
    id: 'mistral-medium',
    name: 'Mistral Medium',
    provider: 'mistral',
    contextLength: 32000,
    inputCost: 0.0027,
    outputCost: 0.0081,
    speed: 'fast',
    capabilities: ['reasoning', 'coding', 'analysis'],
    requiresApiKey: true
  },
  {
    id: 'pplx-7b-online',
    name: 'Perplexity 7B Online',
    provider: 'perplexity',
    contextLength: 4096,
    inputCost: 0.0007,
    outputCost: 0.0028,
    speed: 'fast',
    capabilities: ['reasoning', 'analysis', 'web-search'],
    requiresApiKey: true
  },
  {
    id: 'pplx-70b-online',
    name: 'Perplexity 70B Online',
    provider: 'perplexity',
    contextLength: 4096,
    inputCost: 0.001,
    outputCost: 0.001,
    speed: 'medium',
    capabilities: ['reasoning', 'analysis', 'web-search'],
    requiresApiKey: true
  },
  {
    id: 'grok-beta',
    name: 'Grok Beta',
    provider: 'grok',
    contextLength: 131072,
    inputCost: 0.000005,
    outputCost: 0.000015,
    speed: 'fast',
    capabilities: ['reasoning', 'humor', 'real-time'],
    requiresApiKey: true
  }
]

const MODES = [
  { 
    id: 'chat', 
    label: 'Chat', 
    icon: MessageSquare, 
    description: 'General conversation',
    color: 'text-blue-400'
  },
  { 
    id: 'coding', 
    label: 'Code', 
    icon: Code, 
    description: 'Programming assistance',
    color: 'text-purple-400'
  },
  { 
    id: 'analysis', 
    label: 'Analysis', 
    icon: Brain, 
    description: 'Data & research',
    color: 'text-green-400'
  },
  { 
    id: 'creative', 
    label: 'Creative', 
    icon: Sparkles, 
    description: 'Writing & ideation',
    color: 'text-yellow-400'
  },
  { 
    id: 'focus', 
    label: 'Focus', 
    icon: Zap, 
    description: 'Quick, concise answers',
    color: 'text-orange-400'
  },
  {
    id: 'web',
    label: 'Web Search',
    icon: Globe,
    description: 'Search the web for current information',
    color: 'text-cyan-400'
  },
  {
    id: 'internal',
    label: 'Internal Data',
    icon: Database,
    description: 'Search company knowledge base',
    color: 'text-red-400'
  }
]

// Helper functions
const analyzePrompt = (prompt: string, mode: string): PromptAnalysis => {
  const wordCount = prompt.split(' ').length
  const hasCode = /```|function|class|const|let|var|import|export/.test(prompt)
  const hasQuestion = /\?|how|what|why|when|where|who/.test(prompt.toLowerCase())
  const hasAnalysis = /analyze|compare|evaluate|assess|review/.test(prompt.toLowerCase())
  const hasWebQuery = /latest|current|news|recent|today|2024|2025/.test(prompt.toLowerCase())
  
  let complexity: PromptAnalysis['complexity'] = 'simple'
  if (wordCount > 100 || hasCode) complexity = 'moderate'
  if (wordCount > 300 || (hasCode && hasAnalysis)) complexity = 'complex'
  if (wordCount > 500 || prompt.includes('architecture') || prompt.includes('system design')) complexity = 'expert'
  
  const suggestedModelId = complexity === 'simple' ? 'gemini-pro' : 
                          complexity === 'expert' ? 'claude-3-opus' : 'gpt-4o'
  const suggestedModel = MODELS.find(m => m.id === suggestedModelId)!
  
  const estimatedTokens = Math.ceil(wordCount * 1.3)
  const estimatedCost = (estimatedTokens / 1000) * suggestedModel.inputCost
  
  return {
    complexity,
    category: hasCode ? 'technical' : hasAnalysis ? 'analytical' : 'conversational',
    suggestedModel: suggestedModelId,
    estimatedTokens,
    requiresContext: hasQuestion || hasAnalysis,
    requiresWeb: hasWebQuery || mode === 'web',
    estimatedCost
  }
}

const formatDate = (dateString: string | Date | undefined) => {
  try {
    if (!dateString) {
      return 'Just now'
    }

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    if (!isValid(date)) {
      return 'Just now'
    }

    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true })
    } else {
      return format(date, 'MMM d, yyyy')
    }
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Invalid date'
  }
}

// Custom hooks
const useKeyboardShortcuts = (callbacks: { [key: string]: () => void }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCmd = event.metaKey || event.ctrlKey
      const key = event.key.toLowerCase()
      
      if (isCmd) {
        const shortcutKey = `cmd+${key}`
        if (callbacks[shortcutKey]) {
          event.preventDefault()
          callbacks[shortcutKey]()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [callbacks])
}

const useWebSocket = (userId: string) => {
  const [connected, setConnected] = useState(false)
  const [collaborators, setCollaborators] = useState<CollaboratorStatus[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!userId) return

    // For Vercel compatibility: Use HTTP polling instead of WebSocket
    // Set initial connected state to true for production
    setConnected(true)
    console.log('Connection status: Using HTTP polling (Vercel compatible)')

    // Optional: Poll for collaboration updates every 30 seconds
    // This is disabled by default to reduce unnecessary API calls
    const pollForUpdates = async () => {
      try {
        // This would hit an API endpoint for collaboration status
        // For now, we'll skip this to avoid unnecessary polling
        // const response = await fetch('/api/collaboration/status')
        // if (response.ok) {
        //   const data = await response.json()
        //   setCollaborators(data.collaborators || [])
        // }
      } catch (error) {
        console.log('Collaboration polling temporarily disabled for production')
      }
    }

    // Uncomment this if you want to enable collaboration polling
    // intervalRef.current = setInterval(pollForUpdates, 30000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [userId])

  const sendMessage = useCallback((type: string, data: any) => {
    // For production: Log the action instead of sending via WebSocket
    console.log(`Collaboration action: ${type}`, data)
    // In a full implementation, this would send the data via HTTP API
  }, [])

  return { connected, collaborators, sendMessage }
}

export default function AIOptimiseClient({ user, limits }: AIOptimiseClientProps) {
  const router = useRouter()
  const { keys, hasValidKey, getHealthyProviders, refreshKeys, isLoading: keysLoading } = useApiKeys()
  
  // Core state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])

  // Pagination state
  const [hasMoreOlderMessages, setHasMoreOlderMessages] = useState(false)
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [infoPanelOpen, setInfoPanelOpen] = useState(true)
  const [selectedMode, setSelectedMode] = useState('chat')
  const [selectedModel, setSelectedModel] = useState(MODELS[0])
  const [autoOptimize, setAutoOptimize] = useState(true)
  const [streamResponse, setStreamResponse] = useState(true)
  const [showCostBreakdown, setShowCostBreakdown] = useState(false)

  // Project context state
  const [projectContext, setProjectContext] = useState<any>(null)
  const [contextLoading, setContextLoading] = useState(false)
  const [showProjectSettings, setShowProjectSettings] = useState(false)
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false)

  // Share dialog state
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareSettings, setShareSettings] = useState({
    publicAccess: false,
    allowEditing: false,
    expireDate: '',
    password: ''
  })

  // Thread collaboration state
  const [organizationMembers, setOrganizationMembers] = useState<any[]>([])
  const [loadingOrgMembers, setLoadingOrgMembers] = useState(false)
  
  // File upload state
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  
  // Thread state
  const [threads, setThreads] = useState<any[]>([])
  const [currentThread, setCurrentThread] = useState<any>(null)
  const [threadsLoading, setThreadsLoading] = useState(false)
  const [isAbsorberMode, setIsAbsorberMode] = useState(false)

  // Thread management
  const {
    pinThread,
    unpinThread,
    deleteThread,
    shareThread,
    unshareThread,
    addCollaborator,
    loadThreads
  } = useThreadManager(threads, setThreads, currentThread, setCurrentThread)
  
  // Thread helper functions
  const createThread = useCallback(() => {
    const now = new Date()
    const newThread = {
      id: `thread-${Date.now()}`,
      title: 'New Conversation',
      messages: [],
      createdAt: now,
      updatedAt: now,
      isPinned: false,
      isArchived: false
    }
    setThreads(prev => [newThread, ...prev])
    setCurrentThread(newThread)
    setMessages([])
  }, [])
  
  const selectThread = useCallback(async (threadId: string) => {
    const thread = threads.find(t => t.id === threadId)
    if (thread) {
      setCurrentThread(thread)
      setMessages([]) // Clear messages first
      setHasMoreOlderMessages(false)
      setNextCursor(null)

      try {
        // Fetch initial messages from API (latest first, with pagination)
        const response = await fetch(`/api/aioptimise/threads/${threadId}/messages?limit=20&direction=desc`)
        if (response.ok) {
          const data = await response.json()
          // Messages come in desc order (newest first), so reverse to show chronologically
          const reversedMessages = [...(data.messages || [])].reverse()
          setMessages(reversedMessages)
          setHasMoreOlderMessages(data.hasMore || false)
          setNextCursor(data.nextCursor)
        } else {
          console.error('Failed to fetch messages:', response.statusText)
          setMessages([])
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
        setMessages([])
      }
    }
  }, [threads])
  
  const archiveThread = useCallback((threadId: string) => {
    setThreads(prev => prev.map(t => 
      t.id === threadId ? { ...t, isArchived: true } : t
    ))
    if (currentThread?.id === threadId) {
      setCurrentThread({ ...currentThread, isArchived: true })
    }
  }, [currentThread])
  
  const renameThread = useCallback((threadId: string, newTitle: string) => {
    setThreads(prev => prev.map(t =>
      t.id === threadId ? { ...t, title: newTitle } : t
    ))
    if (currentThread?.id === threadId) {
      setCurrentThread({ ...currentThread, title: newTitle })
    }
  }, [currentThread])

  // Load older messages (pagination)
  const loadOlderMessages = useCallback(async () => {
    if (!currentThread?.id || !hasMoreOlderMessages || !nextCursor || isLoadingOlderMessages) {
      return
    }

    setIsLoadingOlderMessages(true)

    try {
      const response = await fetch(
        `/api/aioptimise/threads/${currentThread.id}/messages?limit=20&direction=desc&cursor=${nextCursor}`
      )

      if (response.ok) {
        const data = await response.json()
        // Messages come in desc order (newest first), so reverse to show chronologically
        const reversedMessages = [...(data.messages || [])].reverse()

        // Add older messages to the beginning of the messages array
        setMessages(prev => [...reversedMessages, ...prev])
        setHasMoreOlderMessages(data.hasMore || false)
        setNextCursor(data.nextCursor)
      } else {
        console.error('Failed to load older messages:', response.statusText)
      }
    } catch (error) {
      console.error('Error loading older messages:', error)
    } finally {
      setIsLoadingOlderMessages(false)
    }
  }, [currentThread?.id, hasMoreOlderMessages, nextCursor, isLoadingOlderMessages])

  const searchThreads = useCallback((query: string) => {
    // Implement search functionality if needed
    return threads.filter(t => 
      t.title?.toLowerCase().includes(query.toLowerCase()) ||
      t.messages?.some((m: any) => m.content?.toLowerCase().includes(query.toLowerCase()))
    )
  }, [threads])
  
  // Performance metrics
  const [currentCost, setCurrentCost] = useState(0)
  const [savedAmount, setSavedAmount] = useState(0)
  const [promptAnalysis, setPromptAnalysis] = useState<PromptAnalysis | null>(null)
  
  // Real-time collaboration
  const { connected: wsConnected, collaborators, sendMessage } = useWebSocket(user.id)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  // Animation controls
  const controls = useAnimation()
  
  // Session
  const { data: session } = useSession()

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'cmd+w': () => {
      setSelectedMode('web')
      toast.success('Web search mode activated')
    },
    'cmd+d': () => {
      setSelectedMode('internal')
      toast.success('Internal data mode activated')
    },
    'cmd+n': () => {
      createThread()
    },
    'cmd+/': () => {
      toast.info('Shortcuts: Cmd+W (Web), Cmd+D (Internal), Cmd+N (New Chat)')
    }
  })
  
  // Effects
  useEffect(() => {
    loadThreads()
  }, [loadThreads])
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  useEffect(() => {
    if (input.length > 10) {
      const timer = setTimeout(() => {
        const analysis = analyzePrompt(input, selectedMode)
        setPromptAnalysis(analysis)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setPromptAnalysis(null)
    }
  }, [input, selectedMode])

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100

      if (isNearBottom) {
        container.scrollTop = container.scrollHeight
      }
    }
  }, [messages])

  // Scroll handler for loading older messages
  useEffect(() => {
    const handleScroll = () => {
      if (!chatContainerRef.current) return

      const container = chatContainerRef.current
      const isNearTop = container.scrollTop < 200 // Trigger when 200px from top

      if (isNearTop && hasMoreOlderMessages && !isLoadingOlderMessages) {
        // Store current scroll position to maintain it after loading
        const currentScrollHeight = container.scrollHeight
        const currentScrollTop = container.scrollTop

        loadOlderMessages().then(() => {
          // Restore scroll position after new messages are added
          setTimeout(() => {
            if (chatContainerRef.current) {
              const newScrollHeight = chatContainerRef.current.scrollHeight
              const scrollDifference = newScrollHeight - currentScrollHeight
              chatContainerRef.current.scrollTop = currentScrollTop + scrollDifference
            }
          }, 0)
        })
      }
    }

    const container = chatContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true })
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [hasMoreOlderMessages, isLoadingOlderMessages, loadOlderMessages])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  // Load organization members when share dialog opens
  useEffect(() => {
    if (shareDialogOpen && organizationMembers.length === 0) {
      loadOrganizationMembers()
    }
  }, [shareDialogOpen, organizationMembers.length])

  // Load thread collaborators when current thread changes
  useEffect(() => {
    if (currentThread?.id) {
      loadThreadCollaborators(currentThread.id)
    }
  }, [currentThread?.id])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFileUpload(files)
  }, [])

  // Load project context for current thread
  const loadProjectContext = async (threadId: string) => {
    if (!threadId) return

    try {
      setContextLoading(true)
      const response = await fetch(`/api/aioptimise/threads/${threadId}/context`)

      if (response.ok) {
        const data = await response.json()
        setProjectContext(data)
      } else if (response.status === 404) {
        // No context exists yet
        setProjectContext(null)
      }
    } catch (error) {
      console.error('Error loading project context:', error)
      setProjectContext(null)
    } finally {
      setContextLoading(false)
    }
  }

  // Absorber mode functions
  const fetchAbsorberMode = async (threadId: string) => {
    if (!threadId) return

    try {
      const response = await fetch(`/api/aioptimise/threads/${threadId}/absorber`)
      if (response.ok) {
        const data = await response.json()
        setIsAbsorberMode(data.aiAbsorberMode || false)
      }
    } catch (error) {
      console.error('Error fetching absorber mode:', error)
    }
  }

  const toggleAbsorberMode = async (enabled: boolean) => {
    if (!currentThread?.id) return

    try {
      const response = await fetch(`/api/aioptimise/threads/${currentThread.id}/absorber`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ absorberMode: enabled }),
      })

      if (response.ok) {
        const data = await response.json()
        setIsAbsorberMode(data.aiAbsorberMode)
        toast.success(data.message)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to toggle absorber mode')
      }
    } catch (error) {
      console.error('Error toggling absorber mode:', error)
      toast.error('Failed to toggle absorber mode')
    }
  }

  // Load context when thread changes
  useEffect(() => {
    if (currentThread?.id) {
      loadProjectContext(currentThread.id)
      fetchAbsorberMode(currentThread.id)
    }
  }, [currentThread?.id])

  // Helper function to check if project settings are overriding dropdown
  const isProjectSettingsActive = () => {
    return projectContext?.defaultModel && projectContext?.defaultProvider &&
           MODELS.find(m => m.id === projectContext.defaultModel && m.provider === projectContext.defaultProvider)
  }

  // Helper function to get effective model based on priority
  const getEffectiveModel = async (text: string, modelOverride?: ModelOption): Promise<ModelOption> => {
    // Priority 1: Model override (for specific calls)
    if (modelOverride) return modelOverride

    // Priority 2: Project context settings (defaultModel/defaultProvider)
    if (projectContext?.defaultModel && projectContext?.defaultProvider) {
      // Find the model from MODELS array that matches project settings
      const projectModel = MODELS.find(m =>
        m.id === projectContext.defaultModel && m.provider === projectContext.defaultProvider
      )
      if (projectModel) {
        return projectModel
      }
    }

    // Priority 3: UI dropdown selection (fallback when no project settings)
    return autoOptimize ? await selectOptimalModel(text) : selectedModel
  }

  // Helper function to map provider for API key validation (anthropic -> claude)
  const getApiKeyProvider = (provider: string): string => {
    // Map display providers to API key providers
    const providerMap: Record<string, string> = {
      'anthropic': 'claude',  // Map anthropic to claude for consistency
      'gemini': 'gemini',     // Gemini provider maps to itself
      'openai': 'openai',
      'mistral': 'mistral',
      'perplexity': 'perplexity',
      'grok': 'grok',
      'cohere': 'cohere'
    }
    return providerMap[provider] || provider
  }

  // Handlers
  const handleSendMessage = async (text: string, mode: string, modelOverride?: ModelOption) => {
    if (!text.trim() && attachments.length === 0) return
    
    // Get the effective model using priority system
    const modelToUse = await getEffectiveModel(text, modelOverride)
    const apiKeyProvider = getApiKeyProvider(modelToUse.provider)
    if (modelToUse.requiresApiKey && !hasValidKey(apiKeyProvider as Provider)) {
      toast.error(`Please configure ${modelToUse.provider.toUpperCase()} API key first`)
      router.push('/settings/api-keys')
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

    // Update thread's updatedAt timestamp
    if (currentThread) {
      setThreads(prev => prev.map(thread =>
        thread.id === currentThread.id
          ? { ...thread, updatedAt: new Date() }
          : thread
      ))
    }

    setInput('')
    setAttachments([])
    setIsLoading(true)
    
    // Simulate thinking steps for Claude-like experience
    const thinkingSteps: ThinkingStep[] = [
      { id: '1', title: 'Analyzing request', content: 'Understanding your question and context', status: 'complete', duration: 800 },
      { id: '2', title: 'Processing information', content: 'Gathering relevant knowledge and data', status: 'complete', duration: 1200 },
      { id: '3', title: 'Generating response', content: 'Crafting a comprehensive answer', status: 'active' }
    ]
    
    const assistantMessage: Message = {
      id: `msg-${Date.now()}-assistant`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      model: modelToUse.name,
      provider: modelToUse.provider,
      status: 'streaming',
      thinkingSteps
    }
    
    try {
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
          stream: streamResponse,
          projectContext: projectContext
        })
      })
      
      if (!res.ok) throw new Error('Failed to send message')
      
      setMessages(prev => [...prev, assistantMessage])
      
      if (streamResponse && res.body) {
        setIsStreaming(true)
        const reader = res.body.getReader()
        const decoder = new TextDecoder()

        let fullContent = ''
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk

          // Parse SSE events from buffer
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6) // Remove "data: " prefix

              if (data === '[DONE]') {
                break
              }

              try {
                const parsed = JSON.parse(data)

                if (parsed.type === 'content') {
                  fullContent += parsed.content

                  setMessages(prev => prev.map(msg =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: fullContent }
                      : msg
                  ))
                } else if (parsed.type === 'analysis') {
                  // Handle analysis data if needed
                  setPromptAnalysis(parsed.analysis)
                } else if (parsed.type === 'metadata') {
                  // Handle final metadata
                  setMessages(prev => prev.map(msg =>
                    msg.id === assistantMessage.id
                      ? {
                          ...msg,
                          metadata: parsed.metadata,
                          cost: parsed.metadata?.cost || 0,
                          tokens: parsed.metadata?.totalTokens || 0
                        }
                      : msg
                  ))
                }
              } catch (e) {
                console.warn('Failed to parse SSE data:', data, e)
              }
            }
          }
        }
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { 
                ...msg, 
                status: 'complete', 
                content: fullContent,
                thinkingSteps: thinkingSteps.map(step => ({ ...step, status: 'complete' as const }))
              }
            : msg
        ))
        setIsStreaming(false)
      } else {
        const data = await res.json()
        const completedMessage: Message = {
          ...assistantMessage,
          content: data.content,
          cost: data.cost,
          tokens: data.tokens,
          latency: data.latency,
          status: 'complete',
          thinkingSteps: thinkingSteps.map(step => ({ ...step, status: 'complete' as const }))
        }
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id ? completedMessage : msg
        ))
        setCurrentCost(prev => prev + (data.cost || 0))
      }
      
      // Send typing indicator via WebSocket
      sendMessage('stop_typing', { threadId: currentThread?.id })
      
    } catch (error) {
      toast.error('Failed to send message')
      console.error(error)
      
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, status: 'error', content: 'Sorry, I encountered an error. Please try again.' }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }
  
  const selectOptimalModel = async (prompt: string): Promise<ModelOption> => {
    const analysis = promptAnalysis || analyzePrompt(prompt, selectedMode)
    
    // Filter models based on API key availability
    const availableModels = MODELS.filter(model =>
      !model.requiresApiKey || hasValidKey(getApiKeyProvider(model.provider) as Provider)
    )
    
    if (availableModels.length === 0) {
      toast.error('No models available. Please configure API keys.')
      return MODELS[0] // fallback
    }
    
    if (selectedMode === 'coding') {
      if (analysis.complexity === 'expert') {
        return availableModels.find(m => m.id === 'claude-3-opus') || availableModels[0]
      }
      return availableModels.find(m => m.id === 'claude-3.5-sonnet') || availableModels.find(m => m.id === 'claude-3-sonnet') || availableModels[0]
    }
    
    if (selectedMode === 'creative') {
      return availableModels.find(m => m.id === 'gpt-4o') || availableModels[0]
    }
    
    if (selectedMode === 'analysis') {
      if (analysis.complexity === 'expert' || analysis.complexity === 'complex') {
        return availableModels.find(m => m.id === 'claude-3-opus') || availableModels[0]
      }
      return availableModels.find(m => m.id === 'gemini-pro') || availableModels[0]
    }
    
    if (selectedMode === 'focus' || selectedMode === 'web') {
      return availableModels.find(m => m.id === 'gemini-pro') || availableModels[0]
    }
    
    const suggestedModelId = analysis.suggestedModel.toLowerCase().replace(/ /g, '-')
    return availableModels.find(m => m.id.includes(suggestedModelId)) || availableModels[0]
  }
  
  const handleFileUpload = async (files: File[]) => {
    const newAttachments: Attachment[] = []
    
    for (const file of files) {
      const attachmentId = `att-${Date.now()}-${Math.random()}`
      const attachment: Attachment = {
        id: attachmentId,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.includes('code') || file.name.endsWith('.js') || 
              file.name.endsWith('.ts') || file.name.endsWith('.py') ? 'code' : 'file',
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
        uploadProgress: 0
      }
      
      newAttachments.push(attachment)
      
      // Simulate upload progress
      setUploadProgress(prev => ({ ...prev, [attachmentId]: 0 }))
      
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 50))
        setUploadProgress(prev => ({ ...prev, [attachmentId]: progress }))
        setAttachments(prev => prev.map(att => 
          att.id === attachmentId ? { ...att, uploadProgress: progress } : att
        ))
      }
    }
    
    setAttachments(prev => [...prev, ...newAttachments])
    toast.success(`${files.length} file(s) uploaded successfully`)
  }
  
  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
    setUploadProgress(prev => {
      const { [id]: removed, ...rest } = prev
      return rest
    })
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

  const handleShare = async () => {
    if (!currentThread) return

    try {
      const shareData = await shareThread(currentThread.id, shareSettings)
      if (shareData) {
        navigator.clipboard.writeText(shareData.shareUrl)
        toast.success('Share link copied to clipboard!')
        setShareDialogOpen(false)
      }
    } catch (error) {
      toast.error('Failed to create share link')
    }
  }

  // Load organization members for user selection in sharing
  const loadOrganizationMembers = async () => {
    if (loadingOrgMembers) return

    setLoadingOrgMembers(true)
    try {
      const response = await fetch('/api/organization/members')
      if (response.ok) {
        const data = await response.json()
        setOrganizationMembers(data.members || [])
      } else {
        console.error('Failed to load organization members')
      }
    } catch (error) {
      console.error('Error loading organization members:', error)
    } finally {
      setLoadingOrgMembers(false)
    }
  }

  // Thread-specific collaborators state
  const [threadCollaborators, setThreadCollaborators] = useState<any[]>([])

  // Load current thread collaborators
  const loadThreadCollaborators = async (threadId: string) => {
    try {
      const response = await fetch(`/api/aioptimise/threads/${threadId}/collaborators`)
      if (response.ok) {
        const data = await response.json()
        setThreadCollaborators(data.collaborators || [])
      }
    } catch (error) {
      console.error('Error loading thread collaborators:', error)
    }
  }

  const handleSetupProject = async () => {
    setProjectDropdownOpen(false) // Close dropdown when setting up project
    try {
      // Create a new thread first
      const response = await fetch('/api/aioptimise/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Project Setup',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create thread')
      }

      const newThread = await response.json()

      // Update the current thread state immediately
      setCurrentThread(newThread)

      // Add new thread to the threads list
      setThreads(prev => [newThread, ...prev])

      // Now open the project settings modal with the real thread ID
      setShowProjectSettings(true)
    } catch (error) {
      console.error('Error creating thread for project setup:', error)
      toast.error('Failed to create project. Please try again.')
    }
  }

  const filteredAndSortedMessages = useMemo(() => {
    return messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }, [messages])

  const isModelAvailable = (model: ModelOption) => {
    return !model.requiresApiKey || hasValidKey(getApiKeyProvider(model.provider) as Provider)
  }

  // Render
  return (
    <div
      className="fixed inset-x-0 top-16 bottom-0 bg-gray-950 overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
      
      
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-[60] bg-blue-500/20 backdrop-blur-sm border-2 border-dashed border-blue-400 flex items-center justify-center">
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-blue-400" />
            <p className="text-white text-lg font-medium">Drop files to upload</p>
            <p className="text-gray-400">Support for images, documents, and code files</p>
          </div>
        </div>
      )}
      
      <div className="relative z-10 h-full flex">
        {/* Thread Manager Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-72 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 flex flex-col h-full"
            >
              {/* Enhanced Thread Manager */}
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-white">Conversations</h2>
                  <div className="flex items-center gap-2">
                    {wsConnected ? (
                      <MessageSquare className="w-4 h-4 text-green-400" />
                    ) : (
                      <MessageSquareOff className="w-4 h-4 text-red-400" />
                    )}
                    <Button
                      onClick={() => createThread()}
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      New
                    </Button>
                  </div>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search conversations..."
                    className="pl-9 bg-gray-900 border-gray-800 text-sm"
                  />
                </div>
                
                {/* Active Collaborators */}
                {collaborators.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">Active collaborators</span>
                    </div>
                    <div className="flex -space-x-2">
                      {collaborators.slice(0, 5).map(collaborator => (
                        <div key={collaborator.id} className="relative">
                          <Avatar className="w-6 h-6 border-2 border-gray-800">
                            <AvatarImage src={collaborator.avatar} />
                            <AvatarFallback>{collaborator.name[0]}</AvatarFallback>
                          </Avatar>
                          {collaborator.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full" />
                          )}
                        </div>
                      ))}
                      {collaborators.length > 5 && (
                        <div className="w-6 h-6 bg-gray-700 border-2 border-gray-800 rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-300">+{collaborators.length - 5}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Thread List */}
              <div className="flex-1 overflow-y-auto">
                <AnimatePresence>
                  {threads.map((thread) => (
                    <motion.div
                      key={thread.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={cn(
                        "group border-b border-gray-800 hover:bg-gray-900/50 transition-colors cursor-pointer",
                        currentThread?.id === thread.id && "bg-indigo-950/20 border-l-2 border-l-indigo-500"
                      )}
                      onClick={() => selectThread(thread.id)}
                    >
                      <div className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {thread.isPinned && (
                                <Pin className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                              )}
                              <h3 className="text-sm font-medium text-white truncate">
                                {thread.title}
                              </h3>
                            </div>
                            
                            <p className="text-xs text-gray-500 truncate mb-1">
                              {thread.lastMessage || 'No messages yet'}
                            </p>
                            
                            <div className="flex items-center gap-2 text-[10px] text-gray-600">
                              <span>{thread.messageCount} messages</span>
                              <span>•</span>
                              <span>{formatDate(thread.updatedAt)}</span>
                              {thread.sharedWith && thread.sharedWith.length > 0 && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    <span>{thread.sharedWith.length}</span>
                                  </div>
                                </>
                              )}
                            </div>
                            
                            {thread.tags && thread.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {thread.tags.map((tag: string) => (
                                  <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Thread Actions */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-70 hover:opacity-100 transition-opacity hover:bg-gray-800/80 backdrop-blur-sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-gray-900/95 backdrop-blur-xl border-gray-700">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                const newTitle = prompt('Enter new title:', thread.title)
                                if (newTitle && newTitle.trim()) {
                                  renameThread(thread.id, newTitle.trim())
                                }
                              }}>
                                <Edit2 className="w-3 h-3 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                pinThread(thread.id)
                              }}>
                                <Pin className="w-3 h-3 mr-2" />
                                {thread.isPinned ? 'Unpin' : 'Pin'}
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                archiveThread(thread.id)
                              }}>
                                <Archive className="w-3 h-3 mr-2" />
                                {thread.isArchived ? 'Unarchive' : 'Archive'}
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                setShareDialogOpen(true)
                              }}>
                                <Share2 className="w-3 h-3 mr-2" />
                                Share
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (confirm('Are you sure you want to delete this conversation?')) {
                                    deleteThread(thread.id)
                                  }
                                }}
                                className="text-red-400 focus:text-red-400"
                              >
                                <Trash2 className="w-3 h-3 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Enhanced Header */}
          <div className="h-16 bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 flex items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-400 hover:text-white flex-shrink-0"
              >
                {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-white">AIOptimise V2</h1>
                <p className="text-xs text-gray-400 truncate">
                  {currentThread ? currentThread.title : 'Select or create a conversation'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Mode Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    {React.createElement(MODES.find(m => m.id === selectedMode)?.icon || MessageSquare, {
                      className: cn("w-4 h-4", MODES.find(m => m.id === selectedMode)?.color)
                    })}
                    <span className="hidden md:inline">{MODES.find(m => m.id === selectedMode)?.label}</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-gray-900/95 backdrop-blur-xl border-gray-700">
                  {MODES.map((mode) => (
                    <DropdownMenuItem
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      className="p-3 hover:bg-gray-800/50"
                    >
                      <div className="flex items-start gap-3 w-full">
                        <mode.icon className={cn("w-4 h-4 mt-0.5", mode.color)} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white">{mode.label}</span>
                            {selectedMode === mode.id && (
                              <Check className="w-3 h-3 text-blue-400" />
                            )}
                          </div>
                          <span className="text-xs text-gray-400">{mode.description}</span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Project Context - Compact dropdown for better header integration */}
              {currentThread && (
                <DropdownMenu open={projectDropdownOpen} onOpenChange={setProjectDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 text-white hover:text-gray-300">
                      <Folder className="w-4 h-4" />
                      <span className="hidden md:inline text-sm">
                        {contextLoading ? 'Loading...' : (projectContext?.projectName || 'Project')}
                      </span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 bg-gray-900/95 backdrop-blur-xl border-gray-700" align="start">
                    {contextLoading ? (
                      <div className="p-4 text-center">
                        <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-400">Loading project context...</p>
                      </div>
                    ) : projectContext ? (
                      <div className="p-4 space-y-3">
                        {/* Project Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{projectContext.projectType === 'GENERAL' ? '💬' : projectContext.projectType === 'DEVELOPMENT' ? '💻' : projectContext.projectType === 'RESEARCH' ? '🔬' : projectContext.projectType === 'CONTENT_CREATION' ? '✍️' : projectContext.projectType === 'ANALYSIS' ? '📊' : projectContext.projectType === 'BRAINSTORMING' ? '💡' : projectContext.projectType === 'SUPPORT' ? '🎧' : projectContext.projectType === 'TRAINING' ? '🎓' : '⚙️'}</span>
                            <h3 className="font-medium text-white">{projectContext.projectName}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {projectContext.projectType.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </Badge>
                            {projectContext.category && (
                              <Badge variant="outline" className="text-xs">
                                {projectContext.category}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* AI Configuration */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                            <Brain className="h-3 w-3" />
                            AI Configuration
                          </div>
                          <div className="pl-5 space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Model:</span>
                              <span className="text-indigo-400">{projectContext.defaultModel || 'Default'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Provider:</span>
                              <span className="text-indigo-400">{projectContext.defaultProvider || 'OpenAI'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Instructions */}
                        {projectContext.instructions && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                              <Hash className="h-3 w-3" />
                              Instructions
                            </div>
                            <div className="pl-5 text-xs text-white">
                              {projectContext.instructions.length > 120
                                ? `${projectContext.instructions.substring(0, 120)}...`
                                : projectContext.instructions
                              }
                            </div>
                          </div>
                        )}

                        {/* Keywords */}
                        {projectContext.keywords?.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                              <Hash className="h-3 w-3" />
                              Keywords
                            </div>
                            <div className="pl-5 flex flex-wrap gap-1">
                              {projectContext.keywords.slice(0, 3).map((keyword: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs border-indigo-500/30 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors">
                                  {keyword}
                                </Badge>
                              ))}
                              {projectContext.keywords.length > 3 && (
                                <Badge variant="outline" className="text-xs border-indigo-500/30 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors">
                                  +{projectContext.keywords.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <DropdownMenuSeparator />

                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Version {projectContext.version}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-gray-400 hover:text-white"
                            onClick={() => {
                              setProjectDropdownOpen(false)
                              setShowProjectSettings(true)
                            }}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <Folder className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                        <p className="text-sm mb-3 text-gray-400">No project context configured</p>
                        <Button
                          size="sm"
                          onClick={handleSetupProject}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0"
                        >
                          Set up project
                        </Button>
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setInfoPanelOpen(!infoPanelOpen)}
                  className="text-gray-400 hover:text-white"
                >
                  {infoPanelOpen ? <ChevronRight className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
                </Button>
              </div>

            </div>
          </div>
          
          {/* Messages Area */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden"
            style={{ height: 'calc(100vh - 140px)' }}
          >
            <div className="max-w-4xl mx-auto px-6 py-8">
              {/* Loading indicator for older messages */}
              {isLoadingOlderMessages && (
                <div className="flex justify-center py-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading older messages...</span>
                  </div>
                </div>
              )}

              <AnimatePresence>
                {filteredAndSortedMessages.map((message, index) => (
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
                      "max-w-[85%] rounded-xl p-4 relative",
                      message.role === 'user' 
                        ? "bg-indigo-600 text-white ml-12" 
                        : "bg-gray-800/50 text-gray-100 border border-gray-700 mr-12"
                    )}>
                      {/* Message Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={message.role === 'user' ? user.image : '/ai-avatar.png'} />
                          <AvatarFallback>
                            {message.role === 'user' ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">
                            {message.role === 'user' ? user.name || 'You' : (
                              <div className="flex items-center gap-1">
                                <span>{message.model || 'AI'}</span>
                                {message.provider && (
                                  <div className="opacity-60">
                                    {getProviderIcon(message.provider, "w-3 h-3")}
                                  </div>
                                )}
                              </div>
                            )}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {formatDate(message.timestamp)}
                          </span>
                        </div>
                        {message.status === 'streaming' && (
                          <Badge variant="secondary" className="text-xs">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Generating...
                          </Badge>
                        )}
                      </div>

                      {/* Thinking Steps (Claude-like) */}
                      {message.role === 'assistant' && message.thinkingSteps && message.status !== 'complete' && (
                        <div className="mb-4 p-3 bg-gray-900/30 rounded-lg border border-gray-700/50">
                          <div className="text-xs text-gray-400 mb-2">AI is thinking...</div>
                          {message.thinkingSteps.map((step) => (
                            <div key={step.id} className="flex items-center gap-2 mb-1 last:mb-0">
                              {step.status === 'complete' ? (
                                <Check className="w-3 h-3 text-green-400" />
                              ) : step.status === 'active' ? (
                                <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                              ) : (
                                <Clock className="w-3 h-3 text-gray-500" />
                              )}
                              <span className={cn(
                                "text-xs",
                                step.status === 'complete' && "text-green-400",
                                step.status === 'active' && "text-blue-400",
                                step.status === 'pending' && "text-gray-500"
                              )}>
                                {step.title}
                              </span>
                              {step.duration && step.status === 'complete' && (
                                <span className="text-[10px] text-gray-500">({step.duration}ms)</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Message Content */}
                      <div className="prose prose-invert prose-sm max-w-none overflow-x-auto">
                        {message.role === 'assistant' ? (
                          <ReactMarkdown
                            components={{
                              code({ className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '')
                                const inline = !match
                                return !inline ? (
                                  <div className="overflow-x-auto">
                                    {/* @ts-ignore */}
                                    <SyntaxHighlighter
                                      style={oneDark}
                                      language={match?.[1] || 'text'}
                                      PreTag="div"
                                      customStyle={{
                                        margin: 0,
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem'
                                      }}
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  </div>
                                ) : (
                                  <code className={cn(className, "px-1 py-0.5 bg-gray-700 rounded text-xs")} {...props}>
                                    {children}
                                  </code>
                                )
                              },
                              pre({ children }: any) {
                                return <div className="overflow-x-auto">{children}</div>
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        )}
                      </div>
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 overflow-x-auto">
                          {message.attachments.map(attachment => (
                            <div key={attachment.id} className="flex items-center gap-2 px-2 py-1 bg-gray-700/50 rounded flex-shrink-0">
                              {attachment.type === 'image' ? (
                                <ImageIcon className="h-4 w-4" />
                              ) : attachment.type === 'code' ? (
                                <Code className="h-4 w-4" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                              <span className="text-xs truncate max-w-[120px]">{attachment.name}</span>
                              {attachment.uploadProgress !== undefined && attachment.uploadProgress < 100 && (
                                <div className="w-12">
                                  <Progress value={attachment.uploadProgress} className="h-1" />
                                </div>
                              )}
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
                              className="h-7 w-7 text-gray-400 hover:text-white"
                              onClick={() => copyMessage(message.content)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-gray-400 hover:text-white"
                              onClick={() => provideFeedback(message.id, 'positive')}
                            >
                              <ThumbsUp className={cn(
                                "h-3 w-3", 
                                message.feedback === 'positive' && "text-green-500"
                              )} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-gray-400 hover:text-white"
                              onClick={() => provideFeedback(message.id, 'negative')}
                            >
                              <ThumbsDown className={cn(
                                "h-3 w-3", 
                                message.feedback === 'negative' && "text-red-500"
                              )} />
                            </Button>
                          </div>
                          
                          {/* Performance Metrics */}
                          {(message.cost || message.tokens || message.latency) && (
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              {message.cost && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  <span>${message.cost.toFixed(4)}</span>
                                </div>
                              )}
                              {message.tokens && (
                                <div className="flex items-center gap-1">
                                  <Hash className="w-3 h-3" />
                                  <span>{message.tokens.total.toLocaleString()}</span>
                                </div>
                              )}
                              {message.latency && (
                                <div className="flex items-center gap-1">
                                  <Timer className="w-3 h-3" />
                                  <span>{message.latency}ms</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Typing Indicators */}
              {isStreaming && (
                <div className="flex items-center gap-2 text-gray-400 mb-4">
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

              {/* Collaborator Typing Indicators */}
              {collaborators.some(c => c.isTyping) && (
                <div className="mb-4">
                  {collaborators.filter(c => c.isTyping).map(collaborator => (
                    <div key={collaborator.id} className="flex items-center gap-2 text-gray-400 mb-2">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={collaborator.avatar} />
                        <AvatarFallback>{collaborator.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{collaborator.name} is typing...</span>
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" />
                        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Enhanced Input Area */}
          <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm p-4 flex-shrink-0">
            <div className="max-w-4xl mx-auto overflow-hidden">
              {/* Prompt Analysis */}
              {promptAnalysis && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mb-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50"
                >
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span>Prompt Analysis</span>
                    <div className="flex items-center gap-4">
                      <span>Complexity: <span className={cn(
                        promptAnalysis.complexity === 'simple' && 'text-green-400',
                        promptAnalysis.complexity === 'moderate' && 'text-yellow-400',
                        promptAnalysis.complexity === 'complex' && 'text-orange-400',
                        promptAnalysis.complexity === 'expert' && 'text-red-400'
                      )}>{promptAnalysis.complexity}</span></span>
                      <span>Est. Cost: ${(promptAnalysis.estimatedCost || 0).toFixed(4)}</span>
                      <span>Tokens: ~{promptAnalysis.estimatedTokens || 0}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Suggested model: {MODELS.find(m => m.id === promptAnalysis.suggestedModel)?.name || 'Auto-selected'}
                  </div>
                </motion.div>
              )}

              {/* Attachments Preview */}
              {attachments.length > 0 && (
                <div className="mb-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400">Attached files ({attachments.length})</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {attachments.map(attachment => (
                      <div key={attachment.id} className="relative group">
                        <div className="flex items-center gap-2 p-2 bg-gray-700/50 rounded border border-gray-600">
                          {attachment.type === 'image' ? (
                            <div className="relative">
                              <ImageIcon className="h-4 w-4 text-blue-400" />
                              {attachment.url && (
                                <img 
                                  src={attachment.url} 
                                  alt={attachment.name}
                                  className="w-8 h-8 object-cover rounded ml-2"
                                />
                              )}
                            </div>
                          ) : attachment.type === 'code' ? (
                            <Code className="h-4 w-4 text-purple-400" />
                          ) : (
                            <FileText className="h-4 w-4 text-gray-400" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white truncate">{attachment.name}</p>
                            <p className="text-[10px] text-gray-500">
                              {(attachment.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeAttachment(attachment.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        {attachment.uploadProgress !== undefined && attachment.uploadProgress < 100 && (
                          <Progress 
                            value={attachment.uploadProgress} 
                            className="h-1 mt-1"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Container */}
              <div className="relative border border-gray-800/50 rounded-xl bg-gray-900/30 backdrop-blur-sm">
                <div className="flex items-center px-4 py-3 min-w-0 overflow-hidden">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value)
                      // Send typing indicator
                      if (e.target.value.length > 0) {
                        sendMessage('start_typing', { threadId: currentThread?.id })
                      } else {
                        sendMessage('stop_typing', { threadId: currentThread?.id })
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(input, selectedMode)
                      }
                    }}
                    placeholder={
                      isAbsorberMode
                        ? "AI Absorber Mode: Type your message - AI will listen but not respond..."
                        : `Message AIOptimise (${selectedMode} mode)...`
                    }
                    className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none min-h-[20px] max-h-[120px] py-0 min-w-0 overflow-hidden leading-5"
                    style={{
                      height: Math.min(Math.max(20, input.split('\n').length * 20), 120)
                    }}
                    disabled={isLoading || isStreaming}
                  />
                  
                  <div className="flex items-center gap-2 ml-2">
                    {/* File Upload */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".txt,.md,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.sh,.yml,.yaml,.json,.xml,.csv,.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.svg"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleFileUpload(Array.from(e.target.files))
                          e.target.value = ''
                        }
                      }}
                      className="hidden"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading || isStreaming}
                            className="h-8 w-8 text-gray-400 hover:text-white"
                          >
                            <Paperclip className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Attach files (Drag & drop supported)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* AI Absorber Mode Toggle */}
                    {currentThread?.id && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => toggleAbsorberMode(!isAbsorberMode)}
                              disabled={isLoading || isStreaming}
                              className={cn(
                                "h-8 w-8 transition-all",
                                isAbsorberMode
                                  ? "text-orange-400 bg-orange-500/20 hover:text-orange-300 hover:bg-orange-500/30"
                                  : "text-gray-400 hover:text-white"
                              )}
                            >
                              {isAbsorberMode ? (
                                <MessageSquareOff className="w-4 h-4" />
                              ) : (
                                <MessageSquare className="w-4 h-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {isAbsorberMode
                                ? "Disable AI Absorber Mode - AI will respond"
                                : "Enable AI Absorber Mode - AI will listen but not respond"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {/* Send Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleSendMessage(input, selectedMode)}
                            disabled={!input.trim() || isLoading || isStreaming}
                            className={cn(
                              "h-8 w-8 transition-all",
                              input.trim() && !isLoading && !isStreaming
                                ? "text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                                : "text-gray-600"
                            )}
                          >
                            {isLoading || isStreaming ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Send message (Enter)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>

              {/* Controls Row */}
              <div className="mt-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4 text-gray-500">
                  <span>
                    {autoOptimize ? 'Auto-optimizing for best model' : `Using ${selectedModel.name}`}
                    {selectedMode !== 'chat' && (
                      <span className="ml-2 px-2 py-1 bg-gray-800 rounded text-[10px]">
                        {MODES.find(m => m.id === selectedMode)?.label} mode
                      </span>
                    )}
                  </span>
                  {savedAmount > 0 && (
                    <span className="text-green-400">Saved ${savedAmount.toFixed(2)} today!</span>
                  )}
                  {input.length > 0 && (
                    <span className="text-gray-600">
                      ~{Math.ceil(input.length / 4)} tokens
                    </span>
                  )}
                </div>
                
                {/* Integrated Model Selection & Auto-Optimize */}
                <div className="flex items-center gap-3">
                  {isProjectSettingsActive() ? (
                    // Show project settings model (disabled state)
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Model:</span>
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 border border-gray-700 rounded-md opacity-75">
                        {getProviderIcon(projectContext.defaultProvider, "w-4 h-4")}
                        <span className="text-xs text-gray-300">
                          {MODELS.find(m => m.id === projectContext.defaultModel)?.name || projectContext.defaultModel}
                        </span>
                        <span className="text-xs text-indigo-400">(Project Setting)</span>
                      </div>
                    </div>
                  ) : (
                    // Show normal dropdown when no project settings
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Model:</span>
                      <div className="relative">
                        <Select
                          value={autoOptimize ? "auto" : selectedModel.id}
                          onValueChange={(value) => {
                            if (value === "auto") {
                              setAutoOptimize(true)
                            } else {
                              setAutoOptimize(false)
                              const model = MODELS.find(m => m.id === value)
                              if (model && isModelAvailable(model)) {
                                setSelectedModel(model)
                              } else {
                                toast.error('This model requires API key configuration')
                              }
                            }
                          }}
                        >
                        <SelectTrigger className="w-44 bg-gray-800/50 border-gray-700 text-white h-7">
                          <div className="flex items-center gap-2">
                            {autoOptimize ? (
                              <>
                                <Zap className="w-4 h-4 text-indigo-400" />
                                <span className="truncate text-xs text-indigo-400 font-medium">Auto</span>
                              </>
                            ) : (
                              <>
                                {getProviderIcon(selectedModel.provider, "w-4 h-4")}
                                <span className="truncate text-xs">{selectedModel.name}</span>
                              </>
                            )}
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-gray-700">
                          {/* Auto-Optimize Option */}
                          <SelectItem value="auto" className="hover:bg-gray-800/50 py-3 pl-2">
                            <div className="flex items-center gap-3 w-full">
                              <Zap className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-indigo-400 font-medium text-sm">Auto</span>
                                <span className="text-xs text-gray-500 leading-tight">
                                  Balanced quality and speed,<br />
                                  recommended for most tasks
                                </span>
                              </div>
                            </div>
                          </SelectItem>

                          {/* Separator */}
                          <div className="h-px bg-gray-700 my-1" />

                          {/* Manual Model Selection */}
                          {MODELS.map(model => (
                            <SelectItem
                              key={model.id}
                              value={model.id}
                              disabled={!isModelAvailable(model)}
                              className="hover:bg-gray-800/50 pl-2"
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  {getProviderIcon(model.provider, "w-4 h-4")}
                                  <span>{model.name}</span>
                                </div>
                                {!isModelAvailable(model) && (
                                  <Key className="w-3 h-3 text-red-400 ml-2" />
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Info Panel */}
        <AnimatePresence>
          {infoPanelOpen && (
            <motion.div
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-80 bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-2">Dashboard</h3>
                
                {/* Connection Status */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    wsConnected ? "bg-green-500" : "bg-red-500"
                  )} />
                  <span className="text-xs text-gray-400">
                    {wsConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                {/* Usage Statistics */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Daily Usage</span>
                      <span className="text-xs text-gray-300">
                        {limits.dailyUsed}/{limits.dailyLimit}
                      </span>
                    </div>
                    <Progress value={(limits.dailyUsed / limits.dailyLimit) * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Monthly Cost</span>
                      <span className="text-xs text-gray-300">
                        ${limits.monthlyUsed.toFixed(2)}/${limits.monthlyLimit}
                      </span>
                    </div>
                    <Progress value={(limits.monthlyUsed / limits.monthlyLimit) * 100} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Current Session Stats */}
              <div className="p-4 border-b border-gray-800">
                <h4 className="text-sm font-medium text-white mb-3">Current Session</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Messages</span>
                    <span className="text-xs text-white">{messages.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Cost</span>
                    <span className="text-xs text-white">${currentCost.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Model</span>
                    <span className="text-xs text-white">{selectedModel.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Mode</span>
                    <span className="text-xs text-white capitalize">{selectedMode}</span>
                  </div>
                </div>
              </div>

              {/* Active Collaborators */}
              {collaborators.length > 0 && (
                <div className="p-4 border-b border-gray-800">
                  <h4 className="text-sm font-medium text-white mb-3">
                    Active Collaborators ({collaborators.length})
                  </h4>
                  <div className="space-y-2">
                    {collaborators.map(collaborator => (
                      <div key={collaborator.id} className="flex items-center gap-2">
                        <div className="relative">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={collaborator.avatar} />
                            <AvatarFallback>{collaborator.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-gray-800",
                            collaborator.isOnline ? "bg-green-500" : "bg-gray-500"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white truncate">{collaborator.name}</p>
                          <p className="text-[10px] text-gray-500 truncate">
                            {collaborator.isTyping ? 'Typing...' : (
                              collaborator.isOnline ? 'Online' : `Last seen ${formatDate(collaborator.lastSeen)}`
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* API Key Status */}
              <div className="p-4 border-b border-gray-800">
                <h4 className="text-sm font-medium text-white mb-3">API Keys</h4>
                <div className="space-y-2">
                  {['openai', 'claude', 'gemini', 'grok', 'perplexity', 'cohere', 'mistral'].map((provider) => (
                    <div key={provider} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getProviderIcon(provider, "w-4 h-4")}
                        <span className="text-xs text-gray-400 capitalize">{provider}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {hasValidKey(provider as Provider) ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <X className="w-3 h-3 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-4">
                <h4 className="text-sm font-medium text-white mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start h-8 text-xs"
                    onClick={() => setShareDialogOpen(true)}
                    disabled={!currentThread}
                  >
                    <Share2 className="w-3 h-3 mr-2" />
                    Share Conversation
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start h-8 text-xs"
                    onClick={() => {
                      const content = messages.map(m => `${m.role}: ${m.content}`).join('\n\n')
                      copyMessage(content)
                    }}
                    disabled={messages.length === 0}
                  >
                    <Copy className="w-3 h-3 mr-2" />
                    Copy All Messages
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start h-8 text-xs"
                    onClick={() => createThread()}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    New Conversation
                  </Button>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Advanced Share Dialog with User Selection Capability */}
      <ShareThreadDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        thread={currentThread}
        collaborators={threadCollaborators}
        organizationMembers={organizationMembers}
        onAddCollaborator={async (email: string, role: string) => {
          try {
            const response = await fetch(`/api/aioptimise/threads/${currentThread?.id}/collaborators`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, role })
            })

            if (response.ok) {
              toast.success('Invitation sent successfully')
              if (currentThread?.id) {
                loadThreadCollaborators(currentThread.id)
              }
            } else {
              const error = await response.json()
              toast.error(error.message || 'Failed to send invitation')
            }
          } catch (error) {
            toast.error('Failed to send invitation')
          }
        }}
        onRemoveCollaborator={async (collaboratorId: string) => {
          try {
            const response = await fetch(`/api/aioptimise/threads/${currentThread?.id}/collaborators/${collaboratorId}`, {
              method: 'DELETE'
            })

            if (response.ok) {
              toast.success('Collaborator removed successfully')
              if (currentThread?.id) {
                loadThreadCollaborators(currentThread.id)
              }
            } else {
              const error = await response.json()
              toast.error(error.message || 'Failed to remove collaborator')
            }
          } catch (error) {
            toast.error('Failed to remove collaborator')
          }
        }}
        onUpdateCollaboratorRole={async (collaboratorId: string, newRole: string) => {
          try {
            const response = await fetch(`/api/aioptimise/threads/${currentThread?.id}/collaborators/${collaboratorId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ role: newRole })
            })

            if (response.ok) {
              toast.success('Role updated successfully')
              if (currentThread?.id) {
                loadThreadCollaborators(currentThread.id)
              }
            } else {
              const error = await response.json()
              toast.error(error.message || 'Failed to update role')
            }
          } catch (error) {
            toast.error('Failed to update role')
          }
        }}
        onShare={async (options) => {
          console.log('Share options:', options);
          return { shareUrl: 'https://example.com/share/123' };
        }}
        onUnshare={async () => {
          console.log('Unsharing thread');
        }}
      />

      {/* Project Settings Modal */}
      {showProjectSettings && currentThread && (
        <ProjectSettings
          threadId={currentThread.id}
          isOpen={showProjectSettings}
          onClose={() => {
            setShowProjectSettings(false)
          }}
          onSave={(newContext) => {
            setProjectContext(newContext)
            setShowProjectSettings(false)
          }}
        />
      )}
    </div>
  )
}