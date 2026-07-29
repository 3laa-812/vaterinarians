// NextAuth v5 config — JWT strategy with CredentialsProvider

import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './db'
import { authConfig } from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { clinic: { select: { id: true, name: true } } },
        })

        if (!user) return null

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password,
        )

        if (!passwordMatch) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          clinicId: user.clinicId,
          preferredLang: user.preferredLang,
        }
      },
    }),
    Credentials({
      id: 'guardian-qr',
      name: 'Guardian QR',
      credentials: {
        token: { label: 'QR Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null

        try {
          // Dynamic import because auth.ts might run in Edge (middleware)
          // Actually next-auth/providers are usually fine, but crypto module isn't.
          const { validateGuardianToken } = await import('./guardian-auth-qr')
          
          const owner = await validateGuardianToken(credentials.token as string)
          
          return {
            id: owner.id,
            name: owner.name,
            email: owner.email || '',
            role: 'GUARDIAN',
            clinicId: owner.clinicId,
            preferredLang: 'ar',
          }
        } catch (e) {
          console.error("QR Auth Error:", e)
          return null
        }
      },
    }),
  ],
})
