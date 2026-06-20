'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { useAdmin } from '@/hooks/useAdmin'
import { ZodError } from 'zod'
import { clinicCreateSchema, doctorCreateSchema } from '@/lib/validations/admin.schema'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'

export default function AdminPage() {
  const { data: session } = useSession()
  const locale = useLocale()
  const t = useTranslations('admin')
  const tForm = useTranslations('form')

  const { useGetClinics, useCreateClinic, useGetDoctors, useCreateDoctor } = useAdmin()

  const isSuperAdmin = session?.user.role === 'SUPER_ADMIN'
  const isClinicAdmin = session?.user.role === 'CLINIC_ADMIN'

  // Fetch data
  const { data: clinics = [], isLoading: loadingClinics } = useGetClinics(isSuperAdmin)
  const { data: doctors = [], isLoading: loadingDoctors, refetch: refetchDoctors } = useGetDoctors()

  const createClinicMutation = useCreateClinic()
  const createDoctorMutation = useCreateDoctor()

  // State
  const [activeTab, setActiveTab] = useState<'clinics' | 'doctors'>(isSuperAdmin ? 'clinics' : 'doctors')
  const [showClinicModal, setShowClinicModal] = useState(false)
  const [showDoctorModal, setShowDoctorModal] = useState(false)

  // Form states
  const [clinicForm, setClinicForm] = useState({ name: '', nameAr: '', address: '', phone: '' })
  const [doctorForm, setDoctorForm] = useState({ name: '', email: '', password: '', phone: '', role: 'DOCTOR' as 'DOCTOR' | 'CLINIC_ADMIN', clinicId: '' })

  const [clinicErrors, setClinicErrors] = useState<Record<string, string>>({})
  const [doctorErrors, setDoctorErrors] = useState<Record<string, string>>({})

  if (!isSuperAdmin && !isClinicAdmin) {
    return (
      <div className="p-6 text-center max-w-md mx-auto py-20">
        <span className="text-4xl block mb-4">🔒</span>
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

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <PageHeader
        title={t('pageTitle')}
        subtitle={t('pageSubtitle')}
        action={
          <div className="flex bg-outline/5 p-1 rounded-xl self-start sm:self-auto">
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('clinics')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'clinics'
                    ? 'bg-surface-container text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t('clinics')}
              </button>
            )}
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'doctors' || !isSuperAdmin
                  ? 'bg-surface-container text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t('doctors')}
            </button>
          </div>
        }
      />

      {/* CLINICTAB */}
      {activeTab === 'clinics' && isSuperAdmin && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary">{t('clinics')}</h2>
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
                <Card key={clinic.id}>
                  <h3 className="text-lg font-bold text-primary">
                    {locale === 'ar' && clinic.nameAr ? clinic.nameAr : clinic.name}
                  </h3>
                  {clinic.nameAr && locale !== 'ar' && (
                    <p className="text-xs text-secondary">{clinic.nameAr}</p>
                  )}
                  <div className="mt-4 space-y-1 text-sm text-secondary">
                    <p>📍 {clinic.address || '—'}</p>
                    <p>📞 {clinic.phone || '—'}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DOCTORTAB */}
      {activeTab === 'doctors' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary">{t('doctors')}</h2>
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
                <Card key={doc.id} className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-primary">{doc.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${doc.role === 'CLINIC_ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'}`}>
                        {doc.role === 'CLINIC_ADMIN' ? (locale === 'ar' ? 'مسؤول عيادة' : 'Clinic Admin') : (locale === 'ar' ? 'طبيب' : 'Doctor')}
                      </span>
                    </div>
                    <div className="mt-4 space-y-1 text-sm text-secondary">
                      <p>✉️ {doc.email}</p>
                      <p>📞 {doc.phone || '—'}</p>
                      {doc.clinic && (
                        <p className="text-xs font-semibold text-teal-600 mt-2">
                          🏥 {locale === 'ar' && doc.clinic.nameAr ? doc.clinic.nameAr : doc.clinic.name}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

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
                  <label className="block text-sm font-semibold text-primary mb-1">{locale === 'ar' ? 'العيادة' : 'Clinic'} *</label>
                  <select
                    required
                    value={doctorForm.clinicId}
                    onChange={(e) => setDoctorForm({ ...doctorForm, clinicId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="">{locale === 'ar' ? 'اختر العيادة...' : 'Select clinic...'}</option>
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
                <label className="block text-sm font-semibold text-primary mb-1">{locale === 'ar' ? 'الاسم' : 'Name'} *</label>
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
                <label className="block text-sm font-semibold text-primary mb-1">{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'} *</label>
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
                <label className="block text-sm font-semibold text-primary mb-1">{locale === 'ar' ? 'كلمة المرور' : 'Password'} *</label>
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
                <label className="block text-sm font-semibold text-primary mb-1">{locale === 'ar' ? 'الهاتف' : 'Phone'}</label>
                <input
                  type="text"
                  value={doctorForm.phone}
                  onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-1">{locale === 'ar' ? 'الدور / الصلاحية' : 'Role'} *</label>
                <select
                  required
                  value={doctorForm.role}
                  onChange={(e) => setDoctorForm({ ...doctorForm, role: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="DOCTOR">{locale === 'ar' ? 'طبيب' : 'Doctor'}</option>
                  <option value="CLINIC_ADMIN">{locale === 'ar' ? 'مسؤول عيادة' : 'Clinic Admin'}</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <Button type="button" variant="secondary" onClick={() => setShowDoctorModal(false)}>
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
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
  )
}
