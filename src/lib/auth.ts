// NextAuth v5 config — JWT strategy with CredentialsProvider

import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './db'
import { authConfig } from './auth.config'
import { logger } from '@/lib/logger';

async function checkRateLimit(key: string): Promise<boolean> {
  const now = new Date()
  const record = await prisma.loginAttempt.findUnique({ where: { identifier: key } })
  
  if (!record || record.resetAt < now) {
    await prisma.loginAttempt.upsert({
      where: { identifier: key },
      update: { attempts: 1, resetAt: new Date(now.getTime() + 15 * 60 * 1000) },
      create: { identifier: key, attempts: 1, resetAt: new Date(now.getTime() + 15 * 60 * 1000) }
    })
    return true
  }
  
  if (record.attempts >= 5) return false
  
  await prisma.loginAttempt.update({
    where: { identifier: key },
    data: { attempts: record.attempts + 1 }
  })
  
  return true
}

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

        const key = `login:${credentials.email}`
        const isAllowed = await checkRateLimit(key)
        if (!isAllowed) {
          logger.warn(`Rate limit exceeded for ${key}`)
          return null
        }

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

        const key = `qr:${credentials.token}`
        const isAllowed = await checkRateLimit(key)
        if (!isAllowed) {
          logger.warn(`Rate limit exceeded for ${key}`)
          return null
        }

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
          logger.error("QR Auth Error:", e)
          return null
        }
      },
    }),
  ],
})
