'use client'

import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/lib/i18n-navigation'
import type { AppointmentWithDetails } from '@/types'
import { StatusBadge } from './StatusBadge'
import { useUpdateAppointment } from '@/hooks/useAppointments'
import { Button } from '@/components/shared/Button'
import { AppointmentOverflowMenu } from './AppointmentOverflowMenu'
import { AnimalAvatar } from '@/components/shared/AnimalAvatar'
import { displayOwnerName } from '@/lib/format'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { logger } from '@/lib/logger';

interface AppointmentCardProps {
  appointment: AppointmentWithDetails
  onStatusChange?: () => void
  className?: string
}

export function AppointmentCard({ appointment, onStatusChange, className = '' }: AppointmentCardProps) {
  const t     = useTranslations('appointment')
  const tHome = useTranslations('home')
  const locale = useLocale()
  const isRTL  = locale === 'ar'

  const updateMutation = useUpdateAppointment(appointment.id)

  async function handleStatusUpdate(status: typeof appointment.status) {
    try {
      await updateMutation.mutateAsync({
        scheduledAt: new Date(appointment.scheduledAt).toISOString(),
        animalId: appointment.animalId,
        doctorId: appointment.doctorId,
        notes:    appointment.notes || '',
        status,
      })
      onStatusChange?.()
    } catch (err) { logger.error(err) }
  }

  const timeStr = new Date(appointment.scheduledAt).toLocaleTimeString(
    locale === 'ar' ? 'ar-EG' : 'en-US',
    { hour: '2-digit', minute: '2-digit', hour12: true }
  )

  const isScheduled = appointment.status === 'SCHEDULED'
  const isCompleted = appointment.status === 'COMPLETED'

  const ChevronIcon = isRTL ? ArrowLeft : ArrowRight

  return (
    <div className={`animate-slide-up group relative rounded-2xl border transition-all duration-200 overflow-hidden ${
      isScheduled
        ? 'border-outline-variant bg-surface-container-low hover:border-primary/30 hover:bg-surface-container'
        : isCompleted
        ? 'border-outline-variant/50 bg-surface-container-lowest opacity-80'
        : 'border-outline-variant/40 bg-surface-container-lowest opacity-60'
    } ${className}`}>

      {/* Left accent bar — color by status */}
      <div className={`absolute start-0 inset-block-0 w-0.5 rounded-e-full ${
        isScheduled ? 'bg-primary' : isCompleted ? 'bg-success' : 'bg-outline-variant'
      }`} />

      <div className="ps-4 pe-4 pt-4 pb-3">
        {/* Top row: time + status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-lg font-mono">
            {timeStr}
          </span>
          <StatusBadge status={appointment.status} />
        </div>

        {/* Animal row */}
        <div className="flex items-center gap-3">
          <AnimalAvatar id={appointment.animal.id} species={appointment.animal.species} size={40} />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-on-surface leading-tight truncate">
              {appointment.animal.name}
            </h4>
            {appointment.owner && (
              <p className="text-xs text-on-surface-variant mt-0.5 truncate">
                {displayOwnerName(appointment.owner.name)}
                <span className="font-mono"> · {appointment.owner.phone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Notes preview */}
        {appointment.notes && appointment.notes !== 'walk-in' && (
          <p className="text-xs text-on-surface-variant bg-surface-container rounded-lg px-3 py-2 mt-3 line-clamp-1">
            {appointment.notes}
          </p>
        )}
      </div>

      {/* Action strip */}
      {(isScheduled || (isCompleted && appointment.hasSession)) && (
        <div className="border-t border-outline-variant/50 px-4 py-2.5 flex items-center gap-2">
          {isScheduled && (
            <>
              <Link
                href={`/animals/${appointment.animal.id}/session/new?appointmentId=${appointment.id}`}
                className="flex-1"
              >
                <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all active:scale-[0.98]">
                  {tHome('startSession')}
                  <ChevronIcon size={14} />
                </button>
              </Link>
              <AppointmentOverflowMenu
                onPostpone={() => handleStatusUpdate('POSTPONED')}
                onMarkAbsent={() => handleStatusUpdate('ABSENT')}
              />
            </>
          )}
          {isCompleted && appointment.hasSession && (
            <Link href={`/sessions/${appointment.id}`} className="flex-1">
              <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-outline-variant text-on-surface-variant text-xs font-medium hover:text-on-surface hover:border-outline transition-all">
                {tHome('viewSessionDetails')}
                <ChevronIcon size={14} />
              </button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
