// MobileNav — bottom navigation bar (4 items max)
// Used in: dashboard layout (mobile only)

'use client'

import Link from 'next/link'
import { usePathname } from '@/lib/i18n-navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Home, PawPrint, CalendarDays, Users, Plus } from 'lucide-react'

export function MobileNav() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()

  const navItems = [
    { href: `/${locale}/home`, Icon: Home, label: t('home'), id: 'mobile-nav-home' },
    { href: `/${locale}/animals`, Icon: PawPrint, label: t('animals'), id: 'mobile-nav-animals' },
    { href: `/${locale}/session/new`, Icon: Plus, label: t('newSession'), id: 'mobile-nav-new-session', isFab: true },
    { href: `/${locale}/appointments`, Icon: CalendarDays, label: t('appointments'), id: 'mobile-nav-appointments' },
    { href: `/${locale}/owners`, Icon: Users, label: t('owners'), id: 'mobile-nav-owners' },
  ]

  function isActive(href: string) {
    return pathname.startsWith(href.replace(`/${locale}`, ''))
  }

  return (
    <nav className="md:hidden fixed bottom-0 start-0 end-0 z-40 bg-surface-container-low border-t border-outline-variant safe-bottom">
      <div className="flex relative items-center justify-around h-full">
        {navItems.map(({ href, Icon, label, id, isFab }) => 
          isFab ? (
            <div key={id} className="flex-1 flex justify-center">
              <Link
                id={id}
                href={href}
                className="absolute -top-6 flex items-center justify-center w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg hover:bg-primary/90 transition-transform active:scale-95"
              >
                <Icon size={28} />
              </Link>
            </div>
          ) : (
            <Link
              key={id}
              id={id}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                isActive(href)
                  ? 'text-primary'
                  : 'text-on-surface-variant'
              }`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        )}
      </div>
    </nav>
  )
}
