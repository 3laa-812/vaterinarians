'use client'

import { usePathname, useRouter } from '@/lib/i18n-navigation'
import { useTranslations } from 'next-intl'
import { PawPrint, ShoppingBag, ShoppingCart } from 'lucide-react'
import { useGuardianCartStore } from '@/store/useGuardianCartStore'
import { useEffect, useState } from 'react'

export function GuardianBottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('guardian')
  const cartCount = useGuardianCartStore((s) => s.getItemCount())
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (pathname.includes('/guardian/login')) return null

  const links = [
    { icon: PawPrint, label: t('pets'), path: '/guardian' },
    { icon: ShoppingBag, label: t('store'), path: '/guardian/store' },
    { icon: ShoppingCart, label: t('cart'), path: '/guardian/cart', badge: cartCount },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-guardian-surface shadow-[0_-4px_20px_rgba(28,25,23,0.05)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-16 w-full items-center justify-around max-w-[480px] mx-auto">
        {links.map((link) => {
          const isActive = pathname === link.path || (link.path !== '/guardian' && pathname.startsWith(link.path))
          return (
            <button
              key={link.path}
              onClick={() => router.push(link.path)}
              className={`relative flex flex-col items-center justify-center h-full flex-1 transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              <div className="relative">
                <link.icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
                {isMounted && !!link.badge && link.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white px-1">
                    {link.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {link.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
