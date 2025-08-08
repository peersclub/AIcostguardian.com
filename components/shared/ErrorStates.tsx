'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorDisplayProps {
  title?: string
  message?: string
  details?: string
  onRetry?: () => void
  onDismiss?: () => void
  variant?: 'card' | 'alert' | 'inline'
  retryText?: string
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  details,
  onRetry,
  onDismiss,
  variant = 'alert',
  retryText = 'Try Again'
}) => {
  if (variant === 'card') {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 mb-4">{message}</p>
          {details && (
            <details className="mb-4">
              <summary className="text-red-600 cursor-pointer text-sm">View Details</summary>
              <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto text-red-800">
                {details}
              </pre>
            </details>
          )}
          <div className="flex space-x-2">
            {onRetry && (
              <Button 
                onClick={onRetry}
                variant="outline" 
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                {retryText}
              </Button>
            )}
            {onDismiss && (
              <Button 
                onClick={onDismiss}
                variant="ghost" 
                size="sm"
                className="text-red-600 hover:text-red-800"
              >
                Dismiss
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'inline') {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4 max-w-md mx-auto">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            {retryText}
          </Button>
        )}
      </div>
    )
  }

  return (
    <Alert className="border-red-200 bg-red-50">
      <div className="flex items-start">
        <span className="text-red-500 mr-2 text-lg">⚠️</span>
        <div className="flex-1">
          <h4 className="text-red-800 font-medium">{title}</h4>
          <p className="text-red-700 text-sm mt-1">{message}</p>
          {details && (
            <details className="mt-2">
              <summary className="text-red-600 cursor-pointer text-xs">View Details</summary>
              <pre className="mt-1 text-xs bg-red-100 p-2 rounded overflow-auto text-red-800">
                {details}
              </pre>
            </details>
          )}
        </div>
        <div className="ml-4 flex space-x-2">
          {onRetry && (
            <Button 
              onClick={onRetry}
              size="sm"
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              {retryText}
            </Button>
          )}
          {onDismiss && (
            <Button 
              onClick={onDismiss}
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </Button>
          )}
        </div>
      </div>
    </Alert>
  )
}

export const NetworkErrorDisplay: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorDisplay
    title="Network Error"
    message="Unable to connect to the server. Please check your internet connection."
    onRetry={onRetry}
    retryText="Retry Connection"
    variant="inline"
  />
)

export const AuthErrorDisplay: React.FC<{ onSignIn?: () => void }> = ({ onSignIn }) => (
  <ErrorDisplay
    title="Authentication Required"
    message="Please sign in to access this feature."
    onRetry={onSignIn}
    retryText="Sign In"
    variant="inline"
  />
)

export const NotFoundDisplay: React.FC<{ resource?: string; onGoBack?: () => void }> = ({ 
  resource = 'page',
  onGoBack
}) => (
  <ErrorDisplay
    title={`${resource.charAt(0).toUpperCase() + resource.slice(1)} Not Found`}
    message={`The ${resource} you're looking for doesn't exist or has been moved.`}
    onRetry={onGoBack}
    retryText="Go Back"
    variant="inline"
  />
)

export const PermissionErrorDisplay: React.FC<{ onGoBack?: () => void }> = ({ onGoBack }) => (
  <ErrorDisplay
    title="Access Denied"
    message="You don't have permission to access this resource."
    onRetry={onGoBack}
    retryText="Go Back"
    variant="inline"
  />
)

export const RateLimitErrorDisplay: React.FC<{ onRetry?: () => void; resetTime?: Date }> = ({ 
  onRetry,
  resetTime
}) => {
  const getTimeUntilReset = () => {
    if (!resetTime) return ''
    const now = new Date()
    const diff = resetTime.getTime() - now.getTime()
    const minutes = Math.ceil(diff / (1000 * 60))
    return minutes > 0 ? `Try again in ${minutes} minutes.` : 'You can try again now.'
  }

  return (
    <ErrorDisplay
      title="Rate Limit Exceeded"
      message={`You've made too many requests. ${getTimeUntilReset()}`}
      onRetry={onRetry}
      retryText="Try Again"
      variant="card"
    />
  )
}

export const APIErrorDisplay: React.FC<{ 
  error: any
  onRetry?: () => void 
  onDismiss?: () => void
}> = ({ error, onRetry, onDismiss }) => {
  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error
    if (error?.message) return error.message
    if (error?.error) return error.error
    return 'An unexpected error occurred'
  }

  const getErrorDetails = (error: any): string | undefined => {
    if (error?.stack) return error.stack
    if (error?.details) return JSON.stringify(error.details, null, 2)
    if (typeof error === 'object') return JSON.stringify(error, null, 2)
    return undefined
  }

  return (
    <ErrorDisplay
      title="API Error"
      message={getErrorMessage(error)}
      details={getErrorDetails(error)}
      onRetry={onRetry}
      onDismiss={onDismiss}
    />
  )
}

export const EmptyStateDisplay: React.FC<{
  title?: string
  message?: string
  actionText?: string
  onAction?: () => void
  icon?: string
}> = ({
  title = 'No Data Available',
  message = 'There is no data to display at this time.',
  actionText,
  onAction,
  icon = '📭'
}) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
    {actionText && onAction && (
      <Button onClick={onAction} variant="outline">
        {actionText}
      </Button>
    )}
  </div>
)

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{ 
    fallback?: (error: Error) => React.ReactNode
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  }>,
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error)
      }

      return (
        <ErrorDisplay
          title="Application Error"
          message="Something went wrong in the application. Please refresh the page."
          details={this.state.error?.stack}
          onRetry={() => {
            this.setState({ hasError: false, error: undefined })
            window.location.reload()
          }}
          retryText="Refresh Page"
          variant="card"
        />
      )
    }

    return this.props.children
  }
}

// Hook for handling async errors
export const useErrorHandler = () => {
  const [error, setError] = React.useState<any>(null)

  const handleError = React.useCallback((error: any) => {
    console.error('Error caught by handler:', error)
    setError(error)
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  return { error, handleError, clearError }
}