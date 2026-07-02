// LangToggle — AR / EN switcher. Saves preference to DB when signed in.
'use client'

import { useLocale } from 'next-intl'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from '@/lib/i18n-navigation'

export function LangToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()

  async function toggle() {
    const newLocale = locale === 'ar' ? 'en' : 'ar'

    if (session?.user) {
      await fetch('/api/auth/language', {
        method: 'PATCH',
        body: JSON.stringify({ lang: newLocale }),
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (typeof window !== 'undefined') {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
      window.location.href = window.location.pathname.replace(/^\/(ar|en)/, `/${newLocale}`) + window.location.search
    }
  }

  return (
    <button
      id="lang-toggle"
      onClick={toggle}
      aria-label="Switch language"
      className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-outline transition-all"
    >
      {locale === 'ar' ? 'EN' : 'ع'}
    </button>
  )
}
