// Main Enhanced AIOptimiseV2 Client Component
// This continues from client-enhanced.tsx

export default function AIOptimiseV2ClientEnhanced({ user, limits }: AIOptimiseV2ClientProps) {
  // Core state
  const [messages, setMessages] = useState<Message[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [currentThread, setCurrentThread] = useState<Thread | null>(null)
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
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [internalDataEnabled, setInternalDataEnabled] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareThread, setShareThread] = useState<Thread | null>(null)
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false)
  
  // Performance metrics
  const [currentCost, setCurrentCost] = useState(0)
  const [savedAmount, setSavedAmount] = useState(0)
  const [promptAnalysis, setPromptAnalysis] = useState<PromptAnalysis | null>(null)
  
  // Collaboration state
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  
  // WebSocket state
  const [wsConnected, setWsConnected] = useState(false)
  const ws = useRef<WebSocket | null>(null)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Session
  const { data: session } = useSession()
  
  // Initialize and validate API keys
  useEffect(() => {
    validateApiKeys()
    loadThreads()
  }, [])
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // WebSocket connection for real-time collaboration
  useEffect(() => {
    if (session?.user?.id && currentThread?.id) {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000'
      ws.current = new WebSocket(`${wsUrl}/ws?userId=${session.user.id}&threadId=${currentThread.id}`)
      
      ws.current.onopen = () => {
        setWsConnected(true)
        console.log('WebSocket connected')
      }
      
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        switch (data.type) {
          case 'user_joined':
            updateCollaboratorStatus(data.userId, 'online')
            break
          case 'user_left':
            updateCollaboratorStatus(data.userId, 'offline')
            break
          case 'typing_start':
            setTypingUsers(prev => new Set(prev).add(data.userId))
            break
          case 'typing_stop':
            setTypingUsers(prev => {
              const newSet = new Set(prev)
              newSet.delete(data.userId)
              return newSet
            })
            break
          case 'message':
            if (data.userId !== session.user.id) {
              setMessages(prev => [...prev, data.message])
            }
            break
        }
      }
      
      ws.current.onclose = () => {
        setWsConnected(false)
        console.log('WebSocket disconnected')
      }
      
      return () => {
        ws.current?.close()
      }
    }
  }, [session, currentThread])
  
  // Validate API keys for models
  const validateApiKeys = async () => {
    try {
      const response = await fetch('/api/settings/api-keys/validate')
      const data = await response.json()
      
      // Update model availability based on API keys
      MODELS.forEach(model => {
        model.available = data[model.provider]?.valid || false
      })
    } catch (error) {
      console.error('Failed to validate API keys:', error)
    }
  }
  
  // Load threads
  const loadThreads = async () => {
    try {
      const response = await fetch('/api/aioptimise/threads?includeShared=true')
      if (!response.ok) throw new Error('Failed to load threads')
      
      const data = await response.json()
      const formattedThreads = data.threads.map((t: any) => ({
        ...t,
        sharedWith: t.collaborators || []
      }))
      
      setThreads(formattedThreads)
      
      if (formattedThreads.length > 0 && !currentThread) {
        selectThread(formattedThreads[0])
      }
    } catch (error) {
      console.error('Failed to load threads:', error)
      toast.error('Failed to load conversations')
    }
  }
  
  // Thread management
  const createThread = async () => {
    try {
      const response = await fetch('/api/aioptimise/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `New Conversation ${new Date().toLocaleString()}`,
          metadata: { createdFrom: 'aioptimise-v2' }
        })
      })
      
      if (!response.ok) throw new Error('Failed to create thread')
      
      const newThread = await response.json()
      setThreads(prev => [newThread, ...prev])
      selectThread(newThread)
      
      toast.success('New conversation created')
    } catch (error) {
      console.error('Failed to create thread:', error)
      toast.error('Failed to create conversation')
    }
  }
  
  const selectThread = async (thread: Thread) => {
    setCurrentThread(thread)
    setMessages([])
    
    // Load messages for this thread
    try {
      const response = await fetch(`/api/aioptimise/threads/${thread.id}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
    
    // Load collaborators
    if (thread.sharedWith) {
      setCollaborators(thread.sharedWith)
    }
  }
  
  const deleteThread = async (threadId: string) => {
    if (!confirm('Delete this conversation? This cannot be undone.')) return
    
    try {
      const response = await fetch(`/api/aioptimise/threads/${threadId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete thread')
      
      setThreads(prev => prev.filter(t => t.id !== threadId))
      
      if (currentThread?.id === threadId) {
        setCurrentThread(null)
        setMessages([])
      }
      
      toast.success('Conversation deleted')
    } catch (error) {
      console.error('Failed to delete thread:', error)
      toast.error('Failed to delete conversation')
    }
  }
  
  const pinThread = async (threadId: string) => {
    const thread = threads.find(t => t.id === threadId)
    if (!thread) return
    
    try {
      const response = await fetch(`/api/aioptimise/threads/${threadId}/pin`, {
        method: thread.isPinned ? 'DELETE' : 'POST'
      })
      
      if (!response.ok) throw new Error('Failed to update pin status')
      
      setThreads(prev => prev.map(t =>
        t.id === threadId ? { ...t, isPinned: !t.isPinned } : t
      ))
      
      toast.success(thread.isPinned ? 'Unpinned' : 'Pinned')
    } catch (error) {
      console.error('Failed to update pin status:', error)
      toast.error('Failed to update pin status')
    }
  }
  
  const renameThread = async (threadId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/aioptimise/threads/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      })
      
      if (!response.ok) throw new Error('Failed to rename thread')
      
      setThreads(prev => prev.map(t =>
        t.id === threadId ? { ...t, title: newTitle } : t
      ))
      
      if (currentThread?.id === threadId) {
        setCurrentThread(prev => prev ? { ...prev, title: newTitle } : null)
      }
      
      toast.success('Conversation renamed')
    } catch (error) {
      console.error('Failed to rename thread:', error)
      toast.error('Failed to rename conversation')
    }
  }
  
  const archiveThread = async (threadId: string) => {
    const thread = threads.find(t => t.id === threadId)
    if (!thread) return
    
    setThreads(prev => prev.map(t =>
      t.id === threadId ? { ...t, isArchived: !t.isArchived } : t
    ))
    
    toast.success(thread.isArchived ? 'Unarchived' : 'Archived')
  }
  
  const shareThreadHandler = async (threadId: string) => {
    const thread = threads.find(t => t.id === threadId)
    if (!thread) return
    
    setShareThread(thread)
    setShowShareDialog(true)
  }
  
  const generateShareLink = async (threadId: string) => {
    try {
      const response = await fetch(`/api/aioptimise/threads/${threadId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) throw new Error('Failed to share thread')
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to share thread:', error)
      throw error
    }
  }
  
  const inviteCollaborator = async (threadId: string, email: string) => {
    try {
      const response = await fetch(`/api/aioptimise/threads/${threadId}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: 'viewer' })
      })
      
      if (!response.ok) throw new Error('Failed to invite collaborator')
      
      // Update local state
      const newCollaborator: Collaborator = {
        id: Date.now().toString(),
        email,
        status: 'invited'
      }
      
      setCollaborators(prev => [...prev, newCollaborator])
      
      // Notify via WebSocket
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: 'collaborator_invited',
          threadId,
          email
        }))
      }
    } catch (error) {
      console.error('Failed to invite collaborator:', error)
      throw error
    }
  }
  
  const updateCollaboratorStatus = (userId: string, status: Collaborator['status']) => {
    setCollaborators(prev => prev.map(c =>
      c.id === userId ? { ...c, status } : c
    ))
  }
  
  // Message handling
  const handleSendMessage = async (text: string) => {
    if (!text.trim() && attachments.length === 0) return
    if (!user.hasApiKeys) {
      toast.error('Please configure API keys first')
      return
    }
    
    // Check if selected model has valid API key
    if (!selectedModel.available) {
      toast.error(`No valid API key for ${selectedModel.provider}. Please add one in settings.`)
      return
    }
    
    // Create or select thread
    if (!currentThread) {
      await createThread()
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
    
    // Notify typing stopped
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'typing_stop',
        threadId: currentThread?.id
      }))
    }
    
    // Get current mode settings
    const currentMode = MODES.find(m => m.id === selectedMode)
    
    try {
      const modelToUse = autoOptimize ? await selectOptimalModel(text) : selectedModel
      
      // Show optimization savings
      if (autoOptimize && modelToUse.id !== selectedModel.id) {
        const saved = (selectedModel.inputCost - modelToUse.inputCost) * text.length / 1000
        setSavedAmount(prev => prev + saved)
        toast.success(`Optimized! Saved $${saved.toFixed(4)} by using ${modelToUse.name}`)
      }
      
      // Create assistant message with thinking status
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        model: modelToUse.name,
        provider: modelToUse.provider,
        status: 'thinking',
        steps: [
          { id: '1', title: 'Processing request', description: 'Understanding your query...', status: 'active' },
          { id: '2', title: 'Searching knowledge', description: webSearchEnabled ? 'Searching web and internal data...' : 'Searching knowledge base...', status: 'pending' },
          { id: '3', title: 'Generating response', description: 'Crafting the best answer...', status: 'pending' }
        ]
      }
      
      setMessages(prev => [...prev, assistantMessage])
      
      // Simulate thinking steps
      for (let i = 0; i < assistantMessage.steps!.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                steps: msg.steps?.map((step, idx) => ({
                  ...step,
                  status: idx < i ? 'complete' : idx === i ? 'active' : 'pending'
                }))
              }
            : msg
        ))
      }
      
      const res = await fetch('/api/aioptimise/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: currentThread?.id,
          message: text,
          model: modelToUse.id,
          provider: modelToUse.provider,
          mode: selectedMode,
          systemPrompt: currentMode?.systemPrompt,
          temperature: currentMode?.temperature,
          maxTokens: currentMode?.maxTokens,
          attachments,
          stream: streamResponse,
          webSearch: webSearchEnabled,
          internalData: internalDataEnabled
        })
      })
      
      if (!res.ok) throw new Error('Failed to send message')
      
      if (streamResponse && res.body) {
        setIsStreaming(true)
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessage.id
            ? { ...msg, status: 'streaming', steps: undefined }
            : msg
        ))
        
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
        
        // Calculate final tokens and cost
        const tokens = {
          input: Math.ceil(text.length / 4),
          output: Math.ceil(fullContent.length / 4),
          total: Math.ceil((text.length + fullContent.length) / 4)
        }
        
        const cost = (tokens.input / 1000) * modelToUse.inputCost + 
                    (tokens.output / 1000) * modelToUse.outputCost
        
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessage.id
            ? { ...msg, status: 'complete', content: fullContent, tokens, cost }
            : msg
        ))
        
        setCurrentCost(prev => prev + cost)
        setIsStreaming(false)
      } else {
        const data = await res.json()
        
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: data.content,
                status: 'complete',
                steps: undefined,
                cost: data.cost,
                tokens: data.tokens,
                latency: data.latency
              }
            : msg
        ))
        
        setCurrentCost(prev => prev + (data.cost || 0))
      }
      
      // Broadcast message via WebSocket
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: 'message',
          threadId: currentThread?.id,
          message: assistantMessage
        }))
      }
    } catch (error) {
      toast.error('Failed to send message')
      console.error(error)
      
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessage.id
          ? { ...msg, status: 'error', content: 'Failed to generate response' }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }
  
  const selectOptimalModel = async (prompt: string): Promise<ModelOption> => {
    const analysis = analyzePrompt(prompt, selectedMode)
    setPromptAnalysis(analysis)
    
    // Filter available models
    const availableModels = MODELS.filter(m => m.available)
    
    if (availableModels.length === 0) {
      throw new Error('No models available. Please configure API keys.')
    }
    
    // Mode-based selection from available models
    const modePreferences: Record<string, string[]> = {
      coding: ['claude-3-opus', 'claude-3-sonnet', 'gpt-4o'],
      creative: ['gpt-4o', 'claude-3-opus'],
      analysis: ['claude-3-opus', 'gemini-pro', 'gpt-4o'],
      focus: ['gemini-pro', 'claude-3-sonnet', 'gpt-4o'],
      chat: ['gpt-4o', 'claude-3-sonnet', 'gemini-pro']
    }
    
    const preferences = modePreferences[selectedMode] || modePreferences.chat
    
    for (const modelId of preferences) {
      const model = availableModels.find(m => m.id === modelId)
      if (model) return model
    }
    
    return availableModels[0]
  }
  
  const analyzePrompt = (prompt: string, mode: string): PromptAnalysis => {
    const wordCount = prompt.split(' ').length
    const hasCode = /```|function|class|const|let|var|import|export/.test(prompt)
    const hasQuestion = /\?|how|what|why|when|where|who/.test(prompt.toLowerCase())
    const hasAnalysis = /analyze|compare|evaluate|assess|review/.test(prompt.toLowerCase())
    const hasWebTerms = /latest|current|news|today|recent/.test(prompt.toLowerCase())
    const hasInternalTerms = /company|internal|our|database|system/.test(prompt.toLowerCase())
    
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
      requiresWeb: hasWebTerms,
      requiresInternal: hasInternalTerms
    }
  }
  
  const handleAttachments = (newAttachments: Attachment[]) => {
    setAttachments(newAttachments)
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
  
  // Render continues in actual implementation...
  return <div>Enhanced AIOptimiseV2 Component - See full implementation</div>
}