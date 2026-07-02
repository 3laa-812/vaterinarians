// Root layout — required <html>/<body> wrapper for all routes.
// Locale-specific lang/dir are resolved via next-intl on each request.

import type { Metadata, Viewport } from 'next'
import { Cairo, Inter } from 'next/font/google'
import { cookies } from 'next/headers'
import './globals.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'نظام العيادة البيطرية',
  description: 'نظام متابعة المرضى والمواعيد البيطرية',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#14B8A6',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const nextLocale = cookieStore.get('NEXT_LOCALE')?.value
  const locale = nextLocale === 'en' ? 'en' : 'ar'
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${cairo.variable} ${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[#0C0E14] text-[#F9FAFB] antialiased">
        {children}
      </body>
    </html>
  )
}
