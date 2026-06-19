'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/lib/i18n-navigation'
import { useSession } from 'next-auth/react'

export default function NewDoctorPage() {
  const t = useTranslations('admin')
  const locale = useLocale()
  const router = useRouter()
  const { data: session } = useSession()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    clinicId: session?.user.clinicId ?? '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/admin/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        role: 'DOCTOR',
        clinicId: session?.user.role === 'SUPER_ADMIN' ? form.clinicId : session?.user.clinicId,
      }),
    })

    const json = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(locale === 'ar' ? json.error?.ar : json.error?.en)
      return
    }

    router.push('/admin/clinics')
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-on-surface mb-6">{t('addDoctor')}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { name: 'name', type: 'text', label: t('doctorName') },
          { name: 'email', type: 'email', label: t('email') },
          { name: 'password', type: 'password', label: t('password') },
          { name: 'phone', type: 'tel', label: t('phone') },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
              {field.label}
            </label>
            <input
              type={field.type}
              name={field.name}
              value={form[field.name as keyof typeof form]}
              onChange={handleChange}
              required={field.name !== 'phone'}
              className="w-full rounded-xl bg-surface-container border border-outline-variant px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        ))}

        {session?.user.role === 'SUPER_ADMIN' && (
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
              {t('clinicName')}
            </label>
            <input
              type="text"
              name="clinicId"
              value={form.clinicId}
              onChange={handleChange}
              required
              className="w-full rounded-xl bg-surface-container border border-outline-variant px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-error bg-error-container/30 rounded-lg px-3 py-2 border border-error/20">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary text-on-primary font-semibold py-3 hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {loading ? '...' : t('createDoctor')}
        </button>
      </form>
    </div>
  )
}
