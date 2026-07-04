// LangToggle — AR / EN switcher. Saves preference to DB when signed in.
'use client'

import { useLocale } from 'next-intl'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from '@/lib/i18n-navigation'

interface LangToggleProps {
  compact?: boolean
}

export function LangToggle({ compact }: LangToggleProps) {
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

  if (compact) {
    return (
      <button
        id="lang-toggle-compact"
        onClick={toggle}
        aria-label="Switch language"
        className="w-[34px] h-[34px] flex items-center justify-center rounded-full bg-surface-container border border-outline-variant text-xs font-bold text-on-surface hover:border-outline transition-all"
      >
        {locale === 'ar' ? 'AR' : 'EN'}
      </button>
    )
  }

  return (
    <button
      id="lang-toggle"
      onClick={toggle}
      aria-label="Switch language"
      className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-outline transition-all flex items-center gap-2"
    >
      <span className="hidden md:inline">{locale === 'ar' ? 'English' : 'العربية'}</span>
      <span className="md:hidden">{locale === 'ar' ? 'EN' : 'ع'}</span>
    </button>
  )
}
