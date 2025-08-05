import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getClaudeAdminClient, mockClaudeAdminData } from '@/lib/claude-admin-client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      // Try to fetch from real Claude Admin API
      const adminClient = getClaudeAdminClient(session.user.id)
      const versionInfo = await adminClient.getApiVersion()
      
      return NextResponse.json({
        ...versionInfo,
        hasUpdate: versionInfo.current !== versionInfo.latest,
        updateMessage: versionInfo.current !== versionInfo.latest 
          ? `New API version ${versionInfo.latest} is available. Current version: ${versionInfo.current}`
          : null
      })
    } catch (adminError: any) {
      console.log('Claude Admin API not available, using mock data:', adminError.message)
      
      // Fallback to mock version info
      const versionInfo = {
        ...mockClaudeAdminData.apiVersion,
        hasUpdate: mockClaudeAdminData.apiVersion.current !== mockClaudeAdminData.apiVersion.latest,
        updateMessage: mockClaudeAdminData.apiVersion.current !== mockClaudeAdminData.apiVersion.latest 
          ? `New API version ${mockClaudeAdminData.apiVersion.latest} is available. Current version: ${mockClaudeAdminData.apiVersion.current}`
          : null
      }
      
      return NextResponse.json(versionInfo)
    }
  } catch (error: any) {
    console.error('Claude Admin Version API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch version info' },
      { status: 500 }
    )
  }
}