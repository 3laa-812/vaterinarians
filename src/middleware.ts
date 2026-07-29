import createMiddleware from 'next-intl/middleware'
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

const { auth } = NextAuth(authConfig)
import { locales } from '@/lib/i18n-navigation'
import { NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'ar',
  localePrefix: 'as-needed'
})

export default auth((req) => {
  const { nextUrl } = req
  const pathname = nextUrl.pathname

  // Strip locale for easier matching
  const pathWithoutLocale = pathname.replace(/^\/(ar|en)/, '') || '/'

  // Dashboard / Admin routes
  const isDashboardRoute = [
    '/admin', '/animals', '/appointments', '/finance', 
    '/home', '/invoices', '/owners', '/profile', 
    '/session', '/sessions', '/store' // store admin management
  ].some(route => pathWithoutLocale.startsWith(route))

  if (isDashboardRoute) {
    // Requires ADMIN, CLINIC_ADMIN, or DOCTOR
    if (!req.auth || req.auth.user.role === 'GUARDIAN') {
      const loginUrl = new URL(`/ar/login`, req.url)
      loginUrl.searchParams.set('callbackUrl', req.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Guardian routes
  if (pathWithoutLocale.startsWith('/guardian')) {
    // Exempt login and store from guardian auth
    const isPublicGuardianRoute = 
      pathWithoutLocale.startsWith('/guardian/login') || 
      pathWithoutLocale === '/guardian/store' || 
      pathWithoutLocale.startsWith('/guardian/store/');
      
    if (!isPublicGuardianRoute) {
      if (!req.auth || req.auth.user.role !== 'GUARDIAN') {
        const loginUrl = new URL(`/ar/guardian/login`, req.url)
        loginUrl.searchParams.set('callbackUrl', req.url)
        return NextResponse.redirect(loginUrl)
      }
    }
  }

  return intlMiddleware(req)
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}
