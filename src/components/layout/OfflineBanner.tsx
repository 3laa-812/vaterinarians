// OfflineBanner — shown when navigator.onLine = false
// Sits at the very top of the page content area

'use client'

import { useOffline } from '@/hooks/useOffline'
import { useTranslations } from 'next-intl'

export function OfflineBanner() {
  const isOffline = useOffline()
  const t = useTranslations('offline')

  if (!isOffline) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className="w-full bg-secondary-container/80 border-b border-secondary/20 px-4 py-2 text-center text-sm font-medium text-on-secondary-container"
    >
      📡 {t('banner')}
    </div>
  )
}
