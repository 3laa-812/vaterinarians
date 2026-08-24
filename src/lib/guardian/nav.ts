import type { LucideIcon } from 'lucide-react'
import {
  Home,
  PawPrint,
  Calendar,
  Store,
  ShoppingCart,
  Package,
  Stethoscope,
  MapPin,
  Bell,
  User,
} from 'lucide-react'

export type GuardianNavItem = {
  key: string
  path: string
  labelKey: string
  icon: LucideIcon
  groupKey?: string
  badge?: 'cart'
}

export const GUARDIAN_NAV: GuardianNavItem[] = [
  { key: 'home', path: '/guardian', labelKey: 'myDashboard', icon: Home, groupKey: 'nav_home_group' },
  { key: 'pets', path: '/guardian/animals', labelKey: 'pets', icon: PawPrint, groupKey: 'nav_home_group' },
  { key: 'appt', path: '/guardian/appointments', labelKey: 'appointments', icon: Calendar, groupKey: 'nav_home_group' },
  { key: 'store', path: '/guardian/store', labelKey: 'store', icon: Store, groupKey: 'nav_shop_group' },
  { key: 'cart', path: '/guardian/cart', labelKey: 'cart', icon: ShoppingCart, groupKey: 'nav_shop_group', badge: 'cart' },
  { key: 'orders', path: '/guardian/orders', labelKey: 'orders', icon: Package, groupKey: 'nav_shop_group' },
  { key: 'doctors', path: '/guardian/doctors', labelKey: 'clinicTeam', icon: Stethoscope, groupKey: 'nav_explore_group' },
  { key: 'clinic', path: '/guardian/clinic', labelKey: 'aboutClinic', icon: MapPin, groupKey: 'nav_explore_group' },
  { key: 'notifs', path: '/guardian/notifications', labelKey: 'notifications', icon: Bell, groupKey: 'nav_account_group' },
  { key: 'account', path: '/guardian/account', labelKey: 'accountSettings', icon: User, groupKey: 'nav_account_group' },
]

/** Child routes that should keep a parent nav item highlighted. */
const PARENT_MAP: Record<string, string> = {
  '/guardian/animals/new': '/guardian/animals',
  '/guardian/appointments/new': '/guardian/appointments',
}

export function getGuardianNavParent(pathname: string): string {
  for (const [childPrefix, parent] of Object.entries(PARENT_MAP)) {
    if (pathname === childPrefix || pathname.startsWith(`${childPrefix}/`)) {
      return parent
    }
  }

  if (pathname.match(/^\/guardian\/animals\/[^/]+$/)) return '/guardian/animals'
  if (pathname.match(/^\/guardian\/appointments\/[^/]+$/)) return '/guardian/appointments'
  if (pathname.match(/^\/guardian\/orders\/[^/]+$/)) return '/guardian/orders'
  if (pathname.match(/^\/guardian\/store\/[^/]+$/)) return '/guardian/store'

  return pathname
}

export function isGuardianNavActive(pathname: string, item: GuardianNavItem): boolean {
  const activePath = getGuardianNavParent(pathname)

  if (item.path === '/guardian') {
    return activePath === '/guardian' || activePath.endsWith('/guardian')
  }

  return activePath === item.path || activePath.startsWith(`${item.path}/`)
}
