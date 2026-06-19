'use client'

import { useTranslations } from 'next-intl'
import type { AppointmentStatus } from '@/types'

interface StatusBadgeProps {
  status: AppointmentStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const t = useTranslations('appointment.status')

  const colors: Record<AppointmentStatus, string> = {
    SCHEDULED: 'bg-tertiary-container/30 text-tertiary border-tertiary/30',
    COMPLETED: 'bg-primary-container/30 text-primary border-primary/30',
    ABSENT: 'bg-error-container/30 text-error border-error/30',
    POSTPONED: 'bg-secondary-container/30 text-secondary border-secondary/30',
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colors[status]} ${className}`}>
      {t(status)}
    </span>
  )
}
