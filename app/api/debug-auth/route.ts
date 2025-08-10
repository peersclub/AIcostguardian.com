import { NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export async function GET() {
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
  
  return NextResponse.json({
    message: "Copy these EXACT values to Google Cloud Console",
    step1: "Go to: https://console.cloud.google.com/apis/credentials",
    step2: "Click on your OAuth 2.0 Client ID",
    step3: "Add these EXACTLY as shown (no modifications!):",
    settings: {
      "Authorized JavaScript origins": [
        "http://localhost:3000"
      ],
      "Authorized redirect URIs": [
        "http://localhost:3000/api/auth/callback/google"
      ]
    },
    currentConfig: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "Not set",
      expectedCallbackUrl: redirectUri
    },
    troubleshooting: [
      "1. Make sure there are NO trailing slashes",
      "2. Make sure it's http:// not https://",
      "3. Make sure the port is :3000",
      "4. Clear browser cache after updating Google Console",
      "5. Wait 2-3 minutes for Google to update"
    ]
  }, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}