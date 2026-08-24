'use client'

import type { GuardianAnimal } from '@/types'
import { useTranslations } from 'next-intl'
import { Clock, Plus } from 'lucide-react'
import { RecoveryRing } from '@/components/guardian/RecoveryRing'
import { getWeightProgress } from '@/lib/guardian/weightProgress'

function formatAppointmentDay(scheduledAt: string | Date) {
  const d = new Date(scheduledAt)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

type PetCardProps = {
  animal: GuardianAnimal
  onClick: () => void
}

export function GuardianPetCard({ animal, onClick }: PetCardProps) {
  const t = useTranslations('guardian')
  const weightProgress = getWeightProgress(animal)
  const nextApt = animal.appointments?.[0]
  const when = nextApt ? formatAppointmentDay(nextApt.scheduledAt) : null

  return (
    <button type="button" className="card pet-card" onClick={onClick}>
      <RecoveryRing progress={weightProgress?.progress ?? 0} active={weightProgress?.onTrack}>
        {animal.name.charAt(0)}
      </RecoveryRing>
      <div className="pet-info">
        <h4>{animal.name}</h4>
        <p className="species">{[animal.species, animal.breed].filter(Boolean).join(' · ')}</p>
        {weightProgress ? (
          <span className="badge badge-vit num">
            {weightProgress.onTrack
              ? t('goalReached')
              : t('goalProgress', { kg: weightProgress.latestWeight, target: weightProgress.targetWeight })}
          </span>
        ) : when ? (
          <span className="badge badge-sage">
            <Clock width={12} height={12} strokeWidth={2.4} />
            {when}
          </span>
        ) : (
          <span className="muted" style={{ fontSize: '11.5px' }}>
            {t('noGoalSet')}
          </span>
        )}
      </div>
    </button>
  )
}

export function GuardianAddPetCard({ onClick }: { onClick: () => void }) {
  const t = useTranslations('guardian')

  return (
    <button
      type="button"
      className="card pet-card"
      style={{
        justifyContent: 'center',
        border: '1.5px dashed var(--line)',
        boxShadow: 'none',
        color: 'var(--ink-soft)',
      }}
      onClick={onClick}
    >
      <Plus width={20} height={20} strokeWidth={2} />
      <span style={{ fontWeight: 700, fontSize: '13.5px' }}>{t('addNewPetCard')}</span>
    </button>
  )
}
