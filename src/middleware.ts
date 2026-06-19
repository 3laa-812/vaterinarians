import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import createIntlMiddleware from 'next-intl/middleware'
import { locales } from '@/lib/i18n-navigation'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const { auth } = NextAuth(authConfig)

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: 'ar',
})

export default auth(function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const session = (req as any).auth

  // Always allow: auth API, static files, PWA files
  const isPublicFile = /\.(png|svg|ico|json|js|css|woff2?)$/.test(pathname)
  const isAuthApi = pathname.startsWith('/api/auth')
  const isLoginPage = pathname.includes('/login')

  if (isPublicFile || isAuthApi) return NextResponse.next()

  // API routes — not authenticated → 401
  if (pathname.startsWith('/api/')) {
    if (!session) {
      return NextResponse.json(
        { error: { ar: 'يجب تسجيل الدخول أولاً', en: 'Please sign in first', code: 'UNAUTHENTICATED' } },
        { status: 401 }
      )
    }
    return NextResponse.next()
  }

  // Page routes — not authenticated → redirect to login
  if (!session && !isLoginPage) {
    const locale = pathname.startsWith('/en') ? 'en' : 'ar'
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url))
  }

  // Admin routes — doctor cannot access
  if (pathname.includes('/admin') && session?.user?.role === 'DOCTOR') {
    const locale = pathname.startsWith('/en') ? 'en' : 'ar'
    return NextResponse.redirect(new URL(`/${locale}/home`, req.url))
  }

  return intlMiddleware(req as any)
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|sw.js|workbox-.*).*)'],
}
