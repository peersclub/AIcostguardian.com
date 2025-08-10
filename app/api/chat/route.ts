import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { decrypt } from '@/lib/encryption'
import { logUsage } from '@/lib/services/database'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Model configurations with pricing (per 1M tokens)
const MODEL_CONFIGS = {
  // OpenAI Models
  'gpt-4o': { 
    provider: 'OPENAI',
    inputPrice: 5, 
    outputPrice: 15,
    endpoint: 'https://api.openai.com/v1/chat/completions'
  },
  'gpt-4o-mini': { 
    provider: 'OPENAI',
    inputPrice: 0.15, 
    outputPrice: 0.6,
    endpoint: 'https://api.openai.com/v1/chat/completions'
  },
  'gpt-4-turbo': { 
    provider: 'OPENAI',
    inputPrice: 10, 
    outputPrice: 30,
    endpoint: 'https://api.openai.com/v1/chat/completions'
  },
  'gpt-3.5-turbo': { 
    provider: 'OPENAI',
    inputPrice: 0.5, 
    outputPrice: 1.5,
    endpoint: 'https://api.openai.com/v1/chat/completions'
  },
  
  // Claude Models
  'claude-3-opus-20240229': { 
    provider: 'ANTHROPIC',
    inputPrice: 15, 
    outputPrice: 75,
    endpoint: 'https://api.anthropic.com/v1/messages'
  },
  'claude-3-5-sonnet-20241022': { 
    provider: 'ANTHROPIC',
    inputPrice: 3, 
    outputPrice: 15,
    endpoint: 'https://api.anthropic.com/v1/messages'
  },
  'claude-3-haiku-20240307': { 
    provider: 'ANTHROPIC',
    inputPrice: 0.25, 
    outputPrice: 1.25,
    endpoint: 'https://api.anthropic.com/v1/messages'
  },
  
  // Google Models
  'gemini-1.5-pro': { 
    provider: 'GOOGLE',
    inputPrice: 3.5, 
    outputPrice: 10.5,
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent'
  },
  'gemini-1.5-flash': { 
    provider: 'GOOGLE',
    inputPrice: 0.35, 
    outputPrice: 1.05,
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
  },
  
  // X.AI Models
  'grok-2-1212': { 
    provider: 'XAI',
    inputPrice: 2, 
    outputPrice: 10,
    endpoint: 'https://api.x.ai/v1/chat/completions'
  },
  
  // Perplexity Models
  'sonar-pro': { 
    provider: 'PERPLEXITY',
    inputPrice: 3, 
    outputPrice: 15,
    endpoint: 'https://api.perplexity.ai/chat/completions'
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, model, conversationHistory = [] } = body

    if (!message || !model) {
      return NextResponse.json({ error: 'Message and model are required' }, { status: 400 })
    }

    const modelConfig = MODEL_CONFIGS[model as keyof typeof MODEL_CONFIGS]
    if (!modelConfig) {
      return NextResponse.json({ error: 'Invalid model selected' }, { status: 400 })
    }

    // Get user and their API keys, create user if doesn't exist
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { apiKeys: true }
    })

    if (!user) {
      try {
        // Create user if doesn't exist (happens with JWT strategy)
        const organizationName = session.user.email.split('@')[1]?.split('.')[0] || 'default'
        
        // First, create or find organization
        let organization = await prisma.organization.findFirst({
          where: { name: organizationName }
        })
        
        if (!organization) {
          const domain = session.user.email.split('@')[1]
          organization = await prisma.organization.create({
            data: {
              name: organizationName,
              domain: domain,
              subscription: 'FREE'
            }
          })
        }
        
        // Create the user
        user = await prisma.user.create({
          data: {
            email: session.user.email,
            name: session.user.name || session.user.email.split('@')[0],
            role: 'USER',
            organizationId: organization.id,
            company: organizationName
          },
          include: { apiKeys: true }
        })
      } catch (createError) {
        console.error('Failed to create user:', createError)
        return NextResponse.json({ 
          error: 'Failed to create user account. Please try signing out and signing in again.' 
        }, { status: 500 })
      }
    }

    // Find the API key for the selected provider
    const apiKeyRecord = user.apiKeys.find(k => k.provider === modelConfig.provider)
    if (!apiKeyRecord || !apiKeyRecord.encryptedKey) {
      return NextResponse.json({ 
        error: `${modelConfig.provider} API key not configured. Please add your API key in Settings.` 
      }, { status: 400 })
    }

    // Decrypt the API key
    const apiKey = decrypt(apiKeyRecord.encryptedKey)

    // Make the API call based on provider
    const startTime = Date.now()
    let response: any
    let promptTokens = 0
    let completionTokens = 0

    switch (modelConfig.provider) {
      case 'OPENAI':
        response = await callOpenAICompatible(apiKey, message, model, conversationHistory, modelConfig.endpoint)
        promptTokens = response.usage?.prompt_tokens || 0
        completionTokens = response.usage?.completion_tokens || 0
        break
      
      case 'XAI':
        // X.AI uses 'grok-2-1212' but their API expects 'grok-2'
        const xaiModel = model === 'grok-2-1212' ? 'grok-2' : model
        response = await callOpenAICompatible(apiKey, message, xaiModel, conversationHistory, modelConfig.endpoint)
        promptTokens = response.usage?.prompt_tokens || 0
        completionTokens = response.usage?.completion_tokens || 0
        break
      
      case 'ANTHROPIC':
        response = await callClaude(apiKey, message, model, conversationHistory)
        promptTokens = response.usage?.input_tokens || 0
        completionTokens = response.usage?.output_tokens || 0
        break
      
      case 'GOOGLE':
        response = await callGemini(apiKey, message, conversationHistory)
        // Estimate tokens for Gemini (it doesn't provide exact counts)
        promptTokens = Math.ceil(message.length / 4)
        completionTokens = Math.ceil(response.content.length / 4)
        break
      
      case 'PERPLEXITY':
        // Perplexity uses 'sonar-pro' but their API expects 'sonar'
        const perplexityModel = model === 'sonar-pro' ? 'sonar' : model
        response = await callPerplexity(apiKey, message, perplexityModel, conversationHistory)
        promptTokens = response.usage?.prompt_tokens || 0
        completionTokens = response.usage?.completion_tokens || 0
        break
      
      default:
        return NextResponse.json({ error: 'Provider not supported' }, { status: 400 })
    }

    const latency = Date.now() - startTime
    const totalTokens = promptTokens + completionTokens
    const cost = (promptTokens * modelConfig.inputPrice / 1000000) + 
                 (completionTokens * modelConfig.outputPrice / 1000000)

    // Log usage to database
    if (user.organizationId) {
      await logUsage({
        userId: user.id,
        organizationId: user.organizationId,
        provider: modelConfig.provider.toLowerCase(),
        model,
        operation: 'completion',
        promptTokens,
        completionTokens,
        totalTokens,
        cost
      })
    }

    return NextResponse.json({
      success: true,
      response: {
        content: response.content,
        model,
        provider: modelConfig.provider,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens,
          cost,
          latency
        }
      }
    })

  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to process chat request' 
    }, { status: 500 })
  }
}

// Get available models based on saved API keys
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { apiKeys: true }
    })

    if (!user) {
      try {
        // Create user if doesn't exist (happens with JWT strategy)
        const organizationName = session.user.email.split('@')[1]?.split('.')[0] || 'default'
        
        // First, create or find organization
        let organization = await prisma.organization.findFirst({
          where: { name: organizationName }
        })
        
        if (!organization) {
          const domain = session.user.email.split('@')[1]
          organization = await prisma.organization.create({
            data: {
              name: organizationName,
              domain: domain,
              subscription: 'FREE'
            }
          })
        }
        
        // Create the user
        user = await prisma.user.create({
          data: {
            email: session.user.email,
            name: session.user.name || session.user.email.split('@')[0],
            role: 'USER',
            organizationId: organization.id,
            company: organizationName
          },
          include: { apiKeys: true }
        })
      } catch (createError) {
        console.error('Failed to create user:', createError)
        return NextResponse.json({ 
          error: 'Failed to create user account. Please try signing out and signing in again.' 
        }, { status: 500 })
      }
    }

    // Get available models based on configured API keys
    const availableModels = Object.entries(MODEL_CONFIGS)
      .filter(([_, config]) => {
        return user.apiKeys.some(key => key.provider === config.provider && key.isActive)
      })
      .map(([modelId, config]) => ({
        id: modelId,
        provider: config.provider,
        inputPrice: config.inputPrice,
        outputPrice: config.outputPrice,
        available: true
      }))

    return NextResponse.json({
      success: true,
      models: availableModels,
      providers: Array.from(new Set(availableModels.map(m => m.provider)))
    })

  } catch (error) {
    console.error('Error fetching available models:', error)
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 })
  }
}

// Helper functions for different providers
async function callOpenAICompatible(
  apiKey: string, 
  message: string, 
  model: string, 
  history: any[], 
  endpoint: string
) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        ...history.map((h: any) => ({ role: h.role, content: h.content })),
        { role: 'user', content: message }
      ],
      max_tokens: 2048,
      temperature: 0.7,
      stream: false
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return {
    content: data.choices[0].message.content,
    usage: data.usage
  }
}

async function callClaude(
  apiKey: string, 
  message: string, 
  model: string, 
  history: any[]
) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      messages: [
        ...history.map((h: any) => ({ role: h.role, content: h.content })),
        { role: 'user', content: message }
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Claude API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return {
    content: data.content[0].text,
    usage: data.usage
  }
}

async function callGemini(
  apiKey: string, 
  message: string, 
  history: any[]
) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          ...history.map((h: any) => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }]
          })),
          {
            role: 'user',
            parts: [{ text: message }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return {
    content: data.candidates[0].content.parts[0].text,
    usage: {} // Gemini doesn't provide token counts
  }
}

async function callPerplexity(
  apiKey: string, 
  message: string, 
  model: string, 
  history: any[]
) {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        ...history.map((h: any) => ({ role: h.role, content: h.content })),
        { role: 'user', content: message }
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Perplexity API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return {
    content: data.choices[0].message.content,
    usage: data.usage
  }
}