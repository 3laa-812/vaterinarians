'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import type { OwnerListItem } from '@/hooks/useOwners'
import { SpeciesTag } from '@/components/shared/SpeciesTag'

interface OwnerBlockProps {
  owner: OwnerListItem
  className?: string
}

export function OwnerBlock({ owner, className = '' }: OwnerBlockProps) {
  const t = useTranslations('owner')
  const tAnimal = useTranslations('animal')
  const locale = useLocale()

  return (
    <div className={`bg-surface border border-outline/10 rounded-2xl p-6 shadow-sm ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline/10 pb-6 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">{owner.name}</h2>
          <p className="text-sm text-secondary mt-1 font-mono">{owner.phone}</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`tel:${owner.phone}`}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors duration-200"
          >
            {tAnimal('call')}
          </a>

          {owner.email && (
            <a
              href={`mailto:${owner.email}`}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl border border-outline/20 text-primary hover:bg-outline/5 transition-colors duration-200"
            >
              {t('email')}
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {owner.address && (
            <div>
              <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
                {t('address')}
              </h3>
              <p className="text-sm text-primary">{owner.address}</p>
            </div>
          )}

          {owner.notes && (
            <div>
              <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
                {t('notes')}
              </h3>
              <p className="text-sm text-primary bg-outline/5 rounded-xl p-3">
                {owner.notes}
              </p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3">
            {t('animals')}
          </h3>
          {owner.animals.length === 0 ? (
            <p className="text-sm text-secondary italic">
              {t('noAnimals')}
            </p>
          ) : (
            <div className="space-y-2">
              {owner.animals.map((animal) => (
                <Link
                  key={animal.id}
                  href={`/${locale}/animals/${animal.id}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-outline/10 hover:bg-outline/5 transition-all duration-200 group"
                >
                  <span className="text-sm font-medium text-primary group-hover:text-teal-600 transition-colors">
                    {animal.name}
                  </span>
                  <SpeciesTag species={animal.species} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
