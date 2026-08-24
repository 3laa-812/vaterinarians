'use client'

import { useGuardianDoctors } from '@/hooks/useGuardian'
import { useTranslations } from 'next-intl'
import { Stethoscope } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'

export default function GuardianDoctorsPage() {
  const t = useTranslations('guardian')
  const { data, isLoading } = useGuardianDoctors()
  const doctors = data?.doctors || []

  if (isLoading) {
    return (
      <div className="guardian-grid-3">
        <SkeletonCard variant="guardian" />
        <SkeletonCard variant="guardian" />
      </div>
    )
  }

  if (doctors.length === 0) {
    return (
      <EmptyState
        variant="guardian"
        icon={Stethoscope}
        title={t('noDoctors')}
        message={t('anyDoctorHint')}
      />
    )
  }

  return (
    <div>
      <h2 className="guardian-section-title mb-[18px]">{t('clinicTeam')}</h2>
      <div className="guardian-grid-3">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="guardian-card flex items-center gap-3.5 p-[18px]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--tan-soft)] to-[var(--sage-soft)] text-lg font-extrabold text-[var(--olive)]">
              {doctor.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-[15px] font-extrabold text-[var(--olive)]">{doctor.name}</h4>
              <p className="text-[12.5px] text-[var(--ink-soft)]">{t('preferredDoctor')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
