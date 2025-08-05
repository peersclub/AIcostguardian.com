import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

// List of blocked domains (consumer email providers)
const BLOCKED_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'mail.com',
  'protonmail.com'
]

// Helper function to validate enterprise email domains
function isEnterpriseEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return !BLOCKED_DOMAINS.includes(domain)
}

// Helper function to extract company name from domain
function getCompanyFromDomain(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return 'Unknown'
  
  // Remove common TLD and convert to title case
  const company = domain.split('.')[0]
  return company.charAt(0).toUpperCase() + company.slice(1)
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only allow enterprise email domains (not consumer emails)
      if (user.email) {
        if (!isEnterpriseEmail(user.email)) {
          console.log(`Blocked consumer email domain: ${user.email}`)
          // Redirect to error page with message
          return '/auth/error?error=InvalidDomain'
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user && account) {
        token.id = user.id
        token.company = getCompanyFromDomain(user.email || '')
        token.isEnterpriseUser = isEnterpriseEmail(user.email || '')
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.company = token.company as string
        session.user.isEnterpriseUser = token.isEnterpriseUser as boolean
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
}