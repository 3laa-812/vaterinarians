// NextAuth v5 config — JWT strategy with CredentialsProvider
// Also exports: requireAuth() and clinicScope() helpers used in every API route

import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './db'
import { authConfig } from './auth.config'
import type { Session } from 'next-auth'

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
  ],
})

// ── requireAuth ───────────────────────────────────────────────────────────────
// Called at the top of every API route handler.
// Returns { session } on success, or { error, status } to return immediately.

export async function requireAuth(roles?: string[]) {
  const session = await auth()

  if (!session?.user) {
    return {
      error: {
        ar: 'يجب تسجيل الدخول أولاً',
        en: 'Please sign in first',
        code: 'UNAUTHENTICATED',
      },
      status: 401,
    }
  }

  if (roles && !roles.includes(session.user.role)) {
    return {
      error: {
        ar: 'غير مصرح لك بهذا الإجراء',
        en: 'You are not authorized for this action',
        code: 'FORBIDDEN',
      },
      status: 403,
    }
  }

  return { session }
}

// ── clinicScope ───────────────────────────────────────────────────────────────
// Appends clinicId filter to any Prisma where clause.
// Super Admin sees all clinics. Everyone else sees only their own.

export function clinicScope(session: Session) {
  if (session.user.role === 'SUPER_ADMIN') return {}
  return { clinicId: session.user.clinicId as string }
}

