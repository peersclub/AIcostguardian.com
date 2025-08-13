import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth-config'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const providers = authOptions.providers.map((provider: any) => ({
      id: provider.id,
      name: provider.name,
      type: provider.type,
    }))

    const googleProvider = authOptions.providers[0] as any
    const clientId = googleProvider.options?.clientId || process.env.GOOGLE_CLIENT_ID
    const clientSecret = googleProvider.options?.clientSecret || process.env.GOOGLE_CLIENT_SECRET

    const envCheck = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
      GOOGLE_CLIENT_ID: clientId ? `${clientId.substring(0, 20)}...` : 'NOT SET',
      GOOGLE_CLIENT_SECRET: clientSecret ? 'SET' : 'NOT SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    }

    const callbacks = {
      signIn: authOptions.callbacks?.signIn ? 'CONFIGURED' : 'NOT CONFIGURED',
      jwt: authOptions.callbacks?.jwt ? 'CONFIGURED' : 'NOT CONFIGURED',
      session: authOptions.callbacks?.session ? 'CONFIGURED' : 'NOT CONFIGURED',
    }

    const pages = authOptions.pages || {}

    const sessionConfig = authOptions.session || {}

    const debugInfo = {
      debug: authOptions.debug || false,
      adapter: authOptions.adapter ? 'PrismaAdapter' : 'NO ADAPTER',
    }

    const callbackUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`

    return NextResponse.json({
      status: 'NextAuth Configuration Test',
      timestamp: new Date().toISOString(),
      providers,
      environment: envCheck,
      callbacks,
      pages,
      session: sessionConfig,
      debug: debugInfo,
      googleOAuthCallbackURL: callbackUrl,
      instructions: {
        step1: 'Go to https://console.cloud.google.com',
        step2: 'Select your project',
        step3: 'Go to APIs & Services > Credentials',
        step4: 'Find your OAuth 2.0 Client ID',
        step5: `Add this Authorized redirect URI: ${callbackUrl}`,
        step6: 'Save and wait a few minutes for propagation',
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to check auth configuration',
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}