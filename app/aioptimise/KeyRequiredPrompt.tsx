'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Key, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface KeyRequiredPromptProps {
  title?: string
  description?: string
  providers?: string[]
  onComplete?: () => void
}

export default function KeyRequiredPrompt({
  title = "Add API Keys to Start Optimizing",
  description = "To use AI Optimize, you need at least one valid API key",
  providers = ['openai', 'anthropic', 'google'],
  onComplete
}: KeyRequiredPromptProps) {
  const router = useRouter()

  const handleAddKeys = () => {
    router.push('/onboarding/api-setup')
  }

  const providerInfo = {
    openai: {
      name: 'OpenAI',
      models: ['GPT-4', 'GPT-3.5'],
      color: 'bg-green-500'
    },
    anthropic: {
      name: 'Anthropic',
      models: ['Claude 3 Opus', 'Claude 3 Sonnet'],
      color: 'bg-purple-500'
    },
    google: {
      name: 'Google',
      models: ['Gemini Pro', 'Gemini 1.5'],
      color: 'bg-blue-500'
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-12">
      <Card className="border-2">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Key className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-base mt-2">
            {description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              AI Optimize uses your API keys to intelligently select the best model for each task,
              optimizing for cost, quality, and speed.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="font-semibold">Supported Providers:</h3>
            <div className="grid gap-3">
              {providers.map(provider => {
                const info = providerInfo[provider as keyof typeof providerInfo]
                if (!info) return null
                
                return (
                  <div key={provider} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <div className={`h-2 w-2 rounded-full ${info.color}`} />
                    <div className="flex-1">
                      <p className="font-medium">{info.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Models: {info.models.join(', ')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleAddKeys}
              className="w-full"
              size="lg"
            >
              <Key className="mr-2 h-4 w-4" />
              Add API Keys
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/settings/api-keys')}
              className="w-full"
            >
              Manage Existing Keys
            </Button>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Why add API keys?</p>
                <ul className="mt-1 space-y-1">
                  <li>• AI automatically selects the best model for your task</li>
                  <li>• Track usage and costs across all providers</li>
                  <li>• Optimize for speed, quality, or cost</li>
                  <li>• Failover to alternative models if one is unavailable</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}