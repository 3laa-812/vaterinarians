'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { sessionSchema, type SessionInput } from '@/lib/validations/session.schema'
import { calculatePaymentStatus, calculateRemaining } from '@/domain/payment'
import { ZodError } from 'zod'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { Textarea } from '@/components/shared/Textarea'
import { FormField } from '@/components/shared/FormField'
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge'

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

  const initialVisit = splitDateTime(initialData?.nextVisitDate)

  const [formData, setFormData] = useState({
    weight: initialData?.weight ?? undefined as number | undefined,
    clinicalNotes: initialData?.clinicalNotes || '',
    treatmentPlan: initialData?.treatmentPlan || '',
    totalAmount: initialData?.totalAmount || 0,
    paidAmount: initialData?.paidAmount || 0,
    notes: initialData?.notes || '',
  })
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="space-y-4">
        <h3 className="text-lg font-semibold text-on-surface border-b border-outline-variant pb-2">
          {t('clinicalDetails')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label={`${t('weight')} (${tAnimal('kg')})`}>
            <Input
              type="number"
              step="0.01"
              name="weight"
              value={formData.weight === undefined || formData.weight === null ? '' : formData.weight}
              onChange={handleChange}
              placeholder="0.0"
              error={errors.weight}
            />
          </FormField>

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
      </Card>

      <Card className="space-y-4">
        <h3 className="text-lg font-semibold text-on-surface border-b border-outline-variant pb-2">
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
              className="font-mono"
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
              className="font-mono"
              error={errors.paidAmount}
            />
          </FormField>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-surface-container px-4 py-3">
          <span className="text-sm text-on-surface-variant">{tPayment('remaining')}</span>
          <span className={`font-mono font-semibold ${remaining > 0 ? 'text-secondary' : 'text-primary'}`}>
            {remaining.toFixed(2)} {t('currency')}
          </span>
        </div>

        <PaymentStatusBadge status={paymentStatus} />

        <FormField label={tPayment('notes')}>
          <Input
            type="text"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder={t('paymentNotesPlaceholder')}
          />
        </FormField>
      </Card>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
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
