'use client'

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { 
  Send, Paperclip, Sparkles, ChevronDown, Zap,
  Brain, Code, Palette, Search, Settings2, Check
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CleanInputProps {
  onSend: (message: string, mode: string, modelOverride?: any) => void
  isLoading: boolean
  currentMode: string
  onModeChange: (mode: string) => void
  onFileAttach?: (files: File[]) => void
  attachedFiles?: File[]
  onRemoveFile?: (index: number) => void
}

const modes = [
  { id: 'balanced', name: 'Balanced', icon: Sparkles, color: 'text-blue-400', description: 'Optimal balance of quality and cost' },
  { id: 'quality', name: 'Quality', icon: Brain, color: 'text-purple-400', description: 'Best possible output quality' },
  { id: 'speed', name: 'Speed', icon: Zap, color: 'text-yellow-400', description: 'Fastest response time' },
  { id: 'budget', name: 'Budget', icon: Search, color: 'text-green-400', description: 'Minimize costs' },
]

const models = [
  { provider: 'openai', model: 'gpt-4o', name: 'GPT-4o', tier: 'premium' },
  { provider: 'openai', model: 'gpt-4o-mini', name: 'GPT-4o Mini', tier: 'standard' },
  { provider: 'claude', model: 'claude-3-opus-20240229', name: 'Claude 3 Opus', tier: 'premium' },
  { provider: 'claude', model: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', tier: 'standard' },
  { provider: 'claude', model: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', tier: 'budget' },
  { provider: 'gemini', model: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', tier: 'premium' },
  { provider: 'gemini', model: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', tier: 'budget' },
]

export function CleanInput({
  onSend,
  isLoading,
  currentMode,
  onModeChange,
  onFileAttach,
  attachedFiles = [],
  onRemoveFile
}: CleanInputProps) {
  const [input, setInput] = useState('')
  const [showModelOverride, setShowModelOverride] = useState(false)
  const [selectedModel, setSelectedModel] = useState<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim(), currentMode, selectedModel)
      setInput('')
      setSelectedModel(null)
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onFileAttach) {
      onFileAttach(Array.from(e.target.files))
    }
  }

  const currentModeData = modes.find(m => m.id === currentMode) || modes[0]

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative">
        {/* Main Input Container */}
        <div className="relative bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl">
          {/* Mode and Model Selection Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800/50">
            <div className="flex items-center gap-2">
              {/* Mode Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs font-medium hover:bg-gray-800/50"
                  >
                    <currentModeData.icon className={cn("w-3.5 h-3.5 mr-1.5", currentModeData.color)} />
                    {currentModeData.name}
                    <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-gray-900 border-gray-800">
                  {modes.map((mode) => (
                    <DropdownMenuItem
                      key={mode.id}
                      onClick={() => onModeChange(mode.id)}
                      className="hover:bg-gray-800"
                    >
                      <div className="flex items-start gap-3 w-full">
                        <mode.icon className={cn("w-4 h-4 mt-0.5", mode.color)} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white">{mode.name}</span>
                            {currentMode === mode.id && (
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

              {/* Model Override */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModelOverride(!showModelOverride)}
                className={cn(
                  "h-8 px-3 text-xs font-medium hover:bg-gray-800/50",
                  selectedModel && "text-purple-400"
                )}
              >
                <Settings2 className="w-3.5 h-3.5 mr-1.5" />
                {selectedModel ? selectedModel.name : 'Auto Model'}
              </Button>
            </div>

            {/* Token Counter (placeholder) */}
            <div className="text-xs text-gray-500">
              ~{Math.ceil(input.length / 4)} tokens
            </div>
          </div>

          {/* Model Override Panel */}
          <AnimatePresence>
            {showModelOverride && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-800/50 bg-gray-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-400">Override Model Selection</span>
                    {selectedModel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedModel(null)}
                        className="h-6 px-2 text-xs hover:bg-gray-800/50"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {models.map((model) => (
                      <button
                        key={`${model.provider}-${model.model}`}
                        onClick={() => setSelectedModel(model)}
                        className={cn(
                          "px-3 py-2 rounded-lg text-xs font-medium transition-all",
                          "hover:bg-gray-800/50 border",
                          selectedModel?.model === model.model
                            ? "bg-purple-500/20 border-purple-500/50 text-purple-400"
                            : "bg-gray-900/30 border-gray-800 text-gray-400"
                        )}
                      >
                        <div className="text-left">
                          <div>{model.name}</div>
                          <div className={cn(
                            "text-[10px] mt-0.5",
                            model.tier === 'premium' && "text-yellow-500",
                            model.tier === 'standard' && "text-blue-500",
                            model.tier === 'budget' && "text-green-500"
                          )}>
                            {model.tier}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Attached Files */}
          {attachedFiles.length > 0 && (
            <div className="px-4 py-2 border-b border-gray-800/50">
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-800/50 rounded-lg text-xs text-gray-400"
                  >
                    <Paperclip className="w-3 h-3" />
                    <span className="max-w-[150px] truncate">{file.name}</span>
                    {onRemoveFile && (
                      <button
                        onClick={() => onRemoveFile(index)}
                        className="ml-1 hover:text-red-400"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Textarea Input */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              className={cn(
                "w-full px-4 py-3 pr-24 bg-transparent text-white placeholder-gray-500",
                "resize-none focus:outline-none",
                "min-h-[56px] max-h-[200px]"
              )}
              disabled={isLoading}
            />

            {/* Action Buttons */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              {onFileAttach && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isLoading}
                          className="h-8 w-8 hover:bg-gray-800/50"
                        >
                          <Paperclip className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Attach files</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className={cn(
                        "h-8 w-8 transition-all",
                        input.trim() && !isLoading
                          ? "text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                          : "text-gray-600"
                      )}
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isLoading ? 'Sending...' : 'Send message (Enter)'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Helper Text */}
        <div className="mt-2 px-1 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {isLoading ? 'Processing...' : 'Press Enter to send, Shift+Enter for new line'}
          </span>
          {selectedModel && (
            <span className="text-xs text-purple-400">
              Using {selectedModel.name}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}