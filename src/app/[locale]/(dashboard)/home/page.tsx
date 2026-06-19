// Home page — today's schedule
// Shows greeting, date, and today's appointments

import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { TodaySchedule } from '@/components/appointments/TodaySchedule'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth()
  if (!session) redirect(`/${locale}/login`)

  const t = await getTranslations('home')

  const dateStr = new Date().toLocaleDateString(
    locale === 'ar' ? 'ar-EG' : 'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
  )

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface">
          {t('greeting', { name: session.user.name })}
        </h1>
        <p className="text-on-surface-variant mt-1">{dateStr}</p>
      </div>
      <TodaySchedule />
    </div>
  )
}
