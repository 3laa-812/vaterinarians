'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { AnimalForm } from '@/components/animals/AnimalForm'
import { useCreateAnimal } from '@/hooks/useAnimals'
import type { AnimalInput } from '@/lib/validations/animal.schema'

export default function NewAnimalPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('animal')

  const createAnimalMutation = useCreateAnimal()

  const handleSubmit = async (data: AnimalInput) => {
    try {
      const res = await createAnimalMutation.mutateAsync(data)
      router.push(`/${locale}/animals/${res.id}`)
    } catch (err) {
      console.error('Failed to create animal', err)
    }
  }

  const handleCancel = () => {
    router.push(`/${locale}/animals`)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          {t('addNew')}
        </h1>
        <p className="text-sm text-secondary mt-1">
          {locale === 'ar' ? 'تسجيل حيوان أليف ومرافق جديد' : 'Register a new patient and owner in the system'}
        </p>
      </div>

      <div className="bg-surface border border-outline/10 rounded-2xl p-6 shadow-sm">
        <AnimalForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createAnimalMutation.isPending}
        />
      </div>
    </div>
  )
}
