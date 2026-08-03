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
  UserCog,
  Syringe,
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
          { href: `/${locale}/finance`, Icon: DollarSign, label: t('finance', { fallback: 'Finance' }), id: 'nav-finance', isManagement: true },
          { href: `/${locale}/invoices`, Icon: FileText, label: tSidebar('invoices', { fallback: 'Invoices' }), id: 'nav-invoices', isManagement: true },
          { href: `/${locale}/admin/doctors`, Icon: UserCog, label: t('doctors', { fallback: 'Doctors' }), id: 'nav-admin-doctors', isManagement: true },
          { href: `/${locale}/settings/vaccines`, Icon: Syringe, label: t('vaccines', { fallback: 'Vaccines Catalog' }), id: 'nav-admin-vaccines', isManagement: true },
          ...(isSuperAdmin ? [{ href: `/${locale}/admin/clinics`, Icon: Settings, label: t('admin'), id: 'nav-admin', isManagement: true }] : [])
        ]
      : []),
  ]

  const mainNavItems = navItems.filter((item) => !('isManagement' in item))
  const managementNavItems = navItems.filter((item) => 'isManagement' in item)

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
      className={`hidden md:flex flex-col shrink-0 h-screen sticky top-0 border-e border-outline-variant bg-surface-container-low transition-all duration-300 ${
        sidebarExpanded ? 'w-[260px]' : 'w-[72px]'
      }`}
    >
      <div
        className={`h-16 shrink-0 flex items-center border-b border-outline-variant/50 ${
          sidebarExpanded ? 'px-5 justify-between' : 'justify-center'
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

      <nav className="flex-1 py-4 overflow-y-auto flex flex-col px-3">
        <div className="space-y-1">
          {mainNavItems.map(({ href, Icon, label, id, isPrimaryAction }) => {
            const active = isActive(href)
            
            if (isPrimaryAction) {
              return (
                <div key={id} className="mb-6 mt-2">
                  <Link
                    id={id}
                    href={href}
                    title={!sidebarExpanded ? label : undefined}
                    className={`flex items-center justify-center gap-2 rounded-2xl bg-primary text-on-primary font-bold transition-all active:scale-95 shadow-md shadow-primary/20 ${
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
              <div key={id} className="mb-1">
                <Link
                  id={id}
                  href={href}
                  title={!sidebarExpanded ? label : undefined}
                  className={`group flex items-center gap-3 px-2 py-2 rounded-xl transition-all ${
                    active
                      ? 'bg-surface-container-high/60 text-on-surface shadow-sm ring-1 ring-inset ring-outline-variant'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    active 
                      ? 'bg-primary text-on-primary shadow-sm' 
                      : 'bg-surface-container-lowest border border-outline-variant/40 group-hover:border-outline-variant group-hover:text-primary'
                  }`}>
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                  {sidebarExpanded && (
                    <span className="text-sm font-medium truncate">{label}</span>
                  )}
                </Link>
              </div>
            )
          })}
        </div>

        {managementNavItems.length > 0 && (
          <div className="pt-6 pb-2 space-y-1">
            {sidebarExpanded && (
              <div className="px-2 pb-2 text-[10px] font-bold text-on-surface-variant/70 tracking-widest uppercase flex items-center gap-3">
                <span>Management</span>
                <div className="h-px flex-1 bg-outline-variant/50" />
              </div>
            )}
            {!sidebarExpanded && (
              <div className="w-8 mx-auto h-px bg-outline-variant/50 mb-4" />
            )}
            
            {managementNavItems.map(({ href, Icon, label, id }) => {
              const active = isActive(href)
              return (
                <div key={id} className="mb-1">
                  <Link
                    id={id}
                    href={href}
                    title={!sidebarExpanded ? label : undefined}
                    className={`group flex items-center gap-3 px-2 py-2 rounded-xl transition-all ${
                      active
                        ? 'bg-surface-container-high/60 text-on-surface shadow-sm ring-1 ring-inset ring-outline-variant'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      active 
                        ? 'bg-surface-container-highest text-on-surface border border-outline shadow-sm' 
                        : 'bg-surface-container-lowest border border-outline-variant/40 group-hover:border-outline-variant group-hover:text-on-surface'
                    }`}>
                      <Icon size={18} strokeWidth={1.5} />
                    </div>
                    {sidebarExpanded && (
                      <span className="text-sm font-medium truncate">{label}</span>
                    )}
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </nav>

      {session?.user && (
        <div className="shrink-0 border-t border-outline-variant/50 p-3 bg-surface-container-lowest/30">
          <div className={`flex items-center gap-3 w-full ${!sidebarExpanded && 'justify-center'}`}>
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-primary/80 to-primary-container flex items-center justify-center text-on-primary font-bold shadow-sm border border-primary/20">
              {session.user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            {sidebarExpanded && (
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="text-sm font-bold text-on-surface truncate">
                  {session.user.name}
                </span>
                <span className="text-[11px] font-medium text-on-surface-variant truncate">
                  {isSuperAdmin
                    ? `${clinics?.length || 0} عيادات نشطة`
                    : clinicSettings?.name || 'Veterinary Clinic'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
