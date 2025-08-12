'use client';

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  Image,
  Mic,
  MicOff,
  ChevronDown,
  Sparkles,
  X,
  Loader2,
  Hash,
  Brain,
  Zap,
  Code2,
  Search,
  Palette,
  StopCircle,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Info,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface PromptAnalysis {
  complexity?: 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'EXPERT';
  contentType?: 'CODE' | 'CREATIVE' | 'ANALYSIS' | 'GENERAL';
  domain?: string;
  hasCode?: boolean;
  estimatedTokens?: number;
  selectedModel?: { provider: string; model: string };
  modelReason?: string;
  confidence?: number;
  suggestions?: string[];
}

interface UnifiedInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  onImageUpload?: (files: FileList) => void;
  onVoiceToggle?: () => void;
  onModelSelect?: (provider: string, model: string) => void;
  onModeChange?: (mode: 'standard' | 'focus' | 'coding' | 'research' | 'creative') => void;
  isLoading?: boolean;
  isStreaming?: boolean;
  isVoiceActive?: boolean;
  selectedModel?: { provider: string; model: string } | null;
  mode?: 'standard' | 'focus' | 'coding' | 'research' | 'creative';
  placeholder?: string;
  className?: string;
  uploadedImages?: string[];
  onRemoveImage?: (index: number) => void;
  promptAnalysis?: PromptAnalysis | null;
  overrideCount?: number;
  onOverrideModel?: () => void;
}

const modeConfig = {
  standard: {
    icon: Sparkles,
    label: 'Standard',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    description: 'General purpose AI assistance',
  },
  focus: {
    icon: Zap,
    label: 'Focus',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: 'Minimal distractions, maximum productivity',
  },
  coding: {
    icon: Code2,
    label: 'Code',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    description: 'Optimized for programming tasks',
  },
  research: {
    icon: Search,
    label: 'Research',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    description: 'Deep analysis and exploration',
  },
  creative: {
    icon: Palette,
    label: 'Creative',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    description: 'Imaginative and artistic tasks',
  },
};

const modelPresets = [
  { provider: 'openai', model: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'Most capable, slower' },
  { provider: 'openai', model: 'gpt-3.5-turbo', label: 'GPT-3.5', description: 'Fast and efficient' },
  { provider: 'anthropic', model: 'claude-3-opus', label: 'Claude 3 Opus', description: 'Most capable Claude' },
  { provider: 'anthropic', model: 'claude-3-sonnet', label: 'Claude 3 Sonnet', description: 'Balanced performance' },
  { provider: 'google', model: 'gemini-pro', label: 'Gemini Pro', description: 'Google\'s latest' },
  { provider: 'auto', model: 'auto', label: 'Auto Select', description: 'Let AI choose the best model' },
];

export function ClaudeUnifiedInput({
  value,
  onChange,
  onSend,
  onStop,
  onImageUpload,
  onVoiceToggle,
  onModelSelect,
  onModeChange,
  isLoading = false,
  isStreaming = false,
  isVoiceActive = false,
  selectedModel = null,
  mode = 'standard',
  placeholder = 'Message AIOptimise...',
  className,
  uploadedImages = [],
  onRemoveImage,
  promptAnalysis = null,
  overrideCount = 0,
  onOverrideModel,
}: UnifiedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisVisible, setAnalysisVisible] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentMode = modeConfig[mode];
  const ModeIcon = currentMode.icon;

  // Show analysis when new data arrives, hide after delay
  useEffect(() => {
    if (promptAnalysis) {
      setShowAnalysis(true);
      setAnalysisVisible(true);
      
      // Clear existing timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      // Hide after 8 seconds for better readability
      hideTimeoutRef.current = setTimeout(() => {
        setAnalysisVisible(false);
      }, 8000);
    } else {
      setShowAnalysis(false);
    }
    
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [promptAnalysis]);

  const getComplexityColor = (complexity?: string) => {
    switch (complexity) {
      case 'SIMPLE': return 'text-green-400 bg-green-500/20 border-green-500/40';
      case 'MODERATE': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40';
      case 'COMPLEX': return 'text-orange-400 bg-orange-500/20 border-orange-500/40';
      case 'EXPERT': return 'text-red-400 bg-red-500/20 border-red-500/40';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/40';
    }
  };

  const getContentTypeIcon = (contentType?: string) => {
    switch (contentType) {
      case 'CODE': return Code2;
      case 'CREATIVE': return Palette;
      case 'ANALYSIS': return TrendingUp;
      default: return Brain;
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 300)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && !isStreaming) {
      e.preventDefault();
      onSend();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onImageUpload) {
      onImageUpload(e.target.files);
      e.target.value = '';
    }
  };

  const getModelDisplay = () => {
    if (!selectedModel || (selectedModel.provider === 'auto' && selectedModel.model === 'auto')) {
      return 'Auto';
    }
    const preset = modelPresets.find(
      p => p.provider === selectedModel.provider && p.model === selectedModel.model
    );
    return preset?.label || `${selectedModel.provider}/${selectedModel.model}`;
  };

  return (
    <div className={cn('relative', className)}>
      {/* Prompt Analysis Panel - Sticky Above Input */}
      <AnimatePresence>
        {showAnalysis && promptAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ 
              opacity: analysisVisible ? 1 : 0.4, 
              y: 0,
              height: 'auto'
            }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="mb-2 sticky top-0 z-20"
          >
            <div className="bg-black/90 backdrop-blur-2xl rounded-xl border border-indigo-500/20 p-2.5 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/20 rounded-xl pointer-events-none" />
              
              <div className="relative">
                {/* Compact Single Row Layout */}
                <div className="flex items-center gap-3">
                  {/* Left: AI Badge & Analysis Metrics */}
                  <div className="flex items-center gap-3 flex-1">
                    {/* AI Badge */}
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 bg-violet-500/20 rounded">
                        <Brain className="h-3 w-3 text-violet-400" />
                      </div>
                      <span className="text-xs font-medium text-gray-300">AI</span>
                    </div>

                    {/* Divider */}
                    <div className="h-4 w-px bg-gray-700" />

                    {/* Analysis Metrics - Horizontal */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Complexity */}
                      {promptAnalysis.complexity && (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-500">Complexity:</span>
                          <Badge className={cn('text-[10px] px-1.5 py-0 h-4', getComplexityColor(promptAnalysis.complexity))}>
                            {promptAnalysis.complexity}
                          </Badge>
                        </div>
                      )}

                      {/* Type */}
                      {promptAnalysis.contentType && (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-500">Type:</span>
                          <div className="flex items-center gap-0.5">
                            {(() => {
                              const Icon = getContentTypeIcon(promptAnalysis.contentType);
                              return <Icon className="h-3 w-3 text-indigo-400" />;
                            })()}
                            <span className="text-[10px] text-gray-300">{promptAnalysis.contentType}</span>
                          </div>
                        </div>
                      )}

                      {/* Tokens */}
                      {promptAnalysis.estimatedTokens && (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-500">Tokens:</span>
                          <span className="text-[10px] text-gray-300 font-mono">{promptAnalysis.estimatedTokens}</span>
                        </div>
                      )}

                      {/* Code */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-500">Code:</span>
                        {promptAnalysis.hasCode ? (
                          <CheckCircle2 className="h-3 w-3 text-green-400" />
                        ) : (
                          <X className="h-3 w-3 text-gray-500" />
                        )}
                      </div>

                      {/* Confidence */}
                      {promptAnalysis.confidence && (
                        <Badge className="text-[10px] px-1.5 py-0 h-4 bg-violet-500/10 text-violet-300 border-violet-500/30">
                          {Math.round(promptAnalysis.confidence * 100)}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Middle: Model Selection */}
                  {promptAnalysis.selectedModel && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-lg border border-indigo-500/10">
                      <Zap className="h-3 w-3 text-yellow-400" />
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-400">Model:</span>
                        <Badge className="text-[10px] px-1.5 py-0 h-4 bg-violet-500/20 text-violet-300 border-violet-500/30">
                          {promptAnalysis.selectedModel.provider}
                        </Badge>
                        <span className="text-[10px] text-gray-200 font-mono">
                          {promptAnalysis.selectedModel.model}
                        </span>
                      </div>
                      {onOverrideModel && (
                        <button
                          onClick={onOverrideModel}
                          className="p-0.5 hover:bg-violet-500/20 rounded transition-colors"
                          title="Override model selection"
                        >
                          <RefreshCw className="h-2.5 w-2.5 text-violet-400" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Right: Controls */}
                  <div className="flex items-center gap-1.5">
                    {overrideCount > 0 && (
                      <Badge className="text-[10px] px-1.5 py-0 h-4 bg-purple-500/10 text-purple-300 border-purple-500/30">
                        {overrideCount}
                      </Badge>
                    )}
                    <button
                      onClick={() => setAnalysisVisible(!analysisVisible)}
                      className="p-1 hover:bg-gray-800/50 rounded transition-colors"
                      title={analysisVisible ? 'Hide analysis' : 'Show analysis'}
                    >
                      {analysisVisible ? <EyeOff className="h-3 w-3 text-gray-400" /> : <Eye className="h-3 w-3 text-gray-400" />}
                    </button>
                  </div>
                </div>

                {/* Model Reason - Only show on hover or when expanded */}
                {promptAnalysis.selectedModel && promptAnalysis.modelReason && analysisVisible && (
                  <div className="mt-1.5 flex items-start gap-1.5 px-1">
                    <Info className="h-2.5 w-2.5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] text-gray-400 italic leading-relaxed">{promptAnalysis.modelReason}</p>
                  </div>
                )}

                {/* Suggestions - Compact */}
                {promptAnalysis.suggestions && promptAnalysis.suggestions.length > 0 && analysisVisible && (
                  <div className="mt-1.5 flex items-start gap-1.5 px-1">
                    <AlertCircle className="h-2.5 w-2.5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400">
                        {promptAnalysis.suggestions.join(' • ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <div className="flex gap-2 mb-3 p-3 bg-gray-900/50 rounded-xl border border-gray-800">
          {uploadedImages.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img}
                alt={`Upload ${index + 1}`}
                className="h-16 w-16 object-cover rounded-lg border border-gray-700"
              />
              {onRemoveImage && (
                <button
                  onClick={() => onRemoveImage(index)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Input Container */}
      <div
        className={cn(
          'relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border transition-all',
          isFocused
            ? `${currentMode.borderColor} border-opacity-100`
            : 'border-gray-800 hover:border-gray-700',
          isStreaming && 'ring-2 ring-violet-500/20'
        )}
      >
        <div className="flex items-end">
          {/* Left Section: Mode & Model Selector */}
          <div className="flex items-center gap-2 p-3 pb-4">
            {/* Mode Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors',
                  currentMode.bgColor,
                  'hover:opacity-80'
                )}>
                  <ModeIcon className={cn('h-4 w-4', currentMode.color)} />
                  <span className={cn('text-sm font-medium', currentMode.color)}>
                    {currentMode.label}
                  </span>
                  <ChevronDown className={cn('h-3 w-3', currentMode.color)} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 bg-gray-900 border-gray-800">
                {Object.entries(modeConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => onModeChange?.(key as any)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 cursor-pointer"
                    >
                      <div className={cn('p-1.5 rounded-lg', config.bgColor)}>
                        <Icon className={cn('h-4 w-4', config.color)} />
                      </div>
                      <div className="flex-1">
                        <div className={cn('text-sm font-medium', config.color)}>
                          {config.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {config.description}
                        </div>
                      </div>
                      {mode === key && (
                        <div className="h-2 w-2 rounded-full bg-violet-400" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Model Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
                  <Hash className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-sm text-gray-300">{getModelDisplay()}</span>
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72 bg-gray-900 border-gray-800">
                <div className="px-3 py-2">
                  <div className="text-xs font-medium text-gray-400 mb-1">AI Model</div>
                  <div className="text-xs text-gray-600">Select model or let AI choose</div>
                </div>
                <DropdownMenuSeparator className="bg-gray-800" />
                {modelPresets.map((preset) => (
                  <DropdownMenuItem
                    key={`${preset.provider}-${preset.model}`}
                    onClick={() => onModelSelect?.(preset.provider, preset.model)}
                    className="flex items-center justify-between px-3 py-2 hover:bg-gray-800 cursor-pointer"
                  >
                    <div>
                      <div className="text-sm text-gray-200">{preset.label}</div>
                      <div className="text-xs text-gray-500">{preset.description}</div>
                    </div>
                    {selectedModel?.provider === preset.provider && 
                     selectedModel?.model === preset.model && (
                      <div className="h-2 w-2 rounded-full bg-violet-400" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Center: Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={isLoading || isStreaming}
              className={cn(
                'w-full bg-transparent text-gray-100 placeholder-gray-500',
                'resize-none outline-none px-2 py-3',
                'min-h-[52px] max-h-[300px]',
                (isLoading || isStreaming) && 'opacity-50 cursor-not-allowed'
              )}
              rows={1}
            />
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-1 p-3 pb-4">
            {/* Attachment Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isStreaming}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Voice Input */}
            {onVoiceToggle && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8 hover:bg-gray-800',
                  isVoiceActive
                    ? 'text-red-400 hover:text-red-300'
                    : 'text-gray-400 hover:text-gray-200'
                )}
                onClick={onVoiceToggle}
                disabled={isLoading || isStreaming}
              >
                {isVoiceActive ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Send/Stop Button */}
            {isStreaming ? (
              <Button
                onClick={onStop}
                size="icon"
                className="h-8 w-8 bg-red-500 hover:bg-red-600 text-white"
              >
                <StopCircle className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={onSend}
                disabled={isLoading || (!value.trim() && uploadedImages.length === 0)}
                size="icon"
                className={cn(
                  'h-8 w-8',
                  value.trim() || uploadedImages.length > 0
                    ? 'bg-violet-500 hover:bg-violet-600 text-white'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Bottom hint bar */}
        <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-between px-3 text-xs text-gray-600">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {value.length > 0 && (
            <span>{value.length} characters</span>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageSelect}
      />
    </div>
  );
}