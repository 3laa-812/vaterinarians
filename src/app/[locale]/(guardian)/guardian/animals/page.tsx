'use client'

import { useGuardianPets } from '@/hooks/useGuardian'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/lib/i18n-navigation'
import { Plus } from 'lucide-react'
import { StaggerList, StaggerItem } from '@/components/guardian/StaggerList'
import { GuardianPetCard, GuardianAddPetCard } from '@/components/guardian/PetCard'
import { SkeletonCard } from '@/components/shared/SkeletonCard'

export default function GuardianAnimalsPage() {
  const t = useTranslations('guardian')
  const router = useRouter()
  const { data, isLoading } = useGuardianPets()
  const animals = data?.animals || []

  return (
    <div>
      <div className="mb-[18px] flex items-center justify-between">
        <h2 className="guardian-section-title">{t('allPetsTitle', { count: animals.length })}</h2>
        <button
          type="button"
          onClick={() => router.push('/guardian/animals/new')}
          className="inline-flex items-center gap-2 rounded-[11px] bg-gradient-to-br from-[var(--olive-2)] to-[var(--olive)] px-3.5 py-2 text-[12.5px] font-bold text-[var(--cream)] shadow-[0_8px_20px_rgba(62,63,41,0.18)]"
        >
          <Plus className="h-[15px] w-[15px]" strokeWidth={2.4} />
          {t('addPet')}
        </button>
      </div>

      {isLoading ? (
        <div className="guardian-grid-3">
          <SkeletonCard variant="guardian" />
          <SkeletonCard variant="guardian" />
        </div>
      ) : (
        <StaggerList as="div" className="guardian-grid-3">
          {animals.map((animal) => (
            <StaggerItem as="div" key={animal.id}>
              <GuardianPetCard
                animal={animal}
                onClick={() => router.push(`/guardian/animals/${animal.id}`)}
              />
            </StaggerItem>
          ))}
          <StaggerItem as="div">
            <GuardianAddPetCard onClick={() => router.push('/guardian/animals/new')} />
          </StaggerItem>
        </StaggerList>
      )}
    </div>
  )
}
