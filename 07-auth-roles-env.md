# Auth, Roles & Environment

---

## Authentication — NextAuth.js v5

### Strategy
JWT-based sessions. No database sessions — stateless, fast, works well with edge middleware.

### Login Flow
```
Doctor opens /ar/login
  │
  ▼
Enters email + password
  │
  ▼
NextAuth CredentialsProvider:
  → Query DB: find user by email
  → bcrypt.compare(password, user.password)
  → If match: return user object
  → If no match: return null → "البريد الإلكتروني أو كلمة المرور غير صحيحة"
  │
  ▼
JWT created with:
  { id, name, email, role, clinicId, preferredLang }
  │
  ▼
Redirect to /[preferredLang]/home
```

### NextAuth Config

```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

export const { handlers, auth, signIn, signOut } = NextAuth({
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
          include: { clinic: { select: { id: true, name: true } } }
        })

        if (!user) return null

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
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
      }
    })
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.clinicId = user.clinicId
        token.preferredLang = user.preferredLang
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      session.user.clinicId = token.clinicId as string | null
      session.user.preferredLang = token.preferredLang as string
      return session
    }
  },

  pages: {
    signIn: '/ar/login',      // default to Arabic login page
    error: '/ar/login',
  },

  session: { strategy: 'jwt' },
})
```

### Session Type Augmentation

```typescript
// src/types/next-auth.d.ts
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: 'SUPER_ADMIN' | 'CLINIC_ADMIN' | 'DOCTOR'
      clinicId: string | null
      preferredLang: 'ar' | 'en'
    }
  }
}
```

---

## Roles & Authorization

### Role Matrix

| Action | SUPER_ADMIN | CLINIC_ADMIN | DOCTOR |
|---|---|---|---|
| View all clinics | ✅ | ❌ | ❌ |
| Create / delete clinic | ✅ | ❌ | ❌ |
| View own clinic | ✅ | ✅ | ✅ |
| Add doctors to own clinic | ✅ | ✅ | ❌ |
| View all animals in clinic | ✅ | ✅ | ❌ |
| View own patients only | ✅ | ✅ | ✅ |
| Create animal | ✅ | ✅ | ✅ |
| Edit animal | ✅ | ✅ | ✅ (own) |
| Delete animal | ✅ | ✅ | ❌ |
| Create / edit session | ✅ | ✅ | ✅ (own) |
| View payments | ✅ | ✅ | ✅ (own) |
| Edit payments | ✅ | ✅ | ✅ (own) |

> **"own"** = doctor can only act on animals/appointments assigned to them.

### Middleware — Route Protection

```typescript
// middleware.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Public routes — no auth needed
  const publicPaths = ['/ar/login', '/en/login', '/api/auth']
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Not authenticated → redirect to login
  if (!session) {
    const locale = pathname.startsWith('/en') ? 'en' : 'ar'
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url))
  }

  // Admin routes — DOCTOR cannot access
  if (pathname.includes('/admin') && session.user.role === 'DOCTOR') {
    return NextResponse.redirect(
      new URL(`/${session.user.preferredLang}/home`, req.url)
    )
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)']
}
```

### API Route — Auth Helper

```typescript
// src/lib/auth.ts — helper used in every API route

export async function requireAuth(roles?: string[]) {
  const session = await auth()

  if (!session?.user) {
    return {
      error: { ar: 'يجب تسجيل الدخول أولاً', en: 'Please sign in first', code: 'UNAUTHENTICATED' },
      status: 401
    }
  }

  if (roles && !roles.includes(session.user.role)) {
    return {
      error: { ar: 'غير مصرح لك بهذا الإجراء', en: 'You are not authorized', code: 'FORBIDDEN' },
      status: 403
    }
  }

  return { session }
}

// Usage in any API route:
// const { session, error, status } = await requireAuth(['SUPER_ADMIN', 'CLINIC_ADMIN'])
// if (error) return Response.json({ error }, { status })
```

### Clinic Scoping Helper

```typescript
// src/lib/auth.ts

// Appends clinicId filter to any Prisma query automatically
export function clinicScope(session: Session) {
  if (session.user.role === 'SUPER_ADMIN') return {}     // no filter
  return { clinicId: session.user.clinicId }             // filter to own clinic
}

// Usage:
// const animals = await prisma.animal.findMany({
//   where: { ...clinicScope(session), ...otherFilters }
// })
```

---

## Environment Variables

```bash
# .env.example

# ── Database ──────────────────────────────
DATABASE_URL="postgresql://user:password@host:5432/vet_clinic"

# ── NextAuth ──────────────────────────────
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="https://your-domain.vercel.app"
# Development: NEXTAUTH_URL="http://localhost:3000"

# ── Novu ──────────────────────────────────
NOVU_API_KEY="your-novu-api-key"
NOVU_APP_ID="your-novu-app-id"

# ── Cron Security ─────────────────────────
CRON_SECRET="generate-with: openssl rand -base64 32"
# Add this to Vercel environment variables
# Vercel Cron sends it as: Authorization: Bearer <CRON_SECRET>

# ── App ───────────────────────────────────
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

### Vercel Environment Setup

```
Production:
  DATABASE_URL         → Railway PostgreSQL connection string
  NEXTAUTH_SECRET      → generated secret
  NEXTAUTH_URL         → https://your-app.vercel.app
  NOVU_API_KEY         → from Novu dashboard
  NOVU_APP_ID          → from Novu dashboard
  CRON_SECRET          → generated secret

Preview (same as production but separate DB recommended):
  DATABASE_URL         → Railway staging DB

Development (.env.local):
  DATABASE_URL         → local PostgreSQL or Railway dev DB
  NEXTAUTH_URL         → http://localhost:3000
```

---

## Seed Script

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@vetclinic.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@vetclinic.com',
      password: await bcrypt.hash('Admin@1234', 12),
      role: 'SUPER_ADMIN',
      preferredLang: 'ar',
    }
  })

  // Demo Clinic
  const clinic = await prisma.clinic.upsert({
    where: { id: 'demo-clinic-1' },
    update: {},
    create: {
      id: 'demo-clinic-1',
      name: 'Vet Care Clinic',
      nameAr: 'عيادة فيت كير البيطرية',
      address: 'Cairo, Egypt',
      phone: '0100000000',
    }
  })

  // Demo Doctor
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@vetclinic.com' },
    update: {},
    create: {
      name: 'د. سارة أحمد',
      email: 'doctor@vetclinic.com',
      password: await bcrypt.hash('Doctor@1234', 12),
      role: 'DOCTOR',
      clinicId: clinic.id,
      preferredLang: 'ar',
    }
  })

  console.log('✅ Seed complete')
  console.log('   Super Admin: admin@vetclinic.com / Admin@1234')
  console.log('   Doctor:      doctor@vetclinic.com / Doctor@1234')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

```bash
# Run seed:
npx prisma db seed
```
