'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  MessageSquare, Settings, Mic, MicOff, Send, Plus,
  Sparkles, Brain, Code, Palette, Target, Users,
  Download, Upload, Share2, Pin, Archive, Trash2,
  ChevronLeft, Menu, X, Search, Filter, AlertCircle,
  Loader2
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

// Types
interface User {
  id: string
  email: string
  name: string
  image: string
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

interface ApiKey {
  id: string
  provider: string
  isActive: boolean
  createdAt: string
}

interface AiOptimizeClientProps {
  user: User
  limits: Limits
  threads: Thread[]
  initialApiKeys: ApiKey[]
}

export default function AiOptimizeClient({
  user,
  limits,
  threads: initialThreads,
  initialApiKeys
}: AiOptimizeClientProps) {
  // State management
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentThread, setCurrentThread] = useState<Thread | null>(null)
  const [threads, setThreads] = useState<Thread[]>(initialThreads)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('openai')
  const [selectedModel, setSelectedModel] = useState('gpt-4')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('chat')

  // Check if user has valid API keys
  const hasValidApiKey = Object.values(user.apiKeyStatus).some(status => status)

  // Handle API key setup
  const handleSetupApiKeys = () => {
    window.location.href = '/settings/api-keys'
  }

  // Create new thread
  const handleCreateThread = async () => {
    try {
      const response = await fetch('/api/aioptimize/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' })
      })
      
      if (!response.ok) throw new Error('Failed to create thread')
      
      const newThread = await response.json()
      setThreads(prev => [newThread, ...prev])
      setCurrentThread(newThread)
      setMessages([])
      toast.success('New chat created')
    } catch (error) {
      toast.error('Failed to create new chat')
      console.error('Create thread error:', error)
    }
  }

  // Send message
  const handleSendMessage = async () => {
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

    try {
      // Create thread if none exists
      let threadId = currentThread?.id
      if (!threadId) {
        const threadResponse = await fetch('/api/aioptimize/threads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: userMessage.content.substring(0, 50) })
        })
        
        if (threadResponse.ok) {
          const newThread = await threadResponse.json()
          threadId = newThread.id
          setCurrentThread(newThread)
          setThreads(prev => [newThread, ...prev])
        }
      }

      const response = await fetch('/api/aioptimize/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          threadId,
          model: selectedModel,
          provider: selectedProvider,
          mode: 'chat'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

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
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  // Load thread messages
  const loadThreadMessages = async (threadId: string) => {
    try {
      const response = await fetch(`/api/aioptimize/threads/${threadId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.createdAt)
        })))
      }
    } catch (error) {
      console.error('Load messages error:', error)
    }
  }

  // Render API key required state
  if (!hasValidApiKey) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h1 className="font-semibold">AiOptimize</h1>
            </div>
          </div>
        </div>

        {/* API Keys Required */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Card className="max-w-md w-full mx-4 p-6 text-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-6 h-6 text-orange-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">API Keys Required</h2>
            <p className="text-muted-foreground mb-6">
              To use AiOptimize, please configure your AI provider API keys first.
            </p>
            <Button onClick={handleSetupApiKeys} className="w-full">
              Configure API Keys
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "bg-card border-r transition-all duration-300",
        sidebarOpen ? "w-80" : "w-0"
      )}>
        <div className="p-4 border-b">
          <Button
            onClick={handleCreateThread}
            className="w-full justify-start"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => {
                  setCurrentThread(thread)
                  loadThreadMessages(thread.id)
                }}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-colors",
                  currentThread?.id === thread.id 
                    ? "bg-primary/10 border border-primary/20" 
                    : "hover:bg-muted"
                )}
              >
                <div className="font-medium truncate">{thread.title}</div>
                <div className="text-sm text-muted-foreground">
                  {thread.messageCount} messages
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-card border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h1 className="font-semibold">AiOptimize</h1>
              {currentThread && (
                <>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground truncate max-w-48">
                    {currentThread.title}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
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
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                <p className="text-muted-foreground">
                  Ask me anything to get started with AiOptimize
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-4",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-2xl rounded-lg p-4",
                      message.role === 'user' 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    )}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.cost && (
                      <div className="text-xs opacity-70 mt-2">
                        Cost: ${message.cost.toFixed(4)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-4 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Usage Metrics Panel */}
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
          <Separator />
          <div className="text-sm">
            <div className="text-muted-foreground">Current Model</div>
            <div className="font-medium">{selectedModel}</div>
            <div className="text-muted-foreground">{selectedProvider}</div>
          </div>
          <Separator />
          <div className="text-sm space-y-1">
            <div className="text-muted-foreground">API Keys Status</div>
            {Object.entries(user.apiKeyStatus).map(([provider, status]) => (
              <div key={provider} className="flex justify-between">
                <span className="capitalize">{provider}</span>
                <Badge variant={status ? "default" : "secondary"} className="text-xs">
                  {status ? "Active" : "Inactive"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}