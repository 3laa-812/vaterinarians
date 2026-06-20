'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useSession, useSaveSession } from '@/hooks/useSessions'
import { SessionForm } from '@/components/sessions/SessionForm'
import { SpeciesTag } from '@/components/shared/SpeciesTag'
import { AnimalAvatar } from '@/components/shared/AnimalAvatar'
import { Link } from '@/lib/i18n-navigation'

export default function NewSessionPage() {
  const searchParams = useSearchParams()
  const appointmentId = searchParams?.get('appointmentId') || ''
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('session')
  const tAnimal = useTranslations('animal')
  const tErrors = useTranslations('errors')

  const { data: appointment, isLoading, error } = useSession(appointmentId)
  const saveMutation = useSaveSession(appointmentId)
  const [successMessage, setSuccessMessage] = useState('')

  const formatDate = (dateStr: string | Date) => {
    return new Date(dateStr).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleSubmit = async (data: Parameters<typeof saveMutation.mutateAsync>[0]) => {
    try {
      const result = await saveMutation.mutateAsync(data)
      if (result.nextAppointment) {
        setSuccessMessage(
          t('nextVisitScheduled', {
            date: formatDate(result.nextAppointment.scheduledAt),
          }),
        )
      }
      if (appointment?.animalId) {
        router.push(`/${locale}/animals/${appointment.animalId}`)
      } else {
        router.push(`/${locale}/appointments`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-24 bg-outline/10 rounded-2xl" />
        <div className="h-96 bg-outline/10 rounded-2xl" />
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="p-6 text-center max-w-md mx-auto py-20">
        <p className="text-on-surface-variant">{tErrors('notFound')}</p>
        <Link href="/appointments" className="mt-4 inline-block text-primary font-semibold hover:underline">
          {t('cancel')}
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {successMessage && (
        <div className="rounded-xl bg-primary/10 border border-primary/30 px-4 py-3 text-sm text-primary">
          {successMessage}
        </div>
      )}

      <div className="rounded-2xl border border-outline-variant bg-surface-container p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <AnimalAvatar id={appointment.animal.id} species={appointment.animal.species} size={56} />
          <div>
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              {tAnimal('newSession')}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-2xl font-bold text-on-surface">{appointment.animal.name}</h1>
              <SpeciesTag species={appointment.animal.species} />
            </div>
            {appointment.animal.breed && (
              <p className="text-sm text-on-surface-variant mt-1">{appointment.animal.breed}</p>
            )}
          </div>
        </div>
        <div className="text-start sm:text-end">
          <p className="text-sm font-medium text-on-surface">{formatDate(appointment.scheduledAt)}</p>
          <p className="text-xs text-on-surface-variant mt-1">
            {tAnimal('doctor')}: {appointment.doctor?.name || ''}
          </p>
        </div>
      </div>

      <SessionForm
        initialData={{
          totalAmount: appointment.fee ?? 0,
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isLoading={saveMutation.isPending}
      />
    </div>
  )
}
