'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught:', error, errorInfo)
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Send error to Sentry if configured
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      })
    }

    // Update state with error info
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }))

    // Store error in localStorage for debugging
    if (typeof window !== 'undefined') {
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      }
      
      try {
        const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]')
        existingLogs.push(errorLog)
        // Keep only last 10 errors
        if (existingLogs.length > 10) {
          existingLogs.shift()
        }
        localStorage.setItem('errorLogs', JSON.stringify(existingLogs))
      } catch (e) {
        console.error('Failed to store error log:', e)
      }
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleReportError = () => {
    const { error, errorInfo } = this.state
    const subject = encodeURIComponent('Error Report: AI Cost Guardian')
    const body = encodeURIComponent(`
Error Details:
--------------
${error?.toString()}

Stack Trace:
-----------
${error?.stack}

Component Stack:
---------------
${errorInfo?.componentStack}

User Agent: ${navigator.userAgent}
URL: ${window.location.href}
Time: ${new Date().toISOString()}
    `)
    
    window.location.href = `mailto:support@aicostguardian.com?subject=${subject}&body=${body}`
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }

      const { error, errorInfo, errorCount } = this.state
      const isDevelopment = process.env.NODE_ENV === 'development'
      const showDetails = this.props.showDetails ?? isDevelopment

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-2xl w-full p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Error Icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
                <AlertTriangle className="relative h-20 w-20 text-red-500" />
              </div>

              {/* Error Message */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Oops! Something went wrong
                </h1>
                <p className="text-muted-foreground">
                  We encountered an unexpected error. Don't worry, your data is safe.
                </p>
                {errorCount > 1 && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    This error has occurred {errorCount} times
                  </p>
                )}
              </div>

              {/* Error Details (Development/Debug Mode) */}
              {showDetails && error && (
                <div className="w-full space-y-4">
                  <details className="text-left">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                      Show error details
                    </summary>
                    <div className="mt-4 space-y-4">
                      {/* Error Message */}
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h3 className="text-xs font-semibold text-muted-foreground mb-2">
                          ERROR MESSAGE
                        </h3>
                        <code className="text-xs text-red-600 dark:text-red-400 break-all">
                          {error.toString()}
                        </code>
                      </div>

                      {/* Stack Trace */}
                      {error.stack && (
                        <div className="bg-muted/50 rounded-lg p-4">
                          <h3 className="text-xs font-semibold text-muted-foreground mb-2">
                            STACK TRACE
                          </h3>
                          <pre className="text-xs text-muted-foreground overflow-x-auto">
                            <code>{error.stack}</code>
                          </pre>
                        </div>
                      )}

                      {/* Component Stack */}
                      {errorInfo?.componentStack && (
                        <div className="bg-muted/50 rounded-lg p-4">
                          <h3 className="text-xs font-semibold text-muted-foreground mb-2">
                            COMPONENT STACK
                          </h3>
                          <pre className="text-xs text-muted-foreground overflow-x-auto">
                            <code>{errorInfo.componentStack}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={this.handleReset}
                  variant="default"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
                
                {showDetails && (
                  <Button
                    onClick={this.handleReportError}
                    variant="ghost"
                    className="gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Report Error
                  </Button>
                )}
              </div>

              {/* Support Message */}
              <p className="text-xs text-muted-foreground">
                If this problem persists, please contact{' '}
                <a
                  href="mailto:support@aicostguardian.com"
                  className="text-primary hover:underline"
                >
                  support@aicostguardian.com
                </a>
              </p>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Async Error Boundary for React Suspense
export function AsyncErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
              <h2 className="text-lg font-semibold">Loading Error</h2>
              <p className="text-sm text-muted-foreground">
                Failed to load this section. Please try refreshing.
              </p>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </Card>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// Minimal Error Boundary for critical sections
export function MinimalErrorBoundary({ 
  children,
  message = "Something went wrong"
}: { 
  children: ReactNode
  message?: string
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
          <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// Hook to use with error boundaries
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error handled:', error, errorInfo)
    
    // Send to Sentry
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: errorInfo ? {
          react: {
            componentStack: errorInfo.componentStack,
          },
        } : undefined,
      })
    }
  }
}

// Type augmentation for window.Sentry
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error, context?: any) => void
    }
  }
}