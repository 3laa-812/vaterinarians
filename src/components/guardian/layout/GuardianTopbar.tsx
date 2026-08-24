'use client'

import { usePathname, useRouter } from '@/lib/i18n-navigation'
import { useTranslations } from 'next-intl'
import { Bell, ShoppingCart, CalendarPlus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useGuardianCartStore } from '@/store/useGuardianCartStore'
import { getGuardianNavParent } from '@/lib/guardian/nav'

export function GuardianTopbar() {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('guardian')
  const { data: session } = useSession()
  const cartCount = useGuardianCartStore((s) => s.getItemCount())
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (pathname.includes('/guardian/login')) return null

  const firstName = (session?.user?.name || '').split(' ')[0]
  const activePath = getGuardianNavParent(pathname)

  let pageTitle = firstName ? t('welcomeUser', { name: firstName }) : t('welcome')
  let pageSub = t('daily_summary_pets')

  if (activePath.includes('/animals')) {
    pageTitle = t('pets')
    pageSub = t('manage_pets')
  } else if (activePath.includes('/appointments')) {
    pageTitle = t('appointments')
    pageSub = t('manage_appointments')
  } else if (activePath.includes('/store')) {
    pageTitle = t('store')
    pageSub = t('store_sub')
  } else if (activePath.includes('/cart')) {
    pageTitle = t('cart')
    pageSub = t('cart_sub')
  } else if (activePath.includes('/orders')) {
    pageTitle = t('orders')
    pageSub = t('orders_sub')
  } else if (activePath.includes('/account')) {
    pageTitle = t('account')
    pageSub = t('account_sub')
  } else if (activePath.includes('/notifications')) {
    pageTitle = t('notifications')
    pageSub = t('noNotificationsDesc')
  } else if (activePath.includes('/doctors')) {
    pageTitle = t('clinicTeam')
    pageSub = t('manage_appointments')
  } else if (activePath.includes('/clinic')) {
    pageTitle = t('aboutClinic')
    pageSub = t('clinicInfo')
  }

  return (
    <div className="topbar">
      <div className="topbar-title">
        <h1>{pageTitle}</h1>
        <p>{pageSub}</p>
      </div>

      <div className="topbar-actions">
        <button type="button" className="icon-btn" onClick={() => router.push('/guardian/notifications')} aria-label={t('notifications')}>
          <Bell strokeWidth={2} />
          <span className="badge-dot" />
        </button>

        <button type="button" className="icon-btn" onClick={() => router.push('/guardian/cart')} aria-label={t('cart')}>
          <ShoppingCart strokeWidth={2} />
          {isMounted && cartCount > 0 && <span className="badge-dot" />}
        </button>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => router.push('/guardian/appointments/new')}
        >
          <CalendarPlus strokeWidth={2.4} />
          {t('book_appointment')}
        </button>
      </div>
    </div>
  )
}
