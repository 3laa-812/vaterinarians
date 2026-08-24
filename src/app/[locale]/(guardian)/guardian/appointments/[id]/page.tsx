'use client'

import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useGuardianPets } from '@/hooks/useGuardian'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/lib/i18n-navigation'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'

export default function GuardianAppointmentDetailPage() {
  const t = useTranslations('guardian')
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.id as string
  const { data, isLoading } = useGuardianPets()

  const appointment = useMemo(() => {
    for (const animal of data?.animals || []) {
      const apt = animal.appointments?.find((a) => a.id === appointmentId)
      if (apt) return { ...apt, animal }
    }
    return null
  }, [data?.animals, appointmentId])

  if (isLoading) return <SkeletonCard variant="guardian" />

  if (!appointment) {
    return (
      <EmptyState
        variant="guardian"
        icon={Calendar}
        title={t('notFound')}
        message={t('noAppointmentsYet')}
        actionLabel={t('back')}
        onAction={() => router.push('/guardian/appointments')}
      />
    )
  }

  const d = new Date(appointment.scheduledAt)
  const when = Number.isNaN(d.getTime())
    ? '—'
    : `${d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} · ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`

  return (
    <div className="max-w-lg">
      <button
        type="button"
        onClick={() => router.push('/guardian/appointments')}
        className="mb-4 inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--ink-soft)] hover:text-[var(--olive)]"
      >
        <ArrowRight className="h-4 w-4" />
        {t('back')}
      </button>

      <div className="guardian-card p-[22px]">
        <span className="mb-3 inline-flex rounded-full bg-[var(--vitality-soft)] px-2.5 py-1 text-[11.5px] font-bold text-[var(--vitality)]">
          {t('upcoming')}
        </span>
        <h2 className="guardian-section-title mb-1">{t('appointmentDetails')}</h2>
        <p className="mb-5 text-[13px] text-[var(--ink-soft)]">{appointment.animal.name}</p>

        <div className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-[var(--olive)]">
          <Clock className="h-4 w-4 text-[var(--pulse)]" />
          <span className="guardian-num">{when}</span>
        </div>

        {appointment.doctor?.name && (
          <p className="mb-4 text-[13.5px] text-[var(--ink-soft)]">
            {t('withDoctor', { name: appointment.doctor.name })}
          </p>
        )}

        {appointment.notes && (
          <p className="mb-4 rounded-xl bg-[var(--cream)] p-3 text-[13px] text-[var(--ink-soft)]">
            {appointment.notes}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => router.push('/guardian/appointments/new')}
            className="flex-1 rounded-[11px] border-[1.5px] border-[var(--line)] px-3.5 py-2.5 text-[12.5px] font-bold text-[var(--olive)]"
          >
            {t('reschedule')}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/guardian/animals/${appointment.animal.id}`)}
            className="flex-1 rounded-[11px] bg-[var(--sage-soft)] px-3.5 py-2.5 text-[12.5px] font-bold text-[var(--olive)]"
          >
            {t('viewMedicalFile')}
          </button>
        </div>
      </div>
    </div>
  )
}
