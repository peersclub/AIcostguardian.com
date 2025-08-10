'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  Mic,
  StopCircle,
  Image,
  FileText,
  X,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EnhancedInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  isStreaming?: boolean;
  selectedModel?: any;
  analysis?: any;
  showAnalysis?: boolean;
  onToggleAnalysis?: () => void;
  onFileAttach?: (files: File[]) => void;
  onVoiceInput?: () => void;
}

export function EnhancedInput({
  value,
  onChange,
  onSend,
  placeholder = "Type your message...",
  disabled = false,
  isStreaming = false,
  selectedModel,
  analysis,
  showAnalysis = false,
  onToggleAnalysis,
  onFileAttach,
  onVoiceInput
}: EnhancedInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled && !isStreaming) {
        onSend();
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
    if (onFileAttach) {
      onFileAttach(files);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setAttachedFiles(prev => [...prev, ...files]);
    if (onFileAttach) {
      onFileAttach(files);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (onVoiceInput) {
      onVoiceInput();
    }
  };

  const formatCost = (cost: number): string => {
    if (cost < 0.001) return `$${(cost * 1000).toFixed(4)}m`;
    if (cost < 0.01) return `$${cost.toFixed(5)}`;
    return `$${cost.toFixed(4)}`;
  };

  return (
    <div className="space-y-3">
      {/* Analysis Summary */}
      <AnimatePresence>
        {analysis && showAnalysis && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-3 bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Smart Analysis</span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={onToggleAnalysis}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">
                    {analysis.contentType?.replace(/_/g, ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Complexity</p>
                  <p className="font-medium">Level {analysis.complexity}/5</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Est. Tokens</p>
                  <p className="font-medium">{analysis.tokens?.estimated}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attached Files */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachedFiles.map((file, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {file.type.startsWith('image/') ? (
                <Image className="h-3 w-3" />
              ) : (
                <FileText className="h-3 w-3" />
              )}
              <span className="text-xs max-w-[100px] truncate">
                {file.name}
              </span>
              <button
                onClick={() => removeFile(index)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div 
        className={cn(
          "relative rounded-lg border transition-colors",
          dragOver && "border-primary bg-primary/5",
          disabled && "opacity-50"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[60px] max-h-[200px] pr-24 resize-none border-0 focus:ring-0"
          disabled={disabled || isStreaming}
        />

        {/* Character Counter */}
        <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
          {value.length > 0 && `${value.length} characters`}
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          {/* File Attachment */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isStreaming}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Voice Input */}
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-8 w-8",
              isRecording && "text-red-500 animate-pulse"
            )}
            onClick={toggleRecording}
            disabled={disabled || isStreaming}
          >
            <Mic className="h-4 w-4" />
          </Button>

          {/* Send Button */}
          <Button
            size="sm"
            onClick={onSend}
            disabled={!value.trim() || disabled || isStreaming || !selectedModel}
            className="gap-2"
          >
            {isStreaming ? (
              <>
                <StopCircle className="h-4 w-4" />
                Stop
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Model Info */}
      {selectedModel && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Model: <strong>{selectedModel.displayName}</strong>
          </span>
          {selectedModel.estimatedCost && (
            <span>
              Est. cost: <strong>{formatCost(selectedModel.estimatedCost.total)}</strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
}