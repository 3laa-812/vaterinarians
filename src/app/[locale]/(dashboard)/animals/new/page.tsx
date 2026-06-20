'use client'

import { useRouter } from '@/lib/i18n-navigation'
import { useTranslations } from 'next-intl'
import { AnimalForm } from '@/components/animals/AnimalForm'
import { useCreateAnimal } from '@/hooks/useAnimals'
import type { AnimalInput } from '@/lib/validations/animal.schema'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card } from '@/components/shared/Card'

export default function NewAnimalPage() {
  const router = useRouter()
  const t = useTranslations('animal')

  const createAnimalMutation = useCreateAnimal()

  const handleSubmit = async (data: AnimalInput) => {
    try {
      const res = await createAnimalMutation.mutateAsync(data)
      router.push(`/animals/${res.id}`)
    } catch (err) {
      console.error('Failed to create animal', err)
    }
  }

  const handleCancel = () => {
    router.push('/animals')
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <PageHeader title={t('addNew')} subtitle={t('addNewSubtitle')} />

      <Card>
        <AnimalForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createAnimalMutation.isPending}
        />
      </Card>
    </div>
  )
}
