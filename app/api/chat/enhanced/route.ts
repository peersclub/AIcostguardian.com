import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/encryption'
import { logUsage } from '@/lib/services/database'
import { budgetService } from '@/lib/services/budget.service'
import { organizationService } from '@/lib/services/organization.service'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
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
  const startTime = Date.now()
  
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, model, conversationHistory = [], conversationId } = body

    if (!message || !model) {
      return NextResponse.json({ error: 'Message and model are required' }, { status: 400 })
    }

    const modelConfig = MODEL_CONFIGS[model as keyof typeof MODEL_CONFIGS]
    if (!modelConfig) {
      return NextResponse.json({ error: 'Invalid model selected' }, { status: 400 })
    }

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        apiKeys: true,
        organization: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Step 1: Check budget limits before making API call
    const canProceed = await organizationService.checkSpendLimit(user.organizationId)
    if (!canProceed) {
      // Create alert for budget exceeded
      await prisma.notification.create({
        data: {
          userId: user.id,
          organizationId: user.organizationId,
          type: 'COST_THRESHOLD_EXCEEDED',
          priority: 'CRITICAL',
          title: 'Budget limit exceeded',
          message: 'Your organization has exceeded its spending limit. Please increase your budget or contact your administrator.',
          status: 'PENDING',
          channels: ['email', 'in-app']
        }
      })

      return NextResponse.json({ 
        error: 'Budget limit exceeded. Please contact your administrator.',
        budgetExceeded: true
      }, { status: 402 }) // 402 Payment Required
    }

    // Check active budgets for warnings
    const budgets = await budgetService.getOrganizationBudgets(user.organizationId, true)
    const alertBudgets = budgets.filter(b => b.alertTriggered && !b.isOverBudget)
    
    // Step 2: Get and decrypt API key
    const apiKeyRecord = user.apiKeys.find((k: any) => k.provider === modelConfig.provider.toLowerCase())
    if (!apiKeyRecord || !apiKeyRecord.encryptedKey) {
      return NextResponse.json({ 
        error: `${modelConfig.provider} API key not configured. Please add your API key in Settings.` 
      }, { status: 400 })
    }

    const apiKey = decrypt(apiKeyRecord.encryptedKey)

    // Step 3: Make the API call
    let response: any
    let promptTokens = 0
    let completionTokens = 0
    let apiError: string | null = null

    try {
      switch (modelConfig.provider) {
        case 'OPENAI':
        case 'XAI':
        case 'PERPLEXITY':
          response = await callOpenAICompatible(
            apiKey, 
            message, 
            model, 
            conversationHistory, 
            modelConfig.endpoint
          )
          promptTokens = response.usage?.prompt_tokens || 0
          completionTokens = response.usage?.completion_tokens || 0
          break
        
        case 'ANTHROPIC':
          response = await callClaude(apiKey, message, model, conversationHistory)
          promptTokens = response.usage?.input_tokens || 0
          completionTokens = response.usage?.output_tokens || 0
          break
        
        case 'GOOGLE':
          response = await callGemini(apiKey, message, conversationHistory, model)
          // Estimate tokens for Gemini
          promptTokens = Math.ceil(message.length / 4)
          completionTokens = Math.ceil((response.content?.length || 0) / 4)
          break
        
        default:
          throw new Error(`Unsupported provider: ${modelConfig.provider}`)
      }
    } catch (error: any) {
      apiError = error.message || 'API call failed'
      console.error('API call error:', error)
      
      // Log failed attempt
      await prisma.usageLog.create({
        data: {
          userId: user.id,
          organizationId: user.organizationId,
          provider: modelConfig.provider.toLowerCase(),
          model,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          cost: 0,
          metadata: {
            error: apiError,
            conversationId,
            timestamp: new Date().toISOString()
          }
        }
      })

      return NextResponse.json({ 
        error: apiError,
        provider: modelConfig.provider 
      }, { status: 500 })
    }

    const totalTokens = promptTokens + completionTokens
    const latency = Date.now() - startTime

    // Step 4: Calculate cost
    const inputCost = (promptTokens / 1000000) * modelConfig.inputPrice
    const outputCost = (completionTokens / 1000000) * modelConfig.outputPrice
    const totalCost = inputCost + outputCost

    // Step 5: Log usage to database
    const usageLog = await logUsage({
      userId: user.id,
      organizationId: user.organizationId,
      provider: modelConfig.provider,
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      cost: totalCost
    })

    // Step 6: Update budget spending
    await budgetService.updateBudgetSpent(user.organizationId, totalCost)

    // Step 7: Update organization monthly spend
    await organizationService.updateMonthlySpend(user.organizationId, totalCost)

    // Step 8: Check and create budget alerts
    const updatedBudgets = await budgetService.checkBudgetAlerts(user.organizationId)

    // Step 9: Update API key last used timestamp
    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsed: new Date() }
    })

    // Step 10: Create or update conversation record
    let conversation = null
    if (conversationId) {
      // Check if conversation exists
      const existingConv = await prisma.conversation.findUnique({
        where: { id: conversationId }
      })

      if (existingConv) {
        conversation = await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            totalCost: {
              increment: totalCost
            },
            totalTokens: {
              increment: totalTokens
            },
            messageCount: {
              increment: 2 // User message + AI response
            },
            lastMessageAt: new Date()
          }
        })
      }
    }

    if (!conversation) {
      // Create new conversation
      conversation = await prisma.conversation.create({
        data: {
          userId: user.id,
          title: message.substring(0, 100), // First 100 chars as title
          model,
          provider: modelConfig.provider.toLowerCase(),
          totalCost,
          totalTokens,
          messageCount: 2,
          metadata: {
            firstMessage: message,
            timestamp: new Date().toISOString()
          }
        }
      })
    }

    // Step 11: Store messages in database
    await prisma.chatMessage.createMany({
      data: [
        {
          conversationId: conversation.id,
          role: 'user',
          content: message,
          model,
          provider: modelConfig.provider.toLowerCase(),
          usageLogId: usageLog.id
        },
        {
          conversationId: conversation.id,
          role: 'assistant',
          content: response.content || response.choices?.[0]?.message?.content || '',
          model,
          provider: modelConfig.provider.toLowerCase(),
          promptTokens,
          completionTokens,
          totalTokens,
          cost: totalCost,
          latency,
          usageLogId: usageLog.id
        }
      ]
    })

    // Prepare response
    const responseData = {
      content: response.content || response.choices?.[0]?.message?.content || '',
      conversationId: conversation.id,
      metrics: {
        promptTokens,
        completionTokens,
        totalTokens,
        cost: totalCost,
        latency,
        model,
        provider: modelConfig.provider
      },
      budgetWarnings: alertBudgets.map(b => ({
        name: b.name,
        percentage: b.percentage,
        remaining: b.remaining
      })),
      usage: {
        sessionTotal: await prisma.usageLog.aggregate({
          where: {
            userId: user.id,
            timestamp: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          },
          _sum: {
            cost: true,
            totalTokens: true
          }
        })
      }
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ 
      error: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper functions for API calls
async function callOpenAICompatible(
  apiKey: string, 
  message: string, 
  model: string, 
  history: any[], 
  endpoint: string
) {
  const messages = [
    ...history.map((h: any) => ({
      role: h.role,
      content: h.content
    })),
    { role: 'user', content: message }
  ]

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API call failed: ${error}`)
  }

  return response.json()
}

async function callClaude(
  apiKey: string, 
  message: string, 
  model: string, 
  history: any[]
) {
  const messages = [
    ...history.map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'assistant',
      content: h.content
    })),
    { role: 'user', content: message }
  ]

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Claude API call failed: ${error}`)
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
  history: any[],
  model: string
) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  
  const contents = [
    ...history.map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    })),
    {
      role: 'user',
      parts: [{ text: message }]
    }
  ]

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000
      }
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API call failed: ${error}`)
  }

  const data = await response.json()
  return {
    content: data.candidates[0].content.parts[0].text
  }
}