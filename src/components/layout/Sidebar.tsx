// Sidebar — desktop navigation with icon-collapsed (72px) and expanded (240px) states
// Used in: dashboard layout (desktop only — MobileNav handles mobile)

'use client'

import Link from 'next/link'
import { usePathname } from '@/lib/i18n-navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useUIStore } from '@/store/ui.store'
import { useSession } from 'next-auth/react'
import { useClinicSettings } from '@/hooks/useClinicSettings'
import { useAdminClinics } from '@/hooks/useAdmin'
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
  ClipboardList,
  DollarSign,
  FileText,
  Store,
} from 'lucide-react'

export function Sidebar() {
  const t = useTranslations('nav')
  const tSidebar = useTranslations('sidebar')
  const locale = useLocale()
  const pathname = usePathname()
  const { sidebarExpanded, toggleSidebar } = useUIStore()
  const { data: session } = useSession()

  const isSuperAdmin = session?.user.role === 'SUPER_ADMIN'
  const { data: clinicSettings } = useClinicSettings(!isSuperAdmin)
  const { data: clinics } = useAdminClinics(isSuperAdmin)

  const isRTL = locale === 'ar'
  const isAdmin =
    session?.user.role === 'SUPER_ADMIN' ||
    session?.user.role === 'CLINIC_ADMIN'

  const navItems = [
    { href: `/${locale}/home`, Icon: Home, label: t('home'), id: 'nav-home' },
    { href: `/${locale}/session/new`, Icon: Plus, label: t('newSession'), id: 'nav-new-session', isPrimaryAction: true },
    { href: `/${locale}/animals`, Icon: PawPrint, label: t('animals'), id: 'nav-animals' },
    { href: `/${locale}/appointments`, Icon: CalendarDays, label: t('appointments'), id: 'nav-appointments' },
    { href: `/${locale}/sessions`, Icon: ClipboardList, label: t('sessions', { fallback: 'Sessions' }), id: 'nav-sessions' },
    { href: `/${locale}/owners`, Icon: Users, label: t('owners'), id: 'nav-owners' },
    { href: `/${locale}/store`, Icon: Store, label: t('store', { fallback: 'Store' }), id: 'nav-store' },
    ...(isAdmin
      ? [
          { href: `/${locale}/finance`, Icon: DollarSign, label: t('finance', { fallback: 'Finance' }), id: 'nav-finance' },
          { href: `/${locale}/invoices`, Icon: FileText, label: tSidebar('invoices', { fallback: 'Invoices' }), id: 'nav-invoices' },
          { href: `/${locale}/admin/doctors`, Icon: Settings, label: t('doctors', { fallback: 'Doctors' }), id: 'nav-admin-doctors' },
          ...(isSuperAdmin ? [{ href: `/${locale}/admin/clinics`, Icon: Settings, label: t('admin'), id: 'nav-admin' }] : [])
        ]
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
        {navItems.map(({ href, Icon, label, id, isPrimaryAction }) => {
          const active = isActive(href)
          
          if (isPrimaryAction) {
            return (
              <div key={id} className="px-3 mb-6 mt-2">
                <Link
                  id={id}
                  href={href}
                  title={!sidebarExpanded ? label : undefined}
                  className={`flex items-center justify-center gap-2 rounded-2xl bg-primary text-on-primary font-bold transition-all active:scale-95 shadow-lg shadow-primary/40 ${
                    sidebarExpanded ? 'py-3' : 'py-3 aspect-square'
                  }`}
                >
                  <Icon size={sidebarExpanded ? 18 : 20} strokeWidth={sidebarExpanded ? 2.5 : 2} />
                  {sidebarExpanded && <span>{label}</span>}
                </Link>
              </div>
            )
          }

          // Standard items
          return (
            <div key={id} className="px-2 mb-1">
              <Link
                id={id}
                href={href}
                title={!sidebarExpanded ? label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  active
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <Icon size={20} className={active ? 'text-primary' : 'text-on-surface-variant'} />
                {sidebarExpanded && (
                  <span className="text-sm truncate">{label}</span>
                )}
              </Link>
            </div>
          )
        })}
      </nav>

      {sidebarExpanded && session?.user && (
        <div className="border-t border-outline-variant p-4">
          <p className="text-xs text-on-surface-variant truncate">
            {isSuperAdmin
              ? `${clinics?.length || 0} عيادات نشطة`
              : clinicSettings?.name || '...'}
          </p>
        </div>
      )}
    </aside>
  )
}
