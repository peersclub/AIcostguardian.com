import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// POST /api/aioptimise/feedback
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { messageId, type } = await request.json()

    // In a real implementation, you would:
    // 1. Store the feedback in a feedback table
    // 2. Use it to improve model selection
    // 3. Track user preferences
    
    // For now, just log it
    console.log(`Feedback received: ${type} for message ${messageId} from user ${user.id}`)

    // You could also update usage metadata to track satisfaction
    await prisma.usage.updateMany({
      where: {
        userId: user.id,
        metadata: {
          path: ['messageId'],
          equals: messageId
        }
      },
      data: {
        metadata: {
          feedback: type,
          feedbackAt: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}