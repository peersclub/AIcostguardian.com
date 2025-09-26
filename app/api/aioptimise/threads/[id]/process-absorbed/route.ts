import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { MessageRole } from '@prisma/client';
import { apiKeyService, type Provider } from '@/lib/core/api-key.service';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to the thread
    const thread = await prisma.aIThread.findUnique({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
                acceptedAt: { not: null },
                role: { in: ['EDITOR', 'ADMIN'] }
              }
            }
          }
        ]
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found or insufficient permissions' },
        { status: 404 }
      );
    }

    // Get all absorbed messages (user messages created when absorber mode was enabled)
    const absorbedMessages = await prisma.aIMessage.findMany({
      where: {
        threadId: params.id,
        isAbsorbedMessage: true,
        role: MessageRole.USER
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (absorbedMessages.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No absorbed messages to process'
      });
    }

    // Prepare messages for AI summarization
    const messagesToSummarize = absorbedMessages.map(msg => ({
      role: 'user',
      content: msg.content,
      timestamp: msg.createdAt.toISOString()
    }));

    // Create a summary prompt
    const summaryPrompt = `Please provide a concise summary of the following conversation that took place while AI was in "absorber mode" (listening but not responding). Focus on the key topics, decisions, and action items discussed:

${messagesToSummarize.map((msg, index) => 
  `Message ${index + 1} (${new Date(msg.timestamp).toLocaleString()}): ${msg.content}`
).join('\n\n')}

Please provide:
1. A brief overview of the main topics discussed
2. Any decisions or conclusions reached
3. Action items or next steps mentioned
4. Key insights or important points

Keep the summary concise but comprehensive.`;

    // Get default AI provider and model for summarization
    const defaultProvider = 'openai';
    const defaultModel = 'gpt-4o-mini';

    try {
      // Get API key for the provider
      const apiKeyData = await apiKeyService.getDecryptedKey(session.user.id, defaultProvider as Provider);
      
      if (!apiKeyData?.key) {
        throw new Error(`No API key found for provider: ${defaultProvider}`);
      }

      let aiResponse = '';
      let tokenUsage = {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0
      };

      // Generate summary using the default model
      if (defaultProvider === 'openai') {
        const openai = new OpenAI({ apiKey: apiKeyData.key });
        
        const completion = await openai.chat.completions.create({
          model: defaultModel,
          messages: [{ role: 'user', content: summaryPrompt }],
          temperature: 0.7,
          max_tokens: 1000
        });

        aiResponse = completion.choices[0]?.message?.content || 'No summary generated';
        tokenUsage = {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
          cost: ((completion.usage?.prompt_tokens || 0) * 0.00015 / 1000) + 
                ((completion.usage?.completion_tokens || 0) * 0.0006 / 1000) // GPT-4o-mini pricing
        };
      } else if (defaultProvider === 'anthropic') {
        const anthropic = new Anthropic({ apiKey: apiKeyData.key });
        
        const completion = await anthropic.messages.create({
          model: defaultModel.includes('claude') ? defaultModel : 'claude-3-haiku-20240307',
          max_tokens: 1000,
          temperature: 0.7,
          messages: [{ role: 'user', content: summaryPrompt }]
        });

        aiResponse = completion.content[0]?.type === 'text' ? completion.content[0].text : 'No summary generated';
        tokenUsage = {
          promptTokens: completion.usage.input_tokens || 0,
          completionTokens: completion.usage.output_tokens || 0,
          totalTokens: (completion.usage.input_tokens || 0) + (completion.usage.output_tokens || 0),
          cost: ((completion.usage.input_tokens || 0) * 0.00025 / 1000) + 
                ((completion.usage.output_tokens || 0) * 0.00125 / 1000) // Claude Haiku pricing
        };
      }

      // Create AI summary message
      const summaryMessage = await prisma.aIMessage.create({
        data: {
          threadId: params.id,
          role: MessageRole.ASSISTANT,
          content: `**📋 Summary of Absorbed Conversation**\n\n${aiResponse}\n\n*This summary covers ${absorbedMessages.length} message(s) that were sent while AI Absorber mode was active. AI involvement now resumes normally.*`,
          selectedModel: defaultModel,
          selectedProvider: defaultProvider,
          modelReason: 'Summarizing absorbed conversation',
          promptTokens: tokenUsage.promptTokens,
          completionTokens: tokenUsage.completionTokens,
          totalTokens: tokenUsage.totalTokens,
          cost: tokenUsage.cost,
          isAbsorbedMessage: false
        }
      });

      // Update thread analytics
      await prisma.aIThread.update({
        where: { id: params.id },
        data: {
          lastMessageAt: new Date(),
          messageCount: { increment: 1 },
          totalCost: { increment: tokenUsage.cost },
          totalTokens: { increment: tokenUsage.totalTokens }
        }
      });

      // Mark absorbed messages as processed (optional: update a field or keep as-is)
      // We'll keep them marked as absorbed for historical tracking

      return NextResponse.json({
        success: true,
        message: `Successfully processed ${absorbedMessages.length} absorbed messages and generated summary`,
        summary: {
          messageId: summaryMessage.id,
          absorbedMessageCount: absorbedMessages.length,
          tokenUsage,
          model: defaultModel,
          provider: defaultProvider
        }
      });

    } catch (aiError) {
      console.error('Error generating AI summary:', aiError);
      
      // Create a fallback summary message without AI
      const fallbackMessage = await prisma.aIMessage.create({
        data: {
          threadId: params.id,
          role: MessageRole.ASSISTANT,
          content: `**📋 Absorbed Conversation Summary**\n\nWhile AI Absorber mode was active, ${absorbedMessages.length} message(s) were received:\n\n${absorbedMessages.map((msg, index) => 
            `${index + 1}. (${msg.createdAt.toLocaleString()}) ${msg.content.slice(0, 100)}${msg.content.length > 100 ? '...' : ''}`
          ).join('\n')}\n\n*AI involvement now resumes normally. Unable to generate AI summary due to: ${aiError instanceof Error ? aiError.message : 'Unknown error'}*`,
          selectedModel: 'fallback',
          selectedProvider: 'system',
          modelReason: 'Fallback summary - AI summarization failed',
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          cost: 0,
          errorMessage: aiError instanceof Error ? aiError.message : 'Unknown error',
          isAbsorbedMessage: false
        }
      });

      return NextResponse.json({
        success: true,
        message: `Processed ${absorbedMessages.length} absorbed messages with fallback summary`,
        summary: {
          messageId: fallbackMessage.id,
          absorbedMessageCount: absorbedMessages.length,
          fallback: true,
          error: aiError instanceof Error ? aiError.message : 'Unknown error'
        }
      });
    }

  } catch (error) {
    console.error('Failed to process absorbed messages:', error);
    return NextResponse.json(
      { error: 'Failed to process absorbed messages' },
      { status: 500 }
    );
  }
}