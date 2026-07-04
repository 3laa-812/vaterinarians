'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useRouter, Link } from '@/lib/i18n-navigation'
import { useAnimalProfile, useDeleteAnimal } from '@/hooks/useAnimals'
import { OwnerBlock } from '@/components/owners/OwnerBlock'
import { SpeciesTag } from '@/components/shared/SpeciesTag'
import { AnimalAvatar } from '@/components/shared/AnimalAvatar'
import { StatusBadge } from '@/components/appointments/StatusBadge'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { WeightChart } from '@/components/animals/WeightChart'

export default function AnimalProfilePage() {
  const params = useParams<{ id: string }>()
  const id = params?.id || ''
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('animal')
  const tForm = useTranslations('form')
  const tSession = useTranslations('session')

  const { data: profile, isLoading, error, refetch } = useAnimalProfile(id)
  const deleteMutation = useDeleteAnimal()

  // Weight entry state
  const [newWeight, setNewWeight] = useState('')
  const [isSubmittingWeight, setIsSubmittingWeight] = useState(false)

  const handleDeleteAnimal = async () => {
    if (!confirm(t('deleteConfirm'))) return
    try {
      await deleteMutation.mutateAsync(id)
      router.push('/animals')
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWeight || parseFloat(newWeight) <= 0) return
    setIsSubmittingWeight(true)

    try {
      const res = await fetch(`/api/animals/${id}/weight-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight: parseFloat(newWeight) }),
      })
      if (!res.ok) throw new Error('Failed to record weight')
      setNewWeight('')
      refetch()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmittingWeight(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-20 bg-outline/10 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-outline/10 rounded-2xl md:col-span-2" />
          <div className="h-64 bg-outline/10 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="p-6 text-center max-w-md mx-auto py-20">
        <span className="text-4xl block mb-4">⚠️</span>
        <p className="text-on-surface-variant">{t('notFound')}</p>
        <Link href="/animals" className="mt-4 inline-block text-primary font-semibold hover:underline">
          {t('backToList')}
        </Link>
      </div>
    )
  }

  const calculateAge = (birthDateVal: Date | string | null) => {
    if (!birthDateVal) return '—'
    const birth = new Date(birthDateVal)
    const today = new Date()
    let years = today.getFullYear() - birth.getFullYear()
    let months = today.getMonth() - birth.getMonth()

    if (months < 0) {
      years--
      months += 12
    }

    if (years === 0) {
      return `${months} ${t('months')}`
    }
    return `${years} ${t('years')} ${months > 0 ? `${months} ${t('months')}` : ''}`
  }


  const formatDate = (dateStr: string | Date | null) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <AnimalAvatar id={profile.id} species={profile.species} size={64} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-on-surface">{profile.name}</h1>
              <SpeciesTag species={profile.species} />
            </div>
            <p className="text-sm text-on-surface-variant mt-1">
              {profile.breed || ''} {profile.gender === 'FEMALE' ? t('female') : t('male')} • {calculateAge(profile.birthDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDeleteAnimal}
            className="px-4 py-2.5 rounded-xl border border-error/30 text-error hover:bg-error/10 text-sm font-semibold transition-colors"
          >
            {t('delete')}
          </button>
        </div>
      </Card>

      {/* Stats and Calculations Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <span className="text-xs text-on-surface-variant uppercase tracking-wider">{t('currentWeight')}</span>
          <span className="block text-2xl font-bold text-primary mt-2 font-mono">
            {profile.latestWeight !== null ? `${profile.latestWeight} ${t('kg')}` : '—'}
          </span>
        </Card>

        <Card className="p-4 text-center">
          <span className="text-xs text-on-surface-variant uppercase tracking-wider">{t('weightChange')}</span>
          <span className={`block text-2xl font-bold mt-2 font-mono ${profile.weightDelta && profile.weightDelta > 0 ? 'text-secondary' : profile.weightDelta && profile.weightDelta < 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
            {profile.weightDelta !== null ? `${profile.weightDelta > 0 ? '+' : ''}${profile.weightDelta} ${t('kg')}` : '—'}
          </span>
        </Card>

        <Card className="p-4 text-center">
          <span className="text-xs text-on-surface-variant uppercase tracking-wider">{t('sessions')}</span>
          <span className="block text-2xl font-bold text-on-surface mt-2 font-mono">
            {profile.sessionCount}
          </span>
        </Card>

        {profile.unpaidAmount > 0 && (
          <Card className="p-4 text-center">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider">{t('totalOwed')}</span>
            <span className="block text-2xl font-bold text-secondary mt-2 font-mono">
              {profile.unpaidAmount.toFixed(2)} {tSession('currency')}
            </span>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Owner & Weight tracking */}
        <div className="lg:col-span-2 space-y-6">
          {/* Owner details */}
          <OwnerBlock owner={{
            id: profile.ownerId,
            name: profile.owner.name,
            phone: profile.owner.phone,
            email: profile.owner.email,
            address: profile.owner.address,
            notes: profile.owner.notes,
            animals: [],
          }} />

          {/* Medical History */}
          <Card>
            <h3 className="text-lg font-semibold text-on-surface mb-4">{t('medicalHistory')}</h3>
            <p className="text-sm text-on-surface whitespace-pre-line bg-surface-container p-4 rounded-xl">
              {profile.medicalHistory || t('noMedicalHistory')}
            </p>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-on-surface mb-4">{t('visitsHistory')}</h3>
            {profile.appointments.length === 0 ? (
              <p className="text-sm text-on-surface-variant italic">{t('noAppointmentsYet')}</p>
            ) : (
              <div className="space-y-4">
                {profile.appointments.map((ap) => (
                  <div key={ap.id} className="flex items-center justify-between border-b border-outline/5 pb-4 last:border-0 last:pb-0">
                    <div>
                      <h4 className="text-sm font-semibold text-primary">
                        {formatDate(ap.scheduledAt)}
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {t('doctor')}: {ap.doctor.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={ap.status} />
                      {ap.session && (
                        <Link
                          href={`/sessions/${ap.id}`}
                          className="text-xs font-semibold text-primary hover:underline px-2.5 py-1 bg-primary/10 rounded"
                        >
                          {t('viewSession')}
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-on-surface mb-4">{t('weightHistory')}</h3>

            <form onSubmit={handleAddWeight} className="flex gap-2 mb-6">
              <Input
                type="number"
                step="0.01"
                placeholder="0.0"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="flex-1 text-sm py-2"
              />
              <Button
                type="submit"
                disabled={isSubmittingWeight || !newWeight}
                loading={isSubmittingWeight}
                className="px-4 py-2 text-xs"
              >
                {tForm('save')}
              </Button>
            </form>

            <div className="mb-6">
              <WeightChart records={profile.weightRecords} targetWeight={(profile as any).targetWeight} />
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {profile.weightRecords.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic text-center py-4">{t('noWeightRecords')}</p>
              ) : (
                profile.weightRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between text-sm py-2 border-b border-outline/5 last:border-0">
                    <span className="font-mono text-primary font-medium">{record.weight} {t('kg')}</span>
                    <span className="text-xs text-secondary">{formatDate(record.recordedAt)}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
