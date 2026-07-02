'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Plus } from 'lucide-react'
import { CalendarView } from '@/components/appointments/CalendarView'
import { useCreateAppointment } from '@/hooks/useAppointments'
import { useAnimals } from '@/hooks/useAnimals'
import { useDoctors } from '@/hooks/useDoctors'
import { useClinicSettings } from '@/hooks/useClinicSettings'
import { ZodError } from 'zod'
import { appointmentSchema } from '@/lib/validations/appointment.schema'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { FormField } from '@/components/shared/FormField'
import { Input } from '@/components/shared/Input'
import { Select } from '@/components/shared/Select'
import { Textarea } from '@/components/shared/Textarea'

export default function AppointmentsPage() {
  const t = useTranslations('appointment')
  const tSession = useTranslations('session')
  const [showAddForm, setShowAddForm] = useState(false)

  const [animalId, setAnimalId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')
  const [fee, setFee] = useState(0)
  const [feeManuallyEdited, setFeeManuallyEdited] = useState(false)
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createMutation = useCreateAppointment()
  const { data: animalsData } = useAnimals(1, 100)
  const animals = animalsData?.animals
  const { data: clinic } = useClinicSettings()
  const { data: doctors = [] } = useDoctors()

  useEffect(() => {
    if (doctors[0] && !doctorId) {
      setDoctorId(doctors[0].id)
    }
  }, [doctors, doctorId])

  useEffect(() => {
    if (clinic && !feeManuallyEdited) {
      setFee(clinic.defaultSessionFee)
    }
  }, [clinic, feeManuallyEdited])

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
        fee,
        status: 'SCHEDULED' as const,
      }

      const validated = appointmentSchema.parse(payload)
      await createMutation.mutateAsync(validated)
      setShowAddForm(false)
      setAnimalId('')
      setNotes('')
      setFeeManuallyEdited(false)
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
      <PageHeader
        title={t('pageTitle')}
        subtitle={t('pageSubtitle')}
        action={
          <Button onClick={() => setShowAddForm(true)} className="inline-flex items-center gap-2">
            <Plus size={18} />
            {t('new')}
          </Button>
        }
      />

      {showAddForm && (
        <Card className="max-w-2xl">
          <h3 className="text-lg font-semibold text-on-surface mb-4">{t('new')}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label={t('selectAnimal')} required>
              <Select
                value={animalId}
                onChange={(e) => setAnimalId(e.target.value)}
                required
                error={errors.animalId}
              >
                <option value="">{t('selectPatientPlaceholder')}</option>
                {animals?.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.owner.name})
                  </option>
                ))}
              </Select>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label={t('date')} required>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  error={errors.scheduledAt}
                />
              </FormField>

              <FormField label={t('time')} required>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </FormField>
            </div>

            <FormField label={t('doctor')} required>
              <Select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                required
                error={errors.doctorId}
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label={`${t('fee')} (${tSession('currency')})`}>
              <Input
                type="number"
                min={0}
                value={fee}
                onChange={(e) => {
                  setFeeManuallyEdited(true)
                  setFee(parseFloat(e.target.value) || 0)
                }}
                className="font-mono"
              />
            </FormField>

            <FormField label={t('notes')}>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </FormField>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
              <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {t('book')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <CalendarView />
    </div>
  )
}
