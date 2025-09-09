'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { 
  MessageSquare, Settings, Mic, MicOff, Send, Plus,
  Sparkles, Brain, Code, Palette, Target, Users,
  Download, Upload, Share2, Pin, Archive, Trash2,
  ChevronLeft, Menu, X, Search, Filter
} from 'lucide-react'

// Import all unified components
import { ThreadSidebarEnhanced } from './components/thread-sidebar-enhanced'
import { MessageEnhanced } from './components/message-enhanced'

// Import hooks
import { useThreadManager } from './useThreadManager'

// UI Components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Types
interface User {
  id: string
  email: string
  name: string
  image?: string
  hasApiKeys: boolean
  apiKeyStatus: {
    openai: boolean
    anthropic: boolean
    google: boolean
    x: boolean
  }
  subscription: string
  organizationId?: string
  role: string
}

interface Limits {
  dailyLimit: number
  monthlyLimit: number
  dailyUsed: number
  monthlyUsed: number
  dailyTokens: number
  monthlyTokens: number
  remainingDaily: number
  remainingMonthly: number
}

interface Thread {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messageCount: number
  lastMessage?: string
  lastMessageAt: string | null
  totalCost: number
  isPinned: boolean
  isArchived: boolean
  sharedWith?: string[]
  tags: string[]
  model?: string
  provider?: string
  mode?: 'standard' | 'focus' | 'coding' | 'research' | 'creative'
  hasUnread?: boolean
  isShared?: boolean
  collaborators?: string[]
  isLive?: boolean
  hasError?: boolean
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  createdAt: string
  model?: string
  tokens?: {
    input: number
    output: number
  }
  cost?: number
}

interface AiOptimizeClientProps {
  user: User
  limits: Limits
  threads: Thread[]
  initialApiKeys: any[]
}

export default function AiOptimizeClient({ user, limits, threads: initialThreads, initialApiKeys }: AiOptimizeClientProps) {
  // Core state
  const [threads, setThreads] = useState<Thread[]>(initialThreads)
  const [currentThread, setCurrentThread] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt-4')
  const [selectedProvider, setSelectedProvider] = useState('openai')

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)
  const [currentMode, setCurrentMode] = useState<'standard' | 'focus' | 'coding' | 'research' | 'creative' | 'custom'>('standard')

  // Advanced features state
  const [streamMode, setStreamMode] = useState(true)
  const [autoOptimize, setAutoOptimize] = useState(false)
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Custom hooks
  const threadManager = useThreadManager()
  const router = useRouter()

  // Check if user has API keys
  const hasValidApiKey = user.hasApiKeys && Object.values(user.apiKeyStatus).some(Boolean)

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Effect to scroll on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Load thread messages
  const loadThreadMessages = useCallback(async (threadId: string) => {
    try {
      const response = await fetch(`/api/aioptimize/threads/${threadId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
      toast.error('Failed to load conversation')
    }
  }, [])

  // Create new thread
  const handleCreateThread = useCallback(async () => {
    try {
      const response = await fetch('/api/aioptimize/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Conversation',
          model: selectedModel,
          provider: selectedProvider
        })
      })

      if (response.ok) {
        const newThread = await response.json()
        setThreads(prev => [newThread, ...prev])
        setCurrentThread(newThread)
        setMessages([])
        toast.success('New conversation created')
      }
    } catch (error) {
      console.error('Failed to create thread:', error)
      toast.error('Failed to create conversation')
    }
  }, [selectedModel, selectedProvider])

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading || !hasValidApiKey) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      createdAt: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/aioptimize/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          threadId: currentThread?.id,
          model: selectedModel,
          provider: selectedProvider,
          mode: currentMode,
          streamMode,
          autoOptimize
        }),
        signal: abortControllerRef.current.signal
      })

      if (response.ok) {
        if (streamMode) {
          // Handle streaming response
          const reader = response.body?.getReader()
          const decoder = new TextDecoder()
          let assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            createdAt: new Date().toISOString(),
            model: selectedModel
          }

          setMessages(prev => [...prev, assistantMessage])

          if (reader) {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value)
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6)
                  if (data === '[DONE]') break
                  
                  try {
                    const parsed = JSON.parse(data)
                    if (parsed.content) {
                      assistantMessage.content += parsed.content
                      setMessages(prev => 
                        prev.map(msg => 
                          msg.id === assistantMessage.id 
                            ? { ...msg, content: assistantMessage.content }
                            : msg
                        )
                      )
                    }
                  } catch (e) {
                    // Ignore parsing errors
                  }
                }
              }
            }
          }
        } else {
          // Handle non-streaming response
          const data = await response.json()
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.message,
            timestamp: new Date(),
            createdAt: new Date().toISOString(),
            model: selectedModel,
            tokens: data.tokens,
            cost: data.cost
          }
          setMessages(prev => [...prev, assistantMessage])
        }

        // Update thread if exists
        if (currentThread) {
          setThreads(prev =>
            prev.map(thread =>
              thread.id === currentThread.id
                ? { ...thread, updatedAt: new Date().toISOString(), messageCount: messages.length + 2 }
                : thread
            )
          )
        }
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Chat error:', error)
        toast.error('Failed to send message')
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [inputValue, isLoading, hasValidApiKey, currentThread, selectedModel, selectedProvider, currentMode, streamMode, autoOptimize, messages.length])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault()
            handleCreateThread()
            break
          case 'Enter':
            e.preventDefault()
            handleSendMessage()
            break
          case '/':
            e.preventDefault()
            // Show shortcuts help
            toast.info('Keyboard shortcuts: Cmd+N (New), Cmd+Enter (Send)')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleCreateThread, handleSendMessage])

  // API Key warning
  if (!hasValidApiKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
            <Settings className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">API Keys Required</h2>
            <p className="text-muted-foreground">
              To use AiOptimize, please configure your AI provider API keys first.
            </p>
          </div>
          <Button 
            onClick={() => router.push('/settings/api-keys')}
            className="w-full"
          >
            Configure API Keys
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-80 bg-card border-r flex flex-col"
          >
            <ThreadSidebarEnhanced
              threads={threads}
              currentThread={currentThread}
              collapsed={!sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
              onNewThread={handleCreateThread}
              onSelectThread={(threadId) => {
                const thread = threads.find(t => t.id === threadId)
                if (thread) {
                  setCurrentThread(thread)
                  loadThreadMessages(threadId)
                }
              }}
              onDeleteThread={threadManager.deleteThread}
              onPinThread={threadManager.pinThread}
              onArchiveThread={threadManager.archiveThread}
              onShareThread={(threadId) => {
                setShareDialogOpen(true)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-card border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h1 className="font-semibold">AiOptimize</h1>
              {currentThread && (
                <>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground hidden sm:block" />
                  <span className="text-sm text-muted-foreground truncate max-w-32 sm:max-w-48">
                    {currentThread.title}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden lg:flex items-center gap-2">
              <select 
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="bg-card border border-border rounded px-2 py-1 text-sm"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google</option>
              </select>
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-card border border-border rounded px-2 py-1 text-sm"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                <option value="claude-3-haiku">Claude 3 Haiku</option>
              </select>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {collaborators.length} user{collaborators.length !== 1 ? 's' : ''} online
              </Badge>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" title="Toggle streaming">
                <Sparkles className={`w-4 h-4 ${streamMode ? 'text-green-500' : 'text-muted-foreground'}`} />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex">
          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Brain className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Ready to optimize your AI interactions</h3>
                      <p className="text-sm text-muted-foreground">
                        Start a conversation, ask questions, write code, or analyze data.
                        AiOptimize will help you get the best results.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge variant="secondary">Chat</Badge>
                      <Badge variant="secondary">Code</Badge>
                      <Badge variant="secondary">Analysis</Badge>
                      <Badge variant="secondary">Creative</Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <MessageEnhanced
                      key={message.id}
                      message={message}
                      onRegenerate={() => {/* Regenerate logic */}}
                      onEdit={() => {/* Edit logic */}}
                      onCopy={() => {
                        navigator.clipboard.writeText(message.content)
                        toast.success('Copied to clipboard')
                      }}
                      onFeedback={() => {/* Feedback logic */}}
                    />
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                  placeholder="Type your message..."
                  disabled={isLoading || !hasValidApiKey}
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading || !hasValidApiKey}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {!hasValidApiKey && (
                <p className="text-sm text-muted-foreground mt-2">
                  Please add API keys in Settings to start chatting.
                </p>
              )}
            </div>
          </div>

          {/* Metrics Panel */}
          <div className="w-80 bg-card border-l p-4">
            <h3 className="font-semibold mb-4">Usage Metrics</h3>
            <div className="space-y-4">
              <div className="text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Daily Usage</span>
                  <span>${limits.dailyUsed.toFixed(4)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${Math.min((limits.dailyUsed / limits.dailyLimit) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Monthly Usage</span>
                  <span>${limits.monthlyUsed.toFixed(4)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${Math.min((limits.monthlyUsed / limits.monthlyLimit) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-sm">
                <div className="text-muted-foreground">Current Model</div>
                <div className="font-medium">{selectedModel}</div>
                <div className="text-muted-foreground">{selectedProvider}</div>
              </div>
            </div>
          </div>
        </div>
      </div>



    </div>
  )
}