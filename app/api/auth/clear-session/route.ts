import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export async function GET() {
  // Clear all auth-related cookies
  const cookieStore = cookies()
  
  // List of possible NextAuth cookie names
  const authCookies = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.callback-url',
    '__Secure-next-auth.callback-url',
    'next-auth.csrf-token',
    '__Secure-next-auth.csrf-token',
  ]
  
  authCookies.forEach(cookieName => {
    cookieStore.delete(cookieName)
  })
  
  return NextResponse.redirect(new URL('/auth/signin', process.env.NEXTAUTH_URL))
}