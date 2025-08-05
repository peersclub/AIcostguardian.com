'use client'

import { useSession } from 'next-auth/react'

export default function SettingsTest() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>
  }

  if (!session) {
    return <div className="p-8">Not authenticated</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Settings Test Page</h1>
      <p>User: {session.user?.email}</p>
      <p>Status: {status}</p>
      <div className="mt-4 p-4 bg-green-100 rounded">
        ✅ Authentication is working!
      </div>
    </div>
  )
}