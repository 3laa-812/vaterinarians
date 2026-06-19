'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import type { AnimalListItem } from '@/types'
import { SpeciesTag } from '@/components/shared/SpeciesTag'

interface AnimalCardProps {
  animal: AnimalListItem
  className?: string
}

export function AnimalCard({ animal, className = '' }: AnimalCardProps) {
  const t = useTranslations('animal')
  const locale = useLocale()

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className={`bg-surface border border-outline/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-lg font-semibold text-primary line-clamp-1">
            {animal.name}
          </h3>
          <SpeciesTag species={animal.species} />
        </div>

        {animal.breed && (
          <p className="text-xs text-secondary mb-4">
            {animal.breed}
          </p>
        )}

        <div className="space-y-2 border-t border-outline/5 pt-3 mb-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary">{t('owner')}</span>
            <span className="font-medium text-primary">{animal.owner.name}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary">{t('currentWeight')}</span>
            <span className="font-medium text-primary font-mono">
              {animal.latestWeight !== null ? `${animal.latestWeight} ${t('kg')}` : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary">{t('pastSessions')}</span>
            <span className="text-primary font-mono">
              {formatDate(animal.lastVisit)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-teal-600 font-medium truncate max-w-[50%]">
          {animal.nextAppointment ? `${t('sessions')}: ${formatDate(animal.nextAppointment)}` : ''}
        </span>
        <Link
          href={`/${locale}/animals/${animal.id}`}
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors duration-200"
        >
          {t('viewDetails')}
        </Link>
      </div>
    </div>
  )
}
