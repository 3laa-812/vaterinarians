import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { Link } from '@/lib/i18n-navigation'
import { Card } from '@/components/shared/Card'
import { AnimalAvatar } from '@/components/shared/AnimalAvatar'
import { clinicScope } from '@/lib/scope'
import { Activity } from 'lucide-react'

export async function RecentActivityWidget() {
  const session = await auth()
  if (!session?.user?.clinicId) return null

  const t = await getTranslations('home')
  const locale = session.user.preferredLang || 'ar'

  // Fetch recent completed sessions (or any sessions with notes/status)
  const recentAppointments = await prisma.appointment.findMany({
    where: {
      animal: clinicScope(session),
      status: 'COMPLETED'
    },
    include: {
      animal: {
        select: { id: true, name: true, species: true, owner: { select: { name: true } } }
      }
    },
    orderBy: { scheduledAt: 'desc' },
    take: 5
  })

  if (recentAppointments.length === 0) return null

  return (
    <Card className="mt-6 overflow-hidden">
      <div className="p-4 border-b border-outline-variant flex items-center gap-3">
        <div className="bg-primary/10 text-primary p-2 rounded-lg">
          <Activity size={20} />
        </div>
        <h2 className="font-bold text-on-surface">{t('recentActivity') || 'Recent Activity'}</h2>
      </div>
      
      <div className="divide-y divide-outline-variant/50">
        {recentAppointments.map(appointment => {
          const animal = appointment.animal
          
          return (
            <Link 
              key={appointment.id} 
              href={`/sessions/${appointment.id}`}
              className="flex items-center gap-4 p-4 hover:bg-surface-variant/50 transition-colors"
            >
              <AnimalAvatar id={animal.id} species={animal.species} size={40} />
              
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-on-surface truncate">{animal.name}</div>
                <div className="text-xs text-on-surface-variant truncate">
                  {animal.owner.name} • {new Date(appointment.scheduledAt).toLocaleDateString(
                    locale === 'ar' ? 'ar-EG' : 'en-US',
                    { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}
