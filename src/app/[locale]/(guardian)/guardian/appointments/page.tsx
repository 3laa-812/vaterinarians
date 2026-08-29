'use client'

import { useMemo } from 'react'
import { useGuardianPets } from '@/hooks/useGuardian'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/lib/i18n-navigation'
import { Calendar, Clock, Plus } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { Button } from '@/components/shared/Button'

type FlatAppointment = {
  id: string
  scheduledAt: string | Date
  animalName: string
  animalId: string
  doctorName?: string
  status?: string
}

export default function GuardianAppointmentsPage() {
  const t = useTranslations('guardian')
  const router = useRouter()
  const { data, isLoading } = useGuardianPets()

  const appointments = useMemo(() => {
    const flat: FlatAppointment[] = []
    for (const animal of data?.animals || []) {
      for (const apt of animal.appointments || []) {
        flat.push({
          id: apt.id,
          scheduledAt: apt.scheduledAt,
          animalName: animal.name,
          animalId: animal.id,
          doctorName: apt.doctor?.name,
          status: apt.status,
        })
      }
    }
    return flat.sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    )
  }, [data?.animals])

  if (isLoading) {
    return (
      <div className="space-y-3">
        <SkeletonCard variant="guardian" />
        <SkeletonCard variant="guardian" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-[18px] flex items-center justify-between">
        <h2 className="guardian-section-title">{t('appointments')}</h2>
        <Button
          variant="guardian-primary"
          onClick={() => router.push('/guardian/appointments/new')}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-[12.5px]"
        >
          <Plus className="h-[15px] w-[15px]" />
          {t('bookAppointment')}
        </Button>
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          variant="guardian"
          icon={Calendar}
          title={t('noUpcomingAppointments')}
          message={t('waitingForYou')}
          actionLabel={t('bookAppointment')}
          onAction={() => router.push('/guardian/appointments/new')}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {appointments.map((apt) => {
            const d = new Date(apt.scheduledAt)
            const when = Number.isNaN(d.getTime())
              ? '—'
              : `${d.toLocaleDateString()} · ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`

            return (
              <button
                key={apt.id}
                type="button"
                onClick={() => router.push(`/guardian/appointments/${apt.id}`)}
                className="guardian-card flex w-full items-center justify-between gap-4 p-[18px] text-end transition-shadow hover:shadow-[var(--shadow-lg)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--sage-soft)] text-[var(--olive)]">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-extrabold text-[var(--olive)]">{apt.animalName}</h4>
                    <p className="text-[12.5px] text-[var(--ink-soft)]">
                      {apt.doctorName ? t('withDoctor', { name: apt.doctorName }) : t('upcomingAppointment')}
                    </p>
                  </div>
                </div>
                <div className="guardian-num flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--ink-soft)]">
                  <Clock className="h-3.5 w-3.5" />
                  {when}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
