'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { SessionForm } from '@/components/sessions/SessionForm'
import { useAnimalProfile } from '@/hooks/useAnimals'
import { SkeletonCard } from '@/components/shared/SkeletonCard'

export default function NewSessionPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get('appointmentId')
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('session')

  const { data: animal, isLoading } = useAnimalProfile(id)
  const { data: authSession } = useSession()

  async function handleSubmit(data: any) {
    let finalApptId = appointmentId
    if (!finalApptId) {
      const apptRes = await fetch(`/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animalId: id,
          doctorId: authSession?.user?.id || '',
          scheduledAt: new Date().toISOString(),
          status: 'SCHEDULED'
        })
      })
      if (!apptRes.ok) {
        const errJson = await apptRes.json()
        throw new Error(locale === 'ar' ? errJson.error?.ar : errJson.error?.en)
      }
      const apptJson = await apptRes.json()
      finalApptId = apptJson.data.appointment.id
    }

    const res = await fetch(`/api/appointments/${finalApptId}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const json = await res.json()
      throw new Error(locale === 'ar' ? json.error?.ar : json.error?.en)
    }

    router.push(`/${locale}/animals/${id}`)
  }

  if (isLoading) return <div className="p-6"><SkeletonCard /></div>
  if (!animal) return null

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Animal + owner header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface">{animal.name}</h1>
        <p className="text-sm text-tertiary mt-1">
          {t('companion')}: {animal.owner.name}
        </p>
      </div>

      <SessionForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  )
}
