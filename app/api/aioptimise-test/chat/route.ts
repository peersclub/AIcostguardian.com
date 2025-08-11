import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Mock AI responses
const mockResponses = [
  "I'll help you with that. Based on your request, here's a comprehensive solution...",
  "Let me analyze this for you. The key considerations are...",
  "Great question! Here's what I recommend...",
  "I understand what you're looking for. Let me break this down...",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, mode = 'standard', modelOverride } = body;
    
    // Create a readable stream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send mock analysis first
          const analysisData = {
            type: 'analysis',
            analysis: {
              recommendedModel: modelOverride?.model || 'gpt-4o',
              recommendedProvider: modelOverride?.provider || 'openai',
              estimatedCost: 0.001 + Math.random() * 0.002,
              reasoning: 'Optimal model selected for your query type',
              complexity: message.length > 100 ? 'complex' : message.length > 50 ? 'moderate' : 'simple',
              category: 'general',
              suggestedMode: mode,
            }
          };
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(analysisData)}\n\n`));
          
          // Simulate streaming response
          const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
          const words = response.split(' ');
          
          for (let i = 0; i < words.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 50)); // Simulate typing delay
            
            const contentData = {
              type: 'content',
              content: words[i] + (i < words.length - 1 ? ' ' : '')
            };
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(contentData)}\n\n`));
          }
          
          // Send metadata at the end
          const metadata = {
            type: 'metadata',
            metadata: {
              id: `msg-${Date.now()}`,
              selectedModel: modelOverride?.model || 'gpt-4o',
              selectedProvider: modelOverride?.provider || 'openai',
              promptTokens: Math.floor(message.length / 4),
              completionTokens: Math.floor(response.length / 4),
              totalTokens: Math.floor((message.length + response.length) / 4),
              cost: 0.001 + Math.random() * 0.002,
              latency: 500 + Math.floor(Math.random() * 1000),
            }
          };
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          
        } catch (error) {
          const errorData = {
            type: 'error',
            error: 'Failed to process message'
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
        } finally {
          controller.close();
        }
      },
    });
    
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}