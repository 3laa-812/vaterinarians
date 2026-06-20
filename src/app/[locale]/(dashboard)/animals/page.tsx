'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n-navigation'
import { Plus, PawPrint, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAnimals } from '@/hooks/useAnimals'
import { AnimalCard } from '@/components/animals/AnimalCard'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/shared/Button'

export default function AnimalsPage() {
  const t = useTranslations('animal')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading, error } = useAnimals(page, limit)
  const animals = data?.animals
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const filteredAnimals = animals?.filter((animal) => {
    const searchLower = search.toLowerCase()
    return (
      animal.name.toLowerCase().includes(searchLower) ||
      animal.owner.name.toLowerCase().includes(searchLower) ||
      animal.owner.phone.includes(searchLower)
    )
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title={t('pageTitle')}
        subtitle={t('pageSubtitle')}
        action={
          <Link
            href="/animals/new"
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-on-primary transition-all"
          >
            <Plus size={18} />
            {t('addNew')}
          </Link>
        }
      />

      <div className="relative">
        <input
          type="text"
          placeholder={t('search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface outline-none focus:border-primary transition-colors"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-error">{t('loadFailed')}</p>
        </div>
      ) : !filteredAnimals || filteredAnimals.length === 0 ? (
        <EmptyState icon={PawPrint} message={t('noAnimals')} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnimals.map((animal) => (
              <AnimalCard key={animal.id} animal={animal} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1"
              >
                <ChevronLeft size={16} />
              </Button>
              <span className="text-sm text-on-surface-variant">
                {page} / {totalPages}
              </span>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
