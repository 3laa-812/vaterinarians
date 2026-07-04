'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n-navigation'
import { useLocale } from 'next-intl'
import type { AppointmentWithDetails } from '@/types'
import { StatusBadge } from './StatusBadge'
import { useUpdateAppointment } from '@/hooks/useAppointments'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { AppointmentOverflowMenu } from './AppointmentOverflowMenu'
import { displayOwnerName } from '@/lib/format'

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
    <Card className={className}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <span className="text-xs text-on-surface-variant font-mono bg-surface-container px-2 py-0.5 rounded">
            {formatTime(appointment.scheduledAt)}
          </span>
          <h4 className="text-lg font-semibold text-on-surface mt-2">
            <Link href={`/animals/${appointment.animal.id}`} className="hover:text-primary transition-colors">
              {appointment.animal.name}
            </Link>
          </h4>
          {appointment.owner && (
            <p className="text-xs text-on-surface-variant mt-0.5">
              {displayOwnerName(appointment.owner.name)} • <span className="font-mono">{appointment.owner.phone}</span>
            </p>
          )}
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      {appointment.notes && (
        <p className="text-sm text-on-surface-variant bg-surface-container rounded-xl p-3 mb-4">
          {appointment.notes}
        </p>
      )}

      <div className="flex items-center gap-2 border-t border-outline-variant pt-4">
        {appointment.status === 'SCHEDULED' && (
          <>
            <Link href={`/animals/${appointment.animal.id}/session/new?appointmentId=${appointment.id}`} className="flex-1">
              <Button className="w-full px-4 py-2 text-xs">{tHome('startSession')}</Button>
            </Link>
            <AppointmentOverflowMenu
              onPostpone={() => handleStatusUpdate('POSTPONED')}
              onMarkAbsent={() => handleStatusUpdate('ABSENT')}
            />
          </>
        )}

        {appointment.status === 'COMPLETED' && appointment.hasSession && (
          <Link href={`/sessions/${appointment.id}`} className="flex-1">
            <Button variant="secondary" className="w-full px-4 py-2 text-xs">
              {tHome('viewSessionDetails')}
            </Button>
          </Link>
        )}
      </div>
    </Card>
  )
}
