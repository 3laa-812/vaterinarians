'use client'

import { useTranslations } from 'next-intl'
import { AppointmentCard } from './AppointmentCard'
import { useAppointments } from '@/hooks/useAppointments'
import { startOfDay, format } from 'date-fns'
import { Link } from '@/lib/i18n-navigation'
import { Plus, CalendarDays } from 'lucide-react'
import { StatsStrip } from '../home/StatsStrip'
import { displayOwnerName } from '@/lib/format'
import { EmptyState } from '@/components/shared/EmptyState'

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
      <div className="space-y-5 pb-5">
        <div className="px-5">
          <EmptyState icon={CalendarDays} message={`${t('noAppointments')} - ${t('noAppointmentsHint')}`} />
        </div>
        <div className="pt-5 border-t border-outline-variant">
          <Link
            href="/session/new"
            className="flex items-center justify-center gap-2 mx-5 mt-1 py-3 rounded-2xl border border-dashed border-primary/40 bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
          >
            <Plus size={16} />
            {t('addWalkIn')}
          </Link>
        </div>
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
    <div className="space-y-5 pb-5">
      {/* Banner indicator */}
      {nextApp && (
        <div className="mx-5 mb-2">
          <div className="relative rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 p-5 overflow-hidden">
            {/* Background shimmer */}
            <div className="absolute inset-0 bg-mesh opacity-30" />

            <div className="relative flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
                  {minutesDiff <= 0
                    ? t('nowPlaceholder')
                    : t('nextAppointment', { minutes: minutesDiff })}
                </p>
                <h3 className="text-xl font-bold text-on-surface truncate">{nextApp.animal.name}</h3>
                {nextApp.owner && (
                  <p className="text-sm text-on-surface-variant mt-0.5 truncate">
                    {displayOwnerName(nextApp.owner.name)} · {nextApp.owner.phone}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <div className="ring-pulse w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/60 flex items-center justify-center">
                  <span className="text-primary font-bold text-xs">
                    {new Date(nextApp.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAllDone && appointments.length > 0 && (
        <div className="text-primary text-sm font-semibold text-center py-1">
          {t('allDone')}
        </div>
      )}
      <StatsStrip appointments={appointments} />

      <div className="px-5">
        <h3 className="text-lg font-semibold text-primary mb-4">
          {t('todaySchedule')}
        </h3>
        <div className="space-y-3">
          {appointments.map((ap) => (
            <AppointmentCard key={ap.id} appointment={ap} onStatusChange={refetch} />
          ))}
        </div>
      </div>

      <div className="pt-5 border-t border-outline-variant">
        <Link
          href="/session/new"
          className="flex items-center justify-center gap-2 mx-5 mt-1 py-3 rounded-2xl border border-dashed border-primary/40 bg-primary/10 text-primary text-sm font-semibold"
        >
          <Plus size={16} />
          {t('addWalkIn')}
        </Link>
      </div>
    </div>
  )
}
