import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Optimise V2 - AI Cost Guardian',
  description: 'Advanced AI optimization and chat interface with real-time collaboration',
}

// This layout deliberately excludes the Navigation component
// to provide a full-screen experience for AIOptimiseV2
export default function AIOptimiseV2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}