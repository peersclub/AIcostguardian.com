'use client'

import { useGlobalKeyCheck } from '@/hooks/useGlobalKeyCheck'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Key, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

const PROVIDER_NAMES = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  xai: 'xAI',
  perplexity: 'Perplexity'
}

export default function KeyStatusBar() {
  const { keyStatus, checking, hasValidKeys, refresh, getAvailableProviders } = useGlobalKeyCheck()
  
  const availableProviders = getAvailableProviders()
  const totalProviders = Object.keys(PROVIDER_NAMES).length
  
  const getStatusColor = () => {
    if (checking) return 'text-muted-foreground'
    if (!hasValidKeys) return 'text-red-500'
    if (availableProviders.length === totalProviders) return 'text-green-500'
    return 'text-yellow-500'
  }
  
  const getStatusIcon = () => {
    if (checking) return <RefreshCw className="h-4 w-4 animate-spin" />
    if (!hasValidKeys) return <XCircle className="h-4 w-4" />
    if (availableProviders.length === totalProviders) return <CheckCircle className="h-4 w-4" />
    return <AlertCircle className="h-4 w-4" />
  }
  
  const getStatusText = () => {
    if (checking) return 'Checking keys...'
    if (!hasValidKeys) return 'No API keys'
    return `${availableProviders.length}/${totalProviders} providers`
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center gap-2 h-8",
            getStatusColor()
          )}
        >
          <Key className="h-4 w-4" />
          {getStatusIcon()}
          <span className="hidden sm:inline text-xs">{getStatusText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">API Key Status</h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={refresh}
              disabled={checking}
              className="h-8 w-8"
            >
              <RefreshCw className={cn("h-4 w-4", checking && "animate-spin")} />
            </Button>
          </div>
          
          <div className="space-y-2">
            {Object.entries(PROVIDER_NAMES).map(([key, name]) => {
              const status = keyStatus[key]
              const isValid = status?.valid
              
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      isValid ? "bg-green-500" : "bg-gray-300"
                    )} />
                    <span className="text-sm">{name}</span>
                  </div>
                  {status ? (
                    <Badge variant={isValid ? "default" : "secondary"} className="text-xs">
                      {isValid ? `${status.count} key${status.count !== 1 ? 's' : ''}` : 'Not configured'}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Checking...
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {hasValidKeys 
                  ? `${availableProviders.length} provider${availableProviders.length !== 1 ? 's' : ''} available`
                  : 'No providers configured'
                }
              </span>
              <a 
                href="/settings/api-keys" 
                className="text-primary hover:underline"
              >
                Manage keys →
              </a>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}