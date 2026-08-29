'use client'

import { useGuardianOrder } from '@/hooks/useGuardian'
import { useParams } from 'next/navigation'
import { useRouter } from '@/lib/i18n-navigation'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowLeft, ArrowRight, AlertCircle, Check, Package, Truck, MapPin, Home, Headset } from 'lucide-react'
import { motion } from 'motion/react'
import { EmptyState } from '@/components/shared/EmptyState'
import clsx from 'clsx'

export default function OrderTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('guardian')
  const id = params?.id as string

  const { data, isLoading, isError } = useGuardianOrder(id)
  
  if (isLoading) {
    return <div className="card pad animate-pulse" style={{ minHeight: 240 }} />
  }

  const order = data?.order

  if (isError || !order) {
    return (
      <EmptyState
        variant="guardian"
        icon={Package}
        title={t('orderNotFound')}
        message={t('emptyOrdersDesc')}
        actionLabel={t('back')}
        onAction={() => router.push('/guardian/orders')}
      />
    )
  }

  const isRtl = locale === 'ar'

  // Define steps
  const steps = [
    { id: 'PENDING', label: t('orderConfirmed'), desc: t('orderConfirmedDesc'), icon: Check, completed: true, active: false, time: '١٢ مايو، ١٠:٣٠ ص' },
    { id: 'PROCESSING', label: t('processing'), desc: t('processingDesc'), icon: Package, completed: false, active: false, time: '١٣ مايو، ٠٢:١٥ م' },
    { id: 'READY', label: order.deliveryMethod === 'delivery' ? t('shipped') : t('readyForPickup'), desc: order.deliveryMethod === 'delivery' ? t('shippedDesc') : t('readyDesc'), icon: Truck, completed: false, active: false, time: 'اليوم، ٠٨:٠٠ ص' },
    { id: 'OUT_FOR_DELIVERY', label: t('outForDelivery'), desc: '', icon: null, completed: false, active: false, time: '' },
    { id: 'COMPLETED', label: t('delivered'), desc: '', icon: null, completed: false, active: false, time: '' },
  ]

  // Calculate states
  const currentStatusIndex = ['PENDING', 'PROCESSING', 'READY', 'OUT_FOR_DELIVERY', 'COMPLETED'].indexOf(order.status.toUpperCase() === 'READY' ? 'READY' : order.status.toUpperCase() === 'COMPLETED' ? 'COMPLETED' : order.status.toUpperCase())
  
  steps.forEach((step, index) => {
    if (index < currentStatusIndex) {
      step.completed = true
    } else if (index === currentStatusIndex) {
      step.active = true
      step.completed = false
    }
  })

  // Cancelled state handling
  const isCancelled = order.status.toUpperCase() === 'CANCELLED'

  return (
    <div className="font-sans antialiased">
      <main>
        
        {/* Hero Section & Order Summary */}
        <section className="mb-6">
          <div className="relative w-full h-48 md:h-64 rounded-[24px] overflow-hidden shadow-[0_12px_32px_rgba(62,63,41,0.04)] border border-[var(--line)]">
            <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-multiply bg-[var(--sage-soft)]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=2000')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--white)] via-[rgba(255,255,255,0.7)] to-transparent"></div>
            
            <div className="absolute bottom-6 start-6 end-6 flex flex-col md:flex-row md:items-end justify-between z-10 gap-4">
              <div>
                <span className={clsx(
                  "inline-block px-3 py-1.5 rounded-[8px] font-bold text-[12px] mb-2",
                  isCancelled ? "bg-[var(--danger-soft)] text-[var(--danger)]" : "bg-[var(--sage-soft)] text-[var(--olive)]"
                )}>
                  {isCancelled ? t('cancelled') : t('inProgress')}
                </span>
                <h2 className="text-[26px] font-extrabold text-[var(--olive)] mb-1 tracking-tight">{t('trackOrder')}</h2>
                <p className="font-bold text-[14px] text-[var(--ink-soft)] num">#{order.orderNumber}</p>
              </div>
              
              <div className="bg-[var(--white)]/80 backdrop-blur-md p-4 rounded-[16px] shadow-sm self-start md:self-end border border-[var(--line)]">
                <p className="font-medium text-[12px] text-[var(--ink-soft)] mb-1">{t('expectedDelivery')}</p>
                <p className="font-extrabold text-[15px] text-[var(--ink)]">
                   {new Date(order.createdAt).toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tracking Timeline & Details Grid */}
        <section className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-5 items-start">
          
          {/* Timeline Layout (Bento Style Card) */}
          <div className="bg-[var(--white)] rounded-[24px] p-6 shadow-[0_12px_32px_rgba(62,63,41,0.04)] border border-[var(--line)] relative overflow-hidden">
            <h3 className="font-extrabold text-[16px] text-[var(--olive)] mb-6 pb-4 border-b border-[var(--line)]">
               {t('shipmentStatus')}
            </h3>
            
            {isCancelled ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-[var(--danger-soft)] flex items-center justify-center mx-auto mb-6">
                     <AlertCircle className="w-10 h-10 text-[var(--danger)]" />
                  </div>
                  <h3 className="font-extrabold text-[18px] text-[var(--ink)] mb-2">{t('orderCancelled')}</h3>
                  <p className="text-[var(--ink-soft)] font-medium text-[14.5px]">تم إلغاء هذا الطلب ولن يتم تنفيذه.</p>
                </div>
            ) : (
                <div className="relative pe-4 rtl:pe-4 rtl:ps-0 ps-0">
                  {/* Background Line */}
                  <div className="absolute end-[19px] rtl:end-[19px] rtl:start-auto start-[19px] top-2 bottom-6 w-[2px] bg-[var(--line)] rounded-full"></div>
                  
                  {/* Animated Progress Line */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${currentStatusIndex * 25}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute end-[19px] rtl:end-[19px] rtl:start-auto start-[19px] top-2 w-[2px] bg-[var(--vitality)] rounded-full origin-top shadow-[0_0_8px_rgba(255,107,0,0.4)]"
                  />

                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.15 }
                      }
                    }}
                  >
                    {steps.map((step, index) => (
                      <motion.div 
                        variants={{
                          hidden: { opacity: 0, x: 20 },
                          visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                        }}
                        key={step.id} 
                        className={clsx(
                          "relative flex items-start gap-4 mb-8",
                          (!step.completed && !step.active) ? "opacity-50 grayscale transition-all duration-300 hover:grayscale-0 hover:opacity-80" : "group"
                        )}
                      >
                        <div className={clsx(
                          "relative z-10 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-[var(--white)] transition-transform duration-300 border",
                          step.completed ? "bg-[var(--olive)] border-[var(--olive)] text-[var(--white)] shadow-sm group-hover:scale-110" :
                          step.active ? "bg-[var(--vitality)] border-[var(--vitality)] text-[var(--white)] shadow-sm animate-pulse" :
                          "bg-[var(--cream-2)] border-[var(--line)]"
                        )}>
                          {step.completed ? (
                             <Check className="w-3.5 h-3.5" strokeWidth={3} />
                          ) : step.active && step.icon ? (
                             <step.icon className="w-3 h-3" strokeWidth={2.5} />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-[var(--line)]"></div>
                          )}
                        </div>
                        <div className={clsx(
                          "pt-0.5 w-full",
                          step.active && "bg-[var(--sage-soft)] p-4 rounded-[14px] -mt-3 -me-2 rtl:-me-2 rtl:-ms-0 -ms-2 border border-[var(--color-olive-soft)]"
                        )}>
                          <div className="flex justify-between items-center mb-1">
                            <h4 className={clsx(
                              "font-bold text-[14.5px]",
                              step.completed ? "text-[var(--ink)]" : 
                              step.active ? "text-[var(--olive)]" : 
                              "text-[var(--ink-soft)]"
                            )}>
                              {step.label}
                            </h4>
                            {(step.completed || step.active) && step.time && (
                               <span className="font-medium text-[12px] text-[var(--ink-soft)] num">{step.time}</span>
                            )}
                          </div>
                          {step.desc && (
                             <p className="font-medium text-[13.5px] text-[var(--ink-soft)] mt-1">{step.desc}</p>
                          )}
                          {step.active && step.id === 'READY' && order.deliveryMethod === 'delivery' && (
                             <div className="mt-3 flex items-center gap-2 bg-[var(--white)] w-fit px-3 py-1.5 rounded-[8px] border border-[var(--line)] shadow-sm">
                               <MapPin className="w-4 h-4 text-[var(--olive)]" />
                               <span className="font-bold text-[12px] text-[var(--ink)]">آخر تحديث: مركز التوزيع، الرياض</span>
                             </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
            )}
          </div>

          {/* Contextual Information Sidebar */}
          <div className="flex flex-col gap-5">
            {/* Delivery Info Card */}
            <div className="bg-[var(--white)] rounded-[24px] p-6 shadow-[0_12px_32px_rgba(62,63,41,0.04)] border border-[var(--line)]">
              <div className="flex items-center gap-2 mb-5 text-[var(--olive)]">
                <Home className="w-5 h-5" />
                <h3 className="font-extrabold text-[14.5px]">
                   {order.deliveryMethod === 'delivery' ? t('deliveryDetails') : t('pickupDetails')}
                </h3>
              </div>
              <div className="space-y-4">
                {order.deliveryMethod === 'delivery' ? (
                  <>
                     <div>
                       <p className="font-medium text-[12px] text-[var(--ink-soft)] mb-1">الشركة الناقلة</p>
                       <p className="font-bold text-[13.5px] text-[var(--ink)]">ناقل إكسبرس (الرقم المرجعي: NAQ123456)</p>
                     </div>
                     <div>
                       <p className="font-medium text-[12px] text-[var(--ink-soft)] mb-1">ملاحظات</p>
                       <p className="font-bold text-[13.5px] text-[var(--ink)] leading-relaxed">
                          {(order as any).notes || 'لا توجد ملاحظات إضافية.'}
                       </p>
                     </div>
                  </>
                ) : (
                  <div>
                    <p className="font-medium text-[12px] text-[var(--ink-soft)] mb-1">موقع الاستلام</p>
                    <p className="font-bold text-[13.5px] text-[var(--ink)] leading-relaxed">
                        العيادة الرئيسية لفيت كير<br/>
                        123 Veterinary Ave.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Support Thread Link */}
            <a href="#" className="bg-[var(--cream-2)] hover:bg-[var(--line)] transition-colors rounded-[24px] p-6 border border-[var(--line)] flex items-center justify-between group active:scale-95 duration-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--white)] text-[var(--olive)] flex items-center justify-center shadow-sm border border-[var(--line)]">
                  <Headset className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[14px] text-[var(--ink)] mb-1">{t('needHelp')}</h3>
                  <p className="font-medium text-[12px] text-[var(--ink-soft)]">{t('contactSupport')}</p>
                </div>
              </div>
              {isRtl ? <ArrowLeft className="w-5 h-5 text-[var(--ink-soft)] group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="w-5 h-5 text-[var(--ink-soft)] group-hover:translate-x-1 transition-transform" />}
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}
