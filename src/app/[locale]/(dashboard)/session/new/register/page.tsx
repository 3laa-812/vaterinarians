'use client'

import { useRouter } from '@/lib/i18n-navigation'
import { useTranslations } from 'next-intl'
import { AnimalForm } from '@/components/animals/AnimalForm'
import { useCreateAnimal } from '@/hooks/useAnimals'
import type { AnimalInput } from '@/lib/validations/animal.schema'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card } from '@/components/shared/Card'

export default function QuickRegistrationPage() {
  const router = useRouter()
  const t = useTranslations('animal')
  const tForm = useTranslations('form')

  const createAnimalMutation = useCreateAnimal()

  const handleSubmit = async (data: AnimalInput) => {
    try {
      const res = await createAnimalMutation.mutateAsync(data)
      // Redirect to start session immediately after quick registration
      router.push(`/animals/${res.animal.id}/session/new`)
    } catch (err) {
      console.error('Failed to create animal', err)
    }
  }

  const handleCancel = () => {
    router.push('/session/new')
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <PageHeader title={t('addNew')} subtitle={tForm('step1') + ' & ' + tForm('step2')} />

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
