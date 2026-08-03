'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { useAdminClinics, useCreateClinic } from '@/hooks/useAdmin'
import { ZodError } from 'zod'
import { Lock, MapPin, Phone, Building2 } from 'lucide-react'
import { clinicCreateSchema } from '@/lib/validations/admin.schema'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'

export default function ClinicsPage() {
  const { data: session } = useSession()
  const locale = useLocale()
  const t = useTranslations('admin')
  const tForm = useTranslations('form')

  const isSuperAdmin = session?.user.role === 'SUPER_ADMIN'

  const { data: clinics = [], isLoading: loadingClinics } = useAdminClinics(isSuperAdmin)
  const createClinicMutation = useCreateClinic()

  // State
  const [showClinicModal, setShowClinicModal] = useState(false)
  const [clinicForm, setClinicForm] = useState({ name: '', nameAr: '', address: '', phone: '' })
  const [clinicErrors, setClinicErrors] = useState<Record<string, string>>({})

  if (!isSuperAdmin) {
    return (
      <div className="p-6 text-center max-w-md mx-auto py-20">
        <Lock className="w-10 h-10 mx-auto mb-4 text-on-surface-variant" />
        <h1 className="text-xl font-bold text-on-surface">{t('accessDenied')}</h1>
        <p className="text-on-surface-variant mt-2">{t('accessDeniedDesc')}</p>
      </div>
    )
  }

  const handleClinicSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setClinicErrors({})
    try {
      const validated = clinicCreateSchema.parse(clinicForm)
      await createClinicMutation.mutateAsync(validated)
      setShowClinicModal(false)
      setClinicForm({ name: '', nameAr: '', address: '', phone: '' })
    } catch (err) {
      if (err instanceof ZodError) {
        const errs: Record<string, string> = {}
        err.issues.forEach((issue) => {
          errs[issue.path[0] as string] = issue.message
        })
        setClinicErrors(errs)
      }
    }
  }

  return (
    <div className="bg-mesh min-h-full">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <PageHeader
          title={t('pageTitle')}
          subtitle={t('pageSubtitle')}
        />

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="stat-bar text-primary relative overflow-hidden flex flex-col justify-center h-24 p-6">
            <span className="text-sm font-semibold text-on-surface-variant">{t('clinics')}</span>
            <span className="text-3xl font-bold text-on-surface mt-1">{clinics.length}</span>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <Building2 size={24} />
              {t('clinics')}
            </h2>
            <Button onClick={() => setShowClinicModal(true)} className="px-4 py-2 text-sm">
              + {t('addClinic')}
            </Button>
          </div>

          {loadingClinics ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              <div className="h-32 bg-outline/10 rounded-2xl" />
              <div className="h-32 bg-outline/10 rounded-2xl" />
              <div className="h-32 bg-outline/10 rounded-2xl" />
            </div>
          ) : clinics.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">{t('noClinics')}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {clinics.map((clinic: any) => (
                <Card key={clinic.id} className="relative shadow-medical glass overflow-hidden">
                  <h3 className="text-lg font-bold text-primary">
                    {locale === 'ar' && clinic.nameAr ? clinic.nameAr : clinic.name}
                  </h3>
                  {clinic.nameAr && locale !== 'ar' && (
                    <p className="text-xs text-secondary">{clinic.nameAr}</p>
                  )}
                  <div className="mt-4 space-y-2 text-sm text-secondary">
                    <p className="flex items-center gap-2"><MapPin size={14} /> {clinic.address || '—'}</p>
                    <p className="flex items-center gap-2"><Phone size={14} /> {clinic.phone || '—'}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Clinic Modal */}
        {showClinicModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-surface border border-outline/10 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-xl font-bold text-primary">{t('addClinic')}</h3>
              <form onSubmit={handleClinicSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-1">{t('clinicName')} *</label>
                  <input
                    type="text"
                    required
                    value={clinicForm.name}
                    onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  {clinicErrors.name && <p className="text-xs text-error mt-1">{clinicErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-1">{t('clinicNameAr')}</label>
                  <input
                    type="text"
                    value={clinicForm.nameAr}
                    onChange={(e) => setClinicForm({ ...clinicForm, nameAr: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-1">{locale === 'ar' ? 'العنوان' : 'Address'}</label>
                  <input
                    type="text"
                    value={clinicForm.address}
                    onChange={(e) => setClinicForm({ ...clinicForm, address: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-1">{locale === 'ar' ? 'الهاتف' : 'Phone'}</label>
                  <input
                    type="text"
                    value={clinicForm.phone}
                    onChange={(e) => setClinicForm({ ...clinicForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                  <Button type="button" variant="secondary" onClick={() => setShowClinicModal(false)}>
                    {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button type="submit" loading={createClinicMutation.isPending} className="px-4 py-2 text-sm">
                    {tForm('save')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
