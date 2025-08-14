'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Paperclip, Mic, MicOff, Image, FileText, 
  Settings, ChevronUp, ChevronDown, X, Plus,
  Sliders, Hash, AtSign, Code, Link, Calendar,
  Clock, MapPin, Shield, Eye, EyeOff, Zap,
  Wand2, Sparkles, Target, Brain, Palette,
  MessageSquare, Users, Bot, Command, Layers,
  Database, Globe, Upload, Download, Save,
  RefreshCw, Copy, Scissors, Volume2, VolumeX,
  Play, Pause, StopCircle, FastForward, Rewind,
  AlertCircle, Info, HelpCircle, Check, Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
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

interface AdvancedInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onAttach: (files: FileList) => void
  onRecord: () => void
  isRecording: boolean
  isLoading: boolean
  disabled?: boolean
  placeholder?: string
  selectedModel?: any
  attachments?: any[]
  onRemoveAttachment?: (id: string) => void
  mode?: 'focus' | 'coding' | 'creative' | 'analysis'
}

interface InputSettings {
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  systemPrompt: string
  responseFormat: 'text' | 'json' | 'markdown' | 'code'
  streaming: boolean
  saveContext: boolean
  includeHistory: boolean
  contextWindow: number
}

export function AdvancedInput({
  value,
  onChange,
  onSend,
  onAttach,
  onRecord,
  isRecording,
  isLoading,
  disabled,
  placeholder,
  selectedModel,
  attachments = [],
  onRemoveAttachment,
  mode = 'focus'
}: AdvancedInputProps) {
  const [expanded, setExpanded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showMacros, setShowMacros] = useState(false)
  const [settings, setSettings] = useState<InputSettings>({
    temperature: 0.7,
    maxTokens: 4000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    systemPrompt: '',
    responseFormat: 'text',
    streaming: true,
    saveContext: true,
    includeHistory: true,
    contextWindow: 8000
  })
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, expanded ? 300 : 120)}px`
    }
  }, [value, expanded])
  
  // Quick actions
  const quickActions = [
    { icon: Code, label: 'Code Block', action: () => insertText('```\n\n```', 4) },
    { icon: Link, label: 'Link', action: () => insertText('[]()', 1) },
    { icon: Hash, label: 'Heading', action: () => insertText('### ', 4) },
    { icon: AtSign, label: 'Mention', action: () => insertText('@', 1) },
    { icon: Calendar, label: 'Date', action: () => insertText(new Date().toLocaleDateString(), 0) },
    { icon: Clock, label: 'Time', action: () => insertText(new Date().toLocaleTimeString(), 0) },
  ]
  
  // Templates based on mode
  const getTemplates = () => {
    switch (mode) {
      case 'coding':
        return [
          { label: 'Debug Error', text: 'Help me debug this error:\n```\n[paste error here]\n```\n\nHere\'s my code:\n```\n[paste code here]\n```' },
          { label: 'Code Review', text: 'Please review this code for best practices, performance, and potential issues:\n```\n[paste code here]\n```' },
          { label: 'Refactor', text: 'Can you help me refactor this code to be more maintainable and efficient?\n```\n[paste code here]\n```' },
          { label: 'Unit Test', text: 'Write comprehensive unit tests for this function:\n```\n[paste function here]\n```' },
        ]
      case 'creative':
        return [
          { label: 'Story Starter', text: 'Write a compelling opening paragraph for a story about [topic]' },
          { label: 'Character', text: 'Create a detailed character profile for [describe character]' },
          { label: 'Dialogue', text: 'Write a dialogue between [character A] and [character B] about [topic]' },
          { label: 'Description', text: 'Describe [scene/object/person] in vivid detail' },
        ]
      case 'analysis':
        return [
          { label: 'Compare', text: 'Compare and contrast [item A] with [item B], highlighting key differences and similarities' },
          { label: 'Summarize', text: 'Provide a comprehensive summary of:\n[paste content here]' },
          { label: 'Analyze', text: 'Analyze the following data and provide insights:\n[paste data here]' },
          { label: 'Evaluate', text: 'Evaluate the pros and cons of [topic/decision]' },
        ]
      default:
        return [
          { label: 'Quick Question', text: 'Can you briefly explain [topic]?' },
          { label: 'How To', text: 'How do I [task]?' },
          { label: 'Best Practices', text: 'What are the best practices for [topic]?' },
          { label: 'Recommendations', text: 'Can you recommend [type] for [purpose]?' },
        ]
    }
  }
  
  const insertText = (text: string, cursorOffset: number) => {
    if (!textareaRef.current) return
    
    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    const newValue = value.substring(0, start) + text + value.substring(end)
    
    onChange(newValue)
    
    // Set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = start + cursorOffset
        textareaRef.current.selectionEnd = start + cursorOffset
        textareaRef.current.focus()
      }
    }, 0)
  }
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onAttach(e.target.files)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
    
    // Keyboard shortcuts
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          insertText('**', 2)
          break
        case 'i':
          e.preventDefault()
          insertText('*', 1)
          break
        case 'k':
          e.preventDefault()
          insertText('[]()', 1)
          break
        case 'e':
          e.preventDefault()
          setExpanded(!expanded)
          break
      }
    }
  }
  
  return (
    <div className="w-full space-y-3">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <motion.div
              key={attachment.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative group"
            >
              <div className="p-2 bg-gray-800 rounded-lg border border-gray-700 flex items-center gap-2">
                {attachment.type === 'image' ? (
                  <Image className="w-4 h-4 text-blue-400" />
                ) : (
                  <FileText className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-xs text-gray-300">{attachment.name}</span>
                {onRemoveAttachment && (
                  <button
                    onClick={() => onRemoveAttachment(attachment.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-gray-400 hover:text-white" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Collapsible Advanced Features */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 space-y-4">
              {/* Quick Actions Bar */}
              <div>
                <p className="text-xs text-gray-400 mb-2">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, idx) => {
                    const Icon = action.icon
                    return (
                      <TooltipProvider key={idx}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={action.action}
                              className="h-8 px-2 border-gray-700 bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white"
                            >
                              <Icon className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{action.label}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </div>
              </div>
              
              {/* Templates */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-400">Templates</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="h-6 px-2 text-xs text-gray-400 hover:text-white"
                  >
                    {showTemplates ? 'Hide' : 'Show'}
                  </Button>
                </div>
                {showTemplates && (
                  <div className="grid grid-cols-2 gap-2">
                    {getTemplates().map((template, idx) => (
                      <Button
                        key={idx}
                        size="sm"
                        variant="outline"
                        onClick={() => onChange(template.text)}
                        className="h-8 justify-start border-gray-700 bg-gray-800/50 hover:bg-gray-700 text-gray-300 hover:text-white text-xs"
                      >
                        {template.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Advanced Settings */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-400">Advanced Settings</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowSettings(!showSettings)}
                    className="h-6 px-2 text-xs text-gray-400 hover:text-white"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    {showSettings ? 'Hide' : 'Configure'}
                  </Button>
                </div>
                
                {showSettings && (
                  <div className="space-y-3 p-3 bg-gray-800/50 rounded-lg">
                    {/* Temperature */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-gray-400">Temperature</label>
                        <span className="text-xs text-white">{settings.temperature}</span>
                      </div>
                      <Slider
                        value={[settings.temperature]}
                        onValueChange={([v]) => setSettings(s => ({ ...s, temperature: v }))}
                        min={0}
                        max={2}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                    
                    {/* Max Tokens */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-gray-400">Max Tokens</label>
                        <span className="text-xs text-white">{settings.maxTokens}</span>
                      </div>
                      <Slider
                        value={[settings.maxTokens]}
                        onValueChange={([v]) => setSettings(s => ({ ...s, maxTokens: v }))}
                        min={100}
                        max={32000}
                        step={100}
                        className="w-full"
                      />
                    </div>
                    
                    {/* Response Format */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Response Format</label>
                      <div className="flex gap-2">
                        {(['text', 'markdown', 'code', 'json'] as const).map((format) => (
                          <Button
                            key={format}
                            size="sm"
                            variant={settings.responseFormat === format ? 'default' : 'outline'}
                            onClick={() => setSettings(s => ({ ...s, responseFormat: format }))}
                            className="h-7 px-2 text-xs"
                          >
                            {format}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Toggles */}
                    <div className="space-y-2">
                      <label className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Streaming</span>
                        <Switch
                          checked={settings.streaming}
                          onCheckedChange={(v) => setSettings(s => ({ ...s, streaming: v }))}
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Save Context</span>
                        <Switch
                          checked={settings.saveContext}
                          onCheckedChange={(v) => setSettings(s => ({ ...s, saveContext: v }))}
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Include History</span>
                        <Switch
                          checked={settings.includeHistory}
                          onCheckedChange={(v) => setSettings(s => ({ ...s, includeHistory: v }))}
                        />
                      </label>
                    </div>
                    
                    {/* System Prompt */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">System Prompt</label>
                      <textarea
                        value={settings.systemPrompt}
                        onChange={(e) => setSettings(s => ({ ...s, systemPrompt: e.target.value }))}
                        placeholder="Optional system prompt..."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Input Area */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Type your message... (Shift+Enter for new line)"}
            disabled={disabled || isLoading}
            className={cn(
              "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50",
              expanded && "min-h-[120px]"
            )}
            rows={1}
          />
          
          {/* Character/Token Count */}
          {value.length > 0 && (
            <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs text-gray-500">
              <span>{value.length} chars</span>
              <span>~{Math.ceil(value.length / 4)} tokens</span>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Expand/Collapse */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setExpanded(!expanded)}
                  className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
                >
                  {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {expanded ? 'Hide' : 'Show'} advanced options (⌘E)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.txt,.md,.doc,.docx,.csv,.json"
          />
          
          {/* Attach Files */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach files</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Voice Input */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={onRecord}
                  className={cn(
                    "border-gray-700 bg-gray-800 hover:bg-gray-700",
                    isRecording ? "text-red-400" : "text-gray-400 hover:text-white"
                  )}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isRecording ? 'Stop recording' : 'Start voice input'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Send Button */}
          <Button
            onClick={onSend}
            disabled={(!value.trim() && attachments.length === 0) || isLoading || disabled}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Keyboard Shortcuts Hint */}
      {expanded && (
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>⌘B Bold</span>
          <span>⌘I Italic</span>
          <span>⌘K Link</span>
          <span>⌘E Toggle Advanced</span>
          <span>⌘Enter Send</span>
        </div>
      )}
    </div>
  )
}