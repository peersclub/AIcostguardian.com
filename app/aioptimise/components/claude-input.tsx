'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  Send,
  Paperclip,
  Image,
  FileText,
  Code,
  Mic,
  MicOff,
  ChevronDown,
  Sparkles,
  Hash,
  AtSign,
  Slash,
  Settings,
  Zap,
  AlertCircle,
  X,
  Plus,
  Copy,
  Download,
  Loader2,
  Eye,
  Brain,
  DollarSign,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { ModelSelector } from './model-selector';
import { toast } from 'sonner';

interface PromptAnalysis {
  tokens: number;
  estimatedCost: number;
  complexity: 'simple' | 'moderate' | 'complex';
  suggestions: string[];
  warnings?: string[];
  intent?: string[];
  improvedPrompt?: string;
}

interface ClaudeInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFileUpload?: (files: File[]) => void;
  onImageUpload?: (images: File[]) => void;
  onVoiceToggle?: () => void;
  onModelChange?: (provider: string, model: string) => void;
  isLoading?: boolean;
  isVoiceActive?: boolean;
  selectedModel?: { provider: string; model: string };
  mode?: 'standard' | 'focus' | 'code' | 'research';
  maxTokens?: number;
  placeholder?: string;
  className?: string;
  showAnalysis?: boolean;
  templates?: Array<{ id: string; name: string; prompt: string; category: string }>;
}

export function ClaudeInput({
  value,
  onChange,
  onSend,
  onFileUpload,
  onImageUpload,
  onVoiceToggle,
  onModelChange,
  isLoading = false,
  isVoiceActive = false,
  selectedModel,
  mode = 'standard',
  maxTokens = 4000,
  placeholder = "Message AI Optimise...",
  className,
  showAnalysis = true,
  templates = [],
}: ClaudeInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [attachments, setAttachments] = useState<Array<{ type: string; name: string; url?: string }>>([]);
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = isExpanded ? 400 : 200;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [value, isExpanded]);

  // Analyze prompt
  const analyzePrompt = useCallback(
    debounce(async (prompt: string) => {
      if (!prompt || prompt.length < 10) {
        setAnalysis(null);
        return;
      }

      setIsAnalyzing(true);
      try {
        // Simulate prompt analysis (replace with actual API call)
        const words = prompt.split(' ').length;
        const tokens = Math.ceil(words * 1.3);
        const complexity = tokens < 50 ? 'simple' : tokens < 150 ? 'moderate' : 'complex';
        
        const analysis: PromptAnalysis = {
          tokens,
          estimatedCost: tokens * 0.00001,
          complexity,
          suggestions: [],
          warnings: [],
          intent: [],
        };

        // Add suggestions based on content
        if (prompt.length < 30) {
          analysis.suggestions.push('Consider adding more context for better results');
        }
        if (!prompt.includes('?') && prompt.split(' ').length < 10) {
          analysis.suggestions.push('Try asking a specific question');
        }
        if (prompt.toLowerCase().includes('code')) {
          analysis.intent?.push('coding');
          analysis.suggestions.push('Consider using Code mode for better formatting');
        }
        if (prompt.toLowerCase().includes('research') || prompt.toLowerCase().includes('find')) {
          analysis.intent?.push('research');
          analysis.suggestions.push('Research mode might provide better sources');
        }

        // Check for potential issues
        if (tokens > maxTokens * 0.8) {
          analysis.warnings?.push(`Approaching token limit (${tokens}/${maxTokens})`);
        }

        setAnalysis(analysis);
      } catch (error) {
        console.error('Failed to analyze prompt:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 500),
    [maxTokens]
  );

  useEffect(() => {
    if (showAnalysis) {
      analyzePrompt(value);
    }
  }, [value, showAnalysis, analyzePrompt]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send on Enter (without shift)
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      onSend();
    }
    
    // Show templates on /
    if (e.key === '/' && value === '') {
      e.preventDefault();
      setShowTemplates(true);
    }
    
    // Show mentions on @
    if (e.key === '@') {
      setShowCommands(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newAttachments = files.map(file => ({
      type,
      name: file.name,
      url: type === 'image' ? URL.createObjectURL(file) : undefined,
    }));

    setAttachments([...attachments, ...newAttachments]);

    if (type === 'file' && onFileUpload) {
      onFileUpload(files);
    } else if (type === 'image' && onImageUpload) {
      onImageUpload(files);
    }

    // Reset input
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    if (newAttachments[index].url) {
      URL.revokeObjectURL(newAttachments[index].url!);
    }
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const applyTemplate = (template: any) => {
    onChange(template.prompt);
    setSelectedTemplate(template.id);
    setShowTemplates(false);
    textareaRef.current?.focus();
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'text-green-500';
      case 'moderate':
        return 'text-yellow-500';
      case 'complex':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-2 bg-muted/50 rounded-t-lg">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-2 py-1 bg-background rounded border border-border"
            >
              {attachment.type === 'image' && attachment.url ? (
                <img src={attachment.url} alt={attachment.name} className="h-8 w-8 object-cover rounded" />
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-xs text-foreground truncate max-w-[100px]">
                {attachment.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0"
                onClick={() => removeAttachment(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main input container */}
      <div
        className={cn(
          "relative bg-background border rounded-lg transition-all",
          isFocused ? "border-primary ring-2 ring-primary/20" : "border-border",
          isExpanded && "rounded-t-xl"
        )}
      >
        {/* Top toolbar */}
        {(isFocused || value) && (
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <div className="flex items-center gap-2">
              {/* Model selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span className="text-xs">
                      {selectedModel ? `${selectedModel.provider}/${selectedModel.model}` : 'Auto'}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <ModelSelector
                    onSelect={(provider, model) => onModelChange?.(provider, model)}
                    onClose={() => {}}
                  />
                </DropdownMenuContent>
              </DropdownMenu>

              <Separator orientation="vertical" className="h-4" />

              {/* Quick actions */}
              <TooltipProvider>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setShowTemplates(!showTemplates)}
                      >
                        <Slash className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Templates</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Paperclip className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach file</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => imageInputRef.current?.click()}
                      >
                        <Image className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add image</TooltipContent>
                  </Tooltip>

                  {onVoiceToggle && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={onVoiceToggle}
                        >
                          {isVoiceActive ? (
                            <MicOff className="h-3 w-3 text-red-500" />
                          ) : (
                            <Mic className="h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isVoiceActive ? 'Stop voice input' : 'Start voice input'}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TooltipProvider>
            </div>

            {/* Analysis badges */}
            {analysis && showAnalysis && (
              <div className="flex items-center gap-2">
                {isAnalyzing && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                )}
                <Badge variant="outline" className="text-xs">
                  <Hash className="h-3 w-3 mr-1" />
                  {analysis.tokens} tokens
                </Badge>
                <Badge variant="outline" className={cn("text-xs", getComplexityColor(analysis.complexity))}>
                  <Brain className="h-3 w-3 mr-1" />
                  {analysis.complexity}
                </Badge>
                {analysis.estimatedCost > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <DollarSign className="h-3 w-3 mr-1" />
                    ${analysis.estimatedCost.toFixed(4)}
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          disabled={isLoading}
          className={cn(
            "w-full px-4 py-3 bg-transparent text-foreground resize-none outline-none",
            "placeholder:text-muted-foreground",
            "min-h-[52px] max-h-[400px]",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
          style={{ height: 'auto' }}
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-border">
          <div className="flex items-center gap-2">
            {/* Character/token count */}
            <span className="text-xs text-muted-foreground">
              {value.length} chars
              {analysis && ` • ${analysis.tokens}/${maxTokens} tokens`}
            </span>

            {/* Warnings */}
            {analysis?.warnings && analysis.warnings.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 gap-1 text-yellow-500">
                    <AlertCircle className="h-3 w-3" />
                    <span className="text-xs">{analysis.warnings.length} warnings</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Warnings</h4>
                    {analysis.warnings.map((warning, i) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        • {warning}
                      </p>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Suggestions */}
            {analysis?.suggestions && analysis.suggestions.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-xs">Suggestions</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Suggestions</h4>
                    {analysis.suggestions.map((suggestion, i) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        • {suggestion}
                      </p>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Send button */}
          <Button
            onClick={onSend}
            disabled={isLoading || !value.trim()}
            size="sm"
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Send</span>
                <kbd className="ml-1 text-xs opacity-60">⏎</kbd>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'file')}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'image')}
      />

      {/* Templates dropdown */}
      {showTemplates && templates.length > 0 && (
        <div className="absolute bottom-full mb-2 w-full max-h-60 overflow-y-auto bg-card border border-border rounded-lg shadow-lg">
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground mb-2">Templates</div>
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => applyTemplate(template)}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-muted text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-foreground">{template.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}