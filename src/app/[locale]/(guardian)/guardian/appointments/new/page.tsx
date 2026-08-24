'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/lib/i18n-navigation'
import { useGuardianPets, useGuardianDoctors, useGuardianCreateAppointment } from '@/hooks/useGuardian'
import { ApiRequestError } from '@/lib/api/client'
import { ArrowLeft, ArrowRight, AlertCircle, Plus, Calendar, Sun, Clock, Stethoscope, ChevronDown, CalendarCheck, Check } from 'lucide-react'
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns'
import { ar } from 'date-fns/locale'
import { motion, AnimatePresence } from 'motion/react'

export default function BookAppointmentPage() {
  const t = useTranslations('guardian')
  const locale = useLocale()
  const router = useRouter()
  const { data: petsData, isLoading: petsLoading } = useGuardianPets()
  const { data: doctorsData, isLoading: doctorsLoading } = useGuardianDoctors()
  const createAppointment = useGuardianCreateAppointment()

  const animals = petsData?.animals || []
  const doctors = doctorsData?.doctors || []

  const [selectedAnimalId, setSelectedAnimalId] = useState('')
  const [selectedService, setSelectedService] = useState('Consultation')
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('')
  const [date, setDate] = useState<Date | null>(null)
  const [time, setTime] = useState('')
  const [step, setStep] = useState(1)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 6 })
  )
  const weekDays = Array.from({ length: 7 }).map((_, index) => addDays(currentWeekStart, index))
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const services = [
    { key: 'Consultation', label: t('consultation') },
    { key: 'Vaccination', label: t('vaccination') },
    { key: 'Grooming', label: t('grooming') },
    { key: 'Follow-up', label: t('followUp') },
    { key: 'Emergency', label: t('emergency') },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedAnimalId || !date || !time) {
      setError(t('fillRequiredFields'))
      return
    }

    try {
      setError('')
      const dateStr = date ? format(date, 'yyyy-MM-dd') : ''
      const scheduledAt = new Date(`${dateStr}T${time}:00`)

      await createAppointment.mutateAsync({
        animalId: selectedAnimalId,
        scheduledAt: scheduledAt.toISOString(),
        doctorId: selectedDoctorId || undefined,
        notes: `[${selectedService}] ${notes}`.trim(),
      })

      setIsSuccess(true)
      setTimeout(() => {
        router.push('/guardian?booked=true')
      }, 2000)
    } catch (err: unknown) {
      const message = err instanceof ApiRequestError ? err.localized.en : (err as Error)?.message
      setError(message || 'Failed to book appointment')
    }
  }

  const isSubmitting = createAppointment.isPending

  // Mock available times
  const availableTimes = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00']

  const nextStep = () => {
    if (step === 1 && !selectedAnimalId) return;
    if (step === 2 && !date) return;
    if (step === 3 && !time) return;
    setStep(s => Math.min(s + 1, 4))
  }
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  // 1 is forward, -1 is backward (assuming RTL layout might flip this visually, but logic remains)
  const direction = locale === 'ar' ? -1 : 1;

  return (
    <div className="relative min-h-[400px] overflow-hidden">
      <main className="mx-auto flex max-w-[800px] flex-col gap-8">
        
        {isSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 bg-guardian-primary/10 text-guardian-primary rounded-full flex items-center justify-center mb-6">
              <Check className="w-12 h-12" />
            </div>
            <h2 className="font-headline-lg text-headline-lg text-guardian-primary mb-4">{t('bookingConfirmed')}</h2>
            <p className="font-body-md text-guardian-on-surface-variant max-w-md">{t('bookingSuccessMessage')}</p>
          </motion.div>
        ) : (
          <>
            {/* Stepper Header */}
            <div className="flex items-center justify-between relative mb-4">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-guardian-surface-variant -translate-y-1/2 z-0 rounded-full" />
              <motion.div 
                className="absolute top-1/2 left-0 right-0 h-1 bg-guardian-primary -translate-y-1/2 z-0 rounded-full origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: (step - 1) / 3 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{ transformOrigin: locale === 'ar' ? 'right' : 'left' }}
              />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative z-10 flex flex-col items-center">
                  <motion.div 
                    initial={false}
                    animate={{ 
                      backgroundColor: step >= i ? 'var(--guardian-primary)' : 'var(--guardian-surface-container-high)',
                      color: step >= i ? 'var(--guardian-on-primary)' : 'var(--guardian-on-surface-variant)',
                      scale: step === i ? 1.1 : 1
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center font-numeric-data font-bold shadow-sm transition-colors duration-300"
                  >
                    {step > i ? <Check className="w-5 h-5" /> : i}
                  </motion.div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pb-8 flex flex-col h-full flex-1">
              {error && (
                <div className="bg-guardian-error-container text-guardian-on-error-container p-4 rounded-xl border border-guardian-error/20 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="relative min-h-[350px]">
                <AnimatePresence custom={direction} mode="wait">
                  {step === 1 && (
                    <motion.section 
                      key="step1"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute inset-0 space-y-6"
                    >
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-guardian-secondary text-guardian-on-secondary font-numeric-data text-numeric-data">1</span>
              <h3 className="font-headline-md text-headline-md text-guardian-primary">{t('whichPet')}</h3>
            </div>
            
            <div className="flex overflow-x-auto hide-scrollbar gap-gutter pb-4 -mx-container-margin px-container-margin snap-x snap-mandatory">
              {petsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex-none w-32 snap-center h-[148px] bg-guardian-surface-variant rounded-xl animate-pulse"></div>
                ))
              ) : animals.length === 0 ? (
                <div className="w-full p-6 bg-guardian-surface-container-low rounded-xl text-center text-guardian-on-surface-variant border border-guardian-outline-variant/30 flex flex-col items-center gap-3">
                  <p>{t('addPetFirst')}</p>
                  <button
                    type="button"
                    onClick={() => router.push('/guardian/animals/new')}
                    className="px-4 py-2 bg-guardian-primary text-guardian-on-primary font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity"
                  >
                    {t('addNewPet')}
                  </button>
                </div>
              ) : (
                <>
                  {animals.map((animal: any) => {
                    const isSelected = selectedAnimalId === animal.id;
                    return (
                      <button
                        key={animal.id}
                        type="button"
                        onClick={() => setSelectedAnimalId(animal.id)}
                        className="flex-none w-32 snap-center group outline-none"
                      >
                        <div className={`rounded-xl p-4 flex flex-col items-center gap-4 transition-all duration-300 transform relative overflow-hidden ${
                          isSelected
                            ? 'bg-guardian-surface-container-lowest active-shadow border-2 border-guardian-secondary scale-100'
                            : 'bg-guardian-surface-container-lowest soft-shadow border-2 border-transparent hover:border-guardian-outline-variant/30 group-hover:-translate-y-1'
                        }`}>
                          {isSelected && <div className="absolute inset-0 bg-guardian-secondary/5 opacity-100"></div>}
                          <div className={`w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold transition-opacity ${
                            isSelected ? 'bg-guardian-primary text-guardian-on-primary' : 'bg-guardian-surface-variant text-guardian-on-surface-variant opacity-80 group-hover:opacity-100'
                          }`}>
                            {animal.name[0].toUpperCase()}
                          </div>
                          <span className={`font-label-md text-label-md ${
                            isSelected ? 'text-guardian-primary font-bold' : 'text-guardian-on-surface-variant'
                          }`}>
                            {animal.name}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                  
                  {/* Add New Pet */}
                  <button type="button" onClick={() => router.push('/guardian/animals/new')} className="flex-none w-32 snap-center group outline-none">
                    <div className="bg-guardian-surface-container-low rounded-xl p-4 flex flex-col items-center justify-center gap-4 h-full min-h-[148px] border-2 border-dashed border-guardian-outline-variant hover:bg-guardian-surface-variant/50 transition-colors duration-300">
                      <div className="w-12 h-12 rounded-full bg-guardian-surface-container-highest flex items-center justify-center text-guardian-outline">
                        <Plus className="w-8 h-8" />
                      </div>
                      <span className="font-label-md text-label-md text-guardian-on-surface-variant">
                        {t('addPet')}
                      </span>
                    </div>
                  </button>
                </>
              )}
            </div>
          </motion.section>
        )}

                  {step === 2 && (
                    <motion.section 
                      key="step2"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute inset-0 space-y-6"
                    >
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-guardian-surface-container-high text-guardian-on-surface-variant font-numeric-data text-numeric-data">2</span>
              <h3 className="font-headline-md text-headline-md text-guardian-primary">{t('dateTime')}</h3>
            </div>
            
            <div className="bg-guardian-surface-container-lowest rounded-xl p-6 soft-shadow space-y-4">
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setCurrentWeekStart((prev) => subWeeks(prev, 1))} className="p-2 rounded-xl hover:bg-guardian-surface-variant text-guardian-primary transition-all">
                  {locale === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                </button>
                <span className="font-label-md text-guardian-primary font-bold capitalize">
                  {format(currentWeekStart, 'MMMM yyyy', { locale: locale === 'ar' ? ar : undefined })}
                </span>
                <button type="button" onClick={() => setCurrentWeekStart((prev) => addWeeks(prev, 1))} className="p-2 rounded-xl hover:bg-guardian-surface-variant text-guardian-primary transition-all">
                  {locale === 'ar' ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const isSelected = date ? isSameDay(day, date) : false
                  const isToday = isSameDay(day, new Date())
                  const isPast = day < new Date(new Date().setHours(0,0,0,0))
                  return (
                    <button
                      key={day.toString()}
                      type="button"
                      disabled={isPast}
                      onClick={() => setDate(day)}
                      className={`flex flex-col items-center py-3 rounded-xl transition-all duration-200 ${
                        isSelected
                          ? 'bg-guardian-primary text-guardian-on-primary shadow-sm'
                          : isPast
                          ? 'opacity-30 cursor-not-allowed text-guardian-on-surface-variant'
                          : 'hover:bg-guardian-surface-variant text-guardian-on-surface border border-guardian-outline-variant/10'
                      }`}
                    >
                      <span className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${
                        isSelected ? 'text-guardian-on-primary/80' : 'text-guardian-on-surface-variant'
                      }`}>
                        {format(day, 'eee', { locale: locale === 'ar' ? ar : undefined })}
                      </span>
                      <span className={`text-base font-semibold ${isToday && !isSelected ? 'text-guardian-secondary border-b-2 border-guardian-secondary' : ''}`}>
                        {format(day, 'd')}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.section>
        )}

        {step === 3 && (
          <motion.section 
            key="step3"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 space-y-6"
          >
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-guardian-surface-container-high text-guardian-on-surface-variant font-numeric-data text-numeric-data">3</span>
              <h3 className="font-headline-md text-headline-md text-guardian-primary">{t('availableTimes')}</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availableTimes.map((t_time, idx) => {
                const isSelected = time === t_time;
                const isPast = false; // Mock logic
                return (
                  <button
                    key={t_time}
                    type="button"
                    onClick={() => setTime(t_time)}
                    disabled={isPast || !date}
                    className={
                      isSelected
                        ? "bg-guardian-secondary text-guardian-on-secondary shadow-md py-4 px-6 rounded-xl flex items-center justify-center gap-2 transform scale-[1.02] transition-transform font-bold"
                        : isPast || !date
                        ? "bg-guardian-surface-container-lowest soft-shadow py-4 px-6 rounded-xl flex items-center justify-center gap-2 border border-transparent opacity-50 cursor-not-allowed text-guardian-outline"
                        : "bg-guardian-surface-container-lowest soft-shadow hover:shadow-md transition-shadow py-4 px-6 rounded-xl flex items-center justify-center gap-2 border border-transparent hover:border-guardian-outline-variant/20 text-guardian-on-surface"
                    }
                  >
                    {isSelected ? <Sun className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    <span className={`font-numeric-data text-numeric-data`}>{t_time}</span>
                  </button>
                )
              })}
            </div>
          </motion.section>
        )}

        {step === 4 && (
          <motion.section 
            key="step4"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 space-y-6"
          >
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-guardian-surface-container-high text-guardian-on-surface-variant font-numeric-data text-numeric-data">4</span>
              <h3 className="font-headline-md text-headline-md text-guardian-primary">{t('additionalDetails')}</h3>
            </div>

            <div className="bg-guardian-surface-container-lowest rounded-xl p-6 soft-shadow space-y-4">
               <div className="relative">
                  <Stethoscope className="w-5 h-5 absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 text-guardian-on-surface-variant pointer-events-none" />
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full ltr:pl-12 rtl:pr-12 ltr:pr-4 rtl:pl-4 py-4 bg-guardian-surface border border-guardian-outline-variant/30 rounded-xl focus:outline-none focus:border-guardian-secondary transition-all font-body-md text-body-md text-guardian-on-surface appearance-none"
                  >
                    <option value="">{t('anyAvailableDoctor')}</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 text-guardian-on-surface-variant pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-4 py-4 bg-guardian-surface border border-guardian-outline-variant/30 rounded-xl focus:outline-none focus:border-guardian-secondary transition-all font-body-md text-body-md text-guardian-on-surface appearance-none"
                  >
                    {services.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 text-guardian-on-surface-variant pointer-events-none" />
                </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>

              {/* Navigation Actions */}
              <div className="pt-8 flex flex-row-reverse justify-between items-center mt-auto border-t border-guardian-surface-variant">
                {step < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={(step === 1 && !selectedAnimalId) || (step === 2 && !date) || (step === 3 && !time)}
                    className="md:px-12 px-6 h-14 bg-guardian-primary text-guardian-on-primary rounded-full font-label-md text-label-md md:text-body-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:active:scale-100"
                  >
                    <span>{t('next')}</span>
                    {locale === 'ar' ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedAnimalId || !date || !time}
                    className="md:px-12 px-6 h-14 bg-guardian-secondary text-guardian-on-secondary rounded-full font-label-md text-label-md md:text-body-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:active:scale-100"
                  >
                    <span>{isSubmitting ? t('booking') : t('confirmAppointment')}</span>
                    {!isSubmitting && <CalendarCheck className="w-5 h-5" />}
                  </button>
                )}

                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="md:px-8 px-6 h-14 bg-guardian-surface-container-low text-guardian-primary border border-guardian-outline-variant/30 rounded-full font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-guardian-surface-variant active:scale-[0.98] transition-all"
                  >
                    {locale === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                    <span>{t('back')}</span>
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  )
}
