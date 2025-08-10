import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/prisma';
import { PromptAnalyzer } from '@/lib/prompt-analyzer/analyzer';
import { ModelSelector } from '@/lib/prompt-analyzer/model-selector';
import { OptimizationMode, MessageRole } from '@prisma/client';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      threadId, 
      message, 
      mode = OptimizationMode.BALANCED,
      modelOverride,
      files 
    } = body;

    // Get user preferences
    const preferences = await prisma.promptPreference.findUnique({
      where: { userId: session.user.id },
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

    if (modelOverride) {
      selectedModel = modelOverride;
      modelReason = 'Manual override by user';
    } else {
      const selection = ModelSelector.selectModel(message, files, selectionPreferences);
      selectedModel = {
        provider: selection.recommended.provider,
        model: selection.recommended.model,
      };
      modelReason = selection.reasoning;
    }

    // Create user message in database
    const userMessage = await prisma.aIMessage.create({
      data: {
        threadId,
        role: MessageRole.USER,
        content: message,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0,
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

    // Process with selected model
    processAIResponse(
      selectedModel,
      message,
      threadId,
      session.user.id,
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
  prompt: string,
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
    // Get API keys
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId,
        provider: model.provider,
        isActive: true,
      },
    });

    if (!apiKeys.length) {
      await writer.write(encoder.encode(`data: ${JSON.stringify({ 
        type: 'error', 
        error: `No API key found for ${model.provider}` 
      })}\n\n`));
      await writer.close();
      return;
    }

    // Decrypt API key (simplified - use your actual decryption)
    const apiKey = apiKeys[0].encryptedKey; // In production, decrypt this

    // Stream response based on provider
    if (model.provider === 'openai') {
      const openai = new OpenAI({ apiKey });
      
      const stream = await openai.chat.completions.create({
        model: model.model,
        messages: [{ role: 'user', content: prompt }],
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
    } else if (model.provider === 'anthropic') {
      const anthropic = new Anthropic({ apiKey });
      
      const stream = await anthropic.messages.create({
        model: model.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4096,
        stream: true,
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta') {
          const delta = chunk.delta.text || '';
          content += delta;
          await writer.write(encoder.encode(`data: ${JSON.stringify({ 
            type: 'content', 
            content: delta 
          })}\n\n`));
        }
      }
      
      // Estimate tokens for Anthropic
      promptTokens = Math.ceil(prompt.length / 4);
      completionTokens = Math.ceil(content.length / 4);
    } else {
      // Mock response for other providers
      content = `This is a mock response from ${model.provider} - ${model.model}. In production, this would be the actual AI response.`;
      await writer.write(encoder.encode(`data: ${JSON.stringify({ 
        type: 'content', 
        content 
      })}\n\n`));
      
      promptTokens = Math.ceil(prompt.length / 4);
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
    await writer.write(encoder.encode(`data: ${JSON.stringify({ 
      type: 'error', 
      error: 'Failed to process AI response' 
    })}\n\n`));
  } finally {
    await writer.close();
  }
}