'use client'

import { useGuardianPet, useGuardianPetVaccinations } from '@/hooks/useGuardian'
import { useParams } from 'next/navigation'
import { useRouter } from '@/lib/i18n-navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { guardianTransitions } from '@/lib/guardian/motion'
import { ArrowRight, ArrowLeft, Pencil, TrendingDown, Target, CalendarDays, Syringe, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { getWeightProgress } from '@/lib/guardian/weightProgress'

const EmptyState = ({ title, message }: { title: string, message: string }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-[var(--color-cream-2)] rounded-[18px]">
    <AlertCircle className="w-8 h-8 text-[var(--color-ink-soft)] mb-3 opacity-50" strokeWidth={1.5} />
    <h3 className="text-[14px] font-bold text-[var(--color-ink)] mb-1">{title}</h3>
    {message && <p className="text-[12px] font-medium text-[var(--color-ink-soft)] max-w-[200px]">{message}</p>}
  </div>
)

export default function AnimalProfilePage() {
  const params = useParams()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('guardian')
  const tSession = useTranslations('session')
  const id = params?.id as string
  const [activeTab, setActiveTab] = useState<'history' | 'weight' | 'vaccinations' | 'appointments'>('history')

  const { data, isLoading, isError } = useGuardianPet(id)
  const { data: vaxData } = useGuardianPetVaccinations(id)
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-24 bg-[var(--color-sage-soft)] rounded-full mb-4" />
          <div className="w-32 h-6 bg-[var(--color-sage-soft)] rounded mb-2" />
        </div>
      </div>
    )
  }

  if (isError || !data?.animal) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <p className="text-[var(--color-ink-soft)] font-medium mb-4">{t('notFound')}</p>
        <button onClick={() => router.back()} className="text-[var(--color-olive)] font-bold">{t('backToList')}</button>
      </div>
    )
  }

  const animal = data.animal
  const weightProgress = getWeightProgress(animal)
  
  let dashoffset = 289
  if (weightProgress) {
    const progress = Math.max(0, Math.min(100, weightProgress.progress))
    dashoffset = 289 - (289 * progress) / 100
  }

  return (
    <div className="flex flex-col max-w-[800px] mx-auto w-full">
      <button 
        className="h-[36px] px-[14px] rounded-[10px] bg-transparent text-[var(--color-ink-soft)] font-bold text-[13px] inline-flex items-center gap-[6px] transition-colors hover:bg-[rgba(0,0,0,0.04)] hover:text-[var(--color-ink)] self-start mb-[14px]"
        onClick={() => router.push('/guardian/animals')}
      >
        {locale === 'ar' ? <ArrowRight className="w-[15px] h-[15px]" strokeWidth={2.4} /> : <ArrowLeft className="w-[15px] h-[15px]" strokeWidth={2.4} />}
        {t('backToPets')}
      </button>

      <div className="bg-[var(--color-white)] rounded-[24px] p-6 shadow-[0_12px_32px_rgba(62,63,41,0.04)] border border-[var(--color-line)] mb-5">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="relative w-[104px] h-[104px] flex items-center justify-center shrink-0">
            <svg width="104" height="104" className="-rotate-90 origin-center">
              <circle cx="52" cy="52" r="46" strokeWidth="6" fill="none" stroke="var(--color-line)" strokeLinecap="round" />
              <circle cx="52" cy="52" r="46" strokeWidth="6" fill="none" stroke="var(--color-vitality)" strokeLinecap="round" strokeDasharray="289" strokeDashoffset={dashoffset} className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 m-auto w-[80px] h-[80px] rounded-full bg-[var(--color-cream-2)] flex items-center justify-center text-[var(--color-olive)] font-black text-[28px]">
              {animal.name.charAt(0)}
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex justify-between items-start mb-[16px]">
              <div>
                <h2 className="text-[22px] font-extrabold text-[var(--color-olive)] leading-tight">{animal.name}</h2>
                <p className="text-[13px] font-medium text-[var(--color-ink-soft)] mt-[2px]">
                  {animal.species} {animal.breed ? `· ${animal.breed}` : ''} {animal.gender ? `· ${animal.gender === 'MALE' ? t('male') : t('female')}` : ''} {animal.age ? `· ${animal.age}` : ''}
                </p>
              </div>
              <button className="h-8 px-3 rounded-[10px] bg-transparent border-1.5 border-[var(--color-olive)] text-[var(--color-olive)] font-bold text-[12px] transition-colors hover:bg-[var(--color-sage-soft)] inline-flex items-center gap-[5px]">
                <Pencil className="w-3.5 h-3.5" />
                {t('edit')}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-[14px]">
              <span className="inline-flex items-center gap-[5px] px-[9px] py-[4px] rounded-[8px] bg-[var(--color-vitality-soft)] text-[var(--color-vitality)] text-[11.5px] font-bold num">
                <TrendingDown className="w-[14px] h-[14px]" />
                {animal.weight ? `${t('currentWeight')} ${animal.weight} ${t('kg')}` : t('noWeight')}
              </span>
              {animal.targetWeight && (
                <span className="inline-flex items-center px-[9px] py-[4px] rounded-[8px] bg-[var(--color-tan-soft)] text-[#7A5C36] text-[11.5px] font-bold num">
                  {t('target')} {animal.targetWeight} {t('kg')}
                </span>
              )}
            </div>

            {weightProgress && (
              <p className="text-[12.5px] font-medium text-[var(--color-ink-soft)] leading-[1.9]">
                {weightProgress.onTrack 
                  ? t('goalReachedMessage') 
                  : t('goalProgressMessage')}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 p-[5px] bg-[rgba(235,235,225,0.6)] rounded-[14px] mb-[24px] overflow-x-auto hide-scrollbar">
        {[
          { id: 'history', label: t('medicalHistory') },
          { id: 'weight', label: t('weightCurve') },
          { id: 'vaccinations', label: t('vaccinations') },
          { id: 'appointments', label: t('visitsHistory') }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`relative flex-1 min-w-[90px] h-[36px] rounded-[10px] text-[12.5px] font-bold transition-colors z-10 ${
              activeTab === tab.id ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="pet-detail-tab"
                className="absolute inset-0 bg-[var(--color-white)] rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] -z-10"
                transition={guardianTransitions.spring}
              />
            )}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="bg-[var(--color-white)] rounded-[24px] p-6 shadow-[0_12px_32px_rgba(62,63,41,0.04)] border border-[var(--color-line)]">
                {animal.sessions && animal.sessions.length > 0 ? (
                  <div className="relative pl-[10px] pr-[20px] md:pr-[24px] before:content-[''] before:absolute before:right-0 before:top-[10px] before:bottom-[10px] before:w-[2px] before:bg-[var(--color-line)] before:rounded-full">
                    {animal.sessions.map((session: any, i: number) => (
                      <div key={session.id} className={`relative mb-[24px] last:mb-0 ${i === 0 ? '' : 'opacity-70'}`}>
                        <div className={`absolute -right-[25px] md:-right-[29px] top-[4px] w-[12px] h-[12px] rounded-full border-[3px] border-[var(--color-white)] shadow-sm ${i === 0 ? 'bg-[var(--color-olive)]' : 'bg-[var(--color-ink-soft)]'}`} />
                        <h4 className={`text-[14.5px] font-bold leading-tight mb-1 ${i === 0 ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-soft)]'}`}>
                          {session.type || t('generalCheckup')}
                        </h4>
                        <div className="text-[12px] font-bold text-[var(--color-ink-soft)] num mb-1">
                          {new Date(session.createdAt).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        {session.notes && (
                          <p className="text-[12.5px] font-medium text-[var(--color-ink-soft)] leading-relaxed mt-2 p-3 bg-[var(--color-cream-2)] rounded-[12px]">
                            {session.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title={t('noMedicalHistory')} message="" />
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'weight' && (
            <motion.div key="weight" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="bg-[var(--color-white)] rounded-[24px] p-6 shadow-[0_12px_32px_rgba(62,63,41,0.04)] border border-[var(--color-line)]">
                <div className="flex justify-between items-start mb-[18px]">
                  <div>
                    <p className="text-[12px] font-medium text-[var(--color-ink-soft)] mb-0.5">{t('currentWeight')}</p>
                    <p className="text-[20px] font-black text-[var(--color-olive)] num">{animal.weight || '--'} {t('kg')}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-[12px] font-medium text-[var(--color-ink-soft)] mb-0.5">{t('target')}</p>
                    <p className="text-[20px] font-black text-[var(--color-olive)] num">{animal.targetWeight || '--'} {t('kg')}</p>
                  </div>
                </div>
                {/* SVG mock graph */}
                <svg viewBox="0 0 480 140" className="w-full h-[140px]">
                  <polyline points="0,20 80,32 160,48 240,60 320,78 400,90 480,100" fill="none" stroke="var(--color-vitality)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="0" y1="115" x2="480" y2="115" stroke="var(--color-line)" strokeDasharray="4 4"/>
                  <text x="0" y="130" fontSize="10" fill="#8a8a7a" fontFamily="Inter" textAnchor="end">الآن</text>
                  <text x="480" y="130" fontSize="10" fill="#8a8a7a" fontFamily="Inter" textAnchor="start">سابقاً</text>
                </svg>
              </div>
            </motion.div>
          )}

          {activeTab === 'vaccinations' && (
            <motion.div key="vaccinations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="bg-[var(--color-white)] rounded-[24px] p-2 shadow-[0_12px_32px_rgba(62,63,41,0.04)] border border-[var(--color-line)] flex flex-col gap-0.5">
                {vaxData?.vaccinations && vaxData.vaccinations.length > 0 ? (
                  vaxData.vaccinations.map((vax: any) => {
                    const isOverdue = vax.nextDueDate && new Date(vax.nextDueDate) < new Date()
                    
                    return (
                      <div key={vax.id} className="flex items-center gap-3 p-3.5 rounded-[18px] bg-transparent transition-colors hover:bg-[var(--color-cream-2)]">
                        <div className={`w-[38px] h-[38px] rounded-[12px] flex items-center justify-center shrink-0 ${isOverdue ? 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]' : 'bg-[var(--color-good-soft)] text-[var(--color-good)]'}`}>
                          <Syringe className="w-[18px] h-[18px]" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                          <div className="text-[13.5px] font-bold text-[var(--color-ink)]">{vax.vaccine.name}</div>
                          <div className="text-[12px] font-medium text-[var(--color-ink-soft)] num">
                            {vax.nextDueDate ? `${tSession('nextVisit')}: ${new Date(vax.nextDueDate).toLocaleDateString(locale)}` : ''}
                          </div>
                        </div>
                        <span className={`inline-flex px-[8px] py-[3px] rounded-[6px] text-[10px] font-bold ${isOverdue ? 'bg-[var(--color-danger)] text-[var(--color-white)]' : 'bg-[var(--color-good-soft)] text-[var(--color-good)]'}`}>
                          {isOverdue ? t('overdue') : t('valid')}
                        </span>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-4"><EmptyState title={t('noVaccinations')} message="" /></div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'appointments' && (
            <motion.div key="appointments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="bg-[var(--color-white)] rounded-[24px] p-2 shadow-[0_12px_32px_rgba(62,63,41,0.04)] border border-[var(--color-line)] flex flex-col gap-0.5">
                {animal.appointments && animal.appointments.length > 0 ? (
                  animal.appointments.map((apt: any) => {
                    const isUpcoming = new Date(apt.scheduledAt) > new Date()
                    
                    return (
                      <div key={apt.id} className="flex items-center gap-3 p-3.5 rounded-[18px] bg-transparent transition-colors hover:bg-[var(--color-cream-2)]">
                        <div className={`w-[38px] h-[38px] rounded-[12px] flex items-center justify-center shrink-0 ${isUpcoming ? 'bg-[var(--color-vitality-soft)] text-[var(--color-vitality)]' : 'bg-[var(--color-sage-soft)] text-[var(--color-olive)]'}`}>
                          <CalendarDays className="w-[18px] h-[18px]" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                          <div className="text-[13.5px] font-bold text-[var(--color-ink)]">{apt.doctor?.name ? `د. ${apt.doctor.name}` : t('appointment')}</div>
                          <div className="text-[12px] font-medium text-[var(--color-ink-soft)] num">
                            {new Date(apt.scheduledAt).toLocaleDateString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <span className={`inline-flex px-[8px] py-[3px] rounded-[6px] text-[10px] font-bold ${isUpcoming ? 'bg-[var(--color-vitality-soft)] text-[var(--color-vitality)]' : 'bg-[var(--color-good-soft)] text-[var(--color-good)]'}`}>
                          {isUpcoming ? t('upcoming') : t('completed')}
                        </span>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-4"><EmptyState title={t('noAppointmentsYet')} message="" /></div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
