'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useSession, useSaveSession } from '@/hooks/useSessions'
import { SessionForm } from '@/components/sessions/SessionForm'
import { SpeciesTag } from '@/components/shared/SpeciesTag'
import Link from 'next/link'

export default function NewSessionPage() {
  const searchParams = useSearchParams()
  const appointmentId = searchParams?.get('appointmentId') || ''
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('session')

  const { data: appointment, isLoading, error } = useSession(appointmentId)
  const saveMutation = useSaveSession(appointmentId)

  const handleSubmit = async (data: any) => {
    try {
      await saveMutation.mutateAsync(data)
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
        <span className="text-4xl block mb-4">⚠️</span>
        <p className="text-secondary">
          {locale === 'ar' ? 'الموعد غير موجود أو غير صالح' : 'Appointment not found or invalid'}
        </p>
        <Link href={`/${locale}/appointments`} className="mt-4 inline-block text-teal-600 font-semibold hover:underline">
          {locale === 'ar' ? 'الرجوع إلى الجدول' : 'Back to Schedule'}
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Patient info card */}
      <div className="bg-surface border border-outline/10 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-secondary uppercase tracking-wider font-semibold">
            {locale === 'ar' ? 'جلسة كشف جديدة' : 'New Exam Session'}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-2xl font-bold text-primary">
              {appointment.animal.name}
            </h1>
            <SpeciesTag species={appointment.animal.species} />
          </div>
          <p className="text-sm text-secondary mt-1">
            {appointment.animal.breed || ''}
          </p>
        </div>
        <div className="text-start sm:text-end">
          <p className="text-sm font-medium text-primary">
            {new Date(appointment.scheduledAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p className="text-xs text-secondary mt-1">
            {locale === 'ar' ? 'المعالج' : 'Vet'}: {appointment.doctor?.name || ''}
          </p>
        </div>
      </div>

      <SessionForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isLoading={saveMutation.isPending}
      />
    </div>
  )
}
