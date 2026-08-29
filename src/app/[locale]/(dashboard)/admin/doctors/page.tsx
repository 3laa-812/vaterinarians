'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { useAdminDoctors, useCreateDoctor, useAdminClinics } from '@/hooks/useAdmin'
import { ZodError } from 'zod'
import { Lock, Mail, Phone, Building2, UserPlus } from 'lucide-react'
import { doctorCreateSchema } from '@/lib/validations/admin.schema'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'

export default function DoctorsPage() {
  const { data: session } = useSession()
  const locale = useLocale()
  const t = useTranslations('admin')
  const tForm = useTranslations('form')

  const isSuperAdmin = session?.user.role === 'SUPER_ADMIN'
  const isClinicAdmin = session?.user.role === 'CLINIC_ADMIN'

  const { data: doctors = [], isLoading: loadingDoctors, refetch: refetchDoctors } = useAdminDoctors()
  const { data: clinics = [] } = useAdminClinics(isSuperAdmin) // Only fetch clinics if super admin for dropdown

  const createDoctorMutation = useCreateDoctor()

  // State
  const [showDoctorModal, setShowDoctorModal] = useState(false)
  const [doctorForm, setDoctorForm] = useState({ name: '', email: '', password: '', phone: '', role: 'DOCTOR' as 'DOCTOR' | 'CLINIC_ADMIN', clinicId: '' })
  const [doctorErrors, setDoctorErrors] = useState<Record<string, string>>({})

  if (!isSuperAdmin && !isClinicAdmin) {
    return (
      <div className="p-6 text-center max-w-md mx-auto py-20">
        <Lock className="w-10 h-10 mx-auto mb-4 text-on-surface-variant" />
        <h1 className="text-xl font-bold text-on-surface">{t('accessDenied')}</h1>
        <p className="text-on-surface-variant mt-2">{t('accessDeniedDesc')}</p>
      </div>
    )
  }

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDoctorErrors({})
    try {
      const payload = {
        ...doctorForm,
        clinicId: isSuperAdmin ? doctorForm.clinicId : session?.user.clinicId || undefined,
      }
      const validated = doctorCreateSchema.parse(payload)
      await createDoctorMutation.mutateAsync(validated)
      setShowDoctorModal(false)
      setDoctorForm({ name: '', email: '', password: '', phone: '', role: 'DOCTOR', clinicId: '' })
      refetchDoctors()
    } catch (err: any) {
      if (err instanceof ZodError) {
        const errs: Record<string, string> = {}
        err.issues.forEach((issue) => {
          errs[issue.path[0] as string] = issue.message
        })
        setDoctorErrors(errs)
      } else {
        setDoctorErrors({ global: err.message })
      }
    }
  }

  const clinicAdminsCount = doctors.filter((d: any) => d.role === 'CLINIC_ADMIN').length;
  const regularDoctorsCount = doctors.filter((d: any) => d.role === 'DOCTOR').length;

  return (
    <div className="bg-mesh min-h-full">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <PageHeader
          title={t('pageTitle')}
          subtitle={t('pageSubtitle')}
        />

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="stat-bar text-primary relative overflow-hidden flex flex-col justify-center h-24 p-6">
            <span className="text-sm font-semibold text-on-surface-variant">{t('doctors')}</span>
            <span className="text-3xl font-bold text-on-surface mt-1">{doctors.length}</span>
          </Card>
          <Card className="stat-bar text-secondary relative overflow-hidden flex flex-col justify-center h-24 p-6">
            <span className="text-sm font-semibold text-on-surface-variant">{t('doctors')}</span>
            <span className="text-3xl font-bold text-on-surface mt-1">{regularDoctorsCount}</span>
          </Card>
          <Card className="stat-bar text-tertiary relative overflow-hidden flex flex-col justify-center h-24 p-6">
            <span className="text-sm font-semibold text-on-surface-variant">{t('clinicAdmins')}</span>
            <span className="text-3xl font-bold text-on-surface mt-1">{clinicAdminsCount}</span>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <UserPlus size={24} />
              {t('doctors')}
            </h2>
            <Button onClick={() => setShowDoctorModal(true)} className="px-4 py-2 text-sm">
              + {t('addDoctor')}
            </Button>
          </div>

          {loadingDoctors ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              <div className="h-32 bg-outline/10 rounded-2xl" />
              <div className="h-32 bg-outline/10 rounded-2xl" />
              <div className="h-32 bg-outline/10 rounded-2xl" />
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">{t('noDoctors')}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {doctors.map((doc: any) => (
                <Card key={doc.id} className="flex flex-col justify-between shadow-medical glass overflow-hidden">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-primary">{doc.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${doc.role === 'CLINIC_ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'}`}>
                        {doc.role === 'CLINIC_ADMIN' ? (t('clinicAdmin')) : (t('doctor'))}
                      </span>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-secondary">
                      <p className="flex items-center gap-2"><Mail size={14} /> {doc.email}</p>
                      <p className="flex items-center gap-2"><Phone size={14} /> {doc.phone || '—'}</p>
                      {doc.clinic && (
                        <p className="flex items-center gap-2 text-xs font-semibold text-teal-600 mt-2">
                          <Building2 size={14} /> {locale === 'ar' && doc.clinic.nameAr ? doc.clinic.nameAr : doc.clinic.name}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Doctor Modal */}
        {showDoctorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-surface border border-outline/10 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-xl font-bold text-primary">{t('addDoctor')}</h3>
              <form onSubmit={handleDoctorSubmit} className="space-y-4">
                {doctorErrors.global && (
                  <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-xl">
                    {doctorErrors.global}
                  </div>
                )}

                {isSuperAdmin && (
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-1">{t('clinic')} *</label>
                    <select
                      required
                      value={doctorForm.clinicId}
                      onChange={(e) => setDoctorForm({ ...doctorForm, clinicId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 outline-none"
                    >
                      <option value="">{t('selectClinic')}</option>
                      {clinics.map((clinic: any) => (
                        <option key={clinic.id} value={clinic.id}>
                          {locale === 'ar' && clinic.nameAr ? clinic.nameAr : clinic.name}
                        </option>
                      ))}
                    </select>
                    {doctorErrors.clinicId && <p className="text-xs text-error mt-1">{doctorErrors.clinicId}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-primary mb-1">{t('name')} *</label>
                  <input
                    type="text"
                    required
                    value={doctorForm.name}
                    onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  {doctorErrors.name && <p className="text-xs text-error mt-1">{doctorErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-1">{t('email')} *</label>
                  <input
                    type="email"
                    required
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  {doctorErrors.email && <p className="text-xs text-error mt-1">{doctorErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-1">{t('password')} *</label>
                  <input
                    type="password"
                    required
                    value={doctorForm.password}
                    onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  {doctorErrors.password && <p className="text-xs text-error mt-1">{doctorErrors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-1">{t('phone')}</label>
                  <input
                    type="text"
                    value={doctorForm.phone}
                    onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-1">{t('role')} *</label>
                  <select
                    required
                    value={doctorForm.role}
                    onChange={(e) => setDoctorForm({ ...doctorForm, role: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="DOCTOR">{t('doctor')}</option>
                    <option value="CLINIC_ADMIN">{t('clinicAdmin')}</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                  <Button type="button" variant="secondary" onClick={() => setShowDoctorModal(false)}>
                    {t('cancel')}
                  </Button>
                  <Button type="submit" loading={createDoctorMutation.isPending} className="px-4 py-2 text-sm">
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
