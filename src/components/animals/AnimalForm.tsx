'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { animalSchema, type AnimalInput } from '@/lib/validations/animal.schema'
import { useOwners, useCreateOwner } from '@/hooks/useOwners'
import { ZodError } from 'zod'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { Button } from '@/components/shared/Button'
import { Modal } from '@/components/shared/Modal'
import { GuardianQRModal } from '@/components/guardian/GuardianQRModal'

interface AnimalFormProps {
  initialData?: Partial<AnimalInput> & { owner?: { id: string; name: string } }
  onSubmit: (data: AnimalInput) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function AnimalForm({ initialData, onSubmit, onCancel, isLoading = false }: AnimalFormProps) {
  const t = useTranslations('form')
  const tOwner = useTranslations('owner')
  const tAnimal = useTranslations('animal')

  const [step, setStep] = useState<1 | 2>(initialData?.ownerId ? 2 : 1)
  const [ownerMode, setOwnerMode] = useState<'search' | 'create'>('search')
  const [phoneSearch, setPhoneSearch] = useState('')
  const [selectedOwner, setSelectedOwner] = useState<{ id: string; name: string; phone: string } | null>(
    initialData?.owner ? { id: initialData.ownerId!, name: initialData.owner.name, phone: '' } : null
  )

  const { data: ownersData, isLoading: isSearchingOwners } = useOwners(phoneSearch)
  const owners = ownersData?.owners
  const createOwnerMutation = useCreateOwner()
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'
  const [clinics, setClinics] = useState<{id: string, name: string}[]>([])
  const [createdQrToken, setCreatedQrToken] = useState<string | null>(null)

  useEffect(() => {
    if (isSuperAdmin) {
      fetch('/api/admin/clinics')
        .then(res => res.json())
        .then(data => setClinics(data.data?.clinics || []))
    }
  }, [isSuperAdmin])

  // New Owner Form State
  const [newOwnerData, setNewOwnerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  })

  // Animal Form State
  const [animalData, setAnimalData] = useState<Omit<AnimalInput, 'ownerId'>>({
    name: initialData?.name || '',
    species: initialData?.species || 'dog',
    breed: initialData?.breed || '',
    gender: initialData?.gender || 'MALE',
    birthDate: initialData?.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : '',
    color: initialData?.color || '',
    medicalHistory: initialData?.medicalHistory || '',
    notes: initialData?.notes || '',
    clinicId: initialData?.clinicId || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAnimalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setAnimalData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleNewOwnerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewOwnerData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleNextStep = async () => {
    setErrors({})

    if (ownerMode === 'search') {
      if (!selectedOwner) {
        setErrors({ owner: 'Please select an owner' })
        return
      }
      setStep(2)
    } else {
      // Validate and Create Owner
      try {
        if (!newOwnerData.name || !newOwnerData.phone) {
          setErrors({
            name: !newOwnerData.name ? 'Name is required' : '',
            phone: !newOwnerData.phone ? 'Phone is required' : '',
          })
          return
        }

        const res = await createOwnerMutation.mutateAsync({
          name: newOwnerData.name,
          phone: newOwnerData.phone,
          email: newOwnerData.email,
          address: newOwnerData.address,
          notes: newOwnerData.notes,
        })

        if (res.qrToken) {
          setCreatedQrToken(res.qrToken)
        }
        setSelectedOwner({ id: res.owner.id, name: res.owner.name, phone: res.owner.phone })
        setStep(2)
      } catch (err: any) {
        setErrors({ ownerCreation: err.message })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOwner) return

    try {
      const payload: AnimalInput = {
        ...animalData,
        ownerId: selectedOwner.id,
      }
      const validated = animalSchema.parse(payload)
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
    <div className="space-y-6">
      {/* Steps Progress Indicator */}
      <div className="flex items-center justify-center gap-4 border-b border-outline/10 pb-6">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`flex items-center gap-2 text-sm font-semibold transition-colors ${step === 1 ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${step === 1 ? 'bg-teal-600 text-white border-transparent' : 'border-outline/30'}`}>
            1
          </span>
          {t('step2')}
        </button>
        <div className="h-px bg-outline/20 w-12" />
        <div className={`flex items-center gap-2 text-sm font-semibold ${step === 2 ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${step === 2 ? 'bg-teal-600 text-white border-transparent' : 'border-outline/30'}`}>
            2
          </span>
          {t('step1')}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="flex gap-2 p-1 bg-outline/5 rounded-xl border border-outline/10">
            <button
              type="button"
              onClick={() => setOwnerMode('search')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${ownerMode === 'search' ? 'bg-surface-container text-primary shadow-sm' : 'text-on-surface-variant'}`}
            >
              {tOwner('existingOwner')}
            </button>
            <button
              type="button"
              onClick={() => setOwnerMode('create')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${ownerMode === 'create' ? 'bg-surface-container text-primary shadow-sm' : 'text-on-surface-variant'}`}
            >
              {tOwner('newOwner')}
            </button>
          </div>

          {ownerMode === 'search' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  {tOwner('searchByPhone')}
                </label>
                <input
                  type="text"
                  placeholder={tOwner('search')}
                  value={phoneSearch}
                  onChange={(e) => setPhoneSearch(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>

              {phoneSearch && (
                <div className="border border-outline/10 rounded-xl overflow-hidden divide-y divide-outline/10 bg-surface max-h-[200px] overflow-y-auto">
                  {isSearchingOwners ? (
                    <div className="p-4 text-sm text-secondary text-center animate-pulse">
                      ...
                    </div>
                  ) : owners?.length === 0 ? (
                    <div className="p-4 text-sm text-secondary text-center">
                      {tOwner('noOwners')}
                    </div>
                  ) : (
                    owners?.map((owner) => (
                      <button
                        key={owner.id}
                        type="button"
                        onClick={() => setSelectedOwner(owner)}
                        className={`w-full text-start p-3 text-sm hover:bg-outline/5 transition-colors flex justify-between items-center ${selectedOwner?.id === owner.id ? 'bg-primary/10 text-primary' : 'text-on-surface'}`}
                      >
                        <div>
                          <p className="font-medium">{owner.name}</p>
                          <p className="text-xs text-secondary mt-0.5">{owner.phone}</p>
                        </div>
                        {selectedOwner?.id === owner.id && <span className="text-xs">✓</span>}
                      </button>
                    ))
                  )}
                </div>
              )}

              {selectedOwner && (
                <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-teal-600 font-semibold uppercase">{tOwner('existingOwner')}</span>
                    <h4 className="text-sm font-semibold text-primary mt-0.5">{selectedOwner.name}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedOwner(null)}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}
              {errors.owner && <p className="text-xs text-error">{errors.owner}</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  {tOwner('name')} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newOwnerData.name}
                  onChange={handleNewOwnerChange}
                  className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                />
                {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  {tOwner('phone')} *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={newOwnerData.phone}
                  onChange={handleNewOwnerChange}
                  className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                />
                {errors.phone && <p className="text-xs text-error mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  {tOwner('address')}
                </label>
                <input
                  type="text"
                  name="address"
                  value={newOwnerData.address}
                  onChange={handleNewOwnerChange}
                  className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              {errors.ownerCreation && <p className="text-xs text-error">{errors.ownerCreation}</p>}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
            {onCancel && (
              <Button type="button" variant="secondary" onClick={onCancel}>
                {t('back')}
              </Button>
            )}
            <Button
              type="button"
              onClick={handleNextStep}
              loading={createOwnerMutation.isPending}
            >
              {createOwnerMutation.isPending ? 'Saving Owner...' : t('next')}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-primary mb-1">
                {t('animalName')} *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={animalData.name}
                onChange={handleAnimalChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              />
              {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="species" className="block text-sm font-medium text-primary mb-1">
                  {t('species')} *
                </label>
                <select
                  id="species"
                  name="species"
                  value={animalData.species}
                  onChange={handleAnimalChange}
                  className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="dog">Dog / كلب</option>
                  <option value="cat">Cat / قطة</option>
                  <option value="bird">Bird / طائر</option>
                  <option value="other">Other / آخر</option>
                </select>
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-primary mb-1">
                  {t('gender')}
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={animalData.gender || 'MALE'}
                  onChange={handleAnimalChange}
                  className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="MALE">{tAnimal('male')}</option>
                  <option value="FEMALE">{tAnimal('female')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="breed" className="block text-sm font-medium text-primary mb-1">
                  {t('breed')}
                </label>
                <input
                  type="text"
                  id="breed"
                  name="breed"
                  value={animalData.breed || ''}
                  onChange={handleAnimalChange}
                  className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-primary mb-1">
                  {t('color')}
                </label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={animalData.color || ''}
                  onChange={handleAnimalChange}
                  className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-primary mb-1">
                {t('birthDate')}
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={animalData.birthDate || ''}
                onChange={handleAnimalChange}
                className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="medicalHistory" className="block text-sm font-medium text-primary mb-1">
                {t('medicalHistory')}
              </label>
              <textarea
                id="medicalHistory"
                name="medicalHistory"
                rows={2}
                value={animalData.medicalHistory || ''}
                onChange={handleAnimalChange}
                className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-primary mb-1">
                {t('notes')}
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                value={animalData.notes || ''}
                onChange={handleAnimalChange}
                className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>

            {isSuperAdmin && (
              <div>
                <label htmlFor="clinicId" className="block text-sm font-medium text-primary mb-1">
                  Clinic *
                </label>
                <select
                  id="clinicId"
                  name="clinicId"
                  value={animalData.clinicId || ''}
                  onChange={handleAnimalChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Clinic</option>
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.clinicId && <p className="text-xs text-error mt-1">{errors.clinicId}</p>}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-outline-variant">
            <Button type="button" variant="secondary" onClick={() => setStep(1)}>
              {t('back')}
            </Button>
            <Button type="submit" loading={isLoading} className="min-w-[100px]">
              {t('save')}
            </Button>
          </div>
        </form>
      )}

      {createdQrToken && (
        <GuardianQRModal 
          isOpen={!!createdQrToken} 
          onClose={() => setCreatedQrToken(null)} 
          initialToken={createdQrToken} 
        />
      )}
    </div>
  )
}
