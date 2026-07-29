import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/ar/login',
    error: '/ar/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.clinicId = (user as any).clinicId
        token.preferredLang = (user as any).preferredLang
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as 'SUPER_ADMIN' | 'CLINIC_ADMIN' | 'DOCTOR' | 'GUARDIAN'
      session.user.clinicId = token.clinicId as string | null
      session.user.preferredLang = token.preferredLang as 'ar' | 'en'
      return session
    },
  },
  providers: [], // Providers added in auth.ts to avoid Edge runtime issues with Node APIs like bcrypt
  session: { strategy: 'jwt' },
} satisfies NextAuthConfig
