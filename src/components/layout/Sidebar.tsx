// Sidebar — desktop navigation with icon-collapsed (72px) and expanded (240px) states
// Used in: dashboard layout (desktop only — MobileNav handles mobile)

'use client'

import Link from 'next/link'
import { usePathname } from '@/lib/i18n-navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useUIStore } from '@/store/ui.store'
import { useSession } from 'next-auth/react'
import { Logo } from '@/components/brand/Logo'
import {
  Home,
  PawPrint,
  CalendarDays,
  Users,
  Settings,
  ChevronRight,
  ChevronLeft,
  Plus,
  LineChart,
} from 'lucide-react'

export function Sidebar() {
  const t = useTranslations('nav')
  const tSidebar = useTranslations('sidebar')
  const locale = useLocale()
  const pathname = usePathname()
  const { sidebarExpanded, toggleSidebar } = useUIStore()
  const { data: session } = useSession()

  const isRTL = locale === 'ar'
  const isAdmin =
    session?.user.role === 'SUPER_ADMIN' ||
    session?.user.role === 'CLINIC_ADMIN'

  const navItems = [
    { href: `/${locale}/home`, Icon: Home, label: t('home'), id: 'nav-home' },
    { href: `/${locale}/session/new`, Icon: Plus, label: t('newSession'), id: 'nav-new-session', isPrimaryAction: true },
    { href: `/${locale}/animals`, Icon: PawPrint, label: t('animals'), id: 'nav-animals' },
    { href: `/${locale}/appointments`, Icon: CalendarDays, label: t('appointments'), id: 'nav-appointments' },
    { href: `/${locale}/owners`, Icon: Users, label: t('owners'), id: 'nav-owners' },
    { href: `/${locale}/reports`, Icon: LineChart, label: t('reports'), id: 'nav-reports' },
    ...(isAdmin
      ? [{ href: `/${locale}/admin/clinics`, Icon: Settings, label: t('admin'), id: 'nav-admin' }]
      : []),
  ]

  const ToggleIcon = sidebarExpanded
    ? isRTL
      ? ChevronRight
      : ChevronLeft
    : isRTL
      ? ChevronLeft
      : ChevronRight

  function isActive(href: string) {
    return pathname.startsWith(href.replace(`/${locale}`, ''))
  }

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 border-e border-outline-variant bg-surface-container-low transition-all duration-300 ${
        sidebarExpanded ? 'w-60' : 'w-[72px]'
      }`}
    >
      <div
        className={`h-16 flex items-center border-b border-outline-variant ${
          sidebarExpanded ? 'px-4 justify-between' : 'justify-center'
        }`}
      >
        <Link href={`/${locale}/home`} aria-label={tSidebar('home')}>
          <Logo size={32} showWordmark={sidebarExpanded} />
        </Link>

        {sidebarExpanded && (
          <button
            id="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={tSidebar('collapse')}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-lg hover:bg-surface-container"
          >
            <ToggleIcon size={18} />
          </button>
        )}
      </div>

      {!sidebarExpanded && (
        <button
          id="sidebar-toggle-collapsed"
          onClick={toggleSidebar}
          aria-label={tSidebar('expand')}
          className="h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
        >
          <ToggleIcon size={16} />
        </button>
      )}

      <nav className="flex-1 py-2">
        {navItems.map(({ href, Icon, label, id, isPrimaryAction }) => (
          <Link
            key={id}
            id={id}
            href={href}
            title={!sidebarExpanded ? label : undefined}
            className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all ${
              isPrimaryAction
                ? 'bg-primary text-on-primary shadow-sm hover:bg-primary/90 mt-2 mb-4'
                : isActive(href)
                ? 'bg-primary/10 text-primary'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <Icon size={20} className="flex-shrink-0" />
            {sidebarExpanded && (
              <span className="text-sm font-medium truncate">{label}</span>
            )}
          </Link>
        ))}
      </nav>

      {sidebarExpanded && session?.user && (
        <div className="border-t border-outline-variant p-4">
          <p className="text-xs text-on-surface-variant truncate">
            {session.user.name}
          </p>
        </div>
      )}
    </aside>
  )
}
