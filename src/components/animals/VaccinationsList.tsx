'use client'

import React, { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { usePetVaccinations, PetVaccination } from '@/hooks/useVaccines'
import { VaccinationFormModal } from './VaccinationFormModal'
import { Shield, Syringe, AlertCircle, Calendar, Printer } from 'lucide-react'
import { useRouter } from '@/lib/i18n-navigation'

interface VaccinationsListProps {
  petId: string
  species: string
}

export function VaccinationsList({ petId, species }: VaccinationsListProps) {
  const t = useTranslations('animal')
  const locale = useLocale()
  const router = useRouter()
  const { data: vaccinations, isLoading } = usePetVaccinations(petId)
  
  const [showModal, setShowModal] = useState(false)
  const [selectedVaccination, setSelectedVaccination] = useState<PetVaccination | null>(null)

  const handleOpenNew = () => {
    setSelectedVaccination(null)
    setShowModal(true)
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'overdue': return { color: 'bg-error/10 text-error', icon: <AlertCircle size={14} />, label: locale === 'ar' ? 'متأخر' : 'Overdue' }
      case 'due_soon': return { color: 'bg-amber-100 text-amber-800', icon: <AlertCircle size={14} />, label: locale === 'ar' ? 'قريباً' : 'Due Soon' }
      case 'upcoming': return { color: 'bg-teal-100 text-teal-800', icon: <Calendar size={14} />, label: locale === 'ar' ? 'قادم' : 'Upcoming' }
      case 'completed': return { color: 'bg-surface-variant text-on-surface-variant', icon: <Shield size={14} />, label: locale === 'ar' ? 'مكتمل' : 'Completed' }
      default: return { color: 'bg-surface-variant text-on-surface-variant', icon: <Shield size={14} />, label: status }
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  }

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
          <Syringe size={20} className="text-primary" />
          {locale === 'ar' ? 'سجل التطعيمات' : 'Vaccinations'}
        </h3>
        <div className="flex gap-2">
          {vaccinations && vaccinations.length > 0 && (
            <Button 
              variant="secondary" 
              onClick={() => router.push(`/animals/${petId}/vaccinations/print`)} 
              className="px-3 py-1.5 text-xs flex items-center gap-1"
            >
              <Printer size={14} />
              {locale === 'ar' ? 'طباعة' : 'Print'}
            </Button>
          )}
          <Button onClick={handleOpenNew} className="px-3 py-1.5 text-xs">
            + {locale === 'ar' ? 'إضافة' : 'Add'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-outline/10 rounded-xl" />
          <div className="h-16 bg-outline/10 rounded-xl" />
        </div>
      ) : !vaccinations || vaccinations.length === 0 ? (
        <div className="text-center py-8 text-on-surface-variant bg-surface-container/50 rounded-xl">
          <Syringe className="mx-auto mb-2 opacity-50" size={32} />
          <p className="text-sm italic">{locale === 'ar' ? 'لا يوجد تطعيمات مسجلة' : 'No vaccinations recorded'}</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
          {vaccinations.map((v) => {
            const status = getStatusConfig(v.status)
            return (
              <div 
                key={v.id} 
                className="p-3 border border-outline/10 rounded-xl bg-surface hover:bg-surface-container transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedVaccination(v)
                  setShowModal(true)
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-primary">{v.vaccine.name}</div>
                  <div className={`px-2 py-1 rounded flex items-center gap-1 text-[10px] font-bold ${status.color}`}>
                    {status.icon} {status.label}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-secondary mt-2">
                  <div>
                    <span className="block text-on-surface-variant/70 text-[10px] uppercase tracking-wider mb-0.5">{locale === 'ar' ? 'تاريخ التطعيم' : 'Given On'}</span>
                    <span className="font-medium">{formatDate(v.dateAdministered)}</span>
                  </div>
                  <div>
                    <span className="block text-on-surface-variant/70 text-[10px] uppercase tracking-wider mb-0.5">{locale === 'ar' ? 'الجرعة القادمة' : 'Next Due'}</span>
                    <span className="font-medium text-on-surface">{formatDate(v.nextDueDate)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <VaccinationFormModal
          petId={petId}
          species={species}
          existingRecord={selectedVaccination}
          onClose={() => setShowModal(false)}
        />
      )}
    </Card>
  )
}
