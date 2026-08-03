import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { TodaySchedule } from '@/components/appointments/TodaySchedule'
import { OutstandingPaymentsWidget } from '@/components/home/OutstandingPaymentsWidget'
import { RecentActivityWidget } from '@/components/home/RecentActivityWidget'
import { Hand, Calendar, TrendingUp, PlusCircle, Stethoscope, Users } from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Link } from '@/lib/i18n-navigation'
import { prisma } from '@/lib/db'
import { clinicScope } from '@/lib/scope'
import { formatCurrency } from '@/lib/format'

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

  const scope = clinicScope(session)

  // Get current week range
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // adjust when day is sunday
  const startOfWeek = new Date(now.setDate(diffToMonday))
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  const [appointmentsCount, newPatientsCount, revenueData] = await Promise.all([
    prisma.appointment.count({
      where: {
        animal: scope,
        scheduledAt: { gte: startOfWeek, lte: endOfWeek },
      },
    }),
    prisma.animal.count({
      where: {
        ...scope,
        createdAt: { gte: startOfWeek, lte: endOfWeek },
      },
    }),
    prisma.payment.aggregate({
      _sum: { paidAmount: true },
      where: {
        appointment: { animal: scope },
        createdAt: { gte: startOfWeek, lte: endOfWeek },
      },
    }),
  ])
  const revenueThisWeek = revenueData._sum.paidAmount || 0

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero greeting strip */}
      <div className="bg-mesh border-b border-outline-variant px-5 py-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1">
            {dateStr}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface flex items-center gap-2">
            {t('greeting', { name: session.user.name.split(' ')[0] })}
            <Hand size={24} className="text-primary" />
          </h1>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column: Schedule (2/3 width on LG) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions Row */}
            <div className="grid grid-cols-3 gap-4">
              <Link href="/session/new">
                <Card className="p-4 h-full flex flex-col items-center justify-center text-center hover:bg-primary/5 transition-colors group border-transparent hover:border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Stethoscope size={20} />
                  </div>
                  <span className="font-semibold text-sm text-on-surface">{t('quickActions.newSession') || 'New Session'}</span>
                </Card>
              </Link>
              <Link href="/appointments">
                <Card className="p-4 h-full flex flex-col items-center justify-center text-center hover:bg-primary/5 transition-colors group border-transparent hover:border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <PlusCircle size={20} />
                  </div>
                  <span className="font-semibold text-sm text-on-surface">{t('quickActions.newAppointment') || 'New Appointment'}</span>
                </Card>
              </Link>
              <Link href="/owners">
                <Card className="p-4 h-full flex flex-col items-center justify-center text-center hover:bg-primary/5 transition-colors group border-transparent hover:border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Users size={20} />
                  </div>
                  <span className="font-semibold text-sm text-on-surface">{t('quickActions.newOwner') || 'New Owner'}</span>
                </Card>
              </Link>
            </div>

            <TodaySchedule />
            <RecentActivityWidget />
          </div>

          {/* Sidebar Column (1/3 width on LG) */}
          <div className="space-y-6">
            {/* This week at a glance widget */}
            <Card className="p-5">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-on-surface">
                <Calendar size={20} className="text-primary" />
                This Week
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-outline-variant/50">
                  <span className="text-on-surface-variant text-sm">{t('thisWeek.appointments') || 'Appointments'}</span>
                  <span className="font-bold text-on-surface">{appointmentsCount}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-outline-variant/50">
                  <span className="text-on-surface-variant text-sm">{t('thisWeek.newPatients') || 'New Patients'}</span>
                  <span className="font-bold text-on-surface">{newPatientsCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant text-sm">{t('thisWeek.revenue') || 'Revenue'}</span>
                  <span className="font-bold text-success flex items-center gap-1">
                    <TrendingUp size={14} /> {formatCurrency(revenueThisWeek)}
                  </span>
                </div>
              </div>
            </Card>

            <OutstandingPaymentsWidget />
          </div>
        </div>
      </div>
    </div>
  )
}

