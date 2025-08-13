'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  onClose?: () => void
  persistent?: boolean
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  updateToast: (id: string, updates: Partial<Toast>) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const TOAST_ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
}

const TOAST_COLORS = {
  success: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
  error: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  warning: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
  info: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
  loading: 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200',
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const Icon = TOAST_ICONS[toast.type]
  const colorClass = TOAST_COLORS[toast.type]
  
  useEffect(() => {
    if (!toast.persistent && toast.duration !== 0) {
      const timer = setTimeout(() => {
        onRemove()
      }, toast.duration || 5000)
      
      return () => clearTimeout(timer)
    }
  }, [toast, onRemove])
  
  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm rounded-lg border p-4 shadow-lg transition-all',
        'animate-in slide-in-from-top-2 fade-in duration-300',
        colorClass
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon 
          className={cn(
            'h-5 w-5 flex-shrink-0 mt-0.5',
            toast.type === 'loading' && 'animate-spin'
          )} 
        />
        
        <div className="flex-1">
          <p className="font-semibold">{toast.title}</p>
          {toast.message && (
            <p className="mt-1 text-sm opacity-90">{toast.message}</p>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        
        {!toast.persistent && (
          <button
            onClick={onRemove}
            className="flex-shrink-0 rounded-md p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  
  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    if (toast.onClose) {
      const duration = toast.duration || 5000
      if (!toast.persistent && duration > 0) {
        setTimeout(() => {
          toast.onClose?.()
        }, duration)
      }
    }
    
    return id
  }, [])
  
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])
  
  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, ...updates } : toast
      )
    )
  }, [])
  
  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])
  
  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, updateToast, clearToasts }}>
      {children}
      
      {/* Toast Container */}
      <div
        className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end p-4 sm:p-6"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {toasts.map(toast => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onRemove={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}

// Helper hooks for common toast types
export function useSuccessToast() {
  const { addToast } = useToast()
  return useCallback((title: string, message?: string) => {
    return addToast({ type: 'success', title, message })
  }, [addToast])
}

export function useErrorToast() {
  const { addToast } = useToast()
  return useCallback((title: string, message?: string) => {
    return addToast({ type: 'error', title, message })
  }, [addToast])
}

export function useLoadingToast() {
  const { addToast, updateToast, removeToast } = useToast()
  
  return useCallback((title: string, message?: string) => {
    const id = addToast({ 
      type: 'loading', 
      title, 
      message, 
      persistent: true 
    })
    
    return {
      success: (successTitle: string, successMessage?: string) => {
        updateToast(id, { 
          type: 'success', 
          title: successTitle, 
          message: successMessage,
          persistent: false,
          duration: 3000
        })
      },
      error: (errorTitle: string, errorMessage?: string) => {
        updateToast(id, { 
          type: 'error', 
          title: errorTitle, 
          message: errorMessage,
          persistent: false,
          duration: 5000
        })
      },
      dismiss: () => removeToast(id),
    }
  }, [addToast, updateToast, removeToast])
}

// Utility function for async operations with toast feedback
export async function withToastFeedback<T>(
  promise: Promise<T>,
  {
    loading,
    success,
    error,
  }: {
    loading: string
    success: string | ((result: T) => string)
    error?: string | ((err: any) => string)
  },
  toast: ReturnType<typeof useToast>
): Promise<T> {
  const loadingId = toast.addToast({
    type: 'loading',
    title: loading,
    persistent: true,
  })
  
  try {
    const result = await promise
    
    toast.updateToast(loadingId, {
      type: 'success',
      title: typeof success === 'function' ? success(result) : success,
      persistent: false,
      duration: 3000,
    })
    
    return result
  } catch (err) {
    toast.updateToast(loadingId, {
      type: 'error',
      title: error 
        ? (typeof error === 'function' ? error(err) : error)
        : 'An error occurred',
      message: err instanceof Error ? err.message : undefined,
      persistent: false,
      duration: 5000,
    })
    
    throw err
  }
}