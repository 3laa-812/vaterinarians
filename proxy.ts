// Route protection + locale redirect middleware
// Runs on every request except static files and NextAuth internals

import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import createIntlMiddleware from 'next-intl/middleware'
import { locales } from '@/lib/i18n-navigation'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: 'ar',
})

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const isPublicFile = /\.(png|svg|ico|json|js|css|woff2?)$/.test(pathname)
  const isAuthApi = pathname.startsWith('/api/auth')
  const isCronApi = pathname.startsWith('/api/cron')
  const isGuardianApi = pathname.startsWith('/api/guardian')
  const isGuardianPage = pathname.includes('/guardian')
  const isLoginPage = pathname.includes('/login')

  if (isPublicFile || isAuthApi || isCronApi || isGuardianApi) return NextResponse.next()

  if (pathname.startsWith('/api/')) {
    if (!session) {
      return NextResponse.json(
        {
          error: {
            ar: 'يجب تسجيل الدخول أولاً',
            en: 'Please sign in first',
            code: 'UNAUTHENTICATED',
          },
        },
        { status: 401 },
      )
    }
    return NextResponse.next()
  }

  if (!session && !isLoginPage && !isGuardianPage) {
    const locale = pathname.startsWith('/en') ? 'en' : 'ar'
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url))
  }

  if (pathname.includes('/admin') && session?.user?.role === 'DOCTOR') {
    const locale = pathname.startsWith('/en') ? 'en' : 'ar'
    return NextResponse.redirect(new URL(`/${locale}/home`, req.url))
  }

  return intlMiddleware(req)
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|sw.js|workbox-.*).*)'],
}
