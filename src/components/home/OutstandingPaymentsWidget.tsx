import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { Link } from '@/lib/i18n-navigation'
import { Card } from '@/components/shared/Card'
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimalAvatar } from '@/components/shared/AnimalAvatar'
import { clinicScope } from '@/lib/scope'

export async function OutstandingPaymentsWidget() {
  const session = await auth()
  if (!session?.user?.clinicId) return null

  const t = await getTranslations('outstandingPayments')
  const locale = session.user.preferredLang || 'ar'
  const isRTL = locale === 'ar'

  const payments = await prisma.payment.findMany({
    where: {
      appointment: {
        animal: clinicScope(session)
      },
      status: { in: ['UNPAID', 'PARTIAL'] }
    },
    include: {
      appointment: {
        include: {
          animal: {
            include: { owner: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  if (payments.length === 0) return null

  return (
    <Card className="mt-6 border border-error/20 bg-error/5 overflow-hidden">
      <div className="p-4 border-b border-error/20 flex items-center gap-3">
        <div className="bg-error/10 text-error p-2 rounded-lg">
          <AlertCircle size={20} />
        </div>
        <h2 className="font-bold text-error">{t('title')}</h2>
      </div>
      
      <div className="divide-y divide-error/10">
        {payments.map(payment => {
          const animal = payment.appointment.animal
          const remaining = payment.totalAmount - payment.paidAmount
          
          return (
            <Link 
              key={payment.id} 
              href={`/animals/${animal.id}`}
              className="flex items-center gap-4 p-4 hover:bg-error/10 transition-colors"
            >
              <AnimalAvatar id={animal.id} species={animal.species} size={40} />
              
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-on-surface truncate">{animal.name}</div>
                <div className="text-xs text-on-surface-variant truncate">
                  {animal.owner.name}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-error font-medium">{t('owes')}</div>
                <div className="font-mono font-bold text-error">
                  {remaining} EGP
                </div>
              </div>

              <div className="text-error/60">
                {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </div>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}
