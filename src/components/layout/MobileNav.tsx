'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from '@/lib/i18n-navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'

import { 
  Home, 
  PawPrint, 
  CalendarDays, 
  User, 
  Plus, 
  ClipboardList, 
  Users, 
  Menu,
  DollarSign,
  Store,
  Settings,
  X,
  FileText
} from 'lucide-react'

export function MobileNav() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  const isAdmin =
    session?.user.role === 'SUPER_ADMIN' ||
    session?.user.role === 'CLINIC_ADMIN'
  const isSuperAdmin = session?.user.role === 'SUPER_ADMIN'

  const mainItems: Array<{ href?: string; Icon: React.ElementType; label: string; id: string; isFab?: boolean; isMenuToggle?: boolean }> = [
    { href: `/${locale}/home`, Icon: Home, label: t('home'), id: 'mobile-nav-home' },
    { href: `/${locale}/animals`, Icon: PawPrint, label: t('animals'), id: 'mobile-nav-animals' },
    { href: `/${locale}/session/new`, Icon: Plus, label: t('newSession'), id: 'mobile-nav-new-session', isFab: true },
    { href: `/${locale}/appointments`, Icon: CalendarDays, label: t('appointments'), id: 'mobile-nav-appointments' },
    { isMenuToggle: true, Icon: Menu, label: t('more'), id: 'mobile-nav-menu' },
  ]

  const menuItems = [
    { href: `/${locale}/store`, Icon: Store, label: t('store'), id: 'menu-store' },
    { href: `/${locale}/sessions`, Icon: ClipboardList, label: t('sessions', { fallback: 'Sessions' }), id: 'menu-sessions' },
    { href: `/${locale}/owners`, Icon: Users, label: t('owners'), id: 'menu-owners' },
    { href: `/${locale}/profile`, Icon: User, label: t('profile'), id: 'menu-profile' },
  ]

  if (isAdmin) {
    menuItems.push({ href: `/${locale}/finance`, Icon: DollarSign, label: t('finance', { fallback: 'Finance' }), id: 'menu-finance' })
    menuItems.push({ href: `/${locale}/invoices`, Icon: FileText, label: t('invoices', { fallback: 'Invoices' }), id: 'menu-invoices' })
    menuItems.push({ href: `/${locale}/admin/doctors`, Icon: Settings, label: t('doctors', { fallback: 'Doctors' }), id: 'menu-admin-doctors' })
  }

  if (isSuperAdmin) {
    menuItems.push({ href: `/${locale}/admin/clinics`, Icon: Settings, label: t('admin'), id: 'menu-admin-clinics' })
  }

  function isActive(href: string) {
    return pathname.startsWith(href.replace(`/${locale}`, ''))
  }

  return (
    <>
      <nav className="md:hidden fixed bottom-0 start-0 end-0 z-40 bg-surface-container-low border-t border-outline-variant safe-bottom">
        <div className="flex relative items-center justify-around h-[64px]">
          {mainItems.map(({ href, Icon, label, id, isFab, isMenuToggle }) => 
            isFab ? (
              <div key={id} className="flex-1 flex justify-center h-full items-start">
                <Link
                  id={id}
                  href={href!}
                  className="absolute -top-5 flex items-center justify-center w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg shadow-primary/50 hover:bg-primary/90 transition-transform active:scale-95 z-50"
                >
                  <Icon size={28} />
                </Link>
              </div>
            ) : isMenuToggle ? (
              <button
                key={id}
                id={id}
                onClick={() => setMenuOpen(true)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors ${
                  menuOpen ? 'text-primary' : 'text-on-surface-variant'
                }`}
              >
                <Icon size={22} className="shrink-0" />
                <span className="text-[10px] font-medium truncate w-full text-center px-0.5">{label}</span>
              </button>
            ) : (
              <Link
                key={id}
                id={id}
                href={href!}
                className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors ${
                  isActive(href!)
                    ? 'text-primary'
                    : 'text-on-surface-variant'
                }`}
              >
                <Icon size={22} className="shrink-0" />
                <span className="text-[10px] font-medium truncate w-full text-center px-0.5">{label}</span>
              </Link>
            )
          )}
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="relative bg-surface-container-low rounded-t-[24px] shadow-xl animate-in slide-in-from-bottom duration-300">
            <div className="p-4 safe-bottom">
              <div className="flex justify-between items-center mb-6 px-2">
                <h2 className="text-xl font-bold text-on-surface">{t('more', { fallback: 'More Menu' })}</h2>
                <button onClick={() => setMenuOpen(false)} aria-label={t('close', { fallback: 'Close' })} className="p-2 bg-surface-container rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 pb-8">
                {menuItems.map(({ href, Icon, label, id }) => (
                  <Link
                    key={id}
                    id={id}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 p-4 rounded-2xl transition-colors ${
                      isActive(href)
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <Icon size={24} className={isActive(href) ? 'text-primary' : 'text-on-surface-variant'} />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
