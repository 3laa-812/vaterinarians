'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import type { AppointmentWithDetails } from '@/types'
import { StatusBadge } from './StatusBadge'
import { useUpdateAppointment } from '@/hooks/useAppointments'

interface AppointmentCardProps {
  appointment: AppointmentWithDetails
  onStatusChange?: () => void
  className?: string
}

export function AppointmentCard({ appointment, onStatusChange, className = '' }: AppointmentCardProps) {
  const t = useTranslations('appointment')
  const tHome = useTranslations('home')
  const locale = useLocale()

  const updateMutation = useUpdateAppointment(appointment.id)

  const handleStatusUpdate = async (status: typeof appointment.status) => {
    try {
      await updateMutation.mutateAsync({
        scheduledAt: new Date(appointment.scheduledAt).toISOString(),
        animalId: appointment.animalId,
        doctorId: appointment.doctorId,
        notes: appointment.notes || '',
        status,
      })
      if (onStatusChange) onStatusChange()
    } catch (err) {
      console.error('Failed to update status', err)
    }
  }

  const formatTime = (dateStr: Date | string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString(locale === 'ar' ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div className={`bg-surface border border-outline/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <span className="text-xs text-secondary font-mono bg-outline/5 px-2 py-0.5 rounded">
            {formatTime(appointment.scheduledAt)}
          </span>
          <h4 className="text-lg font-semibold text-primary mt-2">
            <Link href={`/${locale}/animals/${appointment.animal.id}`} className="hover:text-teal-600 transition-colors">
              {appointment.animal.name}
            </Link>
          </h4>
          {appointment.owner && (
            <p className="text-xs text-secondary mt-0.5">
              {appointment.owner.name} • <span className="font-mono">{appointment.owner.phone}</span>
            </p>
          )}

        </div>
        <StatusBadge status={appointment.status} />
      </div>

      {appointment.notes && (
        <p className="text-sm text-secondary bg-outline/5 rounded-xl p-3 mb-4">
          {appointment.notes}
        </p>
      )}

      <div className="flex flex-wrap gap-2 border-t border-outline/5 pt-4">
        {appointment.status === 'SCHEDULED' && (
          <>
            <Link
              href={`/${locale}/sessions/new?appointmentId=${appointment.id}`}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors duration-200"
            >
              {tHome('startSession')}
            </Link>
            <button
              onClick={() => handleStatusUpdate('POSTPONED')}
              className="px-4 py-2 border border-outline/20 text-primary text-xs font-semibold rounded-xl hover:bg-outline/5 transition-colors duration-200"
            >
              {t('status.POSTPONED')}
            </button>
            <button
              onClick={() => handleStatusUpdate('ABSENT')}
              className="px-4 py-2 border border-outline/20 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition-colors duration-200"
            >
              {t('status.ABSENT')}
            </button>
          </>
        )}

        {appointment.status === 'COMPLETED' && appointment.hasSession && (
          <Link
            href={`/${locale}/sessions/${appointment.id}`}
            className="px-4 py-2 border border-outline/20 text-primary text-xs font-semibold rounded-xl hover:bg-outline/5 transition-colors duration-200"
          >
            {tHome('editAppointment')}
          </Link>
        )}
      </div>
    </div>
  )
}
