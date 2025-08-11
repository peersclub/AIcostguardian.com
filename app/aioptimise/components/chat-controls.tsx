'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  StopCircle,
  Settings,
  Bot,
  Image as ImageIcon,
  X,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Brain,
  TrendingUp,
  AlertCircle,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModelSelector } from './model-selector';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatControlsProps {
  input: string;
  isLoading: boolean;
  isStreaming: boolean;
  selectedModel: { provider: string; model: string } | null;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  onModelSelect: (provider: string, model: string) => void;
  onImageUpload: (files: FileList) => void;
  onVoiceToggle: () => void;
  isVoiceActive: boolean;
  mode?: 'standard' | 'focus' | 'coding' | 'research' | 'creative';
  promptAnalysisEnabled?: boolean;
}

export function ChatControls({
  input,
  isLoading,
  isStreaming,
  selectedModel,
  onInputChange,
  onSend,
  onStop,
  onModelSelect,
  onImageUpload,
  onVoiceToggle,
  isVoiceActive,
  mode = 'standard',
  promptAnalysisEnabled = true,
}: ChatControlsProps) {
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showPromptAnalysis, setShowPromptAnalysis] = useState(true);
  const [promptAnalysis, setPromptAnalysis] = useState<{
    complexity: 'simple' | 'moderate' | 'complex';
    estimatedTokens: number;
    suggestedModel: string;
    optimizationTips: string[];
    confidence: number;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Analyze prompt in real-time with debounce
  useEffect(() => {
    if (input.length > 10) {
      setIsAnalyzing(true);
      const timer = setTimeout(() => {
        const wordCount = input.split(' ').length;
        const hasCode = input.includes('code') || input.includes('function') || input.includes('class');
        const hasAnalysis = input.includes('analyze') || input.includes('research') || input.includes('explain');
        const hasCreative = input.includes('write') || input.includes('create') || input.includes('generate');
        
        const analysis = {
          complexity: wordCount < 20 ? 'simple' : wordCount < 50 ? 'moderate' : 'complex' as const,
          estimatedTokens: Math.ceil(wordCount * 1.3),
          suggestedModel: 
            hasCode ? 'claude-3.5-sonnet' :
            hasAnalysis ? 'perplexity-sonar-pro' :
            hasCreative ? 'claude-3.5-sonnet' :
            wordCount < 20 ? 'gpt-4o-mini' : 
            wordCount < 50 ? 'gpt-4o' : 
            'claude-3.5-sonnet',
          optimizationTips: [
            wordCount > 50 ? 'Consider breaking into smaller prompts' : '',
            hasCode ? 'Code mode recommended for better syntax' : '',
            hasAnalysis ? 'Research mode may provide citations' : '',
            hasCreative ? 'Creative mode unlocks enhanced generation' : '',
            wordCount > 100 ? 'Long prompts may increase latency' : ''
          ].filter(Boolean),
          confidence: Math.min(95, 70 + (wordCount * 0.5))
        };
        setPromptAnalysis(analysis);
        setIsAnalyzing(false);
      }, 500); // Debounce for 500ms
      
      return () => clearTimeout(timer);
    } else {
      setPromptAnalysis(null);
      setIsAnalyzing(false);
    }
  }, [input]);

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onSend();
      }
    }
    // Stop streaming with Escape key
    if (e.key === 'Escape' && isStreaming) {
      onStop();
    }
  };

  return (
    <motion.div 
      className="absolute bottom-0 left-0 right-0 z-40"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Prompt Analysis Panel */}
      <AnimatePresence mode="wait">
        {promptAnalysisEnabled && promptAnalysis && showPromptAnalysis && (
          <motion.div
            key="analysis-panel"
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              height: 'auto',
              transition: {
                height: { type: 'spring', stiffness: 500, damping: 40 },
                opacity: { duration: 0.3 }
              }
            }}
            exit={{ 
              opacity: 0, 
              y: 10, 
              height: 0,
              transition: {
                height: { duration: 0.2 },
                opacity: { duration: 0.2 }
              }
            }}
            className="bg-gradient-to-b from-gray-900/95 to-gray-900/90 backdrop-blur-xl border-t border-violet-500/20 overflow-hidden"
          >
            <motion.div 
              className="px-4 py-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="flex items-center gap-2"
                    animate={isAnalyzing ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: isAnalyzing ? Infinity : 0, duration: 1 }}
                  >
                    <Brain className={cn(
                      "h-4 w-4 transition-colors",
                      isAnalyzing ? "text-violet-400 animate-pulse" : "text-violet-400"
                    )} />
                    <span className="text-sm font-medium text-white">
                      {isAnalyzing ? 'Analyzing...' : 'Prompt Analysis'}
                    </span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.span 
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium transition-all",
                        promptAnalysis.complexity === 'simple' && "bg-green-500/20 text-green-400",
                        promptAnalysis.complexity === 'moderate' && "bg-yellow-500/20 text-yellow-400",
                        promptAnalysis.complexity === 'complex' && "bg-red-500/20 text-red-400"
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {promptAnalysis.complexity}
                    </motion.span>
                    <span className="text-xs text-gray-400">
                      ~{promptAnalysis.estimatedTokens} tokens
                    </span>
                  </motion.div>
                </div>
                <motion.button
                  onClick={() => setShowPromptAnalysis(false)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white transition-colors rounded hover:bg-gray-800/50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.button>
              </div>
              
              {promptAnalysis.optimizationTips.length > 0 && (
                <motion.div 
                  className="flex items-start gap-2 mt-2"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <AlertCircle className="h-3 w-3 text-violet-400 mt-0.5 animate-pulse" />
                  <div className="flex flex-wrap gap-2">
                    {promptAnalysis.optimizationTips.map((tip, i) => (
                      <motion.span 
                        key={i} 
                        className="text-xs text-gray-400 px-2 py-0.5 bg-gray-800/50 rounded-full"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + (i * 0.1) }}
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
                      >
                        {tip}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
              
              <motion.div 
                className="flex items-center justify-between mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-violet-400" />
                  <span className="text-xs text-gray-400">
                    Suggested: 
                    <motion.span 
                      className="text-violet-400 font-medium ml-1 px-2 py-0.5 bg-violet-500/10 rounded-full"
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(139, 92, 246, 0.2)' }}
                    >
                      {promptAnalysis.suggestedModel}
                    </motion.span>
                  </span>
                </div>
                
                {/* Confidence meter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Confidence:</span>
                  <div className="relative w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${promptAnalysis.confidence}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-xs text-violet-400 font-medium">{promptAnalysis.confidence}%</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Prompt Analysis Toggle */}
      <AnimatePresence>
        {promptAnalysisEnabled && !showPromptAnalysis && promptAnalysis && (
          <motion.div
            key="collapsed-toggle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute -top-10 left-0 right-0 flex justify-center z-10"
          >
            <motion.button
              className="px-4 py-1.5 bg-gradient-to-b from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-t-lg border border-b-0 border-violet-500/20 hover:border-violet-400/30 transition-all group"
              onClick={() => setShowPromptAnalysis(true)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Brain className="h-3 w-3 text-violet-400" />
                </motion.div>
                <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
                  {isAnalyzing ? 'Analyzing...' : `${promptAnalysis.complexity} • ${promptAnalysis.estimatedTokens} tokens`}
                </span>
                <ChevronUp className="h-3 w-3 text-gray-400 group-hover:text-violet-400 transition-colors" />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Input */}
      <motion.div 
        className={cn(
          "bg-gradient-to-b from-violet-900/20 to-purple-900/20 backdrop-blur-xl border-t border-violet-500/20 transition-all duration-300",
          dragActive && "ring-2 ring-violet-500 ring-offset-2"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
      {/* Model selector modal */}
      <ModelSelector
        open={showModelSelector}
        onSelect={(provider, model) => {
          onModelSelect(provider, model);
          setShowModelSelector(false);
        }}
        onClose={() => setShowModelSelector(false)}
      />

      {/* Selected model indicator */}
      {selectedModel && (
        <div className="mb-2 flex items-center justify-between p-2 rounded-lg bg-violet-900/30 border border-violet-500/30">
          <div className="flex items-center gap-2 text-sm">
            <Bot className="h-4 w-4 text-violet-400" />
            <span className="text-gray-400">Using:</span>
            <span className="font-medium text-white">
              {selectedModel.provider} - {selectedModel.model}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onModelSelect('', '')}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

        {/* Main input area */}
        <div className="px-4 py-4">
          <div className="flex gap-2">
            {/* Left controls */}
            <motion.div 
              className="flex flex-col gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, staggerChildren: 0.05 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowModelSelector(!showModelSelector)}
                  title="Select Model (⌘+M)"
                  className={cn(
                    "transition-all duration-200 bg-violet-900/30 border-violet-500/30 hover:bg-violet-800/40 hover:border-violet-400/50 text-violet-300 group relative overflow-hidden",
                    showModelSelector && "bg-violet-600 text-white border-violet-400"
                  )}
                >
                  <Bot className="h-4 w-4 relative z-10" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 opacity-0 group-hover:opacity-20"
                    animate={showModelSelector ? { opacity: [0.2, 0.4, 0.2] } : {}}
                    transition={{ repeat: showModelSelector ? Infinity : 0, duration: 1.5 }}
                  />
                </Button>
              </motion.div>
          
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload Image (⌘+U)"
                  className="transition-all duration-200 bg-violet-900/30 border-violet-500/30 hover:bg-violet-800/40 hover:border-violet-400/50 text-violet-300 group relative overflow-hidden"
                >
                  <ImageIcon className="h-4 w-4 relative z-10" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 opacity-0 group-hover:opacity-20"
                  />
                </Button>
              </motion.div>
          
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onVoiceToggle}
                  title={isVoiceActive ? "Stop Recording (Esc)" : "Start Recording (⌘+K)"}
                  className={cn(
                    "transition-all duration-200 bg-violet-900/30 border-violet-500/30 hover:bg-violet-800/40 hover:border-violet-400/50 text-violet-300 group relative overflow-hidden",
                    isVoiceActive && "bg-red-500 text-white border-red-400"
                  )}
                >
                  {isVoiceActive ? (
                    <MicOff className="h-4 w-4 relative z-10" />
                  ) : (
                    <Mic className="h-4 w-4 relative z-10" />
                  )}
                  <motion.div
                    className={cn(
                      "absolute inset-0",
                      isVoiceActive ? "bg-red-600" : "bg-gradient-to-r from-violet-600 to-purple-600",
                      "opacity-0 group-hover:opacity-20"
                    )}
                    animate={isVoiceActive ? { opacity: [0.2, 0.4, 0.2] } : {}}
                    transition={{ repeat: isVoiceActive ? Infinity : 0, duration: 1.5 }}
                  />
                </Button>
              </motion.div>
            </motion.div>

            {/* Textarea */}
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isVoiceActive 
                    ? "Listening..." 
                    : dragActive 
                    ? "Drop files here..." 
                    : "Type your message... (Shift+Enter for new line, Esc to stop)"
                }
                className={cn(
                  "w-full min-h-[60px] max-h-[200px] resize-none transition-all duration-200 bg-black/40 border-violet-500/30 text-white placeholder:text-violet-300/50 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20",
                  dragActive && "border-violet-400 bg-violet-900/20 scale-[1.02]",
                  isVoiceActive && "border-red-500 bg-red-900/20 animate-pulse"
                )}
                disabled={isLoading || isVoiceActive}
              />
            </motion.div>

            {/* Right controls */}
            <motion.div 
              className="flex flex-col gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {isStreaming ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={onStop}
                    size="icon"
                    variant="destructive"
                    title="Stop Streaming (Esc)"
                    className="bg-red-600 hover:bg-red-700 border-red-500 relative overflow-hidden group"
                  >
                    <StopCircle className="h-4 w-4 relative z-10" />
                    <motion.div
                      className="absolute inset-0 bg-red-700"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: input.trim() && !isLoading ? 1.05 : 1 }}
                  whileTap={{ scale: input.trim() && !isLoading ? 0.95 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  animate={input.trim() && !isLoading ? {
                    rotate: [0, -5, 5, -5, 0],
                  } : {}}
                >
                  <Button
                    onClick={onSend}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    title="Send Message (Enter)"
                    className={cn(
                      "transition-all duration-200 bg-violet-900/30 border-violet-500/30 text-violet-300 relative overflow-hidden group",
                      input.trim() && !isLoading && "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 border-violet-400 text-white shadow-lg shadow-violet-500/25"
                    )}
                  >
                    <Send className="h-4 w-4 relative z-10" />
                    {input.trim() && !isLoading && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600"
                        animate={{ opacity: [0.4, 0.6, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                    )}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            onImageUpload(e.target.files);
          }
        }}
      />

        {/* Helper text */}
        <motion.div 
          className="flex items-center justify-between px-4 pb-2 text-xs text-violet-300/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            {mode !== 'focus' && (
              <>
                <span>Enter to send</span>
                <span className="text-violet-400/40">•</span>
                <span>Shift+Enter for new line</span>
                <span className="text-violet-400/40">•</span>
                <span>Esc to stop</span>
              </>
            )}
          </div>
          {mode !== 'focus' && (
            <div className="flex items-center gap-2">
              <span>Drop files to upload</span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}