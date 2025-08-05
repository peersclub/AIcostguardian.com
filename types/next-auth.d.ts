import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      company: string
      isEnterpriseUser: boolean
    }
  }

  interface User {
    id: string
    company: string
    isEnterpriseUser: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    company: string
    isEnterpriseUser: boolean
  }
}