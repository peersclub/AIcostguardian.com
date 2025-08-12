'use client'

import { Component, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  KeyNotAvailableError, 
  KeyExpiredError, 
  KeyQuotaExceededError 
} from '@/lib/api-key-manager'
import { 
  AlertTriangle, 
  Key, 
  RefreshCw, 
  CreditCard,
  ArrowRight
} from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorType: 'key_not_available' | 'key_expired' | 'quota_exceeded' | 'unknown' | null
}

class KeyErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorType: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    let errorType: State['errorType'] = 'unknown'
    
    if (error instanceof KeyNotAvailableError) {
      errorType = 'key_not_available'
    } else if (error instanceof KeyExpiredError) {
      errorType = 'key_expired'
    } else if (error instanceof KeyQuotaExceededError) {
      errorType = 'quota_exceeded'
    }
    
    return {
      hasError: true,
      error,
      errorType
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Key Error Boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }
      
      return <KeyErrorFallback error={this.state.error} errorType={this.state.errorType} />
    }

    return this.props.children
  }
}

interface KeyErrorFallbackProps {
  error: Error | null
  errorType: State['errorType']
}

function KeyErrorFallback({ error, errorType }: KeyErrorFallbackProps) {
  const router = useRouter()
  
  const getErrorContent = () => {
    switch (errorType) {
      case 'key_not_available':
        const provider = (error as KeyNotAvailableError)?.provider || 'this provider'
        return {
          icon: Key,
          title: 'API Key Required',
          description: `No valid API key found for ${provider}.`,
          action: {
            label: 'Add API Key',
            onClick: () => router.push('/settings/api-keys'),
            icon: Key
          },
          secondaryAction: {
            label: 'Go to Setup',
            onClick: () => router.push('/onboarding/api-setup')
          }
        }
      
      case 'key_expired':
        const expiredProvider = (error as KeyExpiredError)?.provider || 'this provider'
        return {
          icon: RefreshCw,
          title: 'API Key Expired',
          description: `Your API key for ${expiredProvider} has expired or is invalid.`,
          action: {
            label: 'Update Key',
            onClick: () => router.push('/settings/api-keys'),
            icon: RefreshCw
          },
          secondaryAction: {
            label: 'Check Status',
            onClick: () => window.location.reload()
          }
        }
      
      case 'quota_exceeded':
        const quotaProvider = (error as KeyQuotaExceededError)?.provider || 'this provider'
        return {
          icon: CreditCard,
          title: 'Quota Exceeded',
          description: `You've exceeded your API quota for ${quotaProvider}.`,
          action: {
            label: 'View Usage',
            onClick: () => router.push('/usage'),
            icon: CreditCard
          },
          secondaryAction: {
            label: 'Upgrade Plan',
            onClick: () => router.push('/upgrade')
          }
        }
      
      default:
        return {
          icon: AlertTriangle,
          title: 'Something went wrong',
          description: error?.message || 'An unexpected error occurred with the API keys.',
          action: {
            label: 'Try Again',
            onClick: () => window.location.reload(),
            icon: RefreshCw
          },
          secondaryAction: {
            label: 'Go to Dashboard',
            onClick: () => router.push('/dashboard')
          }
        }
    }
  }
  
  const content = getErrorContent()
  const Icon = content.icon
  const ActionIcon = content.action.icon

  return (
    <div className="container max-w-2xl mx-auto py-12">
      <Card className="border-2">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Icon className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">{content.title}</CardTitle>
          <CardDescription className="text-base mt-2">
            {content.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="mt-2">
              <code className="text-xs bg-destructive/10 px-2 py-1 rounded">
                {error?.name}: {error?.message}
              </code>
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={content.action.onClick}
              size="lg"
              className="w-full"
            >
              <ActionIcon className="mr-2 h-4 w-4" />
              {content.action.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            {content.secondaryAction && (
              <Button
                variant="outline"
                onClick={content.secondaryAction.onClick}
                className="w-full"
              >
                {content.secondaryAction.label}
              </Button>
            )}
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Need help? Check our{' '}
              <a href="/docs" className="text-primary hover:underline">
                documentation
              </a>
              {' '}or{' '}
              <a href="/support" className="text-primary hover:underline">
                contact support
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default KeyErrorBoundary

// Hook for programmatic error handling
export function useKeyErrorHandler() {
  const router = useRouter()
  
  const handleKeyError = (error: Error) => {
    if (error instanceof KeyNotAvailableError) {
      // Redirect to key setup
      router.push(`/settings/api-keys?setup=true&provider=${error.provider}`)
    } else if (error instanceof KeyExpiredError) {
      // Show renewal prompt
      router.push(`/settings/api-keys?renew=${error.provider}`)
    } else if (error instanceof KeyQuotaExceededError) {
      // Show upgrade prompt
      router.push(`/upgrade?reason=quota&provider=${error.provider}`)
    } else {
      // Generic error handling
      console.error('Unhandled key error:', error)
    }
  }
  
  return { handleKeyError }
}