'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/lib/i18n-navigation'
import { useSession, useSaveSession } from '@/hooks/useSessions'
import { SessionForm } from '@/components/sessions/SessionForm'
import { AnimalAvatar } from '@/components/shared/AnimalAvatar'
import { SpeciesTag } from '@/components/shared/SpeciesTag'
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Modal } from '@/components/shared/Modal'
import { GuardianQRModal } from '@/components/guardian/GuardianQRModal'
import { calculateRemaining } from '@/domain/payment'

export default function SessionDetailPage() {
  const params  = useParams<{ id: string }>()
  const id      = params?.id || ''
  const locale  = useLocale()
  const t       = useTranslations('session')
  const tPayment = useTranslations('payment')
  const tAnimal  = useTranslations('animal')
  const tErrors  = useTranslations('errors')

  const [isEditing, setIsEditing] = useState(false)

  const { data: appointment, isLoading, error, refetch } = useSession(id)
  const saveMutation = useSaveSession(id)

  const [qrToken, setQrToken] = useState<string | null>(null)

  async function handleSubmit(data: any) {
    const result = await saveMutation.mutateAsync(data)
    setIsEditing(false)
    if (result.qrToken) {
      setQrToken(result.qrToken)
    }
    refetch()
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-24 bg-outline-variant/20 rounded-2xl" />
        <div className="h-96 bg-outline-variant/20 rounded-2xl" />
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="p-6 text-center max-w-md mx-auto py-20">
        <p className="text-on-surface-variant">{tErrors('notFound')}</p>
        <Link href="/appointments" className="mt-4 inline-block text-primary font-semibold hover:underline">
          {t('backToSchedule')}
        </Link>
      </div>
    )
  }

  const sessionData = appointment.session
  const paymentData = appointment.payment
  const remaining   = paymentData
    ? calculateRemaining(paymentData.totalAmount, paymentData.paidAmount)
    : 0

  const formatDate = (d: Date | string | null) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString(
      locale === 'ar' ? 'ar-EG' : 'en-US',
      { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">
            {t('sessionDetails')}
          </p>
          <div className="flex items-center gap-3">
            <AnimalAvatar id={appointment.animal.id} species={appointment.animal.species} size={48} />
            <h1 className="text-2xl font-bold text-on-surface">{appointment.animal.name}</h1>
            <SpeciesTag species={appointment.animal.species} />
          </div>
          <p className="text-sm text-on-surface-variant mt-1">{formatDate(appointment.scheduledAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/api/sessions/${id}/pdf?locale=${locale}`} target="_blank" rel="noreferrer">
            <Button variant="secondary" className="text-xs px-4 py-2">
              {t('printReport')}
            </Button>
          </a>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? 'secondary' : 'primary'}
            className="text-xs px-4 py-2"
          >
            {isEditing ? t('cancel') : t('editSession')}
          </Button>
        </div>
      </Card>

      {isEditing ? (
        <SessionForm
          initialData={{
            weight:         sessionData?.weight || undefined,
            chiefComplaint: sessionData?.chiefComplaint || '',
            diagnosis:      sessionData?.diagnosis || '',
            clinicalNotes:  sessionData?.clinicalNotes || '',
            treatmentPlan:  sessionData?.treatmentPlan || '',
            medications:    (sessionData as any)?.medications || [],
            nextVisitDate:  sessionData?.nextVisitDate
              ? new Date(sessionData.nextVisitDate).toISOString()
              : '',
            totalAmount: paymentData?.totalAmount || 0,
            paidAmount:  paymentData?.paidAmount || 0,
            notes:       paymentData?.notes || '',
          }}
          onSubmit={handleSubmit}
          onCancel={() => setIsEditing(false)}
          isLoading={saveMutation.isPending}
        />
      ) : (
        <div className="space-y-6">
          {/* Clinical section */}
          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-on-surface border-b border-outline-variant pb-2">
              {t('clinicalDetails')}
            </h3>

            {/* Weight */}
            {sessionData?.weight && (
              <div>
                <span className="text-xs text-on-surface-variant block mb-1">{t('weight')}</span>
                <span className="text-2xl font-bold text-on-surface font-mono">
                  {sessionData.weight} {tAnimal('kg')}
                </span>
              </div>
            )}

            {/* Chief Complaint */}
            {sessionData?.chiefComplaint && (
              <div>
                <span className="text-xs text-on-surface-variant block mb-1">{t('chiefComplaint')}</span>
                <p className="text-sm text-on-surface bg-surface-container p-3 rounded-xl">
                  {sessionData.chiefComplaint}
                </p>
              </div>
            )}

            {/* Diagnosis */}
            {sessionData?.diagnosis && (
              <div>
                <span className="text-xs text-on-surface-variant block mb-1">{t('diagnosis')}</span>
                <p className="text-sm text-on-surface bg-surface-container p-3 rounded-xl">
                  {sessionData.diagnosis}
                </p>
              </div>
            )}

            {/* Clinical notes */}
            <div>
              <span className="text-xs text-on-surface-variant block mb-1">{t('clinicalNotes')}</span>
              <p className="text-sm text-on-surface whitespace-pre-line bg-surface-container p-4 rounded-xl">
                {sessionData?.clinicalNotes || '—'}
              </p>
            </div>

            {/* Treatment plan */}
            <div>
              <span className="text-xs text-on-surface-variant block mb-1">{t('treatmentPlan')}</span>
              <p className="text-sm text-on-surface whitespace-pre-line bg-surface-container p-4 rounded-xl">
                {sessionData?.treatmentPlan || '—'}
              </p>
            </div>

            {/* Next visit */}
            {sessionData?.nextVisitDate && (
              <div>
                <span className="text-xs text-on-surface-variant block mb-1">{t('nextVisit')}</span>
                <p className="text-sm font-semibold text-primary">
                  {formatDate(sessionData.nextVisitDate)}
                </p>
              </div>
            )}
          </Card>

          {/* Medications */}
          {(sessionData as any)?.medications?.length > 0 && (
            <Card className="space-y-3">
              <h3 className="text-lg font-semibold text-on-surface border-b border-outline-variant pb-2">
                {t('medications')}
              </h3>
              {(sessionData as any).medications.map((med: any, i: number) => (
                <div key={i} className="grid grid-cols-3 gap-3 text-sm pb-3 border-b border-outline-variant last:border-0 last:pb-0">
                  <div>
                    <span className="text-xs text-on-surface-variant block">{t('medicationName')}</span>
                    <span className="font-medium text-on-surface">{med.name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-on-surface-variant block">{t('medicationDosage')}</span>
                    <span className="text-on-surface">{med.dosage}</span>
                  </div>
                  <div>
                    <span className="text-xs text-on-surface-variant block">{t('medicationDuration')}</span>
                    <span className="text-on-surface">{med.duration}</span>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Payment */}
          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-on-surface border-b border-outline-variant pb-2">
              {tPayment('title')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-on-surface-variant block">{tPayment('fee')}</span>
                <span className="text-lg font-bold text-on-surface font-mono mt-1 block">
                  {paymentData?.totalAmount ?? 0} {t('currency')}
                </span>
              </div>
              <div>
                <span className="text-xs text-on-surface-variant block">{tPayment('paid')}</span>
                <span className="text-lg font-bold text-success font-mono mt-1 block">
                  {paymentData?.paidAmount ?? 0} {t('currency')}
                </span>
              </div>
              <div>
                <span className="text-xs text-on-surface-variant block">{tPayment('remaining')}</span>
                <span className={`text-lg font-bold font-mono mt-1 block ${remaining > 0 ? 'text-warning' : 'text-success'}`}>
                  {remaining} {t('currency')}
                </span>
              </div>
              <div>
                <span className="text-xs text-on-surface-variant block mb-1">{tPayment('statusLabel')}</span>
                {paymentData && <PaymentStatusBadge status={paymentData.status} />}
              </div>
            </div>
            {paymentData?.notes && (
              <p className="text-sm text-on-surface-variant bg-surface-container p-3 rounded-xl">
                {paymentData.notes}
              </p>
            )}
          </Card>
        </div>
      )}

      {qrToken && (
        <GuardianQRModal 
          isOpen={!!qrToken} 
          onClose={() => setQrToken(null)} 
          initialToken={qrToken} 
        />
      )}
    </div>
  )
}
