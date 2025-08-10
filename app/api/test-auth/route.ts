import { NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const callbackUrl = `${baseUrl}/api/auth/callback/google`
  
  return NextResponse.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    expectedCallbackUrl: callbackUrl,
    instructions: [
      '1. Copy the expectedCallbackUrl above',
      '2. Go to https://console.cloud.google.com',
      '3. Navigate to APIs & Services → Credentials',
      '4. Click on your OAuth 2.0 Client ID',
      '5. Add this EXACT URL to Authorized redirect URIs',
      '6. Also add the NEXTAUTH_URL to Authorized JavaScript origins',
      '7. Click SAVE and wait 2-3 minutes',
      '8. Try signing in again'
    ]
  })
}