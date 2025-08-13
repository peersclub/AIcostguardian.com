import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '@/lib/prisma'

// Check if we're in build phase
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

// Custom adapter with account linking fix
const customAdapter = !isBuildPhase ? {
  ...PrismaAdapter(prisma),
  linkAccount: async (account: any) => {
    // Check if user exists first
    const user = await prisma.user.findUnique({
      where: { id: account.userId }
    })
    
    if (!user) {
      throw new Error('User not found')
    }
    
    // Create the account link
    return await prisma.account.create({
      data: {
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state,
      }
    })
  }
} : undefined as any

export const authOptions: NextAuthOptions = {
  adapter: customAdapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      // Allow linking accounts with the same email
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (!user.email) return false
        
        console.log('🔐 SignIn attempt for:', user.email)
        
        // Handle OAuth account linking for existing users
        if (account?.provider === 'google') {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { accounts: true }
          })
          
          if (existingUser) {
            // Check if OAuth account is already linked
            const hasGoogleAccount = existingUser.accounts.some(
              acc => acc.provider === 'google'
            )
            
            if (!hasGoogleAccount) {
              console.log('🔗 Linking Google account to existing user:', user.email)
              // Link the OAuth account to the existing user
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                }
              })
            }
            
            console.log('✅ User authenticated:', user.email)
          }
        }
        
        // ALWAYS ALLOW SIGN IN - Remove all domain restrictions for testing
        return true
      } catch (error) {
        console.error('SignIn error:', error)
        return false
      }
    },
    async jwt({ token, user, account }) {
      try {
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
            console.log('📝 Creating new user:', user.email)
            const domain = user.email?.split('@')[1] || 'default'
            const company = domain.split('.')[0]
            
            // Find or create organization
            let organization = await prisma.organization.findFirst({
              where: { domain }
            })
            
            if (!organization) {
              organization = await prisma.organization.create({
                data: {
                  name: company.charAt(0).toUpperCase() + company.slice(1),
                  domain,
                  subscription: 'ENTERPRISE', // Give everyone ENTERPRISE for testing
                  isActive: true,
                  billingCycle: 'MONTHLY',
                  allowedProviders: ['OPENAI', 'ANTHROPIC', 'GEMINI', 'GROK', 'PERPLEXITY']
                }
              })
              console.log('🏢 Created organization:', organization.name)
            }
            
            // Create user as SUPER_ADMIN for testing
            dbUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || user.email?.split('@')[0],
                company: company.charAt(0).toUpperCase() + company.slice(1),
                role: 'SUPER_ADMIN', // Everyone gets SUPER_ADMIN for testing
                organizationId: organization.id,
              },
              include: { organization: true }
            })
            console.log('✅ Created SUPER_ADMIN user:', dbUser.email)
          } else {
            console.log('✅ Existing user:', dbUser.email, 'Role:', dbUser.role)
            
            // Upgrade to SUPER_ADMIN if not already
            if (dbUser.role !== 'SUPER_ADMIN') {
              dbUser = await prisma.user.update({
                where: { id: dbUser.id },
                data: { role: 'SUPER_ADMIN' },
                include: { organization: true }
              })
              console.log('⬆️ Upgraded to SUPER_ADMIN')
            }
          }
          
          // Always use database user ID
          token.id = dbUser.id
          token.role = dbUser.role
          token.organizationId = dbUser.organizationId
          token.organization = dbUser.organization
          token.company = dbUser.company || dbUser.organization?.name || ''
        }
      } catch (error) {
        console.error('JWT callback error:', error)
        // Return basic token without database data
        if (user) {
          token.email = user.email
          token.name = user.name
          token.image = user.image
          token.role = 'SUPER_ADMIN' // Default to SUPER_ADMIN for testing
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const user = session.user as any
        user.id = token.id as string
        user.role = token.role as string || 'SUPER_ADMIN'
        user.organizationId = token.organizationId as string
        user.organization = token.organization as any
        user.company = token.company as string
        user.isEnterpriseUser = true // Everyone is enterprise for testing
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Host-' : ''}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  debug: process.env.NODE_ENV === 'development' // Enable debug mode only in development
}