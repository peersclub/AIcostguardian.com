import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { storeApiKey } from '@/lib/api-key-store'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { apiKey } = await request.json()
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 })
    }

    // Store the API key for this user
    storeApiKey(session.user.id, 'gemini', apiKey)
    
    return NextResponse.json({ 
      success: true,
      message: 'Gemini API key saved successfully'
    })
  } catch (error) {
    console.error('Error saving Gemini API key:', error)
    return NextResponse.json(
      { error: 'Failed to save API key' }, 
      { status: 500 }
    )
  }
}