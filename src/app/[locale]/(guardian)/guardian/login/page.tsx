'use client'

import { useEffect, useState } from 'react'
import { PawPrint, Loader2, QrCode } from 'lucide-react'
import { useRouter } from '@/lib/i18n-navigation'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { signIn } from 'next-auth/react'

export default function GuardianLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const t = useTranslations('guardian')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (token) {
      handleTokenLogin(token)
    }
  }, [token])

  const handleTokenLogin = async (qrToken: string) => {
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await signIn('guardian-qr', {
        token: qrToken,
        redirect: false,
      })

      if (res?.error) {
        setErrorMsg('Invalid or expired QR code.')
        toast.error('Invalid or expired QR code.')
      } else {
        toast.success(t('welcome'))
        router.push('/guardian') // Or /portal once routes are restructured
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Verification failed')
      toast.error(error.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 px-4 sm:px-6 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-surface-variant/20 py-10 px-6 shadow-lg rounded-3xl border border-outline-variant/40">
          <div className="flex flex-col gap-8">
            <div className="flex justify-center">
              <div className="bg-primary p-5 rounded-2xl text-on-primary shadow-md">
                <PawPrint size={42} strokeWidth={2.5} />
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-on-surface tracking-tight">
                {t('welcome')}
              </h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                Guardian Access
              </p>
            </div>

            <div className="flex flex-col items-center justify-center text-center gap-4">
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-primary" size={32} />
                  <p className="text-on-surface-variant font-medium">Verifying your QR code...</p>
                </div>
              ) : (
                <>
                  <div className="p-6 bg-surface border border-outline-variant/40 rounded-2xl shadow-sm">
                    <QrCode size={64} className="text-primary/80 mb-2 mx-auto" />
                    <p className="text-on-surface text-sm">
                      Please scan the QR code provided by the clinic using your phone's camera to access your pet's file.
                    </p>
                  </div>
                  {errorMsg && (
                    <p className="text-red-500 text-sm font-semibold mt-2">{errorMsg}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
