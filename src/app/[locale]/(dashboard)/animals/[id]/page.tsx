'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useAnimals, useAnimalProfile, useDeleteAnimal } from '@/hooks/useAnimals'
import { OwnerBlock } from '@/components/owners/OwnerBlock'
import { SpeciesTag } from '@/components/shared/SpeciesTag'
import { StatusBadge } from '@/components/appointments/StatusBadge'
import Link from 'next/link'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

export default function AnimalProfilePage() {
  const params = useParams<{ id: string }>()
  const id = params?.id || ''
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('animal')
  const tForm = useTranslations('form')
  const tPayment = useTranslations('payment')

  const { data: profile, isLoading, error, refetch } = useAnimalProfile(id)
  const deleteMutation = useDeleteAnimal()

  // Weight entry state
  const [newWeight, setNewWeight] = useState('')
  const [isSubmittingWeight, setIsSubmittingWeight] = useState(false)

  const handleDeleteAnimal = async () => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من حذف ملف هذا الحيوان؟' : 'Are you sure you want to delete this animal?')) return
    try {
      await deleteMutation.mutateAsync(id)
      router.push(`/${locale}/animals`)
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
        <p className="text-secondary">{t('noAnimals')}</p>
        <Link href={`/${locale}/animals`} className="mt-4 inline-block text-teal-600 font-semibold hover:underline">
          {locale === 'ar' ? 'الرجوع إلى المرضى' : 'Back to Patients'}
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-outline/10 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-3xl font-bold">
            {profile.name[0]?.toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-primary">{profile.name}</h1>
              <SpeciesTag species={profile.species} />
            </div>
            <p className="text-sm text-secondary mt-1">
              {profile.breed || ''} {profile.gender === 'FEMALE' ? t('female') : t('male')} • {calculateAge(profile.birthDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDeleteAnimal}
            className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-semibold transition-colors"
          >
            {locale === 'ar' ? 'حذف' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Stats and Calculations Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface border border-outline/10 rounded-2xl p-4 text-center">
          <span className="text-xs text-secondary uppercase tracking-wider">{t('currentWeight')}</span>
          <span className="block text-2xl font-bold text-teal-600 mt-2 font-mono">
            {profile.latestWeight !== null ? `${profile.latestWeight} ${t('kg')}` : '—'}
          </span>
        </div>

        <div className="bg-surface border border-outline/10 rounded-2xl p-4 text-center">
          <span className="text-xs text-secondary uppercase tracking-wider">{locale === 'ar' ? 'تغير الوزن' : 'Weight Change'}</span>
          <span className={`block text-2xl font-bold mt-2 font-mono ${profile.weightDelta && profile.weightDelta > 0 ? 'text-amber-500' : profile.weightDelta && profile.weightDelta < 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
            {profile.weightDelta !== null ? `${profile.weightDelta > 0 ? '+' : ''}${profile.weightDelta} ${t('kg')}` : '—'}
          </span>
        </div>

        <div className="bg-surface border border-outline/10 rounded-2xl p-4 text-center">
          <span className="text-xs text-secondary uppercase tracking-wider">{t('sessions')}</span>
          <span className="block text-2xl font-bold text-primary mt-2 font-mono">
            {profile.sessionCount}
          </span>
        </div>

        <div className="bg-surface border border-outline/10 rounded-2xl p-4 text-center">
          <span className="text-xs text-secondary uppercase tracking-wider">{tPayment('remaining')}</span>
          <span className={`block text-2xl font-bold mt-2 font-mono ${profile.unpaidAmount > 0 ? 'text-rose-500' : 'text-teal-600'}`}>
            {profile.unpaidAmount} EGP
          </span>
        </div>
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
          <div className="bg-surface border border-outline/10 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">{t('medicalHistory')}</h3>
            <p className="text-sm text-primary whitespace-pre-line bg-outline/5 p-4 rounded-xl">
              {profile.medicalHistory || (locale === 'ar' ? 'لا يوجد سجل طبي مسجل.' : 'No medical history recorded.')}
            </p>
          </div>

          {/* Appointment/Session History */}
          <div className="bg-surface border border-outline/10 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">
              {locale === 'ar' ? 'سجل الزيارات والمواعيد' : 'Visits & Appointments History'}
            </h3>
            {profile.appointments.length === 0 ? (
              <p className="text-sm text-secondary italic">{locale === 'ar' ? 'لا توجد زيارات سابقة' : 'No appointments yet'}</p>
            ) : (
              <div className="space-y-4">
                {profile.appointments.map((ap) => (
                  <div key={ap.id} className="flex items-center justify-between border-b border-outline/5 pb-4 last:border-0 last:pb-0">
                    <div>
                      <h4 className="text-sm font-semibold text-primary">
                        {formatDate(ap.scheduledAt)}
                      </h4>
                      <p className="text-xs text-secondary mt-0.5">
                        {locale === 'ar' ? 'الطبيب' : 'Doctor'}: {ap.doctor.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={ap.status} />
                      {ap.session && (
                        <Link
                          href={`/${locale}/sessions/${ap.id}`}
                          className="text-xs font-semibold text-teal-600 hover:underline px-2.5 py-1 bg-teal-50 rounded"
                        >
                          {locale === 'ar' ? 'عرض الجلسة' : 'View Session'}
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Weight History & Quick entry */}
        <div className="space-y-6">
          <div className="bg-surface border border-outline/10 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">{t('weightHistory')}</h3>

            <form onSubmit={handleAddWeight} className="flex gap-2 mb-6">
              <input
                type="number"
                step="0.01"
                placeholder="0.0"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-outline/20 bg-surface text-primary outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                disabled={isSubmittingWeight || !newWeight}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition-colors"
              >
                {tForm('save')}
              </button>
            </form>

            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {profile.weightRecords.length === 0 ? (
                <p className="text-xs text-secondary italic text-center py-4">{locale === 'ar' ? 'لا يوجد سجلات وزن' : 'No weight records'}</p>
              ) : (
                profile.weightRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between text-sm py-2 border-b border-outline/5 last:border-0">
                    <span className="font-mono text-primary font-medium">{record.weight} {t('kg')}</span>
                    <span className="text-xs text-secondary">{formatDate(record.recordedAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
