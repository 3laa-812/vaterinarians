// TypeScript augmentation for NextAuth session — adds role, clinicId, preferredLang

import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: 'SUPER_ADMIN' | 'CLINIC_ADMIN' | 'DOCTOR' | 'GUARDIAN'
      clinicId: string | null
      preferredLang: 'ar' | 'en'
    }
  }
}
