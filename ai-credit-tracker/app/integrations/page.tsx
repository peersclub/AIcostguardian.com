import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function Integrations() {
  const aiProviders = [
    {
      name: 'OpenAI',
      logo: '🤖',
      description: 'GPT-4, GPT-3.5, DALL-E, Whisper, and Embeddings',
      status: 'Available',
      setupTime: '2 min',
      features: ['Real-time tracking', 'Token counting', 'Model usage analytics', 'Cost forecasting'],
      docs: '/docs/openai'
    },
    {
      name: 'Anthropic Claude',
      logo: '🧠',
      description: 'Claude 3 Opus, Sonnet, and Haiku models',
      status: 'Available',
      setupTime: '2 min',
      features: ['Message tracking', 'Usage analytics', 'Cost optimization', 'Rate limit monitoring'],
      docs: '/docs/claude'
    },
    {
      name: 'Google Gemini',
      logo: '💎',
      description: 'Gemini Pro, Ultra, and Vision models',
      status: 'Available',
      setupTime: '3 min',
      features: ['Multi-modal tracking', 'Token analytics', 'Safety settings', 'Performance metrics'],
      docs: '/docs/gemini'
    },
    {
      name: 'Hugging Face',
      logo: '🤗',
      description: 'Inference API and Hosted models',
      status: 'Available',
      setupTime: '3 min',
      features: ['Model tracking', 'Inference costs', 'Custom models', 'Performance analytics'],
      docs: '/docs/huggingface'
    },
    {
      name: 'Stability AI',
      logo: '🎨',
      description: 'Stable Diffusion and image generation',
      status: 'Available',
      setupTime: '2 min',
      features: ['Image generation tracking', 'Quality metrics', 'Cost per image', 'Usage patterns'],
      docs: '/docs/stability'
    },
    {
      name: 'Replicate',
      logo: '🔄',
      description: 'Open-source model hosting platform',
      status: 'Available',
      setupTime: '3 min',
      features: ['Prediction tracking', 'Model costs', 'Runtime analytics', 'Custom models'],
      docs: '/docs/replicate'
    },
    {
      name: 'Azure OpenAI',
      logo: '☁️',
      description: 'Microsoft Azure hosted OpenAI models',
      status: 'Available',
      setupTime: '4 min',
      features: ['Enterprise tracking', 'Deployment analytics', 'Regional costs', 'Compliance reporting'],
      docs: '/docs/azure-openai'
    },
    {
      name: 'AWS Bedrock',
      logo: '🪨',
      description: 'Foundation models on AWS',
      status: 'Coming Soon',
      setupTime: 'TBD',
      features: ['Multi-model tracking', 'Cost allocation', 'Usage analytics', 'Regional billing'],
      docs: '/docs/bedrock'
    }
  ]

  const frameworks = [
    {
      name: 'LangChain',
      logo: '🦜',
      language: 'Python/JS',
      description: 'Popular LLM application framework',
      integration: 'SDK',
      features: ['Chain tracking', 'Agent monitoring', 'Tool usage', 'Memory costs']
    },
    {
      name: 'LlamaIndex',
      logo: '🦙',
      language: 'Python',
      description: 'Data framework for LLM applications',
      integration: 'SDK',
      features: ['Index costs', 'Query tracking', 'Embedding usage', 'Retrieval analytics']
    },
    {
      name: 'Vercel AI SDK',
      logo: '▲',
      language: 'TypeScript',
      description: 'AI toolkit for TypeScript developers',
      integration: 'Plugin',
      features: ['Stream tracking', 'Function calls', 'Tool usage', 'Real-time costs']
    },
    {
      name: 'OpenAI SDK',
      logo: '🔧',
      language: 'Multi',
      description: 'Official OpenAI client libraries',
      integration: 'Wrapper',
      features: ['Drop-in replacement', 'Zero config', 'Automatic tracking', 'Cost attribution']
    }
  ]

  const enterprise = [
    {
      name: 'REST API',
      logo: '🔌',
      description: 'Full-featured API for custom integrations',
      features: ['Usage reporting', 'Real-time tracking', 'Webhooks', 'Custom dashboards']
    },
    {
      name: 'Webhooks',
      logo: '📡',
      description: 'Real-time notifications and data streaming',
      features: ['Usage alerts', 'Cost thresholds', 'Custom events', 'Third-party forwarding']
    },
    {
      name: 'Single Sign-On',
      logo: '🔐',
      description: 'SAML 2.0 and OAuth 2.0 support',
      features: ['Active Directory', 'Okta', 'Auth0', 'Custom SAML']
    },
    {
      name: 'Data Export',
      logo: '📊',
      description: 'Export your data to analytics platforms',
      features: ['CSV export', 'JSON API', 'Data warehouse', 'BI tool integration']
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <Badge className="mb-6 bg-blue-100 text-blue-700 px-4 py-2">
              20+ AI Providers Supported
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Connect with your favorite AI providers
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto">
              Track costs across all major AI platforms with simple API key setup. 
              Get started in minutes with our comprehensive integrations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4">
                  Start tracking now
                </Button>
              </Link>
              <Link href="/docs">
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-300 hover:bg-white hover:text-slate-900 px-8 py-4">
                  View documentation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* AI Providers Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              AI Provider Integrations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect your AI provider accounts and start tracking costs immediately. 
              No code changes required for most platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiProviders.map((provider, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{provider.logo}</div>
                      <div>
                        <CardTitle className="text-xl">{provider.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={provider.status === 'Available' ? 'default' : 'secondary'} className="text-xs">
                            {provider.status}
                          </Badge>
                          {provider.status === 'Available' && (
                            <span className="text-xs text-green-600 font-medium">
                              {provider.setupTime} setup
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-gray-600">
                    {provider.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Features:</h4>
                      <ul className="space-y-1">
                        {provider.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center">
                            <span className="text-green-500 mr-2">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-4 border-t">
                      {provider.status === 'Available' ? (
                        <Button variant="outline" size="sm" className="w-full">
                          Setup Integration
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="w-full" disabled>
                          Coming Soon
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Framework Integrations */}
      <div className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Framework & SDK Integrations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Seamlessly integrate with popular AI frameworks and development tools. 
              Track costs without changing your existing codebase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {frameworks.map((framework, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-4xl">{framework.logo}</div>
                    <div>
                      <CardTitle className="text-xl">{framework.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {framework.language}
                        </Badge>
                        <Badge className="text-xs bg-blue-100 text-blue-700">
                          {framework.integration}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-gray-600">
                    {framework.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Tracking Features:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {framework.features.map((feature, idx) => (
                          <div key={idx} className="text-sm text-gray-600 flex items-center">
                            <span className="text-blue-500 mr-2">•</span>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <Button variant="outline" size="sm" className="w-full">
                        View Integration Guide
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Enterprise Integrations */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Enterprise Integrations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced integrations for enterprise customers requiring custom solutions, 
              enhanced security, and comprehensive data export capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {enterprise.map((integration, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">{integration.logo}</span>
                  </div>
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {integration.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {integration.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center justify-center">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Getting Started Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to start tracking your AI costs?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Set up your first integration in under 5 minutes. Connect your AI providers 
            and get instant visibility into your spending.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Start free trial
                <span className="ml-2">→</span>
              </Button>
            </Link>
            <Link href="/docs/quickstart">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
                Quick start guide
              </Button>
            </Link>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            14-day free trial • No credit card required • 2-minute setup
          </p>
        </div>
      </div>
    </div>
  )
}