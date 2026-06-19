'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { CalendarView } from '@/components/appointments/CalendarView'
import { useCreateAppointment } from '@/hooks/useAppointments'
import { useAnimals } from '@/hooks/useAnimals'
import { ZodError } from 'zod'
import { appointmentSchema } from '@/lib/validations/appointment.schema'

export default function AppointmentsPage() {
  const t = useTranslations('appointment')
  const tForm = useTranslations('form')
  const locale = useLocale()
  const [showAddForm, setShowAddForm] = useState(false)

  // Form states
  const [animalId, setAnimalId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')
  const [notes, setNotes] = useState('')
  const [fee, setFee] = useState('')
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createMutation = useCreateAppointment()
  const { data: animals } = useAnimals()

  useEffect(() => {
    // Fetch doctors
    fetch('/api/doctors')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDoctors(data)
          if (data[0]) setDoctorId(data[0].id)
        }
      })
      .catch((err) => console.error(err))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    try {
      const scheduledAt = new Date(`${date}T${time}:00.000Z`).toISOString()
      const payload = {
        animalId,
        doctorId,
        scheduledAt,
        notes,
        status: 'SCHEDULED' as const,
      }

      const validated = appointmentSchema.parse(payload)
      await createMutation.mutateAsync(validated)
      setShowAddForm(false)
      // Reset form
      setAnimalId('')
      setNotes('')
      setFee('')
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {}
        err.issues.forEach((zodErr) => {
          const path = zodErr.path[0] as string
          fieldErrors[path] = zodErr.message
        })
        setErrors(fieldErrors)

      } else {
        console.error(err)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {locale === 'ar' ? 'المواعيد والجدول' : 'Appointments & Calendar'}
          </h1>
          <p className="text-sm text-secondary mt-1">
            {locale === 'ar' ? 'عرض وحجز مواعيد زيارات المرضى' : 'View, manage and book patient visits'}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all duration-200"
        >
          + {t('new')}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-surface border border-outline/10 rounded-2xl p-6 shadow-sm max-w-2xl">
          <h3 className="text-lg font-semibold text-primary mb-4">{t('new')}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                {locale === 'ar' ? 'اختر الحيوان' : 'Select Animal'} *
              </label>
              <select
                value={animalId}
                onChange={(e) => setAnimalId(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">{locale === 'ar' ? '-- اختر مريضاً --' : '-- Choose Patient --'}</option>
                {animals?.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.owner.name})
                  </option>
                ))}
              </select>
              {errors.animalId && <p className="text-xs text-error mt-1">{errors.animalId}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  {t('date')} *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                />
                {errors.scheduledAt && <p className="text-xs text-error mt-1">{errors.scheduledAt}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  {t('time')} *
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                {t('doctor')} *
              </label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.doctorId && <p className="text-xs text-error mt-1">{errors.doctorId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                {t('notes')}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline/10">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-5 py-2.5 rounded-xl border border-outline/20 text-sm font-medium text-primary hover:bg-outline/5 transition-all duration-200"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-sm font-medium text-white shadow-sm transition-all duration-200"
              >
                {isSubmitting ? '...' : t('book')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Calendar Week View */}
      <CalendarView />
    </div>
  )
}
