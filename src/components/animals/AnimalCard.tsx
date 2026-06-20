'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n-navigation'
import { useLocale } from 'next-intl'
import type { AnimalListItem } from '@/types'
import { SpeciesTag } from '@/components/shared/SpeciesTag'
import { AnimalAvatar } from '@/components/shared/AnimalAvatar'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'

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
    <Card className={`flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-center gap-3 mb-3">
          <AnimalAvatar id={animal.id} species={animal.species} size={44} />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-on-surface line-clamp-1">{animal.name}</h3>
            {animal.breed && <p className="text-xs text-on-surface-variant">{animal.breed}</p>}
          </div>
          <SpeciesTag species={animal.species} />
        </div>

        <div className="space-y-2 border-t border-outline-variant pt-3 mb-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-on-surface-variant">{t('owner')}</span>
            <span className="font-medium text-on-surface">{animal.owner.name}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-on-surface-variant">{t('currentWeight')}</span>
            <span className="font-medium text-on-surface font-mono">
              {animal.latestWeight !== null ? `${animal.latestWeight} ${t('kg')}` : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-on-surface-variant">{t('pastSessions')}</span>
            <span className="text-on-surface font-mono">{formatDate(animal.lastVisit)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-primary font-medium truncate max-w-[50%]">
          {animal.nextAppointment ? `${t('sessions')}: ${formatDate(animal.nextAppointment)}` : ''}
        </span>
        <Link href={`/animals/${animal.id}`}>
          <Button className="px-4 py-2 text-xs">{t('viewDetails')}</Button>
        </Link>
      </div>
    </Card>
  )
}
