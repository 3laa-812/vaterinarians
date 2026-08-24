'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { useTranslations } from 'next-intl'
import { MapPin, Phone, Building2 } from 'lucide-react'
import { SkeletonCard } from '@/components/shared/SkeletonCard'

type ClinicInfo = {
  name: string
  nameAr: string | null
  address: string | null
  phone: string | null
}

export default function GuardianClinicPage() {
  const t = useTranslations('guardian')
  const { data, isLoading } = useQuery<{ clinic: ClinicInfo }>({
    queryKey: ['guardian', 'clinic'],
    queryFn: () => apiClient.get<{ clinic: ClinicInfo }>('/api/guardian/clinic'),
    staleTime: 1000 * 60 * 10,
  })

  const clinic = data?.clinic

  if (isLoading) return <SkeletonCard variant="guardian" />

  return (
    <div className="max-w-lg">
      <h2 className="guardian-section-title mb-[18px]">{t('aboutClinic')}</h2>
      <div className="guardian-card p-[22px]">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--sage-soft)] text-[var(--olive)]">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[var(--olive)]">
              {clinic?.nameAr || clinic?.name || 'VetCare'}
            </h3>
            <p className="text-[12.5px] text-[var(--ink-soft)]">{t('clinicInfo')}</p>
          </div>
        </div>

        {clinic?.address && (
          <div className="mb-4 flex items-start gap-3 rounded-xl bg-[var(--cream)] p-3.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--pulse)]" />
            <div>
              <p className="text-[12px] font-bold text-[var(--olive)]">{t('clinicAddress')}</p>
              <p className="text-[13px] text-[var(--ink-soft)]">{clinic.address}</p>
            </div>
          </div>
        )}

        {clinic?.phone && (
          <div className="flex items-start gap-3 rounded-xl bg-[var(--cream)] p-3.5">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--pulse)]" />
            <div>
              <p className="text-[12px] font-bold text-[var(--olive)]">{t('clinicPhone')}</p>
              <p className="guardian-num text-[13px] text-[var(--ink-soft)]" dir="ltr">
                {clinic.phone}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
