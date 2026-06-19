'use client'

import { useTranslations } from 'next-intl'
import { AppointmentCard } from './AppointmentCard'
import { useAppointments } from '@/hooks/useAppointments'
import { startOfDay, format } from 'date-fns'

export function TodaySchedule() {
  const t = useTranslations('home')
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const { data: appointments, isLoading, refetch } = useAppointments(todayStr)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-outline/10 rounded-lg w-1/3 animate-pulse" />
        <div className="h-32 bg-outline/10 rounded-2xl animate-pulse" />
        <div className="h-32 bg-outline/10 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl mb-4">☀️</span>
        <p className="text-secondary font-medium">
          {t('noAppointments')}
        </p>
      </div>
    )
  }

  // Find next upcoming appointment
  const now = new Date()
  const nextApp = appointments.find(
    (ap) => ap.status === 'SCHEDULED' && new Date(ap.scheduledAt) > now
  )

  let minutesDiff = 0
  if (nextApp) {
    const diffMs = new Date(nextApp.scheduledAt).getTime() - now.getTime()
    minutesDiff = Math.max(0, Math.round(diffMs / 1000 / 60))
  }

  const isAllDone = appointments.every((ap) => ap.status !== 'SCHEDULED')

  return (
    <div className="space-y-6">
      {/* Banner indicator */}
      {nextApp && minutesDiff <= 60 && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center justify-between animate-fade-in">
          <div>
            <h4 className="text-sm font-semibold text-teal-800">
              {t('nextAppointment', { minutes: minutesDiff })}
            </h4>
            <p className="text-xs text-teal-600 mt-0.5">
              {nextApp.animal.name} {nextApp.owner ? `(${nextApp.owner.name})` : ''}
            </p>

          </div>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
          </span>
        </div>
      )}

      {isAllDone && appointments.length > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-center">
          <p className="text-sm font-semibold text-teal-800">
            {t('allDone')}
          </p>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-primary mb-4">
          {t('todaySchedule')}
        </h3>
        <div className="space-y-4">
          {appointments.map((ap) => (
            <AppointmentCard key={ap.id} appointment={ap} onStatusChange={refetch} />
          ))}
        </div>
      </div>
    </div>
  )
}
