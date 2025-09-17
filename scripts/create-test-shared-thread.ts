import { prisma } from '@/lib/prisma'
import { threadManager } from '@/src/services/thread-manager'

async function createTestSharedThread() {
  console.log('🧪 Creating test shared thread for UI testing...')

  try {
    // Find demo user
    const demoUser = await prisma.user.findFirst({
      where: {
        email: {
          contains: 'demo'
        }
      }
    })

    if (!demoUser) {
      console.error('❌ No demo user found')
      return
    }

    console.log(`✅ Found demo user: ${demoUser.name} (${demoUser.email})`)

    // Create a test thread
    const testThread = await threadManager.createThread({
      title: 'Shared Conversation Demo',
      userId: demoUser.id,
      organizationId: demoUser.organizationId || undefined,
      mode: 'STANDARD',
      metadata: {
        demo: true,
        purpose: 'Testing shared thread functionality'
      }
    })

    console.log(`✅ Created demo thread: ${testThread.id}`)

    // Add realistic conversation messages
    const userMessage = await prisma.aIMessage.create({
      data: {
        threadId: testThread.id,
        role: 'USER',
        content: 'Can you help me understand how AI cost optimization works? I\'m concerned about our company\'s growing AI expenses and want to know what strategies we can implement.',
        selectedProvider: 'openai',
        selectedModel: 'gpt-4',
        promptTokens: 35,
        completionTokens: 0,
        totalTokens: 35,
        cost: 0.0017,
        metadata: {
          demo: true
        }
      }
    })

    const aiResponse = await prisma.aIMessage.create({
      data: {
        threadId: testThread.id,
        role: 'ASSISTANT',
        content: `# AI Cost Optimization Strategies

I'd be happy to help you understand AI cost optimization! Here are key strategies your company can implement:

## 1. Model Selection Optimization
- **Use smaller models when possible**: For simple tasks, GPT-3.5-turbo is often sufficient instead of GPT-4
- **Provider comparison**: Compare costs across OpenAI, Claude, Gemini, and other providers
- **Context window management**: Minimize prompt length to reduce token usage

## 2. Smart Caching
- **Response caching**: Store common responses to avoid repeat API calls
- **Prompt optimization**: Use templates and reduce redundant context
- **Batch processing**: Group similar requests together

## 3. Usage Monitoring
- **Real-time tracking**: Monitor costs across teams and projects
- **Budget alerts**: Set spending limits and notifications
- **Usage analytics**: Identify inefficient patterns

## 4. Technical Optimizations
- **Streaming responses**: Better user experience without additional costs
- **Temperature tuning**: Lower values for deterministic tasks save retries
- **Output length limits**: Set max_tokens appropriately

Would you like me to dive deeper into any of these areas? I can also help you analyze your current usage patterns if you share more details about your use cases.`,
        selectedProvider: 'openai',
        selectedModel: 'gpt-4',
        promptTokens: 45,
        completionTokens: 198,
        totalTokens: 243,
        cost: 0.0142,
        metadata: {
          demo: true
        }
      }
    })

    // Add a follow-up user message
    const followUpMessage = await prisma.aIMessage.create({
      data: {
        threadId: testThread.id,
        role: 'USER',
        content: 'This is really helpful! Could you specifically explain more about the provider comparison aspect? How do the costs differ between OpenAI, Claude, and others?',
        selectedProvider: 'openai',
        selectedModel: 'gpt-4',
        promptTokens: 28,
        completionTokens: 0,
        totalTokens: 28,
        cost: 0.0014,
        metadata: {
          demo: true
        }
      }
    })

    const finalResponse = await prisma.aIMessage.create({
      data: {
        threadId: testThread.id,
        role: 'ASSISTANT',
        content: `# Provider Cost Comparison

Great question! Here's a detailed breakdown of pricing differences between major AI providers:

## Pricing per 1M tokens (as of 2024):

### **OpenAI**
- **GPT-4**: $30 input / $60 output
- **GPT-3.5-turbo**: $1 input / $2 output
- **GPT-4-turbo**: $10 input / $30 output

### **Anthropic Claude**
- **Claude-3.5 Sonnet**: $3 input / $15 output
- **Claude-3 Haiku**: $0.25 input / $1.25 output
- **Claude-3 Opus**: $15 input / $75 output

### **Google Gemini**
- **Gemini Pro**: $0.50 input / $1.50 output
- **Gemini Pro Vision**: $0.50 input / $1.50 output
- **Gemini Ultra**: $5 input / $15 output

## Key Insights:

1. **Claude Haiku** is often the most cost-effective for simple tasks
2. **Gemini Pro** offers excellent value for balanced performance
3. **GPT-4** is premium priced but offers top performance
4. **Context window sizes** vary - larger windows cost more per token

## Pro Tips:
- Use **task routing**: Simple queries → Haiku, Complex → GPT-4
- Monitor **output-to-input ratios** - some providers charge more for output
- Consider **fine-tuned models** for repetitive tasks

Would you like me to help you calculate potential savings based on your specific usage patterns?`,
        selectedProvider: 'openai',
        selectedModel: 'gpt-4',
        promptTokens: 67,
        completionTokens: 245,
        totalTokens: 312,
        cost: 0.0201,
        metadata: {
          demo: true
        }
      }
    })

    console.log(`✅ Added ${4} demo messages to thread`)

    // Share the thread
    const shareResult = await threadManager.shareThread(testThread.id, demoUser.id, {
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      allowEdit: false,
      requireAuth: false,
      maxCollaborators: 10
    })

    console.log(`\n🎉 Demo shared thread created successfully!`)
    console.log(`📱 Thread Title: "${testThread.title}"`)
    console.log(`🔗 Share URL: ${shareResult.shareUrl}`)
    console.log(`🆔 Share ID: ${shareResult.thread.shareToken}`)
    console.log(`👤 Owner: ${demoUser.name} (${demoUser.email})`)
    console.log(`💬 Messages: 4 messages in conversation`)
    console.log(`\n✨ You can now test the sharing functionality by visiting the share URL!`)

  } catch (error) {
    console.error('❌ Failed to create test shared thread:', error)
  }
}

// Run the script
createTestSharedThread()
  .then(() => {
    console.log('\n🏁 Demo thread creation complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script error:', error)
    process.exit(1)
  })