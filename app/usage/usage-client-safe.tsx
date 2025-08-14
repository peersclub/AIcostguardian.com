'use client'

import { Component, ReactNode } from 'react'
import SimpleUsageClient from './usage-simple'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class UsageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('Usage page error caught by boundary:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Usage page error details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-900/50 border border-gray-700 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Unable to Load Usage Analytics
            </h2>
            <p className="text-gray-400 mb-6">
              We're having trouble loading your usage data. This might be a temporary issue.
            </p>
            {this.state.error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded text-left">
                <p className="text-sm text-red-400 font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
              <a
                href="/dashboard"
                className="block w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      )
    }

    return <SimpleUsageClient />
  }
}

export default function SafeUsageClient() {
  return (
    <UsageErrorBoundary>
      <SimpleUsageClient />
    </UsageErrorBoundary>
  )
}