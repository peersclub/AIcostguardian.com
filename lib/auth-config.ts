import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '@/lib/prisma'

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
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false
      
      return true
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
        
        // Fetch user from database to get role and organization
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { organization: true }
        })
        
        if (dbUser) {
          token.role = dbUser.role
          token.organizationId = dbUser.organizationId
          token.organization = dbUser.organization
          token.company = dbUser.company || getCompanyFromDomain(dbUser.email)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.organizationId = token.organizationId as string
        session.user.organization = token.organization as any
        session.user.company = token.company as string
        session.user.isEnterpriseUser = isEnterpriseEmail(session.user.email || '')
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt', // Use JWT for now, database sessions have issues with middleware
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}