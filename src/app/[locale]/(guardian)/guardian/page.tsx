'use client'

import { useGuardianPets, useGuardianOrders } from '@/hooks/useGuardian'
import { useTranslations } from 'next-intl'
import { Calendar, ChevronRight, MessageSquare, ShoppingBag, Bell, MapPin, Bone, CheckCircle2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from '@/lib/i18n-navigation'
import Image from 'next/image'

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
              <span className="text-2xl">👋</span> {t('welcome')} {session?.user?.name || ''}
            </h2>
            <div className="flex items-center gap-1.5 mt-2 text-guardian-text-muted">
              <MapPin size={16} />
              <span className="text-sm font-medium">{(session?.user as any)?.clinicName || 'VetCare Clinic'}</span>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => router.push('/guardian/appointments/new')}
            className="bg-guardian-surface shadow-[0_4px_20px_rgba(28,25,23,0.05)] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-95 border border-stone-100"
          >
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_12px_rgba(245,158,11,0.3)]">
              <Calendar size={24} />
            </div>
            <span className="font-semibold text-sm">Book Appointment</span>
          </button>

          <button 
            onClick={() => router.push('/guardian/store')}
            className="bg-guardian-surface shadow-[0_4px_20px_rgba(28,25,23,0.05)] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-95 border border-stone-100"
          >
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
              <ShoppingBag size={24} />
            </div>
            <span className="font-semibold text-sm">{t('shopFromStore') || 'Shop from Store'}</span>
          </button>
        </div>

        {/* My Animals */}
        <div>
          <h3 className="text-xl font-bold mb-4 text-guardian-text">My Animals</h3>
          
          {petsLoading ? (
            <div className="h-40 bg-guardian-surface shadow-[0_4px_20px_rgba(28,25,23,0.05)] rounded-2xl animate-pulse" />
          ) : animals.length === 0 ? (
            <div className="bg-guardian-surface shadow-[0_4px_20px_rgba(28,25,23,0.05)] rounded-2xl p-8 text-center border border-stone-100">
              <Bone className="mx-auto text-guardian-text-muted mb-3" size={32} />
              <p className="text-guardian-text-muted font-medium">{t('noPets')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {animals.map((animal: any) => (
                <div key={animal.id} className="bg-guardian-surface shadow-[0_4px_20px_rgba(28,25,23,0.05)] rounded-2xl p-5 border border-stone-100 relative overflow-hidden">
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
                          <span className="text-base">⏰</span>
                        </div>
                        <p className="text-xs text-primary/80 font-medium">Next Appointment</p>
                      </div>
                      <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-primary">
                        <Calendar size={18} />
                      </button>
                    </div>
                  )}

                  <button 
                    onClick={() => router.push(`/guardian/animals/${animal.id}`)}
                    className="w-full py-3 border border-stone-200 rounded-xl text-primary font-bold text-sm flex items-center justify-center gap-2 transition-colors hover:bg-stone-50"
                  >
                    <span>View Medical File</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Orders */}
        <div>
          <h3 className="text-xl font-bold mb-4 text-guardian-text">My Orders</h3>
          
          {ordersLoading ? (
            <div className="h-32 bg-guardian-surface shadow-[0_4px_20px_rgba(28,25,23,0.05)] rounded-2xl animate-pulse" />
          ) : recentOrder ? (
            <div className="bg-guardian-surface shadow-[0_4px_20px_rgba(28,25,23,0.05)] rounded-2xl p-5 border border-stone-100">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>{recentOrder.status}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{recentOrder.orderNumber}</p>
                  <p className="text-xs text-guardian-text-muted mt-0.5">{recentOrder.totalAmount} EGP</p>
                </div>
              </div>
              <button 
                onClick={() => router.push(`/guardian/orders`)}
                className="w-full py-3 border border-stone-200 rounded-xl text-primary font-bold text-sm transition-colors hover:bg-stone-50"
              >
                View All Orders
              </button>
            </div>
          ) : (
            <div className="bg-guardian-surface shadow-[0_4px_20px_rgba(28,25,23,0.05)] rounded-2xl p-6 text-center border border-stone-100">
              <p className="text-guardian-text-muted text-sm font-medium">No recent orders</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
