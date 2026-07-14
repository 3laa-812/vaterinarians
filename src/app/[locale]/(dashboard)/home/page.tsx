import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { TodaySchedule } from '@/components/appointments/TodaySchedule'
import { Hand } from 'lucide-react'

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
    <div className="min-h-screen">
      {/* Hero greeting strip */}
      <div className="bg-mesh border-b border-outline-variant px-5 py-5 md:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1">
            {dateStr}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface flex items-center gap-2">
            {t('greeting', { name: session.user.name.split(' ')[0] })}
            <Hand size={24} className="text-primary" />
          </h1>
        </div>
      </div>

      {/* Schedule */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-6">
        <TodaySchedule />
      </div>
    </div>
  )
}

