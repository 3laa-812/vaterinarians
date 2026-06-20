'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useSession, useSaveSession } from '@/hooks/useSessions'
import { SessionForm } from '@/components/sessions/SessionForm'
import { SpeciesTag } from '@/components/shared/SpeciesTag'
import { StatusBadge } from '@/components/appointments/StatusBadge'
import Link from 'next/link'

export default function SessionDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id || ''
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('session')
  const tAnimal = useTranslations('animal')
  const tPayment = useTranslations('payment')

  const [isEditing, setIsEditing] = useState(false)

  const { data: appointment, isLoading, error, refetch } = useSession(id)
  const saveMutation = useSaveSession(id)

  const handleSubmit = async (data: any) => {
    try {
      await saveMutation.mutateAsync(data)
      setIsEditing(false)
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-24 bg-outline/10 rounded-2xl" />
        <div className="h-96 bg-outline/10 rounded-2xl" />
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="p-6 text-center max-w-md mx-auto py-20">
        <span className="text-4xl block mb-4">⚠️</span>
        <p className="text-secondary">
          {locale === 'ar' ? 'الجلسة غير موجودة' : 'Session not found'}
        </p>
        <Link href={`/${locale}/appointments`} className="mt-4 inline-block text-teal-600 font-semibold hover:underline">
          {locale === 'ar' ? 'الرجوع إلى الجدول' : 'Back to Schedule'}
        </Link>
      </div>
    )
  }

  const sessionData = appointment.session
  const paymentData = appointment.payment

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Patient info card */}
      <div className="bg-surface border border-outline/10 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-secondary uppercase tracking-wider font-semibold">
            {locale === 'ar' ? 'تفاصيل جلسة الكشف' : 'Exam Session Details'}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-2xl font-bold text-primary">
              {appointment.animal.name}
            </h1>
            <SpeciesTag species={appointment.animal.species} />
          </div>
          <p className="text-sm text-secondary mt-1">
            {appointment.animal.breed || ''}
          </p>
        </div>
        <div className="text-start sm:text-end flex flex-col sm:items-end gap-2">
          <p className="text-sm font-medium text-primary">
            {new Date(appointment.scheduledAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            {isEditing ? t('cancel') : (locale === 'ar' ? 'تعديل الجلسة' : 'Edit Session')}
          </button>
        </div>
      </div>

      {isEditing ? (
        <SessionForm
          initialData={{
            weight: sessionData?.weight || undefined,
            clinicalNotes: sessionData?.clinicalNotes || '',
            treatmentPlan: sessionData?.treatmentPlan || '',
            nextVisitDate: sessionData?.nextVisitDate ? new Date(sessionData.nextVisitDate).toISOString().split('T')[0] : '',
            totalAmount: paymentData?.totalAmount || 0,
            paidAmount: paymentData?.paidAmount || 0,
            notes: paymentData?.notes || '',
          }}
          onSubmit={handleSubmit}
          onCancel={() => setIsEditing(false)}
          isLoading={saveMutation.isPending}
        />
      ) : (
        <div className="space-y-6">
          {/* Clinical observations */}
          <div className="bg-surface border border-outline/10 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-teal-600 border-b border-outline/5 pb-2">
              {locale === 'ar' ? 'البيانات السريرية' : 'Clinical Details'}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-secondary block">{t('weight')}</span>
                <span className="text-lg font-bold text-primary mt-1 block font-mono">
                  {sessionData?.weight ? `${sessionData.weight} ${tAnimal('kg')}` : '—'}
                </span>
              </div>
              <div>
                <span className="text-xs text-secondary block">{t('nextVisit')}</span>
                <span className="text-lg font-bold text-primary mt-1 block">
                  {sessionData?.nextVisitDate
                    ? new Date(sessionData.nextVisitDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-secondary block mb-2">{t('clinicalNotes')}</span>
              <p className="text-sm text-primary whitespace-pre-line bg-outline/5 p-4 rounded-xl">
                {sessionData?.clinicalNotes || (locale === 'ar' ? 'لا توجد ملاحظات سريرية.' : 'No clinical notes.')}
              </p>
            </div>

            <div>
              <span className="text-xs text-secondary block mb-2">{t('treatmentPlan')}</span>
              <p className="text-sm text-primary whitespace-pre-line bg-outline/5 p-4 rounded-xl">
                {sessionData?.treatmentPlan || (locale === 'ar' ? 'لا توجد خطة علاجية.' : 'No treatment plan.')}
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-surface border border-outline/10 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-teal-600 border-b border-outline/5 pb-2">
              {locale === 'ar' ? 'تفاصيل الدفع والرسوم' : 'Billing & Payment Details'}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-secondary block">{tPayment('fee')}</span>
                <span className="text-lg font-bold text-primary mt-1 block font-mono">
                  {paymentData?.totalAmount || 0} EGP
                </span>
              </div>
              <div>
                <span className="text-xs text-secondary block">{tPayment('paid')}</span>
                <span className="text-lg font-bold text-teal-600 mt-1 block font-mono">
                  {paymentData?.paidAmount || 0} EGP
                </span>
              </div>
              <div>
                <span className="text-xs text-secondary block">{tPayment('remaining')}</span>
                <span className={`text-lg font-bold mt-1 block font-mono ${(paymentData?.totalAmount || 0) - (paymentData?.paidAmount || 0) > 0 ? 'text-rose-500' : 'text-teal-600'}`}>
                  {(paymentData?.totalAmount || 0) - (paymentData?.paidAmount || 0)} EGP
                </span>
              </div>
              <div>
                <span className="text-xs text-secondary block mb-1">{locale === 'ar' ? 'حالة الدفع' : 'Payment Status'}</span>
                {paymentData && <StatusBadge status={paymentData.status} />}
              </div>
            </div>

            {paymentData?.notes && (
              <div>
                <span className="text-xs text-secondary block mb-1">{tPayment('notes')}</span>
                <p className="text-sm text-primary bg-outline/5 p-3 rounded-xl">
                  {paymentData.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
