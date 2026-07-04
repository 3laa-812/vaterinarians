'use client'

import { useTranslations } from 'next-intl'
import { Clock, CheckCircle2, XCircle, PauseCircle } from 'lucide-react'
import type { AppointmentStatus } from '@/types'

const CONFIG: Record<AppointmentStatus, {
  icon: typeof Clock
  bg:   string
  text: string
  border: string
}> = {
  SCHEDULED:  { icon: Clock,          bg: 'bg-primary/10',   text: 'text-primary',             border: 'border-primary/20' },
  COMPLETED:  { icon: CheckCircle2,   bg: 'bg-success/10',   text: 'text-success',             border: 'border-success/20' },
  ABSENT:     { icon: XCircle,        bg: 'bg-error/10',     text: 'text-error',               border: 'border-error/20' },
  POSTPONED:  { icon: PauseCircle,    bg: 'bg-warning/10',   text: 'text-secondary',           border: 'border-secondary/20' },
}

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const t = useTranslations('appointment')
  const { icon: Icon, bg, text, border } = CONFIG[status]

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bg} ${text} ${border}`}>
      <Icon size={11} />
      {t(`status.${status}`)}
    </span>
  )
}
