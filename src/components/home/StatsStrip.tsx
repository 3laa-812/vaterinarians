'use client'

import { useTranslations } from 'next-intl'
import type { AppointmentWithDetails } from '@/types'
import { CheckCircle2, Clock, CalendarDays } from 'lucide-react'

interface StatsStripProps { appointments: AppointmentWithDetails[] }

export function StatsStrip({ appointments }: StatsStripProps) {
  const t = useTranslations('home')

  const total     = appointments.length
  const done      = appointments.filter((a) => a.status === 'COMPLETED').length
  const remaining = appointments.filter((a) => a.status === 'SCHEDULED').length
  const progress  = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="px-5 pb-4 space-y-3">
      {/* Progress bar */}
      {total > 0 && (
        <div>
          <div className="flex justify-between text-xs text-on-surface-variant mb-1.5">
            <span>{t('stats.progress')}</span>
            <span className="font-semibold text-primary">{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: total,     label: t('stats.total'),     Icon: CalendarDays, color: 'text-on-surface-variant',  bg: 'bg-surface-container' },
          { value: remaining, label: t('stats.remaining'), Icon: Clock,        color: 'text-secondary',           bg: 'bg-secondary/10' },
          { value: done,      label: t('stats.done'),      Icon: CheckCircle2, color: 'text-primary',             bg: 'bg-primary/10' },
        ].map(({ value, label, Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl py-3 px-3 text-center`}>
            <Icon size={14} className={`${color} mx-auto mb-1`} />
            <div className={`text-xl font-extrabold ${color}`}>{value}</div>
            <div className="text-[10px] font-semibold text-on-surface-variant mt-0.5 leading-tight">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
