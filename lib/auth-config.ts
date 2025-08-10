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
        token.email = user.email
        token.name = user.name
        token.image = user.image
        
        // Always fetch or create user from database
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { organization: true }
        })
        
        // Auto-create user if doesn't exist
        if (!dbUser) {
          const company = user.email?.split('@')[1]?.split('.')[0] || 'default'
          
          // Find or create organization
          let organization = await prisma.organization.findFirst({
            where: { 
              OR: [
                { name: company },
                { domain: user.email?.split('@')[1] }
              ]
            }
          })
          
          if (!organization) {
            organization = await prisma.organization.create({
              data: {
                name: company,
                domain: user.email?.split('@')[1] || '',
                subscription: 'FREE',
              }
            })
          }
          
          dbUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name || user.email?.split('@')[0],
              company,
              role: 'USER',
              organizationId: organization.id,
            },
            include: { organization: true }
          })
        }
        
        // Always use database user ID
        token.id = dbUser.id
        token.role = dbUser.role
        token.organizationId = dbUser.organizationId
        token.organization = dbUser.organization
        token.company = dbUser.company || getCompanyFromDomain(dbUser.email)
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const user = session.user as any
        user.id = token.id as string
        user.role = token.role as string
        user.organizationId = token.organizationId as string
        user.organization = token.organization as any
        user.company = token.company as string
        user.isEnterpriseUser = isEnterpriseEmail(user.email || '')
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