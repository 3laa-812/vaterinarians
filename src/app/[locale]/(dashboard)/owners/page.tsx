'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { useOwners, useCreateOwner } from '@/hooks/useOwners'
import { OwnerBlock } from '@/components/owners/OwnerBlock'
import { OwnerForm } from '@/components/owners/OwnerForm'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'

export default function OwnersPage() {
  const t = useTranslations('owner')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showAddForm, setShowAddForm] = useState(false)
  const limit = 20

  const { data, isLoading, refetch } = useOwners(search, page, limit)
  const owners = data?.owners
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const createMutation = useCreateOwner()

  const handleCreateOwner = async (data: Parameters<typeof createMutation.mutateAsync>[0]) => {
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
      <PageHeader
        title={t('pageTitle')}
        subtitle={t('pageSubtitle')}
        action={
          <Button onClick={() => setShowAddForm(true)} className="inline-flex items-center gap-2">
            <Plus size={18} />
            {t('addNew')}
          </Button>
        }
      />

      {showAddForm && (
        <Card className="max-w-2xl">
          <h3 className="text-lg font-semibold text-on-surface mb-4">{t('addNew')}</h3>
          <OwnerForm
            onSubmit={handleCreateOwner}
            onCancel={() => setShowAddForm(false)}
            isLoading={createMutation.isPending}
          />
        </Card>
      )}

      <div className="relative">
        <input
          type="text"
          placeholder={t('search')}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface outline-none focus:border-primary transition-colors"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-40 bg-outline/10 rounded-2xl animate-pulse" />
          <div className="h-40 bg-outline/10 rounded-2xl animate-pulse" />
        </div>
      ) : !owners || owners.length === 0 ? (
        <EmptyState icon={Users} message={t('noOwners')} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            {owners.map((owner) => (
              <OwnerBlock key={owner.id} owner={owner} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1"
              >
                <ChevronLeft size={16} />
              </Button>
              <span className="text-sm text-on-surface-variant">
                {page} / {totalPages}
              </span>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
