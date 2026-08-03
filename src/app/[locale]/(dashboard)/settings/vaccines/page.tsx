'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { useVaccineCatalog, useCreateVaccine, useUpdateVaccine, useDeleteVaccine, VaccineCatalogEntry } from '@/hooks/useVaccines'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Select } from '@/components/shared/Select'
import { Lock, Syringe, AlertTriangle, Edit2, Trash2 } from 'lucide-react'

export default function VaccinesSettingsPage() {
  const { data: session } = useSession()
  const locale = useLocale()
  // Re-using admin translations for access denied
  const tAdmin = useTranslations('admin')
  const tForm = useTranslations('form')

  const isSuperAdmin = session?.user.role === 'SUPER_ADMIN'
  const isClinicAdmin = session?.user.role === 'CLINIC_ADMIN'
  const isDoctor = session?.user.role === 'DOCTOR'
  const canManage = isSuperAdmin || isClinicAdmin || isDoctor

  const { data: vaccines = [], isLoading, refetch } = useVaccineCatalog()
  const createMutation = useCreateVaccine()
  const updateMutation = useUpdateVaccine()
  const deleteMutation = useDeleteVaccine()

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    species: 'dog',
    isCore: false,
    defaultIntervalDays: '',
    description: '',
  })
  const [error, setError] = useState('')

  if (!canManage) {
    return (
      <div className="p-6 text-center max-w-md mx-auto py-20">
        <Lock className="w-10 h-10 mx-auto mb-4 text-on-surface-variant" />
        <h1 className="text-xl font-bold text-on-surface">{tAdmin('accessDenied', { defaultMessage: 'Access Denied' })}</h1>
        <p className="text-on-surface-variant mt-2">{tAdmin('accessDeniedDesc', { defaultMessage: 'This page is restricted.' })}</p>
      </div>
    )
  }

  const handleOpenNew = () => {
    setEditingId(null)
    setForm({
      name: '',
      species: 'dog',
      isCore: false,
      defaultIntervalDays: '365',
      description: '',
    })
    setError('')
    setShowModal(true)
  }

  const handleOpenEdit = (v: VaccineCatalogEntry) => {
    setEditingId(v.id)
    setForm({
      name: v.name,
      species: v.species,
      isCore: v.isCore,
      defaultIntervalDays: v.defaultIntervalDays ? String(v.defaultIntervalDays) : '',
      description: v.description || '',
    })
    setError('')
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm(locale === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete this vaccine?')) {
      try {
        await deleteMutation.mutateAsync(id)
        refetch()
      } catch (err: any) {
        alert(err.message)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...form,
          defaultIntervalDays: form.defaultIntervalDays ? parseInt(form.defaultIntervalDays) : null,
        })
      } else {
        await createMutation.mutateAsync({
          ...form,
          defaultIntervalDays: form.defaultIntervalDays ? parseInt(form.defaultIntervalDays) : null,
        })
      }
      setShowModal(false)
      refetch()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    }
  }

  const getSpeciesLabel = (species: string) => {
    if (locale === 'ar') {
      if (species === 'dog') return 'كلب'
      if (species === 'cat') return 'قطة'
      if (species === 'both') return 'كلاهما'
    }
    return species.charAt(0).toUpperCase() + species.slice(1)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <PageHeader
        title={locale === 'ar' ? 'إعدادات اللقاحات' : 'Vaccine Settings'}
        subtitle={locale === 'ar' ? 'إدارة كتالوج اللقاحات' : 'Manage the vaccine catalog'}
        action={
          <Button onClick={handleOpenNew} className="px-4 py-2 text-sm">
            + {locale === 'ar' ? 'إضافة لقاح' : 'Add Vaccine'}
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div className="h-32 bg-outline/10 rounded-2xl" />
          <div className="h-32 bg-outline/10 rounded-2xl" />
          <div className="h-32 bg-outline/10 rounded-2xl" />
        </div>
      ) : vaccines.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant">
          {locale === 'ar' ? 'لا يوجد لقاحات مضافة.' : 'No vaccines found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vaccines.map((v) => (
            <Card key={v.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <Syringe size={18} />
                    {v.name}
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenEdit(v)} className="text-secondary hover:text-primary transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(v.id)} className="text-error hover:text-error/80 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v.isCore ? 'bg-error/10 text-error' : 'bg-secondary/10 text-secondary'}`}>
                    {v.isCore ? (locale === 'ar' ? 'أساسي' : 'Core') : (locale === 'ar' ? 'اختياري' : 'Non-Core')}
                  </span>
                  <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container-high text-on-surface">
                    {getSpeciesLabel(v.species)}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-secondary">
                  <p>
                    <strong>{locale === 'ar' ? 'الفاصل الزمني:' : 'Interval:'}</strong> {v.defaultIntervalDays ? `${v.defaultIntervalDays} ${locale === 'ar' ? 'يوم' : 'days'}` : (locale === 'ar' ? 'غير محدد' : 'None')}
                  </p>
                  {v.description && (
                    <p className="text-xs text-on-surface-variant">{v.description}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-outline/10 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-primary">
              {editingId 
                ? (locale === 'ar' ? 'تعديل لقاح' : 'Edit Vaccine')
                : (locale === 'ar' ? 'إضافة لقاح جديد' : 'Add New Vaccine')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-error/10 text-error text-sm rounded-xl flex gap-2 items-center">
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-primary mb-1">{locale === 'ar' ? 'اسم اللقاح' : 'Vaccine Name'} *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-1">{locale === 'ar' ? 'الفصيلة' : 'Species'} *</label>
                <Select
                  required
                  value={form.species}
                  onChange={(e) => setForm({ ...form, species: e.target.value })}
                >
                  <option value="dog">{locale === 'ar' ? 'كلب' : 'Dog'}</option>
                  <option value="cat">{locale === 'ar' ? 'قطة' : 'Cat'}</option>
                  <option value="both">{locale === 'ar' ? 'كلاهما' : 'Both'}</option>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCore"
                  checked={form.isCore}
                  onChange={(e) => setForm({ ...form, isCore: e.target.checked })}
                  className="w-4 h-4 text-primary bg-surface border-outline/20 rounded focus:ring-primary focus:ring-2"
                />
                <label htmlFor="isCore" className="text-sm font-semibold text-primary cursor-pointer">
                  {locale === 'ar' ? 'لقاح أساسي (Core)' : 'Is Core Vaccine'}
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-1">{locale === 'ar' ? 'الفاصل الزمني الافتراضي (بالأيام)' : 'Default Interval (Days)'}</label>
                <input
                  type="number"
                  min="0"
                  value={form.defaultIntervalDays}
                  onChange={(e) => setForm({ ...form, defaultIntervalDays: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-1">{locale === 'ar' ? 'الوصف' : 'Description'}</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-primary outline-none resize-none h-24"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  {tForm('cancel', { defaultMessage: 'Cancel' })}
                </Button>
                <Button type="submit" loading={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 text-sm">
                  {tForm('save', { defaultMessage: 'Save' })}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
