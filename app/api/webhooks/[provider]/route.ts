import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Force dynamic rendering for webhooks
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Webhook endpoints for AI provider notifications
 * POST /api/webhooks/[provider]
 * Receives usage/billing notifications from providers
 */

// Webhook signature verification methods
const verifyWebhookSignature = {
  openai: (payload: string, signature: string, secret: string): boolean => {
    // OpenAI doesn't currently provide webhooks, but if they do...
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return signature === expectedSignature;
  },
  
  stripe: (payload: string, signature: string, secret: string): boolean => {
    // Stripe webhooks for OpenAI billing (if using Stripe)
    const elements = signature.split(',');
    let timestamp = '';
    let signatures: string[] = [];
    
    for (const element of elements) {
      const [key, value] = element.split('=');
      if (key === 't') timestamp = value;
      if (key === 'v1') signatures.push(value);
    }
    
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');
    
    return signatures.includes(expectedSignature);
  },
  
  claude: (payload: string, signature: string, secret: string): boolean => {
    // Anthropic webhook verification (when available)
    return true; // Placeholder
  },
  
  gemini: (payload: string, signature: string, secret: string): boolean => {
    // Google Cloud Pub/Sub verification
    return true; // Placeholder
  }
};

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const provider = params.provider;
    const body = await request.text();
    const signature = request.headers.get('x-webhook-signature') || 
                     request.headers.get('stripe-signature') || 
                     '';
    
    // Log webhook receipt
    console.log(`Webhook received from ${provider}`);
    
    // Get webhook secret from environment
    const webhookSecret = process.env[`WEBHOOK_SECRET_${provider.toUpperCase()}`];
    
    // Verify signature if secret is configured
    if (webhookSecret) {
      const verifier = verifyWebhookSignature[provider as keyof typeof verifyWebhookSignature];
      if (verifier && !verifier(body, signature, webhookSecret)) {
        console.error(`Invalid webhook signature for ${provider}`);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }
    
    // Parse webhook data
    const data = JSON.parse(body);
    
    // Process webhook based on provider and type
    const result = await processWebhook(provider, data);
    
    // Store webhook event for audit - disabled (model doesn't exist)
    /* await prisma.webhookEvent.create({
      data: {
        provider,
        type: data.type || data.event || 'unknown',
        payload: data,
        processed: result.success,
        error: result.error
      }
    }); */
    
    if (result.success) {
      return NextResponse.json({ received: true, processed: true });
    } else {
      return NextResponse.json(
        { received: true, processed: false, error: result.error },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Process webhook data based on provider and type
 */
async function processWebhook(provider: string, data: any): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    switch (provider) {
      case 'stripe':
        return processStripeWebhook(data);
        
      case 'openai':
        return processOpenAIWebhook(data);
        
      case 'claude':
        return processClaudeWebhook(data);
        
      case 'gemini':
        return processGeminiWebhook(data);
        
      case 'grok':
        return processGrokWebhook(data);
        
      default:
        return { success: false, error: `Unknown provider: ${provider}` };
    }
  } catch (error) {
    console.error(`Error processing ${provider} webhook:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Processing failed'
    };
  }
}

/**
 * Process Stripe webhook (for OpenAI billing)
 */
async function processStripeWebhook(data: any): Promise<{
  success: boolean;
  error?: string;
}> {
  const { type, data: eventData } = data;
  
  switch (type) {
    case 'invoice.payment_succeeded':
      // Track payment
      console.log('OpenAI payment received:', eventData.object.amount);
      // Could update budget tracking here
      break;
      
    case 'invoice.created':
      // New invoice created
      console.log('New OpenAI invoice:', eventData.object.id);
      break;
      
    case 'usage_record.created':
      // Usage record created
      console.log('Usage record:', eventData.object);
      // Could track usage here
      break;
  }
  
  return { success: true };
}

/**
 * Process OpenAI webhook (when available)
 */
async function processOpenAIWebhook(data: any): Promise<{
  success: boolean;
  error?: string;
}> {
  // OpenAI doesn't currently offer usage webhooks
  // This is a placeholder for future implementation
  
  if (data.usage) {
    // Track usage data
    console.log('OpenAI usage data received:', data.usage);
    
    // Store in database
    // await prisma.usageLog.create({...})
  }
  
  return { success: true };
}

/**
 * Process Claude/Anthropic webhook
 */
async function processClaudeWebhook(data: any): Promise<{
  success: boolean;
  error?: string;
}> {
  // Anthropic doesn't currently offer usage webhooks
  // This is a placeholder for future implementation
  
  return { success: true };
}

/**
 * Process Google/Gemini webhook
 */
async function processGeminiWebhook(data: any): Promise<{
  success: boolean;
  error?: string;
}> {
  // Google Cloud Pub/Sub can send usage notifications
  // Process them here when configured
  
  if (data.message) {
    const messageData = Buffer.from(data.message.data, 'base64').toString();
    const usage = JSON.parse(messageData);
    
    console.log('Gemini usage notification:', usage);
    // Track usage in database
  }
  
  return { success: true };
}

/**
 * Process Grok webhook
 */
async function processGrokWebhook(data: any): Promise<{
  success: boolean;
  error?: string;
}> {
  // X.AI/Grok webhook processing
  // Documentation pending from provider
  
  return { success: true };
}

/**
 * GET endpoint to check webhook configuration
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider;
  
  // Check if webhook is configured
  const webhookSecret = process.env[`WEBHOOK_SECRET_${provider.toUpperCase()}`];
  const webhookUrl = `${process.env.NEXTAUTH_URL}/api/webhooks/${provider}`;
  
  return NextResponse.json({
    provider,
    configured: !!webhookSecret,
    url: webhookUrl,
    instructions: getWebhookInstructions(provider)
  });
}

/**
 * Get provider-specific webhook setup instructions
 */
function getWebhookInstructions(provider: string): string {
  switch (provider) {
    case 'stripe':
      return 'Configure in Stripe Dashboard > Webhooks. Events: invoice.*, usage_record.*';
      
    case 'openai':
      return 'OpenAI does not currently offer usage webhooks. Use Stripe webhooks for billing.';
      
    case 'claude':
      return 'Anthropic does not currently offer usage webhooks. Check their documentation for updates.';
      
    case 'gemini':
      return 'Configure Google Cloud Pub/Sub to send notifications to this endpoint.';
      
    case 'grok':
      return 'X.AI webhook documentation pending. Check their developer portal.';
      
    default:
      return 'No webhook configuration available for this provider.';
  }
}