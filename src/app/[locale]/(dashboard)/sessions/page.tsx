import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { clinicScope } from '@/lib/scope'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card } from '@/components/shared/Card'
import { Link } from '@/lib/i18n-navigation'
import { AnimalAvatar } from '@/components/shared/AnimalAvatar'
import { format } from 'date-fns'

export default async function SessionsHistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth()
  if (!session) redirect(`/${locale}/login`)

  const tNav = await getTranslations('nav')
  const tSession = await getTranslations('session')

  const scope = clinicScope(session)
  
  const sessions = await prisma.session.findMany({
    where: {
      appointment: {
        animal: scope,
        ...(session.user.role === 'DOCTOR' ? { doctorId: session.user.id } : {})
      }
    },
    include: {
      appointment: {
        include: {
          animal: {
            include: { owner: true }
          },
          doctor: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="bg-mesh min-h-full">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <PageHeader
        title={tNav('sessions')}
      />

      <div className="grid gap-4">
        {sessions.map(s => {
          const animal = s.appointment.animal
          const doctor = s.appointment.doctor

          return (
            <Link key={s.id} href={`/sessions/${s.appointmentId}`}>
              <Card className="p-4 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <AnimalAvatar id={animal.id} species={animal.species} size={48} />
                    <div>
                      <h3 className="font-bold text-on-surface text-lg">
                        {animal.name}
                      </h3>
                      <div className="text-sm text-on-surface-variant flex items-center gap-2">
                        <span>{animal.owner.name}</span>
                        <span>•</span>
                        <span>{format(s.createdAt, 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 max-w-lg bg-surface-container rounded-xl p-3 text-sm text-on-surface line-clamp-2">
                    <span className="font-semibold text-primary">{tSession('diagnosis', { fallback: 'Diagnosis' })}: </span>
                    {s.diagnosis || s.chiefComplaint || '---'}
                  </div>

                  <div className="flex flex-col md:items-end gap-1 shrink-0">
                    <div className="text-sm font-medium text-on-surface-variant">
                      {doctor.name}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}

        {sessions.length === 0 && (
          <div className="text-center p-12 bg-surface-container-low rounded-2xl border border-outline-variant text-on-surface-variant">
            {tSession('noSessions', { fallback: 'No sessions found.' })}
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
