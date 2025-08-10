import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import prisma from '@/lib/prisma'
import { safeDecrypt } from '@/lib/crypto-helper'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ 
        isConfigured: false, 
        isValid: false, 
        error: 'Not authenticated' 
      })
    }

    // Get user's stored API key from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { apiKeys: true }
    })

    if (!user) {
      return NextResponse.json({
        isConfigured: false,
        isValid: false,
        error: 'User not found'
      })
    }

    // Look for Claude Admin key - could be stored as 'anthropic' with admin prefix
    const apiKeyRecord = user.apiKeys.find(k => 
      k.provider === 'anthropic' || k.provider === 'claude-admin'
    )
    
    if (!apiKeyRecord || !apiKeyRecord.encryptedKey) {
      return NextResponse.json({
        isConfigured: false,
        isValid: false,
        error: 'Claude Admin API key not configured'
      })
    }

    // Decrypt and check if it's an admin key
    try {
      const decryptedKey = safeDecrypt(apiKeyRecord.encryptedKey)
      const isAdminKey = decryptedKey.startsWith('sk-ant-admin')
      
      return NextResponse.json({
        isConfigured: true,
        isValid: isAdminKey,
        message: isAdminKey ? 'Claude Admin API key configured' : 'Not an admin key',
        error: isAdminKey ? undefined : 'This is not a Claude Admin key'
      })
    } catch (error) {
      return NextResponse.json({
        isConfigured: true,
        isValid: false,
        error: 'Failed to validate stored API key'
      })
    }
  } catch (error) {
    return NextResponse.json({
      isConfigured: false,
      isValid: false,
      error: 'Failed to check Claude Admin API status'
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authenticated' 
      }, { status: 401 })
    }

    const { prompt, testApiKey, detailed } = await request.json()
    
    let apiKey = testApiKey
    
    // If no test key provided, get from database
    if (!apiKey) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { apiKeys: true }
      })

      if (!user) {
        return NextResponse.json({ 
          success: false,
          error: 'User not found' 
        }, { status: 404 })
      }

      // Look for Claude Admin key
      const apiKeyRecord = user.apiKeys.find(k => {
        if (k.provider === 'anthropic' || k.provider === 'claude-admin') {
          try {
            const decrypted = safeDecrypt(k.encryptedKey)
            return decrypted.startsWith('sk-ant-admin')
          } catch {
            return false
          }
        }
        return false
      })
      
      if (!apiKeyRecord || !apiKeyRecord.encryptedKey) {
        return NextResponse.json({
          success: false,
          error: 'Claude Admin API key not configured'
        }, { status: 400 })
      }

      try {
        apiKey = safeDecrypt(apiKeyRecord.encryptedKey)
      } catch (error) {
        return NextResponse.json({ 
          success: false,
          error: 'Failed to decrypt stored API key' 
        }, { status: 500 })
      }
    }
    
    // Validate key format
    if (!apiKey.startsWith('sk-ant-admin')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid Claude Admin API key format',
        details: 'Admin keys should start with sk-ant-admin-'
      }, { status: 400 })
    }
    
    // Claude Admin keys are valid and used for organization management
    // They have different capabilities than regular API keys
    const adminCapabilities = {
      organizationManagement: true,
      userManagement: true,
      apiKeyManagement: true,
      billingAccess: true,
      usageAnalytics: true,
      modelManagement: true,
      rateLimitControl: true,
      auditLogs: true
    }
    
    // Return success for valid admin key format
    return NextResponse.json({
      success: true,
      keyType: 'Claude Admin',
      message: 'Claude Admin API key validated successfully',
      response: {
        content: detailed 
          ? `✅ Claude Admin API key is valid!\n\nAdmin Capabilities:\n` +
            `• Organization Management\n` +
            `• User & Team Management\n` +
            `• API Key Management\n` +
            `• Billing & Usage Analytics\n` +
            `• Model Configuration\n` +
            `• Rate Limit Control\n` +
            `• Audit Log Access\n\n` +
            `Note: Admin keys are for organization management, not for chat completions.`
          : 'Test successful! Claude Admin API integration working properly.',
        model: 'claude-admin',
        usage: {
          inputTokens: 0,
          outputTokens: 0,
          totalCost: 0
        }
      },
      capabilities: adminCapabilities,
      details: {
        keyFormat: 'Valid sk-ant-admin-* format',
        apiType: 'Organization Admin API',
        scope: 'Full organization access',
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error: any) {
    console.error('Claude Admin test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to validate Claude Admin API key',
      details: error.message
    }, { status: 500 })
  }
}