import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const chatSchema = z.object({
  message: z.string().min(1),
  threadId: z.string().optional(),
  model: z.string(),
  provider: z.string(),
  mode: z.enum(['chat', 'coding', 'analysis', 'creative', 'focus']).optional(),
  streamMode: z.boolean().default(false),
  autoOptimize: z.boolean().default(false)
})

// AI Provider clients
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

async function getProviderClient(provider: string, apiKeys: any[]) {
  const providerMap = {
    'openai': 'openai',
    'anthropic': 'claude',
    'google': 'gemini',
    'x': 'grok'
  }

  const apiKey = apiKeys.find(key => 
    key.provider === providerMap[provider as keyof typeof providerMap] && key.isActive
  )

  if (!apiKey) {
    throw new Error(`No active API key found for provider: ${provider}`)
  }

  switch (provider) {
    case 'openai':
      return new OpenAI({ apiKey: apiKey.key })
    case 'anthropic':
      return new Anthropic({ apiKey: apiKey.key })
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}

async function generateResponse(client: any, provider: string, model: string, message: string, mode: string = 'chat') {
  const systemPrompts = {
    chat: "You are a helpful AI assistant. Provide clear, accurate, and helpful responses.",
    coding: "You are an expert software developer. Provide clear, well-commented code solutions with explanations.",
    analysis: "You are a data analyst and researcher. Provide thorough analysis with insights and actionable recommendations.",
    creative: "You are a creative assistant. Help with writing, brainstorming, and creative problem-solving.",
    focus: "You are a productivity coach. Help users stay focused and accomplish their goals efficiently."
  }

  const systemPrompt = systemPrompts[mode as keyof typeof systemPrompts] || systemPrompts.chat

  if (provider === 'openai') {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: mode === 'creative' ? 0.9 : 0.7,
      max_tokens: mode === 'coding' ? 2000 : 1000
    })

    return {
      message: response.choices[0].message.content,
      tokens: {
        input: response.usage?.prompt_tokens || 0,
        output: response.usage?.completion_tokens || 0
      },
      cost: calculateCost(model, response.usage?.prompt_tokens || 0, response.usage?.completion_tokens || 0)
    }
  } else if (provider === 'anthropic') {
    const response = await client.messages.create({
      model: model,
      max_tokens: mode === 'coding' ? 2000 : 1000,
      messages: [{ role: 'user', content: message }],
      system: systemPrompt,
      temperature: mode === 'creative' ? 0.9 : 0.7
    })

    const textContent = response.content.find((c: any) => c.type === 'text')?.text || ''

    return {
      message: textContent,
      tokens: {
        input: response.usage.input_tokens || 0,
        output: response.usage.output_tokens || 0
      },
      cost: calculateCost(model, response.usage.input_tokens, response.usage.output_tokens)
    }
  }

  throw new Error('Unsupported provider')
}

function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  // Cost calculation based on model pricing
  const pricing: Record<string, { input: number, output: number }> = {
    'gpt-4': { input: 0.00003, output: 0.00006 },
    'gpt-4-turbo': { input: 0.00001, output: 0.00003 },
    'gpt-3.5-turbo': { input: 0.0000015, output: 0.000002 },
    'claude-3-opus': { input: 0.000015, output: 0.000075 },
    'claude-3-sonnet': { input: 0.000003, output: 0.000015 },
    'claude-3-haiku': { input: 0.00000025, output: 0.00000125 }
  }

  const modelPricing = pricing[model] || pricing['gpt-3.5-turbo']
  return (inputTokens * modelPricing.input) + (outputTokens * modelPricing.output)
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { apiKeys: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = chatSchema.parse(body)

    // Get AI provider client
    const client = await getProviderClient(validatedData.provider, user.apiKeys)
    
    // Generate response
    const aiResponse = await generateResponse(
      client,
      validatedData.provider,
      validatedData.model,
      validatedData.message,
      validatedData.mode
    )

    // Save message and response to database
    if (validatedData.threadId) {
      // Save user message
      await prisma.message.create({
        data: {
          threadId: validatedData.threadId,
          role: 'user',
          content: validatedData.message,
          userId: user.id
        }
      })

      // Save assistant response
      await prisma.message.create({
        data: {
          threadId: validatedData.threadId,
          role: 'assistant',
          content: aiResponse.message,
          userId: user.id,
          model: validatedData.model,
          provider: validatedData.provider,
          metadata: {
            tokens: {
              input: aiResponse.tokens.input,
              output: aiResponse.tokens.output
            }
          },
          cost: aiResponse.cost
        }
      })

      // Update thread timestamp
      await prisma.thread.update({
        where: { id: validatedData.threadId },
        data: {
          updatedAt: new Date()
        }
      })
    }

    // Track usage
    await prisma.usage.create({
      data: {
        userId: user.id,
        provider: validatedData.provider.toUpperCase(),
        model: validatedData.model,
        inputTokens: aiResponse.tokens.input,
        outputTokens: aiResponse.tokens.output,
        totalTokens: aiResponse.tokens.input + aiResponse.tokens.output,
        cost: aiResponse.cost,
        metadata: {
          mode: validatedData.mode,
          threadId: validatedData.threadId
        }
      }
    })

    return NextResponse.json(aiResponse)
  } catch (error) {
    console.error('Chat error:', error)
    
    // Track failed usage
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email }
        })
        
        if (user) {
          await prisma.usage.create({
            data: {
              userId: user.id,
              provider: 'UNKNOWN',
              model: 'unknown',
              inputTokens: 0,
              outputTokens: 0,
              totalTokens: 0,
              cost: 0,
              metadata: { error: (error as Error).message }
            }
          })
        }
      }
    } catch (trackingError) {
      console.error('Failed to track error usage:', trackingError)
    }

    if ((error as Error).message?.includes('API key')) {
      return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}