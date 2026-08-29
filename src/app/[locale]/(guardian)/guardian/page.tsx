'use client'

import { useGuardianPets, useGuardianOrders, useGuardianStoreProducts } from '@/hooks/useGuardian'
import type { GuardianAnimal } from '@/types'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/lib/i18n-navigation'
import { PawPrint, Calendar, Layers, Package, Clock, Plus, ShoppingBag } from 'lucide-react'
import { GuardianPetCard, GuardianAddPetCard } from '@/components/guardian/PetCard'
import { GuardianStatCard } from '@/components/guardian/StatCard'
import { EmptyState } from '@/components/shared/EmptyState'
import Image from 'next/image'

function formatAppointment(scheduledAt: string | Date) {
  const d = new Date(scheduledAt)
  if (Number.isNaN(d.getTime())) return null
  return {
    day: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
  }
}

export default function GuardianHomePage() {
  const t = useTranslations('guardian')
  const router = useRouter()
  const { data: petsData, isLoading: petsLoading } = useGuardianPets()
  const { data: ordersData } = useGuardianOrders()
  const { data: productsData } = useGuardianStoreProducts()

  const animals: GuardianAnimal[] = petsData?.animals || []
  const activeOrders = (ordersData?.data || []).filter((o) =>
    ['PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.status)
  ).length

  const upcomingThisWeek = animals.reduce((count, a) => {
    return (
      count +
      a.appointments.filter((apt) => {
        const days = (new Date(apt.scheduledAt).getTime() - Date.now()) / 86400000
        return days >= 0 && days <= 7
      }).length
    )
  }, 0)

  const activeGoals = animals.filter((a) => a.targetWeight != null).length
  const nextAnimalWithAppt = animals.find((a) => a.appointments?.[0])
  const nextAppt = nextAnimalWithAppt?.appointments?.[0]
  const nextApptWhen = nextAppt ? formatAppointment(nextAppt.scheduledAt) : null
  const suggestedProducts = (productsData?.data || []).slice(0, 4)

  return (
    <>
      <div className="grid4 stat-scroll" style={{ marginBottom: 22 }}>
        <GuardianStatCard
          icon={PawPrint}
          value={animals.length}
          label={t('registered_pets')}
          iconBg="var(--sage-soft)"
          iconColor="var(--olive)"
        />
        <GuardianStatCard
          icon={Calendar}
          value={upcomingThisWeek}
          label={t('statApptThisWeek', { count: upcomingThisWeek })}
          iconBg="var(--vitality-soft)"
          iconColor="var(--vitality)"
        />
        <GuardianStatCard
          icon={Layers}
          value={activeGoals}
          label={t('statActiveGoals', { count: activeGoals })}
          iconBg="var(--good-soft)"
          iconColor="var(--good)"
        />
        <GuardianStatCard
          icon={Package}
          value={activeOrders}
          label={t('statOrdersActive')}
          iconBg="var(--tan-soft)"
          iconColor="#7A5C36"
        />
      </div>

      <div className="home-grid">
        {nextAppt && nextApptWhen ? (
          <div
            className="card pad"
            style={{ cursor: 'pointer' }}
            onClick={() => router.push(`/guardian/appointments/${nextAppt.id}`)}
            onKeyDown={(e) => e.key === 'Enter' && router.push(`/guardian/appointments/${nextAppt.id}`)}
            role="button"
            tabIndex={0}
          >
            <span className="badge badge-vit" style={{ marginBottom: 14 }}>
              <Clock width={12} height={12} strokeWidth={2.4} />
              {t('todayFocusBadge')}
            </span>
            <div className="row gap12" style={{ marginBottom: 16 }}>
              <div className="avatar" style={{ width: 46, height: 46, fontSize: 16 }}>
                {nextAnimalWithAppt?.name.charAt(0)}
              </div>
              <div>
                <h4 style={{ fontWeight: 800, color: 'var(--olive)', fontSize: 15 }}>
                  {nextAnimalWithAppt?.name}
                </h4>
                <p className="muted" style={{ fontSize: 12.5 }}>
                  {nextAppt.doctor?.name
                    ? t('withDoctor', { name: nextAppt.doctor.name })
                    : t('upcomingAppointment')}
                </p>
              </div>
            </div>
            <div className="row gap8 muted num" style={{ fontSize: 13, fontWeight: 600, marginBottom: 18 }}>
              <Clock width={15} height={15} strokeWidth={2} />
              {nextApptWhen.day}، {nextApptWhen.time}
            </div>
            <div className="row gap8">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ flex: 1 }}
                onClick={(e) => {
                  e.stopPropagation()
                  router.push('/guardian/appointments/new')
                }}
              >
                {t('reschedule')}
              </button>
              <button
                type="button"
                className="btn btn-soft btn-sm"
                style={{ flex: 1 }}
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/guardian/appointments/${nextAppt.id}`)
                }}
              >
                {t('details')}
              </button>
            </div>
          </div>
        ) : (
          <div className="card pad empty">
            <div className="empty-icon">
              <Calendar width={28} height={28} strokeWidth={2} />
            </div>
            <h3>{t('noUpcomingAppointments')}</h3>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => router.push('/guardian/appointments/new')}>
              {t('bookAppointment')}
            </button>
          </div>
        )}

        <div>
          <div className="row between" style={{ marginBottom: 14 }}>
            <h2 className="section-title">{t('myAnimals')}</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => router.push('/guardian/animals/new')}>
              <Plus width={15} height={15} strokeWidth={2.4} />
              {t('addPet')}
            </button>
          </div>

          {petsLoading ? (
            <div className="grid2">
              <div className="card skel" style={{ height: 96 }} />
              <div className="card skel" style={{ height: 96 }} />
            </div>
          ) : animals.length === 0 ? (
            <EmptyState
              variant="guardian"
              icon={PawPrint}
              title={t('noPets')}
              message={t('addPetDescription')}
              actionLabel={t('addPet')}
              onAction={() => router.push('/guardian/animals/new')}
            />
          ) : (
            <div className="grid2">
              {animals.map((animal) => (
                <GuardianPetCard
                  key={animal.id}
                  animal={animal}
                  onClick={() => router.push(`/guardian/animals/${animal.id}`)}
                />
              ))}
              <GuardianAddPetCard onClick={() => router.push('/guardian/animals/new')} />
            </div>
          )}
        </div>
      </div>

      {suggestedProducts.length > 0 && (
        <>
          <div className="divider" />
          <div className="row between" style={{ marginBottom: 14 }}>
            <h2 className="section-title">{t('suggestedProducts')}</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => router.push('/guardian/store')}>
              {t('viewAll')}
            </button>
          </div>
          <div className="grid4">
            {suggestedProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                className="card prod-card"
                onClick={() => router.push(`/guardian/store/${product.id}`)}
              >
                <div className="prod-thumb" style={{ background: 'var(--sage-soft)' }}>
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                  ) : (
                    <ShoppingBag width={44} height={44} strokeWidth={1.5} style={{ opacity: 0.55 }} />
                  )}
                </div>
                <div className="prod-body">
                  <div className="prod-name">{product.name}</div>
                  <div className="prod-cat">{product.category}</div>
                  <div className="prod-price num">
                    {product.price} {t('currency')}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  )
}
