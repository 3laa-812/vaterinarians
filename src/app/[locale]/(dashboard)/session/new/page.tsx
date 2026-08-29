'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n-navigation'
import { Search, UserPlus, PawPrint } from 'lucide-react'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { AnimalAvatar } from '@/components/shared/AnimalAvatar'
import { SpeciesTag } from '@/components/shared/SpeciesTag'

export default function PatientFinderPage() {
  const tForm = useTranslations('form')
  const tNav = useTranslations('nav')
  const tAnimal = useTranslations('animal')
  
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!search.trim()) { setResults([]); return }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/animals/search?q=${encodeURIComponent(search)}`)
        const json = await res.json()
        setResults(json.data?.animals ?? [])
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto space-y-8">
      <div className="text-center space-y-2 mt-4">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Search size={32} />
        </div>
        <h1 className="text-2xl font-bold text-on-surface">{tNav('newSession')}</h1>
        <p className="text-on-surface-variant text-sm">
          {tAnimal('search')}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
        <input
          type="text"
          placeholder={tAnimal('search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full ps-12 pe-4 py-4 rounded-2xl border-2 border-outline-variant bg-surface-container-low text-on-surface outline-none focus:border-primary transition-colors text-lg"
          autoFocus
        />
      </div>

      {search.trim().length > 0 && (
        <div className="bg-surface-container rounded-2xl p-2 border border-outline-variant shadow-sm max-h-[300px] overflow-y-auto">
          {searching ? (
            <div className="p-4 space-y-4">
               <div className="h-12 bg-outline-variant/30 animate-pulse rounded-lg" />
               <div className="h-12 bg-outline-variant/30 animate-pulse rounded-lg" />
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-2">
              {results.map(animal => (
                <Link
                  key={animal.id}
                  href={`/animals/${animal.id}/session/new`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-highest transition-colors"
                >
                  <AnimalAvatar id={animal.id} species={animal.species} size={40} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-on-surface">{animal.name}</h3>
                    <p className="text-xs text-on-surface-variant truncate">{animal.owner.name} • {animal.owner.phone}</p>
                  </div>
                  <SpeciesTag species={animal.species} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-on-surface-variant text-sm flex flex-col items-center gap-2">
              <PawPrint size={24} className="opacity-50" />
              <span>{tAnimal('notFound')}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-center gap-4 text-on-surface-variant text-sm">
        <div className="h-px bg-outline-variant flex-1" />
        <span>أو</span>
        <div className="h-px bg-outline-variant flex-1" />
      </div>

      <Link
        href="/session/new/register"
        className="flex items-center justify-center gap-2 w-full py-4 bg-secondary-container hover:bg-secondary-container/80 text-on-secondary-container rounded-2xl font-semibold transition-all border border-secondary-container"
      >
        <UserPlus size={20} />
        {tAnimal('addNew')}
      </Link>
    </div>
  )
}
