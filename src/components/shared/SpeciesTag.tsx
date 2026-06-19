'use client'

import { useTranslations } from 'next-intl'
import { PawPrint } from 'lucide-react'

interface SpeciesTagProps {
  species: string
  className?: string
}

export function SpeciesTag({ species, className = '' }: SpeciesTagProps) {
  const t = useTranslations('species')
  const normalized = species.toLowerCase()

  const colors: Record<string, string> = {
    dog: 'bg-primary-container/30 text-primary border-primary/30',
    cat: 'bg-secondary-container/30 text-secondary border-secondary/30',
    bird: 'bg-tertiary-container/30 text-tertiary border-tertiary/30',
    default: 'bg-surface-container-high text-on-surface-variant border-outline-variant',
  }

  const colorClass = colors[normalized] || colors.default
  const label = t.hasOwnProperty(normalized) ? t(normalized) : species

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}>
      {!colors[normalized] && <PawPrint size={12} />}
      {label}
    </span>
  )
}
