// UpdateBanner — shown when a new PWA service worker is waiting
// Doctor taps once to update. Never refreshes mid-session automatically.

'use client'

import { usePWAUpdate } from '@/hooks/usePWAUpdate'
import { useTranslations } from 'next-intl'

export function UpdateBanner() {
  const { updateAvailable, applyUpdate } = usePWAUpdate()
  const t = useTranslations('update')

  if (!updateAvailable) return null

  return (
    <div className="w-full bg-primary-container/80 border-b border-primary/20 px-4 py-2 flex items-center justify-between gap-3 text-sm">
      <span className="text-on-primary-container font-medium">
        🆕 {t('available')}
      </span>
      <button
        id="update-app-button"
        onClick={applyUpdate}
        className="bg-primary text-on-primary text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors flex-shrink-0"
      >
        {t('action')}
      </button>
    </div>
  )
}
