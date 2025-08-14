import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/settings - Get user settings
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organization: true,
        preferences: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get or create user preferences
    let preferences = user.preferences
    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId: user.id,
          theme: 'dark',
          language: 'en',
          timezone: 'UTC',
          emailNotifications: true,
          pushNotifications: false,
          smsNotifications: false,
          twoFactorEnabled: false,
          defaultModel: 'gpt-4o-mini',
          autoOptimize: true,
          streamResponses: true,
          saveHistory: true
        }
      })
    }

    // Combine user and organization settings
    const settings = {
      // General
      theme: preferences.theme || 'dark',
      language: preferences.language || 'en',
      timezone: preferences.timezone || 'UTC',
      dateFormat: preferences.dateFormat || 'MM/DD/YYYY',
      currency: preferences.currency || 'USD',
      
      // Notifications
      emailNotifications: preferences.emailNotifications ?? true,
      pushNotifications: preferences.pushNotifications ?? false,
      smsNotifications: preferences.smsNotifications ?? false,
      notificationFrequency: preferences.notificationFrequency || 'realtime',
      digestTime: preferences.digestTime || '09:00',
      
      // Security
      twoFactorAuth: preferences.twoFactorEnabled ?? false,
      sessionTimeout: preferences.sessionTimeout || 30,
      ipWhitelist: preferences.ipWhitelist || [],
      apiRateLimit: user.organization?.apiRateLimit || 1000,
      
      // AI Settings
      defaultModel: preferences.defaultModel || 'gpt-4o-mini',
      autoOptimize: preferences.autoOptimize ?? true,
      streamResponses: preferences.streamResponses ?? true,
      saveHistory: preferences.saveHistory ?? true,
      contextWindow: preferences.contextWindow || 8000,
      temperature: preferences.temperature || 0.7,
      maxTokens: preferences.maxTokens || 4000,
      
      // Billing
      billingEmail: user.organization?.billingEmail || user.email,
      invoiceFrequency: user.organization?.invoiceFrequency || 'monthly',
      paymentMethod: user.organization?.paymentMethod || 'card',
      spendingLimit: user.organization?.spendingLimit || 1000,
      alertThreshold: user.organization?.alertThreshold || 80,
      
      // Team
      allowInvites: user.organization?.allowInvites ?? true,
      defaultRole: user.organization?.defaultRole || 'viewer',
      requireApproval: user.organization?.requireApproval ?? true,
      maxMembers: user.organization?.maxMembers || 10,
      
      // Advanced
      debugMode: preferences.debugMode ?? false,
      telemetry: preferences.telemetry ?? true,
      betaFeatures: preferences.betaFeatures ?? false,
      customEndpoint: preferences.customEndpoint || '',
      webhookUrl: preferences.webhookUrl || ''
    }

    return NextResponse.json(settings)

  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/settings - Update user settings
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organization: true,
        preferences: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user preferences
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      update: {
        theme: body.theme,
        language: body.language,
        timezone: body.timezone,
        dateFormat: body.dateFormat,
        currency: body.currency,
        emailNotifications: body.emailNotifications,
        pushNotifications: body.pushNotifications,
        smsNotifications: body.smsNotifications,
        notificationFrequency: body.notificationFrequency,
        digestTime: body.digestTime,
        twoFactorEnabled: body.twoFactorAuth,
        sessionTimeout: body.sessionTimeout,
        ipWhitelist: body.ipWhitelist,
        defaultModel: body.defaultModel,
        autoOptimize: body.autoOptimize,
        streamResponses: body.streamResponses,
        saveHistory: body.saveHistory,
        contextWindow: body.contextWindow,
        temperature: body.temperature,
        maxTokens: body.maxTokens,
        debugMode: body.debugMode,
        telemetry: body.telemetry,
        betaFeatures: body.betaFeatures,
        customEndpoint: body.customEndpoint,
        webhookUrl: body.webhookUrl,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        theme: body.theme || 'dark',
        language: body.language || 'en',
        timezone: body.timezone || 'UTC',
        dateFormat: body.dateFormat || 'MM/DD/YYYY',
        currency: body.currency || 'USD',
        emailNotifications: body.emailNotifications ?? true,
        pushNotifications: body.pushNotifications ?? false,
        smsNotifications: body.smsNotifications ?? false,
        notificationFrequency: body.notificationFrequency || 'realtime',
        digestTime: body.digestTime || '09:00',
        twoFactorEnabled: body.twoFactorAuth ?? false,
        sessionTimeout: body.sessionTimeout || 30,
        ipWhitelist: body.ipWhitelist || [],
        defaultModel: body.defaultModel || 'gpt-4o-mini',
        autoOptimize: body.autoOptimize ?? true,
        streamResponses: body.streamResponses ?? true,
        saveHistory: body.saveHistory ?? true,
        contextWindow: body.contextWindow || 8000,
        temperature: body.temperature || 0.7,
        maxTokens: body.maxTokens || 4000,
        debugMode: body.debugMode ?? false,
        telemetry: body.telemetry ?? true,
        betaFeatures: body.betaFeatures ?? false,
        customEndpoint: body.customEndpoint || '',
        webhookUrl: body.webhookUrl || ''
      }
    })

    // Update organization settings if user is admin or super admin
    if (user.organizationId && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN')) {
      await prisma.organization.update({
        where: { id: user.organizationId },
        data: {
          billingEmail: body.billingEmail,
          invoiceFrequency: body.invoiceFrequency,
          paymentMethod: body.paymentMethod,
          spendingLimit: body.spendingLimit,
          alertThreshold: body.alertThreshold,
          allowInvites: body.allowInvites,
          defaultRole: body.defaultRole,
          requireApproval: body.requireApproval,
          maxMembers: body.maxMembers,
          apiRateLimit: body.apiRateLimit,
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Settings updated successfully'
    })

  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json({ 
      error: 'Failed to update settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}