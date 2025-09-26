import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/prisma';
import { PromptAnalyzer } from '@/lib/prompt-analyzer/analyzer';
import { ModelSelector } from '@/lib/prompt-analyzer/model-selector';
import { OptimizationMode, MessageRole } from '@prisma/client';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { getGeminiClient } from '@/lib/gemini-client';
import { apiKeyService, type Provider } from '@/lib/core/api-key.service';
import { userService } from '@/lib/core/user.service';
import { usageService } from '@/lib/core/usage.service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Helper function to build messages with project context
function buildMessagesWithContext(userMessage: string, projectContext: any) {
  const messages: any[] = [];

  // Add system message if project context exists
  if (projectContext) {
    let systemPrompt = '';

    // Add system prompt from project
    if (projectContext.systemPrompt) {
      systemPrompt += projectContext.systemPrompt;
    }

    // Add instructions
    if (projectContext.instructions) {
      systemPrompt += systemPrompt ? '\n\n' : '';
      systemPrompt += `Instructions: ${projectContext.instructions}`;
    }

    // Add project goals
    if (projectContext.projectGoals) {
      systemPrompt += systemPrompt ? '\n\n' : '';
      systemPrompt += `Project Goals: ${projectContext.projectGoals}`;
    }

    // Add expected outcome
    if (projectContext.expectedOutcome) {
      systemPrompt += systemPrompt ? '\n\n' : '';
      systemPrompt += `Expected Outcome: ${projectContext.expectedOutcome}`;
    }

    // Add keywords as context
    if (projectContext.keywords && projectContext.keywords.length > 0) {
      systemPrompt += systemPrompt ? '\n\n' : '';
      systemPrompt += `Relevant Keywords: ${projectContext.keywords.join(', ')}`;
    }

    // Add project type context
    if (projectContext.projectType) {
      systemPrompt += systemPrompt ? '\n\n' : '';
      systemPrompt += `Project Type: ${projectContext.projectType.replace('_', ' ').toLowerCase()}`;
    }

    // Add category if specified
    if (projectContext.category) {
      systemPrompt += systemPrompt ? '\n\n' : '';
      systemPrompt += `Category: ${projectContext.category}`;
    }

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
  }

  // Add user message
  messages.push({ role: 'user', content: userMessage });

  return messages;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists with organization
    const user = await userService.ensureUser({
      email: session.user.email,
      name: session.user.name,
      image: session.user.image
    });

    const body = await request.json();
    const {
      threadId,
      message,
      mode = OptimizationMode.BALANCED,
      modelOverride,
      files,
      projectContext
    } = body;

    // If no threadId provided, create a new thread
    let currentThreadId = threadId;
    if (!currentThreadId) {
      const newThread = await prisma.aIThread.create({
        data: {
          userId: user.id,
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
        },
      });
      currentThreadId = newThread.id;
    }

    // Check if the thread has AI absorber mode enabled
    const threadData = await prisma.aIThread.findUnique({
      where: { id: currentThreadId },
      select: {
        aiAbsorberMode: true,
        title: true,
        userId: true,
        collaborators: {
          where: {
            userId: user.id,
            acceptedAt: { not: null }
          }
        }
      }
    });

    // Verify user has access to the thread
    if (!threadData || (threadData.userId !== user.id && threadData.collaborators.length === 0)) {
      return NextResponse.json({ error: 'Thread not found or insufficient permissions' }, { status: 404 });
    }

    // Create user message in database (always save the message regardless of absorber mode)
    const userMessage = await prisma.aIMessage.create({
      data: {
        threadId: currentThreadId,
        role: MessageRole.USER,
        content: message,
        selectedModel: 'N/A',
        selectedProvider: 'N/A',
        modelReason: threadData.aiAbsorberMode ? 'Absorber mode enabled - AI not responding' : 'Processing...',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0,
        isAbsorbedMessage: threadData.aiAbsorberMode, // Track if message was created in absorber mode
      },
    });

    // If absorber mode is enabled, return early without AI response
    if (threadData.aiAbsorberMode) {
      // Update thread with the new message
      await prisma.aIThread.update({
        where: { id: currentThreadId },
        data: {
          lastMessageAt: new Date(),
          messageCount: { increment: 1 },
        },
      });

      return NextResponse.json({
        threadId: currentThreadId,
        messageId: userMessage.id,
        absorberMode: true,
        message: 'Message saved. AI Absorber mode is enabled - AI is listening but not responding.',
        content: message
      });
    }

    // Get user preferences
    const preferences = await prisma.promptPreference.findUnique({
      where: { userId: user.id },
    });

    // Analyze prompt and select model
    const analysis = PromptAnalyzer.analyze(message, files);
    
    const selectionPreferences = {
      mode: preferences?.mode || mode,
      qualityWeight: preferences?.qualityWeight || 0.4,
      costWeight: preferences?.costWeight || 0.3,
      speedWeight: preferences?.speedWeight || 0.2,
      capabilityWeight: preferences?.capabilityWeight || 0.1,
      maxCostPerMessage: preferences?.maxCostPerMessage || undefined,
      preferredProviders: preferences?.preferredProviders || undefined,
      blacklistedModels: preferences?.blacklistedModels || undefined,
    };

    let selectedModel;
    let modelReason;
    let promptAnalysis = analysis;

    if (modelOverride) {
      selectedModel = modelOverride;
      modelReason = 'Manual override by user';
    } else {
      try {
        const selection = ModelSelector.selectModel(message, files, selectionPreferences);
        if (selection && selection.recommended) {
          selectedModel = {
            provider: selection.recommended.provider,
            model: selection.recommended.model,
          };
          modelReason = selection.reasoning;
        } else {
          // Fallback to a default model if selection fails
          selectedModel = {
            provider: 'openai',
            model: 'gpt-4o-mini',
          };
          modelReason = 'Using default model (GPT-4o Mini) as no optimal model was found';
        }
      } catch (error) {
        console.error('Model selection error:', error);
        // Fallback to a default model
        selectedModel = {
          provider: 'openai',
          model: 'gpt-4o-mini',
        };
        modelReason = 'Using default model due to selection error';
      }
    }

    // Update user message with final model selection details
    await prisma.aIMessage.update({
      where: { id: userMessage.id },
      data: {
        selectedModel: selectedModel.model,
        selectedProvider: selectedModel.provider,
        modelReason: modelReason,
      },
    });

    // Create prompt analysis
    await prisma.promptAnalysis.create({
      data: {
        messageId: userMessage.id,
        complexity: analysis.complexity,
        length: analysis.length,
        hasCode: analysis.hasCode,
        hasImages: analysis.hasImages,
        hasFiles: analysis.hasFiles,
        language: analysis.language,
        contentType: analysis.contentType,
        domain: analysis.domain,
        techStack: analysis.techStack,
        requiredFeatures: analysis.requiredFeatures,
        minContextWindow: analysis.minContextWindow,
        requiredCapabilities: analysis.requiredCapabilities,
        estimatedTokens: analysis.estimatedTokens,
        accuracyNeeded: analysis.accuracyNeeded,
        creativityNeeded: analysis.creativityNeeded,
        speedPriority: analysis.speedPriority,
        budgetSensitivity: analysis.budgetSensitivity,
        qualityThreshold: analysis.qualityThreshold,
      },
    });

    // Set up SSE stream
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Send initial analysis data to client
    writer.write(encoder.encode(`data: ${JSON.stringify({ 
      type: 'analysis',
      analysis: {
        complexity: analysis.complexity,
        contentType: analysis.contentType,
        domain: analysis.domain,
        hasCode: analysis.hasCode,
        estimatedTokens: analysis.estimatedTokens,
        selectedModel: selectedModel,
        modelReason: modelReason,
      }
    })}\n\n`));

    // Build messages with project context
    const messages = buildMessagesWithContext(message, projectContext);

    // Process with selected model
    processAIResponse(
      selectedModel,
      messages,
      currentThreadId,
      user.id,
      modelReason,
      writer,
      encoder
    );

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

async function processAIResponse(
  model: { provider: string; model: string },
  messages: any[],
  threadId: string,
  userId: string,
  modelReason: string,
  writer: WritableStreamDefaultWriter<any>,
  encoder: TextEncoder
) {
  const startTime = Date.now();
  let content = '';
  let promptTokens = 0;
  let completionTokens = 0;

  try {
    // Map provider names to match database convention
    const providerMapping: { [key: string]: string } = {
      'openai': 'openai',
      'claude': 'claude',
      'anthropic': 'claude',
      'gemini': 'gemini',
      'google': 'gemini',
      'grok': 'grok',
      'xai': 'grok',
      'mistral': 'mistral',
      'perplexity': 'perplexity'
    };
    
    const dbProvider = providerMapping[model.provider.toLowerCase()] || model.provider.toLowerCase();
    
    // Get API key using unified service
    console.log('Looking for API key:', { userId, provider: dbProvider, modelProvider: model.provider });
    const apiKey = await apiKeyService.getApiKey(
      userId,
      dbProvider as Provider,
      undefined // Will use user's organization if available
    );
    
    if (!apiKey) {
      console.error('No API key found for provider:', dbProvider);
      await writer.write(encoder.encode(`data: ${JSON.stringify({ 
        type: 'error', 
        error: `No API key found for ${model.provider}. Please add your ${model.provider} API key in settings.` 
      })}\n\n`));
      await writer.close();
      return;
    }
    
    console.log('Using API key for provider:', dbProvider, 'key starts with:', apiKey.substring(0, 10));

    // Stream response based on provider
    // Use the normalized dbProvider for comparison
    if (dbProvider === 'openai') {
      console.log('Creating OpenAI client with model:', model.model);
      const openai = new OpenAI({ apiKey });

      const stream = await openai.chat.completions.create({
        model: model.model,
        messages: messages,
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          content += delta;
          await writer.write(encoder.encode(`data: ${JSON.stringify({
            type: 'content',
            content: delta
          })}\n\n`));
        }

        // Update token counts (simplified)
        if (chunk.usage) {
          promptTokens = chunk.usage.prompt_tokens || 0;
          completionTokens = chunk.usage.completion_tokens || 0;
        }
      }
    } else if (dbProvider === 'anthropic') {
      const anthropic = new Anthropic({ apiKey });

      // Extract system message for Anthropic (if exists)
      const systemMessage = messages.find(msg => msg.role === 'system');
      const userMessages = messages.filter(msg => msg.role !== 'system');

      const stream = await anthropic.messages.create({
        model: model.model,
        system: systemMessage?.content,
        messages: userMessages,
        max_tokens: 4096,
        stream: true,
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta') {
          const delta = (chunk.delta as any).text || '';
          content += delta;
          await writer.write(encoder.encode(`data: ${JSON.stringify({
            type: 'content',
            content: delta
          })}\n\n`));
        }
      }

      // Estimate tokens for Anthropic
      const totalMessageLength = messages.reduce((sum, msg) => sum + msg.content.length, 0);
      promptTokens = Math.ceil(totalMessageLength / 4);
      completionTokens = Math.ceil(content.length / 4);
    } else if (dbProvider === 'gemini' || dbProvider === 'google') {
      const geminiClient = getGeminiClient(userId, apiKey);
      const geminiModel = geminiClient.getGenerativeModel({
        model: model.model,
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.7,
        }
      });

      // Convert messages to Gemini format
      const prompt = messages.map(msg => {
        if (msg.role === 'system') {
          return `System: ${msg.content}`;
        } else if (msg.role === 'user') {
          return `User: ${msg.content}`;
        } else {
          return `Assistant: ${msg.content}`;
        }
      }).join('\n\n');

      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      content = response.text();

      // Simulate streaming by sending the content in chunks
      const chunkSize = 50; // Characters per chunk
      for (let i = 0; i < content.length; i += chunkSize) {
        const chunk = content.slice(i, i + chunkSize);
        await writer.write(encoder.encode(`data: ${JSON.stringify({
          type: 'content',
          content: chunk
        })}\n\n`));

        // Small delay to simulate natural streaming
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Estimate tokens for Gemini
      const totalMessageLength = messages.reduce((sum, msg) => sum + msg.content.length, 0);
      promptTokens = Math.ceil(totalMessageLength / 4);
      completionTokens = Math.ceil(content.length / 4);
    } else if (dbProvider === 'grok' || dbProvider === 'xai') {
      // Grok uses OpenAI-compatible API
      const openai = new OpenAI({
        apiKey,
        baseURL: 'https://api.x.ai/v1'
      });

      const stream = await openai.chat.completions.create({
        model: model.model,
        messages: messages,
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          content += delta;
          await writer.write(encoder.encode(`data: ${JSON.stringify({
            type: 'content',
            content: delta
          })}\n\n`));
        }

        // Update token counts (simplified)
        if (chunk.usage) {
          promptTokens = chunk.usage.prompt_tokens || 0;
          completionTokens = chunk.usage.completion_tokens || 0;
        }
      }
    } else {
      // Mock response for other providers
      content = `This is a mock response from ${model.provider} - ${model.model}. In production, this would be the actual AI response.`;
      await writer.write(encoder.encode(`data: ${JSON.stringify({ 
        type: 'content', 
        content 
      })}\n\n`));
      
      const totalMessageLength = messages.reduce((sum, msg) => sum + msg.content.length, 0);
      promptTokens = Math.ceil(totalMessageLength / 4);
      completionTokens = Math.ceil(content.length / 4);
    }

    const latency = Date.now() - startTime;
    const totalTokens = promptTokens + completionTokens;
    
    // Calculate cost based on model
    const modelInfo = ModelSelector.getModelCapabilities(model.provider, model.model);
    const cost = modelInfo 
      ? (promptTokens / 1000) * modelInfo.inputCost + (completionTokens / 1000) * modelInfo.outputCost
      : 0;

    // Save assistant message
    const assistantMessage = await prisma.aIMessage.create({
      data: {
        threadId,
        role: MessageRole.ASSISTANT,
        content,
        selectedModel: model.model,
        selectedProvider: model.provider,
        recommendedModel: model.model,
        modelReason,
        promptTokens,
        completionTokens,
        totalTokens,
        cost,
        latency,
      },
    });

    // Update thread
    await prisma.aIThread.update({
      where: { id: threadId },
      data: {
        lastMessageAt: new Date(),
        messageCount: { increment: 2 },
        totalCost: { increment: cost },
        totalTokens: { increment: totalTokens },
      },
    });

    // Log usage
    await prisma.usageLog.create({
      data: {
        userId,
        organizationId: (await prisma.user.findUnique({ 
          where: { id: userId },
          select: { organizationId: true }
        }))?.organizationId || '',
        provider: model.provider,
        model: model.model,
        promptTokens,
        completionTokens,
        totalTokens,
        cost,
        metadata: {
          threadId,
          messageId: assistantMessage.id,
          latency,
        },
      },
    });

    // Send metadata
    await writer.write(encoder.encode(`data: ${JSON.stringify({ 
      type: 'metadata',
      metadata: {
        id: assistantMessage.id,
        selectedModel: model.model,
        selectedProvider: model.provider,
        recommendedModel: model.model,
        modelReason,
        promptTokens,
        completionTokens,
        totalTokens,
        cost,
        latency,
      }
    })}\n\n`));

    await writer.write(encoder.encode('data: [DONE]\n\n'));
  } catch (error) {
    console.error('AI processing error:', error);
    
    // Send more detailed error information
    let errorMessage = 'Failed to process AI response';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for specific OpenAI errors
      if (error.message.includes('401') || error.message.includes('Incorrect API key')) {
        errorMessage = 'Invalid OpenAI API key. Please check your API key in settings.';
      } else if (error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (error.message.includes('model')) {
        errorMessage = `Model error: ${error.message}`;
      }
    }
    
    await writer.write(encoder.encode(`data: ${JSON.stringify({ 
      type: 'error', 
      error: errorMessage
    })}\n\n`));
  } finally {
    await writer.close();
  }
}