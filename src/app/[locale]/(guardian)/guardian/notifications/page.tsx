'use client'

import { useTranslations } from 'next-intl'
import { Bell } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'

export default function GuardianNotificationsPage() {
  const t = useTranslations('guardian')

  return (
    <div>
      <h2 className="guardian-section-title mb-[18px]">{t('notifications')}</h2>
      <EmptyState
        variant="guardian"
        icon={Bell}
        title={t('noNotifications')}
        message={t('noNotificationsDesc')}
      />
    </div>
  )
}
