'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useAnimals } from '@/hooks/useAnimals'
import { AnimalCard } from '@/components/animals/AnimalCard'
import { SkeletonCard } from '@/components/shared/SkeletonCard'

export default function AnimalsPage() {
  const t = useTranslations('animal')
  const locale = useLocale()
  const [search, setSearch] = useState('')

  const { data: animals, isLoading, error } = useAnimals()

  // Filter animals based on search input (checks name, owner name, or owner phone)
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {locale === 'ar' ? 'المرضى (الحيوانات)' : 'Patients (Animals)'}
          </h1>
          <p className="text-sm text-secondary mt-1">
            {locale === 'ar' ? 'إدارة وسجلات ملفات الحيوانات الأليفة' : 'Manage and view pet patient records'}
          </p>
        </div>
        <Link
          href={`/${locale}/animals/new`}
          className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all duration-200"
        >
          + {t('addNew')}
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="relative">
        <input
          type="text"
          placeholder={t('search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
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
          <p className="text-rose-600">{locale === 'ar' ? 'فشل تحميل البيانات' : 'Failed to load patients'}</p>
        </div>
      ) : !filteredAnimals || filteredAnimals.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-outline/10 rounded-2xl p-6 shadow-sm">
          <span className="text-4xl block mb-3">🐾</span>
          <p className="text-secondary italic">
            {t('noAnimals')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnimals.map((animal) => (
            <AnimalCard key={animal.id} animal={animal} />
          ))}
        </div>
      )}
    </div>
  )
}
