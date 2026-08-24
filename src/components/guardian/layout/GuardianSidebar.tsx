'use client'

import { usePathname, useRouter } from '@/lib/i18n-navigation'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { motion } from 'motion/react'
import { useGuardianCartStore } from '@/store/useGuardianCartStore'
import { useGuardianPets } from '@/hooks/useGuardian'
import { GUARDIAN_NAV, isGuardianNavActive } from '@/lib/guardian/nav'
import { guardianTransitions } from '@/lib/guardian/motion'
import { useEffect, useMemo, useState } from 'react'

export function GuardianSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('guardian')
  const { data: session } = useSession()
  const cartCount = useGuardianCartStore((s) => s.getItemCount())
  const { data: petsData } = useGuardianPets()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const initial = (session?.user?.name || 'V').charAt(0)
  const petCount = petsData?.animals?.length ?? 0

  const groups = useMemo(() => {
    const map = new Map<string, typeof GUARDIAN_NAV>()
    for (const item of GUARDIAN_NAV) {
      const g = item.groupKey || 'nav_home_group'
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(item)
    }
    return Array.from(map.entries())
  }, [])

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">VC</div>
        <div className="brand-text">
          <div className="t1">VetCare</div>
          <div className="t2">{t('portalSubtitle')}</div>
        </div>
      </div>

      <div className="vitals-trace" aria-hidden="true">
        <svg viewBox="0 0 260 34" preserveAspectRatio="none">
          <path d="M0 17 H70 L82 17 L90 3 L100 30 L110 17 L120 17 L128 9 L136 17 H260" />
        </svg>
      </div>

      <nav className="side-nav">
        {groups.map(([groupKey, items]) => (
          <div key={groupKey}>
            <div className="side-group-label">{t(groupKey)}</div>
            {items.map((item) => {
              const active = isGuardianNavActive(pathname, item)
              const Icon = item.icon
              const badge = item.badge === 'cart' && mounted && cartCount > 0 ? cartCount : null

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => router.push(item.path)}
                  className={`side-item${active ? ' active' : ''}`}
                >
                  {active && (
                    <motion.div
                      layoutId="guardian-side-highlight"
                      className="absolute inset-0 rounded-[12px] bg-[rgba(241,240,228,0.13)]"
                      style={{ zIndex: 0 }}
                      transition={guardianTransitions.spring}
                    />
                  )}
                  <Icon strokeWidth={2} />
                  {t(item.labelKey)}
                  {badge ? <span className="count">{badge}</span> : active ? <span className="dot" /> : null}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="side-foot">
        <button type="button" className="side-user" onClick={() => router.push('/guardian/account')}>
          <div className="avatar">{initial}</div>
          <div>
            <div className="side-user-name">{session?.user?.name || t('account')}</div>
            <div className="side-user-sub">
              {t('guardianRole')} · {t('petsCountShort', { count: petCount })}
            </div>
          </div>
        </button>
      </div>
    </aside>
  )
}
