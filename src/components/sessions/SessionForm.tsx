'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { sessionSchema, type SessionInput } from '@/lib/validations/session.schema'
import { ZodError } from 'zod'

interface SessionFormProps {
  initialData?: Partial<SessionInput>
  onSubmit: (data: SessionInput) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function SessionForm({ initialData, onSubmit, onCancel, isLoading = false }: SessionFormProps) {
  const t = useTranslations('session')
  const tPayment = useTranslations('payment')
  const locale = useLocale()

  const [formData, setFormData] = useState<SessionInput>({
    weight: initialData?.weight || undefined,
    clinicalNotes: initialData?.clinicalNotes || '',
    treatmentPlan: initialData?.treatmentPlan || '',
    nextVisitDate: initialData?.nextVisitDate || '',
    totalAmount: initialData?.totalAmount || 0,
    paidAmount: initialData?.paidAmount || 0,
    notes: initialData?.notes || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    let processedValue: any = value

    if (name === 'weight') {
      processedValue = value === '' ? undefined : parseFloat(value)
    } else if (name === 'totalAmount' || name === 'paidAmount') {
      processedValue = value === '' ? 0 : parseFloat(value)
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }))

    // Clear error
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

    try {
      const validated = sessionSchema.parse({
        ...formData,
        weight: formData.weight === undefined ? null : formData.weight,
        nextVisitDate: formData.nextVisitDate || null,
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
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Clinical Section */}
      <div className="bg-surface border border-outline/10 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-teal-600 border-b border-outline/5 pb-2">
          {locale === 'ar' ? 'البيانات السريرية' : 'Clinical Details'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-primary mb-1">
              {t('weight')} ({locale === 'ar' ? 'كجم' : 'kg'})
            </label>
            <input
              type="number"
              step="0.01"
              id="weight"
              name="weight"
              value={formData.weight === undefined || formData.weight === null ? '' : formData.weight}
              onChange={handleChange}
              placeholder="0.0"
              className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 outline-none transition-all"
            />
            {errors.weight && <p className="text-xs text-error mt-1">{errors.weight}</p>}
          </div>

          <div>
            <label htmlFor="nextVisitDate" className="block text-sm font-medium text-primary mb-1">
              {t('nextVisit')}
            </label>
            <input
              type="date"
              id="nextVisitDate"
              name="nextVisitDate"
              value={formData.nextVisitDate || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="clinicalNotes" className="block text-sm font-medium text-primary mb-1">
            {t('clinicalNotes')}
          </label>
          <textarea
            id="clinicalNotes"
            name="clinicalNotes"
            rows={3}
            value={formData.clinicalNotes}
            onChange={handleChange}
            placeholder={locale === 'ar' ? 'اكتب ملاحظات الفحص والتشخيص...' : 'Write clinical observations...'}
            className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none"
          />
        </div>

        <div>
          <label htmlFor="treatmentPlan" className="block text-sm font-medium text-primary mb-1">
            {t('treatmentPlan')}
          </label>
          <textarea
            id="treatmentPlan"
            name="treatmentPlan"
            rows={3}
            value={formData.treatmentPlan}
            onChange={handleChange}
            placeholder={locale === 'ar' ? 'اكتب العلاج والأدوية وخطة التمرين والجرعات...' : 'Specify medications, dosages, exercises...'}
            className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none"
          />
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-surface border border-outline/10 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-teal-600 border-b border-outline/5 pb-2">
          {locale === 'ar' ? 'الرسوم والدفع' : 'Billing & Payment'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="totalAmount" className="block text-sm font-medium text-primary mb-1">
              {tPayment('fee')} (EGP) *
            </label>
            <input
              type="number"
              id="totalAmount"
              name="totalAmount"
              value={formData.totalAmount || ''}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 outline-none transition-all font-mono"
            />
            {errors.totalAmount && <p className="text-xs text-error mt-1">{errors.totalAmount}</p>}
          </div>

          <div>
            <label htmlFor="paidAmount" className="block text-sm font-medium text-primary mb-1">
              {tPayment('paid')} (EGP) *
            </label>
            <input
              type="number"
              id="paidAmount"
              name="paidAmount"
              value={formData.paidAmount || ''}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 outline-none transition-all font-mono"
            />
            {errors.paidAmount && <p className="text-xs text-error mt-1">{errors.paidAmount}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-primary mb-1">
            {tPayment('notes')}
          </label>
          <input
            type="text"
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder={locale === 'ar' ? 'كاش، فودافون كاش، دفع لاحق...' : 'Cash, Vodafone Cash, unpaid...'}
            className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline/10">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-3 rounded-xl border border-outline/20 text-sm font-medium text-primary hover:bg-outline/5 transition-all"
          >
            {t('cancel')}
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-sm font-medium text-white shadow-sm transition-all flex items-center justify-center min-w-[150px]"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            t('save')
          )}
        </button>
      </div>
    </form>
  )
}
