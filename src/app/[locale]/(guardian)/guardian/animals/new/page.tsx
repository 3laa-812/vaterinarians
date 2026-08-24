'use client'

import { useState } from 'react'
import { useRouter } from '@/lib/i18n-navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useGuardianCreateAnimal } from '@/hooks/useGuardian'
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react'

export default function AddPetPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('guardian')
  const isRtl = locale === 'ar'

  const createAnimalMutation = useGuardianCreateAnimal()

  const [formData, setFormData] = useState({
    name: '',
    species: 'DOG',
    breed: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    birthDate: '',
    color: '',
    notes: '',
  })

  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!formData.name.trim()) {
      setErrorMsg(`${t('petName')} ${t('required')}`)
      return
    }

    try {
      await createAnimalMutation.mutateAsync({
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed.trim() || undefined,
        gender: formData.gender,
        birthDate: formData.birthDate || undefined,
        color: formData.color.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      })
      router.push('/guardian/animals')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : t('failedToSave'))
    }
  }

  const speciesOptions = [
    { value: 'DOG', label: t('dog') },
    { value: 'CAT', label: t('cat') },
    { value: 'BIRD', label: t('bird') },
    { value: 'OTHER', label: t('other') },
  ]

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 14 }}
        onClick={() => router.push('/guardian/animals')}
      >
        {isRtl ? <ArrowRight width={15} height={15} strokeWidth={2.4} /> : <ArrowLeft width={15} height={15} strokeWidth={2.4} />}
        {t('backToPets')}
      </button>

      <div className="card pad">
        <h2 className="section-title" style={{ marginBottom: 4 }}>
          {t('addNewPet')}
        </h2>
        <p className="muted" style={{ fontSize: 13, marginBottom: 22 }}>
          {t('addPetDescription')}
        </p>

        {errorMsg && (
          <div
            className="mb-4 flex items-center gap-2 rounded-xl p-3 text-[13px] font-bold"
            style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">{t('petName')}</label>
            <input
              className="input"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="field-label">{t('species')}</label>
            <div className="row gap8" style={{ flexWrap: 'wrap' }}>
              {speciesOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`chip${formData.species === opt.value ? ' active' : ''}`}
                  onClick={() => setFormData({ ...formData, species: opt.value })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="field-label">{t('gender')}</label>
            <div className="row gap8">
              <button
                type="button"
                className={`chip${formData.gender === 'MALE' ? ' active' : ''}`}
                onClick={() => setFormData({ ...formData, gender: 'MALE' })}
              >
                {t('male')}
              </button>
              <button
                type="button"
                className={`chip${formData.gender === 'FEMALE' ? ' active' : ''}`}
                onClick={() => setFormData({ ...formData, gender: 'FEMALE' })}
              >
                {t('female')}
              </button>
            </div>
          </div>

          <div>
            <label className="field-label">{t('breed')}</label>
            <input
              className="input"
              type="text"
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
            />
          </div>

          <div>
            <label className="field-label">{t('birthDate')}</label>
            <input
              className="input"
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={createAnimalMutation.isPending}
          >
            {createAnimalMutation.isPending ? t('processing') : t('savePet')}
          </button>
        </form>
      </div>
    </div>
  )
}
