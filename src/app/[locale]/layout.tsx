// Locale layout — sets lang + dir on <html>, wraps with NextIntlClientProvider
// This is the outermost layout for all /[locale]/* routes

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Cairo, Inter } from 'next/font/google'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import '../globals.css'

const locales = ['ar', 'en']

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
  themeColor: '#14B8A6',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  console.log('DEBUG LOCALE:', locale)

  if (!locales.includes(locale)) {
    console.log('CALLING NOTFOUND BECAUSE', locale, 'NOT IN', locales)
    notFound()
  }

  const messages = await getMessages()
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${cairo.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full bg-[#0C0E14] text-[#F9FAFB] antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
