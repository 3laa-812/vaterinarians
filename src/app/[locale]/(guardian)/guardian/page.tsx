'use client'

import { useGuardianPets, useGuardianOrders } from '@/hooks/useGuardian'
import { useTranslations } from 'next-intl'
import { Calendar, ChevronRight, MessageSquare, ShoppingBag, Bell, MapPin, Bone, CheckCircle2, Hand, Clock } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from '@/lib/i18n-navigation'
import Image from 'next/image'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatCurrency } from '@/lib/format'

export default function GuardianHomePage() {
  const t = useTranslations('guardian')
  const router = useRouter()
  const { data: session } = useSession()
  const { data: petsData, isLoading: petsLoading } = useGuardianPets()
  const { data: ordersData, isLoading: ordersLoading } = useGuardianOrders()

  const animals = petsData?.animals || []
  const recentOrder = ordersData?.orders?.[0]

  return (
    <div className="flex flex-col min-h-screen bg-guardian-bg text-guardian-text pb-24">
      {/* Top Navigation */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-guardian-bg/80 backdrop-blur-md z-10">
        <button className="text-guardian-text hover:bg-stone-200/50 p-2 rounded-full transition-colors">
          <Bell size={24} strokeWidth={1.5} />
        </button>
        <h1 className="text-xl font-bold text-guardian-text">VetCare Guardian</h1>
        <div className="w-10" /> {/* Placeholder for balance */}
      </div>

      <div className="px-6 space-y-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-start pt-2">
          <div>
            <h2 className="text-3xl font-bold text-guardian-text flex items-center gap-2">
              <Hand size={28} className="text-primary" /> {t('welcome')} {session?.user?.name || ''}
            </h2>
            <div className="flex items-center gap-1.5 mt-2 text-guardian-text-muted">
              <MapPin size={16} />
              <span className="text-sm font-medium">{(session?.user as any)?.clinicName || 'VetCare Clinic'}</span>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card 
            onClick={() => router.push('/guardian/appointments/new')}
            className="flex flex-col items-center justify-center gap-3 text-center border-none !shadow-[0_4px_20px_rgba(28,25,23,0.05)]"
          >
            <div className="w-12 h-12 bg-guardian-secondary rounded-full flex items-center justify-center text-white shadow-[0_4px_12px_rgba(251,146,60,0.3)]">
              <Calendar size={24} />
            </div>
            <span className="font-semibold text-sm">{t('bookAppointment') || 'Book Appointment'}</span>
          </Card>

          <Card 
            onClick={() => router.push('/guardian/store')}
            className="flex flex-col items-center justify-center gap-3 text-center border-none !shadow-[0_4px_20px_rgba(28,25,23,0.05)]"
          >
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
              <ShoppingBag size={24} />
            </div>
            <span className="font-semibold text-sm">{t('shopFromStore') || 'Shop from Store'}</span>
          </Card>
        </div>

        {/* My Animals */}
        <div>
          <h3 className="text-xl font-bold mb-4 text-guardian-text">{t('myAnimals') || 'My Animals'}</h3>
          
          {petsLoading ? (
            <div className="h-40 bg-guardian-surface shadow-[0_4px_20px_rgba(28,25,23,0.05)] rounded-2xl animate-pulse" />
          ) : animals.length === 0 ? (
            <EmptyState icon={Bone} message={t('noPets')} />
          ) : (
            <div className="space-y-4 stagger-children animate-slide-up">
              {animals.map((animal: any) => (
                <Card key={animal.id} className="relative overflow-hidden border-none !shadow-[0_4px_20px_rgba(28,25,23,0.05)]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold">{animal.name} — {animal.species}</h4>
                    <div className="w-14 h-14 rounded-full bg-stone-100 border-2 border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                      {animal.imageUrl ? (
                        <Image src={animal.imageUrl} alt={animal.name} width={56} height={56} className="object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-primary">{animal.name.charAt(0)}</span>
                      )}
                    </div>
                  </div>
                  
                  {animal.appointments && animal.appointments.length > 0 && (
                    <div className="bg-primary/10 rounded-xl p-4 flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-primary mb-1">
                          <span className="font-semibold text-sm">
                            {new Date(animal.appointments[0].date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {new Date(animal.appointments[0].date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <Clock size={16} />
                        </div>
                        <p className="text-xs text-primary/80 font-medium">Next Appointment</p>
                      </div>
                      <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-primary ring-pulse">
                        <Calendar size={18} />
                      </button>
                    </div>
                  )}

                  <Button 
                    variant="secondary"
                    onClick={() => router.push(`/guardian/animals/${animal.id}`)}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <span>{t('viewMedicalFile') || 'View Medical File'}</span>
                    <ChevronRight size={16} />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* My Orders */}
        <div>
          <h3 className="text-xl font-bold mb-4 text-guardian-text">{t('myOrders') || 'My Orders'}</h3>
          
          {ordersLoading ? (
            <div className="h-32 bg-guardian-surface shadow-[0_4px_20px_rgba(28,25,23,0.05)] rounded-2xl animate-pulse" />
          ) : recentOrder ? (
            <Card className="border-none !shadow-[0_4px_20px_rgba(28,25,23,0.05)]">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>{recentOrder.status}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{recentOrder.orderNumber}</p>
                  <p className="text-xs text-guardian-text-muted mt-0.5">{formatCurrency(recentOrder.totalAmount)}</p>
                </div>
              </div>
              <Button 
                variant="secondary"
                onClick={() => router.push(`/guardian/orders`)}
                className="w-full"
              >
                {t('viewAllOrders') || 'View All Orders'}
              </Button>
            </Card>
          ) : (
            <EmptyState icon={ShoppingBag} message={t('noRecentOrders') || 'No recent orders'} />
          )}
        </div>
      </div>
    </div>
  )
}
