import { notFound } from 'next/navigation'
import { threadManager } from '@/src/services/thread-manager'
import SharedThreadClient from './client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface SharedThreadPageProps {
  params: { shareId: string }
}

export default async function SharedThreadPage({ params }: SharedThreadPageProps) {
  const { shareId } = params

  // Fetch the shared thread using the share token
  const thread = await threadManager.getThreadByShareToken(shareId)

  if (!thread) {
    notFound()
  }

  // Get thread owner information
  const threadOwner = {
    id: thread.userId,
    name: (thread as any).user?.name || 'Anonymous',
    email: (thread as any).user?.email || '',
    image: (thread as any).user?.image || ''
  }

  return (
    <div className="min-h-screen bg-background">
      <SharedThreadClient
        thread={thread as any}
        threadOwner={threadOwner}
        shareId={shareId}
      />
    </div>
  )
}