'use client'

import { useTranslations } from 'next-intl'
import type { AppointmentWithDetails } from '@/types'

interface StatsStripProps {
  appointments: AppointmentWithDetails[]
}

export function StatsStrip({ appointments }: StatsStripProps) {
  const t = useTranslations('home')

  const total = appointments.length
  const done = appointments.filter((a) => a.status === 'COMPLETED').length
  const remaining = appointments.filter((a) => a.status === 'SCHEDULED').length

  const stats = [
    { value: total, label: t('stats.total'), colorClass: 'text-on-surface' },
    { value: done, label: t('stats.done'), colorClass: 'text-primary' },
    { value: remaining, label: t('stats.remaining'), colorClass: 'text-secondary' },
  ]

  return (
    <div className="grid grid-cols-3 gap-2.5 px-5 pb-5" role="group" aria-label={t('stats.groupLabel')}>
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-surface-container border border-outline-variant rounded-2xl py-3 text-center"
        >
          <div className={`text-xl font-extrabold ${s.colorClass}`}>{s.value}</div>
          <div className="text-[11px] font-semibold text-on-surface-variant mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  )
}
