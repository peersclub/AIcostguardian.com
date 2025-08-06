'use client'

import React, { Component, ReactNode, ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetKeys?: Array<string | number>
  resetOnPropsChange?: boolean
  isolate?: boolean
  level?: 'page' | 'section' | 'component'
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: NodeJS.Timeout | null = null
  private previousResetKeys: Array<string | number> = []

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    }
    
    if (props.resetKeys) {
      this.previousResetKeys = props.resetKeys
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props
    const { errorCount } = this.state

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Call onError callback if provided
    onError?.(error, errorInfo)

    // Update state with error details
    this.setState({
      errorInfo,
      errorCount: errorCount + 1,
    })

    // Auto-reset after 10 seconds if error count is low
    if (errorCount < 3) {
      this.resetTimeoutId = setTimeout(() => {
        this.resetErrorBoundary()
      }, 10000)
    }

    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo)
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state

    // Reset on props change if enabled
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary()
    }

    // Reset if resetKeys changed
    if (resetKeys && hasError) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== this.previousResetKeys[index]
      )
      
      if (hasResetKeyChanged) {
        this.resetErrorBoundary()
        this.previousResetKeys = resetKeys
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
      this.resetTimeoutId = null
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  reportError(error: Error, errorInfo: ErrorInfo) {
    // Integrate with error tracking service (e.g., Sentry, LogRocket)
    // This is a placeholder for actual implementation
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    }

    // Send to monitoring service
    if (window.fetch) {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport),
      }).catch(err => {
        console.error('Failed to report error:', err)
      })
    }
  }

  render() {
    const { hasError, error, errorCount } = this.state
    const { children, fallback, isolate, level = 'component' } = this.props

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return <>{fallback}</>
      }

      // Different error UIs based on level
      switch (level) {
        case 'page':
          return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
              <div className="max-w-md w-full">
                <Card className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-red-100 rounded-full">
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Something went wrong
                  </h1>
                  <p className="text-gray-600 mb-6">
                    We encountered an unexpected error. Please try refreshing the page.
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <details className="mb-6 text-left">
                      <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                        Error details
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={this.resetErrorBoundary}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try again
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/'}
                    >
                      Go to homepage
                    </Button>
                  </div>
                  {errorCount > 2 && (
                    <p className="mt-4 text-sm text-orange-600">
                      Multiple errors detected. Please contact support if the issue persists.
                    </p>
                  )}
                </Card>
              </div>
            </div>
          )

        case 'section':
          return (
            <Card className="p-6 border-red-200 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-1">
                    Section Error
                  </h3>
                  <p className="text-sm text-red-700 mb-3">
                    This section couldn't be loaded properly.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={this.resetErrorBoundary}
                    className="text-red-700 border-red-300 hover:bg-red-100"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </Card>
          )

        case 'component':
        default:
          if (isolate) {
            return (
              <div className="p-4 border border-red-200 rounded bg-red-50">
                <p className="text-sm text-red-600">Component error</p>
                <button
                  onClick={this.resetErrorBoundary}
                  className="text-xs text-red-700 underline mt-1"
                >
                  Retry
                </button>
              </div>
            )
          }
          
          // Re-throw if not isolated
          throw error
      }
    }

    return children
  }
}