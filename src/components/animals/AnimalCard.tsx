'use client'

import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/lib/i18n-navigation'
import type { AnimalListItem } from '@/types'
import { AnimalAvatar } from '@/components/shared/AnimalAvatar'
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react'
import { AtRiskBadge } from './AtRiskBadge'

interface AnimalCardProps { animal: AnimalListItem; className?: string }

export function AnimalCard({ animal, className = '' }: AnimalCardProps) {
  const t      = useTranslations('animal')
  const locale = useLocale()
  const isRTL  = locale === 'ar'

  const ChevronIcon = isRTL ? ArrowLeft : ArrowRight

  const formatDate = (d: string | null) => {
    if (!d) return null
    return new Date(d).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'short', day: 'numeric'
    })
  }

  // Is there an overdue follow-up? (next appointment was in the past)
  const isOverdue = animal.nextAppointment
    ? new Date(animal.nextAppointment) < new Date()
    : false

  return (
    <Link href={`/animals/${animal.id}`} className={`block group animate-slide-up ${className}`}>
      <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isOverdue
          ? 'border-warning/40 bg-surface-container-low hover:border-warning/60'
          : 'border-outline-variant bg-surface-container-low hover:border-primary/30 hover:bg-surface-container'
      }`}>
        <div className="p-4">
          {/* Top: avatar + name */}
          <div className="flex items-center gap-3 mb-4">
            <AnimalAvatar id={animal.id} species={animal.species} size={48} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-on-surface truncate">{animal.name}</h3>
                {isOverdue && <AtRiskBadge />}
              </div>
              <p className="text-xs text-on-surface-variant truncate">
                {animal.breed ?? animal.species} · {animal.owner.name}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-surface-container rounded-xl p-2.5 text-center">
              <p className="text-sm font-bold text-on-surface font-mono">
                {animal.latestWeight !== null ? animal.latestWeight : '—'}
              </p>
              <p className="text-[10px] text-on-surface-variant leading-tight mt-0.5">{t('kg')}</p>
            </div>
            <div className="bg-surface-container rounded-xl p-2.5 text-center">
              <p className="text-sm font-bold text-on-surface">
                {formatDate(animal.lastVisit) ?? '—'}
              </p>
              <p className="text-[10px] text-on-surface-variant leading-tight mt-0.5">{t('lastVisitShort')}</p>
            </div>
            <div className={`rounded-xl p-2.5 text-center ${isOverdue ? 'bg-warning/10' : 'bg-surface-container'}`}>
              <p className={`text-sm font-bold ${isOverdue ? 'text-warning' : 'text-on-surface'}`}>
                {formatDate(animal.nextAppointment) ?? '—'}
              </p>
              <p className="text-[10px] text-on-surface-variant leading-tight mt-0.5">{t('nextShort')}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-outline-variant/50 px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs text-on-surface-variant">{animal.owner.phone}</span>
          <ChevronIcon size={14} className="text-primary group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
