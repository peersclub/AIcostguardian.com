import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// AI Context Memory - Surprise Feature
// Creates intelligent connections between conversations
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sourceThreadId, content } = body

    // Verify thread access
    const sourceThread = await prisma.aIThread.findFirst({
      where: {
        id: sourceThreadId,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: { userId: session.user.id }
            }
          }
        ]
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!sourceThread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    // Extract keywords, topics, and entities using simple NLP
    const extractedData = await extractContextData(content, sourceThread.messages)

    // Find related threads based on keywords and topics
    const relatedThreads = await findRelatedThreads(
      session.user.id,
      extractedData.keywords,
      extractedData.topics,
      sourceThreadId
    )

    // Create or update context memory
    const existingMemory = await prisma.aIContextMemory.findFirst({
      where: {
        sourceThreadId,
        userId: session.user.id
      }
    })

    let contextMemory
    if (existingMemory) {
      contextMemory = await prisma.aIContextMemory.update({
        where: { id: existingMemory.id },
        data: {
          keywords: extractedData.keywords,
          topics: extractedData.topics,
          entities: extractedData.entities,
          contextSummary: extractedData.summary,
          relatedThreadIds: relatedThreads.map(t => t.id),
          memoryStrength: calculateMemoryStrength(extractedData, relatedThreads),
          lastAccessedAt: new Date()
        }
      })
    } else {
      contextMemory = await prisma.aIContextMemory.create({
        data: {
          userId: session.user.id,
          organizationId: sourceThread.organizationId,
          sourceThreadId,
          keywords: extractedData.keywords,
          topics: extractedData.topics,
          entities: extractedData.entities,
          contextSummary: extractedData.summary,
          relatedThreadIds: relatedThreads.map(t => t.id),
          memoryStrength: calculateMemoryStrength(extractedData, relatedThreads)
        }
      })
    }

    return NextResponse.json({
      contextMemory,
      relatedThreads: relatedThreads.map(t => ({
        id: t.id,
        title: t.title,
        lastMessageAt: t.lastMessageAt,
        similarity: t.similarity
      })),
      suggestions: generateContextSuggestions(extractedData, relatedThreads)
    })

  } catch (error) {
    console.error('Error creating context memory:', error)
    return NextResponse.json({ error: 'Failed to create context memory' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get('threadId')
    const query = searchParams.get('query')

    if (threadId) {
      // Get context memory for specific thread
      const contextMemory = await prisma.aIContextMemory.findFirst({
        where: {
          sourceThreadId: threadId,
          userId: session.user.id
        },
        include: {
          sourceThread: {
            select: { id: true, title: true }
          }
        }
      })

      if (contextMemory) {
        // Get related threads
        const relatedThreads = await prisma.aIThread.findMany({
          where: {
            id: { in: contextMemory.relatedThreadIds },
            userId: session.user.id
          },
          select: {
            id: true,
            title: true,
            lastMessageAt: true,
            messageCount: true
          }
        })

        return NextResponse.json({
          contextMemory,
          relatedThreads
        })
      }
    }

    if (query) {
      // Search context memories
      const memories = await prisma.aIContextMemory.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { keywords: { hasSome: [query.toLowerCase()] } },
            { topics: { hasSome: [query.toLowerCase()] } },
            { entities: { hasSome: [query.toLowerCase()] } },
            { contextSummary: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: {
          sourceThread: {
            select: { id: true, title: true, lastMessageAt: true }
          }
        },
        orderBy: { memoryStrength: 'desc' },
        take: 10
      })

      return NextResponse.json({ memories })
    }

    // Get all context memories for user
    const memories = await prisma.aIContextMemory.findMany({
      where: { userId: session.user.id },
      include: {
        sourceThread: {
          select: { id: true, title: true, lastMessageAt: true }
        }
      },
      orderBy: { lastAccessedAt: 'desc' },
      take: 20
    })

    return NextResponse.json({ memories })

  } catch (error) {
    console.error('Error fetching context memory:', error)
    return NextResponse.json({ error: 'Failed to fetch context memory' }, { status: 500 })
  }
}

// Helper functions for AI Context Memory

async function extractContextData(content: string, messages: any[]) {
  // Simple keyword extraction
  const keywords = extractKeywords(content)

  // Topic identification
  const topics = identifyTopics(content)

  // Entity extraction (simple implementation)
  const entities = extractEntities(content)

  // Generate summary
  const summary = generateSummary(content, messages)

  return { keywords, topics, entities, summary }
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - in production, use proper NLP
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !isStopWord(word))

  // Count frequency and return top keywords
  const frequency: Record<string, number> = {}
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1
  })

  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word)
}

function identifyTopics(text: string): string[] {
  const topics: string[] = []
  const lowerText = text.toLowerCase()

  // Simple topic identification based on keywords
  const topicKeywords = {
    'programming': ['code', 'function', 'variable', 'programming', 'development', 'software'],
    'ai-ml': ['machine learning', 'neural network', 'model', 'training', 'algorithm'],
    'business': ['strategy', 'marketing', 'sales', 'revenue', 'growth'],
    'design': ['design', 'ui', 'ux', 'interface', 'layout'],
    'data': ['data', 'database', 'analytics', 'metrics', 'insights']
  }

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      topics.push(topic)
    }
  }

  return topics
}

function extractEntities(text: string): string[] {
  // Simple entity extraction - in production, use proper NER
  const entities: string[] = []

  // Extract potential names (capitalized words)
  const capitalizedWords = text.match(/\b[A-Z][a-z]+\b/g) || []
  entities.push(...capitalizedWords.slice(0, 5))

  // Extract potential organizations/products
  const organizations = text.match(/\b[A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*\b/g) || []
  entities.push(...organizations.slice(0, 3))

  return Array.from(new Set(entities)) // Remove duplicates
}

function generateSummary(content: string, messages: any[]): string {
  // Simple summary generation
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const summary = sentences.slice(0, 2).join('. ')

  return summary || 'Discussion about AI and related topics'
}

function isStopWord(word: string): boolean {
  const stopWords = new Set([
    'the', 'is', 'are', 'was', 'were', 'been', 'have', 'has', 'had',
    'will', 'would', 'could', 'should', 'can', 'may', 'might',
    'this', 'that', 'these', 'those', 'and', 'but', 'or',
    'for', 'with', 'from', 'into', 'over', 'under', 'about'
  ])
  return stopWords.has(word)
}

async function findRelatedThreads(userId: string, keywords: string[], topics: string[], excludeId: string) {
  // Find threads with similar keywords or topics
  const relatedThreads = await prisma.aIThread.findMany({
    where: {
      userId,
      id: { not: excludeId },
      isArchived: false,
      OR: [
        { title: { in: keywords, mode: 'insensitive' } },
        { description: { in: keywords, mode: 'insensitive' } },
        { tags: { hasSome: keywords } },
        { tags: { hasSome: topics } }
      ]
    },
    select: {
      id: true,
      title: true,
      lastMessageAt: true,
      tags: true
    },
    take: 5
  })

  // Calculate similarity scores
  return relatedThreads.map(thread => ({
    ...thread,
    similarity: calculateSimilarity(keywords, topics, thread.tags)
  }))
}

function calculateSimilarity(keywords: string[], topics: string[], threadTags: string[]): number {
  const commonKeywords = keywords.filter(k => threadTags.includes(k)).length
  const commonTopics = topics.filter(t => threadTags.includes(t)).length

  return (commonKeywords * 0.6 + commonTopics * 0.4) / Math.max(keywords.length + topics.length, 1)
}

function calculateMemoryStrength(extractedData: any, relatedThreads: any[]): number {
  // Calculate memory strength based on keywords, topics, and related threads
  const keywordScore = extractedData.keywords.length * 0.3
  const topicScore = extractedData.topics.length * 0.4
  const relationScore = relatedThreads.length * 0.3

  return Math.min(keywordScore + topicScore + relationScore, 5.0)
}

function generateContextSuggestions(extractedData: any, relatedThreads: any[]): string[] {
  const suggestions: string[] = []

  if (relatedThreads.length > 0) {
    suggestions.push(`Found ${relatedThreads.length} related conversations`)
  }

  if (extractedData.topics.length > 0) {
    suggestions.push(`Topics identified: ${extractedData.topics.join(', ')}`)
  }

  if (extractedData.keywords.length > 3) {
    suggestions.push('Rich context detected - this conversation will enhance your AI memory')
  }

  return suggestions
}