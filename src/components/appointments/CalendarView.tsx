'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  addWeeks,
  subWeeks,
} from 'date-fns'
import { ar } from 'date-fns/locale'
import { useAppointments } from '@/hooks/useAppointments'
import { AppointmentCard } from './AppointmentCard'

export function CalendarView() {
  const t = useTranslations('appointment')
  const locale = useLocale()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 6 }) // Start week on Saturday (standard in Egypt)
  )

  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const { data: appointments, isLoading, refetch } = useAppointments(dateStr)

  // Generate 7 days of current week
  const weekDays = Array.from({ length: 7 }).map((_, index) =>
    addDays(currentWeekStart, index)
  )

  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => subWeeks(prev, 1))
  }

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addWeeks(prev, 1))
  }

  const formatDateLabel = (date: Date) => {
    return format(date, 'd')
  }

  const formatDayName = (date: Date) => {
    // Get short name of week day
    const day = format(date, 'eee', { locale: locale === 'ar' ? ar : undefined })
    return day
  }

  const formatMonthLabel = () => {
    return format(currentWeekStart, 'MMMM yyyy', {
      locale: locale === 'ar' ? ar : undefined,
    })
  }

  return (
    <div className="space-y-6">
      {/* Week Navigation Header */}
      <div className="flex items-center justify-between bg-surface border border-outline/10 rounded-2xl p-4 shadow-sm">
        <button
          onClick={handlePrevWeek}
          className="p-2 rounded-xl hover:bg-outline/5 text-primary transition-all duration-200"
        >
          {t('str9888')}
        </button>
        <span className="text-sm font-semibold text-primary capitalize">
          {formatMonthLabel()}
        </span>
        <button
          onClick={handleNextWeek}
          className="p-2 rounded-xl hover:bg-outline/5 text-primary transition-all duration-200"
        >
          {t('str6110')}
        </button>

      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2 bg-surface border border-outline/10 rounded-2xl p-3 shadow-sm">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate)
          const isToday = isSameDay(day, new Date())
          return (
            <button
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              className={`flex flex-col items-center py-3 rounded-xl transition-all duration-200 ${
                isSelected
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'hover:bg-outline/5 text-on-surface'
              }`}
            >
              <span className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${
                isSelected ? 'text-on-primary/80' : 'text-on-surface-variant'
              }`}>
                {formatDayName(day)}
              </span>
              <span className={`text-base font-semibold ${isToday && !isSelected ? 'text-teal-600 border-b-2 border-teal-600' : ''}`}>
                {formatDateLabel(day)}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selected Day's Appointments list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-primary">
            {format(selectedDate, 'eeee, MMMM d', {
              locale: locale === 'ar' ? ar : undefined,
            })}
          </h3>
          <span className="text-xs font-medium bg-outline/10 text-secondary px-2.5 py-1 rounded-full">
            {appointments?.length || 0} {t('new').toLowerCase() === 'new' ? 'appointments' : 'مواعيد'}
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-32 bg-outline/10 rounded-2xl animate-pulse" />
            <div className="h-32 bg-outline/10 rounded-2xl animate-pulse" />
          </div>
        ) : !appointments || appointments.length === 0 ? (
          <div className="text-center py-12 bg-surface border border-outline/10 rounded-2xl p-6 shadow-sm">
            <span className="text-3xl block mb-2">🗓️</span>
            <p className="text-sm text-secondary italic">
              {t('noAppointmentsScheduledForThisDay')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((ap) => (
              <AppointmentCard key={ap.id} appointment={ap} onStatusChange={refetch} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
