'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { sessionSchema, type SessionInput, type MedicationInput } from '@/lib/validations/session.schema'
import { calculatePaymentStatus, calculateRemaining } from '@/domain/payment'
import { ZodError } from 'zod'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { Textarea } from '@/components/shared/Textarea'
import { FormField } from '@/components/shared/FormField'
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge'
import { useLocale } from 'next-intl'

interface SessionFormProps {
  initialData?: Partial<SessionInput>
  onSubmit: (data: SessionInput) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

function splitDateTime(isoOrDate: string | null | undefined): { date: string; time: string } {
  if (!isoOrDate) return { date: '', time: '10:00' }
  const d = new Date(isoOrDate)
  if (Number.isNaN(d.getTime())) {
    return { date: isoOrDate.slice(0, 10), time: '10:00' }
  }
  const date = d.toISOString().slice(0, 10)
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return { date, time }
}

export function SessionForm({ initialData, onSubmit, onCancel, isLoading = false }: SessionFormProps) {
  const t = useTranslations('session')
  const tPayment = useTranslations('payment')
  const tAnimal = useTranslations('animal')
  const locale = useLocale()
  const isRTL = locale === 'ar'

  const initialVisit = splitDateTime(initialData?.nextVisitDate)

  const [formData, setFormData] = useState({
    weight: initialData?.weight ?? undefined as number | undefined,
    chiefComplaint: initialData?.chiefComplaint || '',
    diagnosis: initialData?.diagnosis || '',
    clinicalNotes: initialData?.clinicalNotes || '',
    treatmentPlan: initialData?.treatmentPlan || '',
    totalAmount: initialData?.totalAmount || 0,
    paidAmount: initialData?.paidAmount || 0,
    notes: initialData?.notes || '',
  })
  const [medications, setMedications] = useState<MedicationInput[]>(
    (initialData as any)?.medications || []
  )
  const [nextDate, setNextDate] = useState(initialVisit.date)
  const [nextTime, setNextTime] = useState(initialVisit.time)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const remaining = calculateRemaining(formData.totalAmount, formData.paidAmount)
  const paymentStatus = calculatePaymentStatus(formData.totalAmount, formData.paidAmount)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    let processedValue: string | number | undefined = value

    if (name === 'weight') {
      processedValue = value === '' ? undefined : parseFloat(value)
    } else if (name === 'totalAmount' || name === 'paidAmount') {
      processedValue = value === '' ? 0 : parseFloat(value)
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }))

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const combinedDateTime =
      nextDate && nextTime ? new Date(`${nextDate}T${nextTime}`).toISOString() : null

    try {
      const validated = sessionSchema.parse({
        ...formData,
        weight: formData.weight === undefined ? null : formData.weight,
        nextVisitDate: combinedDateTime,
        medications,
      })
      await onSubmit(validated)
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {}
        err.issues.forEach((zodErr) => {
          const path = zodErr.path[0] as string
          fieldErrors[path] = zodErr.message
        })
        setErrors(fieldErrors)
      } else if (err instanceof Error) {
        alert(err.message)
      } else {
        alert(String(err))
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="space-y-8 p-6 md:p-8">
        
        {/* Section: Clinical Details */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-on-surface">
            {t('clinicalDetails')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <FormField label={`${t('weight')} (${tAnimal('kg')})`}>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  name="weight"
                  className="text-2xl font-bold font-mono h-14 bg-surface-container-low border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-xl"
                  style={{ paddingLeft: isRTL ? '1rem' : '4rem', paddingRight: isRTL ? '4rem' : '1rem' }}
                  value={formData.weight === undefined || formData.weight === null ? '' : formData.weight}
                  onChange={handleChange}
                  placeholder="0.00"
                />
                <span className={`absolute top-1/2 -translate-y-1/2 text-on-surface-variant font-medium ${isRTL ? 'end-4' : 'start-4'}`}>
                  {tAnimal('kg')}
                </span>
              </div>
              {errors.weight && <p className="text-error text-xs mt-1">{errors.weight}</p>}
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label={t('nextVisitDate')}>
                <Input
                  type="date"
                  name="nextVisitDate"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                />
              </FormField>

              <FormField label={t('nextVisitTime')}>
                <Input
                  type="time"
                  name="nextVisitTime"
                  value={nextTime}
                  onChange={(e) => setNextTime(e.target.value)}
                />
              </FormField>
            </div>
          </div>

          <FormField label={t('chiefComplaint')}>
            <Input
              name="chiefComplaint"
              value={formData.chiefComplaint}
              onChange={handleChange}
              placeholder={t('chiefComplaintPlaceholder')}
            />
          </FormField>

          <FormField label={t('diagnosis')}>
            <Textarea
              name="diagnosis"
              rows={2}
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder={t('diagnosisPlaceholder')}
            />
          </FormField>

          <FormField label={t('clinicalNotes')}>
            <Textarea
              name="clinicalNotes"
              rows={3}
              value={formData.clinicalNotes}
              onChange={handleChange}
              placeholder={t('clinicalNotesPlaceholder')}
            />
          </FormField>

          <FormField label={t('treatmentPlan')}>
            <Textarea
              name="treatmentPlan"
              rows={3}
              value={formData.treatmentPlan}
              onChange={handleChange}
              placeholder={t('treatmentPlanPlaceholder')}
            />
          </FormField>
        </div>

        <hr className="border-outline-variant/60" />

        {/* Section: Medications */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-on-surface">{t('medications')}</h3>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setMedications(prev => [
                ...prev,
                { name: '', dosage: '', duration: '', notes: '' }
              ])}
              className="text-xs px-3 py-1.5"
            >
              + {t('addMedication')}
            </Button>
          </div>

          {medications.length === 0 && (
            <div className="bg-surface-container rounded-xl p-4 text-center">
              <p className="text-sm text-on-surface-variant font-medium">{t('noMedications')}</p>
            </div>
          )}

          <div className="space-y-4">
            {medications.map((med, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-surface-container-low border border-outline-variant/50 rounded-xl relative group">
                <FormField label={t('medicationName')} required>
                  <Input
                    value={med.name}
                    onChange={(e) => {
                      const updated = [...medications]
                      updated[index] = { ...updated[index], name: e.target.value }
                      setMedications(updated)
                    }}
                    placeholder={t('medicationNamePlaceholder')}
                  />
                </FormField>
                <FormField label={t('medicationDosage')} required>
                  <Input
                    value={med.dosage}
                    onChange={(e) => {
                      const updated = [...medications]
                      updated[index] = { ...updated[index], dosage: e.target.value }
                      setMedications(updated)
                    }}
                    placeholder={t('medicationDosagePlaceholder')}
                  />
                </FormField>
                <FormField label={t('medicationDuration')} required>
                  <div className="flex gap-2">
                    <Input
                      value={med.duration}
                      onChange={(e) => {
                        const updated = [...medications]
                        updated[index] = { ...updated[index], duration: e.target.value }
                        setMedications(updated)
                      }}
                      placeholder={t('medicationDurationPlaceholder')}
                    />
                    <button
                      type="button"
                      onClick={() => setMedications(prev => prev.filter((_, i) => i !== index))}
                      className="text-error bg-error/10 hover:bg-error/20 w-10 h-10 flex items-center justify-center rounded-lg transition-colors flex-shrink-0"
                      aria-label="Remove medication"
                    >
                      ✕
                    </button>
                  </div>
                </FormField>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-outline-variant/60" />

        {/* Section: Billing Payment */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-on-surface">
            {t('billingPayment')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={`${tPayment('fee')} (${t('currency')})`} required>
              <Input
                type="number"
                name="totalAmount"
                value={formData.totalAmount || ''}
                onChange={handleChange}
                required
                className="font-mono bg-surface-container-low"
                error={errors.totalAmount}
              />
            </FormField>

            <FormField label={`${tPayment('paid')} (${t('currency')})`} required>
              <Input
                type="number"
                name="paidAmount"
                value={formData.paidAmount || ''}
                onChange={handleChange}
                required
                className="font-mono bg-surface-container-low"
                error={errors.paidAmount}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-surface-container px-4 py-4 border border-outline-variant/50">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-on-surface-variant">{tPayment('remaining')}</span>
              <PaymentStatusBadge status={paymentStatus} />
            </div>
            <span className={`font-mono text-lg font-bold ${remaining > 0 ? 'text-secondary' : 'text-primary'}`}>
              {remaining.toFixed(2)} {t('currency')}
            </span>
          </div>

          <FormField label={tPayment('notes')}>
            <Input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder={t('paymentNotesPlaceholder')}
            />
          </FormField>
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3 mt-6">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            {t('cancel')}
          </Button>
        )}
        <Button type="submit" loading={isLoading} className="min-w-[150px]">
          {t('save')}
        </Button>
      </div>
    </form>
  )
}
