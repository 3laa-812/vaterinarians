'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useOwners, useCreateOwner } from '@/hooks/useOwners'
import { OwnerBlock } from '@/components/owners/OwnerBlock'
import { OwnerForm } from '@/components/owners/OwnerForm'

export default function OwnersPage() {
  const t = useTranslations('owner')
  const locale = useLocale()
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const { data: owners, isLoading, refetch } = useOwners(search)
  const createMutation = useCreateOwner()

  const handleCreateOwner = async (data: any) => {
    try {
      await createMutation.mutateAsync(data)
      setShowAddForm(false)
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {locale === 'ar' ? 'المرافقون (العملاء)' : 'Owners (Clients)'}
          </h1>
          <p className="text-sm text-secondary mt-1">
            {locale === 'ar' ? 'إدارة بيانات وأرقام هواتف مربي الحيوانات الأليفة' : 'Manage pet owners and their contact details'}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all duration-200"
        >
          + {t('addNew')}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-surface border border-outline/10 rounded-2xl p-6 shadow-sm max-w-2xl">
          <h3 className="text-lg font-semibold text-primary mb-4">{t('addNew')}</h3>
          <OwnerForm
            onSubmit={handleCreateOwner}
            onCancel={() => setShowAddForm(false)}
            isLoading={createMutation.isPending}
          />
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder={t('search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-outline/20 bg-surface text-primary outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-40 bg-outline/10 rounded-2xl animate-pulse" />
          <div className="h-40 bg-outline/10 rounded-2xl animate-pulse" />
        </div>
      ) : !owners || owners.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-outline/10 rounded-2xl p-6 shadow-sm">
          <span className="text-4xl block mb-3">👥</span>
          <p className="text-secondary italic">
            {t('noOwners')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {owners.map((owner) => (
            <OwnerBlock key={owner.id} owner={owner} />
          ))}
        </div>
      )}
    </div>
  )
}
