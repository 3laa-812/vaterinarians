'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ownerSchema, type OwnerInput } from '@/lib/validations/owner.schema'
import { ZodError } from 'zod'
import { Button } from '@/components/shared/Button'

interface OwnerFormProps {
  initialData?: Partial<OwnerInput>
  onSubmit: (data: OwnerInput) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function OwnerForm({ initialData, onSubmit, onCancel, isLoading = false }: OwnerFormProps) {
  const t = useTranslations('owner')
  const tForm = useTranslations('form')

  const [formData, setFormData] = useState<OwnerInput>({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    notes: initialData?.notes || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for field
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
      const validated = ownerSchema.parse(formData)
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
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-primary mb-1">
            {t('name')} *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all duration-200"
          />
          {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-primary mb-1">
            {t('phone')} *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all duration-200"
          />
          {errors.phone && <p className="text-xs text-error mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-primary mb-1">
            {t('email')}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all duration-200"
          />
          {errors.email && <p className="text-xs text-error mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-primary mb-1">
            {t('address')}
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all duration-200"
          />
          {errors.address && <p className="text-xs text-error mt-1">{errors.address}</p>}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-primary mb-1">
            {t('notes')}
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
          />
          {errors.notes && <p className="text-xs text-error mt-1">{errors.notes}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-outline-variant pt-6">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            {tForm('back')}
          </Button>
        )}
        <Button type="submit" loading={isLoading} className="min-w-[100px]">
          {tForm('save')}
        </Button>
      </div>
    </form>
  )
}
