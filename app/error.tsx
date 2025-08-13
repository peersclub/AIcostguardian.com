'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw, Mail, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showDetails, setShowDetails] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    // Log error
    console.error('Application error:', error)
    
    // Send to Sentry if available
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          errorBoundary: 'app-error',
          digest: error.digest,
        },
      })
    }
    
    // Store error for debugging
    if (typeof window !== 'undefined') {
      try {
        const errorLog = {
          timestamp: new Date().toISOString(),
          message: error.message,
          stack: error.stack,
          digest: error.digest,
          url: window.location.href,
        }
        
        const logs = JSON.parse(localStorage.getItem('appErrors') || '[]')
        logs.push(errorLog)
        if (logs.length > 5) logs.shift()
        localStorage.setItem('appErrors', JSON.stringify(logs))
      } catch (e) {
        console.error('Failed to store error:', e)
      }
    }
  }, [error])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    reset()
  }

  const handleReport = () => {
    const subject = encodeURIComponent('Error Report: AI Cost Guardian')
    const body = encodeURIComponent(`
Error ID: ${error.digest || 'N/A'}
Message: ${error.message}
URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}
Time: ${new Date().toISOString()}

Stack Trace:
${error.stack || 'Not available'}

User Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}
    `)
    
    window.location.href = `mailto:support@aicostguardian.com?subject=${subject}&body=${body}`
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-lg w-full p-8">
        <div className="text-center space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-950/20 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Something went wrong!
            </h1>
            <p className="text-muted-foreground">
              We encountered an unexpected error. Please try again.
            </p>
            {retryCount > 2 && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                Multiple retry attempts failed. The issue might require support assistance.
              </p>
            )}
          </div>

          {/* Error Details */}
          {(process.env.NODE_ENV === 'development' || showDetails) && (
            <div className="w-full">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center justify-center gap-2 mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show details
                  </>
                )}
              </button>
              
              {showDetails && (
                <div className="mt-4 space-y-3 text-left">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">ERROR MESSAGE</p>
                    <p className="text-sm text-foreground break-all">{error.message}</p>
                  </div>
                  
                  {error.digest && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">ERROR ID</p>
                      <p className="text-sm font-mono text-foreground">{error.digest}</p>
                    </div>
                  )}
                  
                  {error.stack && process.env.NODE_ENV === 'development' && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">STACK TRACE</p>
                      <pre className="text-xs text-muted-foreground overflow-x-auto">
                        <code>{error.stack}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleRetry}
              className="w-full"
              disabled={retryCount > 5}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {retryCount > 0 ? `Retry (${retryCount})` : 'Try again'}
            </Button>
            
            <Link href="/" className="w-full">
              <Button
                variant="outline"
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Go home
              </Button>
            </Link>

            {(retryCount > 1 || showDetails) && (
              <Button
                onClick={handleReport}
                variant="ghost"
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Report this error
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
              support
            </a>
          </p>
        </div>
      </Card>
    </div>
  )
}

// Type augmentation for window.Sentry
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error, context?: any) => void
    }
  }
}